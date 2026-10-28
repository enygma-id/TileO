#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { atomicWrite, gitIdentity, inspectImage, parseArgs, readJson, sha256, sha256File } from './lib/release-evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
let options;
try { options = parseArgs(process.argv.slice(2), { '--image': 'required', '--evidence-dir': 'required', '--out-dir': 'required', '--manifest': 'optional', '--enforce-human-approval': 'boolean', '--approval-attestation': 'optional' }); }
catch (error) { console.error(error.message); process.exit(2); }
const evidence = path.resolve(options['evidence-dir']);
const outDir = path.resolve(options['out-dir']);
if (path.basename(evidence) !== `v${version}`) throw new Error(`Evidence root must end in v${version}`);
if (outDir === evidence || outDir.startsWith(evidence + path.sep)) throw new Error('--out-dir must be staging/authorization storage outside immutable core evidence');
fs.mkdirSync(outDir, { recursive: true });
const passPath = path.join(outDir, 'release-gate-pass.json');
fs.rmSync(passPath, { force: true });
const failures = [];
const passed = [];
const candidate = readJson(path.join(evidence, 'candidate.json'), 'tileo-release-candidate@1');
const image = inspectImage(options.image);

function gate(name, operation) {
  try { operation(); passed.push(name); console.log(`PASS ${name}`); }
  catch (error) { failures.push(`${name}: ${error.message}`); console.error(`FAIL ${name}: ${error.message}`); }
}

gate('G1_SOURCE', () => {
  const git = gitIdentity(ROOT);
  if (!git.clean) throw new Error(`working tree is dirty:\n${git.status}`);
  if (git.commit !== candidate.commit || candidate.clean !== true) throw new Error('candidate commit/clean status does not match repository');
});
gate('G2_IMAGE', () => {
  if (image.id !== candidate.image_id || image.platform !== candidate.platform) throw new Error('actual Docker image ID/platform does not match candidate');
  const inspect = readJson(path.join(evidence, 'image/image-inspect.json'));
  if (inspect.Id !== image.id || `${inspect.Os}/${inspect.Architecture}` !== image.platform) throw new Error('image-inspect.json subject mismatch');
  const labels = inspect.Config?.Labels ?? {};
  if (labels['org.opencontainers.image.revision'] !== candidate.commit) throw new Error('image revision label does not match candidate commit');
  if (labels['org.opencontainers.image.version'] !== candidate.version) throw new Error('image version label does not match candidate version');
  if (labels['org.opencontainers.image.source'] !== `https://github.com/${candidate.repository}`) throw new Error('image source label does not match candidate repository');
});
gate('G3_EVIDENCE', () => {
  const args = ['scripts/verify-release-evidence.js', '--image', image.id, '--evidence-dir', evidence];
  if (options.manifest) args.push('--manifest', path.resolve(options.manifest));
  execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'pipe', maxBuffer: 32 * 1024 * 1024 });
});
gate('G4_INVENTORY_SBOM', () => {
  const inventory = readJson(path.join(evidence, 'image/rootfs-files.json'), 'tileo-rootfs-inventory@1');
  const spdx = readJson(path.join(evidence, 'sbom/sbom-image.spdx.json'));
  const cdx = readJson(path.join(evidence, 'sbom/sbom-image.cdx.json'));
  if (inventory.image_id !== image.id || spdx.spdxVersion !== 'SPDX-2.3' || cdx.bomFormat !== 'CycloneDX') throw new Error('inventory or SBOM schema/image binding invalid');
});
gate('G5_TESTS', () => {
  const tests = readJson(path.join(evidence, 'tests/integration-test-results.json'), 'tileo-integration-tests@2');
  const browser = readJson(path.join(evidence, 'tests/browser/execution.json'), 'tileo-browser-execution@1');
  if (!tests.passed || tests.image_id !== image.id || tests.git_commit !== candidate.commit) throw new Error('container test subject/status mismatch');
  if (browser.image_id !== image.id || browser.exit_code !== 0 || browser.failed > 0) throw new Error('browser execution failed or targeted another image');
  const scope = readJson(path.join(ROOT, 'release-policy/test-scope.json'), 'tileo-test-scope@1');
  const observedFiles = new Set((browser.tests ?? []).map((test) => String(test.file).replaceAll('\\', '/')));
  for (const required of scope.browser.required_specs ?? []) if (![...observedFiles].some((file) => file.endsWith(required))) throw new Error(`required browser spec did not execute: ${required}`);
  const declared = scope.browser.excluded_tests_pending_scope_approval ?? [];
  const observed = browser.skipped_tests ?? [];
  if (browser.skipped !== observed.length || observed.some((title) => !declared.some((allowed) => title === allowed || title.endsWith(` > ${allowed}`)))) throw new Error('browser test skips are not exactly predeclared scope exclusions');
  if (declared.some((allowed) => !observed.some((title) => title === allowed || title.endsWith(` > ${allowed}`)))) throw new Error('declared browser scope exclusion evidence is incomplete');
});
gate('G6_EXCEPTIONS', () => {
  const source = readJson(path.join(evidence, 'compliance/source-verification.json'), 'tileo-source-verification@1');
  if (source.status !== 'VERIFIED' || source.image.id !== image.id) throw new Error('source fulfillment is not verified against actual image bytes');
});

let authorization = null;
if (options['enforce-human-approval']) {
  gate('G7_HUMAN', () => {
    if (!options.manifest || !options['approval-attestation']) throw new Error('--manifest and --approval-attestation are required');
    if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('human authorization can only be certified inside GitHub Actions');
    authorization = readJson(path.resolve(options['approval-attestation']), 'tileo-release-authorization@1');
    const coreDigest = sha256File(path.resolve(options.manifest));
    if (authorization.status !== 'AUTHORIZED_FOR_PUBLICATION' || authorization.version !== version || authorization.candidate_id !== candidate.candidate_id || authorization.commit !== candidate.commit || authorization.image_id !== image.id || authorization.core_evidence_sha256 !== coreDigest) throw new Error('authorization subject/core digest mismatch');
    if (String(authorization.workflow_run_id) !== process.env.GITHUB_RUN_ID || String(authorization.run_attempt) !== process.env.GITHUB_RUN_ATTEMPT || authorization.repository !== process.env.GITHUB_REPOSITORY) throw new Error('authorization is not bound to this GitHub Actions run/attempt/repository');
    const roles = new Set((authorization.receipts ?? []).map((receipt) => receipt.role));
    for (const role of ['Engineering', 'Legal-IP', 'Release-Steward']) if (!roles.has(role)) throw new Error(`missing authenticated ${role} receipt`);
    const reviewers = readJson(path.join(ROOT, 'release-policy/reviewers.json'), 'tileo-reviewers-policy@1');
    if (reviewers.status !== 'CONFIGURED') throw new Error('reviewer policy is not configured');
    for (const receipt of authorization.receipts) {
      const configured = reviewers.environments?.[receipt.environment];
      if (!configured || configured.role !== receipt.role || String(configured.environment_id) !== String(receipt.environment_id) || !configured.authorized_reviewers.map(String).includes(String(receipt.reviewer_user_id))) throw new Error(`receipt reviewer/environment is not authorized for ${receipt.role}`);
      if (!String(receipt.comment).includes(candidate.candidate_id) || !String(receipt.comment).includes(coreDigest)) throw new Error(`receipt comment does not bind candidate/core digest for ${receipt.role}`);
    }
    const run = JSON.parse(execFileSync('gh', ['api', `repos/${authorization.repository}/actions/runs/${authorization.workflow_run_id}`], { encoding: 'utf8' }));
    const history = JSON.parse(execFileSync('gh', ['api', `repos/${authorization.repository}/actions/runs/${authorization.workflow_run_id}/approvals`], { encoding: 'utf8' }));
    if (run.head_sha !== candidate.commit || String(run.run_attempt) !== String(authorization.run_attempt)) throw new Error('live GitHub run subject mismatch');
    if (String(run.run_attempt) !== '1') throw new Error('authorization replay/rerun is not allowed; use a new workflow run');
    const eventFingerprint = (event) => sha256(JSON.stringify({ state: String(event.state ?? '').toLowerCase(), environment_ids: (event.environments ?? []).map((environment) => String(environment.id)).sort(), reviewer_user_id: String(event.user?.id ?? event.reviewer?.id ?? ''), reviewer_login: event.user?.login ?? event.reviewer?.login ?? null, comment: String(event.comment ?? '') }));
    for (const receipt of authorization.receipts) if (!history.some((event) => eventFingerprint(event) === receipt.event_sha256 && String(event.state).toLowerCase() === 'approved')) throw new Error(`live GitHub approval event missing for ${receipt.role}`);
  });
} else {
  console.log('PENDING G7_HUMAN: authenticated Engineering, Legal-IP and Release-Steward approvals are required');
}

const report = {
  schema: 'tileo-technical-eligibility@1',
  generated_at: new Date().toISOString(),
  status: failures.length ? 'BLOCKED' : options['enforce-human-approval'] ? 'AUTHORIZED_FOR_PUBLICATION' : 'TECHNICALLY_ELIGIBLE_PENDING_APPROVAL',
  candidate_id: candidate.candidate_id,
  version,
  commit: candidate.commit,
  image_id: image.id,
  platform: image.platform,
  passed_checks: passed,
  failures,
  human_approval: authorization ? { workflow_run_id: authorization.workflow_run_id, run_attempt: authorization.run_attempt, roles: authorization.receipts.map((receipt) => receipt.role) } : 'PENDING'
};
atomicWrite(path.join(outDir, failures.length ? 'eligibility-report.json' : options['enforce-human-approval'] ? 'authorization-report.json' : 'technical-eligibility.json'), JSON.stringify(report, null, 2) + '\n');
if (failures.length) process.exit(1);
if (!options['enforce-human-approval']) {
  console.log('TECHNICALLY_ELIGIBLE_PENDING_APPROVAL');
  process.exit(0);
}
atomicWrite(passPath, JSON.stringify({ schema: 'tileo-release-gate-pass@3', status: 'AUTHORIZED_FOR_PUBLICATION', candidate_id: candidate.candidate_id, version, commit: candidate.commit, image_id: image.id, platform: image.platform, core_evidence_sha256: authorization.core_evidence_sha256, workflow_run_id: authorization.workflow_run_id, run_attempt: authorization.run_attempt, authorized_at: new Date().toISOString() }, null, 2) + '\n');
console.log('AUTHORIZED_FOR_PUBLICATION');
