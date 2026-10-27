#!/usr/bin/env node
/**
 * Inspect container image and generate image-notice-paths.csv
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
function getArg(name, defaultValue) {
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return defaultValue;
}

const IMAGE_TAG = getArg('image', args.find(a => !a.startsWith('--')) || 'tileo-ts:local');
const OUT_DIR = path.resolve(ROOT_DIR, getArg('out-dir', 'artifacts/compliance'));
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}
const OUT_FILE = path.join(OUT_DIR, 'image-notice-paths.csv');

console.log(`Inspecting license and notice paths in image: ${IMAGE_TAG}...`);

// Use an alpine helper container to examine image filesystem tar
const inspectScript = `
mkdir -p /tmp/inspect && docker save ${IMAGE_TAG} | tar -xf - -C /tmp/inspect
`;

// Alternative: Run container directly with node to list paths
const nodeProbe = `
const fs = require('fs');
const path = require('path');

function walk(dir, results = []) {
  try {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const d of list) {
      const full = path.join(dir, d.name);
      if (d.isDirectory()) {
        if (!full.includes('/proc') && !full.includes('/sys') && !full.includes('/dev')) {
          walk(full, results);
        }
      } else if (d.isFile()) {
        const lower = d.name.toLowerCase();
        if (
          lower.includes('license') ||
          lower.includes('notice') ||
          lower.includes('copying') ||
          lower.includes('copyright') ||
          lower.endsWith('.spdx.json') ||
          lower.endsWith('.cdx.json') ||
          lower.endsWith('components.json') ||
          lower.endsWith('manifest.json')
        ) {
          try {
            const stat = fs.statSync(full);
            results.push({ path: full, size: stat.size });
          } catch {}
        }
      }
    }
  } catch {}
  return results;
}

const found = walk('/');
console.log(JSON.stringify(found));
`;

let probeResult = '';
try {
  probeResult = execFileSync('docker', [
    'run', '--rm',
    IMAGE_TAG,
    'node', '-e', nodeProbe
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
} catch (err) {
  console.error('Failed to probe image:', err.message);
  process.exit(1);
}

const records = JSON.parse(probeResult.trim());
console.log(`Found ${records.length} notice/license/attribution files in container.`);

const csvLines = [
  'container_path,file_type,size_bytes,component_scope,description'
];

for (const r of records) {
  const p = r.path;
  let fileType = 'license';
  let scope = 'runtime';
  let desc = '';

  if (p.includes('THIRD-PARTY-NOTICES') || p.includes('THIRD_PARTY_NOTICES')) {
    fileType = 'comprehensive_notice';
    scope = 'all_third_party';
    desc = 'Primary unified attribution document for all third-party components';
  } else if (p.includes('NOTICE.md')) {
    fileType = 'project_notice';
    scope = 'tileo';
    desc = 'Project copyright notice and root license declaration';
  } else if (p.includes('tippecanoe-notices')) {
    fileType = 'native_license';
    scope = 'tippecanoe';
    desc = 'Upstream license and bundled permissive libraries for Tippecanoe';
  } else if (p.includes('/third-party/licenses/native/')) {
    fileType = 'native_license_corpus';
    scope = 'native_runtime';
    desc = 'Verified upstream license file for native runtime component';
  } else if (p.includes('/third-party/licenses/npm/')) {
    fileType = 'npm_license_corpus';
    scope = 'npm_runtime';
    desc = 'Verified upstream license file for npm runtime dependency';
  } else if (p.includes('node_modules')) {
    fileType = 'npm_package_license';
    scope = 'npm_dependency';
    desc = 'License file included in distributed npm package';
  } else if (p.endsWith('.json')) {
    fileType = 'manifest_or_sbom';
    scope = 'metadata';
    desc = 'Dependency metadata or SBOM artifact';
  } else {
    fileType = 'license';
    scope = 'runtime';
    desc = 'Redistributed license/copying file';
  }

  csvLines.push(`"${p.replace(/"/g, '""')}","${fileType}",${r.size},"${scope}","${desc}"`);
}

fs.writeFileSync(OUT_FILE, csvLines.join('\n') + '\n', 'utf8');
console.log(`Wrote ${records.length} paths to ${OUT_FILE}`);
