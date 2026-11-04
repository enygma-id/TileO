import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config } from '../config.js';
import { validatePublication } from '../output-validation.js';

test('publication validation distinguishes builtin checks and rejects failed or empty strict reports', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-publication-validation-'));
  const previous = config.outputValidation;
  try {
    config.outputValidation = 'builtin';
    assert.deepEqual(await validatePublication('unused', 'raster', dir, {}), { profile: 'builtin', status: 'passed' });
    config.outputValidation = 'strict';
    const report = join(dir, 'output-validation.json');
    for (const result of [
      { profile: 'strict', status: 'passed', checks: [] },
      { profile: 'strict', status: 'passed', checks: [{ name: 'test', status: 'failed' }] },
      { profile: 'builtin', status: 'passed', checks: [{ name: 'test', status: 'passed' }] },
    ]) {
      await assert.rejects(validatePublication('unused', 'raster', dir, {}, async () => { await writeFile(report, JSON.stringify(result)); return ''; }), /did not pass/);
    }
    await assert.rejects(validatePublication('unused', 'raster', dir, {}, async () => { throw new Error('validator failed'); }), /validator failed/);
    const result = { schema: 'tileo-output-validation@1', profile: 'strict', status: 'passed', checks: [{ name: 'external', status: 'passed' }] };
    assert.equal((await validatePublication('unused', 'raster', dir, {}, async () => { await writeFile(report, JSON.stringify(result)); return ''; })).profile, 'strict');
  } finally { config.outputValidation = previous; await rm(dir, { recursive: true, force: true }); }
});
