import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { preflightGeoJson, readGeoJsonBatches } from '../vector-reader.js';
import { processVectorBatches } from '../vector-batch.js';
import { inspect } from '../inspect.js';
import { parseOptions, JobError } from '../types.js';
import { config } from '../config.js';

test('preflightGeoJson extracts streaming metadata without buffering entire document', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'batch-preflight-'));
  const file = join(dir, 'sample.geojson');

  try {
    const geojson = {
      type: 'FeatureCollection',
      name: 'parcels_layer',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features: [
        {
          type: 'Feature',
          id: 101,
          properties: { NIB: '12345', KELURAHAN: 'Mariso', id: 'prop-1' },
          geometry: { type: 'Polygon', coordinates: [[[119.40, -5.15], [119.41, -5.15], [119.41, -5.14], [119.40, -5.14], [119.40, -5.15]]] },
        },
        {
          type: 'Feature',
          id: 102,
          properties: { NIB: '12346', KELURAHAN: 'Mariso', code: '0098' },
          geometry: { type: 'Polygon', coordinates: [[[119.42, -5.16], [119.43, -5.16], [119.43, -5.15], [119.42, -5.15], [119.42, -5.16]]] },
        },
      ],
    };
    await writeFile(file, JSON.stringify(geojson));

    const options = parseOptions({ minZoom: 10, maxZoom: 14 });
    const result = await preflightGeoJson(file, options);

    assert.equal(result.featureCount, 2);
    assert.equal(result.layerName, 'parcels_layer');
    assert.equal(result.crs, 'EPSG:4326');
    assert.equal(result.epsg, 'EPSG:4326');
    assert.equal(result.geometryType, 'Polygon');
    assert.ok(result.fields.includes('NIB'));
    assert.ok(result.fields.includes('KELURAHAN'));
    assert.ok(result.fields.includes('id'));
    assert.ok(result.fields.includes('code'));
    assert.equal(result.hasId, true);
    assert.equal(result.hasId2, false);

    assert.ok(result.bounds);
    assert.ok(Math.abs(result.bounds[0] - 119.40) < 0.001);
    assert.ok(Math.abs(result.bounds[1] - (-5.16)) < 0.001);
    assert.ok(Math.abs(result.bounds[2] - 119.43) < 0.001);
    assert.ok(Math.abs(result.bounds[3] - (-5.14)) < 0.001);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('preflightGeoJson rejects empty dataset and malformed GeoJSON', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'batch-errors-'));
  const emptyFile = join(dir, 'empty.geojson');
  const brokenFile = join(dir, 'broken.geojson');

  try {
    await writeFile(emptyFile, JSON.stringify({ type: 'FeatureCollection', features: [] }));
    const options = parseOptions({ minZoom: 10, maxZoom: 14 });

    await assert.rejects(
      preflightGeoJson(emptyFile, options),
      (err: any) => err instanceof JobError && err.code === 'EMPTY_DATASET'
    );

    await writeFile(brokenFile, '{"type":"FeatureCollection","features":[{"type":"Feature"');
    await assert.rejects(
      preflightGeoJson(brokenFile, options),
      (err: any) => err instanceof JobError && (err.code === 'INVALID_INPUT' || /MALFORMED_JSON/.test(err.message))
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readGeoJsonBatches enforces batch feature limit and byte threshold', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'batch-partitions-'));
  const file = join(dir, 'many.geojson');

  try {
    const features = Array.from({ length: 25 }, (_, i) => ({
      type: 'Feature',
      id: i,
      properties: { num: i, label: `feature-${i}` },
      geometry: { type: 'Point', coordinates: [100 + i * 0.01, -10 - i * 0.01] },
    }));

    await writeFile(file, JSON.stringify({ type: 'FeatureCollection', features }));

    // Limit to 10 features per batch -> 25 features should yield 3 batches (10, 10, 5)
    const batches: any[] = [];
    for await (const batch of readGeoJsonBatches(file, { batchFeatures: 10, batchBytes: 1024 * 1024, maxFeatureBytes: 1024 * 1024 })) {
      batches.push(batch);
    }

    assert.equal(batches.length, 3);
    assert.equal(batches[0].features.length, 10);
    assert.equal(batches[0].batchIndex, 0);
    assert.equal(batches[1].features.length, 10);
    assert.equal(batches[1].batchIndex, 1);
    assert.equal(batches[2].features.length, 5);
    assert.equal(batches[2].batchIndex, 2);

    // Limit to tiny byte budget (e.g. 300 bytes per batch) -> more batches
    const smallBatches: any[] = [];
    for await (const batch of readGeoJsonBatches(file, { batchFeatures: 100, batchBytes: 300, maxFeatureBytes: 1024 * 1024 })) {
      smallBatches.push(batch);
    }
    assert.ok(smallBatches.length > 5);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('processVectorBatches direct mode streams features with exact attribute filter', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'batch-direct-'));
  const input = join(dir, 'source.geojson');
  const output = join(dir, 'features.geojsonl');

  try {
    const features = [
      { type: 'Feature', properties: { keepMe: 'yes', dropMe: 'no', id: 'custom-id-1' }, geometry: { type: 'Point', coordinates: [106.8, -6.2] } },
      { type: 'Feature', properties: { keepMe: 'also', dropMe: 'bye', id: 'custom-id-2' }, geometry: { type: 'Point', coordinates: [106.9, -6.3] } },
    ];
    await writeFile(input, JSON.stringify({ type: 'FeatureCollection', features }));

    const options = parseOptions({ minZoom: 10, maxZoom: 14, includeProperties: ['keepMe', 'id'] });
    const pre = await preflightGeoJson(input, options);

    const result = await processVectorBatches(input, output, dir, pre as any, options, {}, () => {});
    assert.equal(result.featureCount, 2);

    const lines = (await readFile(output, 'utf8')).trim().split('\n').map(l => JSON.parse(l));
    assert.equal(lines.length, 2);
    assert.deepEqual(Object.keys(lines[0].properties).sort(), ['id', 'keepMe']);
    assert.equal(lines[0].properties.keepMe, 'yes');
    assert.equal(lines[0].properties.id, 'custom-id-1');
    assert.equal(lines[0].properties.dropMe, undefined);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('inspect() automatically leverages preflightGeoJson when vectorBatchMode is active', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'batch-inspect-'));
  const file = join(dir, 'test.geojson');

  try {
    await writeFile(file, JSON.stringify({
      type: 'FeatureCollection',
      name: 'batch_test',
      features: [{ type: 'Feature', properties: { alpha: 1, beta: 2 }, geometry: { type: 'Point', coordinates: [110, -7] } }],
    }));

    const origMode = config.vectorBatchMode;
    try {
      (config as any).vectorBatchMode = 'auto';
      const info = await inspect(file, parseOptions({ minZoom: 5, maxZoom: 10 }), {});
      assert.equal(info.kind, 'vector');
      assert.equal(info.featureCount, 1);
      assert.equal(info.layer, 'batch_test');
      assert.ok(info.fields?.includes('alpha'));
      assert.ok(info.allFields?.includes('beta'));

      // Test strict mode rejection for non-geojson
      (config as any).vectorBatchMode = 'on';
      await assert.rejects(
        inspect(join(dir, 'fake.gpkg'), parseOptions({}), {}),
        (err: any) => err instanceof JobError && err.code === 'UNSUPPORTED_INPUT'
      );
    } finally {
      (config as any).vectorBatchMode = origMode;
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
