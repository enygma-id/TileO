#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, TAR_EXECUTABLE } from './lib/release-evidence.js';
import { sourceAccess } from './lib/release-assets.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
let options;
try { options = parseArgs(process.argv.slice(2), { '--image': 'required', '--evidence-dir': 'required' }); }
catch (error) { console.error(error.message); process.exit(2); }
const image = options.image;
const evidenceRoot = path.resolve(options['evidence-dir']);
if (path.basename(evidenceRoot) !== `v${version}`) throw new Error(`Evidence root must end in v${version}`);

const ALPINE_IMAGE = 'alpine:3.21@sha256:ee16d92f96db08d9d2d07da48555a27f3a69d8f0759021dbc601195ed0d2b5bd';
const GCC = {
  package: '14.2.0-r4',
  aportsCommit: '1a03a2a9c9e77f1a07d48b6f6805e72c8c63c03f',
  aportsArchiveSha256: 'fa78002197d55fe1c360efcbba9d6e914ec171987648f388b04a161740d15f22',
  sourceName: 'gcc-14.2.0.tar.xz',
  sourceUrl: 'https://distfiles.alpinelinux.org/distfiles/v3.21/gcc-14.2.0.tar.xz',
  sha256: 'a7b39bc69cbf9e25826c5a60ab26477001f7c08d85cec04bc0e29cabed6f3cc9',
  sha512: '932bdef0cda94bacedf452ab17f103c0cb511ff2cec55e9112fc0328cbf1d803b42595728ea7b200e0a057c03e85626f937012e49a7515bc5dd256b2bf4bc396',
};
const CA = {
  '20261020-r0': {
    aportsCommit: '660f223b42ca35e7d2a76ce568e15c847b92d33d',
    aportsArchiveSha256: 'd8da92bbd76fc9f836c5e357ae75ddf90843a507e8059700ef7f16043500590a',
    sha512: 'd28eb01751b1a914ffb5d8cb99e662f0a35a95148c21dcf98de1ab3108b54db9714a99472d07715023867f4f76a21f2a79a2bc1c7e9876ce5167fdd865ad2dd7',
  },
};

const out = path.join(evidenceRoot, 'compliance');
const sourceDir = path.join(out, 'source');
const noticesDir = path.join(out, 'notices');
const customerDir = path.join(out, 'customer');
const cache = path.join(ROOT, 'artifacts', 'upstream-source-cache');
for (const dir of [out, sourceDir, noticesDir, customerDir, cache]) fs.mkdirSync(dir, { recursive: true });

function digest(file, algorithm = 'sha256') {
  return crypto.createHash(algorithm).update(fs.readFileSync(file)).digest('hex');
}

function run(command, commandArgs, options = {}) {
  return execFileSync(command, commandArgs, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
}

function download(url, destination, expected, algorithm = 'sha512') {
  if (!fs.existsSync(destination) || digest(destination, algorithm) !== expected) {
    fs.rmSync(destination, { force: true });
    execFileSync('curl', ['-fL', '--retry', '3', '-o', destination, url], { stdio: 'inherit' });
  }
  const actual = digest(destination, algorithm);
  if (actual !== expected) throw new Error(`Upstream checksum mismatch for ${url}: ${actual}`);
}

function copyFromImage(container, containerPath, destination) {
  execFileSync('docker', ['cp', `${container}:${containerPath}`, destination], { stdio: 'pipe' });
}

function inspectImage() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-image-source-'));
  const container = run('docker', ['create', image]);
  try {
    const packages = path.join(temp, 'apk-packages.txt');
    copyFromImage(container, '/usr/local/share/tileo-build/apk-packages.txt', packages);
    for (const [name, containerPath] of [
      ['libstdc++.so.6', '/usr/lib/libstdc++.so.6.0.33'],
      ['libgcc_s.so.1', '/usr/lib/libgcc_s.so.1'],
      ['ca-certificates.crt', '/etc/ssl/certs/ca-certificates.crt'],
    ]) copyFromImage(container, containerPath, path.join(temp, name));
    const packageText = fs.readFileSync(packages, 'utf8');
    const packageVersion = (name) => {
      const match = packageText.match(new RegExp(`^${name.replace(/[+]/g, '\\+')}-(\\S+)\\s`, 'm'));
      if (!match) throw new Error(`Image package metadata is missing ${name}`);
      return match[1];
    };
    return {
      temp,
      id: run('docker', ['image', 'inspect', image, '--format', '{{.Id}}']),
      gccPackage: packageVersion('libgcc'),
      stdcxxPackage: packageVersion('libstdc++'),
      caPackage: packageVersion('ca-certificates-bundle'),
      libstdcxxSha256: digest(path.join(temp, 'libstdc++.so.6')),
      libgccSha256: digest(path.join(temp, 'libgcc_s.so.1')),
      caBundleSha256: digest(path.join(temp, 'ca-certificates.crt')),
    };
  } catch (error) {
    fs.rmSync(temp, { recursive: true, force: true });
    throw new Error(`Cannot inspect ${image}; rebuild it with the current Dockerfile: ${error.message}`);
  } finally {
    execFileSync('docker', ['rm', container], { stdio: 'ignore' });
  }
}

function extractAport(commit, expectedArchiveSha256, packageName, destination) {
  const archive = path.join(cache, `aports-${commit}.tar.gz`);
  if (!fs.existsSync(archive) || digest(archive) !== expectedArchiveSha256) {
    fs.rmSync(archive, { force: true });
    execFileSync('curl', ['-fL', '--retry', '3', '-o', archive, `https://codeload.github.com/alpinelinux/aports/tar.gz/${commit}`], { stdio: 'inherit' });
  }
  if (digest(archive) !== expectedArchiveSha256) throw new Error(`Alpine aports archive checksum mismatch for ${commit}`);
  fs.mkdirSync(destination, { recursive: true });
  execFileSync(TAR_EXECUTABLE, ['-xzf', archive, '--strip-components=3', '-C', destination, `aports-${commit}/main/${packageName}`]);
  if (!fs.existsSync(path.join(destination, 'APKBUILD'))) throw new Error(`Missing APKBUILD for ${packageName}@${commit}`);
  return {
    archiveSha256: digest(archive),
    files: Object.fromEntries(fs.readdirSync(destination).filter((name) => fs.statSync(path.join(destination, name)).isFile()).sort().map((name) => [name, digest(path.join(destination, name))])),
  };
}

function writeManifest(stage, manifest) {
  fs.writeFileSync(path.join(stage, 'SOURCE-MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
}

function createArchive(stage, destination) {
  fs.rmSync(destination, { force: true });
  execFileSync(TAR_EXECUTABLE, ['-czf', destination, '-C', stage, '.']);
  return digest(destination);
}

function verifyCaBundle(sourceArchive, aportDir, expectedSha256) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-ca-build-'));
  try {
    fs.copyFileSync(sourceArchive, path.join(work, path.basename(sourceArchive)));
    fs.cpSync(aportDir, path.join(work, 'aport'), { recursive: true });
    const sourceName = path.basename(sourceArchive);
    const command = [
      'set -eu',
      'apk add --no-cache perl patch make >/dev/null',
      `tar -xjf /work/${sourceName} -C /work`,
      'src=$(find /work -mindepth 1 -maxdepth 1 -type d -name "ca-certificates-*" | head -n1)',
      'for p in /work/aport/*.patch; do [ -e "$p" ] || continue; patch -d "$src" -p1 < "$p"; done',
      'make -C "$src" certdata.stamp >/dev/null',
      'cd "$src"',
      'find -- *.crt | sort | while read -r i; do cat "$i"; printf "\\n"; done > /work/generated-ca-certificates.crt',
    ].join('; ');
    execFileSync('docker', ['run', '--rm', '--mount', `type=bind,source=${work},target=/work`, ALPINE_IMAGE, 'sh', '-lc', command], { stdio: 'inherit' });
    const generated = path.join(work, 'generated-ca-certificates.crt');
    const actual = digest(generated);
    if (actual !== expectedSha256) throw new Error(`CA bundle rebuilt from authentic source is ${actual}, image contains ${expectedSha256}`);
    return actual;
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

const target = inspectImage();
try {
  if (target.gccPackage !== GCC.package || target.stdcxxPackage !== GCC.package) {
    throw new Error(`Unsupported GCC packages: libgcc=${target.gccPackage}, libstdc++=${target.stdcxxPackage}`);
  }
  const ca = CA[target.caPackage];
  if (!ca) throw new Error(`Unsupported ca-certificates-bundle package: ${target.caPackage}`);

  const gccSource = path.join(cache, GCC.sourceName);
  download(GCC.sourceUrl, gccSource, GCC.sha512);
  if (digest(gccSource) !== GCC.sha256) throw new Error('GCC SHA-256 does not match the pinned GNU release checksum');

  const gccStage = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-gcc-source-'));
  const gccAport = path.join(gccStage, 'alpine-aport');
  const gccAportEvidence = extractAport(GCC.aportsCommit, GCC.aportsArchiveSha256, 'gcc', gccAport);
  fs.copyFileSync(gccSource, path.join(gccStage, GCC.sourceName));
  writeManifest(gccStage, {
    schema: 'tileo-corresponding-source@3', component: 'gcc-runtime', package: GCC.package,
    upstream: { url: GCC.sourceUrl, file: GCC.sourceName, sha256: GCC.sha256, sha512: GCC.sha512 },
    alpine_aport: { commit: GCC.aportsCommit, archive_sha256: gccAportEvidence.archiveSha256, path: 'main/gcc', patch_count: Object.keys(gccAportEvidence.files).filter((name) => name.endsWith('.patch')).length, files: gccAportEvidence.files },
    target_image: { tag: image, id: target.id },
    shipped_files: { '/usr/lib/libstdc++.so.6': target.libstdcxxSha256, '/usr/lib/libgcc_s.so.1': target.libgccSha256 },
  });
  const gccArchive = path.join(sourceDir, 'gcc-runtime-corresponding-source.tar.gz');
  const gccArchiveSha256 = createArchive(gccStage, gccArchive);
  fs.rmSync(gccStage, { recursive: true, force: true });

  const caVersion = target.caPackage.replace(/-r\d+$/, '');
  const caSourceName = `ca-certificates-${caVersion}.tar.bz2`;
  const caSourceUrl = `https://distfiles.alpinelinux.org/distfiles/edge/${caSourceName}`;
  const caSource = path.join(cache, caSourceName);
  download(caSourceUrl, caSource, ca.sha512);
  const caStage = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-ca-source-'));
  const caAport = path.join(caStage, 'alpine-aport');
  const caAportEvidence = extractAport(ca.aportsCommit, ca.aportsArchiveSha256, 'ca-certificates', caAport);
  fs.copyFileSync(caSource, path.join(caStage, caSourceName));
  const rebuiltCaSha256 = verifyCaBundle(caSource, caAport, target.caBundleSha256);
  writeManifest(caStage, {
    schema: 'tileo-corresponding-source@3', component: 'mozilla-ca-bundle', package: target.caPackage,
    upstream: { url: caSourceUrl, file: caSourceName, sha256: digest(caSource), sha512: ca.sha512 },
    alpine_aport: { commit: ca.aportsCommit, archive_sha256: caAportEvidence.archiveSha256, path: 'main/ca-certificates', patch_count: Object.keys(caAportEvidence.files).filter((name) => name.endsWith('.patch')).length, files: caAportEvidence.files },
    target_image: { tag: image, id: target.id },
    verification: { rebuilt_bundle_sha256: rebuiltCaSha256, image_bundle_sha256: target.caBundleSha256, equal: true },
  });
  const caArchive = path.join(sourceDir, 'mozilla-ca-bundle-source.tar.gz');
  const caArchiveSha256 = createArchive(caStage, caArchive);
  fs.rmSync(caStage, { recursive: true, force: true });

  const noticeSources = {
    'GPL-3.0.txt': 'third-party/licenses/native/libstdc++/COPYING3.txt',
    'GCC-Runtime-Library-Exception-3.1.txt': 'third-party/licenses/native/libstdc++/COPYING-RUNTIME.txt',
    'MPL-2.0.txt': 'third-party/licenses/native/ca-certificates/MPL-2.0.txt',
    'MIT.txt': 'third-party/licenses/native/musl/COPYING.txt',
  };
  for (const [name, source] of Object.entries(noticeSources)) fs.copyFileSync(path.join(ROOT, source), path.join(noticesDir, name));
  const caMembers = execFileSync(TAR_EXECUTABLE, ['-tjf', caSource], { encoding: 'utf8' }).trim().split('\n');
  const converter = caMembers.find(name => name.endsWith('/mk-ca-bundle.pl'));
  if (!converter) throw new Error('Authentic CA archive lacks converter notices');
  fs.writeFileSync(path.join(noticesDir, 'CA-converter-mk-ca-bundle.pl.txt'), execFileSync(TAR_EXECUTABLE, ['-xOjf', caSource, converter]));
  fs.writeFileSync(path.join(noticesDir, 'COMPONENTS.md'), '# Component notices\n\nMPL-2.0.txt covers Mozilla certdata. CA-converter-mk-ca-bundle.pl.txt preserves the actual converter copyright/license header from the verified source. MIT.txt is the musl notice, not a substitute for the CA converter notice. Distribution recipes and patches are included in the corresponding-source archives.\n');

  const rows = [
    ['EXC-001', 'libstdc++', target.stdcxxPackage, 'Alpine Linux', '/usr/lib/libstdc++.so.6', 'GPL-3.0-only WITH GCC-exception-3.1', target.libstdcxxSha256, 'source/gcc-runtime-corresponding-source.tar.gz', gccArchiveSha256, GCC.aportsCommit],
    ['EXC-002', 'libgcc', target.gccPackage, 'Alpine Linux', '/usr/lib/libgcc_s.so.1', 'GPL-3.0-only WITH GCC-exception-3.1', target.libgccSha256, 'source/gcc-runtime-corresponding-source.tar.gz', gccArchiveSha256, GCC.aportsCommit],
    ['EXC-003', 'ca-certificates-bundle', target.caPackage, 'Alpine Linux / Mozilla NSS', '/etc/ssl/certs/ca-certificates.crt', 'MPL-2.0 AND MIT', target.caBundleSha256, 'source/mozilla-ca-bundle-source.tar.gz', caArchiveSha256, ca.aportsCommit],
  ];
  fs.writeFileSync(path.join(out, 'exceptions-register.csv'), [
    'exception_id,component,package_version,origin,shipped_file,license_expression,binary_sha256,source_archive,source_archive_sha256,upstream_recipe_revision,image_id,technical_status,legal_decision',
    ...rows.map((row) => [...row, target.id, 'VERIFIED', 'LEGAL_APPROVAL_PENDING'].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')),
  ].join('\n') + '\n');

  const provenance = {
    schema: 'tileo-source-provenance@3', generated_at: new Date().toISOString(),
    target_image: { tag: image, id: target.id }, legal_approval: 'PENDING',
    packages: { libstdcxx: target.stdcxxPackage, libgcc: target.gccPackage, ca: target.caPackage },
    archives: {
      'source/gcc-runtime-corresponding-source.tar.gz': gccArchiveSha256,
      'source/mozilla-ca-bundle-source.tar.gz': caArchiveSha256,
    },
  };
  fs.writeFileSync(path.join(out, 'source-provenance.json'), JSON.stringify(provenance, null, 2) + '\n');
  fs.writeFileSync(path.join(out, 'reviewed-license-decision.md'), '# TileO disclosed exceptions\n\nTechnical source verification: **PASS**\n\nLegal/IP approval: **PENDING**\n\nNo release authorization is granted by this generated file.\n');
  fs.copyFileSync(path.join(ROOT, 'THIRD-PARTY-NOTICES.md'), path.join(customerDir, 'THIRD-PARTY-NOTICES.md'));
  fs.copyFileSync(path.join(ROOT, 'third-party', 'ENTERPRISE_EXCEPTIONS.md'), path.join(customerDir, 'THIRD-PARTY-EXCEPTIONS.md'));
  fs.writeFileSync(path.join(customerDir, 'SOURCE-ACCESS.md'), sourceAccess(JSON.parse(fs.readFileSync(path.join(evidenceRoot, 'candidate.json'))), provenance));
  fs.writeFileSync(path.join(customerDir, 'delivery-manifest.json'), JSON.stringify({ schema: 'tileo-customer-delivery@2', version, legal_approval: 'PENDING', source_archives: provenance.archives }, null, 2) + '\n');
  console.log(`Authentic corresponding source prepared for ${target.id}; Legal/IP approval remains PENDING.`);
} finally {
  fs.rmSync(target.temp, { recursive: true, force: true });
}
