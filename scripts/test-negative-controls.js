#!/usr/bin/env node
/**
 * TileO Release Gate Negative Controls Test Suite
 *
 * Verifies that the release gate, license policy engine, native license verifier,
 * and certification gate rigorously fail when encountering:
 *  1. Banned package (sharp) in package-lock (invokes scripts/verify-npm-notices.js)
 *  2. Copyleft GPL package in package-lock (invokes scripts/verify-npm-notices.js)
 *  3. Tampered native component hash in manifest (invokes scripts/verify-native-licenses.js)
 *  4. Missing native component license file (invokes scripts/verify-native-licenses.js)
 *  5. Failed or missing integration tests (invokes scripts/certify-release-gate.js)
 *  6. Banned binary detected in SBOM (PVRTexToolCLI) (invokes scripts/certify-release-gate.js)
 *  7. Forbidden dynamic linkage (libidn2) in image (invokes scripts/certify-release-gate.js)
 *  8. Missing human approval signoff (invokes scripts/certify-release-gate.js)
 *
 * Emits execution record to release-gate-negative-tests.log
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
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

const OUT_DIR = path.resolve(ROOT_DIR, getArg('out-dir', 'artifacts/compliance'));
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}
const LOG_FILE = path.join(OUT_DIR, 'release-gate-negative-tests.log');
const logEntries = [];

function log(msg) {
  console.log(msg);
  logEntries.push(msg);
}

function flushLog() {
  fs.writeFileSync(LOG_FILE, logEntries.join('\n') + '\n', 'utf8');
}

let passedTests = 0;
let totalTests = 0;

function runNegativeTest({ id, name, description, execute, expectedError }) {
  totalTests++;
  log(`\n======================================================`);
  log(`TEST [${id}]: ${name}`);
  log(`Description: ${description}`);
  log(`Expected rejection: ${expectedError}`);
  log(`------------------------------------------------------`);

  try {
    const result = execute();
    log(`RESULT: FAILED - Control did not reject! Returned output: ${result}`);
    throw new Error(`Negative test ${id} failed: Expected rejection did not occur.`);
  } catch (err) {
    const errorMsg = String(err.stdout || '') + String(err.stderr || '') + String(err.message || '');
    const matches = errorMsg.includes(expectedError);
    if (matches) {
      log(`REJECTION DETECTED: Correctly rejected with expected diagnostic.`);
      const snippet = errorMsg.split('\n').filter(l => l.includes(expectedError))[0] || errorMsg.trim().split('\n')[0];
      log(`Diagnostic output snippet: ${snippet.trim()}`);
      log(`TEST [${id}] STATUS: PASSED (Negative control verified)`);
      passedTests++;
    } else {
      log(`RESULT: FAILED - Rejected, but diagnostic message did not match!`);
      log(`Got output:\n${errorMsg}`);
      throw new Error(`Negative test ${id} failed: message mismatch`);
    }
  }
}

log(`TileO Release Gate Negative Controls Test Runner (End-to-End Gate Verification)`);
log(`Date: ${new Date().toISOString()}`);
log(`Target: Release gate and compliance enforcement scripts`);

// Helper to copy valid compliance artifacts to a temporary directory
function createTmpEvidenceDir() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-gate-neg-'));
  const sourceFiles = [
    'release-image-digest.txt', 'gdal-drivers.txt', 'os-packages.csv',
    'binary-linkage.csv', 'license-decisions.csv', 'sbom-image.spdx.json',
    'sbom-image.cdx.json', 'source-baseline.json', 'release-provenance.json',
    'integration-test-results.json'
  ];
  for (const f of sourceFiles) {
    const src = path.join(OUT_DIR, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(tmpDir, f));
    }
  }
  return tmpDir;
}

// Test 1: Banned package in package-lock.json (executes release-gate.js)
runNegativeTest({
  id: 'NEG-01',
  name: 'Banned package (sharp) rejection in release-gate.js',
  description: 'Injects "sharp" into package-lock and invokes real release-gate.js',
  expectedError: 'Forbidden package "sharp" found in package-lock',
  execute: () => {
    const lockPath = path.join(ROOT_DIR, 'package-lock.json');
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    lock.packages['node_modules/sharp'] = {
      version: '0.33.5',
      resolved: 'https://registry.npmjs.org/sharp/-/sharp-0.33.5.tgz',
      integrity: 'sha512-fake',
      license: 'Apache-2.0'
    };
    const tmpLock = path.join(os.tmpdir(), `package-lock-sharp-${Date.now()}.json`);
    fs.writeFileSync(tmpLock, JSON.stringify(lock, null, 2), 'utf8');

    try {
      return execFileSync('node', ['scripts/release-gate.js', '--lockfile', tmpLock], {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } finally {
      if (fs.existsSync(tmpLock)) fs.unlinkSync(tmpLock);
    }
  }
});

// Test 2: Copyleft GPL package in package-lock.json (executes release-gate.js)
runNegativeTest({
  id: 'NEG-02',
  name: 'Copyleft GPL license rejection in release-gate.js',
  description: 'Injects a GPL-3.0 package into package-lock and invokes real release-gate.js',
  expectedError: 'Non-permissive license "GPL-3.0-only"',
  execute: () => {
    const lockPath = path.join(ROOT_DIR, 'package-lock.json');
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    lock.packages['node_modules/gpl-test-tool'] = {
      version: '1.0.0',
      resolved: 'https://registry.npmjs.org/gpl-test-tool/-/gpl-test-tool-1.0.0.tgz',
      integrity: 'sha512-fake',
      license: 'GPL-3.0-only'
    };
    const tmpLock = path.join(os.tmpdir(), `package-lock-gpl-${Date.now()}.json`);
    fs.writeFileSync(tmpLock, JSON.stringify(lock, null, 2), 'utf8');

    try {
      return execFileSync('node', ['scripts/release-gate.js', '--lockfile', tmpLock], {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } finally {
      if (fs.existsSync(tmpLock)) fs.unlinkSync(tmpLock);
    }
  }
});

// Test 3: Tampered native license file hash in components.json (executes verify-native-licenses.js)
runNegativeTest({
  id: 'NEG-03',
  name: 'Tampered native component hash rejection in verify-native-licenses.js',
  description: 'Alters sha256 hash in components.json and invokes real verify-native-licenses.js',
  expectedError: 'sha256 mismatch',
  execute: () => {
    const compPath = path.join(ROOT_DIR, 'third-party', 'native', 'components.json');
    const comp = JSON.parse(fs.readFileSync(compPath, 'utf8'));
    comp.components[0].license_files[0].sha256 = '0000000000000000000000000000000000000000000000000000000000000000';

    const tmpComp = path.join(os.tmpdir(), `components-tampered-${Date.now()}.json`);
    fs.writeFileSync(tmpComp, JSON.stringify(comp, null, 2), 'utf8');

    try {
      return execFileSync('node', ['scripts/verify-native-licenses.js', '--manifest', tmpComp], {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } finally {
      if (fs.existsSync(tmpComp)) fs.unlinkSync(tmpComp);
    }
  }
});

// Test 4: Missing native license file in components.json (executes verify-native-licenses.js)
runNegativeTest({
  id: 'NEG-04',
  name: 'Missing native component license file rejection in verify-native-licenses.js',
  description: 'Injects non-existent license file into components.json and invokes real verify-native-licenses.js',
  expectedError: 'missing',
  execute: () => {
    const compPath = path.join(ROOT_DIR, 'third-party', 'native', 'components.json');
    const comp = JSON.parse(fs.readFileSync(compPath, 'utf8'));
    comp.components[0].license_files.push({
      file: 'NON_EXISTENT_LICENSE.txt',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    });

    const tmpComp = path.join(os.tmpdir(), `components-missing-${Date.now()}.json`);
    fs.writeFileSync(tmpComp, JSON.stringify(comp, null, 2), 'utf8');

    try {
      return execFileSync('node', ['scripts/verify-native-licenses.js', '--manifest', tmpComp], {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } finally {
      if (fs.existsSync(tmpComp)) fs.unlinkSync(tmpComp);
    }
  }
});

// Test 5: Failed integration tests rejection in certify-release-gate.js
runNegativeTest({
  id: 'NEG-05',
  name: 'Failed integration test suite rejection in certify-release-gate.js',
  description: 'Creates test results with 2 failures and invokes certify-release-gate.js',
  expectedError: 'Gate 4 Failed: Integration tests did not pass',
  execute: () => {
    const tmpEvidence = createTmpEvidenceDir();
    const resultsFile = path.join(tmpEvidence, 'integration-test-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify({
      target_image: 'tileo-ts:local',
      image_id: 'test-image-id',
      total_tests: 129,
      passed: 127,
      failed: 2,
      all_passed: false
    }, null, 2), 'utf8');

    try {
      return execFileSync('node', ['scripts/certify-release-gate.js', '--out-dir', tmpEvidence], {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } finally {
      fs.rmSync(tmpEvidence, { recursive: true, force: true });
    }
  }
});

// Test 6: Banned binary detected in SPDX SBOM (PVRTexToolCLI) in certify-release-gate.js
runNegativeTest({
  id: 'NEG-06',
  name: 'Banned binary (PVRTexToolCLI) rejection in certify-release-gate.js',
  description: 'Injects PVRTexToolCLI into SPDX SBOM and invokes certify-release-gate.js',
  expectedError: 'Gate 3 Failed: Banned binary or component "PVRTexToolCLI" detected in SPDX SBOM',
  execute: () => {
    const tmpEvidence = createTmpEvidenceDir();
    const spdxFile = path.join(tmpEvidence, 'sbom-image.spdx.json');
    const spdx = fs.readFileSync(spdxFile, 'utf8');
    const mutated = spdx.replace('"packages": [', '"packages": [{"name": "PVRTexToolCLI", "versionInfo": "1.0"},');
    fs.writeFileSync(spdxFile, mutated, 'utf8');

    try {
      return execFileSync('node', ['scripts/certify-release-gate.js', '--out-dir', tmpEvidence], {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } finally {
      fs.rmSync(tmpEvidence, { recursive: true, force: true });
    }
  }
});

// Test 7: Forbidden dynamic linkage (libidn2) in certify-release-gate.js
runNegativeTest({
  id: 'NEG-07',
  name: 'Forbidden dynamic ELF linkage (libidn2) rejection in certify-release-gate.js',
  description: 'Injects libidn2 linkage into binary-linkage.csv and invokes certify-release-gate.js',
  expectedError: 'Gate 3 Failed: Copyleft library detected in binary linkage',
  execute: () => {
    const tmpEvidence = createTmpEvidenceDir();
    const linkageFile = path.join(tmpEvidence, 'binary-linkage.csv');
    fs.appendFileSync(linkageFile, '\n/usr/local/lib/libcurl.so,libidn2.so.0,NON_ALLOW\n', 'utf8');

    try {
      return execFileSync('node', ['scripts/certify-release-gate.js', '--out-dir', tmpEvidence], {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } finally {
      fs.rmSync(tmpEvidence, { recursive: true, force: true });
    }
  }
});

// Test 8: Unapproved release governance signoff in certify-release-gate.js
runNegativeTest({
  id: 'NEG-08',
  name: 'Unapproved release governance signoff rejection in certify-release-gate.js',
  description: 'Invokes certify-release-gate.js with --enforce-human-approval against unfinalized approval doc',
  expectedError: 'Gate 6 Failed: Human approval in release-approval.md has PENDING',
  execute: () => {
    const tmpEvidence = createTmpEvidenceDir();
    try {
      return execFileSync('node', ['scripts/certify-release-gate.js', '--out-dir', tmpEvidence, '--enforce-human-approval'], {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } finally {
      fs.rmSync(tmpEvidence, { recursive: true, force: true });
    }
  }
});

log(`\n======================================================`);
log(`SUMMARY: All ${passedTests}/${totalTests} negative control tests passed cleanly.`);
log(`Confirmed: Release certification gate and compliance scripts reject all tested non-permissive configurations.`);
log(`Execution log written to: ${LOG_FILE}`);
log(`======================================================\n`);

flushLog();
