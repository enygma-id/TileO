#!/usr/bin/env node
/**
 * Run integration test suite in container and record results to integration-test-results.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
function getArg(name, defaultValue) {
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return defaultValue;
}

const IMAGE_TAG = args.find(a => !a.startsWith('--')) || 'tileo-ts:local';
const OUT_DIR = path.resolve(ROOT_DIR, getArg('out-dir', 'artifacts/compliance'));
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}
const OUT_FILE = path.join(OUT_DIR, 'integration-test-results.json');

console.log(`Running container integration tests on ${IMAGE_TAG}...`);

const distPathPosix = ROOT_DIR.replace(/\\/g, '/') + '/dist';
const env = {
  ...process.env,
  MSYS_NO_PATHCONV: '1'
};

const distTestsDir = path.join(ROOT_DIR, 'dist', 'tests');
if (!fs.existsSync(distTestsDir)) {
  console.log('dist/tests not found, building project...');
  execFileSync('npm', ['run', 'build'], { cwd: ROOT_DIR, stdio: 'inherit', shell: true });
}

const testFiles = fs.readdirSync(distTestsDir)
  .filter(f => f.endsWith('.test.js'))
  .sort()
  .map(f => `dist/tests/${f}`);

console.log(`Found ${testFiles.length} test suites in dist/tests/`);

const args = [
  'run', '--rm',
  '-e', 'TILEO_INTEGRATION=1',
  '-e', 'NODE_ENV=test',
  '-v', `${distPathPosix}:/app/dist:ro`,
  IMAGE_TAG,
  'node', '--test',
  ...testFiles
];

const start = Date.now();
let testOutput = '';
let exitCode = 0;

try {
  testOutput = execFileSync('docker', args, { env, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
} catch (err) {
  exitCode = err.status || 1;
  testOutput = (err.stdout || '') + (err.stderr || '');
}

const durationMs = Date.now() - start;

// Parse standard Node.js test runner output
const lines = testOutput.split('\n');
const tests = [];
let passed = 0;
let failed = 0;
let skipped = 0;

for (const line of lines) {
  const checkMatch = line.match(/^([✔✖ℹ\-\?])\s+(.+?)(?:\s+\(([\d\.]+(?:ms|s))\))?$/);
  if (checkMatch) {
    const symbol = checkMatch[1];
    const name = checkMatch[2].trim();
    const duration = checkMatch[3] || null;

    if (symbol === '✔') {
      passed++;
      tests.push({ name, status: 'PASS', duration });
    } else if (symbol === '✖') {
      failed++;
      tests.push({ name, status: 'FAIL', duration });
    } else if (symbol === '-') {
      skipped++;
      tests.push({ name, status: 'SKIP', duration });
    }
  }
}

// Fallback to summary counts if available
const passMatch = testOutput.match(/ℹ pass (\d+)/);
const failMatch = testOutput.match(/ℹ fail (\d+)/);
const skipMatch = testOutput.match(/ℹ skipped (\d+)/);
if (passMatch) passed = parseInt(passMatch[1], 10);
if (failMatch) failed = parseInt(failMatch[1], 10);
if (skipMatch) skipped = parseInt(skipMatch[1], 10);

const summary = {
  timestamp: new Date().toISOString(),
  target_image: IMAGE_TAG,
  total_tests: passed + failed + skipped,
  passed,
  failed,
  skipped,
  duration_ms: durationMs,
  all_passed: failed === 0 && (passed + failed + skipped) > 0,
  tests
};

fs.writeFileSync(OUT_FILE, JSON.stringify(summary, null, 2), 'utf8');
console.log(`Results written to ${OUT_FILE}: ${passed} passed, ${failed} failed, ${skipped} skipped (total ${tests.length}) in ${durationMs}ms`);

if (failed > 0 || tests.length === 0) {
  process.exit(1);
}
