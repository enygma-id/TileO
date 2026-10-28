#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { atomicWrite, inspectImage, listFiles, parseArgs, readJson, relativeSafe, sha256File, TAR_EXECUTABLE } from './lib/release-evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
let options;
try { options = parseArgs(process.argv.slice(2), { '--image': 'required', '--evidence-dir': 'required' }); }
catch (error) { console.error(error.message); process.exit(2); }
const evidence = path.resolve(options['evidence-dir']);
if (path.basename(evidence) !== `v${version}`) throw new Error(`Evidence root must end in v${version}`);
const image = inspectImage(options.image);
const gateDir = path.join(evidence, 'gate');
fs.mkdirSync(gateDir, { recursive: true });
const jsonOutput = path.join(gateDir, 'negative-controls.json');
const logOutput = path.join(gateDir, 'release-gate-negative-tests.log');
const mutableOutputs = new Set([jsonOutput, logOutput].map(path.resolve));
const results = [];
const logs = [];

function log(message) { logs.push(message); console.log(message); }
function flush() {
  atomicWrite(jsonOutput, JSON.stringify({ schema: 'tileo-negative-controls@1', version, candidate_image_id: image.id, status: results.some((item) => item.status === 'FAIL') ? 'FAILED' : results.some((item) => item.status === 'PENDING_HUMAN_DRY_RUN') ? 'TECHNICAL_CONTROLS_PASSED_HUMAN_DRY_RUN_PENDING' : 'PASSED', passed: results.filter((item) => item.status === 'PASS').length, pending: results.filter((item) => item.status === 'PENDING_HUMAN_DRY_RUN').length, failed: results.filter((item) => item.status === 'FAIL').length, controls: results }, null, 2) + '\n');
  atomicWrite(logOutput, logs.join('\n') + '\n');
}
function cloneTree(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name), to = path.join(destination, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Baseline contains forbidden symlink: ${from}`);
    if (entry.isDirectory()) cloneTree(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to, fs.constants.COPYFILE_FICLONE);
  }
}
function run(script, args, cwd = ROOT) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { exit_code: result.status ?? 1, output: `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim() };
}
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); }
function replaceIn(file, search, replacement) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(search)) throw new Error(`Mutation target not found in ${file}`);
  fs.writeFileSync(file, text.replace(search, replacement));
}
function verifier(caseDir, targetImage = image.id, manifest = null) {
  const args = ['--image', targetImage, '--evidence-dir', caseDir];
  if (manifest) args.push('--manifest', manifest);
  return run('scripts/verify-release-evidence.js', args);
}
function sourceVerifier(caseDir) { return run('scripts/verify-source-fulfillment.js', ['--image', image.id, '--evidence-dir', caseDir]); }
function coreManifest(caseDir, output) {
  const candidate = readJson(path.join(caseDir, 'candidate.json'));
  const files = listFiles(caseDir, new Set([path.basename(output)])).map((file) => ({ path: relativeSafe(caseDir, file), bytes: fs.statSync(file).size, sha256: sha256File(file) }));
  writeJson(output, { schema: 'tileo-core-evidence-manifest@1', version, candidate_id: candidate.candidate_id, commit: candidate.commit, image_id: candidate.image_id, platform: candidate.platform, files });
}
function installIsolatedControlFixture(caseDir) {
  const controls = Array.from({ length: 28 }, (_, index) => {
    const id = `NC${String(index + 1).padStart(2, '0')}`;
    return { id, status: ['NC22', 'NC23', 'NC24'].includes(id) ? 'PENDING_HUMAN_DRY_RUN' : 'PASS', fixture: 'TEST FIXTURE — NOT RELEASE EVIDENCE' };
  });
  writeJson(path.join(caseDir, 'gate/negative-controls.json'), { schema: 'tileo-negative-controls@1', status: 'TEST_FIXTURE', controls });
  fs.writeFileSync(path.join(caseDir, 'gate/release-gate-negative-tests.log'), 'TEST FIXTURE — NOT RELEASE EVIDENCE\n');
}
function control(id, mutation, expected, mutate, runner = verifier) {
  const caseRoot = fs.mkdtempSync(path.join(os.tmpdir(), `tileo-${id}-`));
  const caseDir = path.join(caseRoot, `v${version}`);
  try {
    cloneTree(evidence, caseDir);
    installIsolatedControlFixture(caseDir);
    mutate(caseDir);
    const observed = runner(caseDir);
    const passExists = listFiles(caseRoot).some((file) => path.basename(file) === 'release-gate-pass.json');
    const passed = observed.exit_code !== 0 && observed.output.includes(expected) && !passExists;
    results.push({ id, status: passed ? 'PASS' : 'FAIL', baseline_image_id: image.id, mutation, command: runner.name || 'verifier', expected_rejection: expected, exit_code: observed.exit_code, observed: observed.output.slice(-4000), publishable_pass_present: passExists });
    log(`${passed ? 'PASS' : 'FAIL'} ${id}: ${mutation} -> ${observed.output.split(/\r?\n/).filter(Boolean).at(-1) ?? 'no output'}`);
    flush();
  } finally { fs.rmSync(caseRoot, { recursive: true, force: true }); }
}

const baseline = run('scripts/verify-release-evidence.js', ['--image', image.id, '--evidence-dir', evidence, '--allow-pre-negative']);
if (baseline.exit_code !== 0) throw new Error(`Positive baseline failed before negative controls:\n${baseline.output}`);
atomicWrite(jsonOutput, JSON.stringify({ schema: 'tileo-negative-controls@1', status: 'RUNNING', controls: [] }, null, 2) + '\n');
atomicWrite(logOutput, 'Negative controls started from a verified positive baseline.\n');
const originalHashes = new Map(listFiles(evidence).filter((file) => !mutableOutputs.has(path.resolve(file))).map((file) => [relativeSafe(evidence, file), sha256File(file)]));

control('NC01', 'change one clean-source baseline hash', 'G1 source mismatch', (dir) => { const file = path.join(dir, 'source/source-baseline.json'), value = readJson(file); value.source_files.Dockerfile = '0'.repeat(64); writeJson(file, value); });
control('NC02', 'append garbage to nonempty SPDX JSON', 'not valid JSON', (dir) => fs.appendFileSync(path.join(dir, 'sbom/sbom-image.spdx.json'), '\nGARBAGE'));
control('NC03', 'change valid SPDX while retaining scanner checksum', 'scanner invocation/hash/image binding mismatch', (dir) => { const file = path.join(dir, 'sbom/sbom-image.spdx.json'), value = readJson(file); value.name += '-tampered'; writeJson(file, value); });
control('NC04', 'replace CycloneDX content and update only scanner hash', 'Release provenance SBOM checksums', (dir) => { const file = path.join(dir, 'sbom/sbom-image.cdx.json'), value = readJson(file); value.serialNumber = 'urn:uuid:00000000-0000-0000-0000-000000000000'; writeJson(file, value); const scannerFile = path.join(dir, 'sbom/scanner-invocation.json'), scanner = readJson(scannerFile); scanner.outputs.cyclonedx = sha256File(file); writeJson(scannerFile, scanner); });
control('NC05', 'change candidate image identity', 'candidate.json does not bind', (dir) => { const file = path.join(dir, 'candidate.json'), value = readJson(file); value.image_id = `sha256:${'0'.repeat(64)}`; writeJson(file, value); });
control('NC06', 'replace TAP with a plan/footer but no genuine points', 'Integration TAP/JSON/exit/image/commit evidence is inconsistent', (dir) => fs.writeFileSync(path.join(dir, 'tests/integration-tests.tap'), 'TAP version 13\n1..1\n'));
control('NC07', 'truncate TAP before its last test point', 'Integration TAP/JSON/exit/image/commit evidence is inconsistent', (dir) => { const file = path.join(dir, 'tests/integration-tests.tap'), lines = fs.readFileSync(file, 'utf8').split(/\r?\n/), index = lines.findLastIndex((line) => /^(?:ok|not ok)\s+\d+\s*-/.test(line)); lines.splice(index, 1); fs.writeFileSync(file, lines.join('\n')); });
control('NC08', 'record nonzero runner exit while JSON claims pass', 'Integration TAP/JSON/exit/image/commit evidence is inconsistent', (dir) => { const file = path.join(dir, 'tests/exit-status.json'), value = readJson(file); value.exit_code = 9; writeJson(file, value); });
control('NC09', 'mark a mandatory test skipped', 'Integration TAP/JSON/exit/image/commit evidence is inconsistent', (dir) => { const file = path.join(dir, 'tests/integration-test-results.json'), value = readJson(file); value.tap_summary.skipped = 1; value.tap_summary.passed -= 1; writeJson(file, value); });
control('NC10', 'bind tests to a different commit', 'Integration TAP/JSON/exit/image/commit evidence is inconsistent', (dir) => { const file = path.join(dir, 'tests/integration-test-results.json'), value = readJson(file); value.git_commit = '0'.repeat(40); writeJson(file, value); });
control('NC11', 'remove GCC corresponding-source archive', 'source archive hash mismatch', (dir) => fs.rmSync(path.join(dir, 'compliance/source/gcc-runtime-corresponding-source.tar.gz')), sourceVerifier);
control('NC12', 'replace GCC source with a padded stub archive', 'source archive hash mismatch', (dir) => fs.writeFileSync(path.join(dir, 'compliance/source/gcc-runtime-corresponding-source.tar.gz'), Buffer.alloc(65536, 0x41)), sourceVerifier);
control('NC13', 'change a GCC aport recipe after packaging', 'aport/patch file set or hash mismatch', (dir) => {
  const archive = path.join(dir, 'compliance/source/gcc-runtime-corresponding-source.tar.gz'), work = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-nc13-'));
  try { execFileSync(TAR_EXECUTABLE, ['-xzf', archive, '-C', work]); fs.appendFileSync(path.join(work, 'alpine-aport/APKBUILD'), '\n# negative-control mutation\n'); execFileSync(TAR_EXECUTABLE, ['-czf', archive, '-C', work, '.']); }
  finally { fs.rmSync(work, { recursive: true, force: true }); }
  const newHash = sha256File(archive), provenanceFile = path.join(dir, 'compliance/source-provenance.json'), provenance = readJson(provenanceFile);
  const key = Object.keys(provenance.archives).find((entry) => entry.includes('gcc-runtime'));
  const oldHash = provenance.archives[key]; provenance.archives[key] = newHash; writeJson(provenanceFile, provenance);
  const register = path.join(dir, 'compliance/exceptions-register.csv');
  fs.writeFileSync(register, fs.readFileSync(register, 'utf8').split(oldHash).join(newHash));
}, sourceVerifier);
control('NC14', 'replace Mozilla certdata source with synthetic bytes', 'source archive hash mismatch', (dir) => fs.writeFileSync(path.join(dir, 'compliance/source/mozilla-ca-bundle-source.tar.gz'), 'synthetic-certdata'), sourceVerifier);
control('NC15', 'claim CA equality with a rebuilt hash unlike image', 'CA rebuild equality does not match', (dir) => { const file = path.join(dir, 'compliance/ca-rebuild-verification.json'), value = readJson(file); value.rebuilt_bundle_sha256 = '0'.repeat(64); writeJson(file, value); });
control('NC16', 'zero an exception binary SHA', 'Exception register has invalid rows', (dir) => replaceIn(path.join(dir, 'compliance/exceptions-register.csv'), /[0-9a-f]{64}/.exec(fs.readFileSync(path.join(dir, 'compliance/exceptions-register.csv'), 'utf8'))[0], '0'.repeat(64)));
control('NC17', 'add an undeclared non-permissive exception row', 'Exception register has invalid rows', (dir) => { const file = path.join(dir, 'compliance/exceptions-register.csv'), lines = fs.readFileSync(file, 'utf8').trimEnd().split(/\r?\n/); fs.writeFileSync(file, `${lines.join('\n')}\n${lines.at(-1).replace('EXC-003', 'EXC-004')}\n`); });
control('NC18', 'insert forbidden executable into full rootfs inventory', 'Forbidden runtime payload found', (dir) => { const file = path.join(dir, 'image/rootfs-files.json'), value = readJson(file); value.files.push({ path: '/app/PVRTexToolCLI', type: 'file', bytes: 1, sha256: '1'.repeat(64), classification: 'ELF' }); writeJson(file, value); });
control('NC19', 'remove mandatory stderr evidence log', 'Required evidence is missing', (dir) => fs.rmSync(path.join(dir, 'tests/integration-tests.stderr.log')));

control('NC20', 'run the actual gate from a dirty temporary Git worktree', 'G1_SOURCE: working tree is dirty', () => {}, (caseDir) => {
  const worktree = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-dirty-worktree-'));
  fs.rmSync(worktree, { recursive: true, force: true });
  try {
    execFileSync('git', ['worktree', 'add', '--detach', worktree, 'HEAD'], { cwd: ROOT, stdio: 'pipe' });
    fs.appendFileSync(path.join(worktree, 'README.md'), '\nnegative control\n');
    return run(path.join(worktree, 'scripts/certify-release-gate.js'), ['--image', image.id, '--evidence-dir', caseDir, '--out-dir', path.join(path.dirname(caseDir), 'authorization')], worktree);
  } finally { try { execFileSync('git', ['worktree', 'remove', '--force', worktree], { cwd: ROOT, stdio: 'ignore' }); } catch {} }
});
control('NC21', 'supply only a local fake approval path', 'G7_HUMAN: --manifest and --approval-attestation are required', () => {}, (caseDir) => run('scripts/certify-release-gate.js', ['--image', image.id, '--evidence-dir', caseDir, '--out-dir', path.join(path.dirname(caseDir), 'authorization'), '--enforce-human-approval']));
for (const [id, mutation] of [['NC22', 'missing/rejected/unauthorized human role'], ['NC23', 'approval subject differs from commit/image/core digest'], ['NC24', 'approval replayed on another run attempt']]) {
  results.push({ id, status: 'PENDING_HUMAN_DRY_RUN', mutation, required_environment: 'GitHub Actions protected release dry run with real human review; publication disabled', publishable_pass_present: false });
  log(`PENDING_HUMAN_DRY_RUN ${id}: ${mutation}`); flush();
}
control('NC25', 'place path traversal in a supplied core manifest', 'Unsafe core manifest path', (dir) => { const candidate = readJson(path.join(dir, 'candidate.json')); writeJson(path.join(dir, 'core-evidence-manifest.json'), { schema: 'tileo-core-evidence-manifest@1', version, candidate_id: candidate.candidate_id, commit: candidate.commit, image_id: candidate.image_id, platform: candidate.platform, files: [{ path: '../escape', bytes: 1, sha256: '0'.repeat(64) }] }); }, (dir) => verifier(dir, image.id, path.join(dir, 'core-evidence-manifest.json')));
control('NC26', 'change policy snapshot after core freeze', 'Core manifest paths, sizes or hashes do not match', (dir) => { const manifest = path.join(dir, 'core-evidence-manifest.json'); coreManifest(dir, manifest); fs.appendFileSync(path.join(dir, 'release/policy-snapshot.json'), '\n'); }, (dir) => verifier(dir, image.id, path.join(dir, 'core-evidence-manifest.json')));
control('NC27', 'swap candidate image before publication verification', 'candidate.json does not bind', () => {}, (dir) => verifier(dir, 'alpine:3.21@sha256:ee16d92f96db08d9d2d07da48555a27f3a69d8f0759021dbc601195ed0d2b5bd'));
control('NC28', 'leave a stale PASS inside a newly failing core', 'Stale or unauthorized PASS artifact found', (dir) => writeJson(path.join(dir, 'gate/release-gate-pass.json'), { schema: 'tileo-release-gate-pass@3', status: 'AUTHORIZED_FOR_PUBLICATION' }));

const afterHashes = new Map(listFiles(evidence).filter((file) => !mutableOutputs.has(path.resolve(file))).map((file) => [relativeSafe(evidence, file), sha256File(file)]));
if (JSON.stringify([...originalHashes]) !== JSON.stringify([...afterHashes])) throw new Error('A negative-control mutation leaked into the positive baseline');
flush();
if (results.some((item) => item.status === 'FAIL')) process.exit(1);
log(`Negative controls complete: ${results.filter((item) => item.status === 'PASS').length} PASS, ${results.filter((item) => item.status === 'PENDING_HUMAN_DRY_RUN').length} PENDING_HUMAN_DRY_RUN.`);
flush();
