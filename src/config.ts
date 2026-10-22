import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const appVersion = (JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { version?: string }).version ?? '0.0.0';

// Load .env for native (non-Docker) runs; skip silently if absent.
try { process.loadEnvFile(resolve(root, '.env')); } catch (e: any) { if (e?.code !== 'ENOENT') throw e; }
export function integer(name: string, fallback: number, min = 1, max = Number.MAX_SAFE_INTEGER) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error(`${name} must be an integer between ${min} and ${max}`);
  return value;
}
function choice<T extends string>(name: string, fallback: T, allowed: readonly T[]): T {
  const val = (process.env[name] ?? fallback).toLowerCase() as T;
  if (!allowed.includes(val)) throw new Error(`${name} must be one of: ${allowed.join(', ')}`);
  return val;
}
function s3Connections() {
  const raw = process.env.TILEO_S3_CONNECTIONS?.trim();
  if (!raw) return [];
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error('TILEO_S3_CONNECTIONS must be valid JSON.'); }
  if (!Array.isArray(value) || value.length > 20) throw new Error('TILEO_S3_CONNECTIONS must be an array with at most 20 connections.');
  const ids = new Set<string>();
  return value.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error(`TILEO_S3_CONNECTIONS[${index}] must be an object.`);
    const item = entry as Record<string, unknown>;
    const id = String(item.id ?? '');
    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(id) || ids.has(id)) throw new Error(`Invalid or duplicate S3 connection id: ${id || '(empty)'}.`);
    ids.add(id);
    const endpoint = String(item.endpoint ?? '').replace(/\/$/, '');
    if (endpoint) {
      let url: URL;
      try { url = new URL(endpoint); } catch { throw new Error(`Invalid S3 endpoint for ${id}.`); }
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error(`S3 endpoint for ${id} must contain only scheme, host, and optional port.`);
      if (url.protocol === 'http:' && item.allowInsecure !== true) throw new Error(`S3 endpoint for ${id} requires HTTPS unless allowInsecure=true.`);
    }
    const rawAuth = item.auth === undefined ? undefined : String(item.auth);
    if (rawAuth !== undefined && !['static', 'iam', 'byoc', 'public'].includes(rawAuth)) throw new Error(`S3 connection ${id} has invalid auth (static, iam, byoc, or public).`);
    const accessKeyId = String(item.accessKeyId ?? ''), secretAccessKey = String(item.secretAccessKey ?? '');
    const auth = rawAuth ?? (item.public === true ? 'public' : accessKeyId ? 'static' : undefined);
    if (!auth) throw new Error(`S3 connection ${id} must declare auth (static credentials, iam role, byoc user keys, or public).`);
    if (auth === 'static' && (!accessKeyId || !secretAccessKey)) throw new Error(`S3 connection ${id} with auth=static requires accessKeyId and secretAccessKey.`);
    if ((auth === 'iam' || auth === 'byoc') && (accessKeyId || secretAccessKey || item.sessionToken)) throw new Error(`S3 connection ${id} with auth=${auth} must not embed static keys.`);
    let roleArn = '', externalId = '', stsEndpoint = '';
    let roleSessionSeconds = 3600;
    if (auth === 'iam') {
      roleArn = String(item.roleArn ?? '');
      if (roleArn && !/^arn:aws(-us-gov|-cn)?:iam::\d{12}:role\/[\w+=,.@/-]+$/.test(roleArn)) throw new Error(`S3 connection ${id} has an invalid roleArn.`);
      externalId = String(item.externalId ?? '');
      if (externalId && (externalId.length > 1224 || /[\x00-\x1f\x7f]/.test(externalId))) throw new Error(`S3 connection ${id} has an invalid externalId.`);
      stsEndpoint = String(item.stsEndpoint ?? '').replace(/\/$/, '');
      if (stsEndpoint) {
        let url: URL;
        try { url = new URL(stsEndpoint); } catch { throw new Error(`Invalid STS endpoint for ${id}.`); }
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error(`STS endpoint for ${id} must contain only scheme, host, and optional port.`);
        if (url.protocol === 'http:' && item.allowInsecure !== true) throw new Error(`STS endpoint for ${id} requires HTTPS unless allowInsecure=true.`);
      }
      if (item.roleSessionSeconds !== undefined) {
        const seconds = Number(item.roleSessionSeconds);
        if (!Number.isInteger(seconds) || seconds < 900 || seconds > 43200) throw new Error(`S3 connection ${id} requires roleSessionSeconds between 900 and 43200.`);
        roleSessionSeconds = seconds;
      }
    }
    const allowedBuckets = Array.isArray(item.allowedBuckets) ? item.allowedBuckets.map(String) : [];
    const allowedPrefixes = Array.isArray(item.allowedPrefixes) ? item.allowedPrefixes.map(String) : [];
    if (!allowedBuckets.length || allowedBuckets.some(bucket => !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket))) throw new Error(`S3 connection ${id} requires valid allowedBuckets.`);
    if (allowedPrefixes.some(prefix => prefix.startsWith('/') || prefix.includes('\0'))) throw new Error(`Invalid allowedPrefixes for S3 connection ${id}.`);
    return {
      id, name: String(item.name ?? id).slice(0, 100), endpoint,
      auth,
      roleArn, externalId, stsEndpoint, roleSessionSeconds,
      region: String(item.region ?? 'us-east-1'), accessKeyId: String(item.accessKeyId ?? ''),
      secretAccessKey: String(item.secretAccessKey ?? ''), sessionToken: item.sessionToken ? String(item.sessionToken) : '',
      forcePathStyle: item.forcePathStyle === true || !!endpoint, allowInsecure: item.allowInsecure === true,
      public: auth === 'public' || item.public === true, allowUnversionedRemote: item.allowUnversionedRemote === true,
      allowedBuckets, allowedPrefixes,
    };
  });
}
export const config = {
  production: process.env.NODE_ENV === 'production',
  repositoryUrl: process.env.TILEO_REPOSITORY_URL || 'https://github.com',
  data: resolve(process.env.TILEO_DATA_DIR ?? join(root, 'data')),
  host: process.env.TILEO_HOST ?? '127.0.0.1',
  port: integer('TILEO_PORT', 8090, 1, 65535),
  token: process.env.TILEO_API_TOKEN ?? '',
  origin: process.env.TILEO_PUBLIC_ORIGIN ?? '',
  localProxy: process.env.TILEO_LOCAL_PROXY === '1',
  allowLan: process.env.TILEO_ALLOW_LAN === '1',
  corsOrigins: (process.env.TILEO_CORS_ORIGINS ?? '').split(',').map(value => value.trim()).filter(Boolean),
  secureCookies: process.env.TILEO_SECURE_COOKIES === '1',
  uploadBytes: integer('TILEO_MAX_UPLOAD_MB', 16384) * 1024 ** 2,
  scratchBytes: integer('TILEO_MAX_SCRATCH_MB', 32768) * 1024 ** 2,
  reserveBytes: integer('TILEO_DISK_RESERVE_MB', 2048, 0) * 1024 ** 2,
  memoryBytes: integer('TILEO_TOOL_MEMORY_MB', 4096) * 1024 ** 2,
  timeout: integer('TILEO_JOB_TIMEOUT_SECONDS', 7200, 10, 86400),
  threads: integer('TILEO_THREADS', 2, 1, 32),
  queueLimit: integer('TILEO_QUEUE_LIMIT', 20, 1, 1000),
  maxTiles: integer('TILEO_MAX_TOP_LEVEL_TILES', 2000000),
  logBytes: 8 * 1024 ** 2,
  basemapUrl: process.env.TILEO_BASEMAP_URL === 'osm' ? '/api/basemap/osm/{z}/{x}/{y}.png' : (process.env.TILEO_BASEMAP_URL ?? ''),
  basemapAttribution: process.env.TILEO_BASEMAP_ATTRIBUTION ?? (
    (process.env.TILEO_BASEMAP_URL === 'osm' || process.env.TILEO_BASEMAP_URL?.includes('openstreetmap.org') || process.env.TILEO_BASEMAP_URL?.includes('/api/basemap/osm'))
      ? '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
      : ''
  ),
  mapApiKey: process.env.TILEO_MAP_API_KEY || '',
  vectorBatchMode: choice('TILEO_VECTOR_BATCH_MODE', 'off' as const, ['off', 'auto', 'on'] as const),
  vectorBatchFeatures: integer('TILEO_VECTOR_BATCH_FEATURES', 10000, 1, 1000000),
  vectorBatchMb: integer('TILEO_VECTOR_BATCH_MB', 16, 1, 256),
  vectorMaxFeatureMb: (() => {
    const maxFeat = integer('TILEO_VECTOR_MAX_FEATURE_MB', 16, 1, 256);
    const batchMb = integer('TILEO_VECTOR_BATCH_MB', 16, 1, 256);
    if (maxFeat > batchMb) throw new Error('TILEO_VECTOR_MAX_FEATURE_MB cannot exceed TILEO_VECTOR_BATCH_MB');
    return maxFeat;
  })(),
  vectorBatchDelivery: choice('TILEO_VECTOR_BATCH_DELIVERY', 'file' as const, ['file', 'stream'] as const),
  s3Connections: s3Connections(),
  remoteInspectSeconds: integer('TILEO_REMOTE_INSPECT_SECONDS', 120, 10, 1800),
  remoteStageBytes: integer('TILEO_MAX_REMOTE_STAGE_MB', 65536, 1) * 1024 ** 2,
  remoteUrlHosts: (process.env.TILEO_REMOTE_URL_HOSTS ?? '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean),
};
export function initializeData() {
  for (const dir of ['', 'input', 'scratch', 'output', 'logs']) mkdirSync(join(config.data, dir), { recursive: true });
}
export function toolEnvironment(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  // The registry may contain credentials for connections unrelated to this
  // process. Remote resolvers add only the selected connection below.
  delete env.TILEO_S3_CONNECTIONS;
  const pathKey = Object.keys(env).find(k => k.toLowerCase() === 'path') ?? 'PATH';
  const originalPath = env[pathKey] ?? '';
  for (const key of Object.keys(env)) if (key.toLowerCase() === 'path') delete env[key];
  const bundled = resolve(root, 'tools/gdal/bin/gdal/apps');
  const gdalBin = process.env.TILEO_GDAL_BIN || (process.platform === 'win32' && existsSync(bundled) ? bundled : '');
  const extra: string[] = [];
  if (gdalBin) {
    const bin = resolve(gdalBin);
    if (!existsSync(join(bin, process.platform === 'win32' ? 'gdalinfo.exe' : 'gdalinfo'))) throw new Error(`TILEO_GDAL_BIN must point to GDAL executables for ${process.platform}: ${bin}. Windows .exe files cannot run on macOS/Linux.`);
    const shared = bin.endsWith('apps') ? resolve(bin, '../..') : bin;
    extra.push(bin, shared);
    if (!env.GDAL_DATA && existsSync(join(shared, 'gdal-data'))) env.GDAL_DATA = join(shared, 'gdal-data');
    if (!env.PROJ_DATA && existsSync(join(shared, 'proj9/share'))) env.PROJ_DATA = join(shared, 'proj9/share');
  }
  const bundledTippecanoe = resolve(root, 'tools/bin');
  const tippecanoeBin = process.env.TILEO_TIPPECANOE_BIN || (process.platform === 'win32' && existsSync(join(bundledTippecanoe, 'tippecanoe.exe')) ? bundledTippecanoe : '');
  if (tippecanoeBin) {
    const bin = resolve(tippecanoeBin);
    if (!existsSync(join(bin, process.platform === 'win32' ? 'tippecanoe.exe' : 'tippecanoe'))) throw new Error(`TILEO_TIPPECANOE_BIN must contain a native Tippecanoe executable for ${process.platform}. Use Docker Compose on Windows if only the Linux bundle is available.`);
    extra.push(bin);
  }
  env.PATH = [...extra, originalPath].join(process.platform === 'win32' ? ';' : ':');
  return { ...env, GDAL_NUM_THREADS: String(config.threads), GDAL_CACHEMAX: '256', PROJ_NETWORK: 'OFF', GDAL_VRT_ENABLE_PYTHON: 'NO', GDAL_PAM_ENABLED: 'NO', TIPPECANOE_MAX_THREADS: String(config.threads) };
}
