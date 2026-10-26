#!/usr/bin/env node
/**
 * TileO - notice parity gate.
 *
 * Fails when committed notices/manifests are stale relative to the lockfile,
 * when a native license hash does not match, or when a historical claim that
 * is no longer true survives in the release documentation.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { evaluateExpression } from './lib/license-policy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const problems = [];

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
}

function run(script, env) {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', script)], {
    cwd: ROOT,
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
  if (result.status !== 0) problems.push(`${script} failed: ${(result.stderr || result.stdout).trim()}`);
  return result;
}

const lockBuffer = fs.readFileSync(path.join(ROOT, 'package-lock.json'));
const lock = JSON.parse(lockBuffer.toString('utf8'));
const manifest = readJson('third-party/MANIFEST.json');
const native = readJson('third-party/native/components.json');
const lockSha = sha256(Buffer.from(lockBuffer.toString('utf8').replace(/\r\n/g, '\n'), 'utf8'));

if (manifest.reference_lockfile_sha256 !== lockSha) {
  problems.push('MANIFEST.json lockfile hash is stale; run verify-npm-notices.js --update');
}
const lockEntries = Object.entries(lock.packages || {}).filter(([key]) => key !== '');
if (manifest.packages.length !== lockEntries.length) {
  problems.push(`MANIFEST.json has ${manifest.packages.length} entries; lockfile has ${lockEntries.length}`);
}
const manifestByPath = new Map(manifest.packages.map((pkg) => [pkg.package_path, pkg]));
for (const [lockPath] of lockEntries) {
  const record = manifestByPath.get(lockPath);
  if (!record) {
    problems.push(`MANIFEST.json missing ${lockPath}`);
    continue;
  }
  const status = record.upstream_verification?.status;
  if (!['verified_upstream_tarball', 'metadata_only_no_license_file'].includes(status)) {
    problems.push(`${lockPath}: invalid verification status ${status}`);
  }
  for (const file of record.upstream_verification?.files ?? []) {
    if (file.stored === 'package.json') continue;
    const absolute = path.join(ROOT, 'third-party', 'licenses', 'npm', record.name, record.version, file.stored);
    if (!fs.existsSync(absolute)) problems.push(`${lockPath}: missing ${file.stored}`);
    else if (sha256(fs.readFileSync(absolute)) !== file.sha256) problems.push(`${lockPath}: hash mismatch ${file.stored}`);
  }
}

for (const component of native.components) {
  const evaluation = evaluateExpression(component.license_expression);
  if (!evaluation.allowed) problems.push(`${component.id}: non-permissive expression ${component.license_expression}`);
  if (evaluation.exceptions.length > 0 && !component.review) problems.push(`${component.id}: unreviewed exception`);
  for (const file of component.license_files) {
    const absolute = path.join(ROOT, 'third-party', 'licenses', 'native', component.id, file.file);
    if (!fs.existsSync(absolute)) {
      problems.push(`${component.id}: missing ${file.file}`);
      continue;
    }
    const data = fs.readFileSync(absolute);
    if (!file.sha256) problems.push(`${component.id}/${file.file}: no sha256`);
    else if (sha256(data) !== file.sha256) problems.push(`${component.id}/${file.file}: hash mismatch`);
  }
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-notice-parity-'));
try {
  const generatedNotices = path.join(temp, 'THIRD-PARTY-NOTICES.md');
  const generatedDependencies = path.join(temp, 'DEPENDENCIES.md');
  run('generate-third-party-notices.js', { TILEO_NOTICES_OUTPUT: generatedNotices });
  run('generate-dependency-inventory.js', { TILEO_DEPENDENCIES_OUTPUT: generatedDependencies });

  const committedNotices = path.join(ROOT, 'THIRD-PARTY-NOTICES.md');
  const committedDependencies = path.join(ROOT, 'third-party', 'DEPENDENCIES.md');
  if (fs.existsSync(generatedNotices) && fs.existsSync(committedNotices)) {
    const genNorm = fs.readFileSync(generatedNotices, 'utf8').replace(/\r\n/g, '\n');
    const comNorm = fs.readFileSync(committedNotices, 'utf8').replace(/\r\n/g, '\n');
    if (sha256(genNorm) !== sha256(comNorm)) {
      problems.push('THIRD-PARTY-NOTICES.md is stale; run scripts/generate-third-party-notices.js');
    }
  }
  if (fs.existsSync(generatedDependencies) && fs.existsSync(committedDependencies)) {
    const genNorm = fs.readFileSync(generatedDependencies, 'utf8').replace(/\r\n/g, '\n');
    const comNorm = fs.readFileSync(committedDependencies, 'utf8').replace(/\r\n/g, '\n');
    if (sha256(genNorm) !== sha256(comNorm)) {
      problems.push('third-party/DEPENDENCIES.md is stale; run scripts/generate-dependency-inventory.js');
    }
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

const notices = fs.readFileSync(path.join(ROOT, 'THIRD-PARTY-NOTICES.md'), 'utf8');
for (const stale of [
  'tileo:min-musl',
  '284 non-root entries',
  'All third-party software components bundled or dynamically linked in release artifacts have been migrated and audited',
]) {
  if (notices.includes(stale)) problems.push(`stale claim in notices: ${stale}`);
}
if (!notices.includes('Musl C Library')) problems.push('notices do not document the Musl C Library');
if (!notices.includes('GDAL')) problems.push('notices do not document GDAL');
if (!notices.includes('Tippecanoe')) problems.push('notices do not document Tippecanoe');
for (const component of native.components) {
  if (!notices.includes(component.name)) problems.push(`notices do not mention native component ${component.id}`);
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`FAIL ${problem}`);
  process.exitCode = 1;
} else {
  console.log(`Notice parity OK: ${manifest.packages.length} npm entries, ${native.components.length} native components.`);
}
