import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { gzipSync, inflateSync } from 'node:zlib';
import Database from 'better-sqlite3';
import { PMTiles } from 'pmtiles';
import { exportPmtiles } from '../pmtiles.js';
import { terrainPng, encodeHeight } from '../elevation.js';
import { parseOptions } from '../types.js';

test('Terrarium preserves elevation precision and PMTiles is readable across multiple leaf directories', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-distribution-'));
  const { config } = await import('../config.js'); const previous = config.data; config.data = dir;
  try {
    const heights = new Float64Array(65536).fill(123.1234); heights[0] = -32768; heights[1] = 32767.99609375;
    const png = terrainPng(heights, 'terrarium'); const chunks: Buffer[] = [];
    for (let p = 8; p < png.length;) { const n = png.readUInt32BE(p); if (png.subarray(p + 4, p + 8).toString() === 'IDAT') chunks.push(png.subarray(p + 8, p + 8 + n)); p += n + 12; }
    const decoded = inflateSync(Buffer.concat(chunks));
    for (let x = 0; x < 256; x++) { const p = 1 + x * 3; assert.ok(Math.abs(decoded[p]! * 256 + decoded[p + 1]! + decoded[p + 2]! / 256 - 32768 - heights[x]!) <= 1 / 512); }
    assert.throws(() => encodeHeight(32768, 'terrarium'), /range/);
    assert.equal(parseOptions({ pipeline: 'elevation', elevationOutput: 'terrarium', elevationUnit: 'm', heightReference: 'ellipsoid', terrainNoDataHeight: -20000 }).terrainNoDataHeight, -20000);
    assert.throws(() => parseOptions({ exportPmtiles: 'yes' }), /boolean/);
    assert.throws(() => parseOptions({ pipeline: 'elevation', exportPmtiles: true }), /requires terrain/);
    for (const format of ['png', 'pbf']) {
      const input = join(dir, `${format}.mbtiles`), db = new Database(input);
      db.exec('CREATE TABLE metadata(name TEXT,value TEXT); CREATE TABLE tiles(zoom_level INTEGER,tile_column INTEGER,tile_row INTEGER,tile_data BLOB)');
      const meta = db.prepare('INSERT INTO metadata VALUES(?,?)'); meta.run('format', format); meta.run('bounds', '-180,-85,180,85'); meta.run('json', JSON.stringify({ vector_layers: [{ id: 'features', fields: {} }] }));
      const insert = db.prepare('INSERT INTO tiles VALUES(?,?,?,?)');
      db.transaction(() => { for (let i = 0; i < 4100; i++) insert.run(7, i % 128, Math.floor(i / 128), format === 'png' ? png : i % 2 ? gzipSync(Buffer.from(`tile-${i}`)) : Buffer.from(`tile-${i}`)); })(); db.close();
      const output = join(dir, `${format}.pmtiles`); await exportPmtiles(input, output);
      const bytes = await readFile(output), archive = new PMTiles({ getKey: () => output, async getBytes(offset, length) { return { data: bytes.buffer.slice(bytes.byteOffset + offset, bytes.byteOffset + Math.min(bytes.length, offset + length)) as ArrayBuffer }; } });
      assert.equal((await archive.getHeader()).numAddressedTiles, 4100);
      for (const i of [0, 2048, 4099]) { const tile = await archive.getZxy(7, i % 128, 127 - Math.floor(i / 128)); assert.ok(tile); assert.deepEqual(Buffer.from(tile.data), format === 'png' ? png : Buffer.from(`tile-${i}`)); }
    }
  } finally { config.data = previous; await rm(dir, { recursive: true, force: true }); }
});

test('WMTS and XYZ serve identical pixels and PMTiles packages can be downloaded and deleted', async () => {
  const { config, initializeData } = await import('../config.js');
  const dir = await mkdtemp(join(tmpdir(), 'tileo-wmts-')); const previous = config.data; config.data = dir; initializeData();
  const { Jobs } = await import('../jobs.js'); const { createApp } = await import('../api.js');
  const jobs = new Jobs(), app = await createApp(jobs);
  try {
    const job = jobs.enqueue({ id: randomUUID(), filename: 'test.tif', input: 'source.tif', sha256: 'abc', size: 4, options: parseOptions({ minZoom: 0, maxZoom: 0, tileFormat: 'png', exportPmtiles: true }) });
    jobs.acquire('test'); const claimed = jobs.claim('test')!; const output = `${job.id}-${claimed.attempt}-tiles`, directory = join(dir, 'output', output); await mkdir(directory);
    const db = new Database(join(directory, 'tiles.mbtiles')); db.exec('CREATE TABLE metadata(name TEXT,value TEXT); CREATE TABLE tiles(zoom_level INTEGER,tile_column INTEGER,tile_row INTEGER,tile_data BLOB)'); db.prepare('INSERT INTO metadata VALUES(?,?)').run('format', 'png');
    const png = terrainPng(new Float64Array(65536)); db.prepare('INSERT INTO tiles VALUES(0,0,0,?)').run(png); db.close(); await exportPmtiles(join(directory, 'tiles.mbtiles'), join(directory, 'tiles.pmtiles'));
    assert.ok(jobs.finish(job.id, claimed.attempt, 'test', output, { kind: 'raster', format: 'png', bounds: [-180, -85, 180, 85] }));
    const base = `/api/jobs/${job.id}`;
    const capabilities = await app.inject(`${base}/wmts?SERVICE=WMTS&REQUEST=GetCapabilities`); assert.equal(capabilities.statusCode, 200); assert.match(capabilities.body, /WebMercatorQuad/); assert.match(capabilities.body, /559082264/);
    const parameters = new URLSearchParams({ SERVICE: 'WMTS', VERSION: '1.0.0', REQUEST: 'GetTile', LAYER: job.id, STYLE: 'default', TILEMATRIXSET: 'WebMercatorQuad', TILEMATRIX: '0', TILECOL: '0', TILEROW: '0', FORMAT: 'image/png' });
    const wmts = await app.inject(`${base}/wmts?${parameters}`), xyz = await app.inject(`${base}/tiles/0/0/0`); assert.equal(wmts.statusCode, 200); assert.deepEqual(wmts.rawPayload, xyz.rawPayload); assert.deepEqual(wmts.rawPayload, png);
    parameters.set('TILEROW', '1'); const invalid = await app.inject(`${base}/wmts?${parameters}`); assert.equal(invalid.statusCode, 400); assert.match(invalid.body, /ExceptionReport/);
    const download = await app.inject(`${base}/download?file=pmtiles`); assert.equal(download.statusCode, 200); assert.equal(download.rawPayload.subarray(0, 7).toString(), 'PMTiles');
    assert.equal((await app.inject(`${base}/download`)).rawPayload.subarray(0, 2).toString(), 'PK');
    assert.equal((await app.inject({ method: 'DELETE', url: base })).statusCode, 200); await assert.rejects(stat(directory));
  } finally { await app.close(); config.data = previous; await rm(dir, { recursive: true, force: true }); }
});
