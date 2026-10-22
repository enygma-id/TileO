#!/usr/bin/env node
// Standalone landing exporter: copies the landing page as a static website
// folder or a single self-contained HTML file with a configurable API domain.
//
// Usage: npm run copy:landing -- <target> [--domain <url>] [--token-env <name>] [--single-file] [--dry-run]
import { cp, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const USAGE = `Usage: npm run copy:landing -- <target-folder-or-file> [options]

Exports the TileO landing page as a standalone site or a single HTML file.

Options:
  --domain <url>    TileO host URL (e.g. https://tiles.example.com)
  --token-env <name> Name of environment variable containing the API token
  --single-file     export as a single self-contained HTML file (uses CDN for MapLibre)
  --dry-run         preview files that would be created without writing

Examples:
  # Export as an offline-ready folder (all vendor assets included):
  npm run copy:landing -- dist/landing --domain https://tiles.example.com --token-env TILEO_LANDING_TOKEN

  # Export as a single self-contained HTML file:
  npm run copy:landing -- dist/landing/index.html --domain https://tiles.example.com`;

class Stop extends Error {}

function fail(message) {
  console.error(`copy:landing - ${message}`);
  process.exitCode = 1;
  throw new Stop(message);
}

function usage(message) {
  if (message) console.error(`copy:landing - ${message}\n`);
  console.error(USAGE);
  process.exitCode = 1;
  throw new Stop(message);
}

function size(bytes) {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function tokenSetup(token) {
  const encoded = JSON.stringify(token).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  return `window.TILEO_ACCESS_TOKEN = ${encoded};`;
}

export function buildSingleHtml(html, script, css, domain = '', token = '', configScript = '') {
  let output = html;

  // 1. Set domain in meta tag
  const metaRegex = /<meta\s+name=["']tileo-domain["'][^>]*>/i;
  const metaTag = `<meta name="tileo-domain" content="${domain}">`;
  if (metaRegex.test(output)) {
    output = output.replace(metaRegex, metaTag);
  } else {
    output = output.replace(/<meta\s+name=["']viewport["'][^>]*>/i, (m) => `${m}\n<meta name="tileo-domain" content="${domain}">`);
  }

  // 2. Inline MapLibre CSS
  output = output.replace(/<link\s+rel=["']stylesheet["']\s+href=["'][^"']*maplibre\.css["']\s*\/?>/i, `<style>/* MapLibre GL CSS */\n${css}\n</style>`);

  // 3. Configure CDN URLs for MapLibre and inline the module script
  const cdnSetup = [
    tokenSetup(token),
    configScript,
    '  <script>',
    "    window.MAPLIBRE_URL = 'https://unpkg.com/maplibre-gl@6.12.0/dist/maplibre-gl.mjs';",
    "    window.MAPLIBRE_WORKER_URL = 'https://unpkg.com/maplibre-gl@6.12.0/dist/maplibre-gl-worker.mjs';",
    '  </script>'
  ].join('\n');

  output = output.replace(
    /<script\s+type=["']module["']\s+src=["'][^"']*landing-map\.js["']\s*><\/script>/i,
    `${cdnSetup}\n  <script type="module">\n${script}\n  </script>`
  );
  output = output.replace(/<script\s+src=["'][^"']*landing-config\.js["']\s*><\/script>/i, '');

  return output;
}

export function buildFolderHtml(html, domain = '') {
  let output = html;
  const metaRegex = /<meta\s+name=["']tileo-domain["'][^>]*>/i;
  const metaTag = `<meta name="tileo-domain" content="${domain}">`;
  if (metaRegex.test(output)) {
    output = output.replace(metaRegex, metaTag);
  } else {
    output = output.replace(/<meta\s+name=["']viewport["'][^>]*>/i, (m) => `${m}\n<meta name="tileo-domain" content="${domain}">`);
  }
  output = output.replace(/(href=["'])\/maplibre\.css(["'])/gi, '$1./maplibre.css$2');
  output = output.replace(/(src=["'])\/landing-config\.js(["'])/gi, '$1./landing-config.js$2');
  output = output.replace(/(src=["'])\/landing-map\.js(["'])/gi, '$1./landing-map.js$2');
  return output;
}

export function buildFolderScript(script, token = '') {
  // In folder mode, ensure MapLibre loads from relative local files unless overridden.
  return `${tokenSetup(token)}\n${script
    .replace("serviceUrl('/maplibre-gl.mjs')", "'./maplibre-gl.mjs'")
    .replace("serviceUrl('/maplibre-gl-worker.mjs')", "new URL('./maplibre-gl-worker.mjs', import.meta.url).href")}`;
}

async function main() {
  const args = process.argv.slice(2);
  let targetArg = null;
  let domain = '';
  let token = process.env.TILEO_LANDING_TOKEN ?? '';
  let tokenEnv = '';
  let singleFile = false;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') return usage();
    if (arg === '--single' || arg === '--single-file') {
      singleFile = true;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg.startsWith('--domain=')) {
      domain = arg.slice('--domain='.length).trim();
    } else if (arg === '--domain') {
      domain = (args[++i] ?? '').trim();
    } else if (arg.startsWith('--token-env=')) {
      tokenEnv = arg.slice('--token-env='.length).trim();
    } else if (arg === '--token-env') {
      tokenEnv = (args[++i] ?? '').trim();
    } else if (arg.startsWith('--token=')) {
      token = arg.slice('--token='.length);
    } else if (arg === '--token') {
      token = args[++i] ?? '';
    } else if (arg.startsWith('--')) {
      return usage(`Unknown option ${arg}`);
    } else if (!targetArg) {
      targetArg = arg;
    } else {
      return usage(`Unexpected extra argument: ${arg}`);
    }
  }

  if (!targetArg) return usage('Missing target path.');
  if (tokenEnv) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(tokenEnv)) return usage('Invalid environment variable name for --token-env.');
    token = process.env[tokenEnv] ?? '';
    if (!token) return usage(`Environment variable ${tokenEnv} is not set or is empty.`);
  }

  domain = domain.replace(/\/+$/, '');
  const targetPath = path.resolve(process.cwd(), targetArg);
  const isHtmlTarget = targetPath.toLowerCase().endsWith('.html') || targetPath.toLowerCase().endsWith('.htm');
  const asSingle = singleFile || isHtmlTarget;

  // Read template source files
  const htmlSrc = await readFile(path.join(root, 'web/landing.html'), 'utf8');
  const configSrc = await readFile(path.join(root, 'web/landing-config.js'), 'utf8');
  const mapJsSrc = await readFile(path.join(root, 'web/landing-map.js'), 'utf8');
  const cssSrc = await readFile(path.join(root, 'node_modules/maplibre-gl/dist/maplibre-gl.css'), 'utf8');

  if (asSingle) {
    const destFile = isHtmlTarget ? targetPath : path.join(targetPath, 'index.html');
    const content = buildSingleHtml(htmlSrc, mapJsSrc, cssSrc, domain, token, configSrc);
    const byteLength = Buffer.byteLength(content, 'utf8');

    console.log(dryRun ? 'Landing export (dry run - nothing written)' : 'Landing export complete.');
    console.log(`  mode     single HTML file`);
    console.log(`  target   ${destFile}`);
    console.log(`  domain   ${domain || '(same origin / relative /api)'}`);
    console.log(`  size     ${size(byteLength)}`);

    if (!dryRun) {
      await mkdir(path.dirname(destFile), { recursive: true });
      await writeFile(destFile, content, 'utf8');
      console.log('\nReady to use:');
      console.log(`  Double-click or deploy ${destFile}.`);
      console.log('  To change the domain later, edit the <meta name="tileo-domain"> tag in the HTML.');
    }
  } else {
    const destDir = targetPath;
    const folderHtml = buildFolderHtml(htmlSrc, domain);
    const folderScript = buildFolderScript(mapJsSrc, token);
    const singleHtml = buildSingleHtml(htmlSrc, mapJsSrc, cssSrc, domain, token, configSrc);

    const vendorFiles = [
      ['maplibre-gl.mjs', 'node_modules/maplibre-gl/dist/maplibre-gl.mjs'],
      ['maplibre-gl-worker.mjs', 'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs'],
      ['maplibre-gl-shared.mjs', 'node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs'],
      ['maplibre.css', 'node_modules/maplibre-gl/dist/maplibre-gl.css'],
      ['tileo-logo.svg', 'web/assets/tileo-logo.svg'],
      ['tileo-logo-white.svg', 'web/assets/tileo-logo-white.svg'],
      ['tileo-social-card.jpg', 'web/assets/tileo-social-card.jpg']
    ];

    let totalBytes = Buffer.byteLength(folderHtml, 'utf8') + Buffer.byteLength(folderScript, 'utf8') + Buffer.byteLength(singleHtml, 'utf8') + Buffer.byteLength(configSrc, 'utf8');
    for (const [, rel] of vendorFiles) {
      totalBytes += (await stat(path.join(root, rel))).size;
    }

    console.log(dryRun ? 'Landing export (dry run - nothing written)' : 'Landing export complete.');
    console.log(`  mode     standalone website folder`);
    console.log(`  target   ${destDir}`);
    console.log(`  domain   ${domain || '(same origin / relative /api)'}`);
    console.log(`  files    11 (${size(totalBytes)})`);
    console.log(`  assets   index.html, single.html, landing-config.js, landing-map.js, maplibre.css, maplibre-gl*.mjs, tileo-logo*.svg, tileo-social-card.jpg`);

    if (!dryRun) {
      await mkdir(destDir, { recursive: true });
      await writeFile(path.join(destDir, 'index.html'), folderHtml, 'utf8');
      await writeFile(path.join(destDir, 'single.html'), singleHtml, 'utf8');
      await writeFile(path.join(destDir, 'landing-config.js'), configSrc, 'utf8');
      await writeFile(path.join(destDir, 'landing-map.js'), folderScript, 'utf8');
      for (const [name, rel] of vendorFiles) {
        await cp(path.join(root, rel), path.join(destDir, name));
      }
      console.log('\nReady to use:');
      console.log(`  Deploy ${destDir} to any static web server (NGINX, Caddy, S3, Netlify, etc.).`);
      console.log('  - index.html: offline-ready, uses local MapLibre assets.');
      console.log('  - single.html: 1-file standalone version using CDN.');
      console.log('  To change the domain later, edit the <meta name="tileo-domain"> tag in index.html.');
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    if (!(err instanceof Stop)) console.error(err);
    process.exit(1);
  });
}
