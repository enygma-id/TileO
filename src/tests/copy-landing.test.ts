import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildFolderHtml, buildFolderScript, buildSingleHtml } from '../../scripts/copy-landing.js';

test('buildSingleHtml inlines css, script and injects domain meta', () => {
  const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/maplibre.css"><script type="module" src="/landing-map.js"></script></head><body>Hello</body></html>';
  const script = "console.log('map');";
  const css = '.maplibregl-canvas { position: absolute; }';

  const result = buildSingleHtml(html, script, css, 'https://tiles.example.com');

  assert.match(result, /<meta name="tileo-domain" content="https:\/\/tiles\.example\.com">/);
  assert.match(result, /<style>\/\* MapLibre GL CSS \*\/\s*\.maplibregl-canvas/);
  assert.match(result, /window\.MAPLIBRE_URL = 'https:\/\/unpkg\.com/);
  assert.match(result, /console\.log\('map'\);/);
  assert.doesNotMatch(result, /href=["']\/maplibre\.css["']/);
  assert.doesNotMatch(result, /src=["']\/landing-map\.js["']/);
});

test('buildFolderHtml rewrites links to relative and updates domain meta', () => {
  const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width"><meta name="tileo-domain" content=""><link rel="stylesheet" href="/maplibre.css"><script type="module" src="/landing-map.js"></script></head></html>';
  const result = buildFolderHtml(html, 'https://api.my-domain.org');

  assert.match(result, /<meta name="tileo-domain" content="https:\/\/api\.my-domain\.org">/);
  assert.match(result, /href=["']\.\/maplibre\.css["']/);
  assert.match(result, /src=["']\.\/landing-map\.js["']/);
});

test('buildFolderScript configures local relative maplibre assets', () => {
  const script = "const mapLibreModuleUrl = serviceUrl('/maplibre-gl.mjs'); const mapLibreWorkerUrl = serviceUrl('/maplibre-gl-worker.mjs');";
  const result = buildFolderScript(script);

  assert.match(result, /'\.\/maplibre-gl\.mjs'/);
  assert.match(result, /new URL\('\.\/maplibre-gl-worker\.mjs', import\.meta\.url\)\.href/);
});

test('cli copy:landing can export standalone single file and full folder', async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'copy-landing-test-'));
  try {
    const singleOut = path.join(tempDir, 'single-landing.html');
    const folderOut = path.join(tempDir, 'site');

    // Single HTML export
    const singleRun = spawnSync(process.execPath, ['scripts/copy-landing.js', singleOut, '--domain', 'https://demo.tileo.local'], {
      encoding: 'utf8'
    });
    assert.equal(singleRun.status, 0, singleRun.stderr);
    const singleContent = await readFile(singleOut, 'utf8');
    assert.match(singleContent, /<meta name="tileo-domain" content="https:\/\/demo\.tileo\.local">/);
    assert.match(singleContent, /window\.MAPLIBRE_URL = 'https:\/\/unpkg\.com/);

    // Folder export
    const folderRun = spawnSync(process.execPath, ['scripts/copy-landing.js', folderOut, '--domain', 'https://demo.tileo.local'], {
      encoding: 'utf8'
    });
    assert.equal(folderRun.status, 0, folderRun.stderr);
    const indexContent = await readFile(path.join(folderOut, 'index.html'), 'utf8');
    const singleInFolder = await readFile(path.join(folderOut, 'single.html'), 'utf8');
    assert.match(indexContent, /<meta name="tileo-domain" content="https:\/\/demo\.tileo\.local">/);
    assert.match(indexContent, /href=["']\.\/maplibre\.css["']/);
    assert.match(singleInFolder, /window\.MAPLIBRE_URL/);

    const mapJs = await readFile(path.join(folderOut, 'landing-map.js'), 'utf8');
    assert.match(mapJs, /'\.\/maplibre-gl\.mjs'/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
