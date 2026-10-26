#!/usr/bin/env node
/**
 * Generate third-party/DEPENDENCIES.md from the verified npm manifest.
 * This is a derived view; MANIFEST.json remains the machine-readable source.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'third-party', 'MANIFEST.json'), 'utf8'));
const OUTPUT = process.env.TILEO_DEPENDENCIES_OUTPUT
  ? path.resolve(process.env.TILEO_DEPENDENCIES_OUTPUT)
  : path.join(ROOT, 'third-party', 'DEPENDENCIES.md');

const packages = [...MANIFEST.packages].sort((a, b) => a.package_path.localeCompare(b.package_path));
const counts = {
  runtime: packages.filter((pkg) => !pkg.dev && !pkg.optional).length,
  optional: packages.filter((pkg) => !pkg.dev && pkg.optional).length,
  development: packages.filter((pkg) => pkg.dev).length,
  verified: packages.filter((pkg) => pkg.upstream_verification?.status === 'verified_upstream_tarball').length,
  metadata: packages.filter((pkg) => pkg.upstream_verification?.status === 'metadata_only_no_license_file').length,
  failed: packages.filter((pkg) => pkg.upstream_verification?.status === 'verification_failed').length,
};

const byLicense = new Map();
for (const pkg of packages) {
  const key = pkg.declared_license || 'UNKNOWN';
  byLicense.set(key, (byLicense.get(key) || 0) + 1);
}

const lines = [];
lines.push('# Third-Party NPM Dependency Inventory');
lines.push('');
lines.push(`This inventory is generated from the committed \`package-lock.json\` and \`third-party/MANIFEST.json\`. It lists **${packages.length} non-root entries** (direct, transitive, development and platform-optional packages).`);
lines.push('');
lines.push(`- \`package-lock.json\` SHA-256: \`${MANIFEST.reference_lockfile_sha256}\``);
lines.push(`- Runtime entries: **${counts.runtime}** · runtime-optional: **${counts.optional}** · development: **${counts.development}**`);
lines.push(`- Notice evidence: **${counts.verified}** verified from exact upstream tarballs · **${counts.metadata}** metadata-only · **${counts.failed}** failed`);
lines.push(`- Verification date: ${MANIFEST.npm_verification?.verified_at ?? 'not recorded'} (${MANIFEST.npm_verification?.verifier ?? 'unknown verifier'})`);
lines.push('');
lines.push('> Metadata-only entries have no LICENSE/COPYING/NOTICE file in the exact tarball. They are not represented as verified upstream license files and require review before a strict release claim. Development-only entries are not shipped in the runtime image.');
lines.push('');
lines.push('## License metadata from the committed lockfile');
lines.push('');
lines.push('| SPDX expression | Entries |');
lines.push('| --- | ---: |');
for (const [license, count] of [...byLicense.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  lines.push(`| \`${license}\` | ${count} |`);
}
lines.push('');
lines.push('## Complete package-level inventory');
lines.push('');
lines.push('| Package | Locked version | SPDX metadata | Scope | Verification | Notice evidence |');
lines.push('| --- | --- | --- | --- | --- | --- |');
for (const pkg of packages) {
  const scope = pkg.dev ? 'development' : pkg.optional ? 'runtime-optional' : 'runtime';
  const status = pkg.upstream_verification?.status ?? 'missing';
  const evidence = pkg.upstream_verification?.files?.map((file) => `\`${file.stored}\``).join('<br>') || '—';
  lines.push(`| \`${pkg.name}\` | ${pkg.version} | \`${pkg.declared_license}\` | ${scope} | \`${status}\` | ${evidence} |`);
}
lines.push('');
lines.push('Re-verify with `node scripts/verify-npm-notices.js` (offline) or refresh evidence with `--update`.');
lines.push('');

fs.writeFileSync(OUTPUT, lines.join('\n'), 'utf8');
console.log(`Generated ${OUTPUT} (${packages.length} entries).`);
