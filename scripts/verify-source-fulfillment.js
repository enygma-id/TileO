#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { atomicWrite, inspectImage, parseArgs, parseCsv, readJson, sha256File, TAR_EXECUTABLE } from './lib/release-evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
let options;
try { options = parseArgs(process.argv.slice(2), { '--image': 'required', '--evidence-dir': 'required' }); }
catch (error) { console.error(error.message); process.exit(2); }
const evidence = path.resolve(options['evidence-dir']);
if (path.basename(evidence) !== `v${version}`) throw new Error(`Evidence root must end in v${version}`);
const image = inspectImage(options.image);
const compliance = path.join(evidence, 'compliance');
const imageDir = path.join(evidence, 'image');
const registerPath = path.join(compliance, 'exceptions-register.csv');
const sourceProvenancePath = path.join(compliance, 'source-provenance.json');
const AUTHENTIC_SOURCE = {
  'gcc-runtime': { package: '14.2.0-r4', upstream_sha256: 'a7b39bc69cbf9e25826c5a60ab26477001f7c08d85cec04bc0e29cabed6f3cc9', aports_commit: '1a03a2a9c9e77f1a07d48b6f6805e72c8c63c03f', aports_archive_sha256: 'fa78002197d55fe1c360efcbba9d6e914ec171987648f388b04a161740d15f22' },
  'mozilla-ca-bundle': { package: '20261020-r0', upstream_sha256: '1048bc7f50fa42a6621bc2f8816173f89a0c0098f26dff072bc8fe40af714400', aports_commit: '660f223b42ca35e7d2a76ce568e15c847b92d33d', aports_archive_sha256: 'd8da92bbd76fc9f836c5e357ae75ddf90843a507e8059700ef7f16043500590a' },
};
for (const required of [registerPath, sourceProvenancePath]) if (!fs.existsSync(required)) throw new Error(`Missing ${path.relative(evidence, required)}`);

const rows = parseCsv(fs.readFileSync(registerPath, 'utf8'));
const requiredColumns = ['exception_id', 'component', 'package_version', 'origin', 'shipped_file', 'license_expression', 'binary_sha256', 'source_archive', 'source_archive_sha256', 'upstream_recipe_revision', 'image_id', 'technical_status', 'legal_decision'];
for (const column of requiredColumns) if (!rows.every((row) => Object.hasOwn(row, column))) throw new Error(`Exception register is missing ${column}`);
if (rows.length !== 3 || rows.map((row) => row.exception_id).join(',') !== 'EXC-001,EXC-002,EXC-003') throw new Error('Exception register must contain exactly EXC-001, EXC-002 and EXC-003 in order');
if (new Set(rows.map((row) => row.component)).size !== 3) throw new Error('Exception register contains duplicate components');
for (const row of rows) {
  if (!/^[0-9a-f]{64}$/.test(row.binary_sha256) || /^0+$/.test(row.binary_sha256)) throw new Error(`${row.exception_id} has an invalid binary SHA-256`);
  if (!/^[0-9a-f]{64}$/.test(row.source_archive_sha256) || /^0+$/.test(row.source_archive_sha256)) throw new Error(`${row.exception_id} has an invalid source SHA-256`);
  if (row.image_id !== image.id) throw new Error(`${row.exception_id} is bound to ${row.image_id}, not ${image.id}`);
  if (row.technical_status !== 'VERIFIED') throw new Error(`${row.exception_id} technical status is not VERIFIED`);
  if (row.legal_decision !== 'LEGAL_APPROVAL_PENDING') throw new Error(`${row.exception_id} core legal decision must remain LEGAL_APPROVAL_PENDING`);
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-source-verify-'));
const container = execFileSync('docker', ['create', image.id], { encoding: 'utf8' }).trim();
const extracted = {};
try {
  for (const row of rows) {
    const destination = path.join(temp, path.basename(row.shipped_file));
    execFileSync('docker', ['cp', `${container}:${row.shipped_file}`, destination], { stdio: 'pipe' });
    const actual = sha256File(destination);
    if (actual !== row.binary_sha256) throw new Error(`${row.exception_id} image bytes hash ${actual}, register records ${row.binary_sha256}`);
    extracted[row.shipped_file] = { sha256: actual, bytes: fs.statSync(destination).size };
    const sourceArchive = path.join(compliance, row.source_archive.replaceAll('/', path.sep));
    if (!fs.existsSync(sourceArchive) || sha256File(sourceArchive) !== row.source_archive_sha256) throw new Error(`${row.exception_id} source archive hash mismatch`);
  }
} finally {
  execFileSync('docker', ['rm', container], { stdio: 'ignore' });
  fs.rmSync(temp, { recursive: true, force: true });
}

const provenance = readJson(sourceProvenancePath, 'tileo-source-provenance@3');
if (provenance.target_image?.id !== image.id) throw new Error('Source provenance image mismatch');
const archiveManifests = {};
for (const [relative, expectedHash] of Object.entries(provenance.archives ?? {})) {
  const archive = path.join(compliance, relative.replaceAll('/', path.sep));
  if (!fs.existsSync(archive) || sha256File(archive) !== expectedHash) throw new Error(`${relative} does not match source provenance`);
  const manifestText = execFileSync(TAR_EXECUTABLE, ['-xOf', archive, './SOURCE-MANIFEST.json'], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  const manifest = JSON.parse(manifestText);
  if (manifest.target_image?.id !== image.id) throw new Error(`${relative} manifest image mismatch`);
  const authentic = AUTHENTIC_SOURCE[manifest.component];
  if (!authentic || manifest.package !== authentic.package || manifest.upstream?.sha256 !== authentic.upstream_sha256 || manifest.alpine_aport?.commit !== authentic.aports_commit || manifest.alpine_aport?.archive_sha256 !== authentic.aports_archive_sha256) throw new Error(`${relative} authenticity pins do not match the approved upstream source and Alpine recipe`);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-source-content-'));
  try {
    execFileSync(TAR_EXECUTABLE, ['-xzf', archive, '-C', work], { stdio: 'pipe' });
    const upstream = path.join(work, manifest.upstream.file);
    if (sha256File(upstream) !== manifest.upstream.sha256) throw new Error(`${relative} upstream source SHA-256 mismatch`);
    const aport = path.join(work, 'alpine-aport');
    const files = Object.fromEntries(fs.readdirSync(aport).filter((name) => fs.statSync(path.join(aport, name)).isFile()).sort().map((name) => [name, sha256File(path.join(aport, name))]));
    if (JSON.stringify(files) !== JSON.stringify(manifest.alpine_aport.files)) throw new Error(`${relative} aport/patch file set or hash mismatch`);
    if (manifest.alpine_aport.patch_count !== Object.keys(files).filter((name) => name.endsWith('.patch')).length) throw new Error(`${relative} patch count mismatch`);
  } finally { fs.rmSync(work, { recursive: true, force: true }); }
  archiveManifests[manifest.component] = manifest;
}
if (!archiveManifests['gcc-runtime'] || !archiveManifests['mozilla-ca-bundle']) throw new Error('Both authentic GCC and Mozilla CA source manifests are required');
const ca = archiveManifests['mozilla-ca-bundle'];
if (ca.verification?.equal !== true || ca.verification.image_bundle_sha256 !== extracted['/etc/ssl/certs/ca-certificates.crt'].sha256 || ca.verification.rebuilt_bundle_sha256 !== ca.verification.image_bundle_sha256) throw new Error('CA rebuild does not equal the actual image bundle');

const result = {
  schema: 'tileo-source-verification@1',
  generated_at: new Date().toISOString(),
  status: 'VERIFIED',
  image: { id: image.id, platform: image.platform },
  extracted_runtime: extracted,
  components: Object.fromEntries(Object.entries(archiveManifests).map(([name, manifest]) => [name, { package: manifest.package, upstream_sha256: manifest.upstream.sha256, aports_commit: manifest.alpine_aport.commit, patch_count: manifest.alpine_aport.patch_count }]))
};
atomicWrite(path.join(compliance, 'source-verification.json'), JSON.stringify(result, null, 2) + '\n');
atomicWrite(path.join(compliance, 'ca-rebuild-verification.json'), JSON.stringify({ schema: 'tileo-ca-rebuild-verification@1', image_id: image.id, source_sha256: ca.upstream.sha256, rebuilt_bundle_sha256: ca.verification.rebuilt_bundle_sha256, image_bundle_sha256: ca.verification.image_bundle_sha256, equal: true }, null, 2) + '\n');
atomicWrite(path.join(imageDir, 'runtime-file-hashes.json'), JSON.stringify({ schema: 'tileo-runtime-file-hashes@1', image_id: image.id, files: extracted }, null, 2) + '\n');
console.log(`Source fulfillment VERIFIED for ${image.id}`);
