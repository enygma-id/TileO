import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Writable, PassThrough } from 'node:stream';
import { setTimeout as sleep } from 'node:timers/promises';
import { runWithStdin, writeLine } from '../pipeline.js';
import { tippecanoeArgs, tippecanoeStreamArgs } from '../vector.js';
import { streamVectorBatches } from '../vector-batch.js';
import { preflightGeoJson } from '../vector-reader.js';
import { killProcessTree, processTreeMemoryBytes } from '../resources.js';
import { JobError, parseOptions } from '../types.js';
import { config } from '../config.js';

const nodeExe = process.execPath;
const DISCARD = `const input=require('node:fs').createReadStream('',{fd:0,autoClose:false});input.resume();input.on('end',()=>process.exit(0));input.on('error',()=>process.exit(0));`;

test('tippecanoeStreamArgs omits -P and keeps scratch temp dir without file operand', () => {
  const options = parseOptions({ minZoom: 5, maxZoom: 10 });
  const fileArgs = tippecanoeArgs('out.mbtiles', '/scratch/job', options);
  const streamArgs = tippecanoeStreamArgs('out.mbtiles', '/scratch/job', options);
  assert.ok(fileArgs.includes('-P'));
  assert.ok(!streamArgs.includes('-P'));
  assert.ok(streamArgs.includes('--temporary-directory') && streamArgs.includes('/scratch/job'));
  assert.ok(streamArgs.includes('-l') && streamArgs.includes('features'));
  assert.ok(streamArgs.includes('--no-progress-indicator'));
  // Caller appends no file operand: stdin is the only input.
  assert.equal(streamArgs.length, fileArgs.length - 1);
});

test('runWithStdin streams producer lines to a discarding consumer', async () => {
  const stats = await runWithStdin(nodeExe, ['-e', DISCARD], async (stdin, st) => {
    for (let i = 0; i < 100; i++) {
      const ok = await writeLine(stdin, JSON.stringify({ type: 'Feature', properties: { i }, geometry: null }), st);
      assert.equal(ok, true);
      st.featuresSent++;
    }
  }, { timeoutMs: 15000 });
  assert.equal(stats.featuresSent, 100);
  assert.ok(stats.bytesSent > 1000);
});

test('runWithStdin handles backpressure over many lines without buffering everything', async () => {
  const stats = await runWithStdin(nodeExe, ['-e', DISCARD], async (stdin, st) => {
    for (let i = 0; i < 20000; i++) {
      await writeLine(stdin, `{"type":"Feature","properties":{"i":${i}},"geometry":null}`, st);
      st.featuresSent++;
    }
  }, { timeoutMs: 30000 });
  assert.equal(stats.featuresSent, 20000);
});

test('runWithStdin surfaces producer errors instead of hiding them behind consumer exit', async () => {
  await assert.rejects(
    runWithStdin(nodeExe, ['-e', DISCARD], async () => {
      throw new JobError('INVALID_INPUT', 'FEATURE_TOO_LARGE: Feature 3 exceeds max size 16 bytes');
    }, { timeoutMs: 15000 }),
    (err: any) => err instanceof JobError && err.code === 'INVALID_INPUT' && /FEATURE_TOO_LARGE/.test(err.message),
  );
});

test('runWithStdin reports consumer failure as TOOL_FAILED when producer succeeds', async () => {
  await assert.rejects(
    runWithStdin(nodeExe, ['-e', 'process.exit(3)'], async (stdin) => {
      stdin.end();
    }, { timeoutMs: 15000 }),
    (err: any) => err instanceof JobError && err.code === 'TOOL_FAILED',
  );
});

test('runWithStdin maps missing binary to TOOL_MISSING for Density fallback', async () => {
  await assert.rejects(
    runWithStdin('__tileo-missing-tool-xyz', [], async (stdin) => { stdin.end(); }, { timeoutMs: 15000 }),
    (err: any) => err instanceof JobError && err.code === 'TOOL_MISSING',
  );
});

test('runWithStdin honors abort without deadlock or orphan stdin', async () => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(new JobError('CANCELLED', 'Job cancelled.')), 100);
  await assert.rejects(
    runWithStdin(nodeExe, ['-e', DISCARD], async (stdin, st) => {
      for (let i = 0; i < 100000; i++) {
        controller.signal.throwIfAborted();
        const ok = await writeLine(stdin, `{"n":${i}}`, st);
        if (!ok) controller.signal.throwIfAborted();
        if (i % 500 === 0) await sleep(10);
      }
    }, { signal: controller.signal, timeoutMs: 15000 }),
    (err: any) => err instanceof JobError && err.code === 'CANCELLED',
  );
});

test('writeLine returns false on a destroyed consumer instead of buffering', async () => {
  const sink = new PassThrough();
  sink.destroy();
  const ok = await writeLine(sink, '{"a":1}');
  assert.equal(ok, false);
});

test('streamVectorBatches direct mode filters attributes and leaves no intermediate file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'stream-direct-'));
  try {
    const features = Array.from({ length: 25 }, (_, i) => ({
      type: 'Feature',
      properties: { keepMe: `v${i}`, dropMe: 'x', id: `cid-${i}` },
      geometry: { type: 'Point', coordinates: [100 + i * 0.01, -10 - i * 0.01] },
    }));
    const input = join(dir, 'source.geojson');
    await writeFile(input, JSON.stringify({ type: 'FeatureCollection', features }));
    const options = parseOptions({ minZoom: 10, maxZoom: 14, includeProperties: ['keepMe', 'id'] });
    const pre = await preflightGeoJson(input, options);

    const lines: string[] = [];
    const sink = new Writable({
      write(chunk, _enc, cb) { lines.push(chunk.toString()); cb(); },
      // Small buffer to exercise drain/backpressure path.
      highWaterMark: 1024,
    });
    const result = await streamVectorBatches(input, sink, dir, pre as any, options, {}, () => {});
    assert.equal(result.featureCount, 25);
    assert.ok(result.batchCount >= 1);
    assert.equal(lines.length, 25);
    for (const line of lines) {
      const feat = JSON.parse(line);
      assert.deepEqual(Object.keys(feat.properties).sort(), ['id', 'keepMe']);
    }
    assert.equal(JSON.parse(lines[0]!).properties.keepMe, 'v0');
    const leftovers = (await readdir(dir)).filter(n => n.endsWith('.geojsonl') || n.startsWith('batch-'));
    assert.deepEqual(leftovers, []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('streamVectorBatches rejects truncated GeoJSON without writing partial output', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'stream-malformed-'));
  try {
    const input = join(dir, 'broken.geojson');
    await writeFile(input, '{"type":"FeatureCollection","features":[{"type":"Feature"');
    const options = parseOptions({ minZoom: 0, maxZoom: 2 });
    const lines: string[] = [];
    const sink = new Writable({ write(c, _e, cb) { lines.push(c.toString()); cb(); } });
    await assert.rejects(
      streamVectorBatches(input, sink, dir, { kind: 'vector', crs: 'EPSG:4326', featureCount: 1 } as any, options,
        { signal: undefined }, () => {}),
      (err: any) => err instanceof JobError && /MALFORMED_JSON/.test(err.message),
    );
    assert.equal(lines.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('streamVectorBatches enforces the single-feature byte limit', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'stream-toolarge-'));
  const origMax = config.vectorMaxFeatureMb;
  const origBatch = config.vectorBatchMb;
  try {
    (config as any).vectorMaxFeatureMb = 1;
    (config as any).vectorBatchMb = 1;
    const big = 'x'.repeat(2 * 1024 * 1024);
    const input = join(dir, 'big.geojson');
    await writeFile(input, JSON.stringify({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: { payload: big }, geometry: { type: 'Point', coordinates: [0, 0] } }],
    }));
    const options = parseOptions({ minZoom: 0, maxZoom: 2 });
    const lines: string[] = [];
    const sink = new Writable({ write(c, _e, cb) { lines.push(c.toString()); cb(); } });
    await assert.rejects(
      streamVectorBatches(input, sink, dir, { kind: 'vector', crs: 'EPSG:4326', featureCount: 1 } as any, options,
        { signal: undefined }, () => {}),
      (err: any) => err instanceof JobError && /FEATURE_TOO_LARGE/.test(err.message),
    );
    assert.equal(lines.length, 0);
  } finally {
    (config as any).vectorMaxFeatureMb = origMax;
    (config as any).vectorBatchMb = origBatch;
    await rm(dir, { recursive: true, force: true });
  }
});

test('resources helpers handle missing pids and sample the current process', async () => {
  await killProcessTree(undefined);
  assert.equal(await processTreeMemoryBytes(undefined), null);
  assert.equal(await processTreeMemoryBytes(999999999), null);
  const bytes = await processTreeMemoryBytes(process.pid);
  assert.ok(bytes === null || (typeof bytes === 'number' && bytes > 0));
});
