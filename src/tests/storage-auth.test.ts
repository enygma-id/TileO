import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config } from '../config.js';
import { inspectS3Object, resolveS3Access, s3GdalInput, stageS3Object, type SealedCredentialRow } from '../storage.js';
import { consumeByocCredentials, issueByocCredentials, openByocEntry, resolveIamCredentials, sealByocEntry, sealSecrets, openSecrets, validateByocTarget } from '../storage-auth.js';

process.env.TILEO_CREDENTIAL_KEY = 'a'.repeat(64);

const tiffHeader = Uint8Array.from([0x49, 0x49, 0x2a, 0, 8, 0, 0, 0]);

function s3Mock(fetchImpl: (method: string, headers: Headers, body: string) => Response) {
  const original = globalThis.fetch;
  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) =>
    fetchImpl(init?.method ?? 'GET', new Headers(init?.headers), String(init?.body ?? ''))) as typeof fetch;
  return () => { globalThis.fetch = original; };
}

test('BYOC vault binds credentials to session and connection', () => {
  const { credentialId } = issueByocCredentials({ connectionId: 'byoc-conn', accessKeyId: 'AKID123', secretAccessKey: 'secret-value', ownerHash: 'owner-a' });
  const used = consumeByocCredentials(credentialId, { connectionId: 'byoc-conn', ownerHash: 'owner-a' });
  assert.equal(used.accessKeyId, 'AKID123');
  assert.deepEqual(used.redactions, ['AKID123', 'secret-value']);
  assert.throws(() => consumeByocCredentials(credentialId, { connectionId: 'byoc-conn', ownerHash: 'owner-b' }), /another session/);
  assert.throws(() => consumeByocCredentials(credentialId, { connectionId: 'other-conn', ownerHash: 'owner-a' }), /different storage connection/);
  assert.throws(() => consumeByocCredentials('missing-id', { connectionId: 'byoc-conn', ownerHash: 'owner-a' }), /expired or were revoked/);
  assert.throws(() => issueByocCredentials({ connectionId: 'byoc-conn', accessKeyId: 'x', secretAccessKey: 'y', ownerHash: '' }), /Invalid access key/);
});

test('sealed BYOC entries round-trip through AES-256-GCM', () => {
  const sealed = sealByocEntry({ connectionId: 'byoc-conn', accessKeyId: 'AKID', secretAccessKey: 'shhh' });
  const opened = openByocEntry(sealed);
  assert.equal(opened.accessKeyId, 'AKID');
  assert.equal(opened.secretAccessKey, 'shhh');
  assert.throws(() => openSecrets({ ...sealSecrets('x'), data: 'ff' }), /could not be decrypted/);
});

test('BYOC target validation enforces HTTPS, naming, base paths, and the remote host allowlist', async () => {
  const originalHosts = [...config.remoteUrlHosts];
  const originalAllowHttp = process.env.TILEO_BYOC_ALLOW_HTTP;
  config.remoteUrlHosts.splice(0, config.remoteUrlHosts.length, 'minio.internal', '10.0.0.5');
  delete process.env.TILEO_BYOC_ALLOW_HTTP;
  try {
    const target = await validateByocTarget({ endpoint: 'https://localhost:9000/storage/v1/s3/', region: 'us-east-1', bucket: 'my-bucket', prefix: 'cog/' });
    assert.equal(target.endpoint, 'https://localhost:9000/storage/v1/s3');
    assert.equal(target.bucket, 'my-bucket');
    // HTTPS stays required unless the exact host is allowlisted.
    await assert.rejects(validateByocTarget({ endpoint: 'http://localhost:9000', region: 'us-east-1', bucket: 'my-bucket' }), /require HTTPS/);
    await assert.rejects(validateByocTarget({ endpoint: 'http://minio.example:9000', region: 'us-east-1', bucket: 'my-bucket' }), /require HTTPS/);
    // Allowlisted hosts may use plain HTTP and private/LAN addressing (self-hosted MinIO).
    const named = await validateByocTarget({ endpoint: 'http://minio.internal:9000/', region: 'us-east-1', bucket: 'my-bucket' });
    assert.equal(named.endpoint, 'http://minio.internal:9000');
    const lan = await validateByocTarget({ endpoint: 'http://10.0.0.5:9000/storage/v1/s3', region: 'us-east-1', bucket: 'my-bucket' });
    assert.equal(lan.endpoint, 'http://10.0.0.5:9000/storage/v1/s3');
    // Loopback stays available for local development when explicitly opted in.
    process.env.TILEO_BYOC_ALLOW_HTTP = '1';
    const dev = await validateByocTarget({ endpoint: 'http://127.0.0.1:9000', region: 'us-east-1', bucket: 'my-bucket' });
    assert.equal(dev.endpoint, 'http://127.0.0.1:9000');
    delete process.env.TILEO_BYOC_ALLOW_HTTP;
    await assert.rejects(validateByocTarget({ endpoint: 'https://localhost', region: 'us-east-1', bucket: 'INVALID' }), /S3 naming rules/);
    await assert.rejects(validateByocTarget({ endpoint: 'https://user@localhost', region: 'us-east-1', bucket: 'my-bucket' }), /only scheme, host/);
    await assert.rejects(validateByocTarget({ endpoint: `https://localhost/${'a'.repeat(300)}`, region: 'us-east-1', bucket: 'my-bucket' }), /not allowed/);
  } finally {
    config.remoteUrlHosts.splice(0, config.remoteUrlHosts.length, ...originalHosts);
    if (originalAllowHttp !== undefined) process.env.TILEO_BYOC_ALLOW_HTTP = originalAllowHttp; else delete process.env.TILEO_BYOC_ALLOW_HTTP;
  }
});

test('BYOC inspect signs with user keys and stages through ephemeral target', async () => {
  const originalConnections = [...config.s3Connections];
  const directory = mkdtempSync(join(tmpdir(), 'tileo-byoc-'));
  const seen: string[] = [];
  const restore = s3Mock((method, headers) => {
    const auth = headers.get('authorization') ?? '';
    seen.push(auth);
    if (method === 'HEAD') return new Response(null, { status: 200, headers: { 'content-length': String(tiffHeader.length), etag: '"byoc-etag"' } });
    return new Response(tiffHeader, { status: 206, headers: { 'content-range': `bytes 0-${tiffHeader.length - 1}/${tiffHeader.length}` } });
  });
  try {
    const target = await validateByocTarget({ endpoint: 'https://localhost:9000', region: 'us-east-1', bucket: 'user-bucket', prefix: 'cog/' });
    const { credentialId, expiresInSeconds } = issueByocCredentials({ target, accessKeyId: 'USERKEY', secretAccessKey: 'user-secret', ownerHash: 'owner-a', persistent: true });
    assert.ok(expiresInSeconds > 60);
    const sealed = sealByocEntry({ target, accessKeyId: 'USERKEY', secretAccessKey: 'user-secret' });
    const loader = (id: string): SealedCredentialRow | null => id === credentialId
      ? { id, connectionId: '', endpoint: target.endpoint, region: target.region, bucket: target.bucket, prefix: 'cog/', iv: sealed.iv, tag: sealed.tag, data: sealed.data, ownerHash: 'owner-a', expiresAt: Date.now() + 3600000 }
      : null;
    const inspected = await inspectS3Object({ credentialId, credentialTarget: target, ownerHash: 'owner-a', bucket: target.bucket, key: 'cog/a.tif', readMode: 'auto' }, loader);
    assert.equal(inspected.source.readMode, 'stage');
    assert.equal(inspected.source.credentialId, credentialId);
    assert.ok(seen.some(auth => auth.includes('USERKEY/')), 'request signed with the BYOC access key');
    assert.ok(JSON.stringify(inspected).includes('user-bucket'));
    assert.equal(JSON.stringify(inspected).includes('user-secret'), false);
    const staged = await stageS3Object({ ...inspected.source, credentialOwner: 'owner-a' }, directory, new AbortController().signal, undefined, loader);
    assert.ok(staged.endsWith('.tif'));
    const resolved = await s3GdalInput({ ...inspected.source, readMode: 'remote', credentialOwner: 'owner-a' }, loader);
    assert.deepEqual(resolved.redactions, ['USERKEY', 'user-secret']);
    assert.equal(resolved.env.AWS_ACCESS_KEY_ID, 'USERKEY');
    // Another session cannot spend these credentials.
    await assert.rejects(inspectS3Object({ credentialId, credentialTarget: target, ownerHash: 'owner-b', bucket: target.bucket, key: 'cog/a.tif' }, loader), /another session/);
  } finally { restore(); config.s3Connections.splice(0, config.s3Connections.length, ...originalConnections); }
});

test('IAM connections assume the role with external ID and cache session creds', async () => {
  const originalConnections = [...config.s3Connections];
  const originalKey = process.env.AWS_ACCESS_KEY_ID, originalSecret = process.env.AWS_SECRET_ACCESS_KEY;
  process.env.AWS_ACCESS_KEY_ID = 'BASEKEY';
  process.env.AWS_SECRET_ACCESS_KEY = 'basesecret';
  let stsCalls = 0;
  let stsBody = '';
  const restore = s3Mock((_method, headers, body) => {
    stsCalls++;
    stsBody = body;
    assert.ok((headers.get('authorization') ?? '').includes('BASEKEY/'), 'STS signed with base identity');
    const xml = `<AssumeRoleResponse xmlns="https://sts.amazonaws.com/doc/2011-06-15/"><AssumeRoleResult><Credentials><AccessKeyId>TEMPKEY</AccessKeyId><SecretAccessKey>tempsecret</SecretAccessKey><SessionToken>temptoken</SessionToken><Expiration>${new Date(Date.now() + 3600000).toISOString()}</Expiration></Credentials></AssumeRoleResult><ResponseMetadata><RequestId>r</RequestId></ResponseMetadata></AssumeRoleResponse>`;
    return new Response(xml, { status: 200, headers: { 'content-type': 'text/xml' } });
  });
  config.s3Connections.splice(0, config.s3Connections.length, {
    id: 'iam-conn', name: 'IAM fixture', endpoint: '', auth: 'iam',
    roleArn: 'arn:aws:iam::123456789012:role/TileOReader', externalId: 'tileo-external-1', stsEndpoint: '', roleSessionSeconds: 0,
    region: 'us-east-1', accessKeyId: '', secretAccessKey: '', sessionToken: '',
    forcePathStyle: false, allowInsecure: false, public: false, allowUnversionedRemote: false,
    allowedBuckets: ['allowed-bucket'], allowedPrefixes: [],
  });
  try {
    const first = await resolveS3Access({ connectionId: 'iam-conn' });
    assert.equal(first.credentials?.accessKeyId, 'TEMPKEY');
    assert.deepEqual(first.credentials?.redactions, ['TEMPKEY', 'tempsecret', 'temptoken']);
    assert.equal(stsCalls, 1);
    const second = await resolveS3Access({ connectionId: 'iam-conn' });
    assert.equal(second.credentials?.accessKeyId, 'TEMPKEY');
    assert.equal(stsCalls, 1);
    assert.ok(stsBody.includes('ExternalId=tileo-external-1'), 'external ID sent to STS');
  } finally {
    restore();
    config.s3Connections.splice(0, config.s3Connections.length, ...originalConnections);
    if (originalKey === undefined) delete process.env.AWS_ACCESS_KEY_ID; else process.env.AWS_ACCESS_KEY_ID = originalKey;
    if (originalSecret === undefined) delete process.env.AWS_SECRET_ACCESS_KEY; else process.env.AWS_SECRET_ACCESS_KEY = originalSecret;
  }
});
