import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config } from '../config.js';
import { inspectS3Object, inspectUrlObject, publicRemoteUrl, publicStorageConnections, stageS3Object, validateS3Location } from '../storage.js';

const tiffHeader = Uint8Array.from([0x49, 0x49, 0x2a, 0, 8, 0, 0, 0]);

test('S3 registry hides credentials, enforces scope, and stages with object identity', async () => {
  const originalConnections = [...config.s3Connections];
  const originalRemoteUrlHosts = [...config.remoteUrlHosts];
  const originalFetch = globalThis.fetch;
  const directory = mkdtempSync(join(tmpdir(), 'tileo-s3-'));
  const requests: Array<{ method: string; range?: string; ifMatch?: string }> = [];
  config.s3Connections.splice(0, config.s3Connections.length, {
    id: 'fixture', name: 'Fixture storage', endpoint: 'https://storage.test', region: 'us-east-1',
    auth: 'static', roleArn: '', externalId: '', stsEndpoint: '', roleSessionSeconds: 0,
    accessKeyId: 'secret-access', secretAccessKey: 'secret-key', sessionToken: '', forcePathStyle: true,
    allowInsecure: false, public: true, allowUnversionedRemote: false,
    allowedBuckets: ['allowed-bucket'], allowedPrefixes: ['cog/'],
  });
  config.remoteUrlHosts.splice(0, config.remoteUrlHosts.length, 'storage.test');
  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    requests.push({ method: init?.method ?? 'GET', range: headers.get('range') ?? undefined, ifMatch: headers.get('if-match') ?? undefined });
    if (init?.method === 'HEAD') return new Response(null, { status: 200, headers: { 'content-length': String(tiffHeader.length), etag: '"fixture-etag"', 'content-type': 'image/tiff' } });
    if (headers.has('range')) return new Response(tiffHeader, { status: 206, headers: { 'content-range': `bytes 0-${tiffHeader.length - 1}/${tiffHeader.length}` } });
    return new Response(tiffHeader, { status: 200 });
  }) as typeof fetch;
  try {
    const listed = publicStorageConnections();
    assert.deepEqual(listed, [{ id: 'fixture', name: 'Fixture storage', provider: 'S3-compatible', buckets: ['allowed-bucket'], remoteRead: false, auth: 'static', needsCredentials: false }]);
    assert.equal(JSON.stringify(listed).includes('secret'), false);
    assert.throws(() => validateS3Location(config.s3Connections[0]!, 'other-bucket', 'cog/a.tif'), /not allowed/);
    assert.throws(() => validateS3Location(config.s3Connections[0]!, 'allowed-bucket', 'private/a.tif'), /outside/);

    const inspected = await inspectS3Object({ connectionId: 'fixture', bucket: 'allowed-bucket', key: 'cog/a.tif', readMode: 'auto' });
    assert.equal(inspected.source.readMode, 'stage');
    assert.equal(inspected.source.etag, 'fixture-etag');
    assert.equal(inspected.source.rangeSupported, true);
    const target = await stageS3Object(inspected.source, directory, new AbortController().signal);
    assert.deepEqual(readFileSync(target), Buffer.from(tiffHeader));
    assert.equal(requests.at(-1)?.ifMatch, 'fixture-etag');
    await assert.rejects(inspectS3Object({ connectionId: 'fixture', bucket: 'allowed-bucket', key: 'cog/a.tif', readMode: 'remote' }), /Remote reading is disabled/);
    await assert.rejects(inspectS3Object({ connectionId: 'fixture', bucket: 'allowed-bucket', key: 'cog/a.tif', versionId: 'v1' }), /Version-pinned inspection is not enabled/);
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => init?.method === 'HEAD'
      ? new Response(null, { status: 200, headers: { 'content-length': String(tiffHeader.length), etag: '"fixture-etag"' } })
      : new Response(tiffHeader, { status: 200 })) as typeof fetch;
    await assert.rejects(inspectS3Object({ connectionId: 'fixture', bucket: 'allowed-bucket', key: 'cog/a.tif' }), /response body was not downloaded/);

    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      return new Response(tiffHeader, { status: 206, headers: { 'content-range': `bytes 0-${tiffHeader.length - 1}/${tiffHeader.length}`, etag: '"url-etag"', 'content-type': 'image/tiff' } });
    }) as typeof fetch;
    const signed = 'https://storage.test/cog/public.tif?X-Amz-Signature=top-secret&X-Amz-Expires=3600';
    const urlInspection = await inspectUrlObject({ url: signed, readMode: 'auto' });
    assert.equal(urlInspection.source.kind, 'url');
    assert.equal(urlInspection.source.auth, 'presigned');
    assert.equal(urlInspection.source.readMode, 'stage');
    assert.equal(publicRemoteUrl(urlInspection.source.url), 'https://storage.test/cog/public.tif');
    assert.equal(JSON.stringify({ ...urlInspection.source, url: publicRemoteUrl(urlInspection.source.url) }).includes('top-secret'), false);
  } finally {
    globalThis.fetch = originalFetch;
    config.s3Connections.splice(0, config.s3Connections.length, ...originalConnections);
    config.remoteUrlHosts.splice(0, config.remoteUrlHosts.length, ...originalRemoteUrlHosts);
    rmSync(directory, { recursive: true, force: true });
  }
});
