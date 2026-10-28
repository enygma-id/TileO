#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { atomicWrite, listFiles, parseArgs, readJson, relativeSafe, sha256File, TAR_EXECUTABLE } from './lib/release-evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
let options;
try { options = parseArgs(process.argv.slice(2), { '--evidence-dir': 'required', '--authorization-dir': 'required', '--out-dir': 'required', '--final': 'boolean' }); }
catch (error) { console.error(error.message); process.exit(2); }
const evidence = path.resolve(options['evidence-dir']);
const authorization = path.resolve(options['authorization-dir']);
const out = path.resolve(options['out-dir']);
if (path.basename(evidence) !== `v${version}` || !fs.existsSync(path.join(evidence, 'core-evidence-manifest.json'))) throw new Error(`Frozen v${version} core evidence and manifest are required`);
if (!fs.existsSync(authorization) || !fs.statSync(authorization).isDirectory()) throw new Error('--authorization-dir must exist');
const candidate = readJson(path.join(evidence, 'candidate.json'), 'tileo-release-candidate@1');
const manifest = readJson(path.join(evidence, 'core-evidence-manifest.json'), 'tileo-core-evidence-manifest@1');
for (const entry of manifest.files) {
  const file = path.join(evidence, entry.path.replaceAll('/', path.sep));
  if (!fs.existsSync(file) || fs.statSync(file).size !== entry.bytes || sha256File(file) !== entry.sha256) throw new Error(`Core evidence changed after freeze: ${entry.path}`);
}
const passFile = path.join(authorization, 'release-gate-pass.json');
if (options.final && !fs.existsSync(passFile)) throw new Error('--final requires authenticated release-gate-pass.json');
if (fs.existsSync(passFile)) {
  const pass = readJson(passFile, 'tileo-release-gate-pass@3');
  if (pass.status !== 'AUTHORIZED_FOR_PUBLICATION' || pass.candidate_id !== candidate.candidate_id || pass.core_evidence_sha256 !== sha256File(path.join(evidence, 'core-evidence-manifest.json'))) throw new Error('Authorization PASS does not match frozen core evidence');
}
fs.mkdirSync(out, { recursive: true });
const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-closure-'));
const closure = path.join(staging, `TileO-v${version}-Release-Closure`);
try {
  fs.cpSync(evidence, path.join(closure, 'core'), { recursive: true });
  fs.cpSync(authorization, path.join(closure, 'authorization'), { recursive: true });
  const delivery = { schema: 'tileo-release-delivery@1', status: fs.existsSync(passFile) ? 'AUTHORIZED_FOR_PUBLICATION' : 'PENDING_HUMAN_APPROVAL', candidate_id: candidate.candidate_id, version, commit: candidate.commit, image_id: candidate.image_id, platform: candidate.platform, core_evidence_sha256: sha256File(path.join(evidence, 'core-evidence-manifest.json')), authorization_files: listFiles(authorization).map((file) => ({ path: relativeSafe(authorization, file), bytes: fs.statSync(file).size, sha256: sha256File(file) })) };
  atomicWrite(path.join(closure, 'delivery-manifest.json'), JSON.stringify(delivery, null, 2) + '\n');
  const sums = listFiles(closure, new Set(['SHA256SUMS'])).map((file) => `${sha256File(file)}  ${relativeSafe(closure, file)}`).sort().join('\n') + '\n';
  atomicWrite(path.join(closure, 'SHA256SUMS'), sums);
  const archive = path.join(out, `TileO-v${version}-Release-Closure.tar.gz`);
  fs.rmSync(archive, { force: true });
  execFileSync(TAR_EXECUTABLE, ['-czf', archive, '-C', staging, path.basename(closure)], { stdio: 'pipe' });
  console.log(`Closure ${delivery.status}: ${archive}`);
  console.log(`SHA256=${sha256File(archive)}`);
} finally { fs.rmSync(staging, { recursive: true, force: true }); }
