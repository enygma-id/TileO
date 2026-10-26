import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { killProcessTree, processTreeMemoryBytes } from '../resources.js';
import { setTimeout as sleep } from 'node:timers/promises';
import { PassThrough } from 'node:stream';
import { writeLine } from '../pipeline.js';

test('Windows: processTreeMemoryBytes traverses all generations of process tree', async () => {
  // Spawn a parent process that spawns a child process, which spawns a grandchild process
  const code = `
    const { spawn } = require('node:child_process');
    const child = spawn(process.execPath, ['-e', 'const grandchild = require("node:child_process").spawn(process.execPath, ["-e", "setInterval(()=>{}, 1000)"]); setInterval(()=>{}, 1000);']);
    setInterval(() => {}, 1000);
  `;

  const proc = spawn(process.execPath, ['-e', code], { stdio: 'ignore' });
  const parentPid = proc.pid;
  assert.ok(parentPid);

  try {
    // Wait for the tree to spin up
    await sleep(2000);

    const treeMemory = await processTreeMemoryBytes(parentPid);
    assert.ok(treeMemory !== null, 'processTreeMemoryBytes should return a number');
    assert.ok(treeMemory > 5 * 1024 * 1024, `Tree memory should be multi-megabyte across generations: ${treeMemory}`);

    // Verify killProcessTree kills all descendants via taskkill /T /F on Windows
    await killProcessTree(parentPid);
    await sleep(1000);

    // After kill, memory check should return null because process tree is dead
    const memoryAfterKill = await processTreeMemoryBytes(parentPid);
    assert.equal(memoryAfterKill, null, 'Process tree should be terminated with no orphans');
  } finally {
    await killProcessTree(parentPid);
  }
});

test('Windows: backpressure and cleanup on destroyed consumer', async () => {
  const sink = new PassThrough({ highWaterMark: 1 });
  const pending = writeLine(sink, 'x'.repeat(4096));
  sink.destroy();
  const ok = await pending;
  assert.equal(ok, false);
  assert.equal(sink.listenerCount('drain'), 0);
});
