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
let imageTag = null;
let outDir = 'artifacts/compliance';
let mountDist = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--image' && i + 1 < args.length) {
    imageTag = args[++i];
  } else if (args[i] === '--out-dir' && i + 1 < args.length) {
    outDir = args[++i];
  } else if (args[i] === '--mount-dist') {
    mountDist = true;
  } else if (!args[i].startsWith('--') && !imageTag) {
    imageTag = args[i];
  }
}

const IMAGE_TAG = imageTag || 'tileo-ts:local';
const OUT_DIR = path.resolve(ROOT_DIR, outDir);
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}
const OUT_FILE = path.join(OUT_DIR, 'integration-test-results.json');

console.log(`Running container integration tests on ${IMAGE_TAG}...`);

let imageId = 'unknown';
try {
  imageId = execFileSync('docker', ['inspect', '--format', '{{.Id}}', IMAGE_TAG], { encoding: 'utf8' }).trim();
} catch (e) {
  console.warn(`Warning: Could not inspect image ${IMAGE_TAG}: ${e.message}`);
}

let gitCommit = 'unknown';
try {
  gitCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
} catch (e) {}

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

const dockerArgs = [
  'run', '--rm',
  '-e', 'TILEO_INTEGRATION=1',
  '-e', 'NODE_ENV=test'
];

if (mountDist) {
  const distPathPosix = ROOT_DIR.replace(/\\/g, '/') + '/dist';
  dockerArgs.push('-v', `${distPathPosix}:/app/dist:ro`);
}

dockerArgs.push(
  IMAGE_TAG,
  'node', '--test',
  ...testFiles
);

const start = Date.now();
let testOutput = '';
let exitCode = 0;

try {
  testOutput = execFileSync('docker', dockerArgs, { env, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
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
  image_id: imageId,
  git_commit: gitCommit,
  command: `docker ${dockerArgs.join(' ')}`,
  total_tests: passed + failed + skipped,
  passed,
  failed,
  skipped,
  duration_ms: durationMs,
  all_passed: failed === 0 && passed > 0,
  tests_count: tests.length,
  tests,
  raw_output_tail: testOutput.slice(-2000)
};

fs.writeFileSync(OUT_FILE, JSON.stringify(summary, null, 2), 'utf8');
console.log(`Results written to ${OUT_FILE}: ${passed} passed, ${failed} failed, ${skipped} skipped (total ${tests.length}) in ${durationMs}ms`);

if (failed > 0 || passed === 0 || exitCode !== 0) {
  console.error(`Integration tests FAILED or produced 0 passing tests. Exit code: ${exitCode}`);
  process.exit(1);
}
