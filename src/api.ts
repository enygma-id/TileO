import Fastify from 'fastify';
import Database from 'better-sqlite3';
import { randomUUID, randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rename, rm, open, stat, readdir, readFile } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { pathToFileURL } from 'node:url';
import { appVersion, config, initializeData, root } from './config.js';
import { Jobs } from './jobs.js';
import { checkDisk, freeDisk } from './resources.js';
import { JobError, parseOptions, type Job, type S3InputSource, type UrlInputSource } from './types.js';
import { ZipFile } from 'yazl';
import { addGltfCompanion, model3dPackageInfo, model3dPackageReadme, readGltfCompanion } from './model3d-package.js';
import { capabilities, tileMime, wmtsException } from './wmts.js';
import { inspect } from './inspect.js';
import { sourcePreview } from './source-preview.js';
import { run } from './process.js';
import { isLocalHost, isLocalOrigin } from './network.js';
import { inspectS3Object, inspectUrlObject, publicRemoteUrl, publicStorageConnections, resolveS3Access, s3Fetch, s3GdalInput, urlFetch, urlGdalInput, type SealedCredentialLoader } from './storage.js';
import { issueByocCredentials, sealByocEntry, validateByocTarget } from './storage-auth.js';

function publicJob(job: Job) {
  const { input, ...result } = job;
  if (job.source?.kind === 'url') return { ...result, source: { ...job.source, url: publicRemoteUrl(job.source.url) } };
  // Credential references stay server-side: the worker resolves them from the
  // sealed store. Only non-secret scope (endpoint/bucket) may be exposed.
  if (job.source?.kind === 's3') {
    const { credentialId, credentialOwner, ...source } = job.source;
    return { ...result, source };
  }
  return result;
}
function publicJobWithEta(jobs: Jobs, job: Job) {
  const estimate = job.status === 'RUNNING' ? jobs.estimate(job.id) : undefined;
  return { ...publicJob(job), elapsedMs: estimate?.elapsedMs ?? null, remainingMs: estimate?.remainingMs ?? null };
}
function tokenHash(value: string) { return createHash('sha256').update(value).digest('hex'); }
export async function createApp(jobs = new Jobs()) {
  initializeData();
  if (!['127.0.0.1','localhost','::1'].includes(config.host) && !config.token && !config.localProxy && !config.allowLan) throw new Error('Network binding requires TILEO_API_TOKEN. Docker loopback publishing can explicitly set TILEO_LOCAL_PROXY=1, or for local network (LAN) access set TILEO_ALLOW_LAN=1.');
  if (config.token && config.token.length < 24) throw new Error('TILEO_API_TOKEN must contain at least 24 characters.');
  const app = Fastify({ logger: { redact: ['req.headers.authorization', 'req.headers.cookie'] }, bodyLimit: 16384, requestTimeout: 0 });
  const loginAttempts = new Map<string, { started: number; failures: number; blockedUntil: number }>();
  let loginInFlight = 0;
  const sessionCookie = (req: { headers: { cookie?: string } }) => req.headers.cookie?.match(/(?:^|;\s*)tileo_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  const proxyTrusted = config.localProxy || ['127.0.0.1', 'localhost', '::1'].includes(config.host);
  const firstForwardedValue = (value: string | string[] | undefined) => typeof value === 'string' ? value.split(',')[0]?.trim() : undefined;
  const requestPublicOrigin = (req: { protocol: string; headers: { host?: string; 'x-forwarded-proto'?: string | string[]; 'x-forwarded-host'?: string | string[] } }) => {
    const direct = `${req.protocol}://${req.headers.host ?? ''}`;
    if (!proxyTrusted) return direct;
    const protocol = firstForwardedValue(req.headers['x-forwarded-proto'])?.toLowerCase();
    const host = firstForwardedValue(req.headers['x-forwarded-host']);
    if (!protocol || !host || !['http', 'https'].includes(protocol)) return direct;
    try {
      const forwarded = new URL(`${protocol}://${host}`);
      return forwarded.username || forwarded.password || forwarded.pathname !== '/' || forwarded.search || forwarded.hash
        ? direct : forwarded.origin;
    } catch { return direct; }
  };
  const secureCookie = (req: { protocol: string; headers: { cookie?: string; host?: string; 'x-forwarded-proto'?: string | string[]; 'x-forwarded-host'?: string | string[] } }) => config.secureCookies || config.origin.startsWith('https:') || requestPublicOrigin(req).startsWith('https:');
  jobs.db.prepare('DELETE FROM sessions WHERE expires<? OR auth_fingerprint<>?').run(Date.now(), config.token ? tokenHash(config.token) : '');
  app.addContentTypeParser('application/octet-stream', (_req, payload, done) => done(null, payload));
  let uploads = 0;
  const pendingInspections = new Map<string, { filename: string; path: string; directory: string; size: number; sha256: string; info: Awaited<ReturnType<typeof inspect>>; expires: number }>();
  const pendingStorageInspections = new Map<string, { filename: string; source: S3InputSource | UrlInputSource; info: Awaited<ReturnType<typeof inspect>>; owner: string; expires: number }>();
  const expireInspections = async () => {
    for (const [id, inspection] of pendingInspections) if (inspection.expires <= Date.now()) {
      pendingInspections.delete(id);
      await rm(inspection.directory, { recursive: true, force: true });
    }
    for (const [id, inspection] of pendingStorageInspections) if (inspection.expires <= Date.now()) pendingStorageInspections.delete(id);
  };
  const inspectionCleanup = setInterval(() => { void expireInspections().catch(error => app.log.error(error)); }, 60000);
  inspectionCleanup.unref();
  app.addHook('onClose', async () => {
    clearInterval(inspectionCleanup);
    await Promise.all([...pendingInspections.values()].map(item => rm(item.directory, { recursive: true, force: true })));
    pendingInspections.clear();
    pendingStorageInspections.clear();
  });
  const jobById = (id: string) => { const job = jobs.get(id); if (!job) throw new JobError('NOT_FOUND', 'Job not found.'); return job; };
  // Serve a file with HTTP Range support so browser TIFF readers can stream windows on demand.
  const sendFileRange = async (reply: import('fastify').FastifyReply, file: string, mime: string, range?: string) => {
    const size = (await stat(file)).size;
    reply.type(mime).header('Accept-Ranges', 'bytes');
    if (!range) return reply.header('Content-Length', size).send(createReadStream(file));
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    let start = 0, end = size - 1;
    if (match && (match[1] || match[2])) {
      if (!match[1]) start = Math.max(0, size - Number(match[2]));
      else { start = Number(match[1]); if (match[2]) end = Math.min(size - 1, Number(match[2])); }
    } else start = NaN;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start || (match?.[1] === '' && Number(match[2]) === 0)) return reply.code(416).header('Content-Range', `bytes */${size}`).send();
    return reply.code(206).header('Content-Range', `bytes ${start}-${end}/${size}`).header('Content-Length', end - start + 1).send(createReadStream(file, { start, end }));
  };
  // Metadata-only TIFF inspection for direct streaming: CRS, geotransform and coverage.
  // Never reads pixel data, so it stays fast even for very large files.
  const tiffGeoref = async (path: string, sourceCrs?: string | null, statistics = false, env?: NodeJS.ProcessEnv) => {
    let info: any;
    try { info = JSON.parse(await run('gdalinfo', ['-json', ...(statistics ? ['-approx_stats'] : []), path], { timeoutMs: 60000, capture: true, ...(env ? { env } : {}) })); }
    catch (error) { if (error instanceof JobError && error.code === 'TOOL_FAILED') throw new JobError('UNSUPPORTED_INPUT', 'GDAL could not read this TIFF.'); throw error; }
    if (!info.geoTransform) throw new JobError('MISSING_GEOREFERENCE', 'TIFF has no affine georeference. Georeference it before previewing.');
    let crsWkt = info.coordinateSystem?.wkt as string | undefined;
    if (!crsWkt && sourceCrs) {
      try { crsWkt = await run('gdalsrsinfo', ['-o', 'wkt', sourceCrs], { timeoutMs: 30000, capture: true, ...(env ? { env } : {}) }); }
      catch { crsWkt = undefined; }
    }
    if (!crsWkt) throw new JobError('MISSING_CRS', 'TIFF has no CRS. Convert it with an explicit Source CRS first.');
    const coordinates = info.wgs84Extent?.coordinates?.[0] as number[][] | undefined;
    if (!coordinates?.length) throw new JobError('MISSING_EXTENT', 'Could not determine TIFF coverage from its embedded CRS.');
    const bounds = [Math.min(...coordinates.map(c => c[0]!)), Math.min(...coordinates.map(c => c[1]!)), Math.max(...coordinates.map(c => c[0]!)), Math.max(...coordinates.map(c => c[1]!))];
    const midLatitude = (bounds[1]! + bounds[3]!) / 2 * Math.PI / 180;
    const resolution = Math.min(Math.abs(bounds[2]! - bounds[0]!) * Math.PI / 180 * 6378137 * Math.cos(midLatitude) / info.size[0], Math.abs(bounds[3]! - bounds[1]!) * Math.PI / 180 * 6378137 / info.size[1]);
    const nativeZoom = resolution > 0 && Number.isFinite(resolution) ? Math.max(0, Math.min(22, Math.ceil(Math.log2(156543.03392 / resolution)))) : 18;
    return {
      crsWkt,
      geoTransform: info.geoTransform,
      width: info.size[0],
      height: info.size[1],
      bands: (info.bands ?? []).map((b: any) => ({ type: b.type, noData: b.noDataValue ?? null, colorInterpretation: b.colorInterpretation, scale: b.scale ?? 1, offset: b.offset ?? 0, unit: b.unit ?? '', minimum: b.minimum, maximum: b.maximum })),
      bounds,
      nativeZoom,
    };
  };
  app.addHook('onRequest', async (req, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff').header('Referrer-Policy', 'same-origin').header('X-Frame-Options', 'DENY');
    reply.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' data: blob: https:; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    const origin = req.headers.origin;
    // Browsers send Origin for module scripts and fonts, but often omit it for
    // HTML/CSS. Public static assets must load even when the configured public
    // origin differs from the local address (for example a Docker mapped port).
    // Keep origin validation for API requests and the host check for every route.
    const publicAsset = ['GET', 'HEAD'].includes(req.method) &&
      (Object.hasOwn(files, req.routeOptions.url ?? '') || req.routeOptions.url === '/webfonts/:file');
    const allowedOrigin = origin && (
      origin === requestPublicOrigin(req) || origin === config.origin ||
      config.corsOrigins.includes(origin) || (config.allowLan && isLocalOrigin(origin))
    );
    if (origin && !publicAsset && !allowedOrigin) return reply.code(403).send({ error: { code: 'FORBIDDEN', message: 'Origin is not allowed. Configure TILEO_ALLOW_LAN or TILEO_CORS_ORIGINS.' } });
    // Retain the host check even when serving public assets or a CORS preflight.
    const isPrivateOrLocal = ['localhost', '127.0.0.1', '[::1]'].includes(req.hostname) ||
      (config.allowLan && isLocalHost(req.hostname));
    if (!config.token && !isPrivateOrLocal) return reply.code(403).send({ error: { code: 'FORBIDDEN', message: 'Use localhost or enable TILEO_ALLOW_LAN to access the local console.' } });
    if (allowedOrigin) {
      reply.header('Access-Control-Allow-Origin', origin).header('Vary', 'Origin')
        .header('Access-Control-Allow-Credentials', 'true')
        .header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Range, Accept-Ranges');
      if (req.method === 'OPTIONS' && req.headers['access-control-request-method']) {
        const methods = ['GET', 'HEAD', 'POST', 'DELETE', 'OPTIONS'];
        const headers = ['authorization', 'content-type', 'range', 'accept'];
        const requested = String(req.headers['access-control-request-headers'] ?? '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
        if (!methods.includes(String(req.headers['access-control-request-method'])) || requested.some(header => !headers.includes(header))) {
          return reply.code(403).send({ error: { code: 'FORBIDDEN', message: 'CORS method or headers are not supported.' } });
        }
        return reply.header('Access-Control-Allow-Methods', methods.join(', '))
          .header('Access-Control-Allow-Headers', headers.join(', '))
          .header('Access-Control-Max-Age', '600').code(204).send();
      }
    }
    if (req.url.startsWith('/api/') && req.routeOptions.url !== '/api/session') {
      reply.header('Cache-Control', 'no-store');
      if (config.token) {
        const bearer = /^Bearer\s+(.+)$/i.exec(req.headers.authorization ?? '')?.[1] ?? '';
        const cookie = sessionCookie(req);
        const validToken = timingSafeEqual(Buffer.from(tokenHash(bearer)), Buffer.from(tokenHash(config.token)));
        const validSession = cookie && jobs.db.prepare('SELECT 1 FROM sessions WHERE token=? AND expires>? AND auth_fingerprint=?').get(tokenHash(cookie), Date.now(), tokenHash(config.token));
        if (!validToken && !validSession) return reply.code(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in with your access token.' } });
      }
    }
  });
  app.setErrorHandler((error, _req, reply) => {
    const e = error as Error & { code?: string; statusCode?: number };
    const code = error instanceof JobError ? error.code : 'REQUEST_FAILED';
    const status = code === 'NOT_FOUND' ? 404 : code === 'PRODUCTION_READ_ONLY' ? 403 : ['QUEUE_FULL', 'UPLOAD_BUSY', 'PREVIEW_BUSY'].includes(code) ? 429 : code === 'DISK_FULL' ? 507 : code === 'UPLOAD_LIMIT' ? 413 : e.statusCode ?? (error instanceof JobError ? 400 : 500);
    app.log.error(error);
    reply.code(status).send({ error: { code, message: status >= 500 && !(error instanceof JobError) ? 'The server could not complete this request. Check the server log.' : e.message } });
  });
  app.options('/api/*', async (_req, reply) => reply.code(204).send());
  app.get('/healthz', async () => ({ status: 'ok' }));
  app.get('/favicon.ico', async (_req, reply) => reply.type('image/svg+xml').send(createReadStream(join(root, 'web/assets/tileo-logo.svg'))));
  app.get('/openapi.yaml', async (_req, reply) => reply.type('application/yaml; charset=utf-8').send(createReadStream(join(root, 'openapi.yaml'))));
  app.get('/api/status', async () => {
    const runtime = jobs.runtime();
    return {
      version: appVersion,
      workerOnline: !!runtime && Date.now() - runtime.heartbeat < 30000,
      tools: runtime?.tools ? JSON.parse(runtime.tools) : {},
      freeBytes: await freeDisk(),
      maxUploadBytes: config.uploadBytes,
      activeUploads: uploads,
      basemapUrl: config.basemapUrl,
      basemapAttribution: config.basemapAttribution,
      basemapApiKey: config.mapApiKey,
      authenticationRequired: !!config.token,
      productionReadOnly: config.production,
      repositoryUrl: config.repositoryUrl,
    };
  });
  app.post('/api/session', async (req, reply) => {
    reply.header('Cache-Control', 'no-store');
    if (!config.token) return { ok: true, authentication: false };
    const now = Date.now(), key = req.ip;
    if (loginAttempts.size > 1000) for (const [address, value] of loginAttempts) if (now - value.started >= 60000 && value.blockedUntil <= now) loginAttempts.delete(address);
    let attempt = loginAttempts.get(key);
    if (!attempt || now - attempt.started >= 60000) { attempt = { started: now, failures: 0, blockedUntil: 0 }; loginAttempts.set(key, attempt); }
    if (attempt.blockedUntil > now || loginInFlight >= 4) return reply.header('Retry-After', String(Math.max(1, Math.ceil(((attempt.blockedUntil || now + 1000) - now) / 1000)))).code(429).send({ error: { code: 'AUTH_RATE_LIMIT', message: 'Too many sign-in attempts. Try again later.' } });
    const supplied = (req.body as { token?: string })?.token;
    if (config.token && (typeof supplied !== 'string' || !timingSafeEqual(Buffer.from(tokenHash(supplied)), Buffer.from(tokenHash(config.token))))) {
      attempt.failures++;
      if (attempt.failures >= 5) attempt.blockedUntil = now + 60000;
      loginInFlight++;
      try { await new Promise(r => setTimeout(r, 500)); }
      finally { loginInFlight--; }
      return reply.code(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Invalid access token.' } });
    }
    loginAttempts.delete(key);
    const token = randomBytes(32).toString('hex');
    jobs.db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
    jobs.db.prepare('INSERT INTO sessions(token,expires,auth_fingerprint) VALUES(?,?,?)').run(tokenHash(token), Date.now() + 12 * 3600000, tokenHash(config.token));
    reply.header('Set-Cookie', `tileo_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secureCookie(req) ? '; Secure' : ''}`);
    return { ok: true };
  });
  app.post('/api/session/logout', async (req, reply) => {
    const token = sessionCookie(req);
    if (token) jobs.db.prepare('DELETE FROM sessions WHERE token=?').run(tokenHash(token));
    reply.header('Cache-Control', 'no-store').header('Set-Cookie', `tileo_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureCookie(req) ? '; Secure' : ''}`);
    return { ok: true };
  });
  app.get('/api/jobs', async () => jobs.list().map(job => publicJobWithEta(jobs, job)));
  app.get<{ Params: { id: string } }>('/api/jobs/:id', async req => publicJobWithEta(jobs, jobById(req.params.id)));
  app.get('/api/storage/connections', async () => publicStorageConnections());
  app.get('/api/storage/iam-info', async () => {
    const accountId = process.env.TILEO_AWS_ACCOUNT_ID?.trim() || '';
    const externalId = process.env.TILEO_AWS_EXTERNAL_ID?.trim() || 'tileo-s3-access';
    return {
      enabled: Boolean(accountId),
      accountId: accountId || null,
      externalId: accountId ? externalId : null,
    };
  });
  // Session binding for BYOC credentials. The hash (never the token) is stored
  // alongside sealed credentials so one signed-in session cannot spend
  // another session's bucket keys. Without TILEO_API_TOKEN every local request
  // shares the single-user owner ''.
  const ownerHash = (req: { headers: { authorization?: string; cookie?: string } }) => {
    const bearer = /^Bearer\s+(.+)$/i.exec(req.headers.authorization ?? '')?.[1] ?? '';
    const cookie = req.headers.cookie?.match(/(?:^|;\s*)tileo_session=([a-f0-9]{64})(?:;|$)/)?.[1] ?? '';
    const secret = bearer || cookie;
    return secret ? tokenHash(secret) : '';
  };
  const sealedLoader: SealedCredentialLoader = id => jobs.getStorageCredential(id) ?? null;
  app.post('/api/storage/credentials', async (req, reply) => {
    if (config.production) throw new JobError('PRODUCTION_READ_ONLY', 'Storage credentials are disabled on the hosted production instance.');
    const body = req.body as {
      connectionId?: unknown;
      endpoint?: unknown;
      region?: unknown;
      bucket?: unknown;
      prefix?: unknown;
      accessKeyId?: unknown;
      secretAccessKey?: unknown;
      sessionToken?: unknown;
      roleArn?: unknown;
      externalId?: unknown;
      ttlSeconds?: unknown;
    } | null;
    if (!body || typeof body !== 'object') throw new JobError('INVALID_INPUT', 'Send connectionId, endpoint/bucket plus accessKeyId/secretAccessKey, or roleArn as JSON.');
    const owner = ownerHash(req);
    if (body.roleArn) {
      if (!process.env.TILEO_AWS_ACCOUNT_ID?.trim()) {
        throw new JobError('FEATURE_DISABLED', 'AWS IAM role integration is not configured on this TileO server (TILEO_AWS_ACCOUNT_ID is not set).');
      }
      const roleArn = String(body.roleArn).trim();
      const region = String(body.region || 'us-east-1').trim();
      const bucket = String(body.bucket ?? '').trim();
      const prefix = body.prefix === undefined || body.prefix === '' ? '' : String(body.prefix).trim();
      const externalId = body.externalId === undefined || body.externalId === '' ? (process.env.TILEO_AWS_EXTERNAL_ID || 'tileo-s3-access') : String(body.externalId).trim();
      const endpoint = `https://s3.${region}.amazonaws.com`;
      const target = await validateByocTarget({ endpoint, region, bucket, prefix });
      const issued = issueByocCredentials({
        target,
        roleArn,
        ...(externalId ? { externalId } : {}),
        ownerHash: owner,
        ...(body.ttlSeconds !== undefined ? { ttlSeconds: body.ttlSeconds } : {}),
        persistent: true,
      });
      const sealed = sealByocEntry({
        target,
        connectionId: 'iam',
        roleArn,
        ...(externalId ? { externalId } : {}),
      });
      jobs.saveStorageCredential({
        id: issued.credentialId,
        connectionId: 'iam',
        endpoint: target.endpoint,
        region: target.region,
        bucket: target.bucket,
        prefix: target.prefix ?? '',
        iv: sealed.iv,
        tag: sealed.tag,
        data: sealed.data,
        owner,
        expires: Date.now() + issued.expiresInSeconds * 1000,
      });
      reply.code(201);
      return { credentialId: issued.credentialId, expiresInSeconds: issued.expiresInSeconds };
    }
    // Two BYOC shapes: keys for an admin-defined byoc connection, or a full
    // user-supplied target (endpoint + bucket + keys) for S3-compatible
    // providers such as R2, Spaces, MinIO, or Supabase.
    let connectionId = '';
    const target = body.endpoint || body.region || (body.bucket && !body.connectionId)
      ? await validateByocTarget({ endpoint: body.endpoint, region: body.region, bucket: body.bucket, prefix: body.prefix })
      : undefined;
    let region = target?.region ?? '';
    if (!target) {
      connectionId = String(body.connectionId ?? '');
      const connection = publicStorageConnections().find(item => item.id === connectionId);
      if (!connection) throw new JobError('STORAGE_CONNECTION_NOT_FOUND', 'Storage connection is unavailable. Ask the administrator to configure it.');
      if (connection.auth !== 'byoc') throw new JobError('INVALID_INPUT', 'This connection does not accept user-supplied credentials. Use a connection with byoc authentication or provide your own endpoint.');
      region = '';
    }
    const issued = issueByocCredentials({
      ...(connectionId ? { connectionId } : {}), ...(target ? { target } : {}),
      accessKeyId: body.accessKeyId, secretAccessKey: body.secretAccessKey,
      ...(body.sessionToken !== undefined ? { sessionToken: body.sessionToken } : {}),
      ownerHash: owner, ...(body.ttlSeconds !== undefined ? { ttlSeconds: body.ttlSeconds } : {}),
      // Every issued credential is sealed into the database below, so the
      // recurring-sync TTL range (up to 90 days) applies.
      persistent: true,
    });
    const sealed = sealByocEntry({
      ...(connectionId ? { connectionId } : {}), ...(target ? { target } : {}),
      accessKeyId: String(body.accessKeyId), secretAccessKey: String(body.secretAccessKey),
      ...(typeof body.sessionToken === 'string' && body.sessionToken ? { sessionToken: body.sessionToken } : {}),
    });
    jobs.saveStorageCredential({
      id: issued.credentialId, connectionId, endpoint: target?.endpoint ?? '', region,
      bucket: target?.bucket ?? '', prefix: target?.prefix ?? '',
      iv: sealed.iv, tag: sealed.tag, data: sealed.data,
      owner, expires: Date.now() + issued.expiresInSeconds * 1000,
    });
    reply.code(201);
    return { credentialId: issued.credentialId, expiresInSeconds: issued.expiresInSeconds };
  });
  app.get('/api/storage/credentials', async req => ({ credentials: jobs.listStorageCredentials(ownerHash(req)) }));
  app.delete<{ Params: { id: string } }>('/api/storage/credentials/:id', async req => {
    jobs.deleteStorageCredential(req.params.id, ownerHash(req));
    return { deleted: true };
  });
  app.post('/api/storage/inspect', async (req, reply) => {
    if (config.production) throw new JobError('PRODUCTION_READ_ONLY', 'Storage inspection is disabled on the hosted production instance.');
    const body = req.body as { url?: unknown; connectionId?: unknown; credentialId?: unknown; endpoint?: unknown; region?: unknown; bucket?: unknown; prefix?: unknown; key?: unknown; versionId?: unknown; readMode?: unknown } | null;
    if (!body || typeof body !== 'object') throw new JobError('INVALID_INPUT', 'Send a storage source descriptor as JSON.');
    const readMode = body.readMode === undefined ? 'auto' : body.readMode;
    if (!['auto', 'remote', 'stage'].includes(String(readMode))) throw new JobError('INVALID_INPUT', 'readMode must be auto, remote, or stage.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new JobError('TIMEOUT', 'Remote inspection exceeded its deadline.')), config.remoteInspectSeconds * 1000);
    try {
      const owner = ownerHash(req);
      const credentialId = body.credentialId === undefined || body.credentialId === '' ? undefined : String(body.credentialId);
      // A credentialId alone is enough: the sealed row carries the scope
      // (admin connection or BYOC endpoint target) it was issued for.
      let connectionId = body.connectionId === undefined || body.connectionId === '' ? undefined : String(body.connectionId);
      let credentialTarget: { endpoint: string; region: string; bucket: string; prefix?: string } | undefined;
      let bucket = String(body.bucket ?? '');
      if (credentialId) {
        const row = sealedLoader(credentialId);
        if (!row || row.expiresAt <= Date.now()) throw new JobError('STORAGE_CREDENTIALS_EXPIRED', 'The supplied storage credentials expired or were revoked. Register new credentials and inspect the object again.');
        if (row.ownerHash !== owner) throw new JobError('STORAGE_CREDENTIALS_MISSING', 'These credentials belong to another session. Register your own bucket credentials first.');
        if (row.endpoint) {
          credentialTarget = { endpoint: row.endpoint, region: row.region, bucket: row.bucket, ...(row.prefix ? { prefix: row.prefix } : {}) };
          bucket = row.bucket;
        } else {
          connectionId = row.connectionId;
        }
      } else if (body.endpoint || body.region || (body.bucket && !body.connectionId)) {
        credentialTarget = await validateByocTarget({ endpoint: body.endpoint, region: body.region, bucket: body.bucket, prefix: body.prefix });
        bucket = credentialTarget.bucket;
      }
      const remote = body.url
        ? await inspectUrlObject({ url: String(body.url), readMode: readMode as 'auto' | 'remote' | 'stage' }, controller.signal)
        : await inspectS3Object({
          ...(connectionId ? { connectionId } : {}),
          ...(credentialId ? { credentialId, ownerHash: owner } : {}),
          ...(credentialTarget ? { credentialTarget } : {}),
          bucket, key: String(body.key ?? ''),
          ...(body.versionId ? { versionId: String(body.versionId) } : {}), readMode: readMode as 'auto' | 'remote' | 'stage' },
          sealedLoader, controller.signal);
      if (!remote.source.rangeSupported) throw new JobError('STORAGE_RANGE_UNSUPPORTED', 'S3 inspection requires byte-range support. Download the object locally or use a compatible endpoint.');
      const resolved = remote.source.kind === 'url' ? urlGdalInput(remote.source) : await s3GdalInput({ ...remote.source, readMode: 'remote', versionId: undefined }, sealedLoader);
      const info = await inspect(resolved.input, parseOptions({}), { signal: controller.signal, env: resolved.env, capture: true, timeoutMs: config.remoteInspectSeconds * 1000, deadlineMs: Date.now() + config.remoteInspectSeconds * 1000, memoryBytes: 256 * 1024 ** 2, remoteProbe: true, ...(resolved.redactions ? { redactions: resolved.redactions } : {}) }, true);
      if (info.kind !== 'raster') throw new JobError('UNSUPPORTED_REMOTE_INPUT', 'Remote input accepts raster GeoTIFF files only.');
      if (remote.source.readMode === 'remote' && !info.cog) {
        if (readMode === 'auto') {
          remote.source.readMode = 'stage';
        } else {
          throw new JobError('REMOTE_COG_REQUIRED', 'Direct remote reading requires a Cloud Optimized GeoTIFF (COG). Use the Stage read strategy for standard GeoTIFFs, or convert this TIFF to COG.');
        }
      }
      if (remote.source.readMode === 'stage' && remote.source.size > Math.min(config.remoteStageBytes, config.scratchBytes)) {
        throw new JobError('REMOTE_STAGE_LIMIT', 'The object exceeds the configured remote staging or per-job scratch limit.');
      }
      remote.source.cog = !!info.cog;
      if (remote.source.kind === 's3' && remote.source.versionId) remote.source.readMode = 'stage';
      const id = randomUUID(), expires = Date.now() + 30 * 60000;
      pendingStorageInspections.set(id, { filename: remote.filename, source: remote.source, info, owner, expires });
      return { inspectionId: id, inspection: info, source: remote.source.kind === 'url'
        ? { kind: 'url', url: publicRemoteUrl(remote.source.url), auth: remote.source.auth, size: remote.source.size, etag: remote.source.etag, readMode: remote.source.readMode, rangeSupported: true, cog: remote.source.cog }
        : { kind: 's3', connectionId: remote.source.connectionId, bucket: remote.source.bucket, key: remote.source.key, versionId: remote.source.versionId, size: remote.source.size, etag: remote.source.etag, readMode: remote.source.readMode, rangeSupported: remote.source.rangeSupported, cog: remote.source.cog }, expiresInSeconds: 1800 };
    } finally { clearTimeout(timer); }
  });
  app.post('/api/jobs/from-source', async (req, reply) => {
    if (config.production) throw new JobError('PRODUCTION_READ_ONLY', 'Creating tile jobs is disabled on the hosted production instance.');
    const body = req.body as { inspectionId?: unknown; options?: unknown } | null;
    const inspectionId = String(body?.inspectionId ?? ''), pending = pendingStorageInspections.get(inspectionId);
    if (!pending || pending.expires <= Date.now()) throw new JobError('INSPECTION_EXPIRED', 'Storage inspection expired. Inspect the object again.');
    // Credential-bound inspections can only be spent by the session that
    // created them; otherwise one session could enqueue jobs on another
    // session's bucket keys.
    if (pending.source.kind === 's3' && (pending.source.credentialId || pending.source.credentialTarget) && pending.owner !== ownerHash(req)) {
      throw new JobError('STORAGE_CREDENTIALS_MISSING', 'This inspection uses credentials bound to another session. Inspect the object again with your own credentials.');
    }
    let options;
    try { options = parseOptions(body?.options ?? {}); } catch (error) { if (error instanceof JobError) throw error; throw new JobError('INVALID_OPTIONS', 'Options must be valid.'); }
    if (options.pipeline === 'elevation' && !pending.info.elevationCandidate) throw new JobError('UNSUPPORTED_ELEVATION', 'Elevation requires a single-band numeric COG.');
    if (options.pipeline === 'scientific' && !pending.info.elevationCandidate) throw new JobError('UNSUPPORTED_SCIENTIFIC_RASTER', 'Scientific raster requires a single-band numeric COG.');
    if (pending.info.elevationCandidate && !options.rasterPurpose) throw new JobError('RASTER_PURPOSE_REQUIRED', 'Choose imagery, elevation, or scientific raster.');
    if (options.pipeline !== 'elevation' && options.pipeline !== 'scientific' && pending.info.elevationCandidate && pending.info.dataType !== 'Byte') throw new JobError('NUMERIC_RASTER_PURPOSE_REQUIRED', 'Choose Scientific raster to preserve numeric values, or Elevation only when values represent heights.');
    const id = randomUUID();
    const job = jobs.enqueue({ id, filename: pending.filename, input: '', options, size: pending.source.size, sha256: '', source: pending.source });
    pendingStorageInspections.delete(inspectionId);
    reply.code(202); return publicJobWithEta(jobs, job);
  });
  app.delete<{ Params: { id: string } }>('/api/storage/inspect/:id', async req => ({ deleted: pendingStorageInspections.delete(req.params.id) }));
  app.post<{ Querystring: { filename?: string } }>('/api/inspect', { bodyLimit: config.uploadBytes }, async (req, reply) => {
    if (config.production) throw new JobError('PRODUCTION_READ_ONLY', 'Dataset upload and inspection are disabled on the hosted production instance. Clone the repository and run TileO locally.');
    if (uploads) throw new JobError('UPLOAD_BUSY', 'Another upload is in progress. Please try again shortly.');
    const filename = req.query.filename;
    if (!filename || filename.length > 200 || /[\\/\x00-\x1f]/.test(filename)) throw new JobError('INVALID_INPUT', 'Invalid filename.');
    const extension = extname(filename).toLowerCase();
    const allowed = ['.tif','.tiff','.geojson','.json','.geojsonl','.gpkg','.fgb','.zip','.png','.jpg','.jpeg','.webp','.jp2','.img','.vrt','.kml'];
    if (!allowed.includes(extension)) throw new JobError('INVALID_INPUT', 'This file type does not need server-side inspection.');
    if (!(req.body instanceof Readable)) throw new JobError('INVALID_INPUT', 'Send the file as application/octet-stream.');
    const length = Number(req.headers['content-length'] ?? 0);
    if (length > config.uploadBytes) throw new JobError('UPLOAD_LIMIT', 'The file exceeds the upload limit.');
    uploads++;
    const id = randomUUID(), directory = join(config.data, 'scratch', `inspect-${id}`), path = join(directory, `source${extension}`);
    let size = 0, nextDiskCheck = 0, retained = false;
    const hash = createHash('sha256');
    const controller = new AbortController();
    req.raw.once('aborted', () => controller.abort(new JobError('INSPECTION_CANCELLED', 'File inspection was cancelled.')));
    req.raw.setTimeout(120000, () => req.raw.destroy(new Error('Upload stalled.')));
    const meter = new Transform({ transform(chunk: Buffer, _encoding, callback) {
      size += chunk.length; hash.update(chunk);
      if (size > config.uploadBytes) { callback(new JobError('UPLOAD_LIMIT', 'The upload exceeds the configured size limit.')); return; }
      if (size >= nextDiskCheck) { nextDiskCheck = size + 64 * 1024 ** 2; checkDisk().then(() => callback(null, chunk), callback); }
      else callback(null, chunk);
    } });
    try {
      await checkDisk(length);
      await mkdir(directory, { recursive: true });
      await pipeline(req.body, meter, createWriteStream(path, { flags: 'wx' }));
      if (!size || (length && size !== length)) throw new JobError('INVALID_INPUT', 'The upload was empty or incomplete.');
      const input = extension === '.zip' ? `/vsizip/${path.replaceAll('\\', '/')}` : path;
      const info = await inspect(input, parseOptions({}), { signal: controller.signal, log: join(directory, 'inspect.log'), timeoutMs: config.timeout * 1000, deadlineMs: Date.now() + config.timeout * 1000 }, true);
      const digest = hash.digest('hex');
      pendingInspections.set(id, { filename, path, directory, size, sha256: digest, info, expires: Date.now() + 30 * 60000 });
      retained = true;
      reply.code(200); return { inspectionId: id, inspection: info, expiresInSeconds: 1800 };
    } finally {
      uploads--; req.raw.setTimeout(0);
      if (!retained) await rm(directory, { recursive: true, force: true });
    }
  });
  app.delete<{ Params: { id: string } }>('/api/inspect/:id', async req => {
    const inspection = pendingInspections.get(req.params.id);
    if (inspection) {
      pendingInspections.delete(req.params.id);
      await rm(inspection.directory, { recursive: true, force: true });
    }
    return { deleted: !!inspection };
  });
  app.post<{ Querystring: { filename: string; options?: string; inspectionId?: string } }>('/api/jobs', { bodyLimit: config.uploadBytes }, async (req, reply) => {
    if (config.production) throw new JobError('PRODUCTION_READ_ONLY', 'Creating tile jobs is disabled on the hosted production instance. Clone the repository and run TileO locally.');
    if (req.query.inspectionId) {
      const pending = pendingInspections.get(req.query.inspectionId);
      if (!pending || pending.expires <= Date.now()) throw new JobError('INSPECTION_EXPIRED', 'File inspection expired. Select the file again to inspect it.');
      if (req.query.filename && req.query.filename !== pending.filename) throw new JobError('INVALID_INPUT', 'The inspected filename does not match.');
      let options;
      try { options = parseOptions(JSON.parse(req.query.options ?? '{}')); } catch (e) { if (e instanceof JobError) throw e; throw new JobError('INVALID_OPTIONS', 'Options must be valid JSON.'); }
      // A single GeoJSON layer can be named after the staging file; auto-select it after the upload is renamed.
      if (pending.info.kind === 'vector' && pending.info.layers?.length === 1 && options.layer === pending.info.layer) options.layer = null;
      if (options.pipeline === 'elevation' && !pending.info.elevationCandidate) throw new JobError('UNSUPPORTED_ELEVATION', 'Elevation requires a single-band numeric GeoTIFF.');
      if (options.pipeline === 'scientific' && !pending.info.elevationCandidate) throw new JobError('UNSUPPORTED_SCIENTIFIC_RASTER', 'Scientific raster requires a single-band numeric GeoTIFF.');
      if (pending.info.elevationCandidate && !options.rasterPurpose) throw new JobError('RASTER_PURPOSE_REQUIRED', 'Choose whether this single-band numeric raster is imagery, elevation, or a scientific raster.');
      if (options.pipeline !== 'elevation' && options.pipeline !== 'scientific' && pending.info.elevationCandidate && pending.info.dataType !== 'Byte') throw new JobError('NUMERIC_RASTER_PURPOSE_REQUIRED', 'Choose Scientific raster to preserve numeric values, or Elevation only when values represent heights.');
      const id = randomUUID(), input = `${id}${extname(pending.filename).toLowerCase()}`, final = join(config.data, 'input', input);
      await rename(pending.path, final);
      try {
        const job = jobs.enqueue({ id, filename: pending.filename, input, options, size: pending.size, sha256: pending.sha256 });
        pendingInspections.delete(req.query.inspectionId);
        await rm(pending.directory, { recursive: true, force: true });
        reply.code(202); return publicJobWithEta(jobs, job);
      } catch (error) { await rename(final, pending.path); throw error; }
    }
    if (uploads) throw new JobError('UPLOAD_BUSY', 'Another upload is in progress. Please try again shortly.');
    const filename = req.query.filename;
    if (!filename || filename.length > 200 || /[\\/\x00-\x1f]/.test(filename)) throw new JobError('INVALID_INPUT', 'Invalid filename.');
    const extension = extname(filename).toLowerCase();
    const allowed = ['.tif','.tiff','.geojson','.json','.geojsonl','.gpkg','.fgb','.zip','.png','.jpg','.jpeg','.webp','.jp2','.img','.vrt','.kml','.mbtiles','.pmtiles','.glb'];
    if (!allowed.includes(extension)) throw new JobError('INVALID_INPUT', 'Supported inputs: GeoTIFF, GeoJSON, GeoPackage, FlatGeobuf, Shapefile (.zip), MBTiles, PMTiles, GLB, or other geospatial rasters/vectors.');
    if (!(req.body instanceof Readable)) throw new JobError('INVALID_INPUT', 'Send the file as application/octet-stream.');
    let options;
    try { options = parseOptions(JSON.parse(req.query.options ?? '{}'), extension === '.glb'); } catch (e) { if (e instanceof JobError) throw e; throw new JobError('INVALID_OPTIONS', 'Options must be valid JSON.'); }
    const length = Number(req.headers['content-length'] ?? 0);
    if (length > config.uploadBytes) throw new JobError('UPLOAD_LIMIT', 'The file exceeds the upload limit.');
    uploads++;
    const id = randomUUID(), input = `${id}${extension}`, temp = join(config.data, 'input', `.upload-${id}`), final = join(config.data, 'input', input);
    let size = 0, nextDiskCheck = 0, enqueued = false;
    const hash = createHash('sha256');
    req.raw.setTimeout(120000, () => req.raw.destroy(new Error('Upload stalled.')));
    const meter = new Transform({ transform(chunk: Buffer, _encoding, callback) {
      size += chunk.length; hash.update(chunk);
      if (size > config.uploadBytes) { callback(new JobError('UPLOAD_LIMIT', 'The upload exceeds the configured size limit.')); return; }
      if (size >= nextDiskCheck) { nextDiskCheck = size + 64 * 1024 ** 2; checkDisk().then(() => callback(null, chunk), callback); }
      else callback(null, chunk);
    } });
    try {
      await checkDisk(length);
      await pipeline(req.body, meter, createWriteStream(temp, { flags: 'wx' }));
      if (!size || (length && size !== length)) throw new JobError('INVALID_INPUT', 'The upload was empty or incomplete.');
      const handle = await open(temp, 'r+'); try { await handle.sync(); } finally { await handle.close(); }
      await rename(temp, final);
      const job = jobs.enqueue({ id, filename, input, options, size, sha256: hash.digest('hex') }); enqueued = true;
      reply.code(202); return publicJobWithEta(jobs, job);
    } finally {
      uploads--; req.raw.setTimeout(0);
      await rm(temp, { force: true }); if (!enqueued) await rm(final, { force: true });
    }
  });
  for (const action of ['cancel','retry'] as const) app.post<{ Params: { id: string } }>(`/api/jobs/:id/${action}`, async req => {
    if (action === 'retry' && config.production) throw new JobError('PRODUCTION_READ_ONLY', 'Retrying tile jobs is disabled on the hosted production instance. Clone the repository and run TileO locally.');
    jobById(req.params.id); jobs[action](req.params.id); return publicJobWithEta(jobs, jobById(req.params.id));
  });
  app.delete<{ Params: { id: string } }>('/api/jobs/:id', async req => {
    const job = jobById(req.params.id);
    if (['QUEUED', 'RUNNING'].includes(job.status)) throw new JobError('INVALID_STATE', 'Running or queued jobs cannot be deleted.');
    const outputDir = join(config.data, 'output', job.output ?? `${job.id}-${job.attempt}`);
    evictTileDbPrefix(outputDir);
    await Promise.all([
      ...(job.source && job.source.kind !== 'local' ? [] : [rm(join(config.data, 'input', job.input), { force: true })]),
      rm(job.output ? join(config.data, 'output', job.output) : join(config.data, 'output', `${job.id}-${job.attempt}${job.input.endsWith('.glb') ? '-3dtiles' : job.options.pipeline === 'elevation' ? '-elevation' : job.options.pipeline === 'scientific' ? '-scientific' : job.options.exportPmtiles ? '-tiles' : '.mbtiles'}`), { recursive: job.input.endsWith('.glb') || job.options.pipeline === 'elevation' || job.options.pipeline === 'scientific' || !!job.options.exportPmtiles, force: true }),
      rm(join(config.data, 'logs', `${job.id}-${job.attempt}.log`), { force: true }),
      rm(join(config.data, 'scratch', `${job.id}-${job.attempt}`), { recursive: true, force: true }),
    ]);
    jobs.remove(job.id);
    return { deleted: true, id: job.id };
  });
  app.get<{ Params: { id: string } }>('/api/jobs/:id/log', async (req, reply) => {
    const job = jobById(req.params.id), path = join(config.data, 'logs', `${job.id}-${job.attempt}.log`);
    try { await stat(path); } catch { return reply.type('text/plain').send('No process log is available yet.'); }
    return reply.type('text/plain; charset=utf-8').send(createReadStream(path));
  });
  app.get<{ Params: { id: string } }>('/api/jobs/:id/compare', async req => {
    const { job } = artifact(req.params.id);
    const source = job.metadata?.source ?? null;
    const result = job.metadata;
    return {
      filename: job.filename,
      source: source ? {
        kind: (source as any).kind,
        crs: (source as any).crs,
        width: (source as any).width,
        height: (source as any).height,
        bands: (source as any).bands,
        dataType: (source as any).dataType,
        bounds: (source as any).bounds,
        noData: (source as any).noData,
        unit: (source as any).unit,
        scale: (source as any).scale,
        offset: (source as any).offset,
        featureCount: (source as any).featureCount,
      } : null,
      output: {
        kind: result?.kind,
        format: result?.format,
        bounds: result?.bounds,
        minZoom: result?.minZoom ?? job.options.minZoom,
        maxZoom: result?.maxZoom ?? job.options.maxZoom,
        tileCount: result?.tileCount,
        cogBytes: result?.cogBytes,
        encoding: result?.encoding,
        elevationKind: result?.elevationKind,
        elevationUnit: result?.elevationUnit,
        heightReference: result?.heightReference,
      },
    };
  });
  const artifact = (id: string) => { const job = jobById(id); if (job.status !== 'SUCCEEDED' || !job.output) throw new JobError('INVALID_STATE', 'The job has no completed artifact.'); return { job, path: join(config.data, 'output', job.output) }; };
  let comparing = 0;
  app.get<{ Params: { id: string }; Querystring: { bbox?: string } }>('/api/jobs/:id/source-preview', async (req, reply) => {
    const { job } = artifact(req.params.id);
    if (job.source && job.source.kind !== 'local') throw new JobError('REMOTE_SOURCE_PREVIEW_UNAVAILABLE', 'Visual source comparison for remote inputs is not available yet. The converted result remains previewable.');
    if (comparing >= 2) throw new JobError('PREVIEW_BUSY', 'Another source preview is being prepared. Try again shortly.');
    const controller = new AbortController();
    const stop = () => { if (!reply.raw.writableFinished) controller.abort(new Error('Source preview closed.')); };
    reply.raw.once('close', stop); comparing++;
    try { const preview = await sourcePreview(job, controller.signal, req.query.bbox); return reply.type(preview.mime).send(preview.data); }
    finally { comparing--; reply.raw.removeListener('close', stop); }
  });
  app.get<{ Params: { id: string } }>('/api/jobs/:id/source-tileset.json', async req => {
    const { job, path } = artifact(req.params.id);
    if (!job.input.endsWith('.glb')) throw new JobError('NOT_FOUND', 'This job has no GLB source.');
    const result = JSON.parse(await readFile(join(path, 'tileset.json'), 'utf8'));
    return { asset: { version: '1.1' }, geometricError: 0, root: { boundingVolume: result.root.boundingVolume, transform: result.root.transform, geometricError: 0, content: { uri: 'source' } } };
  });
  app.get<{ Params: { id: string }; Querystring: { file?: string; name?: string } }>('/api/jobs/:id/download', async (req, reply) => {
    const { job, path } = artifact(req.params.id);
    const sourceBase = job.filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._ -]+/g, '-').replace(/^[. ]+|[. ]+$/g, '') || 'tileo-result';
    const disposition = (fallback: string) => {
      const requested = req.query.name?.trim();
      const safe = requested?.replace(/[^a-zA-Z0-9._ -]+/g, '-').replace(/^[. ]+|[. ]+$/g, '').slice(0, 180);
      return `attachment; filename="${safe || fallback}"`;
    };
    if (job.input.endsWith('.glb')) {
      if (req.query.file === 'glb') {
        const source = join(config.data, 'input', job.input);
        return reply.type('model/gltf-binary').header('Content-Disposition', disposition(`${sourceBase}.glb`)).header('Content-Length', (await stat(source)).size).send(createReadStream(source));
      }
      if (req.query.file === 'gltf') {
        const source = join(config.data, 'input', job.input);
        const companion = await readGltfCompanion(source);
        const zip = new ZipFile();
        addGltfCompanion(zip, source, companion);
        zip.end();
        return reply.type('application/zip').header('Content-Disposition', disposition(`${sourceBase}-gltf.zip`)).send(zip.outputStream);
      }
      if (req.query.file === 'b3dm') {
        const legacy = join(path, 'legacy-b3dm');
        try { if (!(await stat(legacy)).isDirectory()) throw new Error('missing'); }
        catch { throw new JobError('NOT_FOUND', 'This job predates B3DM output. Recreate it to generate the compatibility package.'); }
        const zip = new ZipFile();
        const addLegacyDirectory = async (directory: string) => {
          for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
            const file = join(directory, entry.name);
            if (entry.isDirectory()) await addLegacyDirectory(file);
            else zip.addFile(file, relative(legacy, file).replaceAll('\\', '/'), { compress: !entry.name.endsWith('.b3dm') });
          }
        };
        await addLegacyDirectory(legacy);
        zip.addBuffer(Buffer.from('# TileO B3DM compatibility package\n\nOpen `tileset.json` in a viewer that requires 3D Tiles 1.0 B3DM content. Each B3DM embeds the generated GLB and preserves its glTF extensions. The modern 3D Tiles 1.1 package remains the recommended output.\n'), 'README.md');
        zip.end();
        return reply.type('application/zip').header('Content-Disposition', disposition(`${sourceBase}-b3dm.zip`)).send(zip.outputStream);
      }
      if (req.query.file && req.query.file !== 'zip') throw new JobError('NOT_FOUND', 'Unknown 3D download format.');
    }
    if (req.query.file === 'pmtiles' && job.options.exportPmtiles) {
      const file = join(path, job.options.pipeline === 'elevation' ? 'terrain.pmtiles' : 'tiles.pmtiles');
      return reply.type('application/octet-stream').header('Content-Disposition', disposition(`${sourceBase}.pmtiles`)).header('Content-Length', (await stat(file)).size).send(createReadStream(file));
    }
    if (job.options.pipeline === 'elevation' && (job.options.elevationOutput === 'cog' || req.query.file)) {
      const selected = req.query.file ?? 'cog';
      if (!['cog', 'terrain'].includes(selected) || (selected === 'terrain' && !['terrain-rgb', 'terrarium'].includes(job.options.elevationOutput!))) throw new JobError('NOT_FOUND', 'Elevation artifact not found.');
      const name = selected === 'cog' ? 'elevation.tif' : 'terrain.mbtiles';
      const file = join(path, name);
      return reply.type(selected === 'cog' ? 'image/tiff' : 'application/octet-stream').header('Content-Disposition', disposition(`${sourceBase}-${name}`)).header('Content-Length', (await stat(file)).size).send(createReadStream(file));
    }
    if (job.options.pipeline === 'scientific') {
      const file = join(path, 'scientific.tif');
      return reply.type('image/tiff').header('Content-Disposition', disposition(`${sourceBase}-scientific.tif`)).header('Content-Length', (await stat(file)).size).send(createReadStream(file));
    }
    if (job.input.endsWith('.glb') || job.options.pipeline === 'elevation' || job.options.pipeline === 'scientific' || job.options.exportPmtiles) {
      const zip = new ZipFile();
      if (job.input.endsWith('.glb')) {
        const source = join(config.data, 'input', job.input);
        const companion = await readGltfCompanion(source);
        zip.addFile(source, 'models/original.glb', { compress: false });
        addGltfCompanion(zip, source, companion, 'models/');
        zip.addBuffer(Buffer.from(`${JSON.stringify(model3dPackageInfo(job), null, 2)}\n`), 'manifest.json');
        zip.addBuffer(Buffer.from(model3dPackageReadme), 'README.md');
      }
      const addDirectory = async (directory: string) => {
        for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
          const file = join(directory, entry.name);
          if (relative(path, file).replaceAll('\\', '/') === 'legacy-b3dm') continue;
          if (entry.isDirectory()) await addDirectory(file);
          else zip.addFile(file, relative(path, file).replaceAll('\\', '/'), { compress: !/\.(glb|b3dm|bin|tif|mbtiles|pmtiles)$/.test(entry.name) });
        }
      };
      await addDirectory(path);
      zip.end();
      return reply.type('application/zip').header('Content-Disposition', disposition(`${sourceBase}-${job.options.pipeline === 'elevation' ? 'elevation' : job.input.endsWith('.glb') ? '3dtiles' : 'tiles'}.zip`)).send(zip.outputStream);
    }
    return reply.type('application/octet-stream').header('Content-Disposition', disposition(`${sourceBase}.mbtiles`)).header('Content-Length', (await stat(path)).size).send(createReadStream(path));
  });
  app.get<{ Params: { id: string } }>('/api/jobs/:id/source', async (req, reply) => {
    const { job } = artifact(req.params.id);
    const isTiff = /\.tiff?$/i.test(job.filename);
    if (job.options.pipeline !== 'elevation' && job.options.pipeline !== 'scientific' && !job.input.endsWith('.glb') && !isTiff) throw new JobError('NOT_FOUND', 'Use source-preview for imagery and vector sources.');
    if (job.source?.kind === 's3') {
      // Sources resolve with the owner recorded at inspect time, matching
      // job visibility (jobs are shared between signed-in sessions).
      const access = await resolveS3Access({
        connectionId: job.source.connectionId,
        ...(job.source.credentialId ? { credentialId: job.source.credentialId } : {}),
        ...(job.source.credentialTarget ? { credentialTarget: job.source.credentialTarget } : {}),
        ...(job.source.credentialOwner ? { ownerHash: job.source.credentialOwner } : {}),
      }, sealedLoader);
      const response = await s3Fetch(access, job.source.bucket, job.source.key, { method: 'GET', versionId: job.source.versionId, range: req.headers.range, etag: job.source.etag });
      reply.type('image/tiff').header('Accept-Ranges', response.headers.get('accept-ranges') ?? 'bytes');
      for (const name of ['content-length', 'content-range', 'etag', 'last-modified']) { const value = response.headers.get(name); if (value) reply.header(name, value); }
      if (response.status === 206) reply.code(206);
      if (!response.body) throw new JobError('STORAGE_REQUEST_FAILED', 'S3 returned an empty source response.');
      return reply.send(Readable.fromWeb(response.body as any));
    }
    if (job.source?.kind === 'url') {
      const response = await urlFetch(job.source, { range: req.headers.range, etag: job.source.etag });
      reply.type('image/tiff').header('Accept-Ranges', 'bytes');
      for (const name of ['content-length', 'content-range', 'etag', 'last-modified']) { const value = response.headers.get(name); if (value) reply.header(name, value); }
      if (response.status === 206) reply.code(206);
      if (!response.body) throw new JobError('STORAGE_REQUEST_FAILED', 'The remote URL returned an empty source response.');
      return reply.send(Readable.fromWeb(response.body as any));
    }
    return sendFileRange(reply, join(config.data, 'input', job.input), job.input.endsWith('.glb') ? 'model/gltf-binary' : 'image/tiff', req.headers.range);
  });
  // Georeferencing metadata for streaming the original TIFF (compare view and Quick Open).
  const georefCache = new Map<string, unknown>();
  app.get<{ Params: { id: string } }>('/api/jobs/:id/source-georef', async req => {
    const { job } = artifact(req.params.id);
    if (!/\.tiff?$/i.test(job.filename)) throw new JobError('NOT_FOUND', 'Only TIFF sources expose georeferencing metadata.');
    const cached = georefCache.get(job.id);
    if (cached) return cached;
    if (georefCache.size > 500) georefCache.clear();
    if (job.source?.kind === 's3' && job.source.versionId) throw new JobError('REMOTE_SOURCE_PREVIEW_UNAVAILABLE', 'Georeferenced source streaming is unavailable for version-pinned S3 objects.');
    const resolved = job.source?.kind === 's3'
      ? await s3GdalInput(job.source, sealedLoader)
      : job.source?.kind === 'url' ? urlGdalInput(job.source) : { input: join(config.data, 'input', job.input), env: undefined, redactions: undefined };
    const info = await tiffGeoref(resolved.input, job.options.sourceCrs, false, resolved.env);
    georefCache.set(job.id, info);
    return info;
  });
  app.get<{ Params: { id: string } }>('/api/jobs/:id/cog', async (req, reply) => {
    const { job, path } = artifact(req.params.id);
    if (job.options.pipeline !== 'elevation' && job.options.pipeline !== 'scientific') throw new JobError('NOT_FOUND', 'This job has no COG.');
    return sendFileRange(reply, join(path, job.options.pipeline === 'scientific' ? 'scientific.tif' : 'elevation.tif'), 'image/tiff', req.headers.range);
  });
  app.get<{ Params: { id: string } }>('/api/jobs/:id/tilejson', async req => {
    const { job } = artifact(req.params.id);
    if (!['terrain-rgb', 'terrarium'].includes(job.options.elevationOutput!)) throw new JobError('NOT_FOUND', 'This job has no terrain tiles.');
    return { tilejson: '3.0.0', name: job.filename, scheme: 'xyz', encoding: job.options.elevationOutput === 'terrarium' ? 'terrarium' : 'mapbox', tileSize: 256, minzoom: job.options.minZoom, maxzoom: job.options.maxZoom, bounds: job.metadata?.bounds, tiles: [`${config.origin || `${req.protocol}://${req.headers.host}`}/api/jobs/${job.id}/tiles/{z}/{x}/{y}`], height_reference: job.options.heightReference, nodata_display_height: job.options.terrainNoDataHeight };
  });
  app.get<{ Params: { id: string; '*': string } }>('/api/jobs/:id/3d/*', async (req, reply) => {
    const { job, path } = artifact(req.params.id);
    const name = req.params['*'];
    if (!job.input.endsWith('.glb') || !/^(?:tileset\.json|model\.glb|tiles\/[a-z0-9-]+\.glb)$/.test(name)) throw new JobError('NOT_FOUND', '3D Tiles file not found.');
    const file = join(path, name);
    try { return reply.type(name.endsWith('.glb') ? 'model/gltf-binary' : 'application/json').header('Content-Length', (await stat(file)).size).send(createReadStream(file)); }
    catch { throw new JobError('NOT_FOUND', '3D Tiles file not found.'); }
  });
  // Reused read-only MBTiles handles: opening SQLite per tile costs ~ms and
  // file descriptors, so keep a small LRU of handles keyed by archive path.
  const tileDbCache = new Map<string, InstanceType<typeof Database>>();
  const TILE_DB_CACHE_MAX = 20;
  const openTileDb = (dbPath: string) => {
    const cached = tileDbCache.get(dbPath);
    if (cached) { tileDbCache.delete(dbPath); tileDbCache.set(dbPath, cached); return cached; }
    let db: InstanceType<typeof Database>;
    try { db = new Database(dbPath, { readonly: true, fileMustExist: true }); }
    catch { throw new JobError('NOT_FOUND', 'Tile archive not found.'); }
    tileDbCache.set(dbPath, db);
    if (tileDbCache.size > TILE_DB_CACHE_MAX) {
      const oldest = tileDbCache.keys().next().value as string | undefined;
      if (oldest !== undefined) { try { tileDbCache.get(oldest)?.close(); } catch { /* eviction is best-effort */ } tileDbCache.delete(oldest); }
    }
    return db;
  };
  const evictTileDbPrefix = (prefix: string) => {
    for (const key of [...tileDbCache.keys()]) {
      if (key === prefix || key.startsWith(prefix)) { try { tileDbCache.get(key)?.close(); } catch { /* ignore */ } tileDbCache.delete(key); }
    }
  };
  const tileDbPath = (job: Job, outputPath: string) => job.options.pipeline === 'elevation' ? join(outputPath, 'terrain.mbtiles') : job.options.exportPmtiles ? join(outputPath, 'tiles.mbtiles') : outputPath;
  const tileMimeForFormat = (job: Job, format?: string) => {
    const effective = job.options.pipeline === 'elevation' || format === 'png' ? 'image/png' : format === 'pbf' ? 'application/vnd.mapbox-vector-tile' : format === 'webp' ? 'image/webp' : null;
    return effective ?? tileMime(job);
  };
  // Prefer the archive's own metadata.format over job metadata so legacy jobs
  // without metadata.format still serve the correct MIME type.
  const resolveTileFormat = (job: Job, db: InstanceType<typeof Database>): string | undefined => {
    if (typeof job.metadata?.format === 'string' && job.metadata.format) return job.metadata.format;
    try {
      const row = db.prepare("SELECT value AS value FROM metadata WHERE name='format'").get() as { value: string } | undefined;
      return typeof row?.value === 'string' && row.value ? row.value : undefined;
    } catch { return undefined; }
  };
  const tileEtag = (scope: string, data: Buffer) => `"${createHash('sha1').update(scope).update(data).digest('hex').slice(0, 27)}"`;
  const sendTile = async (id: string, coords: string[], reply: import('fastify').FastifyReply) => {
    const { path, job } = artifact(id);
    if (job.input.endsWith('.glb')) throw new JobError('NOT_FOUND', 'This job contains 3D Tiles.');
    if ((job.options.pipeline === 'elevation' && !['terrain-rgb', 'terrarium'].includes(job.options.elevationOutput!)) || job.options.pipeline === 'scientific') throw new JobError('NOT_FOUND', 'This COG job has no PNG tiles.');
    if (coords.some(s => !/^\d+$/.test(s))) throw new JobError('INVALID_INPUT', 'Invalid tile coordinates.');
    const [z, x, y] = coords.map(Number) as [number, number, number];
    if (!Number.isSafeInteger(z) || !Number.isSafeInteger(x) || !Number.isSafeInteger(y) || z > 22 || x >= 2 ** z || y >= 2 ** z) throw new JobError('INVALID_INPUT', 'Invalid tile coordinates.');
    const dbPath = tileDbPath(job, path);
    const db = openTileDb(dbPath);
    let tile: { data: Buffer } | undefined;
    try {
      tile = db.prepare('SELECT tile_data AS data FROM tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?').get(z, x, 2 ** z - 1 - y) as { data: Buffer } | undefined;
    } catch {
      evictTileDbPrefix(dbPath);
      throw new JobError('NOT_FOUND', 'Tile archive is unavailable.');
    }
    if (!tile) return reply.code(204).header('Cache-Control', 'private, max-age=3600').send();
    const format = resolveTileFormat(job, db);
    const etag = tileEtag(`${job.id}:${job.attempt}:${z}/${x}/${y}`, tile.data);
    if (reply.request.headers['if-none-match'] === etag) return reply.code(304).send();
    reply.type(tileMimeForFormat(job, format));
    reply.header('Cache-Control', 'private, max-age=86400, immutable').header('ETag', etag);
    if (format === 'pbf' && tile.data[0] === 0x1f && tile.data[1] === 0x8b) reply.header('Content-Encoding', 'gzip');
    return reply.send(tile.data);
  };
  app.get<{ Params: { id: string; z: string; x: string; y: string } }>('/api/jobs/:id/tiles/:z/:x/:y', async (req, reply) => sendTile(req.params.id, [req.params.z, req.params.x, req.params.y], reply));
  app.get<{ Params: { id: string }; Querystring: Record<string, string> }>('/api/jobs/:id/wmts', async (req, reply) => {
    const { job, path } = artifact(req.params.id);
    const q = Object.fromEntries(Object.entries(req.query).map(([key, value]) => [key.toUpperCase(), value]));
    const fail = (message: string, code?: string) => reply.code(400).type('application/xml').send(wmtsException(message, code));
    if (job.input.endsWith('.glb') || job.options.pipeline === 'scientific' || (job.options.pipeline === 'elevation' && !['terrain-rgb', 'terrarium'].includes(job.options.elevationOutput!))) return fail('This job has no WMTS tiles.');
    if (q.SERVICE?.toUpperCase() !== 'WMTS' || (q.VERSION && q.VERSION !== '1.0.0')) return fail('Use SERVICE=WMTS and VERSION=1.0.0.');
    if (q.REQUEST?.toLowerCase() === 'getcapabilities') return reply.type('application/xml').send(capabilities(job, `${config.origin || `${req.protocol}://${req.headers.host}`}/api/jobs/${job.id}/wmts`));
    if (q.REQUEST?.toLowerCase() !== 'gettile') return fail('Supported requests: GetCapabilities, GetTile.', 'OperationNotSupported');
    if (q.LAYER !== job.id || q.STYLE !== 'default' || q.TILEMATRIXSET !== 'WebMercatorQuad') return fail('Invalid layer, style or matrix set.');
    try {
      const expected = tileMimeForFormat(job, resolveTileFormat(job, openTileDb(tileDbPath(job, path))));
      if (q.FORMAT !== expected) return fail('Invalid layer, style, matrix set or format.');
    } catch { /* fall through to sendTile, which reports archive errors */ }
    const coords = [q.TILEMATRIX, q.TILECOL, q.TILEROW];
    if (coords.some(v => v === undefined || !/^\d+$/.test(v)) || Number(q.TILEMATRIX) < job.options.minZoom || Number(q.TILEMATRIX) > job.options.maxZoom || Number(q.TILECOL) >= 2 ** Number(q.TILEMATRIX) || Number(q.TILEROW) >= 2 ** Number(q.TILEMATRIX)) return fail('Invalid tile coordinates.');
    return sendTile(job.id, coords as string[], reply);
  });
  // Small in-memory basemap cache: upstream OSM tiles are immutable per z/x/y.
  const basemapCache = new Map<string, { data: Buffer; expires: number }>();
  const basemapInflight = new Map<string, Promise<{ status: number; data?: Buffer }>>();
  const BASEMAP_CACHE_MAX = 500;
  app.get<{ Params: { z: string; x: string; y: string } }>('/api/basemap/osm/:z/:x/:y.png', async (req, reply) => {
    const { z, x, y } = req.params;
    if (!/^\d+$/.test(z) || !/^\d+$/.test(x) || !/^\d+$/.test(y)) return reply.code(400).send();
    const zi = Number(z), xi = Number(x), yi = Number(y);
    if (!Number.isSafeInteger(zi) || !Number.isSafeInteger(xi) || !Number.isSafeInteger(yi) || zi > 22 || xi >= 2 ** zi || yi >= 2 ** zi) return reply.code(400).send();
    const key = `${zi}/${xi}/${yi}`;
    const cached = basemapCache.get(key);
    if (cached && cached.expires > Date.now()) {
      basemapCache.delete(key); basemapCache.set(key, cached);
      if (reply.request.headers['if-none-match'] === tileEtag('osm', cached.data)) return reply.code(304).send();
      return reply.type('image/png').header('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800').header('ETag', tileEtag('osm', cached.data)).send(cached.data);
    } else if (cached) basemapCache.delete(key);
    try {
      let pending = basemapInflight.get(key);
      if (!pending) {
        pending = (async () => {
          const upstream = await fetch(`https://tile.openstreetmap.org/${zi}/${xi}/${yi}.png`, {
            headers: { 'User-Agent': 'TileO-Geospatial-Console/1.0 (contact: admin@tileo.local)' },
            signal: AbortSignal.timeout(10000),
          });
          if (!upstream.ok) return { status: upstream.status };
          return { status: 200, data: Buffer.from(await upstream.arrayBuffer()) };
        })();
        basemapInflight.set(key, pending);
        pending.then(() => { basemapInflight.delete(key); }, () => { basemapInflight.delete(key); });
      }
      const result = await pending;
      if (result.status !== 200 || !result.data) return reply.code(result.status).send();
      basemapCache.set(key, { data: result.data, expires: Date.now() + 86400_000 });
      if (basemapCache.size > BASEMAP_CACHE_MAX) basemapCache.delete(basemapCache.keys().next().value!);
      if (reply.request.headers['if-none-match'] === tileEtag('osm', result.data)) return reply.code(304).send();
      return reply.type('image/png').header('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800').header('ETag', tileEtag('osm', result.data)).send(result.data);
    } catch {
      return reply.code(502).send();
    }
  });
  const quickLifetimeMs = 30 * 60_000;
  const QUICK_ABSOLUTE_MS = 2 * 3600_000;
  const QUICK_MAX_ENTRIES = 20;
  const QUICK_MAX_TILE_COUNT = 5_000_000;
  const quickMbtiles = new Map<string, { db: InstanceType<typeof Database>; path: string; format: string; kind: 'raster' | 'vector'; bounds?: number[]; minZoom: number; maxZoom: number; vectorLayers: { id: string }[]; createdAt: number; expires: number }>();
  const quickTiffs = new Map<string, { path: string; filename: string; createdAt: number; expires: number }>();
  const removeQuick = async (id: string) => {
    const mbtiles = quickMbtiles.get(id);
    if (mbtiles) { quickMbtiles.delete(id); try { mbtiles.db.close(); } catch { /* best-effort */ } await rm(mbtiles.path, { force: true }); return true; }
    const tiff = quickTiffs.get(id);
    if (tiff) { quickTiffs.delete(id); await rm(tiff.path, { force: true }); return true; }
    return false;
  };
  // Sliding refresh capped by an absolute lifetime so abandoned previews die
  // even under continuous polling. Returns false when the entry has expired.
  const touchQuick = (item: { createdAt: number; expires: number }) => {
    const now = Date.now();
    if (now > item.createdAt + QUICK_ABSOLUTE_MS || item.expires <= now) return false;
    item.expires = now + quickLifetimeMs;
    return true;
  };
  const evictOldestQuick = (map: Map<string, unknown>) => {
    if (map.size < QUICK_MAX_ENTRIES) return;
    const oldest = map.keys().next().value as string | undefined;
    if (oldest !== undefined) void removeQuick(oldest);
  };
  // Bounded streaming upload: enforces the global upload limit and disk
  // reserve incrementally instead of trusting Content-Length alone.
  const pipeLimitedUpload = async (source: Readable, targetPath: string) => {
    let size = 0, nextDiskCheck = 0;
    const meter = new Transform({ transform(chunk: Buffer, _encoding, callback) {
      size += chunk.length;
      if (size > config.uploadBytes) { callback(new JobError('UPLOAD_LIMIT', 'The file exceeds the upload limit.')); return; }
      if (size >= nextDiskCheck) { nextDiskCheck = size + 64 * 1024 ** 2; checkDisk().then(() => callback(null, chunk), callback); }
      else callback(null, chunk);
    } });
    await pipeline(source, meter, createWriteStream(targetPath));
    if (!size) throw new JobError('INVALID_INPUT', 'The upload was empty.');
    return size;
  };
  const expireQuick = async () => {
    const now = Date.now();
    await Promise.all([...quickMbtiles.entries(), ...quickTiffs.entries()]
      .filter(([, item]) => item.expires <= now || now > item.createdAt + QUICK_ABSOLUTE_MS)
      .map(([id]) => removeQuick(id)));
  };
  const quickCleanup = setInterval(() => { void expireQuick().catch(error => app.log.error(error)); }, 60_000);
  quickCleanup.unref();
  app.post<{ Querystring: { filename?: string } }>('/api/quick/mbtiles', { bodyLimit: config.uploadBytes }, async (req, reply) => {
    const filename = req.query.filename || 'uploaded.mbtiles';
    if (filename.length > 200 || /[\\/\x00-\x1f]/.test(filename)) throw new JobError('INVALID_INPUT', 'Invalid filename.');
    if (!(req.body instanceof Readable) && !(req.raw instanceof Readable)) throw new JobError('INVALID_INPUT', 'Send the file as application/octet-stream.');
    const length = Number(req.headers['content-length'] ?? 0);
    if (length > config.uploadBytes) throw new JobError('UPLOAD_LIMIT', 'The file exceeds the upload limit.');
    const id = randomUUID();
    const targetPath = join(config.data, 'scratch', `quick-${id}.mbtiles`);
    const source = (req.body instanceof Readable ? req.body : req.raw) as Readable;
    await checkDisk(length);
    try { await pipeLimitedUpload(source, targetPath); }
    catch (error) { await rm(targetPath, { force: true }); throw error; }
    try {
      let db: InstanceType<typeof Database> | undefined;
      let stored = false;
      try {
        db = new Database(targetPath, { readonly: true });
      const metadata = Object.fromEntries(
        (db.prepare('SELECT name, value FROM metadata').all() as { name: string; value: string }[])
          .map(r => [r.name, r.value])
      );
      const counts = db.prepare('SELECT min(zoom_level) AS minZoom, max(zoom_level) AS maxZoom, count(*) AS tileCount FROM tiles').get() as { minZoom: number; maxZoom: number; tileCount: number };
      const format = String(metadata.format || 'webp');
      const kind = format === 'pbf' ? 'vector' : 'raster';
      let bounds = metadata.bounds ? metadata.bounds.split(',').map(Number) : undefined;
      if (!counts.tileCount || counts.tileCount > QUICK_MAX_TILE_COUNT || !Number.isInteger(counts.minZoom) || !Number.isInteger(counts.maxZoom) || counts.minZoom < 0 || counts.maxZoom > 22 || counts.minZoom > counts.maxZoom) throw new JobError('INVALID_MBTILES', 'MBTiles has no valid zoom range.');
      if (bounds && (bounds.length !== 4 || !bounds.every(Number.isFinite) || bounds[0]! >= bounds[2]! || bounds[1]! >= bounds[3]! || bounds[0]! < -180 || bounds[2]! > 180 || bounds[1]! < -85.05112878 || bounds[3]! > 85.05112878)) throw new JobError('INVALID_MBTILES', 'MBTiles bounds are invalid or outside Web Mercator.');
      if (!bounds) {
        const extent = db.prepare('SELECT min(tile_column) minX,max(tile_column) maxX,min(tile_row) minY,max(tile_row) maxY FROM tiles WHERE zoom_level=?').get(counts.minZoom) as { minX: number; maxX: number; minY: number; maxY: number };
        const n = 2 ** counts.minZoom, latitude = (y: number) => Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;
        bounds = [extent.minX / n * 360 - 180, latitude(n - extent.minY), (extent.maxX + 1) / n * 360 - 180, latitude(n - 1 - extent.maxY)];
      }
      let vectorLayers: { id: string }[] = [];
      if (kind === 'vector') {
        try { vectorLayers = JSON.parse(metadata.json ?? '{}').vector_layers ?? [{ id: 'features' }]; }
        catch { throw new JobError('INVALID_MBTILES', 'MBTiles vector metadata is corrupt.'); }
      }
      evictOldestQuick(quickMbtiles);
      const now = Date.now();
      quickMbtiles.set(id, { db, path: targetPath, format, kind, bounds, minZoom: counts.minZoom, maxZoom: counts.maxZoom, vectorLayers, createdAt: now, expires: now + quickLifetimeMs });
      stored = true;
      return {
        id,
        filename,
        kind,
        format,
        bounds,
        minZoom: counts.minZoom,
        maxZoom: counts.maxZoom,
        vectorLayers,
        tileCount: counts.tileCount, expiresInSeconds: quickLifetimeMs / 1000,
      };
      } finally {
        if (!stored) try { db?.close(); } catch { /* best-effort */ }
      }
    } catch (err: any) {
      await rm(targetPath, { force: true });
      if (err instanceof JobError) throw err;
      throw new JobError('INVALID_MBTILES', `Failed to open MBTiles: ${err?.message || err}`);
    }
  });
  app.get<{ Params: { id: string; z: string; x: string; y: string } }>('/api/quick/:id/tiles/:z/:x/:y', async (req, reply) => {
    const item = quickMbtiles.get(req.params.id);
    if (!item) return reply.code(404).send();
    if (!touchQuick(item)) { await removeQuick(req.params.id); return reply.code(404).send(); }
    if ([req.params.z, req.params.x, req.params.y].some(s => !/^\d+$/.test(s))) return reply.code(400).send();
    const [z, x, y] = [Number(req.params.z), Number(req.params.x), Number(req.params.y)];
    if (!Number.isSafeInteger(z) || !Number.isSafeInteger(x) || !Number.isSafeInteger(y) || z > 22 || x >= 2 ** z || y >= 2 ** z) return reply.code(400).send();
    const tile = item.db.prepare('SELECT tile_data AS data FROM tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?').get(z, x, 2 ** z - 1 - y) as { data: Buffer } | undefined;
    if (!tile) return reply.code(204).header('Cache-Control', 'private, max-age=3600').send();
    if (reply.request.headers['if-none-match'] === tileEtag(item.path, tile.data)) return reply.code(304).send();
    reply.type(item.format === 'pbf' ? 'application/vnd.mapbox-vector-tile' : item.format === 'webp' ? 'image/webp' : item.format === 'png' ? 'image/png' : 'image/jpeg');
    reply.header('Cache-Control', 'private, max-age=86400, immutable').header('ETag', tileEtag(item.path, tile.data));
    if (item.format === 'pbf' && tile.data[0] === 0x1f && tile.data[1] === 0x8b) reply.header('Content-Encoding', 'gzip');
    return reply.send(tile.data);
  });
  // Quick Open for GeoTIFF: the original file is streamed on demand with HTTP Range,
  // so even very large imagery can be inspected without tiling it first.
  app.post<{ Querystring: { filename?: string; mode?: string } }>('/api/quick/tiff', { bodyLimit: config.uploadBytes }, async (req, reply) => {
    const filename = req.query.filename || 'uploaded.tif';
    const mode = req.query.mode ?? 'auto';
    if (!['auto', 'imagery', 'scientific', 'dem', 'dsm', 'dtm'].includes(mode)) throw new JobError('INVALID_INPUT', 'TIFF mode must be auto, imagery, scientific, dem, dsm or dtm.');
    if (!/\.tiff?$/i.test(filename)) throw new JobError('INVALID_INPUT', 'Quick Open expects a .tif or .tiff file.');
    if (!(req.body instanceof Readable)) throw new JobError('INVALID_INPUT', 'Send the file as application/octet-stream.');
    const length = Number(req.headers['content-length'] ?? 0);
    if (length > config.uploadBytes) throw new JobError('UPLOAD_LIMIT', 'The file exceeds the upload limit.');
    const id = randomUUID(), targetPath = join(config.data, 'scratch', `quick-${id}.tif`);
    await checkDisk(length);
    try { await pipeLimitedUpload(req.raw, targetPath); }
    catch (error) { await rm(targetPath, { force: true }); throw error; }
    try {
      let meta = await tiffGeoref(targetPath, null);
      const numeric = ['Byte', 'Int16', 'UInt16', 'Int32', 'UInt32', 'Float32', 'Float64'];
      const candidate = meta.bands.length === 1 && numeric.includes(meta.bands[0]?.type) && meta.bands[0]?.colorInterpretation !== 'Palette';
      const elevation = ['dem', 'dsm', 'dtm'].includes(mode);
      const scientific = mode === 'scientific' || (mode === 'auto' && candidate && meta.bands[0]?.type !== 'Byte');
      let display: { mode: string; kind: string; minimum: number; maximum: number; unit: string } | undefined;
      if (elevation || scientific) {
        if (!candidate) throw new JobError('UNSUPPORTED_ELEVATION', 'DEM / DSM / DTM preview requires a single numeric band without a palette.');
        meta = await tiffGeoref(targetPath, null, true);
        const band = meta.bands[0]!;
        if (![band.minimum, band.maximum, band.scale, band.offset].every(Number.isFinite)) throw new JobError('INVALID_ELEVATION', 'Could not determine a valid elevation range. Check NoData and band metadata.');
        const low = band.minimum * band.scale + band.offset, high = band.maximum * band.scale + band.offset;
        if (![low, high].every(Number.isFinite)) throw new JobError('INVALID_ELEVATION', 'Scaled elevation range is not finite.');
        display = { mode: elevation ? 'elevation' : 'scientific', kind: mode === 'auto' ? 'scientific' : mode, minimum: Math.min(low, high), maximum: Math.max(low, high), unit: band.unit };
      } else if (!meta.bands.every((band: { type: string }) => ['Byte', 'UInt16'].includes(band.type)) || ![1, 2, 3, 4].includes(meta.bands.length)) {
        throw new JobError('UNSUPPORTED_RASTER', 'Use DEM / DSM / DTM mode for single-band numeric elevation data. Imagery supports Byte and UInt16 grayscale, RGB and RGBA TIFFs.');
      }
      evictOldestQuick(quickTiffs);
      const createdAt = Date.now();
      quickTiffs.set(id, { path: targetPath, filename, createdAt, expires: createdAt + quickLifetimeMs });
      return { id, filename, kind: elevation ? 'elevation' : scientific ? 'scientific' : 'raster', format: 'tiff', expiresInSeconds: quickLifetimeMs / 1000, ...meta, ...(display ? { display } : {}) };
    } catch (error) { await rm(targetPath, { force: true }); throw error; }
  });
  app.get<{ Params: { id: string } }>('/api/quick/:id/file', async (req, reply) => {
    const item = quickTiffs.get(req.params.id);
    if (!item) return reply.code(404).send();
    if (!touchQuick(item)) { await removeQuick(req.params.id); return reply.code(404).send(); }
    return sendFileRange(reply, item.path, 'image/tiff', req.headers.range);
  });
  app.delete<{ Params: { id: string } }>('/api/quick/:id', async req => ({ deleted: await removeQuick(req.params.id) }));
  const files: Record<string, [string,string]> = {
    '/': [join(root, 'web/index.html'), 'text/html; charset=utf-8'],
    '/landing': [join(root, 'web/landing.html'), 'text/html; charset=utf-8'],
    '/landing-config.js': [join(root, 'web/landing-config.js'), 'text/javascript; charset=utf-8'],
    '/landing-map.js': [join(root, 'web/landing-map.js'), 'text/javascript'],
    '/docs': [join(root, 'web/docs.html'), 'text/html; charset=utf-8'],
    '/api-guide': [join(root, 'API.md'), 'text/markdown; charset=utf-8'],
    '/docs.css': [join(root, 'web/docs.css'), 'text/css; charset=utf-8'],
    '/docs-playground.js': [join(root, 'web/docs-playground.js'), 'text/javascript; charset=utf-8'],
    '/app.js': [join(root, 'dist/web/app.js'), 'text/javascript'],
    '/icons.js': [join(root, 'dist/web/icons.js'), 'text/javascript'],
    '/cog.js': [join(root, 'dist/web/cog.js'), 'text/javascript'],
    '/model3d.js': [join(root, 'dist/web/model3d.js'), 'text/javascript'],
    // Pure ESM helper (no DOM/bundler deps); ../benchmark.js from /app.js resolves here.
    '/benchmark.js': [join(root, 'dist/benchmark.js'), 'text/javascript'],
    // Feature-popup view helpers imported by /app.js as ./popup.js.
    '/popup.js': [join(root, 'dist/web/popup.js'), 'text/javascript'],
    // Landing hero snippet builder imported by /app.js as ./landing-sample.js.
    '/landing-sample.js': [join(root, 'dist/web/landing-sample.js'), 'text/javascript'],
    '/style.css': [join(root, 'web/style.css'), 'text/css'],
    '/tileo-logo.svg': [join(root, 'web/assets/tileo-logo.svg'), 'image/svg+xml'],
    '/tileo-logo-white.svg': [join(root, 'web/assets/tileo-logo-white.svg'), 'image/svg+xml'],
    '/tileo-social-card.jpg': [join(root, 'web/assets/tileo-social-card.jpg'), 'image/png'],
    '/maplibre-gl.mjs': [join(root, 'node_modules/maplibre-gl/dist/maplibre-gl.mjs'), 'text/javascript'],
    '/maplibre-gl-worker.mjs': [join(root, 'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs'), 'text/javascript'],
    '/maplibre-gl-shared.mjs': [join(root, 'node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs'), 'text/javascript'],
    '/maplibre.css': [join(root, 'node_modules/maplibre-gl/dist/maplibre-gl.css'), 'text/css'],
    '/pmtiles.mjs': [join(root, 'node_modules/pmtiles/dist/esm/index.js'), 'text/javascript'],
  };
  for (const [url, [path, mime]] of Object.entries(files)) app.get(url, async (_req, reply) => reply.type(mime).header('Cache-Control', 'no-cache').send(createReadStream(path)));
  app.addHook('onClose', () => {
    jobs.close();
    clearInterval(quickCleanup);
    for (const db of tileDbCache.values()) { try { db.close(); } catch { /* best-effort */ } }
    tileDbCache.clear();
    void Promise.all([...quickMbtiles.keys(), ...quickTiffs.keys()].map(id => removeQuick(id)));
  });
  // Abandoned uploads cannot become runnable jobs; reclaim only expired private staging files.
  for (const file of await readdir(join(config.data, 'input'))) {
    if (/^\.upload-[a-f0-9-]+$/.test(file)) {
      const path = join(config.data, 'input', file);
      if (Date.now() - (await stat(path)).mtimeMs > 86400000) await rm(path, { force: true });
    }
  }
  // Quick Open previews are in-memory only; reclaim files orphaned by an earlier run.
  try {
    for (const file of await readdir(join(config.data, 'scratch'))) {
      if (/^quick-[a-f0-9-]+\.(mbtiles|tif)$/.test(file)) {
        const path = join(config.data, 'scratch', file);
        if (Date.now() - (await stat(path)).mtimeMs > quickLifetimeMs) await rm(path, { force: true });
      }
    }
  } catch { /* scratch is recreated on demand */ }
  return app;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const app = await createApp();
  await app.listen({ host: config.host, port: config.port });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => void app.close());
}
