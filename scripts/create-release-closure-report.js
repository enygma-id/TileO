#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { atomicWrite, parseArgs, readJson, sha256File } from './lib/release-evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
let options;
try { options = parseArgs(process.argv.slice(2), { '--evidence-dir': 'required' }); }
catch (error) { console.error(error.message); process.exit(2); }
const evidence = path.resolve(options['evidence-dir']);
if (path.basename(evidence) !== `v${version}`) throw new Error(`Evidence root must end in v${version}`);
const candidate = readJson(path.join(evidence, 'candidate.json'), 'tileo-release-candidate@1');
const technical = readJson(path.join(evidence, 'gate/technical-eligibility.json'), 'tileo-technical-eligibility@1');
const negative = readJson(path.join(evidence, 'gate/negative-controls.json'), 'tileo-negative-controls@1');
const tests = readJson(path.join(evidence, 'tests/integration-test-results.json'), 'tileo-integration-tests@2');
const browser = readJson(path.join(evidence, 'tests/browser/execution.json'), 'tileo-browser-execution@1');
const source = readJson(path.join(evidence, 'compliance/source-verification.json'), 'tileo-source-verification@1');
if (technical.status !== 'TECHNICALLY_ELIGIBLE_PENDING_APPROVAL') throw new Error('Technical eligibility is not ready for a human review report');
const report = `# TileO ${version} Release Closure Report

## Candidate subject

- Candidate: \`${candidate.candidate_id}\`
- Commit: \`${candidate.commit}\`
- Image ID: \`${candidate.image_id}\`
- Platform: \`${candidate.platform}\`
- Image export SHA-256: \`${candidate.image_export_sha256}\`
- Status: **${technical.status}**

No tag, GitHub Release, or GHCR production tag has been created by this engineering closure.

## Executed verification

- Technical gates passed: ${technical.passed_checks.join(', ')}; human gate G7 and mandatory external protected-negative-proof gate G8 remain pending.
- Container Node tests: ${tests.tap_summary.passed}/${tests.tap_summary.total} passed, failed=${tests.tap_summary.failed}, skipped=${tests.tap_summary.skipped}, exit=${tests.exit_code}.
- Browser tests: expected=${browser.expected}, failed=${browser.failed}, skipped=${browser.skipped}, exit=${browser.exit_code}. Skips are limited to the predeclared compare-source exclusions pending scope approval.
- Source fulfillment: ${source.status}; authentic GCC and Mozilla/Alpine archives are pinned and matched to runtime binary/data hashes from the image.
- Negative controls: PASS=${negative.passed}, PENDING_HUMAN_DRY_RUN=${negative.pending}, FAIL=${negative.failed}. NC22–NC24 remain pending in this immutable core; actual protected publish=false execution receipts and raw logs must be validated externally by G8 before production authorization. A separate dry-run regression proof never approves this production image/core.
- Final SBOM verification: post-scanner schema/hash/image/commit/native-exception validation; superseded baseline hashes and paths are prohibited in runtime inventory.

## Evidence checksums

- PUB-01: generated versioned source-access routes and closure paths finalized before core freeze.
- PUB-02: staging and uploaded asset validation must match this frozen core; runtime publication pending until a separate receipt exists.
- PUB-03: anonymous source-access verification is required before registry push; full verification is required afterward. Receipts are stored outside this core. No live publication PASS is asserted by this report.

- GCC corresponding source: \`${sha256File(path.join(evidence, 'compliance/source/gcc-runtime-corresponding-source.tar.gz'))}\`
- Mozilla CA source: \`${sha256File(path.join(evidence, 'compliance/source/mozilla-ca-bundle-source.tar.gz'))}\`
- SPDX SBOM: \`${sha256File(path.join(evidence, 'sbom/sbom-image.spdx.json'))}\`
- CycloneDX SBOM: \`${sha256File(path.join(evidence, 'sbom/sbom-image.cdx.json'))}\`
- Technical eligibility: \`${sha256File(path.join(evidence, 'gate/technical-eligibility.json'))}\`

The authoritative complete checksum set is \`core-evidence-manifest.json\`, created only after this report.

## Remaining human blockers and required actions

1. Repository administrator: configure protected \`main\`, the \`release-engineering\`, \`release-legal\`, and \`release\` environments, disable ordinary admin bypass, and replace the pending IDs in \`release-policy/reviewers.json\` through an independently reviewed commit.
2. Engineering reviewer: download the candidate image/core evidence, verify the manifest and functional scope, then approve or reject the Engineering environment with a comment containing the candidate ID and core manifest SHA-256.
3. Legal/IP reviewer: review first-party rights, exact GCC Runtime Library Exception/Mozilla obligations, source-access method, notices, and exception register; approve or reject independently with the same subject identifiers.
4. Release Steward: confirm both prior decisions, publication routes, version 0.1.0, and no candidate rebuild; approve or reject the final environment with the same identifiers.
5. Run the protected workflow first with \`publish=false\` to execute NC22–NC24 with actual collector/certifier and labelled isolated attacks. Preserve its trusted proof artifact. Production requires that successful proof run ID on the same commit and implementation/policy, at most seven days old, plus fresh production approvals for its own candidate/core/run/attempt. Only \`publish=true\` after G7 and G8 may create \`v0.1.0\`, GitHub Release assets, or GHCR tags.
`;
atomicWrite(path.join(evidence, 'release/RELEASE_CLOSURE_REPORT.md'), report);
console.log('RELEASE_CLOSURE_REPORT.md created with human authorization still pending');
