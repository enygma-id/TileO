// Unit fixtures only: no Docker and no source/image verification claim.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { rebuildCa } from './lib/ca-rebuild.js';

test('CA output is host-owned and inputs are mounted read-only', () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'ca-owner-test-'));
  try {
    const bytes = Buffer.from('TEST FIXTURE certificate bytes\n');
    rebuildCa(work, 'ca-certificates-20261020.tar.bz2', 'test-image', (exe, args, options) => {
      assert.equal(exe, 'docker');
      assert.ok(args.includes(`type=bind,source=${work},target=/input,readonly`));
      assert.match(args.at(-1), /tar -xjf \/input\/.* -C \/tmp\/ca-rebuild/);
      assert.doesNotMatch(args.at(-1), />\s*\/input\//);
      assert.deepEqual(options.stdio, ['ignore', 'pipe', 'inherit']);
      return bytes;
    });
    const output = path.join(work, 'generated-ca-certificates.crt');
    assert.deepEqual(fs.readFileSync(output), bytes);
    if (typeof process.getuid === 'function') assert.equal(fs.statSync(output).uid, process.getuid());
  } finally { fs.rmSync(work, { recursive: true }); }
});
test('failed CA rebuild preserves its error and produces no successful output', () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'ca-failure-test-'));
  try {
    const failure = new Error('TEST FIXTURE build failed');
    assert.throws(() => rebuildCa(work, 'ca-certificates-20261020.tar.bz2', 'test-image', () => { throw failure; }), error => error === failure);
    assert.equal(fs.existsSync(path.join(work, 'generated-ca-certificates.crt')), false);
  } finally { fs.rmSync(work, { recursive: true }); }
});
test('invalid source archive names are rejected before execution', () => {
  assert.throws(() => rebuildCa('/unused', '../source;bad', 'test-image', () => assert.fail('must not execute')), /Invalid CA/);
});
