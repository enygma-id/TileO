import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLandingSample, fitBoundsZoom, landingSampleBounds, landingSampleData, landingSampleText } from '../web/landing-sample.js';

const featured = {
  id: '764f2e4e-f944-4e85-af05-593c56bc91b0',
  filename: 'ujung pandang.tif',
  options: { minZoom: 0, maxZoom: 22 },
  metadata: {
    kind: 'raster',
    bounds: [119.3427335121545, -5.152361233272346, 119.42142483078567, -5.113427144119242],
    minZoom: 0,
    maxZoom: 22,
    tileCount: 42692,
  },
};

test('landing sample reproduces the featured hero object', () => {
  assert.equal(buildLandingSample(featured, 14.5), [
    'const SAMPLE = {',
    "  name: 'ujung pandang.tif',",
    "  url: '/api/jobs/764f2e4e-f944-4e85-af05-593c56bc91b0/tiles/{z}/{x}/{y}',",
    '  bounds: [119.3427335121545, -5.152361233272346, 119.42142483078567, -5.113427144119242],',
    '  center: [119.3821, -5.1329],',
    '  zoom: 14.5,',
    '  minzoom: 0,',
    '  maxzoom: 22,',
    "  tiles: '42,692'",
    '};',
    '',
  ].join('\n'));
});

test('landing sample exposes readable properties for the panel', () => {
  const sample = landingSampleData(featured, 14.56);
  assert.ok(sample);
  assert.equal(sample.name, 'ujung pandang.tif');
  assert.equal(sample.url, '/api/jobs/764f2e4e-f944-4e85-af05-593c56bc91b0/tiles/{z}/{x}/{y}');
  assert.deepEqual(sample.bounds, featured.metadata.bounds);
  assert.deepEqual(sample.center, [119.3821, -5.1329]);
  assert.equal(sample.zoom, 14.6);
  assert.equal(sample.minzoom, 0);
  assert.equal(sample.maxzoom, 22);
  assert.equal(sample.tiles, '42,692');
  assert.equal(landingSampleText(sample), buildLandingSample(featured, 14.56));
  assert.equal(landingSampleData({ ...featured, metadata: { ...featured.metadata, kind: 'model3d' } }, 14), null);
});

test('landing sample only accepts raster and vector jobs with usable bounds', () => {
  assert.equal(landingSampleBounds({ ...featured, metadata: { ...featured.metadata, kind: 'model3d' } }), null);
  assert.equal(buildLandingSample({ ...featured, metadata: { ...featured.metadata, kind: 'model3d' } }, 14), null);
  assert.ok(landingSampleBounds({ ...featured, metadata: { ...featured.metadata, kind: 'vector' } }));
  assert.equal(landingSampleBounds({ ...featured, metadata: { kind: 'raster' } }), null);
  assert.equal(landingSampleBounds({ ...featured, metadata: { kind: 'raster', bounds: [1, 2, 3] } }), null);
  assert.equal(landingSampleBounds({ ...featured, metadata: { kind: 'raster', bounds: [1, 2, 1, 4] } }), null);
  assert.equal(landingSampleBounds({ ...featured, metadata: null }), null);
});

test('landing sample falls back to source bounds, escapes names and clamps zoom', () => {
  const job = {
    id: 'job-1',
    filename: "it's a map.tif",
    options: { minZoom: 5, maxZoom: 12 },
    metadata: { kind: 'raster', source: { bounds: [10, -10, 20, 0] } },
  };
  const snippet = buildLandingSample(job, 40);
  assert.ok(snippet);
  assert.match(snippet, /name: 'it\\'s a map\.tif',/);
  assert.match(snippet, /bounds: \[10, -10, 20, 0\],/);
  assert.match(snippet, /^ {2}zoom: 12,$/m);
  assert.match(snippet, /^ {2}minzoom: 5,$/m);
  assert.match(snippet, /^ {2}maxzoom: 12,$/m);
  assert.match(snippet, /tiles: 'unknown'/);
  assert.match(buildLandingSample(job, 0) ?? '', /^ {2}zoom: 5,$/m);
});

test('fitBoundsZoom frames a small extent within its zoom range', () => {
  const bounds: [number, number, number, number] = [119.3427, -5.1524, 119.4214, -5.1134];
  const zoom = fitBoundsZoom(bounds, 1200, 800, 0, 22);
  assert.ok(zoom > 13 && zoom < 16, `unexpected zoom ${zoom}`);
  assert.equal(fitBoundsZoom(bounds, 1200, 800, 15, 22), 15);
  assert.equal(fitBoundsZoom(bounds, 0, 0, 5, 10), 10);
});
