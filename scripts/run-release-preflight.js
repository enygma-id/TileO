#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { atomicWrite, parseArgs, sha256File } from './lib/release-evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
let options;
try { options = parseArgs(process.argv.slice(2), { '--evidence-dir': 'required' }); }
catch (error) { console.error(error.message); process.exit(2); }
const evidence = path.resolve(options['evidence-dir']);
if (path.basename(evidence) !== `v${version}`) throw new Error(`Evidence root must end in v${version}`);
const logDir = path.join(evidence, 'tests/preflight-logs');
fs.mkdirSync(logDir, { recursive: true });
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const commands = [
  [npm, ['ci']],
  [npm, ['run', 'typecheck']],
  [npm, ['run', 'build']],
  [process.execPath, ['scripts/verify-npm-notices.js']],
  [process.execPath, ['scripts/verify-native-licenses.js']],
  [process.execPath, ['scripts/check-notice-parity.js']],
  [npm, ['test']]
];
const results = [];
for (let index = 0; index < commands.length; index++) {
  const [command, args] = commands[index];
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' && command === npm, maxBuffer: 64 * 1024 * 1024 });
  const stdout = path.join(logDir, `${String(index + 1).padStart(2, '0')}.stdout.log`);
  const stderr = path.join(logDir, `${String(index + 1).padStart(2, '0')}.stderr.log`);
  fs.writeFileSync(stdout, result.stdout ?? ''); fs.writeFileSync(stderr, result.stderr ?? '');
  results.push({ command, arguments: args, started_at: startedAt, completed_at: new Date().toISOString(), exit_code: result.status ?? 1, signal: result.signal ?? null, stdout: path.relative(evidence, stdout).replaceAll('\\', '/'), stdout_sha256: sha256File(stdout), stderr: path.relative(evidence, stderr).replaceAll('\\', '/'), stderr_sha256: sha256File(stderr) });
  if (result.status !== 0) { atomicWrite(path.join(evidence, 'tests/preflight-results.json'), JSON.stringify({ schema: 'tileo-preflight@1', status: 'FAILED', results }, null, 2) + '\n'); process.exit(result.status ?? 1); }
}
atomicWrite(path.join(evidence, 'tests/preflight-results.json'), JSON.stringify({ schema: 'tileo-preflight@1', status: 'PASSED', results }, null, 2) + '\n');
console.log('Release preflight PASSED');
