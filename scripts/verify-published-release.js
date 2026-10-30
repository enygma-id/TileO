#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { atomicWrite, parseArgs, readJson, sha256File } from './lib/release-evidence.js';
import { publicationStatus } from './lib/release-assets.js';

let options;
try { options = parseArgs(process.argv.slice(2), { '--repo': 'required', '--tag': 'required', '--candidate': 'required', '--out-dir': 'required', '--closure': 'required' }); }
catch (error) { console.error(error.message); process.exit(2); }
if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(options.repo) || options.tag !== 'v0.1.0') throw new Error('Expected --repo owner/name and --tag v0.1.0');
const candidate = readJson(path.resolve(options.candidate), 'tileo-release-candidate@1');
if (options.repo !== candidate.repository || options.tag !== `v${candidate.version}`) throw new Error('Release subject differs from approved candidate');
const out = path.resolve(options['out-dir']);
const evidence = path.dirname(path.resolve(options.candidate));
if (out === evidence || out.startsWith(evidence + path.sep)) throw new Error('Publication receipts must be outside core');
if (fs.existsSync(path.join(out, 'publication-verification.json'))) throw new Error('Receipt exists; choose a new attempt directory');
fs.mkdirSync(out, { recursive: true });
const failures = [];
let release = null;
let registry = null;
let sourceVerified = false;
try {
  execFileSync(process.execPath, [path.join(import.meta.dirname, 'verify-public-source-access.js'), '--candidate', options.candidate, '--closure', options.closure, '--out-dir', path.join(out, 'source-access')], { stdio: 'pipe' });
  sourceVerified = true;
  release = JSON.parse(execFileSync('gh', ['api', `repos/${options.repo}/releases/tags/${options.tag}`], { encoding: 'utf8' }));
  const tag = execFileSync('git', ['ls-remote', `https://github.com/${options.repo}.git`, `refs/tags/${options.tag}`, `refs/tags/${options.tag}^{}`], { encoding: 'utf8' });
  const refs = tag.trim().split('\n');
  const resolved = refs.find(line => line.endsWith('^{}')) ?? refs.find(line => line.endsWith(`refs/tags/${options.tag}`));
  if (resolved?.split(/\s/)[0] !== candidate.commit) failures.push('Published tag does not resolve to approved commit');
  const requiredAssets = ['TileO-0.1.0-source.tar.gz', 'TileO-v0.1.0-Release-Closure.tar.gz', 'gcc-runtime-corresponding-source.tar.gz', 'mozilla-ca-bundle-source.tar.gz', 'THIRD-PARTY-NOTICES.md', 'THIRD-PARTY-EXCEPTIONS.md', 'SOURCE-ACCESS.md', 'sbom-image.spdx.json', 'sbom-image.cdx.json', 'SHA256SUMS'];
  const names = new Set((release.assets ?? []).map((asset) => asset.name));
  for (const name of requiredAssets) if (!names.has(name)) failures.push(`Missing GitHub Release asset: ${name}`);
  // All public asset bytes/checksums were already validated anonymously against the frozen core.

  const registryRef = `ghcr.io/${options.repo.toLowerCase()}:0.1.0`;
  const anonymousConfig = fs.mkdtempSync(path.join(out, 'anonymous-docker-'));
  fs.writeFileSync(path.join(anonymousConfig, 'config.json'), JSON.stringify({auths:{}}));
  const anonymousEnv = {...process.env, DOCKER_CONFIG:anonymousConfig};
  const raw = execFileSync('docker', ['buildx', 'imagetools', 'inspect', '--raw', registryRef], { env: anonymousEnv, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  const manifest = JSON.parse(raw);
  if (manifest.schemaVersion !== 2 || !manifest.config?.digest || !Array.isArray(manifest.layers) || manifest.layers.length === 0) failures.push('GHCR manifest is not a single-platform OCI/Docker image manifest');
  if (manifest.config?.digest !== candidate.image_id) failures.push('Registry config digest differs from approved image');
  execFileSync('docker', ['pull', '--platform', candidate.platform, registryRef], { env: anonymousEnv, stdio: 'pipe' });
  const pulled = JSON.parse(execFileSync('docker', ['image', 'inspect', registryRef], { encoding: 'utf8' }))[0];
  if (pulled.Id !== candidate.image_id || `${pulled.Os}/${pulled.Architecture}` !== candidate.platform) failures.push('Pulled GHCR config image ID/platform does not match approved candidate');
  registry = { access: 'anonymous', reference: registryRef, config_digest: manifest.config?.digest ?? null, layer_digests: (manifest.layers ?? []).map((layer) => layer.digest), pulled_image_id: pulled.Id, platform: `${pulled.Os}/${pulled.Architecture}` };
} catch (error) { failures.push(`Cannot complete publication verification: ${error.message}`); }
const report = { schema: 'tileo-publication-verification@1', checked_at: new Date().toISOString(), status: publicationStatus(sourceVerified, failures), repository: options.repo, tag: options.tag, candidate_id: candidate.candidate_id, commit: candidate.commit, image_id: candidate.image_id, release_url: release?.html_url ?? null, registry, failures };
atomicWrite(path.join(out, 'publication-verification.json'), JSON.stringify(report, null, 2) + '\n');
if (failures.length) { for (const failure of failures) console.error(failure); process.exit(1); }
console.log('PUBLISHED_VERIFIED');
