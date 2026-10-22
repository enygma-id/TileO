import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { processVectorBatches, streamVectorBatches } from '../vector-batch.js';
import { snapshotBatchConfig } from '../vector.js';
import { preflightGeoJson } from '../vector-reader.js';
import { parseOptions } from '../types.js';
import { config } from '../config.js';

test('snapshotBatchConfig honors the per-attempt execution freeze over live config', () => {
  const live = snapshotBatchConfig();
  assert.equal(live.mode, config.vectorBatchMode);
  assert.equal(live.delivery, config.vectorBatchDelivery);
  assert.deepEqual(snapshotBatchConfig({ batchMode: 'on', batchDelivery: 'stream' }), { mode: 'on', delivery: 'stream' });
  assert.deepEqual(snapshotBatchConfig({ batchMode: 'off' }), { mode: 'off', delivery: config.vectorBatchDelivery });
});

test('processVectorBatches counts normalized bytes and throttles stage updates', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'batch-summary-'));
  const origFeatures = config.vectorBatchFeatures;
  try {
    (config as any).vectorBatchFeatures = 2;
    const features = Array.from({ length: 25 }, (_, i) => ({
      type: 'Feature',
      properties: { n: i },
      geometry: { type: 'Point', coordinates: [100 + i * 0.01, -10 - i * 0.01] },
    }));
    const input = join(dir, 'source.geojson');
    await writeFile(input, JSON.stringify({ type: 'FeatureCollection', features }));
    const options = parseOptions({ minZoom: 10, maxZoom: 14 });
    const pre = await preflightGeoJson(input, options);

    const stages: string[] = [];
    const result = await processVectorBatches(input, join(dir, 'features.geojsonl'), dir, pre as any, options, {}, (stage) => { stages.push(stage); });
    assert.equal(result.featureCount, 25);
    assert.equal(result.batchCount, 13);
    assert.ok(result.bytesWritten > 0);
    // 13 batches collapse to ~1 Hz plus a final flush; counts stay exact.
    assert.ok(stages.length < result.batchCount, `expected throttled updates, got ${stages.length}`);
    assert.match(stages[stages.length - 1]!, /13\/13/);
  } finally {
    (config as any).vectorBatchFeatures = origFeatures;
    await rm(dir, { recursive: true, force: true });
  }
});

test('streamVectorBatches reports exact normalized byte counts', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'stream-summary-'));
  try {
    const features = [
      { type: 'Feature', properties: { a: 1 }, geometry: { type: 'Point', coordinates: [106.8, -6.2] } },
      { type: 'Feature', properties: { a: 2 }, geometry: { type: 'Point', coordinates: [106.9, -6.3] } },
    ];
    const input = join(dir, 'source.geojson');
    await writeFile(input, JSON.stringify({ type: 'FeatureCollection', features }));
    const options = parseOptions({ minZoom: 10, maxZoom: 14 });
    const pre = await preflightGeoJson(input, options);
    let bytes = 0;
    const sink = new Writable({ write(c, _e, cb) { bytes += Buffer.byteLength(c.toString()); cb(); } });
    const stats = { bytesSent: 0, featuresSent: 0, peakMemoryBytes: null };
    const result = await streamVectorBatches(input, sink, dir, pre as any, options, {}, () => {}, stats);
    assert.equal(result.featureCount, 2);
    assert.equal(result.bytesSent, bytes);
    assert.ok(result.bytesSent > 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
