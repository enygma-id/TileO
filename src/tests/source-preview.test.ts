import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { config } from '../config.js';
import { run } from '../process.js';
import { sourcePreview } from '../source-preview.js';
import { parseOptions } from '../types.js';

test('original raster preview and vector reprojection use uploaded source values', { skip: process.env.TILEO_INTEGRATION !== '1' }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tileo-source-preview-')), previous = config.data;
  config.data = directory;
  try {
    await mkdir(join(directory, 'input')); await mkdir(join(directory, 'scratch'));
    const ppm = join(directory, 'source.ppm');
    await writeFile(ppm, Buffer.concat([Buffer.from('P6\n4 4\n255\n'), Buffer.from(Array.from({ length: 48 }, (_, i) => i % 3 === 0 ? 255 : 0))]));
    await run('gdal_translate', ['-a_srs', 'EPSG:4326', '-a_ullr', '119', '-5', '119.1', '-5.1', ppm, join(directory, 'input', 'source.tif')]);
    const job = { input: 'source.tif', options: parseOptions({}), metadata: { kind: 'raster', source: { bounds: [119, -5.1, 119.1, -5] } } };
    const raster = await sourcePreview(job, new AbortController().signal);
    assert.equal(raster.mime, 'image/png'); assert.equal(raster.data.readUInt32BE(16), 1536); assert.equal(raster.data.readUInt32BE(20), 1536);
    const png = join(directory, 'preview.png'); await writeFile(png, raster.data);
    const info = JSON.parse(await run('gdalinfo', ['-json', '-stats', png], { capture: true }));
    assert.equal(info.bands[0].minimum, 255); assert.equal(info.bands[1].maximum, 0); assert.equal(info.bands[2].maximum, 0);
    await writeFile(join(directory, 'input', 'source.geojson'), JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: { name: 'original' }, geometry: { type: 'Point', coordinates: [1113194.9079327357, 0] } }] }));
    const vector = await sourcePreview({ ...job, input: 'source.geojson', options: parseOptions({ sourceCrs: 'EPSG:3857' }), metadata: { kind: 'vector', source: { featureCount: 1 } } }, new AbortController().signal);
    const feature = JSON.parse(vector.data.toString()).features[0]; assert.equal(feature.properties.name, 'original'); assert.ok(Math.abs(feature.geometry.coordinates[0] - 10) < 1e-8);
    const largeJob = { ...job, input: 'source.geojson', options: parseOptions({ sourceCrs: 'EPSG:3857' }), metadata: { kind: 'vector', source: { featureCount: 388526 } } };
    const visible = JSON.parse((await sourcePreview(largeJob, new AbortController().signal, '9,-1,11,1')).data.toString());
    assert.equal(visible.features.length, 1); assert.equal(visible.preview.truncated, false);
    const outside = JSON.parse((await sourcePreview(largeJob, new AbortController().signal, '19,-1,21,1')).data.toString());
    assert.equal(outside.features.length, 0);
    const features = Array.from({ length: 5001 }, (_, id) => ({ type: 'Feature', properties: { id }, geometry: { type: 'Point', coordinates: [10, 0] } }));
    await writeFile(join(directory, 'input', 'dense.geojson'), JSON.stringify({ type: 'FeatureCollection', features }));
    const dense = JSON.parse((await sourcePreview({ ...largeJob, input: 'dense.geojson', options: parseOptions({}) }, new AbortController().signal, '9,-1,11,1')).data.toString());
    assert.equal(dense.features.length, 5000); assert.equal(dense.preview.truncated, true);
  } finally { config.data = previous; await rm(directory, { recursive: true, force: true }); }
});

test('source preview rejects malformed or wrapping viewport bounds before starting GDAL', async () => {
  const job = { input: 'unused', options: parseOptions({}), metadata: { kind: 'vector' } };
  for (const bbox of ['1,2,3', ',0,1,1', 'NaN,0,1,1', '-181,0,1,1', '0,-91,1,1', '10,0,9,1', '0,1,1,0']) {
    await assert.rejects(sourcePreview(job, new AbortController().signal, bbox), /Preview bbox/);
  }
  await assert.rejects(sourcePreview(job, new AbortController().signal, ['0,0,1,1'] as unknown as string), /Preview bbox/);
});
