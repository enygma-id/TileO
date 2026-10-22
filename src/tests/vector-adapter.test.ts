import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readdir, rm, readFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pipeline } from 'node:stream/promises';
import { ZipFile } from 'yazl';
import { run } from '../process.js';
import { inspect } from '../inspect.js';
import { vector } from '../vector.js';
import { processVectorBatches } from '../vector-batch.js';
import { parseOptions } from '../types.js';
import { vectorAdapter } from '../vector-adapter.js';
import { config } from '../config.js';

const enabled = process.env.TILEO_INTEGRATION === '1';
test('adapter selection requires the actual GDAL driver, including ZIP contents', () => {
  assert.equal(vectorAdapter('x.gpkg', { driver: 'GPKG' } as any), 'ogr-sequential');
  assert.equal(vectorAdapter('x.fgb', { driver: 'FlatGeobuf' } as any), 'ogr-sequential');
  assert.equal(vectorAdapter('/vsizip/x.zip', { driver: 'ESRI Shapefile' } as any), 'ogr-sequential');
  assert.equal(vectorAdapter('/vsizip/x.zip', { driver: 'GeoJSON' } as any), 'legacy');
  assert.equal(vectorAdapter('x.gpkg', { driver: 'SQLite' } as any), 'legacy');
  assert.equal(vectorAdapter('x.kml', { driver: 'LIBKML' } as any), 'legacy');
});

for (const format of ['GPKG', 'FlatGeobuf', 'ESRI Shapefile', 'LIBKML']) {
  test(`real adapter: ${format}, one normalization, file/stream, exact attributes and selected layer`, { skip: !enabled, timeout: 60000 }, async () => {
    const dir = await mkdtemp(join(tmpdir(), 'tileo-adapter-'));
    const originalBatchSize = config.vectorBatchFeatures;
    config.vectorBatchFeatures = 3;
    try {
      const features = Array.from({ length: 12 }, (_, i) => ({ type: 'Feature', id: 700 + i,
        properties: { code: `00${i}`, value: i, id: `key-${i}` }, geometry: { type: 'Point', coordinates: [106.7 + i * 0.01, -6.2] } }));
      const source = join(dir, 'source.geojson');
      await writeFile(source, JSON.stringify({ type: 'FeatureCollection', features }));
      let input = join(dir, format === 'GPKG' ? 'source.gpkg' : format === 'FlatGeobuf' ? 'source.fgb' : format === 'LIBKML' ? 'source.kml' : 'shapes');
      await run('ogr2ogr', ['-f', format, '-nln', 'parcels', ...(format === 'LIBKML' ? [] : ['-t_srs', 'EPSG:3857']), input, source]);
      if (format === 'ESRI Shapefile') {
        const zipPath = join(dir, 'source.zip');
        const zip = new ZipFile();
        for (const name of await readdir(input)) zip.addFile(join(input, name), name);
        zip.end(); await pipeline(zip.outputStream, createWriteStream(zipPath));
        input = `/vsizip/${zipPath}`;
      }
      const options = parseOptions({ minZoom: 0, maxZoom: 0, vectorPreset: 'preserve', vectorEngine: 'tippecanoe' });
      const legacyInfo = await inspect(input, options, { batchMode: 'off' });
      assert.equal(legacyInfo.featureCount, 12);
      if (format === 'LIBKML') {
        await assert.rejects(inspect(input, options, { batchMode: 'on' }), /KML/);
        const scratch = join(dir, 'legacy'); await mkdir(scratch);
        const summary = await vector(input, join(scratch, 'out.mbtiles'), scratch, legacyInfo, options, { batchMode: 'auto' }, () => {});
        assert.equal(summary.active, false); assert.match(summary.fallback!, /legacy:unqualified-driver/);
        return;
      }
      const info = await inspect(input, options, { batchMode: 'on' });
      assert.equal(vectorAdapter(input, info), 'ogr-sequential');
      const decoded: any[] = [];
      for (const delivery of ['file', 'stream'] as const) {
        const scratch = join(dir, delivery); await mkdir(scratch);
        const output = join(scratch, 'out.mbtiles'), log = join(scratch, 'tool.log');
        const summary = await vector(input, output, scratch, info, options,
          { batchMode: 'on', batchDelivery: delivery, timeoutMs: 30000, log }, () => {});
        assert.equal(summary.active, true); assert.equal(summary.stream, delivery === 'stream');
        assert.equal(summary.featureCount, 12); assert.equal(summary.batchCount, 4);
        const text = await readFile(log, 'utf8');
        assert.equal((text.match(/\["ogr2ogr"/g) ?? []).length, 1, 'one source scan regardless of batch count');
        assert.equal((text.match(/\["tippecanoe"/g) ?? []).length, 1);
        if (delivery === 'stream') assert.ok(!(await readdir(scratch)).includes('features.geojsonl'));
        const tile = JSON.parse(await run('tippecanoe-decode', [output, '0', '0', '0'], { capture: true }));
        const values = tile.features.flatMap((layer: any) => layer.features).map((f: any) => f.properties).sort((a: any, b: any) => a.code.localeCompare(b.code));
        assert.equal(values.length, 12);
        assert.deepEqual(values.map((v: any) => v.code), features.map(f => f.properties.code).sort());
        for (const item of values) assert.equal(item.id, `key-${Number(item.code)}`);
        decoded.push(values);
      }
      assert.deepEqual(decoded[0], decoded[1]);
      if (format === 'GPKG') {
        await run('ogr2ogr', ['-update', '-nln', 'other', input, source]);
        await assert.rejects(inspect(input, options, { batchMode: 'on' }), /Select one input layer/);
        const chosen = parseOptions({ ...options, layer: 'other' });
        assert.equal((await inspect(input, chosen, { batchMode: 'on' })).layer, 'other');
      }
    } finally { config.vectorBatchFeatures = originalBatchSize; await rm(dir, { recursive: true, force: true }); }
  });
}

test('real adapter: projected GeoJSON keeps source IDs, late fields and mixed types across batches', { skip: !enabled }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-projected-batch-'));
  const original = config.vectorBatchFeatures; config.vectorBatchFeatures = 1;
  try {
    const input = join(dir, 'source.geojson'), output = join(dir, 'out.geojsonl');
    const raw = '{"type":"Feature","id":9007199254740993,"properties":{"id":9007199254740993,"id2":"separate","mixed":"00123"},"geometry":{"type":"Point","coordinates":[11889551,-691490]}}';
    await writeFile(input, `{"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"EPSG:3857"}},"features":[${raw},${raw.replace('"mixed":"00123"', '"mixed":7,"late":true')}]}`);
    const options = parseOptions({ minZoom: 0, maxZoom: 0 });
    const info = await inspect(input, options, { batchMode: 'on' });
    await processVectorBatches(input, output, dir, info, options, { timeoutMs: 30000 }, () => {});
    const result = (await readFile(output, 'utf8')).trim().split('\n');
    assert.equal(result.length, 2);
    for (const line of result) { assert.match(line, /"id":9007199254740993/); assert.match(line, /"id2":"separate"/); }
    assert.equal(JSON.parse(result[0]!).properties.mixed, '00123');
    assert.equal(JSON.parse(result[1]!).properties.mixed, 7);
    assert.equal(JSON.parse(result[1]!).properties.late, true);
    assert.ok(Math.abs(JSON.parse(result[0]!).geometry.coordinates[0] - 106.8) < 0.01);
  } finally { config.vectorBatchFeatures = original; await rm(dir, { recursive: true, force: true }); }
});
