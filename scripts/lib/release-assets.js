import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { sha256File } from './release-evidence.js';

export function assetPaths(version) {
  return {
    [`TileO-${version}-source.tar.gz`]: `source/TileO-${version}-source.tar.gz`,
    'gcc-runtime-corresponding-source.tar.gz': 'compliance/source/gcc-runtime-corresponding-source.tar.gz',
    'mozilla-ca-bundle-source.tar.gz': 'compliance/source/mozilla-ca-bundle-source.tar.gz',
    'THIRD-PARTY-NOTICES.md': 'compliance/customer/THIRD-PARTY-NOTICES.md',
    'THIRD-PARTY-EXCEPTIONS.md': 'compliance/customer/THIRD-PARTY-EXCEPTIONS.md',
    'SOURCE-ACCESS.md': 'compliance/customer/SOURCE-ACCESS.md',
    'sbom-image.spdx.json': 'sbom/sbom-image.spdx.json',
    'sbom-image.cdx.json': 'sbom/sbom-image.cdx.json',
  };
}

export function publicationStatus(sourceVerified, failures) {
  return failures.length ? (sourceVerified ? 'PARTIALLY_PUBLISHED' : 'FAILED') : 'PUBLISHED_VERIFIED';
}

export function sourceAccess(candidate, provenance) {
  if (candidate.version !== '0.1.0' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(candidate.repository)) throw Error('Invalid release version/repository');
  if (candidate.image_id !== provenance.target_image.id) throw Error('Source provenance image mismatch');
  const base = `https://github.com/${candidate.repository}/releases/download/v${candidate.version}`;
  return `# TileO ${candidate.version} corresponding source\n\nImage: ${candidate.image_id}\nPlatform: ${candidate.platform}\nCommit: ${candidate.commit}\nPackages: ${JSON.stringify(provenance.packages ?? {})}\n\n` +
    Object.entries(provenance.archives).map(([name, hash]) => {
      if (!/^[0-9a-f]{64}$/.test(hash) || !/^source\/[\w.-]+\.tar\.gz$/.test(name)) throw Error('Invalid source archive record');
      const file = path.basename(name);
      return `- ${file}: closure path [../${name}](../${name}); Release asset [${file}](${base}/${file}); SHA-256 ${hash}.`;
    }).join('\n') + `\n\nPackage versions and binary hashes: [exception register](../exceptions-register.csv).\nLicenses: [notices](../notices/), [third-party notices](THIRD-PARTY-NOTICES.md), [exceptions](THIRD-PARTY-EXCEPTIONS.md).\nSource-access maintainer: ${candidate.repository} repository maintainers; recipient requests: https://github.com/${candidate.repository}/issues\nDownload the versioned assets and compare SHA-256 before use. These URLs are publication targets; availability is recorded separately in publication receipts.\n`;
}

export function validateAssets(evidence, directory, closure) {
  const candidate = JSON.parse(fs.readFileSync(path.join(evidence, 'candidate.json')));
  const manifest = JSON.parse(fs.readFileSync(path.join(evidence, 'core-evidence-manifest.json')));
  if (manifest.commit !== candidate.commit || manifest.image_id !== candidate.image_id) throw Error('Core subject mismatch');
  for (const item of manifest.files) {
    if (path.isAbsolute(item.path) || item.path.split(/[\\/]/).includes('..')) throw Error('Unsafe core path');
    const file = path.join(evidence, item.path);
    if (!fs.lstatSync(file).isFile()) throw Error('Core member must be a regular file');
    if (fs.statSync(file).size !== item.bytes || sha256File(file) !== item.sha256) throw Error(`Frozen core changed: ${item.path}`);
  }
  const provenance = JSON.parse(fs.readFileSync(path.join(evidence, 'compliance/source-provenance.json')));
  for (const [relative, hash] of Object.entries(provenance.archives)) {
    if (manifest.files.find(item => item.path === `compliance/${relative}`)?.sha256 !== hash) throw Error('Source provenance differs from frozen source hash');
  }
  if (fs.readFileSync(path.join(directory, 'SOURCE-ACCESS.md'), 'utf8') !== sourceAccess(candidate, provenance)) throw Error('Invalid SOURCE-ACCESS routes or subject');
  const expected = {};
  for (const [name, relative] of Object.entries(assetPaths(candidate.version))) {
    const record = manifest.files.find(item => item.path === relative);
    if (!record) throw Error(`Missing frozen asset: ${relative}`);
    expected[name] = record.sha256;
  }
  const closureRoot = `TileO-v${candidate.version}-Release-Closure`;
  const delivery = JSON.parse(execFileSync('tar', ['-xOzf', closure, `${closureRoot}/delivery-manifest.json`], { encoding: 'utf8', maxBuffer: 1024 * 1024 }));
  if (delivery.commit !== candidate.commit || delivery.image_id !== candidate.image_id || delivery.core_evidence_sha256 !== sha256File(path.join(evidence, 'core-evidence-manifest.json'))) throw Error('Closure does not bind frozen core');
  expected[`${closureRoot}.tar.gz`] = sha256File(closure);
  const staged = fs.readdirSync(directory).filter(name => name !== 'SHA256SUMS');
  if (staged.length !== Object.keys(expected).length || staged.some(name => !(name in expected))) throw Error('Unexpected asset set');
  const sums = new Map();
  for (const line of fs.readFileSync(path.join(directory, 'SHA256SUMS'), 'utf8').trim().split(/\r?\n/)) {
    const match = /^([0-9a-f]{64})  ([A-Za-z0-9_.-]+)$/.exec(line);
    if (!match || sums.has(match[2])) throw Error('Unsafe or duplicate checksum entry');
    sums.set(match[2], match[1]);
  }
  if (sums.size !== Object.keys(expected).length) throw Error('Checksum coverage mismatch');
  for (const [name, hash] of Object.entries(expected)) {
    if (sums.get(name) !== hash || sha256File(path.join(directory, name)) !== hash) throw Error(`Asset does not match frozen core: ${name}`);
  }
  return { candidate, core_evidence_sha256: sha256File(path.join(evidence, 'core-evidence-manifest.json')), assets: expected };
}
