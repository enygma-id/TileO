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

test('Dual-license elections are formally recorded in notices', () => {
  const noticesPath = path.join(ROOT_DIR, 'THIRD-PARTY-NOTICES.md');
  const content = fs.readFileSync(noticesPath, 'utf8');

  // Check JSZip MIT election
  assert.ok(
    content.includes('`jszip@3.10.2`') && content.includes('**MIT**'),
    'JSZip MIT election must be documented'
  );

  // Check expand-template MIT election
  assert.ok(
    content.includes('`expand-template@2.0.3`') && content.includes('**MIT**'),
    'expand-template MIT election must be documented'
  );

  // Check rc BSD-2 election
  assert.ok(
    content.includes('`rc@1.2.8`') && content.includes('**BSD-2-Clause**'),
    'rc BSD-2-Clause election must be documented'
  );

  // Check @maplibre/mlt MIT election
  assert.ok(
    content.includes('`@maplibre/mlt@1.3.0`') && content.includes('**MIT**'),
    '@maplibre/mlt MIT election must be documented'
  );
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

test('Syft SBOM artifacts are generated and syntactically valid', () => {
  const baselineDir = path.join(ROOT_DIR, 'baseline');
  const spdxFile = path.join(baselineDir, 'sbom.spdx.json');
  const cdxFile = path.join(baselineDir, 'sbom.cyclonedx.json');

  assert.ok(fs.existsSync(spdxFile), 'baseline/sbom.spdx.json must exist');
  assert.ok(fs.existsSync(cdxFile), 'baseline/sbom.cyclonedx.json must exist');

  const spdx = JSON.parse(fs.readFileSync(spdxFile, 'utf8'));
  assert.equal(spdx.spdxVersion, 'SPDX-2.3', 'SPDX version must be 2.3');
  assert.ok(Array.isArray(spdx.packages) && spdx.packages.length > 100, 'SPDX must list packages');

  const cdx = JSON.parse(fs.readFileSync(cdxFile, 'utf8'));
  assert.equal(cdx.bomFormat, 'CycloneDX', 'BOM format must be CycloneDX');
  assert.ok(Array.isArray(cdx.components) && cdx.components.length > 100, 'CycloneDX must list components');
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
