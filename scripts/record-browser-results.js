#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { atomicWrite, inspectImage, parseArgs } from './lib/release-evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
let options;
try { options = parseArgs(process.argv.slice(2), { '--image': 'required', '--evidence-dir': 'required' }); }
catch (error) { console.error(error.message); process.exit(2); }
const evidence = path.resolve(options['evidence-dir']);
if (path.basename(evidence) !== `v${version}`) throw new Error(`Evidence root must end in v${version}`);
const out = path.join(evidence, 'tests/browser');
fs.mkdirSync(out, { recursive: true });
const image = inspectImage(options.image);
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
// Use the same GDAL directory as the browser fixture helpers (src/config.ts).
const gdalTranslate = process.env.TILEO_GDAL_BIN
  ? path.join(process.env.TILEO_GDAL_BIN, process.platform === 'win32' ? 'gdal_translate.exe' : 'gdal_translate')
  : 'gdal_translate';
const container = `tileo-browser-${Date.now()}`;
let result;
try {
  // Keep the writable test volume above the application's default 2 GiB disk reserve.
  execFileSync('docker', ['run', '-d', '--name', container, '-p', '127.0.0.1:8091:8090', '--tmpfs', '/data:rw,size=4g,uid=1000,gid=1000', '-e', 'NODE_ENV=test', '-e', 'TILEO_HOST=0.0.0.0', '-e', 'TILEO_LOCAL_PROXY=1', image.id, 'node', 'dist/start.js'], { stdio: 'pipe' });
  let healthy = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    const probe = spawnSync(process.execPath, ['-e', "fetch('http://127.0.0.1:8091/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]);
    if (probe.status === 0) { healthy = true; break; }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }
  if (!healthy) throw new Error('Candidate server did not become healthy');
  const gdalVersion = execFileSync(gdalTranslate, ['--version'], { encoding: 'utf8' }).trim();
  result = spawnSync(npx, ['playwright', 'test', '--reporter=json'], { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32', env: { ...process.env, TILEO_TEST_URL: 'http://127.0.0.1:8091' }, maxBuffer: 64 * 1024 * 1024 });
  fs.writeFileSync(path.join(out, 'browser-results.json'), result.stdout ?? '');
  fs.writeFileSync(path.join(out, 'browser.stderr.log'), result.stderr ?? '');
  let report;
  try { report = JSON.parse(result.stdout ?? ''); } catch (error) { throw new Error(`Playwright JSON report is invalid: ${error.message}`); }
  const stats = report.stats ?? {};
  const tests = [];
  const visitSuite = (suite, parents = []) => {
    const lineage = [...parents, suite.title].filter(Boolean);
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const last = test.results?.at(-1);
        tests.push({ title: [...lineage, spec.title].join(' > '), file: spec.file, expected_status: test.expectedStatus, actual_status: last?.status ?? 'not-run' });
      }
    }
    for (const child of suite.suites ?? []) visitSuite(child, lineage);
  };
  for (const suite of report.suites ?? []) visitSuite(suite);
  const skippedTests = tests.filter((test) => test.expected_status === 'skipped' || test.actual_status === 'skipped').map((test) => test.title).sort();
  const execution = { schema: 'tileo-browser-execution@1', image_id: image.id, platform: image.platform, url: 'http://127.0.0.1:8091', command: { executable: npx, arguments: ['playwright', 'test', '--reporter=json'] }, gdal_fixture_tool: gdalVersion, exit_code: result.status ?? 1, expected: stats.expected ?? 0, failed: stats.unexpected ?? 0, flaky: stats.flaky ?? 0, skipped: stats.skipped ?? 0, duration_ms: stats.duration ?? null, tests, skipped_tests: skippedTests };
  atomicWrite(path.join(out, 'execution.json'), JSON.stringify(execution, null, 2) + '\n');
  if (execution.exit_code !== 0 || execution.failed > 0 || execution.expected === 0) {
    console.error(`Browser tests FAILED: exit=${execution.exit_code}, expected=${execution.expected}, failed=${execution.failed}, flaky=${execution.flaky}, skipped=${execution.skipped}`);
    if (result.stderr) console.error(result.stderr);
    if (result.error) console.error(result.error.message);
    for (const error of report.errors ?? []) console.error(error.message ?? JSON.stringify(error));
    const printErrors = (suite) => {
      for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) {
        for (const attempt of test.results ?? []) for (const error of attempt.errors ?? []) {
          console.error(`${spec.file}: ${spec.title}: ${error.message ?? JSON.stringify(error)}`);
        }
      }
      for (const child of suite.suites ?? []) printErrors(child);
    };
    for (const suite of report.suites ?? []) printErrors(suite);
    console.error(`Raw browser evidence: ${out}`);
    process.exitCode = execution.exit_code || 1;
  }
  else console.log(`Browser tests completed: expected=${execution.expected}, skipped=${execution.skipped}, failed=${execution.failed}`);
} finally {
  const serverLogs = spawnSync('docker', ['logs', container], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  fs.writeFileSync(path.join(out, 'server.log'), `${serverLogs.stdout ?? ''}${serverLogs.stderr ?? ''}`);
  try { execFileSync('docker', ['rm', '-f', container], { stdio: 'ignore' }); } catch {}
}
