import { createHash, createHmac } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { basename, join } from 'node:path';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { config, toolEnvironment } from './config.js';
import { consumeByocCredentials, openByocEntry, resolveIamCredentials, type ByocTarget, type ConsumedByoc, type ResolvedS3Credentials } from './storage-auth.js';
import { JobError, type S3InputSource, type UrlInputSource } from './types.js';

export type S3Connection = (typeof config.s3Connections)[number];
export type S3Inspection = {
  source: S3InputSource; filename: string; contentType: string; strategy: 'remote' | 'stage';
};
export type UrlInspection = {
  source: UrlInputSource; filename: string; contentType: string; strategy: 'remote' | 'stage';
};

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const hmac = (key: Buffer | string, value: string) => createHmac('sha256', key).update(value).digest();
const encodePath = (value: string) => value.split('/').map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)).join('/');

function privateAddress(address: string) {
  if (address === '::1' || address === '::' || address.startsWith('fc') || address.startsWith('fd') || address.startsWith('fe8') || address.startsWith('fe9') || address.startsWith('fea') || address.startsWith('feb')) return true;
  const mapped = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)?.[1];
  const value = mapped ?? address;
  const parts = value.split('.').map(Number);
  return parts.length === 4 && (parts[0] === 10 || parts[0] === 127 || parts[0] === 0 || (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1]! >= 16 && parts[1]! <= 31) || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 100 && parts[1]! >= 64 && parts[1]! <= 127));
}

export async function validateRemoteUrl(value: string) {
  if (!value || value.length > 8192) throw new JobError('INVALID_STORAGE_URL', 'Enter a valid remote object URL.');
  let url: URL;
  try { url = new URL(value); } catch { throw new JobError('INVALID_STORAGE_URL', 'Enter a valid remote object URL.'); }
  if (url.username || url.password || !['https:', 'http:'].includes(url.protocol)) throw new JobError('INVALID_STORAGE_URL', 'Use an HTTP(S) URL without embedded username or password.');
  if (!/\.tiff?$/i.test(url.pathname)) throw new JobError('UNSUPPORTED_REMOTE_INPUT', 'Remote URL input accepts standalone .tif or .tiff files only.');
  const host = url.hostname.toLowerCase(), allowlisted = config.remoteUrlHosts.includes(host);
  if (url.protocol !== 'https:' && !allowlisted) throw new JobError('INSECURE_STORAGE_URL', 'Remote URLs require HTTPS unless the exact host is allowlisted by TILEO_REMOTE_URL_HOSTS.');
  if (!allowlisted) {
    let addresses: { address: string }[];
    try { addresses = await lookup(host, { all: true }); } catch { throw new JobError('STORAGE_HOST_UNAVAILABLE', 'The remote storage hostname could not be resolved.'); }
    if (!addresses.length || addresses.some(item => privateAddress(item.address))) throw new JobError('STORAGE_HOST_DENIED', 'Private or local storage hosts must be explicitly allowlisted by the administrator.');
  } else if (isIP(host) && privateAddress(host) && !config.remoteUrlHosts.includes(host)) throw new JobError('STORAGE_HOST_DENIED', 'This storage host is not allowed.');
  return url;
}

function urlAuth(url: URL): 'public' | 'presigned' {
  const keys = [...url.searchParams.keys()].map(key => key.toLowerCase());
  return keys.some(key => key.startsWith('x-amz-') || key.includes('signature') || key.includes('token')) ? 'presigned' : 'public';
}

export function publicRemoteUrl(value: string) {
  const url = new URL(value); url.search = ''; url.hash = '';
  return url.toString();
}

export async function urlFetch(source: string | UrlInputSource, options: { method?: 'GET'; range?: string; etag?: string; signal?: AbortSignal } = {}) {
  const value = typeof source === 'string' ? source : source.url;
  const url = await validateRemoteUrl(value);
  const headers: Record<string, string> = {};
  if (options.range) headers.range = options.range;
  if (options.etag) headers['if-match'] = options.etag;
  let response: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(url, { method: 'GET', headers, signal: options.signal, redirect: 'error' });
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) break;
    await response.body?.cancel();
    await new Promise(resolve => setTimeout(resolve, 250 * 2 ** attempt));
  }
  if (!response?.ok) {
    await response?.body?.cancel();
    const code = response?.status === 404 ? 'STORAGE_OBJECT_NOT_FOUND' : [401, 403].includes(response?.status ?? 0) ? 'STORAGE_ACCESS_DENIED' : response?.status === 412 ? 'STORAGE_OBJECT_CHANGED' : 'STORAGE_REQUEST_FAILED';
    throw new JobError(code, `Remote URL request failed${response ? ` (${response.status})` : ''}.`);
  }
  return response;
}

export async function inspectUrlObject(input: { url: string; readMode?: 'auto' | 'remote' | 'stage' }, signal?: AbortSignal): Promise<UrlInspection> {
  const url = await validateRemoteUrl(input.url);
  const range = await urlFetch(url.toString(), { range: 'bytes=0-16383', signal });
  const match = /^bytes\s+0-\d+\/(\d+)$/i.exec(range.headers.get('content-range') ?? '');
  if (range.status !== 206 || !match) { await range.body?.cancel(); throw new JobError('STORAGE_RANGE_UNSUPPORTED', 'The URL must support HTTP byte ranges; the response body was not downloaded.'); }
  const size = Number(match[1]), etag = (range.headers.get('etag') ?? '').replace(/^"|"$/g, '');
  if (!Number.isSafeInteger(size) || size <= 0 || !etag) { await range.body?.cancel(); throw new JobError('STORAGE_METADATA_INVALID', 'The URL response must include a valid total size and ETag.'); }
  const bytes = new Uint8Array(await range.arrayBuffer());
  const tiff = bytes.length >= 4 && ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0) || (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0 && bytes[3] === 0x2a));
  if (!tiff) throw new JobError('UNSUPPORTED_REMOTE_INPUT', 'The selected URL does not contain a TIFF.');
  const versionPinned = url.searchParams.has('versionId');
  if (input.readMode === 'remote' && !versionPinned) throw new JobError('STORAGE_REMOTE_NOT_ALLOWED', 'Direct remote reading requires a version-pinned URL. Use Auto or Stage.');
  const readMode = input.readMode === 'remote' && versionPinned ? 'remote' : 'stage';
  if (readMode === 'stage' && size > Math.min(config.remoteStageBytes, config.scratchBytes)) throw new JobError('REMOTE_STAGE_LIMIT', 'The object exceeds the configured remote staging or per-job scratch limit.');
  return { filename: basename(url.pathname), contentType: range.headers.get('content-type') ?? 'image/tiff', strategy: readMode, source: { kind: 'url', url: url.toString(), auth: urlAuth(url), readMode, size, etag, ...(range.headers.get('last-modified') ? { lastModified: range.headers.get('last-modified')! } : {}), rangeSupported: true, cog: false } };
}

export function urlGdalInput(source: UrlInputSource) {
  const env = toolEnvironment();
  env.GDAL_DISABLE_READDIR_ON_OPEN = 'EMPTY_DIR'; env.CPL_VSIL_CURL_ALLOWED_EXTENSIONS = '.tif,.tiff';
  return { input: `/vsicurl/${source.url}`, env, redactions: [source.url] };
}

export async function stageUrlObject(source: UrlInputSource, directory: string, signal: AbortSignal, onProgress?: (done: number, total: number) => void) {
  if (source.size > Math.min(config.remoteStageBytes, config.scratchBytes)) throw new JobError('REMOTE_STAGE_LIMIT', 'The object exceeds the configured remote staging or per-job scratch limit.');
  const target = join(directory, `source${new URL(source.url).pathname.toLowerCase().endsWith('.tiff') ? '.tiff' : '.tif'}`);
  const response = await urlFetch(source, { etag: source.etag, signal });
  if (!response.body) throw new JobError('STORAGE_REQUEST_FAILED', 'The URL returned an empty response body.');
  let transferred = 0;
  const meter = new TransformStream<Uint8Array, Uint8Array>({ transform(chunk, controller) { transferred += chunk.byteLength; onProgress?.(transferred, source.size); controller.enqueue(chunk); } });
  await pipeline(Readable.fromWeb(response.body.pipeThrough(meter) as any), createWriteStream(target, { flags: 'wx' }), { signal });
  if (transferred !== source.size) throw new JobError('STORAGE_DOWNLOAD_INCOMPLETE', 'The remote download was incomplete.');
  return target;
}

export async function assertUrlSourceUnchanged(source: UrlInputSource, signal?: AbortSignal) {
  const response = await urlFetch(source, { range: 'bytes=0-0', signal });
  const match = /\/(\d+)$/.exec(response.headers.get('content-range') ?? '');
  const size = Number(match?.[1]), etag = (response.headers.get('etag') ?? '').replace(/^"|"$/g, '');
  await response.body?.cancel();
  if (size !== source.size || etag !== source.etag) throw new JobError('STORAGE_OBJECT_CHANGED', 'The remote source changed after inspection. Inspect it again and create a new job.');
}

export function publicStorageConnections() {
  return config.s3Connections.map(connection => ({
    id: connection.id, name: connection.name,
    provider: connection.endpoint ? 'S3-compatible' : 'Amazon S3',
    buckets: connection.allowedBuckets,
    remoteRead: connection.allowUnversionedRemote,
    auth: connection.auth,
    needsCredentials: connection.auth === 'byoc',
  }));
}

export function storageConnection(id: string) {
  const connection = config.s3Connections.find(item => item.id === id);
  if (!connection) throw new JobError('STORAGE_CONNECTION_NOT_FOUND', 'Storage connection is unavailable. Ask the administrator to configure it.');
  return connection;
}

export function validateS3Location(connection: S3Connection, bucket: string, key: string) {
  if (!connection.allowedBuckets.includes(bucket)) throw new JobError('STORAGE_ACCESS_DENIED', 'This bucket is not allowed by the selected connection.');
  if (!key || key.length > 1024 || key.startsWith('/') || /[\x00-\x1f\x7f]/.test(key) || key.split('/').includes('..')) throw new JobError('INVALID_STORAGE_KEY', 'Invalid S3 object key.');
  if (connection.allowedPrefixes.length && !connection.allowedPrefixes.some(prefix => key.startsWith(prefix))) throw new JobError('STORAGE_ACCESS_DENIED', 'This object key is outside the allowed prefixes.');
}

// ---------------------------------------------------------------------------
// Credential resolution: static keys, IAM roles, and user-supplied BYOC keys.
// The sealed-credential loader is injected so this module stays independent of
// the job database; API and worker pass a Jobs-backed loader.
// ---------------------------------------------------------------------------

/** Sealed BYOC row as stored in the database (scope plaintext, secrets sealed). */
export interface SealedCredentialRow {
  id: string;
  connectionId: string;
  endpoint: string;
  region: string;
  bucket: string;
  prefix: string;
  iv: string;
  tag: string;
  data: string;
  ownerHash: string;
  expiresAt: number;
}

export type SealedCredentialLoader = (credentialId: string) => SealedCredentialRow | null;

export interface ResolvedS3Access {
  connection: S3Connection;
  credentials?: ResolvedS3Credentials;
  redactions: string[];
}

/** Build an ephemeral connection object for a user-supplied BYOC target. */
export function byocConnection(target: ByocTarget): S3Connection {
  return {
    id: 'byoc', name: 'Bring your own bucket', endpoint: target.endpoint,
    auth: 'byoc',
    roleArn: '', externalId: '', stsEndpoint: '', roleSessionSeconds: 0,
    region: target.region, accessKeyId: '', secretAccessKey: '', sessionToken: '',
    // Custom endpoints default to path-style addressing (same rule as admin
    // connections). Endpoints carrying a base path (for example Supabase
    // /storage/v1/s3) require path-style so the base path is preserved.
    forcePathStyle: true, allowInsecure: false,
    public: false, allowUnversionedRemote: false,
    allowedBuckets: [target.bucket],
    allowedPrefixes: target.prefix ? [target.prefix] : [],
  };
}

async function byocFromStore(credentialId: string, loadSealed: SealedCredentialLoader | undefined, expected: { connectionId: string; target?: ByocTarget; ownerHash: string }): Promise<ResolvedS3Credentials> {
  const row = loadSealed?.(credentialId);
  if (!row) throw new JobError('STORAGE_CREDENTIALS_EXPIRED', 'The supplied storage credentials expired or were revoked. Issue new credentials and inspect the object again.');
  if (row.expiresAt <= Date.now()) throw new JobError('STORAGE_CREDENTIALS_EXPIRED', 'The supplied storage credentials expired. Issue new credentials and inspect the object again.');
  if (row.ownerHash !== expected.ownerHash) throw new JobError('STORAGE_CREDENTIALS_MISSING', 'This source uses credentials bound to another session. Issue your own credentials and inspect the object again.');
  if (expected.target) {
    if (row.endpoint !== expected.target.endpoint || row.region !== expected.target.region || row.bucket !== expected.target.bucket) {
      throw new JobError('STORAGE_ACCESS_DENIED', 'These credentials were issued for a different storage target.');
    }
  } else if (row.connectionId !== expected.connectionId) {
    throw new JobError('STORAGE_ACCESS_DENIED', 'These credentials were issued for a different storage connection.');
  }
  const opened = openByocEntry({ iv: row.iv, tag: row.tag, data: row.data });
  // The sealed blob repeats the scope it was issued for; reject tampered rows.
  if (opened.connectionId && opened.connectionId !== row.connectionId) throw new JobError('STORAGE_ACCESS_DENIED', 'These credentials were issued for a different storage connection.');
  if (opened.target && (opened.target.endpoint !== row.endpoint || opened.target.bucket !== row.bucket)) throw new JobError('STORAGE_ACCESS_DENIED', 'These credentials were issued for a different storage target.');
  if (opened.roleArn) {
    const creds = await resolveIamCredentials({
      id: credentialId,
      region: row.region || expected.target?.region || 'us-east-1',
      roleArn: opened.roleArn,
      externalId: opened.externalId,
    });
    return { ...creds, expiresAt: row.expiresAt, redactions: creds.redactions };
  }
  if (!opened.accessKeyId || !opened.secretAccessKey) throw new JobError('STORAGE_CREDENTIALS_UNREADABLE', 'Stored credentials are invalid.');
  const redactions = [opened.accessKeyId, opened.secretAccessKey, ...(opened.sessionToken ? [opened.sessionToken] : [])];
  return {
    accessKeyId: opened.accessKeyId, secretAccessKey: opened.secretAccessKey,
    ...(opened.sessionToken ? { sessionToken: opened.sessionToken } : {}),
    expiresAt: row.expiresAt, redactions,
  } satisfies ResolvedS3Credentials;
}

async function consumeByoc(ref: { credentialId: string; connectionId: string; target?: ByocTarget; ownerHash: string }, loadSealed?: SealedCredentialLoader): Promise<ResolvedS3Credentials> {
  let memory: ConsumedByoc | undefined;
  try {
    memory = consumeByocCredentials(ref.credentialId, { ...(ref.target ? {} : { connectionId: ref.connectionId }), ownerHash: ref.ownerHash });
    if (ref.target && (memory.target?.endpoint !== ref.target.endpoint || memory.target?.bucket !== ref.target.bucket)) {
      throw new JobError('STORAGE_ACCESS_DENIED', 'These credentials were issued for a different storage target.');
    }
  } catch (error) {
    // The API and worker run in different processes, so the in-memory vault is
    // only a fast path: fall back to the sealed database row. A sealed miss
    // rethrows the original error (expiry vs ownership stay distinguishable).
    if (!(error instanceof JobError) || !loadSealed?.(ref.credentialId)) throw error;
  }
  if (memory?.roleArn) {
    const creds = await resolveIamCredentials({
      id: ref.credentialId,
      region: ref.target?.region || memory.target?.region || 'us-east-1',
      roleArn: memory.roleArn,
      externalId: memory.externalId,
    });
    return { ...creds, expiresAt: memory.expiresAt, redactions: creds.redactions };
  }
  if (memory && memory.accessKeyId && memory.secretAccessKey) {
    return {
      accessKeyId: memory.accessKeyId,
      secretAccessKey: memory.secretAccessKey,
      ...(memory.sessionToken ? { sessionToken: memory.sessionToken } : {}),
      expiresAt: memory.expiresAt,
      redactions: memory.redactions,
    };
  }
  return byocFromStore(ref.credentialId, loadSealed, ref);
}

/**
 * Resolve the connection and credentials for an S3 reference. `ref` is either
 * an admin-defined connection id or a BYOC credential (credentialId plus the
 * connection id or endpoint target recorded at inspect time).
 */
export async function resolveS3Access(ref: { connectionId?: string; credentialId?: string; credentialTarget?: ByocTarget; ownerHash?: string }, loadSealed?: SealedCredentialLoader): Promise<ResolvedS3Access> {
  const ownerHash = ref.ownerHash ?? '';
  if (ref.credentialTarget) {
    const target = ref.credentialTarget;
    if (!ref.credentialId) throw new JobError('STORAGE_CREDENTIALS_MISSING', 'This source requires BYOC credentials. Register your bucket credentials and inspect the object again.');
    const connection = byocConnection(target);
    const credentials = await consumeByoc({ credentialId: ref.credentialId, connectionId: '', target, ownerHash }, loadSealed);
    return { connection, credentials, redactions: credentials.redactions };
  }
  if (!ref.connectionId) throw new JobError('INVALID_INPUT', 'Provide a storage connection or BYOC credentials.');
  const connection = storageConnection(ref.connectionId);
  if (connection.auth === 'public' || connection.public) return { connection, redactions: [] };
  if (connection.auth === 'iam') {
    const credentials = await resolveIamCredentials({ id: connection.id, region: connection.region, ...(connection.roleArn ? { roleArn: connection.roleArn } : {}), ...(connection.externalId ? { externalId: connection.externalId } : {}), ...(connection.stsEndpoint ? { stsEndpoint: connection.stsEndpoint } : {}), ...(connection.roleSessionSeconds ? { roleSessionSeconds: connection.roleSessionSeconds } : {}), ...(connection.allowInsecure ? { allowInsecure: true } : {}) });
    return { connection, credentials, redactions: credentials.redactions };
  }
  if (connection.auth === 'byoc') {
    if (!ref.credentialId) throw new JobError('STORAGE_CREDENTIALS_MISSING', 'This connection requires your own bucket credentials. Register them first, then inspect the object again.');
    const credentials = await consumeByoc({ credentialId: ref.credentialId, connectionId: connection.id, ownerHash }, loadSealed);
    return { connection, credentials, redactions: credentials.redactions };
  }
  // auth === 'static': keys live in server config and never leave the server.
  const redactions = [connection.accessKeyId, connection.secretAccessKey, ...(connection.sessionToken ? [connection.sessionToken] : [])];
  return {
    connection,
    credentials: { accessKeyId: connection.accessKeyId, secretAccessKey: connection.secretAccessKey, ...(connection.sessionToken ? { sessionToken: connection.sessionToken } : {}), redactions },
    redactions,
  };
}

function requestUrl(connection: S3Connection, bucket: string, key: string, versionId?: string) {
  const base = connection.endpoint || `https://s3.${connection.region}.amazonaws.com`;
  const endpoint = new URL(base);
  // Preserve a provider base path (for example Supabase /storage/v1/s3).
  const basePath = endpoint.pathname.replace(/\/$/, '');
  const path = `/${encodePath(key)}`;
  if (connection.forcePathStyle || basePath) endpoint.pathname = `${basePath}/${encodeURIComponent(bucket)}${path}`;
  else { endpoint.hostname = `${bucket}.${endpoint.hostname}`; endpoint.pathname = path; }
  if (versionId) endpoint.searchParams.set('versionId', versionId);
  return endpoint;
}

function signedHeaders(connection: S3Connection, method: string, url: URL, extra: Record<string, string> = {}, credentials?: { accessKeyId: string; secretAccessKey: string; sessionToken?: string }) {
  if (connection.public && !credentials) return extra;
  const accessKeyId = credentials?.accessKeyId || connection.accessKeyId;
  const secretAccessKey = credentials?.secretAccessKey || connection.secretAccessKey;
  const sessionToken = credentials?.sessionToken ?? connection.sessionToken;
  if (!accessKeyId || !secretAccessKey) throw new JobError('STORAGE_CREDENTIALS_MISSING', 'The selected storage connection has no credentials.');
  const now = new Date(), stamp = now.toISOString().replace(/[:-]|\.\d{3}/g, ''), date = stamp.slice(0, 8);
  const headers: Record<string, string> = { ...extra, host: url.host, 'x-amz-content-sha256': 'UNSIGNED-PAYLOAD', 'x-amz-date': stamp };
  if (sessionToken) headers['x-amz-security-token'] = sessionToken;
  const names = Object.keys(headers).map(name => name.toLowerCase()).sort();
  const canonicalHeaders = names.map(name => `${name}:${headers[name]!.trim().replace(/\s+/g, ' ')}\n`).join('');
  const canonicalQuery = [...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
  const canonical = [method, url.pathname, canonicalQuery, canonicalHeaders, names.join(';'), 'UNSIGNED-PAYLOAD'].join('\n');
  const scope = `${date}/${connection.region}/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${stamp}\n${scope}\n${hash(canonical)}`;
  const dateKey = hmac(`AWS4${secretAccessKey}`, date), regionKey = hmac(dateKey, connection.region), serviceKey = hmac(regionKey, 's3'), signingKey = hmac(serviceKey, 'aws4_request');
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${names.join(';')}, Signature=${createHmac('sha256', signingKey).update(stringToSign).digest('hex')}`;
  delete headers.host;
  return headers;
}

export async function s3Fetch(access: ResolvedS3Access, bucket: string, key: string, options: { method?: 'HEAD' | 'GET'; versionId?: string; range?: string; etag?: string; signal?: AbortSignal } = {}) {
  const connection = access.connection;
  validateS3Location(connection, bucket, key);
  const method = options.method ?? 'GET', url = requestUrl(connection, bucket, key, options.versionId);
  const extra: Record<string, string> = {};
  if (options.range) extra.range = options.range;
  if (options.etag) extra['if-match'] = options.etag;
  let response: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(url, { method, headers: signedHeaders(connection, method, url, extra, access.credentials), signal: options.signal, redirect: 'error' });
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) break;
    await response.body?.cancel();
    await new Promise(resolve => setTimeout(resolve, 250 * 2 ** attempt));
  }
  if (!response?.ok) {
    await response?.body?.cancel();
    const code = response?.status === 404 ? 'STORAGE_OBJECT_NOT_FOUND' : [401, 403].includes(response?.status ?? 0) ? 'STORAGE_ACCESS_DENIED' : response?.status === 412 ? 'STORAGE_OBJECT_CHANGED' : 'STORAGE_REQUEST_FAILED';
    throw new JobError(code, `S3 ${method} failed${response ? ` (${response.status})` : ''}.`);
  }
  return response;
}

export async function inspectS3Object(input: { connectionId?: string; credentialId?: string; credentialTarget?: ByocTarget; ownerHash?: string; bucket: string; key: string; versionId?: string; readMode?: 'auto' | 'remote' | 'stage' }, loadSealed?: SealedCredentialLoader, signal?: AbortSignal): Promise<S3Inspection> {
  const access = await resolveS3Access({ ...(input.connectionId ? { connectionId: input.connectionId } : {}), ...(input.credentialId ? { credentialId: input.credentialId } : {}), ...(input.credentialTarget ? { credentialTarget: input.credentialTarget } : {}), ...(input.ownerHash ? { ownerHash: input.ownerHash } : {}) }, loadSealed);
  const connection = access.connection;
  validateS3Location(connection, input.bucket, input.key);
  if (!/\.tiff?$/i.test(input.key)) throw new JobError('UNSUPPORTED_REMOTE_INPUT', 'S3 MVP accepts standalone GeoTIFF/COG objects only.');
  if (input.versionId) throw new JobError('STORAGE_VERSION_UNSUPPORTED', 'Version-pinned inspection is not enabled yet. Use an immutable key or staging mode without a version ID.');
  const head = await s3Fetch(access, input.bucket, input.key, { method: 'HEAD', versionId: input.versionId, signal });
  const size = Number(head.headers.get('content-length'));
  if (!Number.isSafeInteger(size) || size <= 0) throw new JobError('STORAGE_METADATA_INVALID', 'S3 did not return a valid object size.');
  const etag = (head.headers.get('etag') ?? '').replace(/^"|"$/g, '');
  if (!etag) throw new JobError('STORAGE_METADATA_INVALID', 'S3 did not return an object ETag.');
  // Only an explicitly selected version is pinned. The observed response
  // version is not silently promoted because the GDAL CLI path cannot apply
  // a per-object version query without exposing a signed URL.
  const returnedVersion = input.versionId;
  const range = await s3Fetch(access, input.bucket, input.key, { method: 'GET', versionId: returnedVersion, range: `bytes=0-${Math.min(size - 1, 16383)}`, etag, signal });
  const rangeSupported = range.status === 206 && /^bytes\s+0-/i.test(range.headers.get('content-range') ?? '');
  if (!rangeSupported) {
    await range.body?.cancel();
    throw new JobError('STORAGE_RANGE_UNSUPPORTED', 'S3 inspection requires byte-range support; the response body was not downloaded.');
  }
  const bytes = new Uint8Array(await range.arrayBuffer());
  const tiff = bytes.length >= 4 && ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0) || (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0 && bytes[3] === 0x2a));
  if (!tiff) throw new JobError('UNSUPPORTED_REMOTE_INPUT', 'The selected S3 object is not a TIFF.');
  const requested = input.readMode ?? 'auto';
  if (requested === 'remote' && !connection.allowUnversionedRemote) throw new JobError('STORAGE_REMOTE_NOT_ALLOWED', 'Remote reading is disabled for this connection because object keys are not declared immutable. Use Auto or Stage.');
  const readMode = requested === 'stage' || !connection.allowUnversionedRemote ? 'stage' : 'remote';
  if (readMode === 'stage' && size > Math.min(config.remoteStageBytes, config.scratchBytes)) throw new JobError('REMOTE_STAGE_LIMIT', 'The object exceeds the configured remote staging or per-job scratch limit.');
  return {
    filename: basename(input.key), contentType: head.headers.get('content-type') ?? 'image/tiff', strategy: readMode,
    source: {
      kind: 's3', connectionId: connection.id, bucket: input.bucket, key: input.key, ...(returnedVersion ? { versionId: returnedVersion } : {}), readMode, size, etag, ...(head.headers.get('last-modified') ? { lastModified: head.headers.get('last-modified')! } : {}), rangeSupported, cog: false,
      // Credential binding recorded at inspect time; the worker re-resolves and
      // re-checks ownership. Secrets are never embedded here.
      ...(input.credentialId ? { credentialId: input.credentialId, credentialOwner: input.ownerHash ?? '' } : {}),
      ...(input.credentialTarget ? { credentialTarget: input.credentialTarget } : {}),
    },
  };
}

export async function s3GdalInput(source: S3InputSource, loadSealed?: SealedCredentialLoader) {
  const access = await resolveS3Access({ connectionId: source.connectionId, ...(source.credentialId ? { credentialId: source.credentialId } : {}), ...(source.credentialTarget ? { credentialTarget: source.credentialTarget } : {}), ...(source.credentialOwner ? { ownerHash: source.credentialOwner } : {}) }, loadSealed);
  const connection = access.connection;
  validateS3Location(connection, source.bucket, source.key);
  // GDAL 3.12 supports VSIS3_QUERY_STRING as a path-specific option, but CLI
  // jobs cannot safely scope it per path. Versioned objects therefore use the
  // staging path until a native path-specific binding is introduced.
  if (source.versionId && source.readMode === 'remote') throw new JobError('STORAGE_VERSION_REQUIRES_STAGING', 'Version-pinned S3 objects currently require staging mode.');
  const env = toolEnvironment();
  const credentials = access.credentials;
  if (!credentials) env.AWS_NO_SIGN_REQUEST = 'YES';
  else {
    env.AWS_ACCESS_KEY_ID = credentials.accessKeyId; env.AWS_SECRET_ACCESS_KEY = credentials.secretAccessKey;
    if (credentials.sessionToken) env.AWS_SESSION_TOKEN = credentials.sessionToken;
  }
  env.AWS_REGION = connection.region;
  if (connection.endpoint) {
    const endpoint = new URL(connection.endpoint);
    env.AWS_S3_ENDPOINT = endpoint.host; env.AWS_HTTPS = endpoint.protocol === 'https:' ? 'YES' : 'NO';
    env.AWS_VIRTUAL_HOSTING = connection.forcePathStyle ? 'FALSE' : 'TRUE';
  }
  env.AWS_EC2_METADATA_DISABLED = 'TRUE';
  env.GDAL_DISABLE_READDIR_ON_OPEN = 'EMPTY_DIR';
  env.CPL_VSIL_CURL_ALLOWED_EXTENSIONS = '.tif,.tiff';
  return { input: `/vsis3/${source.bucket}/${source.key}`, env, redactions: access.redactions.length ? access.redactions : undefined };
}

export async function stageS3Object(source: S3InputSource, directory: string, signal: AbortSignal, onProgress?: (done: number, total: number) => void, loadSealed?: SealedCredentialLoader) {
  if (source.size > Math.min(config.remoteStageBytes, config.scratchBytes)) throw new JobError('REMOTE_STAGE_LIMIT', 'The object exceeds the configured remote staging or per-job scratch limit.');
  const access = await resolveS3Access({ connectionId: source.connectionId, ...(source.credentialId ? { credentialId: source.credentialId } : {}), ...(source.credentialTarget ? { credentialTarget: source.credentialTarget } : {}), ...(source.credentialOwner ? { ownerHash: source.credentialOwner } : {}) }, loadSealed);
  const target = join(directory, `source${source.key.toLowerCase().endsWith('.tiff') ? '.tiff' : '.tif'}`);
  const response = await s3Fetch(access, source.bucket, source.key, { method: 'GET', versionId: source.versionId, etag: source.etag, signal });
  if (!response.body) throw new JobError('STORAGE_REQUEST_FAILED', 'S3 returned an empty response body.');
  let transferred = 0;
  const meter = new TransformStream<Uint8Array, Uint8Array>({ transform(chunk, controller) { transferred += chunk.byteLength; onProgress?.(transferred, source.size); controller.enqueue(chunk); } });
  await pipeline(Readable.fromWeb(response.body.pipeThrough(meter) as any), createWriteStream(target, { flags: 'wx' }), { signal });
  if (transferred !== source.size) throw new JobError('STORAGE_DOWNLOAD_INCOMPLETE', 'The staged S3 download was incomplete.');
  return target;
}

export async function assertS3SourceUnchanged(source: S3InputSource, signal?: AbortSignal, loadSealed?: SealedCredentialLoader) {
  const access = await resolveS3Access({ connectionId: source.connectionId, ...(source.credentialId ? { credentialId: source.credentialId } : {}), ...(source.credentialTarget ? { credentialTarget: source.credentialTarget } : {}), ...(source.credentialOwner ? { ownerHash: source.credentialOwner } : {}) }, loadSealed);
  const response = await s3Fetch(access, source.bucket, source.key, { method: 'HEAD', versionId: source.versionId, signal });
  const size = Number(response.headers.get('content-length'));
  const etag = (response.headers.get('etag') ?? '').replace(/^"|"$/g, '');
  if (size !== source.size || etag !== source.etag) throw new JobError('STORAGE_OBJECT_CHANGED', 'The S3 source changed after inspection. Inspect it again and create a new job.');
}
