#!/usr/bin/env node
/**
 * TileO - Third-Party Notices generator.
 *
 * The document is assembled from committed evidence only:
 *   - third-party/MANIFEST.json (exact-version npm tarball verification)
 *   - third-party/native/components.json (native runtime corpus)
 *   - third-party/licenses/** (extracted upstream license texts)
 *
 * No fallback license text is invented. A package whose tarball has no
 * LICENSE/COPYING/NOTICE file is reported as metadata-only and flagged for
 * review rather than being presented as verified.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ELECTIONS, evaluatePackage, evaluateExpression } from './lib/license-policy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LOCK_FILE = path.join(ROOT, 'package-lock.json');
const MANIFEST_FILE = path.join(ROOT, 'third-party', 'MANIFEST.json');
const NATIVE_FILE = path.join(ROOT, 'third-party', 'native', 'components.json');
const OUTPUT_FILE = process.env.TILEO_NOTICES_OUTPUT
  ? path.resolve(process.env.TILEO_NOTICES_OUTPUT)
  : path.join(ROOT, 'THIRD-PARTY-NOTICES.md');
const BASELINE_FILE = path.join(ROOT, 'baseline', 'THIRD-PARTY-NOTICES.md');
const writeBaseline = process.argv.includes('--baseline');

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function canonicalLockSha(buffer) {
  return sha256(Buffer.from(buffer.toString('utf8').replace(/\r\n/g, '\n'), 'utf8'));
}

function fence(text) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  return `\`\`\`\`text\n${normalized}\n\`\`\`\``;
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function main() {
  const lockBuffer = fs.readFileSync(LOCK_FILE);
  const lock = JSON.parse(lockBuffer.toString('utf8'));
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  const native = JSON.parse(fs.readFileSync(NATIVE_FILE, 'utf8'));
  const lockSha = canonicalLockSha(lockBuffer);

  if (manifest.reference_lockfile_sha256 !== lockSha) {
    throw new Error('MANIFEST.json is stale: package-lock.json changed. Run scripts/verify-npm-notices.js --update.');
  }
  const manifestByPath = new Map((manifest.packages || []).map((entry) => [entry.package_path, entry]));
  const lockEntries = Object.entries(lock.packages || {}).filter(([key]) => key !== '');
  if (lockEntries.length !== manifest.packages.length) {
    throw new Error(`MANIFEST.json lists ${manifest.packages.length} packages but package-lock.json has ${lockEntries.length}.`);
  }

  const packages = lockEntries.map(([packagePath, meta]) => {
    const record = manifestByPath.get(packagePath);
    if (!record) throw new Error(`MANIFEST.json is missing ${packagePath}.`);
    const verification = record.upstream_verification;
    if (!verification) throw new Error(`MANIFEST.json has no upstream verification for ${packagePath}.`);
    if (!['verified_upstream_tarball', 'metadata_only_no_license_file'].includes(verification.status)) {
      throw new Error(`${packagePath}: verification status is ${verification.status}; refusing to generate notices.`);
    }
    const name = packagePath.replace(/^node_modules\//, '');
    const dir = path.join(ROOT, 'third-party', 'licenses', 'npm', name, record.version);
    const files = (verification.files || []).map((file) => {
      const absolute = path.join(dir, file.stored);
      if (!fs.existsSync(absolute)) throw new Error(`Missing stored notice ${absolute}`);
      const data = fs.readFileSync(absolute);
      if (sha256(data) !== file.sha256) throw new Error(`Stored notice hash mismatch for ${absolute}`);
      return { ...file, text: data.toString('utf8') };
    });
    const declared = meta.license || record.declared_license || 'UNKNOWN';
    const evaluation = evaluatePackage(name, declared);
    const status = verification.status === 'verified_upstream_tarball'
      ? 'VERIFIED_UPSTREAM'
      : 'REVIEW_REQUIRED_METADATA_ONLY';
    return {
      name,
      packagePath,
      version: record.version || meta.version,
      declared,
      scope: meta.dev ? 'development' : meta.optional ? 'runtime-optional' : 'runtime',
      evaluation,
      status,
      files,
      tarballSha: verification.tarball_sha256,
      verifiedAt: verification.verified_at,
    };
  });

  const shipped = packages.filter((pkg) => pkg.scope !== 'development');
  const development = packages.filter((pkg) => pkg.scope === 'development');
  const verifiedCount = packages.filter((pkg) => pkg.status === 'VERIFIED_UPSTREAM').length;
  const metadataOnly = packages.filter((pkg) => pkg.status !== 'VERIFIED_UPSTREAM');
  const runtimeMetadataOnly = metadataOnly.filter((pkg) => pkg.scope !== 'development');
  const nativeExceptions = native.components.filter((component) => evaluateExpression(component.license_expression).exceptions.length > 0);
  const nativePermissive = native.components.length - nativeExceptions.length;

  const lines = [];
  lines.push('# TileO Third-Party Software Notices and Licenses');
  lines.push('');
  lines.push('This document is generated from committed, exact-version license evidence. It is the redistribution notice set for TileO third-party components.');
  lines.push('');
  lines.push('> **Certification boundary:** this notice document records evidence, not a blanket permissive-only certification of an image. A release claim additionally requires a final-image SBOM, an `ldd`/`readelf` closure audit and human approval of the documented exceptions listed below.');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString().slice(0, 10)} · Lockfile SHA-256: \`${lockSha}\``);
  lines.push('');
  lines.push('## Verification summary');
  lines.push('');
  lines.push('| Evidence set | Count | Method |');
  lines.push('| --- | ---: | --- |');
  lines.push(`| npm entries in \`package-lock.json\` | ${packages.length} | Direct, transitive, development and platform-optional entries |`);
  lines.push(`| npm notices verified from exact tarball | ${verifiedCount} | sha512 integrity + extracted LICENSE/COPYING/NOTICE + SHA-256 |`);
  lines.push(`| npm metadata-only entries | ${metadataOnly.length} | Tarball has no license file; only \`package.json\` metadata retained |`);
  lines.push(`| npm runtime entries marked metadata-only | ${runtimeMetadataOnly.length} | Review required before strict release |`);
  lines.push(`| Native runtime components | ${native.components.length} | Pinned upstream license corpus |`);
  lines.push(`| Native permissive expressions | ${nativePermissive} | Policy evaluation by \`scripts/lib/license-policy.js\` |`);
  lines.push(`| Native documented exceptions | ${nativeExceptions.length} | GCC runtime exception + certificate data |`);
  lines.push('');
  lines.push('**Permissive Migration Objective**: TileO targets a distribution whose shipped third-party software is limited to verified permissive licenses. This objective is tracked per component. Components marked `REVIEW_REQUIRED_METADATA_ONLY` or `LEGAL_EXCEPTION_RECORDED` are not represented as permissive passes.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Primary Application License');
  lines.push('');
  lines.push('- **TileO Application**: Copyright (c) 2026 TileO Contributors. Licensed under **GNU Affero General Public License v3.0 only (AGPL-3.0-only)**. See [`LICENSE`](LICENSE).');
  lines.push('- The AGPL-3.0-only license applies to TileO source code identified as such. Third-party components remain under their own licenses and notices.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Dual-License / Multi-License Elections');
  lines.push('');
  lines.push('Where upstream explicitly offers alternative licenses, TileO elects the following permissive option. Elections are valid only for the exact versions listed.');
  lines.push('');
  lines.push('| Package | Upstream Offered Options | Formal TileO Election | Rationale |');
  lines.push('|---|---|---|---|');
  for (const [name, election] of ELECTIONS) {
    const pkg = packages.find((candidate) => candidate.name === name);
    const version = pkg ? pkg.version : 'version in lockfile';
    lines.push(`| \`${name}@${version}\` | \`${election.offered}\` | **${election.license}** | Elects the permissive terms; copyleft alternatives are not selected or exercised. |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Native Runtime Components');
  lines.push('');
  lines.push('The release target is a minimal scratch/musl image. The table below is the declared native component set. The final image audit must prove the exact versions and ELF closure; see [`third-party/NATIVE_COMPONENTS.md`](third-party/NATIVE_COMPONENTS.md).');
  lines.push('');
  lines.push('| Component | Version | License expression | Linkage | Evidence |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const component of native.components) {
    const evaluation = evaluateExpression(component.license_expression);
    const review = evaluation.exceptions.length > 0 ? ` **(${component.review || 'REVIEW REQUIRED'})**` : '';
    const files = component.license_files.map((file) => `\`${path.relative(ROOT, path.join(ROOT, 'third-party', 'licenses', 'native', component.id, file.file)).replaceAll('\\', '/')}\``).join('<br>');
    lines.push(`| ${component.name} | ${component.version} | \`${component.license_expression}\`${review} | ${component.linkage} | ${files} |`);
  }
  lines.push('');
  lines.push('### Documented Exceptions');
  lines.push('');
  lines.push('These are **not** permissive licenses and must be approved explicitly before a strict permissive-only claim:');
  lines.push('');
  for (const component of nativeExceptions) {
    lines.push(`- **${component.name} ${component.version}** — \`${component.license_expression}\`. ${component.notes || ''}`);
  }
  lines.push('');
  lines.push('The GCC runtime exception permits distributing `libstdc++`/`libgcc` with independent programs. The CA bundle is data-scope MPL-2.0 and is not linked into TileO code. Both require a recorded human decision; neither is silently counted as permissive.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Geospatial Data & Client Renderer Legal Separation');
  lines.push('');
  lines.push('### 1. OpenStreetMap (OSM) Geodata Separation');
  lines.push('- **Data License**: OpenStreetMap geographical data is licensed under the **Open Database License 1.0 (ODbL-1.0)** by the OpenStreetMap Foundation (OSMF).');
  lines.push('- **Separation**: ODbL is a *database/data license* and does not apply to or infect the TileO application source code, API, or build artifacts.');
  lines.push('- **Configuration**: TileO defaults to a **neutral dark canvas (`#0b131e`) with zero network tile requests and zero ODbL data exposure**. OpenStreetMap tile services are only accessed when an operator explicitly opts in via `TILEO_BASEMAP_URL=osm` or custom configuration.');
  lines.push('- **Attribution & Usage Policy**: When OSM is enabled, mandatory attribution (`© OpenStreetMap contributors`) is displayed in the user interface and API metadata, and tile proxying respects OSMF Tile Usage Policies.');
  lines.push('');
  lines.push('### 2. Client-Side Renderers & Vector Tile Archives');
  lines.push('- **MapLibre GL JS**: Copyright (c) MapLibre contributors. Licensed under **BSD-3-Clause**.');
  lines.push('- **PMTiles Client**: Copyright (c) Protomaps LLC. Licensed under **BSD-3-Clause**.');
  lines.push('- Both client libraries are strictly permissive and operate offline without external services.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## npm License Inventory');
  lines.push('');
  lines.push('Each entry names the exact locked version, the recorded license expression, the verification state and the SHA-256 of the stored upstream notice. Development-only entries are not shipped in the runtime image; platform-optional entries are shipped only on matching platforms.');
  lines.push('');
  lines.push(`### Runtime and optional entries (${shipped.length})`);
  lines.push('');

  for (const pkg of shipped) {
    lines.push(`#### ${pkg.name} (${pkg.version})`);
    lines.push(`- **Declared License**: \`${pkg.declared}\``);
    lines.push(`- **Scope**: \`${pkg.scope}\``);
    if (pkg.evaluation.elected) {
      lines.push(`- **Election**: **${pkg.evaluation.elected}** (upstream: \`${pkg.evaluation.offered}\`)`);
    }
    lines.push(`- **Verification**: \`${pkg.status}\`${pkg.tarballSha ? ` · tarball SHA-256 \`${pkg.tarballSha}\`` : ''}`);
    if (pkg.files.length === 0) {
      lines.push('- **Notice**: no upstream notice file exists in the exact tarball; this entry requires review.');
    } else {
      for (const file of pkg.files) {
        const relative = path.relative(ROOT, path.join(ROOT, 'third-party', 'licenses', 'npm', pkg.name, pkg.version, file.stored)).replaceAll('\\', '/');
        lines.push(`- **Notice**: [\`${relative}\`](${relative}) · SHA-256 \`${file.sha256}\``);
      }
    }
    lines.push('');
    for (const file of pkg.files) {
      lines.push(fence(file.text));
      lines.push('');
    }
  }

  lines.push(`### Development-only entries (${development.length})`);
  lines.push('');
  lines.push('These entries are part of the source build and test toolchain, not the runtime image. They are retained for reproducible source compliance.');
  lines.push('');
  for (const pkg of development) {
    lines.push(`#### ${pkg.name} (${pkg.version})`);
    lines.push(`- **Declared License**: \`${pkg.declared}\``);
    lines.push(`- **Verification**: \`${pkg.status}\``);
    for (const file of pkg.files) {
      const relative = path.relative(ROOT, path.join(ROOT, 'third-party', 'licenses', 'npm', pkg.name, pkg.version, file.stored)).replaceAll('\\', '/');
      lines.push(`- **Notice**: [\`${relative}\`](${relative}) · SHA-256 \`${file.sha256}\``);
    }
    lines.push('');
    for (const file of pkg.files) {
      lines.push(fence(file.text));
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('## Evidence Files');
  lines.push('');
  lines.push('- [`third-party/MANIFEST.json`](third-party/MANIFEST.json) — per-package tarball hashes and extracted notice hashes.');
  lines.push('- [`third-party/npm-upstream-verification.csv`](third-party/npm-upstream-verification.csv) — machine-readable npm verification table.');
  lines.push('- [`third-party/native/components.json`](third-party/native/components.json) — native component declarations and license hashes.');
  lines.push('- [`third-party/native-components.csv`](third-party/native-components.csv) — machine-readable native component table.');
  lines.push('- [`third-party/licenses/`](third-party/licenses/) — captured upstream license texts (npm, native, assets).');
  lines.push('');
  lines.push('Re-verify offline with `node scripts/verify-npm-notices.js` and `node scripts/verify-native-licenses.js`. Refresh evidence only with `--update`, then review the diff before committing.');
  lines.push('');
  lines.push('> These notices document the stated source and artifact evidence at generation time. They are not a certification of every current platform or release image. For installation and test steps see [Installation](docs/INSTALLATION.md), [Testing](docs/TESTING.md), and [Release Process](docs/RELEASE_PROCESS.md).');
  lines.push('');

  const output = lines.join('\n');
  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  if (writeBaseline) {
    fs.mkdirSync(path.dirname(BASELINE_FILE), { recursive: true });
    fs.writeFileSync(BASELINE_FILE, output, 'utf8');
  }
  console.log(`Generated ${OUTPUT_FILE} (${packages.length} npm entries, ${native.components.length} native components, ${formatBytes(Buffer.byteLength(output))}).`);
  if (runtimeMetadataOnly.length > 0) {
    console.warn(`Review required: ${runtimeMetadataOnly.length} runtime npm entries have metadata-only notice evidence.`);
  }
}

main();
