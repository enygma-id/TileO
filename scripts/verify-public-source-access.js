#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseArgs, sha256File } from './lib/release-evidence.js';
import { assetPaths, validateAssets } from './lib/release-assets.js';
import { publicDownload } from './lib/public-download.js';
const o = parseArgs(process.argv.slice(2), { '--candidate': 'required', '--out-dir': 'required', '--closure': 'required' });
const evidence = path.dirname(path.resolve(o.candidate));
const c = JSON.parse(fs.readFileSync(o.candidate));
const out = path.resolve(o['out-dir']);
if (out === evidence || out.startsWith(evidence + path.sep)) throw Error('Receipt must be outside core');
fs.mkdirSync(out, { recursive: true });
const receipt = path.join(out, 'source-access-verification.json');
let receiptFd;
try { receiptFd = fs.openSync(receipt, 'wx', 0o600); }
catch (error) { if (error.code === 'EEXIST') throw Error('Receipt exists; select a new attempt directory'); throw error; }
const directory = fs.mkdtempSync(path.join(out, 'downloads-'));
const report = { schema: 'tileo-source-access-verification@1', checked_at: new Date().toISOString(), status: 'FAILED', candidate_id: c.candidate_id, commit: c.commit, image_id: c.image_id, repository: c.repository, tag: `v${c.version}`, core_evidence_sha256: sha256File(path.join(evidence, 'core-evidence-manifest.json')), downloads: [], failures: [] };
try {
  const required = [...Object.keys(assetPaths(c.version)), `TileO-v${c.version}-Release-Closure.tar.gz`, 'SHA256SUMS'];
  for (const name of required) report.downloads.push({ name, ...await publicDownload(`https://github.com/${c.repository}/releases/download/v${c.version}/${name}`, path.join(directory, name)) });
  validateAssets(evidence, directory, path.resolve(o.closure));
  for (const name of ['gcc-runtime-corresponding-source.tar.gz', 'mozilla-ca-bundle-source.tar.gz']) execFileSync('tar', ['-tzf', path.join(directory, name)], { stdio: 'pipe', maxBuffer: 32 * 1024 * 1024 });
  report.status = 'SOURCE_ACCESS_VERIFIED';
} catch (error) { report.failures.push(error.message); }
try { fs.writeFileSync(receiptFd, JSON.stringify(report, null, 2) + '\n'); } finally { fs.closeSync(receiptFd); }
console.log(report.status, receipt);
if (report.failures.length) { console.error(report.failures.join('\n')); process.exitCode = 1; }
