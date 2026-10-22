import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('basemap configuration defaults to neutral canvas with no external ODbL dependencies', async () => {
  const originalEnv = { ...process.env };
  try {
    delete process.env.TILEO_BASEMAP_URL;
    delete process.env.TILEO_BASEMAP_ATTRIBUTION;

    // Fresh import with no basemap env set
    const { config } = await import(`../config.js?t=${Date.now()}-default`);
    assert.equal(config.basemapUrl, '', 'Default basemapUrl must be empty (neutral dark canvas)');
    assert.equal(config.basemapAttribution, '', 'Default basemapAttribution must be empty');
  } finally {
    process.env = originalEnv;
  }
});

test('basemap configuration supports explicit opt-in to OpenStreetMap with required ODbL attribution', async () => {
  const originalEnv = { ...process.env };
  try {
    process.env.TILEO_BASEMAP_URL = 'osm';
    delete process.env.TILEO_BASEMAP_ATTRIBUTION;

    const { config } = await import(`../config.js?t=${Date.now()}-osm`);
    assert.equal(config.basemapUrl, '/api/basemap/osm/{z}/{x}/{y}.png', 'Shorthand "osm" must resolve to internal cached proxy');
    assert.match(config.basemapAttribution, /OpenStreetMap/, 'OSM basemap must include OpenStreetMap attribution');
    assert.match(config.basemapAttribution, /contributors/, 'OSM basemap must include contributors attribution');
  } finally {
    process.env = originalEnv;
  }
});

test('basemap configuration supports self-hosted PMTiles or operator-owned archives', async () => {
  const originalEnv = { ...process.env };
  try {
    process.env.TILEO_BASEMAP_URL = 'pmtiles://https://data.example.com/basemap.pmtiles';
    process.env.TILEO_BASEMAP_ATTRIBUTION = '© Operator Cartography';

    const { config } = await import(`../config.js?t=${Date.now()}-pmtiles`);
    assert.equal(config.basemapUrl, 'pmtiles://https://data.example.com/basemap.pmtiles');
    assert.equal(config.basemapAttribution, '© Operator Cartography');
  } finally {
    process.env = originalEnv;
  }
});

test('web index.html provides dynamic basemap label defaulted to neutral canvas', () => {
  const htmlPath = join(__dirname, '../../web/index.html');
  const html = readFileSync(htmlPath, 'utf8');

  assert.match(html, /id="basemap-label"/, 'index.html must expose #basemap-label for dynamic status updates');
  assert.match(html, /No basemap/, 'index.html default label must reflect neutral basemap-free state');
  assert.doesNotMatch(html, /<span class="basemap-label"[^>]*>.*OpenStreetMap.*<\/span>/, 'index.html must not hardcode OpenStreetMap as the default');
});

test('web landing-map.js defaults to neutral canvas unless explicitly opted in', () => {
  const jsPath = join(__dirname, '../../web/landing-map.js');
  const js = readFileSync(jsPath, 'utf8');

  assert.match(js, /window\.TILEO_BASEMAP_URL/, 'landing-map.js must support operator-configured basemap');
  assert.match(js, /SAMPLE\.basemap/, 'landing-map.js must check SAMPLE.basemap before enabling tiles');
  assert.match(js, /id:\s*'background'/, 'landing-map.js must provide dark background fallback when basemap is omitted');
});
