import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { config } from '../config.js';
import { run } from '../process.js';
import { parseOptions } from '../types.js';

const enabled = process.env.TILEO_INTEGRATION === '1';

async function rgbTiff(dir: string, name: string, withCrs: boolean) {
  const ppm = join(dir, `${name}.ppm`), tif = join(dir, `${name}.tif`);
  const pixels = Buffer.alloc(16 * 16 * 3, 128);
  await writeFile(ppm, Buffer.concat([Buffer.from('P6\n16 16\n255\n'), pixels]));
  const args = withCrs
    ? ['-a_srs', 'EPSG:4326', '-a_ullr', '119', '-5', '119.1', '-5.1', ppm, tif]
    : [ppm, tif];
  await run('gdal_translate', args);
  return tif;
}

test('Quick Open streams the original TIFF and job sources expose it', { skip: !enabled }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tileo-quick-tiff-')), previous = config.data;
  process.env.TILEO_DATA_DIR = directory; process.env.TILEO_DISK_RESERVE_MB = '0';
  config.data = directory;
  try {
    await mkdir(join(directory, 'input'), { recursive: true });
    await mkdir(join(directory, 'scratch'), { recursive: true });
    const { createApp } = await import('../api.js');
    const { Jobs } = await import('../jobs.js');
    const jobs = new Jobs();
    const app = await createApp(jobs);
    try {
      const tif = await rgbTiff(directory, 'quick', true);
      const { readFile } = await import('node:fs/promises');
      const bytes = await readFile(tif);
      const upload = await app.inject({ method: 'POST', url: '/api/quick/tiff?filename=photo.tif', headers: { 'content-type': 'application/octet-stream' }, payload: bytes });
      assert.equal(upload.statusCode, 200, upload.body);
      const meta = upload.json();
      assert.equal(meta.kind, 'raster'); assert.equal(meta.format, 'tiff');
      assert.deepEqual(meta.bands.map((b: any) => b.type), ['Byte', 'Byte', 'Byte']);
      assert.ok(meta.crsWkt.length > 100); assert.equal(meta.geoTransform.length, 6);
      assert.deepEqual(meta.bounds, [119, -5.1, 119.1, -5]);
      const full = await app.inject(`/api/quick/${meta.id}/file`);
      assert.equal(full.statusCode, 200); assert.deepEqual(full.rawPayload, bytes);
      const range = await app.inject({ url: `/api/quick/${meta.id}/file`, headers: { range: 'bytes=0-3' } });
      assert.equal(range.statusCode, 206); assert.deepEqual(range.rawPayload, bytes.subarray(0, 4));
      assert.equal((await app.inject(`/api/quick/missing/file`)).statusCode, 404);
      assert.equal((await app.inject({ method: 'POST', url: '/api/quick/tiff?filename=photo.png', headers: { 'content-type': 'application/octet-stream' }, payload: bytes })).statusCode, 400);
      const plain = await rgbTiff(directory, 'nocrs', false);
      const nocrs = await app.inject({ method: 'POST', url: '/api/quick/tiff?filename=nocrs.tif', headers: { 'content-type': 'application/octet-stream' }, payload: await readFile(plain) });
      assert.equal(nocrs.statusCode, 400, nocrs.body);

      for (const [name, args, count] of [
        ['rgb16', ['-ot', 'UInt16', '-scale', '0', '255', '0', '65535'], 3],
        ['rgba', ['-b', '1', '-b', '2', '-b', '3', '-b', '1', '-colorinterp', 'red,green,blue,alpha'], 4],
        ['gray-alpha', ['-b', '1', '-b', '2', '-colorinterp', 'gray,alpha'], 2],
      ] as const) {
        const variant = join(directory, `${name}.tif`);
        await run('gdal_translate', [...args, tif, variant]);
        const result = await app.inject({ method: 'POST', url: `/api/quick/tiff?filename=${name}.tif`, headers: { 'content-type': 'application/octet-stream' }, payload: await readFile(variant) });
        assert.equal(result.statusCode, 200, result.body);
        assert.equal(result.json().bands.length, count);
        if (name === 'rgb16') assert.equal(result.json().bands[0].type, 'UInt16');
      }

      const xyz = join(directory, 'elevation.xyz');
      await writeFile(xyz, '119 -5 -9999\n119.01 -5 -20\n119 -5.01 10\n119.01 -5.01 40\n');
      for (const type of ['Int16', 'UInt16', 'Int32', 'UInt32', 'Float32', 'Float64']) {
        const elevation = join(directory, `${type}.tif`);
        await run('gdal_translate', ['-a_srs', 'EPSG:4326', '-ot', type, '-a_nodata', '-9999', '-a_scale', '2', '-a_offset', '10', xyz, elevation]);
        const elevationBytes = await readFile(elevation);
        const result = await app.inject({ method: 'POST', url: `/api/quick/tiff?filename=${type}.tif`, headers: { 'content-type': 'application/octet-stream' }, payload: elevationBytes });
        assert.equal(result.statusCode, 200, result.body);
        const elevationMeta = result.json();
        assert.equal(elevationMeta.kind, 'scientific');
        assert.equal(elevationMeta.display.kind, 'scientific');
        assert.equal(elevationMeta.bands[0].type, type);
        assert.ok(Number.isFinite(elevationMeta.display.minimum));
        assert.ok(Number.isFinite(elevationMeta.display.maximum));
        if (['Int16', 'Int32', 'Float32', 'Float64'].includes(type)) {
          assert.equal(elevationMeta.display.minimum, -30);
          assert.equal(elevationMeta.display.maximum, 90);
        }
        const streamed = await app.inject(`/api/quick/${elevationMeta.id}/file`);
        assert.deepEqual(streamed.rawPayload, elevationBytes);
        if (type === 'Float32') {
          for (const mode of ['dem', 'dsm', 'dtm']) {
            const explicit = await app.inject({ method: 'POST', url: `/api/quick/tiff?filename=surface.tif&mode=${mode}`, headers: { 'content-type': 'application/octet-stream' }, payload: elevationBytes });
            assert.equal(explicit.statusCode, 200, explicit.body);
            assert.equal(explicit.json().display.kind, mode);
          }
          const imagery = await app.inject({ method: 'POST', url: '/api/quick/tiff?filename=surface.tif&mode=imagery', headers: { 'content-type': 'application/octet-stream' }, payload: elevationBytes });
          assert.equal(imagery.statusCode, 400);
          const scientific = await app.inject({ method: 'POST', url: '/api/quick/tiff?filename=surface.tif&mode=scientific', headers: { 'content-type': 'application/octet-stream' }, payload: elevationBytes });
          assert.equal(scientific.statusCode, 200, scientific.body);
          assert.equal(scientific.json().display.mode, 'scientific');
        }
      }
      const gray = join(directory, 'gray-byte.tif');
      await run('gdal_translate', ['-b', '1', tif, gray]);
      const grayBytes = await readFile(gray);
      const grayDefault = await app.inject({ method: 'POST', url: '/api/quick/tiff?filename=gray.tif', headers: { 'content-type': 'application/octet-stream' }, payload: grayBytes });
      assert.equal(grayDefault.json().kind, 'raster');
      const byteDem = await app.inject({ method: 'POST', url: '/api/quick/tiff?filename=gray.tif&mode=dem', headers: { 'content-type': 'application/octet-stream' }, payload: grayBytes });
      assert.equal(byteDem.statusCode, 200, byteDem.body);
      assert.equal(byteDem.json().display.kind, 'dem');
      const rgbDem = await app.inject({ method: 'POST', url: '/api/quick/tiff?filename=rgb.tif&mode=dtm', headers: { 'content-type': 'application/octet-stream' }, payload: bytes });
      assert.equal(rgbDem.statusCode, 400);

      // A completed raster job exposes the same original bytes plus its georeferencing.
      const input = 'job-input.tif';
      await copyFile(tif, join(directory, 'input', input));
      const id = 'raster-job';
      jobs.enqueue({ id, filename: 'photo.tif', input, sha256: 'hash', size: bytes.length, options: parseOptions({}) });
      jobs.acquire('fixture-worker');
      const claimed = jobs.claim('fixture-worker')!;
      assert.equal(jobs.finish(id, claimed.attempt, 'fixture-worker', `${id}-${claimed.attempt}.mbtiles`, { kind: 'raster' }), true);
      const georef = await app.inject(`/api/jobs/${id}/source-georef`);
      assert.equal(georef.statusCode, 200, georef.body);
      assert.deepEqual(georef.json().bounds, [119, -5.1, 119.1, -5]);
      const source = await app.inject(`/api/jobs/${id}/source`);
      assert.equal(source.statusCode, 200); assert.deepEqual(source.rawPayload, bytes);
      const sourceRange = await app.inject({ url: `/api/jobs/${id}/source`, headers: { range: 'bytes=0-3' } });
      assert.equal(sourceRange.statusCode, 206); assert.deepEqual(sourceRange.rawPayload, bytes.subarray(0, 4));
      const deletedQuick = await app.inject({ method: 'DELETE', url: `/api/quick/${meta.id}` });
      assert.deepEqual(deletedQuick.json(), { deleted: true });
      assert.equal((await app.inject(`/api/quick/${meta.id}/file`)).statusCode, 404);
    } finally { await app.close(); jobs.close(); }
  } finally { config.data = previous; await rm(directory, { recursive: true, force: true }); }
});
