import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateSync, crc32 } from 'node:zlib';
import Database from 'better-sqlite3';
import { encodeHeight, terrainGrid, terrainPng, buildElevation, buildScientific } from '../elevation.js';
import { parseOptions } from '../types.js';
import { inspect } from '../inspect.js';
import { run } from '../process.js';
import { config } from '../config.js';

export function decodeTerrain(png: Buffer) {
  const chunks: Buffer[] = [];
  for (let p = 8; p < png.length;) {
    const size = png.readUInt32BE(p), type = png.subarray(p + 4, p + 8).toString();
    assert.equal(crc32(png.subarray(p + 4, p + 8 + size)), png.readUInt32BE(p + 8 + size));
    if (type === 'IDAT') chunks.push(png.subarray(p + 8, p + 8 + size));
    p += size + 12;
  }
  const rows = inflateSync(Buffer.concat(chunks)), result: number[] = [];
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const p = y * 769 + 1 + x * 3;
    result.push(-10000 + (rows[p]! * 65536 + rows[p + 1]! * 256 + rows[p + 2]!) * 0.1);
  }
  return result;
}

test('elevation options require explicit terrain metadata and reject unknown/unsafe settings', () => {
  assert.equal(parseOptions({ pipeline: 'elevation' }).elevationOutput, 'cog');
  assert.equal(parseOptions({ pipeline: 'scientific', rasterPurpose: 'scientific' }).pipeline, 'scientific');
  assert.throws(() => parseOptions({ pipeline: 'scientific', rasterPurpose: 'elevation' }), /rasterPurpose/);
  assert.throws(() => parseOptions({ pipeline: 'elevation', elevationOutput: 'terrain-rgb' }), /requires explicit/);
  assert.throws(() => parseOptions({ pipeline: 'elevation', quality: 80 }), /Unknown/);
  assert.throws(() => parseOptions({ pipeline: 'elevation', elevationUnit: 'yards' }), /Invalid/);
  assert.throws(() => parseOptions({ pipeline: 'elevation', elevationOutput: 'terrain-rgb', elevationUnit: 'm', heightReference: 'ellipsoid' }), /NoData/);
  assert.throws(() => terrainGrid([-180, -90, 180, 90], 1), /extent/);
  assert.throws(() => encodeHeight(-10000.1), /range/);
  assert.throws(() => encodeHeight(NaN), /range/);
  assert.equal(terrainGrid([0.1, 0.1, 1, 1], 0).count, 1);
});

test('lossless Terrain-RGB PNG round-trips positive and negative elevations within 0.05 m', () => {
  const heights = new Float64Array(256 * 256);
  for (let i = 0; i < heights.length; i++) heights[i] = -9000 + i / 7;
  const decoded = decodeTerrain(terrainPng(heights));
  for (let i = 0; i < heights.length; i++) assert.ok(Math.abs(decoded[i]! - heights[i]!) <= 0.050001);
});

test('real GDAL elevation: COG preserves Int16/Float32/Float64 values, NoData and scale; terrain decodes in meters', { skip: process.env.TILEO_INTEGRATION !== '1' }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-elevation-'));
  const previousData = config.data;
  config.data = dir;
  try {
    const ascii = join(dir, 'source.asc');
    await writeFile(ascii, 'ncols 8\nnrows 8\nxllcorner 119.35\nyllcorner -5.2\ncellsize 0.01\nNODATA_value -9999\n' + Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => x === 0 && y === 0 ? -9999 : -20 + x * 7.25 + y * 5).join(' ')).join('\n'));
    for (const type of ['Int16', 'Float32', 'Float64']) {
      const input = join(dir, `${type}.tif`), output = join(dir, type);
      await run('gdal_translate', ['-a_srs', 'EPSG:4326', '-ot', type, '-a_scale', '0.5', '-a_offset', '10', ascii, input]);
      const options = parseOptions({ pipeline: 'elevation', elevationKind: 'dtm' });
      const info = await inspect(input, options, {}); assert.equal(info.dataType, type); assert.equal(info.noData, -9999);
      await assert.rejects(inspect(input, parseOptions({}), {}), /Byte/);
      assert.equal((await inspect(input, parseOptions({}), {}, true)).elevationCandidate, true);
      await buildElevation(input, output, options, { timeoutMs: 60000 }, () => {});
      const original = join(dir, `${type}-source.xyz`), converted = join(dir, `${type}-output.xyz`);
      await run('gdal_translate', ['-of', 'XYZ', input, original]);
      await run('gdal_translate', ['-of', 'XYZ', join(output, 'elevation.tif'), converted]);
      assert.equal(await readFile(converted, 'utf8'), await readFile(original, 'utf8'));
      const cogInfo = JSON.parse(await run('gdalinfo', ['-json', join(output, 'elevation.tif')], { capture: true }));
      assert.equal(cogInfo.bands[0].scale, 0.5); assert.equal(cogInfo.bands[0].offset, 10);
      if (type === 'Float32') {
        const scientific = join(dir, 'scientific');
        const scientificOptions = parseOptions({ pipeline: 'scientific', rasterPurpose: 'scientific' });
        const result = await buildScientific(input, scientific, scientificOptions, { timeoutMs: 60000 }, () => {});
        assert.equal(result.kind, 'scientific');
        const scientificInfo = JSON.parse(await run('gdalinfo', ['-json', '-checksum', join(scientific, 'scientific.tif')], { capture: true }));
        assert.equal(scientificInfo.metadata.IMAGE_STRUCTURE.LAYOUT, 'COG');
        assert.equal(scientificInfo.bands[0].type, type);
      }
    }
    const uniform = join(dir, 'uniform.asc'), tif = join(dir, 'terrain.tif');
    await writeFile(uniform, 'ncols 8\nnrows 8\nxllcorner 119.35\nyllcorner -5.2\ncellsize 0.01\nNODATA_value -9999\n' + Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => x === 0 && y === 0 ? -9999 : 100).join(' ')).join('\n'));
    await run('gdal_translate', ['-a_srs', 'EPSG:4326', '-ot', 'Float32', '-a_scale', '0.5', '-a_offset', '10', uniform, tif]);
    const options = parseOptions({ pipeline: 'elevation', elevationOutput: 'terrain-rgb', elevationUnit: 'm', heightReference: 'orthometric', terrainNoDataHeight: -100, minZoom: 5, maxZoom: 6 });
    const result = await buildElevation(tif, join(dir, 'terrain'), options, { timeoutMs: 60000 }, () => {});
    assert.equal(result.kind, 'elevation'); assert.equal(result.encoding, 'mapbox'); assert.ok(Number(result.syntheticNoDataPixels) > 0);
    const db = new Database(join(dir, 'terrain', 'terrain.mbtiles'), { readonly: true });
    try {
      const decoded = (db.prepare('SELECT tile_data FROM tiles').all() as { tile_data: Buffer }[]).flatMap(row => decodeTerrain(row.tile_data));
      assert.ok(decoded.some(value => Math.abs(value - 60) < 0.051));
      assert.ok(decoded.some(value => Math.abs(value + 100) < 0.051));
      assert.ok(decoded.every(value => Math.abs(value - 60) < 0.051 || Math.abs(value + 100) < 0.051));
    } finally { db.close(); }
    const feet = await buildElevation(tif, join(dir, 'feet'), { ...options, elevationUnit: 'ft' }, { timeoutMs: 60000 }, () => {});
    assert.equal(feet.elevationUnit, 'ft');
    const feetDb = new Database(join(dir, 'feet', 'terrain.mbtiles'), { readonly: true });
    try {
      const values = (feetDb.prepare('SELECT tile_data FROM tiles').all() as { tile_data: Buffer }[]).flatMap(row => decodeTerrain(row.tile_data));
      assert.ok(values.some(value => Math.abs(value - 60 * 0.3048) < 0.051));
    } finally { feetDb.close(); }
    await assert.rejects(buildElevation(tif, join(dir, 'bad-zoom'), { ...options, maxZoom: 22 }, {}, () => {}), /source resolution/);
    const scratchBudget = config.scratchBytes;
    try {
      config.scratchBytes = 1;
      await assert.rejects(buildElevation(tif, join(dir, 'no-space'), options, {}, () => {}), /scratch space/);
    } finally { config.scratchBytes = scratchBudget; }
    const large = join(dir, 'large.tif');
    await run('gdal_translate', ['-outsize', '1024', '1024', tif, large]);
    await buildElevation(large, join(dir, 'large'), parseOptions({ pipeline: 'elevation' }), { timeoutMs: 60000 }, () => {});
    const largeInfo = JSON.parse(await run('gdalinfo', ['-json', join(dir, 'large', 'elevation.tif')], { capture: true }));
    assert.ok(largeInfo.bands[0].overviews.length > 0);
    const controller = new AbortController(); controller.abort(new Error('cancel fixture'));
    await assert.rejects(buildElevation(tif, join(dir, 'cancel'), options, { signal: controller.signal }, () => {}), /cancel fixture/);
  } finally { config.data = previousData; await rm(dir, { recursive: true, force: true }); }
});
