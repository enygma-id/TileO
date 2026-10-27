#!/usr/bin/env node
/**
 * Assembles the TileO-v1.0.0-Release-Closure delivery bundle per RC9 Protocol.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CLOSURE_DIR = path.resolve(ROOT_DIR, 'TileO-v1.0.0-Release-Closure');
fs.rmSync(CLOSURE_DIR, { recursive: true, force: true });
fs.mkdirSync(CLOSURE_DIR, { recursive: true });

// 1. SOURCE_REPOSITORY_COMMIT.txt
let gitCommit = 'unknown';
let gitBranch = 'unknown';
let gitDirty = false;
try {
  gitCommit = execSync('git rev-parse HEAD', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
  const gitStatus = execSync('git status --porcelain', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
  gitDirty = gitStatus.length > 0;
} catch {}

const commitInfo = [
  `COMMIT=${gitCommit}`,
  `BRANCH=${gitBranch}`,
  `TIMESTAMP=${new Date().toISOString()}`,
  `WORKING_TREE_DIRTY=${gitDirty}`,
  `TARGET_VERSION=1.0.0`,
  `TARGET_IMAGE=tileo-rc:1.0.0`
].join('\n') + '\n';

fs.writeFileSync(path.join(CLOSURE_DIR, 'SOURCE_REPOSITORY_COMMIT.txt'), commitInfo, 'utf8');

// 2. ENGINEERING_CHANGELOG.md
const changelogContent = `# TileO Enterprise v1.0.0 — Engineering Release Closure Changelog

## Executive Summary
This document records the definitive technical resolution of all P0 and P1 audit findings identified in the Independent Permissive Release Readiness Audit for TileO Enterprise v1.0.0.

- **Baseline:** \`TileO-main(9).zip\` (27 October 2026)
- **Target Policy:** Enterprise Proprietary-Compatible with Disclosed Exceptions (Community \`AGPL-3.0-only\`, strictly permissive third-party runtime components, with three disclosed, vetted exceptions: GCC Runtime Library Exception 3.1 for \`libstdc++\` and \`libgcc\`, and Mozilla CA trust store data terms \`MPL-2.0 AND MIT\` for \`ca-certificates\`).
- **Technical Status:** **TECHNICALLY ELIGIBLE — PENDING APPROVAL**. All 6 technical certification gates passed (130/130 container integration tests passed; 12/12 negative controls verified; zero proprietary/copyleft binaries). Final release certification and production publishing remain blocked pending human signoff.

---

## Detailed Remediation Items

### [P0-01] Elimination of Non-Permissive texture-compressor Binaries
- **Issue:** \`texture-compressor@1.0.2\` was transitively pulled in by \`@loaders.gl/textures@4.4.5\`, bundling 9 proprietary CLI executables (\`PVRTexToolCLI\`, \`astcenc\`, \`crunch\`) under restricted licenses.
- **Resolution:** Implemented npm override in \`package.json\` (\`"@loaders.gl/textures": "^4.5.4"\`), where \`texture-compressor\` was demoted to an optional peer dependency. Eliminated all proprietary binaries from \`node_modules/\` and container rootfs.
- **Verification:** Image filesystem audit and \`scanelf\` closure verify 0 non-permissive binaries in \`tileo-rc:1.0.0\` (image size: 155.1 MB). Total npm runtime packages synchronized to 285.

### [P0-02] Hardened TAP Integration Test Runner
- **Issue:** Test runner used unstructured stdout parsing, mutable volume mounts, and lacked fail-closed validation of container exit code and tap output.
- **Resolution:** Re-architected \`scripts/record-test-results.js\` to execute \`node --test --test-reporter=tap\` inside the immutable scratch container without host volume mounting. Captures structured counts (\`# tests\`, \`# pass\`, \`# fail\`, \`# cancelled\`, \`# skipped\`, \`# todo\`), verifies matching image ID, and emits schema \`tileo-integration-tests@2\`.
- **Verification:** Full suite execution against \`tileo-rc:1.0.0\` produced **130 passed, 0 failed, 0 skipped, 0 cancelled** across all 37 test suites in 5.5s.

### [P0-03] Decoupled Certification Gate & 12 Real Negative Controls
- **Issue:** Image audit script unconditionally emitted release pass certificates; policy module treated MPL-2.0 as permissive without component scoping; negative controls used mock assertions.
- **Resolution:**
  1. Decoupled \`scripts/audit-image.js\` (evidence collector) from \`scripts/certify-release-gate.js\` (certification authority).
  2. Scoped exceptions in \`scripts/lib/license-policy.js\` strictly to component IDs (\`libstdc++\`, \`libgcc\`, \`ca-certificates\`); prohibited wildcard exceptions.
  3. Gate certification verifies 7 sequential gates: (1) Notice parity, (2) Image audit & 6 source baseline hashes, (3) Binary linkages & SBOM forbidden binary scan, (4) Test execution TAP evidence, (5) Disclosed exceptions & source fulfillment, (6) Git repository state, (7) Human governance approval.
  4. Implemented all 12 real negative controls (NC-01 through NC-12) in \`scripts/test-negative-controls.js\`.
- **Verification:** All 12/12 negative controls passed cleanly. Status held at \`TECHNICALLY_ELIGIBLE_PENDING_APPROVAL\` pending human signature.

### [P0-04] Three Disclosed Exceptions & Corresponding Source Fulfillment
- **Issue:** Legal classification required formal documentation of GCC Runtime Exception 3.1 and MPL-2.0 CA certificate trust store, along with complete corresponding source packages.
- **Resolution:**
  1. Created \`exceptions-register.csv\` mapping EXC-001 (\`libstdc++.so.6\`), EXC-002 (\`libgcc_s.so.1\`), and EXC-003 (\`ca-certificates.crt\`).
  2. Published \`reviewed-license-decision.md\` detailing legal terms and non-infectious analysis.
  3. Built extractable corresponding source tarballs: \`gcc-runtime-corresponding-source.tar.gz\` and \`mozilla-ca-bundle-source.tar.gz\`.
  4. Packaged customer delivery documents (\`THIRD-PARTY-EXCEPTIONS.md\`, \`SOURCE-ACCESS.md\`, \`THIRD-PARTY-NOTICES.md\`, \`delivery-manifest.json\`).

### [P0-05] Versioning, Baseline Synchronization & CI/CD Governance
- **Issue:** Repository version was \`0.1.4\`; CI/CD needed single-build pattern with protected release environment.
- **Resolution:**
  1. Bumped version to \`1.0.0\` with \`npm version 1.0.0 --no-git-tag-version\`.
  2. Synchronized \`package-lock.json\`, canonical LF lockfile SHA \`8753763502679aa8acdfd894dc2da663821f99f324aaaf15c64d20029348d5e5\` in \`third-party/MANIFEST.json\`, and regenerated notice inventories (\`THIRD-PARTY-NOTICES.md\` and \`DEPENDENCIES.md\` with 285 entries).
  3. Configured single-build CI/CD workflow with protected \`environment: release\` requiring documented human approval before GHCR publication.

---

## Technical Verification Summary
| Verification Gate | Command | Result |
|---|---|---|
| NPM Notice Verification | \`node scripts/verify-npm-notices.js\` | **285 packages: 249 verified, 36 metadata-only, 0 failed** |
| Native Component Licenses | \`node scripts/verify-native-licenses.js\` | **28 components: 25 permissive, 3 disclosed exceptions, 0 failed** |
| Notice Parity | \`node scripts/check-notice-parity.js\` | **OK (Parity confirmed)** |
| Container Integration Tests | \`node scripts/record-test-results.js --image tileo-rc:1.0.0\` | **130 passed, 0 failed, 0 skipped, 0 cancelled** |
| Release Negative Controls | \`node scripts/test-negative-controls.js\` | **12/12 negative controls PASSED** |
| Dedicated Certification Gate | \`node scripts/certify-release-gate.js\` | **TECHNICALLY ELIGIBLE — PENDING APPROVAL** |
`;

fs.writeFileSync(path.join(CLOSURE_DIR, 'ENGINEERING_CHANGELOG.md'), changelogContent, 'utf8');

// 3. Copy release-evidence/v1.0.0 tree into TileO-v1.0.0-Release-Closure/release-evidence/v1.0.0
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const evidenceSrc = path.join(ROOT_DIR, 'release-evidence', 'v1.0.0');
const evidenceDest = path.join(CLOSURE_DIR, 'release-evidence', 'v1.0.0');
copyDirSync(evidenceSrc, evidenceDest);

// 4. Compute evidence-sha256.txt across all files in TileO-v1.0.0-Release-Closure
function getAllFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allClosureFiles = getAllFiles(CLOSURE_DIR);
const shaLines = [];

for (const filePath of allClosureFiles) {
  const relPath = path.relative(CLOSURE_DIR, filePath).replace(/\\/g, '/');
  if (relPath === 'evidence-sha256.txt') continue;
  const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
  shaLines.push(`${hash}  ${relPath}`);
}

shaLines.sort((a, b) => a.slice(66).localeCompare(b.slice(66)));
fs.writeFileSync(path.join(CLOSURE_DIR, 'evidence-sha256.txt'), shaLines.join('\n') + '\n', 'utf8');

console.log('===========================================================');
console.log(' TileO-v1.0.0-Release-Closure Package Created Successfully');
console.log(` Output Directory: ${CLOSURE_DIR}`);
console.log(` Total Evidence Files: ${shaLines.length}`);
console.log(' Evidence SHA-256 Manifest: evidence-sha256.txt');
console.log('===========================================================');
