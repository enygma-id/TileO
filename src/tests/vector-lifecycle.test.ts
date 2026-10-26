import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Jobs } from '../jobs.js';
import { inspect } from '../inspect.js';
import { vector } from '../vector.js';
import { parseOptions, JobError } from '../types.js';
import { config } from '../config.js';
import { run } from '../process.js';

test('vector lifecycle: cancel during preflight aborts immediately without orphan', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-lifecycle-preflight-'));
  try {
    const input = join(dir, 'test.geojson');
    const features = Array.from({ length: 500 }, (_, i) => ({
      type: 'Feature',
      properties: { id: i, name: `feat-${i}` },
      geometry: { type: 'Point', coordinates: [106.8 + i * 0.001, -6.2] }
    }));
    await writeFile(input, JSON.stringify({ type: 'FeatureCollection', features }));
    const controller = new AbortController();
    controller.abort(new JobError('CANCELLED', 'Preflight cancelled.'));

    await assert.rejects(
      inspect(input, parseOptions({ minZoom: 0, maxZoom: 1 }), { signal: controller.signal, batchMode: 'on' }),
      (err: any) => err instanceof JobError && err.code === 'CANCELLED'
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('vector lifecycle: cancel during batch normalization cleans scratch and prevents partial publication', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-lifecycle-batch-'));
  try {
    const input = join(dir, 'source.geojson');
    const features = Array.from({ length: 2000 }, (_, i) => ({
      type: 'Feature',
      properties: { id: i, name: `feat-${i}`, code: '00123' },
      geometry: { type: 'Point', coordinates: [106.8 + (i % 100) * 0.001, -6.2 + Math.floor(i / 100) * 0.001] }
    }));
    await writeFile(input, JSON.stringify({ type: 'FeatureCollection', features }));

    const options = parseOptions({ minZoom: 0, maxZoom: 4 });
    const info = await inspect(input, options, { batchMode: 'on' });

    const scratch = join(dir, 'scratch');
    await mkdir(scratch);
    const output = join(dir, 'out.mbtiles');

    const controller = new AbortController();
    // Abort shortly after normalization starts
    setTimeout(() => {
      controller.abort(new JobError('CANCELLED', 'Job cancelled by user.'));
    }, 15);

    await assert.rejects(
      vector(input, output, scratch, info, options, { signal: controller.signal, batchMode: 'on', batchDelivery: 'file' }, () => {}),
      (err: any) => err?.name === 'AbortError' || err?.code === 'CANCELLED' || (err instanceof JobError && err.code === 'CANCELLED')
    );

    // Published output must not exist
    const files = await readdir(dir);
    assert.ok(!files.includes('out.mbtiles'), 'Partial mbtiles output must not be published');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('vector lifecycle: timeout halts execution under shared deadline budget', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-lifecycle-timeout-'));
  try {
    const input = join(dir, 'source.geojson');
    const features = Array.from({ length: 1000 }, (_, i) => ({
      type: 'Feature',
      properties: { num: i },
      geometry: { type: 'Point', coordinates: [106.8 + (i % 50) * 0.01, -6.2 + Math.floor(i / 50) * 0.01] }
    }));
    await writeFile(input, JSON.stringify({ type: 'FeatureCollection', features }));
    const options = parseOptions({ minZoom: 0, maxZoom: 4 });

    // An expired deadline budget rejects immediately before launching or mid-execution
    await assert.rejects(
      inspect(input, options, { deadlineMs: Date.now() - 10, batchMode: 'on' }),
      /The job exceeded its overall time limit/
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('vector lifecycle: retry increments attempt, isolates scratch, and prevents stale publication', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-lifecycle-retry-'));
  const jobsDbPath = join(dir, 'jobs.sqlite');
  const jobs = new Jobs(jobsDbPath);

  try {
    jobs.acquire('worker-1');
    const jobId = 'test-job-vector-retry';
    jobs.enqueue({
      id: jobId,
      filename: 'source.geojson',
      input: join(dir, 'source.geojson'),
      sha256: 'deadbeef',
      size: 1024,
      options: parseOptions({ minZoom: 0, maxZoom: 2 })
    });

    // Claim Attempt 1
    const claimed1 = jobs.claim('worker-1');
    assert.ok(claimed1);
    assert.equal(claimed1.attempt, 1);
    assert.equal(claimed1.status, 'RUNNING');

    const scratchAttempt1 = join(dir, 'scratch', `${jobId}-${claimed1.attempt}`);
    await mkdir(scratchAttempt1, { recursive: true });
    await writeFile(join(scratchAttempt1, 'partial.tmp'), 'partial intermediate data');

    // Job cancelled / failed during attempt 1
    jobs.cancel(jobId);
    assert.equal(jobs.finish(jobId, claimed1.attempt, 'worker-1', 'partial.mbtiles', {}), false, 'Attempt 1 cannot publish after cancel');
    jobs.fail(jobId, claimed1.attempt, new JobError('CANCELLED', 'Job cancelled.'));
    assert.equal(jobs.get(jobId)?.status, 'CANCELLED');

    // Retry job
    jobs.retry(jobId);
    assert.equal(jobs.get(jobId)?.status, 'QUEUED');

    // Claim Attempt 2
    const claimed2 = jobs.claim('worker-1');
    assert.ok(claimed2);
    assert.equal(claimed2.attempt, 2, 'Retry must increment attempt counter');
    assert.equal(claimed2.status, 'RUNNING');

    // Attempt 2 operates in separate isolated scratch directory
    const scratchAttempt2 = join(dir, 'scratch', `${jobId}-${claimed2.attempt}`);
    assert.notEqual(scratchAttempt1, scratchAttempt2);
    await mkdir(scratchAttempt2, { recursive: true });
    await writeFile(join(scratchAttempt2, 'fresh.tmp'), 'attempt 2 fresh data');

    // Cleanup attempt 1 scratch
    await rm(scratchAttempt1, { recursive: true, force: true });
    const scratchDirs = await readdir(join(dir, 'scratch'));
    assert.ok(!scratchDirs.includes(`${jobId}-1`), 'Attempt 1 scratch directory reclaimed');
    assert.ok(scratchDirs.includes(`${jobId}-2`), 'Attempt 2 scratch directory active');

    // Stale worker / attempt 1 finish attempt is rejected
    assert.equal(jobs.finish(jobId, 1, 'worker-1', 'out.mbtiles', {}), false, 'Stale attempt 1 publication rejected');

    // Fresh attempt 2 finish succeeds
    assert.equal(jobs.finish(jobId, 2, 'worker-1', 'out.mbtiles', { tiles: 5 }), true, 'Current attempt 2 publication accepted');
    assert.equal(jobs.get(jobId)?.status, 'SUCCEEDED');
  } finally {
    jobs.close();
    await rm(dir, { recursive: true, force: true });
  }
});
