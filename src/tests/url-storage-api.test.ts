import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config } from '../config.js';
import { Jobs } from '../jobs.js';
import { createApp } from '../api.js';
import { run } from '../process.js';
import { parseOptions } from '../types.js';

test('presigned URL credentials are hidden from job responses and native-tool logs', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tileo-url-source-'));
  const previous = { data: config.data, token: config.token, origin: config.origin };
  Object.assign(config, { data: directory, token: '', origin: '' });
  const signedUrl = 'https://storage.example/cog/source.tif?X-Amz-Signature=super-secret&X-Amz-Expires=3600';
  const jobs = new Jobs(join(directory, 'jobs.sqlite'));
  jobs.enqueue({
    id: 'url-job', filename: 'source.tif', input: '', sha256: '', size: 8, options: parseOptions({}),
    source: { kind: 'url', url: signedUrl, auth: 'presigned', readMode: 'stage', size: 8, etag: 'etag', rangeSupported: true, cog: true },
  });
  const app = await createApp(jobs);
  try {
    const response = await app.inject({ url: '/api/jobs' });
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.includes('super-secret'), false);
    assert.match(response.body, /https:\/\/storage\.example\/cog\/source\.tif/);

    const log = join(directory, 'redaction.log');
    await run(process.execPath, ['-e', 'process.stderr.write(process.argv[1])', signedUrl], { log, redactions: [signedUrl] });
    const text = await readFile(log, 'utf8');
    assert.equal(text.includes('super-secret'), false);
    assert.match(text, /REDACTED_URL/);
  } finally {
    await app.close();
    Object.assign(config, previous);
    await rm(directory, { recursive: true, force: true });
  }
});

test('IAM role integration is disabled when TILEO_AWS_ACCOUNT_ID is unset', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tileo-iam-info-'));
  const prevAccount = process.env.TILEO_AWS_ACCOUNT_ID;
  const prevExternal = process.env.TILEO_AWS_EXTERNAL_ID;
  delete process.env.TILEO_AWS_ACCOUNT_ID;
  delete process.env.TILEO_AWS_EXTERNAL_ID;
  const jobs = new Jobs(join(directory, 'jobs.sqlite'));
  const app = await createApp(jobs);
  try {
    const res = await app.inject({ method: 'GET', url: '/api/storage/iam-info' });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.enabled, false);
    assert.equal(body.accountId, null);
    assert.equal(body.externalId, null);

    const postRes = await app.inject({
      method: 'POST',
      url: '/api/storage/credentials',
      payload: { roleArn: 'arn:aws:iam::123456789012:role/MyRole', bucket: 'test-bucket' },
    });
    assert.equal(postRes.statusCode, 400);
    const postBody = JSON.parse(postRes.body);
    assert.equal(postBody.error.code, 'FEATURE_DISABLED');

    process.env.TILEO_AWS_ACCOUNT_ID = '987654321098';
    process.env.TILEO_AWS_EXTERNAL_ID = 'my-custom-id';
    const enabledRes = await app.inject({ method: 'GET', url: '/api/storage/iam-info' });
    assert.equal(enabledRes.statusCode, 200);
    const enabledBody = JSON.parse(enabledRes.body);
    assert.equal(enabledBody.enabled, true);
    assert.equal(enabledBody.accountId, '987654321098');
    assert.equal(enabledBody.externalId, 'my-custom-id');
  } finally {
    await app.close();
    if (prevAccount !== undefined) process.env.TILEO_AWS_ACCOUNT_ID = prevAccount; else delete process.env.TILEO_AWS_ACCOUNT_ID;
    if (prevExternal !== undefined) process.env.TILEO_AWS_EXTERNAL_ID = prevExternal; else delete process.env.TILEO_AWS_EXTERNAL_ID;
    await rm(directory, { recursive: true, force: true });
  }
});

test('standard non-COG GeoTIFF URLs are accepted and staged', { skip: process.env.TILEO_INTEGRATION !== '1' }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tileo-url-stage-'));
  const previous = { data: config.data, token: config.token, origin: config.origin, hosts: [...config.remoteUrlHosts] };
  Object.assign(config, { data: directory, token: '', origin: '' });
  config.remoteUrlHosts.splice(0, config.remoteUrlHosts.length, '127.0.0.1');
  await mkdir(join(directory, 'input'), { recursive: true });
  await mkdir(join(directory, 'scratch'), { recursive: true });
  // Strip-layout GeoTIFF (no COG layout/overviews) served with HTTP ranges.
  const ppm = join(directory, 'fixture.ppm'), tif = join(directory, 'fixture.tif');
  await writeFile(ppm, Buffer.concat([Buffer.from('P6\n16 16\n255\n'), Buffer.alloc(16 * 16 * 3, 128)]));
  await run('gdal_translate', ['-a_srs', 'EPSG:4326', '-a_ullr', '119', '-5', '119.1', '-5.1', ppm, tif]);
  const bytes = await readFile(tif);
  const server = createServer((req, res) => {
    const headers = { etag: '"fixture-etag"', 'content-type': 'image/tiff', 'accept-ranges': 'bytes' };
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? '');
    if (range) {
      const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
      res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${bytes.length}`, 'content-length': end - start + 1 });
      res.end(bytes.subarray(start, end + 1));
      return;
    }
    res.writeHead(200, { ...headers, 'content-length': bytes.length });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as { port: number }).port;
  const jobs = new Jobs(join(directory, 'jobs.sqlite'));
  const app = await createApp(jobs);
  try {
    const url = `http://127.0.0.1:${port}/fixture.tif`;
    const response = await app.inject({ method: 'POST', url: '/api/storage/inspect', payload: { url, readMode: 'auto' } });
    assert.equal(response.statusCode, 200, response.body);
    const body = JSON.parse(response.body);
    assert.equal(body.inspection.kind, 'raster');
    assert.equal(body.source.readMode, 'stage');
    assert.equal(body.source.cog, false);

    const job = await app.inject({ method: 'POST', url: '/api/jobs/from-source', payload: { inspectionId: body.inspectionId, options: {} } });
    assert.equal(job.statusCode, 202, job.body);

    // Direct remote reads still require a version-pinned URL, independent of COG status.
    const direct = await app.inject({ method: 'POST', url: '/api/storage/inspect', payload: { url, readMode: 'remote' } });
    assert.equal(direct.statusCode, 400, direct.body);
    assert.equal(JSON.parse(direct.body).error.code, 'STORAGE_REMOTE_NOT_ALLOWED');
  } finally {
    await app.close();
    await new Promise<void>(resolve => server.close(() => resolve()));
    Object.assign(config, { data: previous.data, token: previous.token, origin: previous.origin });
    config.remoteUrlHosts.splice(0, config.remoteUrlHosts.length, ...previous.hosts);
    await rm(directory, { recursive: true, force: true });
  }
});

