import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { PassThrough } from 'node:stream';
import { scanGeoJsonFeatures, scanGeoJsonlFeatures, preflightGeoJson } from '../vector-reader.js';
import { processVectorBatches } from '../vector-batch.js';
import { runWithStdin, writeLine } from '../pipeline.js';
import { filterFeature } from '../json-stream.js';
import { parseOptions, JobError } from '../types.js';
import { run } from '../process.js';
import { setTimeout as sleep } from 'node:timers/promises';
import { spawn } from 'node:child_process';

const feature = '{"type":"Feature","id":9007199254740993,"properties":{"id":9007199254740993,"code":"00123","drop":1},"geometry":{"type":"Point","coordinates":[106.8,-6.2]}}';
test('audit: scanner rejects invalid root grammar and trailing input', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'batch-audit-json-'));
  try {
    const path = join(dir, 'test.geojson');
    for (const raw of [
      `{"type":"FeatureCollection","features":[${feature}${feature}]}`,
      `{"type":"FeatureCollection","features":[${feature},]}`,
      `{"type":"FeatureCollection","features":[${feature}]} garbage`,
      `{"type":"NotGeoJSON","features":[${feature}]}`,
      `{"type":"FeatureCollection","features":[${feature}] "other":2}`,
      `{"type":"FeatureCollection","features":[null]}`,
      `{"type":"FeatureCollection","features":[],"features":[]}`,
    ]) {
      await writeFile(path, raw);
      await assert.rejects(async () => { for await (const _ of scanGeoJsonFeatures(path)) { /* consume entire document */ } }, /MALFORMED_JSON/);
    }
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('audit: pretty input, chunk-spanning UTF-8, late CRS and exact integer filtering', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'batch-audit-values-'));
  try {
    const path = join(dir, 'test.geojson');
    const padded = feature.replace('"drop":1', `"drop":"${'x'.repeat(65400)}雪\\\"{}"`);
    await writeFile(path, `{"type":"FeatureCollection","features":[${padded}],"name":"late","crs":{"type":"name","properties":{"name":"EPSG:4326"}}}`);
    const info = await preflightGeoJson(path, parseOptions({}));
    assert.equal(info.layerName, 'late'); assert.equal(info.epsg, 'EPSG:4326');
    const filtered = filterFeature(padded, ['id', 'code']);
    assert.match(filtered, /"id":9007199254740993/);
    assert.match(filtered, /"code":"00123"/); assert.doesNotMatch(filtered, /drop/);
    await writeFile(path, `{"type":"FeatureCollection","features":[${feature}],"crs":{"type":"name","properties":{"name":"EPSG:14326"}}}`);
    assert.equal((await preflightGeoJson(path, parseOptions({}))).epsg, 'EPSG:14326');
    await writeFile(path, `{"type":"FeatureCollection","features":[${feature}],"crs":{"type":"name","properties":{"name":"unknown:4326-other"}}}`);
    assert.equal((await preflightGeoJson(path, parseOptions({}))).epsg, null);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('audit: GeoJSONL checks length and depth before parsing unbounded records', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'batch-audit-lines-'));
  try {
    const path = join(dir, 'test.geojsonl');
    await writeFile(path, feature.repeat(100));
    await assert.rejects(async () => { for await (const _ of scanGeoJsonlFeatures(path, { maxFeatureBytes: 512 })) {} }, /FEATURE_TOO_LARGE/);
    await writeFile(path, feature.replace('"drop":1', `"drop":${'['.repeat(70)}1${']'.repeat(70)}`));
    await assert.rejects(async () => { for await (const _ of scanGeoJsonlFeatures(path)) {} }, /JSON_DEPTH_LIMIT/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('audit: file batching preserves integer tokens and produces one record per feature', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'batch-audit-file-'));
  try {
    const path = join(dir, 'test.geojson'), output = join(dir, 'out.geojsonl');
    await writeFile(path, `{"type":"FeatureCollection","features":[\n${feature}\n]}`);
    await processVectorBatches(path, output, dir, { kind: 'vector', crs: 'EPSG:4326', epsg: 'EPSG:4326', featureCount: 1 }, parseOptions({ includeProperties: ['id', 'code'] }), {}, () => {});
    assert.equal((await readFile(output, 'utf8')).trim().split('\n').length, 1);
    assert.match(await readFile(output, 'utf8'), /9007199254740993/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('audit: closed backpressure consumer settles and removes listeners', async () => {
  const sink = new PassThrough({ highWaterMark: 1 });
  const pending = writeLine(sink, 'x'.repeat(1024));
  sink.destroy(); assert.equal(await pending, false);
  assert.equal(sink.listenerCount('drain'), 0);
});
test('audit: producer failure terminates a consumer ignoring EOF and SIGTERM', { timeout: 10000 }, async () => {
  const start = Date.now();
  await assert.rejects(runWithStdin(process.execPath, ['-e', "process.on('SIGTERM',()=>{});process.stdin.resume();setInterval(()=>{},1000)"],
    async () => { await sleep(150); throw new JobError('INVALID_INPUT', 'producer failure'); }, { timeoutMs: 8000 }), /producer failure/);
  assert.ok(Date.now() - start < 7000);
});
test('audit: guardian kills a streaming tool when its worker is killed', { timeout: 12000 }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'batch-audit-orphan-'));
  const marker = join(dir, 'tool.pid');
  const pipelineModule = new URL('../pipeline.js', import.meta.url).href;
  const childCode = `require('node:fs').writeFileSync(${JSON.stringify(marker)},String(process.pid));setInterval(()=>{},1000)`;
  const workerCode = `import {runWithStdin} from ${JSON.stringify(pipelineModule)};await runWithStdin(process.execPath,['-e',${JSON.stringify(childCode)}],async(_stdin,_stats,signal)=>{await new Promise(resolve=>signal.addEventListener('abort',resolve,{once:true}));},{timeoutMs:10000});`;
  const worker = spawn(process.execPath, ['--input-type=module', '-e', workerCode], { stdio: 'ignore' });
  let toolPid: number | undefined;
  try {
    for (let i = 0; i < 100; i++) {
      const pid = await readFile(marker, 'utf8').catch(() => '');
      if (pid) { toolPid = Number(pid); break; } await sleep(25);
    }
    assert.ok(toolPid, 'tool must start before killing its worker');
    const closed = new Promise(resolve => worker.once('close', resolve));
    worker.kill('SIGKILL'); await closed;
    let alive = true;
    for (let i = 0; i < 160; i++) {
      try { process.kill(toolPid!, 0); } catch { alive = false; break; }
      await sleep(25);
    }
    assert.equal(alive, false, 'native tool must not outlive worker IPC');
  } finally {
    worker.kill('SIGKILL');
    if (toolPid) { try { process.kill(toolPid, 'SIGKILL'); } catch {} }
    await rm(dir, { recursive: true, force: true });
  }
});
test('audit: runner uses remaining absolute deadline', async () => {
  await assert.rejects(run(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { deadlineMs: Date.now() - 1 }), /overall time/);
});
test('audit: file output errors are caught instead of emitting an uncaught error', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'batch-audit-output-'));
  try {
    const path = join(dir, 'test.geojson');
    await writeFile(path, `{"type":"FeatureCollection","features":[${feature}]}`);
    await assert.rejects(processVectorBatches(path, join(dir, 'missing', 'out.geojsonl'), dir,
      { kind: 'vector', crs: 'EPSG:4326', epsg: 'EPSG:4326', featureCount: 1 }, parseOptions({}), {}, () => {}));
  } finally { await rm(dir, { recursive: true, force: true }); }
});
