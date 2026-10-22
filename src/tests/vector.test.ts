import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { gzipSync } from 'node:zlib';
import { tippecanoeArgs, vector, summarizeTippecanoeDrop, estimatedVectorCopies, resolveVectorPlan, classifyGeometry, suggestPreserveFloor, DENSITY_DEFAULTS, SPARSE_TILE_BYTES, SPARSE_TILE_FEATURES } from '../vector.js';
import { validate } from '../validate.js';
import { JobError, parseOptions } from '../types.js';

test('Preserve fixes precision and keeps geometry; Density stays within the requested zooms', () => {
  for (const maxZoom of [4, 16, 18, 22]) {
    const options = parseOptions({ maxZoom, vectorPreset: 'preserve' });
    const detail = Math.min(14, 32 - maxZoom);
    const span = maxZoom - 0;
    const lowDetail = span > 8 ? Math.min(14, detail) : detail;
    const preserve = tippecanoeArgs('result.mbtiles', 'scratch', options);
    for (const arg of [`--full-detail=${detail}`, `--low-detail=${lowDetail}`, `--minimum-detail=${detail}`, '-r1', '--no-line-simplification', '--no-tiny-polygon-reduction', '--no-feature-limit', '--no-tile-size-limit', '--detect-shared-borders']) assert.ok(preserve.includes(arg), `${maxZoom}: ${arg}`);
    const density = tippecanoeArgs('result.mbtiles', 'scratch', parseOptions({ maxZoom }));
    for (const arg of [`--maximum-tile-bytes=${DENSITY_DEFAULTS.maxTileBytes}`, `--maximum-tile-features=${DENSITY_DEFAULTS.maxTileFeatures}`, '--drop-densest-as-needed', '--simplify-only-low-zooms', '--no-tiny-polygon-reduction-at-maximum-zoom', '--detect-shared-borders']) assert.ok(density.includes(arg), `${maxZoom}: ${arg}`);
    assert.ok(!density.includes('--no-tile-size-limit'));
    assert.ok(!density.includes('--extend-zooms-if-still-dropping'));
  }
});

test('Dynamic plan adapts to geometry, tier and span; explicit overrides win', () => {
  // Points cluster instead of dropping.
  const points = resolveVectorPlan({ kind: 'vector', crs: null, featureCount: 200000, geometryType: 'Point' } as never, parseOptions({ minZoom: 10, maxZoom: 14 }));
  assert.equal(points.geometry, 'point');
  assert.ok(points.dropArgs.includes('--cluster-densest-as-needed'));
  assert.ok(!points.dropArgs.includes('--drop-densest-as-needed'));
  // Lines and polygons drop densest.
  assert.equal(classifyGeometry('LineString'), 'line');
  assert.equal(classifyGeometry('MultiPolygon'), 'polygon');
  assert.equal(classifyGeometry(undefined), 'polygon');
  const lines = resolveVectorPlan({ kind: 'vector', crs: null, featureCount: 200000, geometryType: 'LineString' } as never, parseOptions({ minZoom: 10, maxZoom: 14 }));
  assert.ok(lines.dropArgs.includes('--drop-densest-as-needed'));
  // Sparse layers get roomier budgets so small datasets are never thinned.
  const sparse = resolveVectorPlan({ kind: 'vector', crs: null, featureCount: 120 } as never, parseOptions({ minZoom: 0, maxZoom: 10 }));
  assert.equal(sparse.densityTier, 'sparse');
  assert.equal(sparse.maxTileBytes, SPARSE_TILE_BYTES);
  assert.equal(sparse.maxTileFeatures, SPARSE_TILE_FEATURES);
  // Wide spans coarsen low-zoom detail one step.
  const wide = resolveVectorPlan({ kind: 'vector', crs: null, featureCount: 200000 } as never, parseOptions({ minZoom: 0, maxZoom: 14 }));
  assert.equal(wide.lowDetail, 10);
  const narrow = resolveVectorPlan({ kind: 'vector', crs: null, featureCount: 200000 } as never, parseOptions({ minZoom: 12, maxZoom: 14 }));
  assert.equal(narrow.lowDetail, 12);
  // Explicit overrides always win.
  const custom = resolveVectorPlan({ kind: 'vector', crs: null, featureCount: 200000 } as never, parseOptions({ minZoom: 10, maxZoom: 14, maxTileBytes: 1000000, maxTileFeatures: 50000 }));
  assert.equal(custom.maxTileBytes, 1000000);
  assert.equal(custom.maxTileFeatures, 50000);
  // Preserve floor is extent-aware: city parcels need high zoom, national data does not.
  // Makassar 388k parcels: z12 = 28 tiles ≈ 13.9k/tile ≤ 20k budget → floor 12.
  const city: [number, number, number, number] = [119.073610, -5.258939, 119.562634, -4.974894];
  assert.equal(suggestPreserveFloor(388526, city, 14), 12);
  assert.equal(suggestPreserveFloor(5000, city, 14), 0);
  assert.equal(suggestPreserveFloor(388526, undefined, 14), 10);
});

test('Attribute filtering reaches tippecanoe --include/--exclude-all', () => {
  const kept = tippecanoeArgs('r.mbtiles', 's', parseOptions({ maxZoom: 14, includeProperties: ['NIB', 'KELURAHAN'] }));
  assert.ok(kept.includes('--include') && kept.includes('NIB') && kept.includes('KELURAHAN'));
  const pure = tippecanoeArgs('r.mbtiles', 's', parseOptions({ maxZoom: 14, includeProperties: [] }));
  assert.ok(pure.includes('--exclude-all'));
  const all = tippecanoeArgs('r.mbtiles', 's', parseOptions({ maxZoom: 14 }));
  assert.ok(!all.includes('--include') && !all.includes('--exclude-all'));
  assert.throws(() => parseOptions({ maxZoom: 14, includeProperties: ['-evil'] }), /Invalid attribute name/);
  assert.throws(() => parseOptions({ maxZoom: 14, includeProperties: 'NIB' as unknown as string[] }), /must be an array/);
});

test('Tile budgets are explicit and bounded', () => {
  const custom = tippecanoeArgs('r.mbtiles', 's', parseOptions({ maxZoom: 14, maxTileBytes: 1000000, maxTileFeatures: 50000 }));
  assert.ok(custom.includes('--maximum-tile-bytes=1000000') && custom.includes('--maximum-tile-features=50000'));
  assert.throws(() => parseOptions({ maxZoom: 14, maxTileBytes: 1000 }), /maxTileBytes/);
  assert.throws(() => parseOptions({ maxZoom: 14, maxTileFeatures: 9999999 }), /maxTileFeatures/);
});

test('Drop-rate log summary reports the sparsest kept fraction', () => {
  assert.deepEqual(summarizeTippecanoeDrop('no thinning here'), { minKeptPct: null, samples: 0 });
  const log = 'tile 11/1703/1053 size is 10236447\nGoing to try keeping the sparsest 1.97% of the features to make it fit\ntile 12/3406/2106 size is 7928814\nGoing to try keeping the sparsest 5.04% of the features to make it fit';
  assert.deepEqual(summarizeTippecanoeDrop(log), { minKeptPct: 1.97, samples: 2 });
  assert.equal(estimatedVectorCopies(388526, 0, 14), 388526 * 15);
});

test('GDAL cannot silently implement Preserve with lossy tile limits', async () => {
  await assert.rejects(vector('unused', 'unused', 'unused', { kind: 'vector', crs: 'EPSG:4326' }, parseOptions({ vectorEngine: 'gdal', vectorPreset: 'preserve' }), {}, () => {}), (error: unknown) => error instanceof JobError && error.code === 'INVALID_OPTIONS');
});

test('388,526 features at zoom 0–14 reach normalization in Preserve without a copy-count rejection', async () => {
  const controller = new AbortController();
  controller.abort(new JobError('CANCELLED', 'Stop before launching a native tool.'));
  const stages: string[] = [];
  await assert.rejects(vector('unused', 'unused', 'unused', { kind: 'vector', crs: 'EPSG:4326', layer: 'features', featureCount: 388526 }, parseOptions({ minZoom: 0, maxZoom: 14, vectorPreset: 'preserve', vectorEngine: 'tippecanoe' }), { signal: controller.signal }, stage => stages.push(stage)), (error: unknown) => error instanceof JobError && error.code === 'CANCELLED');
  assert.deepEqual(stages, ['Vector: normalizing coordinates with GDAL']);
});

test('vector validation allows missing low zooms but rejects an incorrect maximum or out-of-range zooms', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-vector-range-'));
  const path = join(dir, 'tiles.mbtiles'), db = new Database(path);
  try {
    db.exec('CREATE TABLE metadata(name TEXT,value TEXT); CREATE TABLE tiles(zoom_level INTEGER,tile_column INTEGER,tile_row INTEGER,tile_data BLOB)');
    db.prepare('INSERT INTO metadata VALUES(?,?)').run('format', 'pbf');
    db.prepare('INSERT INTO metadata VALUES(?,?)').run('json', JSON.stringify({ vector_layers: [{ id: 'features' }] }));
    db.prepare('INSERT INTO tiles VALUES(?,?,?,?)').run(4, 0, 0, gzipSync(Buffer.from([0x1a, 0])));
    assert.equal(validate(path, 'vector', parseOptions({ minZoom: 0, maxZoom: 4 })).minZoom, 4);
    for (const maxZoom of [3, 5]) assert.throws(() => validate(path, 'vector', parseOptions({ maxZoom })), /was requested/);
    db.prepare('INSERT INTO tiles VALUES(?,?,?,?)').run(0, 0, 0, gzipSync(Buffer.from([0x1a, 0])));
    assert.throws(() => validate(path, 'vector', parseOptions({ minZoom: 1, maxZoom: 4 })), /was requested/);
  } finally { db.close(); await rm(dir, { recursive: true, force: true }); }
});
