import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Jobs } from '../jobs.js';
import { parseOptions } from '../types.js';
import { run } from '../process.js';

test('options reject unsafe or inconsistent input', () => {
  assert.throws(() => parseOptions({ minZoom: 10, maxZoom: 3 }));
  assert.throws(() => parseOptions({ maxZoom: 23 }));
  assert.throws(() => parseOptions({ sourceCrs: 'EPSG:4326; whoami' }));
  assert.throws(() => parseOptions({ layer: '-sql' }));
  assert.throws(() => parseOptions({ command: 'anything' }));
  assert.equal(parseOptions({}).sourceCrs, null);
});
test('queue persists; claim is exclusive; cancellation fences publication; interruption can retry', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tileo-queue-'));
  let jobs = new Jobs(join(dir, 'jobs.sqlite'));
  try {
    jobs.enqueue({ id: 'one', filename: 'one.tif', input: 'one.tif', sha256: 'hash', size: 1, options: parseOptions({}) });
    jobs.close(); jobs = new Jobs(join(dir, 'jobs.sqlite'));
    jobs.acquire('worker-a'); assert.throws(() => jobs.acquire('worker-b'));
    assert.equal(jobs.claim('worker-a')?.attempt, 1); assert.equal(jobs.claim('worker-a'), undefined);
    jobs.cancel('one'); assert.equal(jobs.finish('one', 1, 'worker-a', 'one.mbtiles', {}), false);
    jobs.fail('one', 1, new Error('cancelled')); assert.equal(jobs.get('one')?.status, 'CANCELLED');
    jobs.retry('one'); jobs.claim('worker-a');
    jobs.db.prepare('UPDATE runtime SET heartbeat=0').run(); jobs.acquire('worker-b');
    assert.equal(jobs.get('one')?.code, 'WORKER_INTERRUPTED');
    assert.equal(jobs.get('one')?.status, 'FAILED');
    jobs.retry('one'); const claimed = jobs.claim('worker-b')!;
    assert.equal(jobs.finish('one', claimed.attempt, 'worker-a', 'bad', {}), false);
    assert.equal(jobs.finish('one', claimed.attempt, 'worker-b', 'good.mbtiles', { tileCount: 1 }), true);
    await jobs.db.backup(join(dir, 'backup.sqlite'));
    const restored = new Jobs(join(dir, 'backup.sqlite'));
    try { assert.equal(restored.get('one')?.status, 'SUCCEEDED'); } finally { restored.close(); }
    jobs.remove('one'); assert.equal(jobs.get('one'), undefined);
  } finally { jobs.close(); rmSync(dir, { recursive: true, force: true }); }
});
test('job source descriptors remain compatible and survive retry', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tileo-source-'));
  const jobs = new Jobs(join(dir, 'jobs.sqlite'));
  try {
    const local = jobs.enqueue({ id: 'local', filename: 'local.tif', input: 'local.tif', sha256: 'abc', size: 3, options: parseOptions({}) });
    assert.deepEqual(local.source, { kind: 'local', input: 'local.tif', filename: 'local.tif', size: 3, sha256: 'abc' });
    const source = { kind: 's3' as const, connectionId: 'archive', bucket: 'gis-data', key: 'cog/source.tif', readMode: 'stage' as const, size: 8, etag: 'etag', rangeSupported: true, cog: true };
    jobs.enqueue({ id: 'remote', filename: 'source.tif', input: '', sha256: '', size: 8, options: parseOptions({}), source });
    jobs.cancel('remote');
    jobs.retry('remote');
    assert.deepEqual(jobs.get('remote')?.source, source);
  } finally { jobs.close(); rmSync(dir, { recursive: true, force: true }); }
});
test('native runner drains large stderr and reports exit errors', async () => {
  const value = await run(process.execPath, ['-e', "const fs=require('node:fs');fs.writeFileSync(2,'x'.repeat(500000));fs.writeFileSync(1,'done')"], { capture: true });
  assert.equal(value, 'done');
  await assert.rejects(run(process.execPath, ['-e', "require('node:fs').writeFileSync(2,'fixture failure');process.exit(3)"]), /fixture failure/);
});
test('native runner terminates a tool on timeout', async () => {
  const start = Date.now();
  await assert.rejects(run(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { timeoutMs: 500 }), /deadline/);
  assert.ok(Date.now() - start < 10000);
});

test('native runner terminates a tool on cancellation', async () => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('cancel check')), 100);
  try { await assert.rejects(run(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { signal: controller.signal, timeoutMs: 10000 }), /cancel check/); }
  finally { clearTimeout(timer); }
});
