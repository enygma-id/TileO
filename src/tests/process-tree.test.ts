import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseProcStatus, sumProcessTree } from '../resources.js';

test('parseProcStatus reads PPid and VmRSS without page-size assumptions', () => {
  const status = [
    'Name:\tnode',
    'State:\tS (sleeping)',
    'Pid:\t4242',
    'PPid:\t100',
    'VmRSS:\t  12345 kB',
    'Threads:\t7',
  ].join('\n');
  assert.deepEqual(parseProcStatus(status), { ppid: 100, rssBytes: 12345 * 1024 });
});

test('parseProcStatus tolerates a process without VmRSS', () => {
  assert.deepEqual(parseProcStatus('Name:\tkthreadd\nPPid:\t2\n'), { ppid: 2, rssBytes: 0 });
  assert.equal(parseProcStatus('Name:\tbroken\n'), null);
});

test('sumProcessTree aggregates all generations and ignores unrelated processes', () => {
  const rows = [
    { pid: 100, ppid: 1, rssBytes: 1000 },
    { pid: 101, ppid: 100, rssBytes: 2000 },
    { pid: 102, ppid: 101, rssBytes: 3000 },
    { pid: 200, ppid: 1, rssBytes: 9000 },
  ];
  assert.equal(sumProcessTree(rows, 100), 6000);
  assert.equal(sumProcessTree(rows, 101), 5000);
  assert.equal(sumProcessTree(rows, 999), null);
});
