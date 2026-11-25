import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { PMTiles, TileType } from 'pmtiles';
import { createApp } from '../api.js';
import { config } from '../config.js';
import { encodeSample } from '../encoded-raster.js';
import { decodeEncodedPixel } from '../encoded-pixel.js';
import { Jobs } from '../jobs.js';
import { cogFixture } from './encoded-fixture.js';
import { parseOptions } from '../types.js';

const vector = { pipeline: 'scientific', scientificOutput: 'encoded-tiles', preset: 'wind-surface', bands: [3, 4], minZoom: 0, maxZoom: 1, exportPmtiles: true } as const;
const scalar = { ...vector, preset: 'temp-2m', bands: [1], exportPmtiles: false } as const;

test('encoded profiles preserve valid minimums, clamp, and round trip within half a code', () => {
  for (const input of [vector, scalar, { ...scalar, preset: 'rh-2m', bands: [1] }]) {
    const options = parseOptions(input).encoding!;
    const [min, max] = options.unscale;
    const codes = options.profile === 'rg-encoded-16bit' ? 65535 : 255;
    for (const value of [min - 1, min, min + (max - min) * 0.387, max, max + 1]) {
      const pixel = Buffer.alloc(4);
      encodeSample(pixel, 0, options, value, value);
      assert.equal(pixel[3], 255);
      if (value === min) assert.deepEqual([...pixel], [0, 0, 0, 255]);
      if (value >= max) assert.deepEqual([...pixel], [255, options.profile === 'r-encoded' ? 0 : 255, 0, 255]);
      const decoded = decodeEncodedPixel(pixel, options)!;
      assert.ok(decoded.every(sample => Math.abs(sample - Math.max(min, Math.min(max, value))) <= (max - min) / codes / 2 + 1e-12));
    }
    const pixel = Buffer.alloc(4);
    encodeSample(pixel, 0, options, NaN, 0);
    assert.equal(decodeEncodedPixel(pixel, options), null);
  }
  assert.throws(() => parseOptions({ ...vector, profile: 'r-encoded' }), /conflicts/);
  assert.throws(() => parseOptions({ ...vector, bands: [1, 1] }), /distinct/);
  assert.throws(() => parseOptions({ ...vector, bands: [1] }), /two|2 distinct/);
  assert.equal(parseOptions({ pipeline: 'scientific' }).encoding, undefined);
});

function pngPixels(png: Buffer) {
  assert.equal(png[24], 8);
  assert.equal(png[25], 6);
  assert.equal(png.readUInt32BE(16), 256);
  assert.equal(png.readUInt32BE(20), 256);
  const chunks = [];
  for (let p = 8; p < png.length;) {
    const size = png.readUInt32BE(p), type = png.toString('ascii', p + 4, p + 8);
    if (type === 'IDAT') chunks.push(png.subarray(p + 8, p + 8 + size));
    p += size + 12;
  }
  const rows = inflateSync(Buffer.concat(chunks));
  return (x: number, y: number) => [...rows.subarray(y * 1025 + 1 + x * 4, y * 1025 + 5 + x * 4)];
}


test('real COG preflight and worker publish numeric XYZ, PMTiles, and legacy scientific COG', { skip: process.env.TILEO_INTEGRATION !== '1' }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-encoded-'));
  const previous = { data: config.data, token: config.token, origin: config.origin, remoteUrlHosts: config.remoteUrlHosts, remoteUrlAllowPrivate: config.remoteUrlAllowPrivate };
  Object.assign(config, { data: dir, token: '', origin: '', remoteUrlHosts: ['127.0.0.1'], remoteUrlAllowPrivate: true });
  const bins = await cogFixture(dir);
  const server = createServer((req, res) => {
    const bytes = req.url === '/scientific.tif' ? bins.scientific : req.url === '/geographic.tif' ? bins.geographic : bins.multiband;
    const headers = { etag: '"encoded-test"', 'accept-ranges': 'bytes', 'content-type': 'image/tiff' };
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? '');
    if (range && req.method !== 'HEAD') {
      const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
      if (start > end) { res.writeHead(416); res.end(); return; }
      res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${bytes.length}`, 'content-length': end - start + 1 });
      res.end(bytes.subarray(start, end + 1));
    } else {
      res.writeHead(200, { ...headers, 'content-length': bytes.length });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  const jobs = new Jobs(join(dir, 'jobs.sqlite'));
  const app = await createApp(jobs);
  const worker = spawn(process.execPath, [fileURLToPath(new URL('../worker.js', import.meta.url))], {
    env: { ...process.env, TILEO_DATA_DIR: dir, TILEO_DISK_RESERVE_MB: '0', TILEO_REMOTE_URL_HOSTS: '127.0.0.1', TILEO_REMOTE_URL_ALLOW_PRIVATE: '1' },
    stdio: 'pipe',
  });
  let log = '';
  worker.stdout.on('data', chunk => { log = (log + chunk).slice(-5000); });
  worker.stderr.on('data', chunk => { log = (log + chunk).slice(-5000); });
  const exit = once(worker, 'exit');

  const request = (url: string, payload?: object) => app.inject({ method: payload ? 'POST' : 'GET', url, payload });
  const inspect = async (file: string) => {
    const response = await request('/api/storage/inspect', { url: `${base}/${file}.tif`, readMode: 'stage' });
    assert.equal(response.statusCode, 200, response.body);
    return response.json().inspectionId as string;
  };
  const waitForJob = async (id: string) => {
    for (let i = 0; i < 160; i++) {
      const job = jobs.get(id)!;
      if (job.status === 'SUCCEEDED') return id;
      assert.ok(job.status !== 'FAILED' && worker.exitCode === null, `${job.code}: ${job.error}\n${log}`);
      await delay(250);
    }
    assert.fail(`Job did not finish\n${log}`);
  };
  const submit = async (inspectionId: string, options: object) => {
    const response = await request('/api/jobs/from-source', { inspectionId, options });
    assert.equal(response.statusCode, 202, response.body);
    return waitForJob(response.json().id);
  };
  try {
    const inspectionId = await inspect('multiband');
    const verified = await request('/api/jobs/from-source', { inspectionId, preflightOnly: true, options: vector });
    assert.equal(verified.statusCode, 200, verified.body);
    assert.deepEqual(verified.json().bands.map((band: { index: number }) => band.index), [3, 4]);
    for (const bands of [[3, 9], [3, 5], [3]]) {
      const invalid = await request('/api/jobs/from-source', { inspectionId, preflightOnly: true, options: { ...vector, bands } });
      assert.equal(invalid.statusCode, 400, invalid.body);
    }
    const id = await submit(inspectionId, vector);
    const tile = await request(`/api/jobs/${id}/tiles/1/0/0`);
    assert.equal(tile.statusCode, 200, tile.body);
    assert.equal(tile.headers['content-type'], 'image/png');
    const sample = pngPixels(tile.rawPayload);
    assert.deepEqual(sample(41, 40), [0, 255, 0, 255]);
    assert.deepEqual(sample(42, 40), [0, 0, 0, 0]);
    assert.deepEqual(sample(43, 40), [0, 0, 0, 0]);
    const json = (await request(`/api/jobs/${id}/tilejson`)).json();
    assert.equal(json.scheme, 'xyz');
    assert.ok(json.tiles[0].endsWith(`/api/jobs/${id}/tiles/{z}/{x}/{y}`));
    assert.equal(json.raster_layers[0].profile, 'rg-encoded');
    assert.equal(json.raster_layers[0].channels.R.unit, 'm/s');
    assert.deepEqual(json.raster_layers[0].channels.R.unscale, [-50, 50]);
    assert.deepEqual(decodeEncodedPixel(sample(41, 40), { profile: json.raster_layers[0].profile, unscale: json.raster_layers[0].channels.R.unscale }), [-50, 50]);
    const downloaded = await request(`/api/jobs/${id}/download?file=pmtiles`);
    assert.equal(downloaded.statusCode, 200);
    const archive = new PMTiles({
      getKey: () => id,
      async getBytes(offset, length) {
        const bytes = downloaded.rawPayload.subarray(offset, offset + length);
        return { data: Uint8Array.from(bytes).buffer };
      },
    });
    assert.equal((await archive.getHeader()).tileType, TileType.Png);
    assert.deepEqual((await archive.getMetadata() as { raster_layers: unknown }).raster_layers, json.raster_layers);
    assert.deepEqual(Buffer.from((await archive.getZxy(1, 0, 0))!.data), tile.rawPayload);

    const temperature = await submit(await inspect('multiband'), scalar);
    const tempPixel = pngPixels((await request(`/api/jobs/${temperature}/tiles/1/0/0`)).rawPayload)(40, 40);
    assert.ok(Math.abs(decodeEncodedPixel(tempPixel, parseOptions(scalar).encoding!)![0]! - 26.85) <= 105 / 65535 / 2 + 1e-10);
    const tempJson = (await request(`/api/jobs/${temperature}/tilejson`)).json();
    assert.equal(tempJson.raster_layers[0].channels.R.byteRole, 'high');
    assert.equal(tempJson.raster_layers[0].channels.G.byteRole, 'low');
    assert.equal((await request(`/api/jobs/${temperature}/download`)).statusCode, 200);

    const boundary = { ...scalar, preset: undefined, profile: 'rg-encoded-16bit', unit: 'm', parameters: ['height'], bands: [2], unscale: [0, 65535] };
    const boundaryId = await submit(await inspect('multiband'), boundary);
    const fine = pngPixels((await request(`/api/jobs/${boundaryId}/tiles/1/0/0`)).rawPayload);
    assert.deepEqual(fine(40, 40), [0, 255, 0, 255]);
    assert.deepEqual(fine(41, 40), [1, 0, 0, 255]);
    const coarse = pngPixels((await request(`/api/jobs/${boundaryId}/tiles/0/0/0`)).rawPayload)(20, 20);
    assert.deepEqual(coarse, [1, 0, 0, 255]);

    const humidityOptions = { ...scalar, preset: 'rh-2m' };
    const apiAddress = await app.listen({ host: '127.0.0.1', port: 0 });
    const upload = await fetch(`${apiAddress}/api/inspect?filename=geographic.tif`, { method: 'POST',
      headers: { 'content-type': 'application/octet-stream' }, body: new Uint8Array(bins.geographic) });
    const uploaded = await upload.json() as { inspectionId: string };
    assert.equal(upload.status, 200, JSON.stringify(uploaded));
    const params = new URLSearchParams({ inspectionId: uploaded.inspectionId, options: JSON.stringify(humidityOptions) });
    const localJob = await request(`/api/jobs?${params}`, {});
    assert.equal(localJob.statusCode, 202, localJob.body);
    const humidityId = await waitForJob(localJob.json().id);
    const humidityTile = await request(`/api/jobs/${humidityId}/tiles/1/0/0`);
    assert.equal(humidityTile.statusCode, 200, humidityTile.body);
    const humidity = pngPixels(humidityTile.rawPayload);
    assert.deepEqual(humidity(40, 100), [0, 0, 0, 255]);
    assert.deepEqual(humidity(90, 100), [0, 0, 0, 0]);
    assert.deepEqual(humidity(160, 100), [255, 0, 0, 255]);
    assert.deepEqual(decodeEncodedPixel(humidity(160, 100), parseOptions(humidityOptions).encoding!), [100]);

    const legacy = await submit(await inspect('scientific'), { pipeline: 'scientific' });
    const result = await request(`/api/jobs/${legacy}/download`);
    assert.equal(result.statusCode, 200);
    assert.match(String(result.headers['content-type']), /image\/tiff/);
  } finally {
    worker.kill('SIGTERM');
    await exit;
    await app.close();
    jobs.close();
    await new Promise<void>(resolve => server.close(() => resolve()));
    Object.assign(config, previous);
    await rm(dir, { recursive: true, force: true });
  }
});
