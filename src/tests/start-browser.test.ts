import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBrowserCommand } from '../start.js';

test('getBrowserCommand returns correct platform command', () => {
  assert.equal(getBrowserCommand('http://localhost:8090', 'win32'), 'start "" "http://localhost:8090"');
  assert.equal(getBrowserCommand('http://localhost:8090', 'darwin'), 'open "http://localhost:8090"');
  assert.equal(getBrowserCommand('http://localhost:8090', 'linux'), 'xdg-open "http://localhost:8090"');
});
