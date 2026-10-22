import { test } from 'node:test';
import assert from 'node:assert/strict';
import { benchmarkReport } from '../benchmark.js';
import type { Job } from '../types.js';

function baseJob(overrides: Partial<Job> = {}): Job {
  return {
    id: '00000000-0000-0000-0000-000000000000',
    filename: 'sample.geojson',
    input: 'sample.geojson',
    sha256: 'hash',
    size: 100 * 1024 ** 2,
    options: { minZoom: 10, maxZoom: 14, tileFormat: 'webp', quality: 80, sourceCrs: null, layer: null, vectorPreset: 'density', vectorEngine: 'auto', includeProperties: null, maxTileBytes: null, maxTileFeatures: null },
    status: 'SUCCEEDED',
    stage: 'Complete',
    progress: 100,
    cancel: 0,
    attempt: 1,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    started: new Date().toISOString(),
    error: null,
    code: null,
    output: 'tiles.mbtiles',
    metadata: {},
    ...overrides,
  } as Job;
}

test('Dense vector benchmark judges compression, tile health and thinning', () => {
  const job = baseJob({
    filename: 'HAT Kota Makassar 2026.geojson',
    size: Math.round(342.3 * 1024 ** 2),
    options: { ...baseJob().options, minZoom: 0, maxZoom: 16 },
    metadata: {
      kind: 'vector',
      tileCount: 959,
      minZoom: 3,
      maxZoom: 16,
      maxTileBytes: 455680,
      avgTileBytes: 20000,
      totalTileBytes: Math.round(19.2 * 1024 ** 2),
      tileFeatureCount: 388000,
      minKeptPct: 8.2,
      thinnedTiles: 40,
      vectorPlan: { geometry: 'polygon', densityTier: 'dense', detail: 14, lowDetail: 10, minimumDetail: 10, maxTileBytes: 500000, maxTileFeatures: 200000, avgPerTileAtMin: 388526 },
      source: { featureCount: 388526, fields: ['NIB', 'KELURAHAN', 'TIPEHAK'], geometryType: 'MultiPolygon', bounds: [119, -5.2, 119.5, -5] },
    },
  });
  const report = benchmarkReport(job);
  assert.equal(report.title, 'Vector benchmark');
  const levels = report.verdicts.map(v => v.level);
  assert.ok(levels.includes('ok'), 'excellent compression + tile health should be ok');
  assert.ok(report.verdicts.some(v => v.text.includes('8.2%')), 'thinning percentage surfaced');
  assert.ok(report.verdicts.some(v => v.text.includes('zoom 3')), 'omitted low zooms explained');
  assert.ok(report.verdicts.some(v => v.text.includes('388,000 of 388,526')), 'max-zoom feature loss judged');
  assert.equal(report.sections.length, 2);
});

test('Small preserve vector reports full fidelity without warnings', () => {
  const job = baseJob({
    options: { ...baseJob().options, minZoom: 0, maxZoom: 10, vectorPreset: 'preserve', vectorEngine: 'tippecanoe' },
    metadata: {
      kind: 'vector', tileCount: 12, minZoom: 0, maxZoom: 10,
      maxTileBytes: 120000, avgTileBytes: 40000, totalTileBytes: 480000,
      tileFeatureCount: 1200,
      source: { featureCount: 1200, fields: ['name'], geometryType: 'Point' },
    },
  });
  const report = benchmarkReport(job);
  assert.ok(!report.verdicts.some(v => v.level === 'warn'), JSON.stringify(report.verdicts));
  assert.ok(report.verdicts.some(v => v.text.includes('1,200 features present')));
});

test('Raster benchmark flags overzoom and lossless quality', () => {
  const job = baseJob({
    filename: 'ortho.tif',
    options: { ...baseJob().options, minZoom: 0, maxZoom: 21, tileFormat: 'webp', quality: 100 },
    metadata: {
      kind: 'raster', format: 'webp', tileCount: 5000, minZoom: 0, maxZoom: 21,
      maxTileBytes: 60000, avgTileBytes: 30000, totalTileBytes: 150 * 1024 ** 2,
      source: { width: 15200, height: 14800, bands: 3, nativeZoom: 19 },
    },
  });
  const report = benchmarkReport(job);
  assert.ok(report.verdicts.some(v => v.level === 'warn' && v.text.includes('2 level(s) above native zoom 19')));
  assert.ok(report.verdicts.some(v => v.level === 'warn' && v.text.includes('Quality 100')));
});

test('Elevation benchmark covers COG-only and terrain outputs', () => {
  const cogOnly = baseJob({
    filename: 'dtm.tif',
    options: { pipeline: 'elevation', elevationOutput: 'cog', elevationKind: 'dtm', elevationUnit: 'm', heightReference: 'orthometric', minZoom: 0, maxZoom: 12, tileFormat: 'png', quality: 80, sourceCrs: null, layer: null, vectorPreset: 'density', vectorEngine: 'auto', includeProperties: null, maxTileBytes: null, maxTileFeatures: null },
    metadata: {
      kind: 'elevation', format: 'cog', elevationKind: 'dtm', elevationUnit: 'm', heightReference: 'orthometric',
      cogBytes: 80 * 1024 ** 2, cog: { width: 4000, height: 4000 },
      source: { width: 4000, height: 4000, dataType: 'Float32' },
    },
  });
  const cogReport = benchmarkReport(cogOnly);
  assert.ok(cogReport.verdicts.some(v => v.level === 'ok' && v.text.includes('bit-for-bit')));
  const terrain = baseJob({
    filename: 'dtm.tif',
    options: { ...(cogOnly.options as Job['options']), elevationOutput: 'terrain-rgb', terrainNoDataHeight: 0 },
    metadata: {
      ...(cogOnly.metadata as Record<string, unknown>),
      format: 'terrain-rgb',
      tileCount: 200, minZoom: 10, maxZoom: 12, maxTileBytes: 90000, totalTileBytes: 10 * 1024 ** 2,
      encoding: 'mapbox', syntheticNoDataPixels: 1234,
    },
  });
  const terrainReport = benchmarkReport(terrain);
  assert.ok(terrainReport.verdicts.some(v => v.text.includes('0.1 m steps')));
  assert.ok(terrainReport.verdicts.some(v => v.text.includes('1,234 missing pixels')));
});

test('3D benchmark distinguishes single-tile giants from spatial LOD', () => {
  const giant = baseJob({
    filename: 'city.glb',
    metadata: { kind: 'model3d', format: '3dtiles', latitude: -5, longitude: 119, height: 10, heading: 0, pitch: 0, roll: 0, anchor: 'base', scale: 1, primitives: 40, triangles: 900000, tiles: 1, lodLevels: 1, strategy: 'lod' },
  });
  assert.ok(benchmarkReport(giant).verdicts.some(v => v.level === 'warn' && v.text.includes('900,000 triangles')));
  const spatial = baseJob({
    filename: 'campus.glb',
    metadata: { kind: 'model3d', format: '3dtiles', latitude: -5, longitude: 119, height: 10, heading: 0, pitch: 0, roll: 0, anchor: 'base', scale: 1, primitives: 120, triangles: 1500000, tiles: 9, lodLevels: 3, strategy: 'spatial-lod' },
  });
  const spatialReport = benchmarkReport(spatial);
  assert.ok(spatialReport.verdicts.some(v => v.level === 'ok' && v.text.includes('3 LOD levels')));
});

test('Missing metadata degrades to a neutral report', () => {
  const report = benchmarkReport(baseJob({ metadata: null }));
  assert.equal(report.verdicts.length, 1);
  assert.equal(report.verdicts[0]!.level, 'info');
});
