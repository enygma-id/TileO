#!/usr/bin/env node
/**
 * Run integration test suite in container and record results to TAP streams and JSON
 * Schema: tileo-integration-tests@2
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const pkgVersion = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8')).version;

const args = process.argv.slice(2);
let imageTag = null;
let outDir = path.join('release-evidence', `v${pkgVersion}`, 'tests');
let mountDist = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--image') {
    if (i + 1 >= args.length) {
      console.error('Error: --image requires an argument');
      process.exit(1);
    }
    imageTag = args[++i];
  } else if (arg === '--out-dir') {
    if (i + 1 >= args.length) {
      console.error('Error: --out-dir requires an argument');
      process.exit(1);
    }
    outDir = args[++i];
  } else if (arg === '--mount-dist') {
    mountDist = true;
  } else if (!arg.startsWith('-') && !imageTag) {
    imageTag = arg;
  } else {
    console.error(`Error: Unrecognized argument: ${arg}`);
    process.exit(1);
  }
}

const IMAGE_TAG = imageTag || ('tileo-rc:' + pkgVersion);
const OUT_DIR = path.resolve(ROOT_DIR, outDir);
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log(`Running container integration tests on ${IMAGE_TAG}...`);

let imageId = null;
try {
  imageId = execFileSync('docker', ['inspect', '--format', '{{.Id}}', IMAGE_TAG], {
    encoding: 'utf8',
  }).trim();
} catch (e) {
  console.error(`Error: Failed to inspect image ${IMAGE_TAG}: ${e.message}`);
  process.exit(1);
}

let gitCommit = 'unknown';
try {
  gitCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
} catch (e) {}

const distTestsDir = path.join(ROOT_DIR, 'dist', 'tests');
if (!fs.existsSync(distTestsDir)) {
  console.log('dist/tests not found, building project...');
  execFileSync('npm', ['run', 'build'], { cwd: ROOT_DIR, stdio: 'inherit', shell: true });
}

const testFiles = fs
  .readdirSync(distTestsDir)
  .filter((f) => f.endsWith('.test.js'))
  .sort()
  .map((f) => `dist/tests/${f}`);

console.log(`Found ${testFiles.length} test suites in dist/tests/`);

const dockerArgs = [
  'run',
  '--rm',
  '-e',
  'TILEO_INTEGRATION=1',
  '-e',
  'NODE_ENV=test',
];

if (mountDist) {
  const distPathPosix = ROOT_DIR.replace(/\\/g, '/') + '/dist';
  dockerArgs.push('-v', `${distPathPosix}:/app/dist:ro`);
}

dockerArgs.push(
  IMAGE_TAG,
  'node',
  '--test',
  '--test-reporter=tap',
  ...testFiles,
);

const env = {
  ...process.env,
  MSYS_NO_PATHCONV: '1',
};

const startTime = Date.now();
const result = spawnSync('docker', dockerArgs, {
  env,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
const durationMs = Date.now() - startTime;

const stdout = result.stdout || '';
const stderr = result.stderr || '';
const exitCode = result.status ?? 1;
const signal = result.signal || null;
const timedOut = Boolean(result.error && result.error.code === 'ETIMEDOUT');

// Write raw outputs
const tapFilePath = path.join(OUT_DIR, 'integration-tests.tap');
const stderrFilePath = path.join(OUT_DIR, 'integration-tests.stderr.log');
const exitStatusFilePath = path.join(OUT_DIR, 'exit-status.json');
const matrixFilePath = path.join(OUT_DIR, 'test-matrix.csv');
const resultsJsonFilePath = path.join(OUT_DIR, 'integration-test-results.json');

fs.writeFileSync(tapFilePath, stdout, 'utf8');
fs.writeFileSync(stderrFilePath, stderr, 'utf8');

const exitStatusData = {
  exit_code: exitCode,
  signal,
  timed_out: timedOut,
  duration_ms: durationMs,
};
fs.writeFileSync(exitStatusFilePath, JSON.stringify(exitStatusData, null, 2), 'utf8');

// Parse TAP Stream
function parseTap(tapText) {
  const lines = tapText.split(/\r?\n/);
  const tests = [];
  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    cancelled: 0,
    todo: 0,
  };

  let hasVersion = false;
  let inYaml = false;
  let currentTest = null;
  let currentFile = 'unknown';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^TAP version \d+/i.test(line)) {
      hasVersion = true;
      continue;
    }

    // Capture file context if present in Subtest
    const subtestMatch = line.match(/^# Subtest:\s+(.+)$/);
    if (subtestMatch) {
      if (subtestMatch[1].endsWith('.test.js') || subtestMatch[1].endsWith('.test.ts')) {
        currentFile = subtestMatch[1];
      }
    }

    // Summary lines from footer
    const testsSummaryMatch = line.match(/^# tests\s+(\d+)/);
    if (testsSummaryMatch) summary.total = parseInt(testsSummaryMatch[1], 10);

    const passSummaryMatch = line.match(/^# pass\s+(\d+)/);
    if (passSummaryMatch) summary.passed = parseInt(passSummaryMatch[1], 10);

    const failSummaryMatch = line.match(/^# fail\s+(\d+)/);
    if (failSummaryMatch) summary.failed = parseInt(failSummaryMatch[1], 10);

    const skipSummaryMatch = line.match(/^# skipped\s+(\d+)/);
    if (skipSummaryMatch) summary.skipped = parseInt(skipSummaryMatch[1], 10);

    const cancelSummaryMatch = line.match(/^# cancelled\s+(\d+)/);
    if (cancelSummaryMatch) summary.cancelled = parseInt(cancelSummaryMatch[1], 10);

    const todoSummaryMatch = line.match(/^# todo\s+(\d+)/);
    if (todoSummaryMatch) summary.todo = parseInt(todoSummaryMatch[1], 10);

    // Individual test point
    const pointMatch = line.match(/^(ok|not ok)\s+(\d+)\s*-\s*([^#]+?)(?:\s*#\s*(SKIP|TODO|CANCELLED)\s*(.*))?$/);
    if (pointMatch) {
      const okStatus = pointMatch[1];
      const id = parseInt(pointMatch[2], 10);
      const name = pointMatch[3].trim();
      const directive = pointMatch[4] ? pointMatch[4].toUpperCase() : null;
      const directiveReason = pointMatch[5] ? pointMatch[5].trim() : '';

      let status = 'PASS';
      if (okStatus === 'not ok') {
        status = 'FAIL';
      } else if (directive === 'SKIP') {
        status = 'SKIP';
      } else if (directive === 'TODO') {
        status = 'TODO';
      } else if (directive === 'CANCELLED') {
        status = 'CANCELLED';
      }

      currentTest = {
        id,
        file: currentFile,
        name,
        status,
        directive,
        directive_reason: directiveReason,
        duration_ms: null,
      };
      tests.push(currentTest);
      continue;
    }

    // Parse YAML diagnostics for duration_ms
    if (line.trim() === '---') {
      inYaml = true;
      continue;
    }
    if (line.trim() === '...') {
      inYaml = false;
      continue;
    }
    if (inYaml && currentTest) {
      const durationMatch = line.match(/duration_ms:\s*([\d.]+)/);
      if (durationMatch) {
        currentTest.duration_ms = parseFloat(durationMatch[1]);
      }
    }
  }

  return { hasVersion, tests, summary };
}

const tapParsed = parseTap(stdout);

// Build test-matrix.csv
const matrixHeader = 'id,file,suite,name,status,duration_ms,directive\n';
const matrixRows = tapParsed.tests.map((t) => {
  const safeName = `"${t.name.replace(/"/g, '""')}"`;
  const safeFile = `"${t.file.replace(/"/g, '""')}"`;
  const dur = t.duration_ms !== null ? t.duration_ms : '';
  const dir = t.directive || '';
  return `${t.id},${safeFile},,${safeName},${t.status},${dur},${dir}`;
});
fs.writeFileSync(matrixFilePath, matrixHeader + matrixRows.join('\n') + '\n', 'utf8');

// Build integration-test-results.json conforming to schema tileo-integration-tests@2
const allPassed =
  exitCode === 0 &&
  tapParsed.summary.passed > 0 &&
  tapParsed.summary.failed === 0 &&
  tapParsed.summary.cancelled === 0;

const resultsJsonData = {
  schema: 'tileo-integration-tests@2',
  timestamp: new Date().toISOString(),
  image_tag: IMAGE_TAG,
  image_id: imageId,
  git_commit: gitCommit,
  command: `docker ${dockerArgs.join(' ')}`,
  tap_summary: tapParsed.summary,
  exit_code: exitCode,
  passed: allPassed,
  duration_ms: durationMs,
  tests_count: tapParsed.tests.length,
  tests: tapParsed.tests,
  raw_output_tail: stdout.slice(-2000),
};

fs.writeFileSync(resultsJsonFilePath, JSON.stringify(resultsJsonData, null, 2), 'utf8');

console.log(
  `\nTest run completed in ${durationMs}ms: ${tapParsed.summary.passed} passed, ${tapParsed.summary.failed} failed, ${tapParsed.summary.skipped} skipped, ${tapParsed.summary.cancelled} cancelled.`
);
console.log(`Outputs recorded in ${OUT_DIR}:`);
console.log(`  - ${path.basename(tapFilePath)}`);
console.log(`  - ${path.basename(stderrFilePath)}`);
console.log(`  - ${path.basename(exitStatusFilePath)}`);
console.log(`  - ${path.basename(matrixFilePath)}`);
console.log(`  - ${path.basename(resultsJsonFilePath)}`);

// Fail closed validations
if (!tapParsed.hasVersion) {
  console.error('\nFAIL: Truncated or missing TAP stream (no TAP version header).');
  process.exit(1);
}

if (exitCode !== 0) {
  console.error(`\nFAIL: Container process exited with non-zero exit code: ${exitCode}`);
  process.exit(1);
}

if (tapParsed.summary.failed > 0) {
  console.error(`\nFAIL: ${tapParsed.summary.failed} tests failed.`);
  process.exit(1);
}

if (tapParsed.summary.passed === 0) {
  console.error('\nFAIL: 0 passing tests recorded.');
  process.exit(1);
}

console.log('\n✓ Container integration tests PASSED.');
