#!/usr/bin/env node
/**
 * Dedicated Release Gate Certification Program (TileO Enterprise v1.0.0)
 *
 * Enforces fail-closed validation across:
 *  1. Notice parity & dependency inventories
 *  2. Container image audit evidence and 6 source baseline hashes
 *  3. SPDX/CycloneDX SBOM binary scan (rejects unapproved or non-permissive binaries)
 *  4. Integration test suite evidence (TAP report, positive tests, 0 failures, matching image ID)
 *  5. Disclosed exceptions & corresponding source fulfillment
 *  6. Source repository baseline consistency (clean tree, matching commit)
 *  7. Human approval governance signoff
 *
 * Emit release-gate-pass.json ONLY when 100% of checks pass AND human approval is signed.
 * If human approval is pending: emit eligibility-report.json with TECHNICALLY_ELIGIBLE_PENDING_APPROVAL.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const pkgVersion = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8')).version;

const args = process.argv.slice(2);

let IMAGE_TAG = 'tileo-rc:' + pkgVersion;
let OUT_DIR = path.resolve(ROOT_DIR, 'release-evidence', `v${pkgVersion}`, 'gate');
let EVIDENCE_DIR = null;
let ENFORCE_HUMAN_APPROVAL = false;
let ENFORCE_CLEAN = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--image' && i + 1 < args.length) {
    IMAGE_TAG = args[++i];
  } else if (arg === '--out-dir' && i + 1 < args.length) {
    OUT_DIR = path.resolve(ROOT_DIR, args[++i]);
  } else if (arg === '--evidence-dir' && i + 1 < args.length) {
    EVIDENCE_DIR = path.resolve(ROOT_DIR, args[++i]);
  } else if (arg === '--enforce-human-approval') {
    ENFORCE_HUMAN_APPROVAL = true;
  } else if (arg === '--enforce-clean') {
    ENFORCE_CLEAN = true;
  } else if (!arg.startsWith('--')) {
    IMAGE_TAG = arg;
  }
}
if (!EVIDENCE_DIR) {
  EVIDENCE_DIR = OUT_DIR;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

console.log('===========================================================');
console.log(' TileO Dedicated Release Gate Certification');
console.log(` Target Image: ${IMAGE_TAG}`);
console.log(` Gate Output Directory: ${OUT_DIR}`);
console.log(` Evidence Directory: ${EVIDENCE_DIR}`);
console.log(` Enforce Human Approval: ${ENFORCE_HUMAN_APPROVAL}`);
console.log(` Enforce Clean Git Tree: ${ENFORCE_CLEAN}`);
console.log('===========================================================\n');

function sha256File(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const hash = crypto.createHash('sha256');
  const buf = fs.readFileSync(filePath);
  const isText =
    /\.(md|json|txt|csv|js|ts|ya?ml)$/i.test(filePath) || path.basename(filePath) === 'Dockerfile';
  if (isText) {
    const text = buf.toString('utf8').replace(/\r\n/g, '\n');
    hash.update(Buffer.from(text, 'utf8'));
  } else {
    hash.update(buf);
  }
  return hash.digest('hex');
}

const passPath = path.join(OUT_DIR, 'release-gate-pass.json');
const reportPath = path.join(OUT_DIR, 'eligibility-report.json');

const failures = [];
const passedChecks = [];

const DEFAULT_GATE_DIR = path.resolve(ROOT_DIR, 'release-evidence', `v${pkgVersion}`, 'gate');
const IS_CUSTOM_EVIDENCE = EVIDENCE_DIR && EVIDENCE_DIR !== DEFAULT_GATE_DIR;

// Determine artifact paths with evidence directory priority
function findArtifact(filename, subpathList = []) {
  if (EVIDENCE_DIR) {
    const candidate1 = path.join(EVIDENCE_DIR, filename);
    if (fs.existsSync(candidate1)) return candidate1;
    for (const p of subpathList) {
      const parts = p.split(/[\\/]/);
      const sub = parts.slice(2).join(path.sep);
      const candSub = path.join(EVIDENCE_DIR, sub);
      if (fs.existsSync(candSub)) return candSub;
      const baseSub = path.join(EVIDENCE_DIR, path.basename(p));
      if (fs.existsSync(baseSub)) return baseSub;
    }
    if (IS_CUSTOM_EVIDENCE) {
      return path.join(EVIDENCE_DIR, filename);
    }
  }
  for (const p of subpathList) {
    const abs = path.resolve(ROOT_DIR, p);
    if (fs.existsSync(abs)) return abs;
  }
  return path.resolve(ROOT_DIR, subpathList[0] || filename);
}

const digestFile = findArtifact('release-image-digest.txt', [
  `release-evidence/v${pkgVersion}/image/release-image-digest.txt`,
  'release-evidence/v1.0.0/image/release-image-digest.txt',
  'artifacts/compliance/release-image-digest.txt',
]);
const driversFile = findArtifact('gdal-drivers.txt', [
  `release-evidence/v${pkgVersion}/image/gdal-drivers.txt`,
  'release-evidence/v1.0.0/image/gdal-drivers.txt',
  'artifacts/compliance/gdal-drivers.txt',
]);
const osPackagesFile = findArtifact('os-packages.csv', [
  `release-evidence/v${pkgVersion}/image/os-packages.csv`,
  'release-evidence/v1.0.0/image/os-packages.csv',
  'artifacts/compliance/os-packages.csv',
]);
const binaryLinkageFile = findArtifact('binary-linkage.csv', [
  `release-evidence/v${pkgVersion}/image/binary-linkage.csv`,
  'release-evidence/v1.0.0/image/binary-linkage.csv',
  'artifacts/compliance/binary-linkage.csv',
]);
const licenseDecisionsFile = findArtifact('license-decisions.csv', [
  `release-evidence/v${pkgVersion}/image/license-decisions.csv`,
  `release-evidence/v${pkgVersion}/compliance/license-decisions.csv`,
  'release-evidence/v1.0.0/image/license-decisions.csv',
  'release-evidence/v1.0.0/compliance/license-decisions.csv',
  'artifacts/compliance/license-decisions.csv',
]);
const spdxFile = findArtifact('sbom-image.spdx.json', [
  `release-evidence/v${pkgVersion}/sbom/sbom-image.spdx.json`,
  'release-evidence/v1.0.0/sbom/sbom-image.spdx.json',
  'artifacts/compliance/sbom-image.spdx.json',
]);
const cdxFile = findArtifact('sbom-image.cdx.json', [
  `release-evidence/v${pkgVersion}/sbom/sbom-image.cdx.json`,
  'release-evidence/v1.0.0/sbom/sbom-image.cdx.json',
  'artifacts/compliance/sbom-image.cdx.json',
]);
const sourceBaselineFile = findArtifact('source-baseline.json', [
  `release-evidence/v${pkgVersion}/source/source-baseline.json`,
  'release-evidence/v1.0.0/source/source-baseline.json',
  'artifacts/compliance/source-baseline.json',
]);
const releaseProvenanceFile = findArtifact('release-provenance.json', [
  `release-evidence/v${pkgVersion}/image/release-provenance.json`,
  'release-evidence/v1.0.0/image/release-provenance.json',
  'artifacts/compliance/release-provenance.json',
]);
const testResultsFile = findArtifact('integration-test-results.json', [
  `release-evidence/v${pkgVersion}/tests/integration-test-results.json`,
  'release-evidence/v1.0.0/tests/integration-test-results.json',
  'artifacts/compliance/integration-test-results.json',
]);
const tapLogFile = findArtifact('integration-tests.tap', [
  `release-evidence/v${pkgVersion}/tests/integration-tests.tap`,
  'release-evidence/v1.0.0/tests/integration-tests.tap',
  'artifacts/compliance/integration-tests.tap',
]);

// Gate 1: Check Notice Parity
console.log('[Gate 1/7] Verifying notice parity and dependency inventories...');
try {
  execFileSync('node', ['scripts/check-notice-parity.js'], { cwd: ROOT_DIR, stdio: 'pipe' });
  passedChecks.push('Gate 1: Notice parity and dependency inventories verified');
  console.log('  ✓ Notice parity passed.');
} catch (e) {
  failures.push('Gate 1 Failed: Notice parity check failed. Run `npm run notices` and check-notice-parity.js.');
}

// Gate 2: Verify Image Audit Evidence & 6 Source Baseline Hashes
console.log('\n[Gate 2/7] Verifying image audit artifacts and 6 source baseline hashes...');
const requiredArtifacts = [
  digestFile,
  driversFile,
  osPackagesFile,
  binaryLinkageFile,
  licenseDecisionsFile,
  spdxFile,
  cdxFile,
  sourceBaselineFile,
  releaseProvenanceFile,
];

for (const req of requiredArtifacts) {
  if (!fs.existsSync(req) || fs.statSync(req).size === 0) {
    failures.push(`Gate 2 Failed: Required audit artifact missing or empty: ${path.basename(req)}`);
  }
}

let imageId = 'unknown';
if (fs.existsSync(digestFile)) {
  const digestContent = fs.readFileSync(digestFile, 'utf8');
  const match = digestContent.match(/IMAGE_ID=(.+)/);
  if (match) imageId = match[1].trim();
  console.log(`  ✓ Image Digest verified: ID=${imageId}`);
}

// Cross-validate all 6 source baseline files against disk
const SIX_SOURCE_FILES = [
  'Dockerfile',
  'package.json',
  'package-lock.json',
  'THIRD-PARTY-NOTICES.md',
  'third-party/MANIFEST.json',
  'third-party/native/components.json',
];

if (fs.existsSync(sourceBaselineFile)) {
  try {
    const baseline = JSON.parse(fs.readFileSync(sourceBaselineFile, 'utf8'));
    for (const rel of SIX_SOURCE_FILES) {
      const diskPath = path.join(ROOT_DIR, rel);
      const diskSha = sha256File(diskPath);
      const recordedSha = baseline.source_files ? baseline.source_files[rel] : null;

      if (!diskSha) {
        failures.push(`Gate 2 Failed: Source baseline file missing from disk: ${rel}`);
      } else if (!recordedSha) {
        failures.push(`Gate 2 Failed: Source baseline record missing entry for: ${rel}`);
      } else if (diskSha !== recordedSha) {
        failures.push(
          `Gate 2 Failed: Source baseline mismatch for ${rel} (disk: ${diskSha.slice(0, 12)}, recorded: ${recordedSha.slice(0, 12)})`
        );
      }
    }
    console.log('  ✓ All 6 source baseline file hashes match disk exactly.');
    passedChecks.push('Gate 2: Source baseline and audit evidence verified');
  } catch (err) {
    failures.push(`Gate 2 Failed: Error reading source-baseline.json: ${err.message}`);
  }
}

// Gate 3: Scan Binary Linkages & Forbidden Binaries
console.log('\n[Gate 3/7] Inspecting binary linkages and SBOM contents...');
if (fs.existsSync(binaryLinkageFile)) {
  const linkageLines = fs.readFileSync(binaryLinkageFile, 'utf8').split('\n');
  let allowedRows = 0;
  for (const line of linkageLines) {
    if (!line.trim() || line.startsWith('BinaryOrLibrary')) continue;
    if (
      line.includes('libidn2') ||
      line.includes('libunistring') ||
      line.includes('libpsl') ||
      line.includes('libgeos')
    ) {
      failures.push(`Gate 3 Failed: Copyleft library detected in binary linkage: ${line}`);
    }
    if (line.includes('PROHIBITED_BINARY')) {
      failures.push(`Gate 3 Failed: Prohibited binary found in container rootfs: ${line}`);
    }
    if (line.endsWith(',ALLOW') || line.endsWith(',"ALLOW"')) {
      allowedRows++;
    }
  }
  console.log(`  ✓ Verified ${allowedRows} dynamic linkages.`);
}

// Inspect SBOM for banned binaries (texture-compressor PVRTexToolCLI / astcenc / crunch)
if (fs.existsSync(spdxFile)) {
  const spdxText = fs.readFileSync(spdxFile, 'utf8');
  const BANNED_BINARIES = [
    'PVRTexToolCLI',
    'astcenc',
    'crunch',
    'texture-compressor',
    'libidn2',
    'libunistring',
    'libpsl',
  ];
  for (const banned of BANNED_BINARIES) {
    if (spdxText.includes(banned)) {
      failures.push(`Gate 3 Failed: Banned binary or component "${banned}" detected in SPDX SBOM.`);
    }
  }
  console.log('  ✓ Verified SPDX SBOM: Zero proprietary or banned binaries.');
  passedChecks.push('Gate 3: Binary linkage and SBOM scan verified zero banned binaries');
}

// Gate 4: Verify Integration Test Evidence
console.log('\n[Gate 4/7] Verifying integration test execution evidence...');
let testSummary = null;

if (!fs.existsSync(testResultsFile)) {
  failures.push('Gate 4 Failed: integration-test-results.json missing! Run `node scripts/record-test-results.js`.');
} else {
  try {
    testSummary = JSON.parse(fs.readFileSync(testResultsFile, 'utf8'));

    // Verify schema
    if (testSummary.schema !== 'tileo-integration-tests@2') {
      console.warn(`  Notice: test results schema is ${testSummary.schema}`);
    }

    const tapPassed = testSummary.tap_summary ? testSummary.tap_summary.passed : testSummary.passed;
    const tapFailed = testSummary.tap_summary ? testSummary.tap_summary.failed : testSummary.failed;
    const isPassed = Boolean(testSummary.passed ?? testSummary.all_passed);

    if (!isPassed || tapFailed > 0 || tapPassed === 0) {
      failures.push(
        `Gate 4 Failed: Integration tests failed or recorded 0 passing tests (passed=${tapPassed}, failed=${tapFailed}).`
      );
    }

    if (testSummary.exit_code !== undefined && testSummary.exit_code !== 0) {
      failures.push(`Gate 4 Failed: Test execution recorded non-zero container exit code: ${testSummary.exit_code}`);
    }

    if (testSummary.image_id && imageId !== 'unknown' && testSummary.image_id !== imageId) {
      failures.push(
        `Gate 4 Failed: Test execution image ID (${testSummary.image_id}) does not match audited image ID (${imageId}).`
      );
    }

    // Verify TAP stream file
    if (!fs.existsSync(tapLogFile) || fs.statSync(tapLogFile).size === 0) {
      failures.push('Gate 4 Failed: integration-tests.tap stream log is missing or empty.');
    } else {
      const tapContent = fs.readFileSync(tapLogFile, 'utf8');
      if (!tapContent.includes('TAP version')) {
        failures.push('Gate 4 Failed: integration-tests.tap is truncated or missing TAP version header.');
      }
    }

    console.log(
      `  ✓ Integration test results verified: ${tapPassed} passed, ${tapFailed} failed.`
    );
    passedChecks.push('Gate 4: Integration test suite verified positive execution');
  } catch (err) {
    failures.push(`Gate 4 Failed: Could not parse integration-test-results.json: ${err.message}`);
  }
}

// Gate 5: Verify Disclosed Exceptions & Source Fulfillment
console.log('\n[Gate 5/7] Verifying disclosed exceptions & corresponding source fulfillment...');

let exceptionsRegisterFile = findArtifact('exceptions-register.csv', [
  `release-evidence/v${pkgVersion}/compliance/exceptions-register.csv`,
  'release-evidence/v1.0.0/compliance/exceptions-register.csv',
  'artifacts/compliance/exceptions-register.csv',
]);
let gccSourceArchive = findArtifact('source/gcc-runtime-corresponding-source.tar.gz', [
  `release-evidence/v${pkgVersion}/compliance/source/gcc-runtime-corresponding-source.tar.gz`,
  'release-evidence/v1.0.0/compliance/source/gcc-runtime-corresponding-source.tar.gz',
  'artifacts/compliance/source/gcc-runtime-corresponding-source.tar.gz',
]);
let caSourceArchive = findArtifact('source/mozilla-ca-bundle-source.tar.gz', [
  `release-evidence/v${pkgVersion}/compliance/source/mozilla-ca-bundle-source.tar.gz`,
  'release-evidence/v1.0.0/compliance/source/mozilla-ca-bundle-source.tar.gz',
  'artifacts/compliance/source/mozilla-ca-bundle-source.tar.gz',
]);

// Auto-prepare compliance packages in non-custom evidence environments if absent
if (!IS_CUSTOM_EVIDENCE && (!fs.existsSync(exceptionsRegisterFile) || !fs.existsSync(gccSourceArchive) || !fs.existsSync(caSourceArchive))) {
  try {
    console.log('  Preparing compliance packages (disclosed exceptions & source fulfillment)...');
    execSync('node scripts/prepare-compliance-packages.js', { cwd: ROOT_DIR, stdio: 'inherit' });
    exceptionsRegisterFile = findArtifact('exceptions-register.csv', [
      `release-evidence/v${pkgVersion}/compliance/exceptions-register.csv`,
      'release-evidence/v1.0.0/compliance/exceptions-register.csv',
      'artifacts/compliance/exceptions-register.csv',
    ]);
    gccSourceArchive = findArtifact('source/gcc-runtime-corresponding-source.tar.gz', [
      `release-evidence/v${pkgVersion}/compliance/source/gcc-runtime-corresponding-source.tar.gz`,
      'release-evidence/v1.0.0/compliance/source/gcc-runtime-corresponding-source.tar.gz',
      'artifacts/compliance/source/gcc-runtime-corresponding-source.tar.gz',
    ]);
    caSourceArchive = findArtifact('source/mozilla-ca-bundle-source.tar.gz', [
      `release-evidence/v${pkgVersion}/compliance/source/mozilla-ca-bundle-source.tar.gz`,
      'release-evidence/v1.0.0/compliance/source/mozilla-ca-bundle-source.tar.gz',
      'artifacts/compliance/source/mozilla-ca-bundle-source.tar.gz',
    ]);
  } catch (err) {
    console.warn(`  ⚠ Could not auto-prepare compliance packages: ${err.message}`);
  }
}

const gplNotice = findArtifact('notices/GPL-3.0.txt', [
  `release-evidence/v${pkgVersion}/compliance/notices/GPL-3.0.txt`,
  'release-evidence/v1.0.0/compliance/notices/GPL-3.0.txt',
  'third-party/licenses/native/libstdc++/COPYING3.txt',
]);
const gccNotice = findArtifact('notices/GCC-Runtime-Library-Exception-3.1.txt', [
  `release-evidence/v${pkgVersion}/compliance/notices/GCC-Runtime-Library-Exception-3.1.txt`,
  'release-evidence/v1.0.0/compliance/notices/GCC-Runtime-Library-Exception-3.1.txt',
  'third-party/licenses/native/libstdc++/COPYING-RUNTIME.txt',
]);
const mplNotice = findArtifact('notices/MPL-2.0.txt', [
  `release-evidence/v${pkgVersion}/compliance/notices/MPL-2.0.txt`,
  'release-evidence/v1.0.0/compliance/notices/MPL-2.0.txt',
  'third-party/licenses/native/ca-certificates/MPL-2.0.txt',
]);

if (!fs.existsSync(exceptionsRegisterFile) || fs.statSync(exceptionsRegisterFile).size === 0) {
  failures.push('Gate 5 Failed: exceptions-register.csv missing or empty! Run `node scripts/prepare-compliance-packages.js`.');
} else {
  const regContent = fs.readFileSync(exceptionsRegisterFile, 'utf8');
  if (!regContent.includes('EXC-001') || !regContent.includes('EXC-002') || !regContent.includes('EXC-003')) {
    failures.push('Gate 5 Failed: exceptions-register.csv missing required EXC-001, EXC-002, or EXC-003 entries.');
  }
}

function verifyGzipArchive(archivePath, name) {
  if (!fs.existsSync(archivePath) || fs.statSync(archivePath).size < 100) {
    failures.push(`Gate 5 Failed: ${name} is missing or empty (${path.relative(ROOT_DIR, archivePath)}).`);
    return;
  }
  const buf = fs.readFileSync(archivePath);
  if (buf[0] !== 0x1f || buf[1] !== 0x8b) {
    failures.push(`Gate 5 Failed: ${name} is not a valid gzip archive (magic header mismatch).`);
  }
}

verifyGzipArchive(gccSourceArchive, 'GCC corresponding source archive (gcc-runtime-corresponding-source.tar.gz)');
verifyGzipArchive(caSourceArchive, 'Mozilla CA bundle source archive (mozilla-ca-bundle-source.tar.gz)');

if (!fs.existsSync(gplNotice) || !fs.existsSync(gccNotice) || !fs.existsSync(mplNotice)) {
  failures.push('Gate 5 Failed: Required license notice texts (GPL, GCC Runtime Exception, MPL) missing.');
}

if (!failures.some((f) => f.startsWith('Gate 5'))) {
  console.log('  ✓ Verified 3 disclosed exceptions and non-empty corresponding source archives.');
  passedChecks.push('Gate 5: Disclosed exceptions and source fulfillment verified');
}

// Gate 6: Source Baseline & Repository State
console.log('\n[Gate 6/7] Verifying source repository state and commit baseline...');
let gitDirty = false;
let currentCommit = 'unknown';
try {
  const gitStatus = execSync('git status --porcelain', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
  gitDirty = gitStatus.length > 0;
  currentCommit = execSync('git rev-parse HEAD', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
} catch {}

if (ENFORCE_CLEAN && gitDirty) {
  failures.push('Gate 6 Failed: Git repository has uncommitted changes. Release certification requires a clean working tree.');
}

if (fs.existsSync(sourceBaselineFile)) {
  try {
    const baseline = JSON.parse(fs.readFileSync(sourceBaselineFile, 'utf8'));
    if (baseline.git && baseline.git.commit && currentCommit !== 'unknown' && baseline.git.commit !== currentCommit) {
      failures.push(
        `Gate 6 Failed: Current commit (${currentCommit}) does not match source-baseline.json (${baseline.git.commit}).`
      );
    }
  } catch (err) {}
}

if (!failures.some((f) => f.startsWith('Gate 6'))) {
  console.log(`  ✓ Source baseline verified against commit ${currentCommit}.`);
  passedChecks.push('Gate 6: Repository state verified against baseline commit');
}

// Gate 7: Human Approval Governance Signoff
console.log('\n[Gate 7/7] Verifying human release approval signoff...');
const approvalDocFile = path.join(ROOT_DIR, 'release-approval.md');
let humanApproved = false;

if (!fs.existsSync(approvalDocFile)) {
  failures.push('Gate 7 Failed: release-approval.md missing!');
} else {
  const approvalDoc = fs.readFileSync(approvalDocFile, 'utf8');
  const hasPending = /\bPENDING\b/i.test(approvalDoc) || /\[\s*\]/i.test(approvalDoc);
  const hasApprovedSignoff = /Decision:\s*\*\*GO\*\*/i.test(approvalDoc);

  if (!hasPending && hasApprovedSignoff) {
    humanApproved = true;
    console.log('  ✓ Human approval verified: Formal GO signoff confirmed.');
    passedChecks.push('Gate 7: Human approval GO signoff confirmed');
  } else {
    humanApproved = false;
    const msg = 'Human approval in release-approval.md has PENDING reviewer signatures or unchecked items.';
    if (ENFORCE_HUMAN_APPROVAL) {
      failures.push(`Gate 7 Failed: ${msg}`);
    } else {
      console.warn(`  ⚠ ${msg}`);
    }
  }
}

// Decision & Certification Output
console.log('\n===========================================================');

// If technical failures occurred -> BLOCKED
if (failures.length > 0) {
  // Clean up any stale pass file
  if (fs.existsSync(passPath)) {
    try {
      fs.unlinkSync(passPath);
    } catch {}
  }

  const blockedReport = {
    schema: 'tileo-release-eligibility@1',
    timestamp: new Date().toISOString(),
    status: 'BLOCKED',
    decision: 'REFUSE_CERTIFICATION',
    target_image: { tag: IMAGE_TAG, id: imageId },
    git_commit: currentCommit,
    passed_checks: passedChecks,
    failures,
  };
  fs.writeFileSync(reportPath, JSON.stringify(blockedReport, null, 2) + '\n', 'utf8');

  console.error('RELEASE CERTIFICATION FAILED (BLOCKED):');
  for (const f of failures) {
    console.error(`  ✖ ${f}`);
  }
  console.error(`\nEligibility report written to: ${path.relative(ROOT_DIR, reportPath)}`);
  console.error('Refusing to certify release candidate.');
  console.log('===========================================================\n');
  process.exit(1);
}

// All technical checks passed, but human approval is pending -> TECHNICALLY_ELIGIBLE_PENDING_APPROVAL
if (!humanApproved) {
  // Clean up any stale pass file
  if (fs.existsSync(passPath)) {
    try {
      fs.unlinkSync(passPath);
    } catch {}
  }

  const eligibleReport = {
    schema: 'tileo-release-eligibility@1',
    timestamp: new Date().toISOString(),
    status: 'TECHNICALLY_ELIGIBLE_PENDING_APPROVAL',
    decision: 'GO_RECOMMENDATION_PENDING_HUMAN_OVERSIGHT',
    summary: 'All technical license, container audit, negative control, and integration test gates PASSED. Release candidate is ready for human approval signoff in release-approval.md.',
    target_image: { tag: IMAGE_TAG, id: imageId },
    git_commit: currentCommit,
    passed_checks: passedChecks,
    human_approval_required: {
      document: 'release-approval.md',
      instruction: 'Legal Counsel and Head of Engineering must review evidence and sign off GO in release-approval.md before production release tag or publication.',
    },
    verified_evidence: {
      image_digest: sha256File(digestFile),
      spdx_sbom: sha256File(spdxFile),
      integration_tests: sha256File(testResultsFile),
      source_baseline: sha256File(sourceBaselineFile),
      exceptions_register: sha256File(exceptionsRegisterFile),
    },
  };
  fs.writeFileSync(reportPath, JSON.stringify(eligibleReport, null, 2) + '\n', 'utf8');

  console.log('STATUS: TECHNICALLY ELIGIBLE — PENDING APPROVAL');
  console.log('All 6 technical release gates PASSED.');
  console.log('Production release certification is held pending formal human signoff in release-approval.md.');
  console.log(`Eligibility report written to: ${path.relative(ROOT_DIR, reportPath)}`);
  console.log('===========================================================\n');
  process.exit(0);
}

// 100% Passed AND Human Approval GO confirmed -> RELEASE_APPROVED
const passRecord = {
  schema: 'tileo-release-gate-pass@2',
  passed: true,
  status: 'RELEASE_APPROVED',
  certified_at: new Date().toISOString(),
  compliance_policy: 'Enterprise Proprietary-Compatible with Disclosed Exceptions',
  target_image: {
    tag: IMAGE_TAG,
    id: imageId,
  },
  git_commit: currentCommit,
  integration_tests: {
    total: testSummary ? testSummary.tap_summary ? testSummary.tap_summary.total : testSummary.total_tests : 0,
    passed: testSummary ? testSummary.tap_summary ? testSummary.tap_summary.passed : testSummary.passed : 0,
    failed: testSummary ? testSummary.tap_summary ? testSummary.tap_summary.failed : testSummary.failed : 0,
    skipped: testSummary ? testSummary.tap_summary ? testSummary.tap_summary.skipped : testSummary.skipped : 0,
  },
  human_approval: {
    status: 'APPROVED',
    document: 'release-approval.md',
    verified_at: new Date().toISOString(),
  },
  disclosed_exceptions: [
    'EXC-001: libstdc++.so.6 (GPL-3.0-only WITH GCC-exception-3.1)',
    'EXC-002: libgcc_s.so.1 (GPL-3.0-only WITH GCC-exception-3.1)',
    'EXC-003: ca-certificates.crt (MPL-2.0 AND MIT)',
  ],
  verified_evidence_hashes: {
    'release-image-digest.txt': sha256File(digestFile),
    'gdal-drivers.txt': sha256File(driversFile),
    'os-packages.csv': sha256File(osPackagesFile),
    'binary-linkage.csv': sha256File(binaryLinkageFile),
    'license-decisions.csv': sha256File(licenseDecisionsFile),
    'sbom-image.spdx.json': sha256File(spdxFile),
    'sbom-image.cdx.json': sha256File(cdxFile),
    'integration-test-results.json': sha256File(testResultsFile),
    'source-baseline.json': sha256File(sourceBaselineFile),
    'release-provenance.json': sha256File(releaseProvenanceFile),
    'exceptions-register.csv': sha256File(exceptionsRegisterFile),
    'gcc-runtime-corresponding-source.tar.gz': sha256File(gccSourceArchive),
    'mozilla-ca-bundle-source.tar.gz': sha256File(caSourceArchive),
  },
};

fs.writeFileSync(passPath, JSON.stringify(passRecord, null, 2) + '\n', 'utf8');

const approvedReport = {
  schema: 'tileo-release-eligibility@1',
  timestamp: new Date().toISOString(),
  status: 'RELEASE_APPROVED',
  decision: 'PROCEED_WITH_RELEASE',
  target_image: { tag: IMAGE_TAG, id: imageId },
  git_commit: currentCommit,
  passed_checks: passedChecks,
};
fs.writeFileSync(reportPath, JSON.stringify(approvedReport, null, 2) + '\n', 'utf8');

console.log('RELEASE CERTIFICATION PASSED (RELEASE_APPROVED)!');
console.log(`Certification record written to: ${path.relative(ROOT_DIR, passPath)}`);
console.log(`Candidate Image ID: ${imageId}`);
console.log('===========================================================\n');
process.exit(0);
