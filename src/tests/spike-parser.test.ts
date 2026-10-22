import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scanGeoJsonFeatures } from '../spike-parser.js';

test('scanGeoJsonFeatures handles single-line, escapes, attributes, and integers', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'spike-geojson-'));
  const file = join(dir, 'test.geojson');

  try {
    const geojson = {
      type: 'FeatureCollection',
      name: 'test_layer',
      features: [
        {
          type: 'Feature',
          id: 1,
          properties: { code: '00123', note: 'nested { "brackets" } and \\"escapes\\"', bigIntId: 9007199254740991 },
          geometry: { type: 'Point', coordinates: [106.8, -6.2] }
        },
        {
          type: 'Feature',
          id: 2,
          properties: { code: '00999', note: 'simple' },
          geometry: { type: 'Point', coordinates: [107.0, -6.3] }
        }
      ]
    };

    // Test 1: Single line without newlines
    await writeFile(file, JSON.stringify(geojson));
    const features: any[] = [];
    for await (const { raw, index } of scanGeoJsonFeatures(file)) {
      const parsed = JSON.parse(raw);
      assert.equal(index, features.length);
      features.push(parsed);
    }
    assert.equal(features.length, 2);
    assert.equal(features[0].properties.code, '00123');
    assert.equal(features[0].properties.note, 'nested { "brackets" } and \\"escapes\\"');
    assert.equal(features[1].properties.code, '00999');

    // Test 2: Multi-line formatted
    await writeFile(file, JSON.stringify(geojson, null, 2));
    const features2: any[] = [];
    for await (const { raw } of scanGeoJsonFeatures(file)) {
      features2.push(JSON.parse(raw));
    }
    assert.equal(features2.length, 2);
    assert.equal(features2[0].id, 1);
    assert.equal(features2[1].id, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scanGeoJsonFeatures detects oversized features', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'spike-geojson-'));
  const file = join(dir, 'large_feature.geojson');

  try {
    const largeString = 'x'.repeat(1000);
    const geojson = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { text: largeString }, geometry: { type: 'Point', coordinates: [0, 0] } }
      ]
    };
    await writeFile(file, JSON.stringify(geojson));

    // Limit to 500 bytes
    await assert.rejects(
      async () => {
        for await (const _ of scanGeoJsonFeatures(file, { maxFeatureBytes: 500 })) {
          // should throw
        }
      },
      /FEATURE_TOO_LARGE/
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scanGeoJsonFeatures maintains minimal memory footprint on large stream', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'spike-geojson-scale-'));
  const file = join(dir, 'scale.geojson');

  try {
    const featureCount = 20000;
    const writeStream = (await import('node:fs')).createWriteStream(file);
    writeStream.write('{"type":"FeatureCollection","features":[');
    for (let i = 0; i < featureCount; i++) {
      const feat = JSON.stringify({
        type: 'Feature',
        id: i,
        properties: { name: `Parcel_${i}`, value: i * 10, code: '00123' },
        geometry: { type: 'Point', coordinates: [106.8 + (i % 100) * 0.001, -6.2 + Math.floor(i / 100) * 0.001] }
      });
      writeStream.write(i === 0 ? feat : ',' + feat);
    }
    writeStream.write(']}');
    await new Promise(resolve => writeStream.end(resolve));

    const initialHeap = process.memoryUsage().heapUsed;
    let count = 0;
    for await (const { raw } of scanGeoJsonFeatures(file)) {
      count++;
    }
    const finalHeap = process.memoryUsage().heapUsed;
    const heapDiffMb = (finalHeap - initialHeap) / (1024 * 1024);

    assert.equal(count, featureCount);
    // Heap diff should stay tiny (under 25 MB) even across 20k features
    assert.ok(heapDiffMb < 25, `Heap grew too much: ${heapDiffMb.toFixed(2)} MB`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scanGeoJsonFeatures detects truncated malformed JSON at EOF', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'spike-geojson-'));
  const file = join(dir, 'broken.geojson');

  try {
    // Truncated midway
    await writeFile(file, '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{');

    await assert.rejects(
      async () => {
        for await (const _ of scanGeoJsonFeatures(file)) {
          // should throw
        }
      },
      /MALFORMED_JSON/
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
