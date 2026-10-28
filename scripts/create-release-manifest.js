#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { atomicWrite, CORE_REQUIRED_PATHS, listFiles, parseArgs, readJson, relativeSafe, sha256File } from './lib/release-evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
let options;
try { options = parseArgs(process.argv.slice(2), { '--evidence-dir': 'required', '--output': 'required' }); }
catch (error) { console.error(error.message); process.exit(2); }
const evidence = path.resolve(options['evidence-dir']);
const output = path.resolve(options.output);
if (path.basename(evidence) !== `v${version}`) throw new Error(`Evidence root must end in v${version}`);
if (path.dirname(output) !== evidence || path.basename(output) !== 'core-evidence-manifest.json') throw new Error('--output must be core-evidence-manifest.json directly inside the evidence root');
for (const relative of CORE_REQUIRED_PATHS) {
  const file = path.join(evidence, relative.replaceAll('/', path.sep));
  if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) throw new Error(`Required core evidence is missing: ${relative}`);
}
const forbidden = listFiles(evidence).map((file) => relativeSafe(evidence, file)).filter((relative) => /release-gate-pass\.json$|RELEASE_APPROVED|AUTHORIZED_FOR_PUBLICATION/i.test(relative));
if (forbidden.length) throw new Error(`Authorization/PASS artifacts cannot be part of core evidence: ${forbidden.join(', ')}`);
const candidate = readJson(path.join(evidence, 'candidate.json'), 'tileo-release-candidate@1');
const files = listFiles(evidence, new Set(['core-evidence-manifest.json'])).map((file) => ({ path: relativeSafe(evidence, file), bytes: fs.statSync(file).size, sha256: sha256File(file) }));
const manifest = { schema: 'tileo-core-evidence-manifest@1', version, candidate_id: candidate.candidate_id, commit: candidate.commit, image_id: candidate.image_id, platform: candidate.platform, files };
atomicWrite(output, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Core manifest created: ${output}`);
console.log(`CORE_EVIDENCE_SHA256=${sha256File(output)}`);
