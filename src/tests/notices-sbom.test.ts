import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');

test('THIRD-PARTY-NOTICES.md exists, is populated, and documents AGPL root and permissive scope', () => {
  const noticesPath = path.join(ROOT_DIR, 'THIRD-PARTY-NOTICES.md');
  assert.ok(fs.existsSync(noticesPath), 'THIRD-PARTY-NOTICES.md must exist in root');

  const content = fs.readFileSync(noticesPath, 'utf8');
  assert.ok(content.length > 50000, `Notices file should be comprehensive (was ${content.length} bytes)`);
  assert.ok(content.includes('AGPL-3.0-only'), 'Must declare TileO AGPL-3.0-only root license');
  assert.ok(content.includes('Permissive Migration Objective'), 'Must declare permissive migration objective');
  assert.ok(content.includes('Musl C Library'), 'Must document native C library');
  assert.ok(content.includes('GDAL'), 'Must document GDAL');
  assert.ok(content.includes('Tippecanoe'), 'Must document Tippecanoe');
});

test('Only canonical THIRD-PARTY-NOTICES.md exists at repository root', () => {
  assert.equal(
    fs.existsSync(path.join(ROOT_DIR, 'THIRD_PARTY_NOTICES.md')),
    false,
    'Legacy THIRD_PARTY_NOTICES.md must not be restored; use THIRD-PARTY-NOTICES.md'
  );
});

test('Dual-license elections are formally recorded in notices', () => {
  const noticesPath = path.join(ROOT_DIR, 'THIRD-PARTY-NOTICES.md');
  const content = fs.readFileSync(noticesPath, 'utf8');

  const lock = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package-lock.json'), 'utf8'));
  const elections: Record<string, string> = { jszip: 'MIT', 'expand-template': 'MIT', rc: 'BSD-2-Clause', '@maplibre/mlt': 'MIT' };
  const packages = Object.entries(lock.packages as Record<string, { version?: string; license?: string }>)
    .filter(([key]) => key !== '')
    .map(([key, meta]) => ({ name: key.split('node_modules/').at(-1)!, ...meta }));
  const section = content.split('## Dual-License / Multi-License Elections')[1]?.split('## Native Runtime Components')[0];
  assert.ok(section, 'Notices must contain the formal election table');
  const rows = section.split('\n').filter(line => line.startsWith('| `'));

  for (const pkg of packages.filter(pkg => /\bOR\b/.test(pkg.license ?? ''))) {
    assert.ok(elections[pkg.name], `Alternative license options for ${pkg.name} require an explicit election`);
    const row = rows.find(line => line.startsWith(`| \`${pkg.name}@${pkg.version}\` |`));
    assert.ok(row?.includes(`| **${elections[pkg.name]}** |`), `${pkg.name}@${pkg.version} must document its own permissive election`);
    const offered = row!.split('|')[2]!.trim().replaceAll('`', '').replace(/[()]/g, '');
    assert.equal(offered, pkg.license!.replace(/[()]/g, ''), 'Election must describe the actual upstream options');
  }
  for (const row of rows) {
    assert.ok(packages.some(pkg => row.startsWith(`| \`${pkg.name}@${pkg.version}\` |`)), 'Election rows must refer to an exact currently locked package');
  }
});

test('Geospatial data separation and ODbL boundaries are formally declared', () => {
  const noticesPath = path.join(ROOT_DIR, 'THIRD-PARTY-NOTICES.md');
  const content = fs.readFileSync(noticesPath, 'utf8');

  assert.ok(content.includes('ODbL-1.0'), 'Must document ODbL-1.0 data license');
  assert.ok(content.includes('neutral dark canvas (`#0b131e`)'), 'Must document neutral dark canvas default');
  assert.ok(content.includes('MapLibre GL JS'), 'Must document MapLibre GL JS');
  assert.ok(content.includes('PMTiles Client'), 'Must document PMTiles Client');
  assert.ok(content.includes('BSD-3-Clause'), 'Must document BSD-3-Clause renderer license');
});

test('Runtime does not distribute superseded baseline evidence', () => {
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'baseline')), false);
  // Final-image SBOM is tested after scanning, outside the image being scanned.
  // It must not be embedded into its own scan input.
  if (ROOT_DIR === '/app') assert.equal(fs.existsSync('/app/docs/history'), false);
});
test('Zero copyleft packages in package-lock.json runtime dependencies', () => {
  const lockPath = path.join(ROOT_DIR, 'package-lock.json');
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  const packages = lock.packages || {};

  const forbiddenLicPatterns = [
    /\b(GPL|LGPL|AGPL|SSPL|EUPL|CC-BY-SA)\b/i
  ];

  const violations: string[] = [];

  for (const [pkgPath, meta] of Object.entries(packages)) {
    if (!pkgPath || pkgPath === '') continue; // Skip root project (which is AGPL-3.0-only)

    const rawLic = (meta as any).license || ((meta as any).licenses && (meta as any).licenses[0]?.type) || '';
    if (!rawLic) continue;

    // Disregard permitted dual-license packages where permissive election is made
    if (pkgPath.includes('jszip') || pkgPath.includes('expand-template') || pkgPath.includes('rc') || pkgPath.includes('@maplibre/mlt')) {
      continue;
    }

    for (const pat of forbiddenLicPatterns) {
      if (pat.test(rawLic)) {
        violations.push(`${pkgPath}: declared ${rawLic}`);
      }
    }
  }

  assert.deepEqual(violations, [], `Forbidden copyleft licenses found in dependencies: ${violations.join(', ')}`);
});
