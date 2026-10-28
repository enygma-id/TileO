#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CORE_REQUIRED_PATHS, inspectImage, listFiles, parseArgs, parseCsv, readJson, relativeSafe, sha256File } from './lib/release-evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
let options;
try { options = parseArgs(process.argv.slice(2), { '--image': 'required', '--evidence-dir': 'required', '--manifest': 'optional', '--allow-pre-negative': 'boolean' }); }
catch (error) { console.error(error.message); process.exit(2); }
const evidence = path.resolve(options['evidence-dir']);
if (path.basename(evidence) !== `v${version}`) throw new Error(`Evidence root must end in v${version}`);
const image = inspectImage(options.image);
const preNegativeOptional = new Set(['gate/negative-controls.json', 'gate/release-gate-negative-tests.log', 'gate/technical-eligibility.json']);
const required = CORE_REQUIRED_PATHS.filter((relative) => options['allow-pre-negative'] ? !preNegativeOptional.has(relative) : relative !== 'gate/technical-eligibility.json' || fs.existsSync(path.join(evidence, relative)));
for (const relative of required) {
  const file = path.join(evidence, relative.replaceAll('/', path.sep));
  if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) throw new Error(`Required evidence is missing: ${relative}`);
}
for (const file of listFiles(evidence)) {
  const relative = relativeSafe(evidence, file);
  if (/release-gate-pass\.json$/i.test(relative)) throw new Error(`Stale or unauthorized PASS artifact found in core: ${relative}`);
}

const candidate = readJson(path.join(evidence, 'candidate.json'), 'tileo-release-candidate@1');
if (candidate.version !== version || candidate.image_id !== image.id || candidate.platform !== image.platform || candidate.clean !== true) throw new Error('candidate.json does not bind the requested image, platform, version and clean source state');
const inspect = readJson(path.join(evidence, 'image/image-inspect.json'));
const labels = inspect.Config?.Labels ?? {};
if (inspect.Id !== image.id || labels['org.opencontainers.image.revision'] !== candidate.commit || labels['org.opencontainers.image.version'] !== candidate.version || labels['org.opencontainers.image.source'] !== `https://github.com/${candidate.repository}`) throw new Error('image labels do not bind candidate commit, version and source');
const source = readJson(path.join(evidence, 'source/source-baseline.json'), 'tileo-source-baseline@1');
const provenance = readJson(path.join(evidence, 'image/release-provenance.json'), 'tileo-release-provenance@1');
if (source.git?.commit !== candidate.commit || source.git?.dirty !== false || provenance.image?.id !== image.id || provenance.source_baseline?.git?.commit !== candidate.commit) throw new Error('Source, candidate and image provenance identities do not match');
if (provenance.final_artifacts) {
  if (provenance.final_subject?.candidate_id !== candidate.candidate_id || provenance.final_subject?.commit !== candidate.commit || provenance.final_subject?.image_id !== image.id) throw new Error('Final provenance subject mismatch');
  for (const entry of provenance.final_artifacts) {
    const file = path.join(evidence, entry.path.replaceAll('/', path.sep));
    if (!fs.existsSync(file) || fs.statSync(file).size !== entry.bytes || sha256File(file) !== entry.sha256) throw new Error(`Final provenance artifact mismatch: ${entry.path}`);
  }
}
for (const [relative, expected] of Object.entries(source.source_files ?? {})) {
  let committed;
  try { committed = execFileSync('git', ['show', `${candidate.commit}:${relative}`], { cwd: ROOT }); }
  catch { throw new Error(`G1 source mismatch: ${relative}`); }
  if (crypto.createHash('sha256').update(committed).digest('hex') !== expected) throw new Error(`G1 source mismatch: ${relative}`);
}

const spdxPath = path.join(evidence, 'sbom/sbom-image.spdx.json');
const cdxPath = path.join(evidence, 'sbom/sbom-image.cdx.json');
const spdx = readJson(spdxPath);
const cdx = readJson(cdxPath);
if (spdx.spdxVersion !== 'SPDX-2.3' || spdx.dataLicense !== 'CC0-1.0' || !Array.isArray(spdx.packages) || spdx.packages.length === 0) throw new Error('SPDX SBOM is malformed or empty');
if (cdx.bomFormat !== 'CycloneDX' || !/^1\.[5-9]$/.test(cdx.specVersion) || !Array.isArray(cdx.components) || cdx.components.length === 0) throw new Error('CycloneDX SBOM is malformed or empty');
const scanner = readJson(path.join(evidence, 'sbom/scanner-invocation.json'), 'tileo-scanner-invocation@1');
if (scanner.image_id !== image.id || scanner.outputs?.spdx !== sha256File(spdxPath) || scanner.outputs?.cyclonedx !== sha256File(cdxPath)) throw new Error('SBOM scanner invocation/hash/image binding mismatch');
if (provenance.audit_artifacts?.['sbom-image.spdx.json'] !== sha256File(spdxPath) || provenance.audit_artifacts?.['sbom-image.cdx.json'] !== sha256File(cdxPath)) throw new Error('Release provenance SBOM checksums do not match final SBOM bytes');

const inventory = readJson(path.join(evidence, 'image/rootfs-files.json'), 'tileo-rootfs-inventory@1');
if (inventory.image_id !== image.id || !Array.isArray(inventory.files) || inventory.files.length === 0) throw new Error('Rootfs inventory is empty or bound to another image');
if (inventory.files.some((entry) => entry.type === 'file' && (!/^[0-9a-f]{64}$/.test(entry.sha256) || !entry.classification))) throw new Error('Rootfs inventory contains unclassified or unhashed files');
const inventoryText = JSON.stringify(inventory);
for (const forbidden of ['PVRTexToolCLI', 'texture-compressor', 'astcenc']) if (inventoryText.includes(forbidden)) throw new Error(`Forbidden runtime payload found: ${forbidden}`);
const decisions = parseCsv(fs.readFileSync(path.join(evidence, 'image/license-decisions.csv'), 'utf8'));
if (!decisions.length || decisions.some((row) => !row.Verdict?.startsWith('ALLOW ('))) throw new Error('License decision register contains a prohibited or missing verdict');
const exceptionDecisions = decisions.filter((row) => row.Verdict === 'ALLOW (Disclosed Exception)');
if (exceptionDecisions.length !== 3 || exceptionDecisions.map((row) => row.Component).sort().join(',') !== 'ca-certificates,libgcc,libstdc++') throw new Error('License decisions are not limited to the three disclosed exceptions');
const noticeRows = parseCsv(fs.readFileSync(path.join(evidence, 'image/image-notice-paths.csv'), 'utf8'));
if (!noticeRows.length || noticeRows.some((row) => row.image_id !== image.id)) throw new Error('Image notice inventory is empty or bound to another image');

const tests = readJson(path.join(evidence, 'tests/integration-test-results.json'), 'tileo-integration-tests@2');
const exit = readJson(path.join(evidence, 'tests/exit-status.json'));
const tap = fs.readFileSync(path.join(evidence, 'tests/integration-tests.tap'), 'utf8');
const points = [...tap.matchAll(/^(?:ok|not ok)\s+\d+\s*-/gm)].length;
const plan = Number(tap.match(/^1\.\.(\d+)$/m)?.[1]);
const summary = tests.tap_summary ?? {};
if (!tap.startsWith('TAP version') || !Number.isFinite(plan) || plan === 0 || points !== plan || summary.total !== plan || summary.passed !== plan || summary.failed !== 0 || summary.skipped !== 0 || summary.todo !== 0 || summary.cancelled !== 0 || exit.exit_code !== 0 || tests.passed !== true || tests.image_id !== image.id || tests.git_commit !== candidate.commit) throw new Error('Integration TAP/JSON/exit/image/commit evidence is inconsistent or not fully passing');
const matrix = parseCsv(fs.readFileSync(path.join(evidence, 'tests/test-matrix.csv'), 'utf8'));
if (matrix.length !== plan || matrix.some((row) => row.status !== 'PASS')) throw new Error('Test matrix does not match fully passing TAP points');
if (!options['allow-pre-negative']) {
  const negative = readJson(path.join(evidence, 'gate/negative-controls.json'), 'tileo-negative-controls@1');
  const controls = negative.controls ?? [];
  const expectedIds = Array.from({ length: 28 }, (_, index) => `NC${String(index + 1).padStart(2, '0')}`);
  if (controls.map((item) => item.id).join(',') !== expectedIds.join(',') || controls.some((item) => item.status === 'FAIL') || controls.filter((item) => item.status === 'PENDING_HUMAN_DRY_RUN').map((item) => item.id).join(',') !== 'NC22,NC23,NC24') throw new Error('Negative controls are incomplete, failed, or have unexpected pending cases');
}

const exceptions = parseCsv(fs.readFileSync(path.join(evidence, 'compliance/exceptions-register.csv'), 'utf8'));
if (exceptions.length !== 3 || exceptions.some((row) => row.image_id !== image.id || row.technical_status !== 'VERIFIED' || !/^[0-9a-f]{64}$/.test(row.binary_sha256) || /^0+$/.test(row.binary_sha256))) throw new Error('Exception register has invalid rows, hashes, statuses or image binding');
const sourceVerification = readJson(path.join(evidence, 'compliance/source-verification.json'), 'tileo-source-verification@1');
if (sourceVerification.status !== 'VERIFIED' || sourceVerification.image?.id !== image.id) throw new Error('Source fulfillment has not been verified against this image');
const caVerification = readJson(path.join(evidence, 'compliance/ca-rebuild-verification.json'), 'tileo-ca-rebuild-verification@1');
const runtimeHashes = readJson(path.join(evidence, 'image/runtime-file-hashes.json'), 'tileo-runtime-file-hashes@1');
const imageCaHash = runtimeHashes.files?.['/etc/ssl/certs/ca-certificates.crt']?.sha256;
if (caVerification.image_id !== image.id || caVerification.equal !== true || !imageCaHash || caVerification.image_bundle_sha256 !== imageCaHash || caVerification.rebuilt_bundle_sha256 !== imageCaHash) throw new Error('CA rebuild equality does not match the actual image bundle hash');

if (options.manifest) {
  const manifestPath = path.resolve(options.manifest);
  if (path.dirname(manifestPath) !== evidence) throw new Error('--manifest must be directly inside the evidence root');
  const manifest = readJson(manifestPath, 'tileo-core-evidence-manifest@1');
  if (manifest.version !== version || manifest.image_id !== image.id || manifest.commit !== candidate.commit) throw new Error('Core manifest subject mismatch');
  for (const entry of manifest.files ?? []) if (!entry.path || entry.path.startsWith('../') || entry.path.includes('/../') || path.isAbsolute(entry.path)) throw new Error(`Unsafe core manifest path: ${entry.path}`);
  const actual = listFiles(evidence, new Set([path.basename(manifestPath)])).map((file) => ({ path: relativeSafe(evidence, file), bytes: fs.statSync(file).size, sha256: sha256File(file) }));
  if (JSON.stringify(actual) !== JSON.stringify(manifest.files)) throw new Error('Core manifest paths, sizes or hashes do not match evidence bytes');
}
console.log(`Release evidence VERIFIED for ${candidate.candidate_id} (${image.id})`);
