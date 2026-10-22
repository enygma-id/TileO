import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';
import { parseOptions } from '../types.js';

test('completion estimate follows the measured progress rate', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-eta-'));
  process.env.TILEO_DATA_DIR = dir; process.env.TILEO_DISK_RESERVE_MB = '0';
  const { Jobs } = await import('../jobs.js');
  const jobs = new Jobs();
  const samples = () => (jobs.db.prepare('SELECT count(*) AS n FROM progress_samples WHERE job=?').get('eta-job') as { n: number }).n;
  try {
    jobs.enqueue({ id: 'eta-job', filename: 'x.tif', input: 'x.tif', sha256: 'h', size: 1, options: parseOptions({}) });
    jobs.acquire('w');
    const claimed = jobs.claim('w')!;
    assert.equal(claimed.status, 'RUNNING');
    assert.ok(claimed.started);
    // No movement yet: elapsed is known, remaining is honestly unknown.
    const fresh = jobs.estimate('eta-job')!;
    assert.ok(fresh.elapsedMs >= 0); assert.equal(fresh.remainingMs, null);
    assert.equal(jobs.estimate('missing'), undefined);
    jobs.update('eta-job', 'Working', 10);
    await sleep(60);
    jobs.update('eta-job', 'Working', 20);
    const moving = jobs.estimate('eta-job')!;
    assert.ok(Number.isFinite(moving.remainingMs!) && moving.remainingMs! >= 0);
    assert.ok(moving.elapsedMs >= 0);
    // Repeating the same progress adds no sample.
    const before = samples();
    jobs.update('eta-job', 'Working', 20);
    assert.equal(samples(), before);
    // The API exposes the estimate on job payloads.
    const { createApp } = await import('../api.js');
    const app = await createApp(jobs);
    try {
      const res = await app.inject('/api/jobs/eta-job');
      assert.equal(res.statusCode, 200);
      const body = res.json();
      assert.ok(typeof body.elapsedMs === 'number' && typeof body.remainingMs === 'number');
      assert.equal(body.input, undefined);
      const queued = await app.inject('/api/jobs');
      assert.equal(queued.statusCode, 200);
      assert.ok(typeof queued.json()[0].elapsedMs === 'number');
      assert.equal(jobs.finish('eta-job', claimed.attempt, 'w', 'x.mbtiles', {}), true);
      assert.equal(jobs.estimate('eta-job'), undefined);
      assert.equal(samples(), 0);
    } finally { await app.close(); }
  } finally { try { jobs.close(); } catch { /* already closed with the app */ } await rm(dir, { recursive: true, force: true }); }
});
