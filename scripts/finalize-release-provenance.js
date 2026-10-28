#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { atomicWrite, inspectImage, listFiles, parseArgs, readJson, relativeSafe, sha256File } from './lib/release-evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
let options;
try { options = parseArgs(process.argv.slice(2), { '--image': 'required', '--evidence-dir': 'required' }); }
catch (error) { console.error(error.message); process.exit(2); }
const evidence = path.resolve(options['evidence-dir']);
if (path.basename(evidence) !== `v${version}`) throw new Error(`Evidence root must end in v${version}`);
const image = inspectImage(options.image);
const candidate = readJson(path.join(evidence, 'candidate.json'), 'tileo-release-candidate@1');
if (candidate.image_id !== image.id) throw new Error('Candidate/image mismatch while finalizing provenance');
const provenancePath = path.join(evidence, 'image/release-provenance.json');
const provenance = readJson(provenancePath, 'tileo-release-provenance@1');
if (provenance.image?.id !== image.id || provenance.source_baseline?.git?.commit !== candidate.commit) throw new Error('Audit provenance subject mismatch');
const excluded = new Set(['image/release-provenance.json', 'gate/technical-eligibility.json', 'core-evidence-manifest.json']);
provenance.finalized_at = new Date().toISOString();
provenance.final_subject = { candidate_id: candidate.candidate_id, commit: candidate.commit, image_id: image.id, platform: image.platform };
provenance.final_artifacts = listFiles(evidence).map((file) => relativeSafe(evidence, file)).filter((relative) => !excluded.has(relative)).map((relative) => ({ path: relative, bytes: fs.statSync(path.join(evidence, relative.replaceAll('/', path.sep))).size, sha256: sha256File(path.join(evidence, relative.replaceAll('/', path.sep))) }));
atomicWrite(provenancePath, JSON.stringify(provenance, null, 2) + '\n');
console.log(`Final provenance bound ${provenance.final_artifacts.length} artifacts to ${candidate.candidate_id}`);
