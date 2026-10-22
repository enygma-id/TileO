import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { config } from './config.js';
import { JobError } from './types.js';

export type S3AuthKind = 'static' | 'iam' | 'byoc' | 'public';

/** User-supplied S3-compatible target (Option 2 in the storage guide). */
export interface ByocTarget {
  endpoint: string;
  region: string;
  bucket: string;
  prefix?: string;
}

export interface ResolvedS3Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  /** Milliseconds since epoch when the credentials stop being valid, if known. */
  expiresAt?: number;
  /** Secret values that must be redacted from logs and API output. */
  redactions: string[];
}

/** Minimal connection view needed for IAM resolution (avoids a config import). */
export interface IamConnection {
  id: string;
  region: string;
  roleArn?: string;
  externalId?: string;
  stsEndpoint?: string;
  roleSessionSeconds?: number;
  allowInsecure?: boolean;
}

// ---------------------------------------------------------------------------
// BYOC target validation (Option 2: endpoint + bucket supplied by the user).
// Endpoints must be public HTTPS; credentials are read-only user keys.
// ---------------------------------------------------------------------------

function isPrivateAddress(address: string) {
  if (address === '::1' || address === '::' || address.startsWith('fc') || address.startsWith('fd') || address.startsWith('fe8') || address.startsWith('fe9') || address.startsWith('fea') || address.startsWith('feb')) return true;
  const mapped = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)?.[1];
  const value = mapped ?? address;
  const parts = value.split('.').map(Number);
  return parts.length === 4 && (parts[0] === 10 || parts[0] === 127 || parts[0] === 0 || (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1]! >= 16 && parts[1]! <= 31) || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 100 && parts[1]! >= 64 && parts[1]! <= 127));
}

/** Validate a user-supplied endpoint/bucket/region triple. Returns normalized values. */
export async function validateByocTarget(input: { endpoint?: unknown; region?: unknown; bucket?: unknown; prefix?: unknown }): Promise<Required<Pick<ByocTarget, 'endpoint' | 'region' | 'bucket'>> & Pick<ByocTarget, 'prefix'>> {
  const endpointRaw = String(input.endpoint ?? '').replace(/\/$/, '');
  const region = String(input.region ?? 'us-east-1');
  const bucket = String(input.bucket ?? '');
  const prefix = String(input.prefix ?? '');
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)) throw new JobError('INVALID_STORAGE_BUCKET', 'Bucket name must follow S3 naming rules.');
  if (!/^[a-z0-9-]{1,32}$/.test(region)) throw new JobError('INVALID_STORAGE_REGION', 'Region must be a short lowercase identifier such as us-east-1.');
  if (prefix && (prefix.startsWith('/') || prefix.includes('\0') || prefix.length > 512)) throw new JobError('INVALID_STORAGE_PREFIX', 'Prefix must be a relative key prefix.');
  let url: URL;
  try {
    url = new URL(endpointRaw);
  } catch {
    throw new JobError('INVALID_STORAGE_ENDPOINT', 'Endpoint must be a valid URL, for example https://s3.example.com or http://minio.internal:9000.');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new JobError('INVALID_STORAGE_ENDPOINT', 'Endpoint must contain only scheme, host, optional port, and an optional base path.');
  }
  // Some providers expose S3 under a base path (for example Supabase
  // /storage/v1/s3); it is preserved verbatim for path-style requests.
  const basePath = url.pathname.replace(/\/$/, '');
  if (basePath.includes('..') || basePath.includes('\0') || url.pathname.length > 256) {
    throw new JobError('INVALID_STORAGE_ENDPOINT', 'Endpoint path is not allowed.');
  }
  const host = url.hostname.toLowerCase(), loopback = ['localhost', '127.0.0.1', '::1'].includes(host);
  // Same allowlist rule as remote URLs (see validateRemoteUrl in storage.ts):
  // an exact host listed in TILEO_REMOTE_URL_HOSTS may use plain HTTP and
  // private/LAN addressing, which covers self-hosted MinIO-style endpoints.
  // Loopback remains available for local development with TILEO_BYOC_ALLOW_HTTP=1.
  const allowlisted = config.remoteUrlHosts.includes(host);
  if (url.protocol === 'http:') {
    if (!allowlisted && !(loopback && process.env.TILEO_BYOC_ALLOW_HTTP === '1')) {
      throw new JobError('INSECURE_STORAGE_ENDPOINT', 'BYOC endpoints require HTTPS unless the exact host is allowlisted by TILEO_REMOTE_URL_HOSTS. HTTP is also allowed for local development with TILEO_BYOC_ALLOW_HTTP=1.');
    }
  } else if (url.protocol !== 'https:') {
    throw new JobError('INVALID_STORAGE_ENDPOINT', 'Endpoint must use HTTPS.');
  }
  if (!loopback && !allowlisted) {
    let addresses: { address: string }[];
    try {
      addresses = await lookup(host, { all: true });
    } catch {
      throw new JobError('STORAGE_HOST_UNAVAILABLE', 'The storage endpoint could not be resolved.');
    }
    if (!addresses.length || addresses.some(item => isPrivateAddress(item.address))) {
      throw new JobError('STORAGE_HOST_DENIED', 'Storage endpoints must be public; private or local hosts must be explicitly allowlisted by TILEO_REMOTE_URL_HOSTS.');
    }
  }
  return { endpoint: `${url.protocol}//${url.host}${basePath}`, region, bucket, ...(prefix ? { prefix } : {}) };
}

// ---------------------------------------------------------------------------
// At-rest encryption for persisted BYOC credentials (AES-256-GCM).
// Key: TILEO_CREDENTIAL_KEY as 64 hex chars (32 bytes). Without it, only the
// transient memory vault below is available and server restarts drop keys.
// ---------------------------------------------------------------------------

export function credentialKey(): Buffer | null {
  const raw = process.env.TILEO_CREDENTIAL_KEY ?? '';
  if (!raw) return null;
  if (!/^[a-fA-F0-9]{64}$/.test(raw)) throw new Error('TILEO_CREDENTIAL_KEY must be 64 hex characters (32 bytes).');
  return Buffer.from(raw, 'hex');
}

export function sealSecrets(plaintext: string, key?: Buffer | null): { iv: string; tag: string; data: string } {
  const resolved = key ?? credentialKey();
  if (!resolved) throw new JobError('STORAGE_CREDENTIAL_KEY_MISSING', 'Persistent BYOC storage requires TILEO_CREDENTIAL_KEY. Set a 64-hex-char key or use transient credentials.');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', resolved, iv);
  const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return { iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex'), data: data.toString('hex') };
}

export function openSecrets(sealed: { iv: string; tag: string; data: string }, key?: Buffer | null): string {
  const resolved = key ?? credentialKey();
  if (!resolved) throw new JobError('STORAGE_CREDENTIAL_KEY_MISSING', 'TILEO_CREDENTIAL_KEY is required to read stored credentials.');
  try {
    const decipher = createDecipheriv('aes-256-gcm', resolved, Buffer.from(sealed.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(sealed.tag, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(sealed.data, 'hex')), decipher.final()]).toString('utf8');
  } catch {
    throw new JobError('STORAGE_CREDENTIALS_UNREADABLE', 'Stored credentials could not be decrypted. Check TILEO_CREDENTIAL_KEY.');
  }
}

// ---------------------------------------------------------------------------
// BYOC vault: user-supplied keys kept in process memory only.
// ---------------------------------------------------------------------------

type ByocEntry = {
  /** Admin-defined connection this key belongs to (Option 2a), if any. */
  connectionId?: string;
  /** User-supplied endpoint scope (Option 2b: endpoint + bucket + keys). */
  target?: ByocTarget;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  roleArn?: string;
  externalId?: string;
  /** Hash binding the credentials to the issuing session ('' when auth is off). */
  ownerHash: string;
  expiresAt: number;
  /** True when a sealed copy also lives in the database for recurring use. */
  persisted?: boolean;
};

export type ConsumedByoc = Partial<ResolvedS3Credentials> & {
  connectionId?: string;
  target?: ByocTarget;
  roleArn?: string;
  externalId?: string;
  expiresAt: number;
  persisted: boolean;
  redactions: string[];
};

const byocVault = new Map<string, ByocEntry>();

const BYOC_DEFAULT_TTL_SECONDS = 900;
const BYOC_MAX_TTL_SECONDS = 7200;
/** Persisted BYOC keys for recurring syncs may live longer; hard cap 90 days. */
const BYOC_MAX_PERSISTENT_TTL_SECONDS = 90 * 24 * 3600;

function cleanSecret(value: unknown, min: number, max: number, field: string) {
  if (typeof value !== 'string' || value.length < min || value.length > max || /[\s\x00-\x1f\x7f]/.test(value)) {
    // Never echo the supplied value back: the message names the field only.
    throw new JobError('INVALID_STORAGE_CREDENTIALS', `Invalid ${field}. Check the value and try again.`);
  }
  return value;
}

export function issueByocCredentials(input: {
  connectionId?: unknown;
  target?: ByocTarget;
  accessKeyId?: unknown;
  secretAccessKey?: unknown;
  sessionToken?: unknown;
  roleArn?: unknown;
  externalId?: unknown;
  ownerHash?: string;
  ttlSeconds?: unknown;
  persistent?: boolean;
}): { credentialId: string; expiresInSeconds: number } {
  const connectionId = input.connectionId === undefined || input.connectionId === '' ? undefined : String(input.connectionId);
  const roleArn = input.roleArn !== undefined && input.roleArn !== '' ? String(input.roleArn).trim() : undefined;
  if (!connectionId && !input.target && !roleArn) {
    throw new JobError('INVALID_INPUT', 'Provide a connectionId, storage target (endpoint, bucket, keys), or roleArn.');
  }
  let accessKeyId: string | undefined;
  let secretAccessKey: string | undefined;
  let sessionToken: string | undefined;
  let validatedRoleArn: string | undefined;
  let validatedExternalId: string | undefined;

  if (roleArn) {
    if (!/^arn:aws(-us-gov|-cn)?:iam::\d{12}:role\/[\w+=,.@/-]+$/.test(roleArn)) {
      throw new JobError('INVALID_STORAGE_CREDENTIALS', 'Invalid roleArn format. Expected arn:aws:iam::<account>:role/<name>.');
    }
    validatedRoleArn = roleArn;
    if (input.externalId !== undefined && input.externalId !== '') {
      const ext = String(input.externalId).trim();
      if (ext.length > 1224 || /[\x00-\x1f\x7f]/.test(ext)) {
        throw new JobError('INVALID_STORAGE_CREDENTIALS', 'Invalid externalId.');
      }
      validatedExternalId = ext;
    }
  } else {
    accessKeyId = cleanSecret(input.accessKeyId, 3, 128, 'access key ID');
    secretAccessKey = cleanSecret(input.secretAccessKey, 8, 256, 'secret access key');
    if (input.sessionToken !== undefined && input.sessionToken !== '' && input.sessionToken !== null) {
      sessionToken = cleanSecret(input.sessionToken, 8, 8192, 'session token');
    }
  }

  const maxTtl = input.persistent ? BYOC_MAX_PERSISTENT_TTL_SECONDS : BYOC_MAX_TTL_SECONDS;
  let ttl = BYOC_DEFAULT_TTL_SECONDS;
  if (input.ttlSeconds !== undefined) {
    if (typeof input.ttlSeconds !== 'number' || !Number.isInteger(input.ttlSeconds) || input.ttlSeconds < 60 || input.ttlSeconds > maxTtl) {
      throw new JobError('INVALID_INPUT', `ttlSeconds must be an integer from 60 to ${maxTtl}.`);
    }
    ttl = input.ttlSeconds;
  }
  const credentialId = randomUUID();
  byocVault.set(credentialId, {
    ...(connectionId ? { connectionId } : {}),
    ...(input.target ? { target: input.target } : {}),
    ...(accessKeyId ? { accessKeyId } : {}),
    ...(secretAccessKey ? { secretAccessKey } : {}),
    ...(sessionToken ? { sessionToken } : {}),
    ...(validatedRoleArn ? { roleArn: validatedRoleArn } : {}),
    ...(validatedExternalId ? { externalId: validatedExternalId } : {}),
    ownerHash: input.ownerHash ?? '',
    expiresAt: Date.now() + ttl * 1000,
    ...(input.persistent ? { persisted: true } : {}),
  });
  if (byocVault.size > 500) pruneByocCredentials();
  return { credentialId, expiresInSeconds: ttl };
}

/** Shape stored (sealed) in the database for recurring BYOC use. */
export function sealByocEntry(entry: {
  target?: ByocTarget;
  connectionId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  roleArn?: string;
  externalId?: string;
}): { iv: string; tag: string; data: string } {
  return sealSecrets(JSON.stringify({
    ...(entry.connectionId ? { connectionId: entry.connectionId } : {}),
    ...(entry.target ? { target: entry.target } : {}),
    ...(entry.accessKeyId ? { accessKeyId: entry.accessKeyId } : {}),
    ...(entry.secretAccessKey ? { secretAccessKey: entry.secretAccessKey } : {}),
    ...(entry.sessionToken ? { sessionToken: entry.sessionToken } : {}),
    ...(entry.roleArn ? { roleArn: entry.roleArn } : {}),
    ...(entry.externalId ? { externalId: entry.externalId } : {}),
  }));
}

export function openByocEntry(sealed: { iv: string; tag: string; data: string }): {
  connectionId?: string;
  target?: ByocTarget;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  roleArn?: string;
  externalId?: string;
} {
  const parsed = JSON.parse(openSecrets(sealed)) as {
    connectionId?: unknown;
    target?: unknown;
    accessKeyId?: unknown;
    secretAccessKey?: unknown;
    sessionToken?: unknown;
    roleArn?: unknown;
    externalId?: unknown;
  };
  const roleArn = typeof parsed.roleArn === 'string' ? parsed.roleArn : undefined;
  if (!roleArn && (typeof parsed.accessKeyId !== 'string' || typeof parsed.secretAccessKey !== 'string')) {
    throw new JobError('STORAGE_CREDENTIALS_UNREADABLE', 'Stored credentials are invalid.');
  }
  return {
    ...(typeof parsed.connectionId === 'string' ? { connectionId: parsed.connectionId } : {}),
    ...(parsed.target && typeof parsed.target === 'object' ? { target: parsed.target as ByocTarget } : {}),
    ...(typeof parsed.accessKeyId === 'string' ? { accessKeyId: parsed.accessKeyId } : {}),
    ...(typeof parsed.secretAccessKey === 'string' ? { secretAccessKey: parsed.secretAccessKey } : {}),
    ...(typeof parsed.sessionToken === 'string' ? { sessionToken: parsed.sessionToken } : {}),
    ...(roleArn ? { roleArn } : {}),
    ...(typeof parsed.externalId === 'string' ? { externalId: parsed.externalId } : {}),
  };
}

/** Look up BYOC credentials without removing them (inspect -> stage -> worker reuse). */
export function consumeByocCredentials(credentialId: string, expected: { connectionId?: string; ownerHash?: string }): ConsumedByoc {
  const ownerHash = expected.ownerHash ?? '';
  const entry = byocVault.get(credentialId);
  if (!entry || entry.expiresAt <= Date.now()) {
    if (entry) byocVault.delete(credentialId);
    throw new JobError('STORAGE_CREDENTIALS_EXPIRED', 'The supplied storage credentials expired or were revoked. Issue new credentials and inspect the object again.');
  }
  if (expected.connectionId && entry.connectionId !== expected.connectionId) {
    throw new JobError('STORAGE_ACCESS_DENIED', 'These credentials were issued for a different storage connection.');
  }
  if (entry.ownerHash !== ownerHash) {
    throw new JobError('STORAGE_CREDENTIALS_MISSING', 'This source uses credentials bound to another session. Issue your own credentials and inspect the object again.');
  }
  if (entry.roleArn) {
    return {
      roleArn: entry.roleArn,
      ...(entry.externalId ? { externalId: entry.externalId } : {}),
      ...(entry.connectionId ? { connectionId: entry.connectionId } : {}),
      ...(entry.target ? { target: entry.target } : {}),
      expiresAt: entry.expiresAt,
      persisted: entry.persisted ?? false,
      redactions: [],
    };
  }
  const accessKeyId = entry.accessKeyId ?? '';
  const secretAccessKey = entry.secretAccessKey ?? '';
  const redactions = [accessKeyId, secretAccessKey, ...(entry.sessionToken ? [entry.sessionToken] : [])].filter(Boolean);
  return {
    accessKeyId,
    secretAccessKey,
    ...(entry.sessionToken ? { sessionToken: entry.sessionToken } : {}),
    ...(entry.connectionId ? { connectionId: entry.connectionId } : {}),
    ...(entry.target ? { target: entry.target } : {}),
    expiresAt: entry.expiresAt,
    persisted: entry.persisted ?? false,
    redactions,
  };
}

export function revokeByocCredentials(credentialId: string, ownerHash = ''): boolean {
  const entry = byocVault.get(credentialId);
  if (!entry || entry.ownerHash !== ownerHash) return false;
  return byocVault.delete(credentialId);
}

export function pruneByocCredentials(now = Date.now()) {
  for (const [id, entry] of byocVault) if (entry.expiresAt <= now) byocVault.delete(id);
}

/** Test hook: drop every vault entry. */
export function clearByocVault() {
  byocVault.clear();
}

// ---------------------------------------------------------------------------
// IAM provider: instance/task-role credentials with optional AssumeRole.
// No AWS SDK: ECS/EC2 metadata plus STS AssumeRole over fetch.
// ---------------------------------------------------------------------------

const iamCache = new Map<string, { credentials: ResolvedS3Credentials; expiresAt: number }>();
const IAM_REFRESH_BUFFER_MS = 5 * 60 * 1000;
const IMDS_BASE = 'http://169.254.169.254';
const ECS_BASE = 'http://169.254.170.2';

const sha256hex = (value: string) => createHash('sha256').update(value).digest('hex');
const hmac = (key: Buffer | string, value: string) => createHmac('sha256', key).update(value).digest();

type FetchImpl = typeof fetch;

async function fetchJson(url: string, init: RequestInit, fetchImpl: FetchImpl, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { ...init, signal: controller.signal, redirect: 'error' });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

type BaseCredentials = { accessKeyId: string; secretAccessKey: string; sessionToken?: string; expiresAt?: number };

async function baseCredentials(env: NodeJS.ProcessEnv, fetchImpl: FetchImpl): Promise<BaseCredentials | undefined> {
  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      ...(env.AWS_SESSION_TOKEN ? { sessionToken: env.AWS_SESSION_TOKEN } : {}),
    };
  }
  if (process.env.TILEO_S3_IAM_ALLOW_METADATA === '0') return undefined;
  // ECS task role: relative URI (standard) or full URI (validated host).
  const relative = env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI;
  const full = env.AWS_CONTAINER_CREDENTIALS_FULL_URI;
  if (relative || full) {
    try {
      const url = full && /^https?:\/\/169\.254\.170\.2\//.test(full) ? full : `${ECS_BASE}${relative ?? ''}`;
      const headers: Record<string, string> = {};
      const token = env.AWS_CONTAINER_AUTHORIZATION_TOKEN;
      if (full && token) headers.Authorization = token;
      const response = await fetchJson(url, { headers }, fetchImpl, 3000);
      if (response.ok) {
        const body = (await response.json()) as { AccessKeyId?: string; SecretAccessKey?: string; Token?: string; Expiration?: string };
        if (body.AccessKeyId && body.SecretAccessKey) {
          return {
            accessKeyId: body.AccessKeyId,
            secretAccessKey: body.SecretAccessKey,
            ...(body.Token ? { sessionToken: body.Token } : {}),
            ...(body.Expiration ? { expiresAt: Date.parse(body.Expiration) } : {}),
          };
        }
      }
    } catch { /* Fall through to IMDS. */ }
  }
  // EC2 instance profile via IMDSv2.
  try {
    const tokenResponse = await fetchJson(`${IMDS_BASE}/latest/api/token`, {
      method: 'PUT',
      headers: { 'X-aws-ec2-metadata-token-ttl-seconds': '60' },
    }, fetchImpl, 2000);
    if (!tokenResponse.ok) return undefined;
    const token = (await tokenResponse.text()).trim();
    if (!token) return undefined;
    const headers = { 'X-aws-ec2-metadata-token': token };
    const roleResponse = await fetchJson(`${IMDS_BASE}/latest/meta-data/iam/security-credentials/`, { headers }, fetchImpl, 2000);
    if (!roleResponse.ok) return undefined;
    const role = (await roleResponse.text()).split('\n').map(line => line.trim()).filter(Boolean)[0];
    if (!role) return undefined;
    const credsResponse = await fetchJson(`${IMDS_BASE}/latest/meta-data/iam/security-credentials/${encodeURIComponent(role)}`, { headers }, fetchImpl, 2000);
    if (!credsResponse.ok) return undefined;
    const body = (await credsResponse.json()) as { AccessKeyId?: string; SecretAccessKey?: string; Token?: string; Expiration?: string; Code?: string };
    if (body.Code && body.Code !== 'Success') return undefined;
    if (body.AccessKeyId && body.SecretAccessKey) {
      return {
        accessKeyId: body.AccessKeyId,
        secretAccessKey: body.SecretAccessKey,
        ...(body.Token ? { sessionToken: body.Token } : {}),
        ...(body.Expiration ? { expiresAt: Date.parse(body.Expiration) } : {}),
      };
    }
  } catch { /* No instance credentials available. */ }
  return undefined;
}

function signStsRequest(url: URL, body: string, credentials: BaseCredentials, region: string, stamp: string) {
  const date = stamp.slice(0, 8);
  const payloadHash = sha256hex(body);
  const headers: Record<string, string> = {
    'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
    host: url.host,
    'x-amz-date': stamp,
  };
  if (credentials.sessionToken) headers['x-amz-security-token'] = credentials.sessionToken;
  const names = Object.keys(headers).sort();
  const canonicalHeaders = names.map(name => `${name}:${headers[name]!.trim().replace(/\s+/g, ' ')}\n`).join('');
  const canonical = ['POST', url.pathname, '', canonicalHeaders, names.join(';'), payloadHash].join('\n');
  const scope = `${date}/${region}/sts/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${stamp}\n${scope}\n${sha256hex(canonical)}`;
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${credentials.secretAccessKey}`, date), region), 'sts'), 'aws4_request');
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  return {
    ...headers,
    Authorization: `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}`,
  };
}

const tag = (xml: string, name: string) => new RegExp(`<${name}>([^<]+)</${name}>`).exec(xml)?.[1];

async function assumeRole(connection: IamConnection, base: BaseCredentials, fetchImpl: FetchImpl): Promise<ResolvedS3Credentials> {
  const endpoint = connection.stsEndpoint || `https://sts.${connection.region}.amazonaws.com`;
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new JobError('STORAGE_IAM_MISCONFIGURED', 'The STS endpoint for this connection is invalid.');
  }
  if (url.protocol !== 'https:' && !(connection.allowInsecure && (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1'))) {
    throw new JobError('STORAGE_IAM_MISCONFIGURED', 'The STS endpoint must use HTTPS.');
  }
  const duration = Math.min(Math.max(connection.roleSessionSeconds ?? 3600, 900), 43200);
  const params = new URLSearchParams({
    Action: 'AssumeRole',
    Version: '2011-06-15',
    RoleArn: connection.roleArn!,
    RoleSessionName: `tileo-${connection.id}-${Date.now()}`.slice(0, 64),
    DurationSeconds: String(duration),
  });
  if (connection.externalId) params.set('ExternalId', connection.externalId);
  const body = params.toString();
  const stamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const headers = signStsRequest(url, body, base, connection.region, stamp);
  let response: Response;
  try {
    response = await fetchImpl(url, { method: 'POST', headers, body, redirect: 'error' });
  } catch {
    throw new JobError('STORAGE_IAM_UNAVAILABLE', 'The security token service could not be reached.');
  }
  const xml = await response.text();
  if (!response.ok) {
    const code = /<Code>([^<]+)<\/Code>/.exec(xml)?.[1];
    throw new JobError('STORAGE_IAM_ASSUME_FAILED', `STS AssumeRole failed${response ? ` (${response.status})` : ''}${code ? `: ${code}` : ''}.`);
  }
  const accessKeyId = tag(xml, 'AccessKeyId');
  const secretAccessKey = tag(xml, 'SecretAccessKey');
  const sessionToken = tag(xml, 'SessionToken');
  const expiration = tag(xml, 'Expiration');
  if (!accessKeyId || !secretAccessKey || !sessionToken) {
    throw new JobError('STORAGE_IAM_ASSUME_FAILED', 'STS returned an incomplete credential set.');
  }
  const expiresAt = expiration ? Date.parse(expiration) : Date.now() + duration * 1000;
  if (!Number.isFinite(expiresAt)) throw new JobError('STORAGE_IAM_ASSUME_FAILED', 'STS returned an invalid credential expiration.');
  return { accessKeyId, secretAccessKey, sessionToken, expiresAt, redactions: [accessKeyId, secretAccessKey, sessionToken] };
}

export async function resolveIamCredentials(
  connection: IamConnection,
  options: { fetchImpl?: FetchImpl; env?: NodeJS.ProcessEnv; now?: number } = {},
): Promise<ResolvedS3Credentials> {
  const now = options.now ?? Date.now();
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const env = options.env ?? process.env;
  const cached = iamCache.get(connection.id);
  if (cached && cached.expiresAt - now > IAM_REFRESH_BUFFER_MS) return cached.credentials;
  const base = await baseCredentials(env, fetchImpl);
  let resolved: ResolvedS3Credentials;
  if (connection.roleArn) {
    if (!base) throw new JobError('STORAGE_IAM_UNAVAILABLE', 'No base AWS credentials found for role assumption. Attach an instance profile, task role, or environment credentials.');
    resolved = await assumeRole(connection, base, fetchImpl);
  } else {
    if (!base) throw new JobError('STORAGE_IAM_UNAVAILABLE', 'No IAM credentials found. Attach an instance profile, task role, or environment credentials.');
    resolved = {
      ...base,
      expiresAt: base.expiresAt,
      redactions: [base.accessKeyId, base.secretAccessKey, ...(base.sessionToken ? [base.sessionToken] : [])],
    };
  }
  iamCache.set(connection.id, { credentials: resolved, expiresAt: resolved.expiresAt ?? now + 3600000 });
  return resolved;
}

/** Test hook: drop cached IAM credentials. */
export function clearIamCache() {
  iamCache.clear();
}
