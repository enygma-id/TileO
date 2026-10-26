import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { gunzipSync } from 'node:zlib';
import Database from 'better-sqlite3';
import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader } from 'pbf';
import { writeVectorMbtiles, type MvtPlan } from '../vector-mvt.js';
import { parseOptions } from '../types.js';
import { validate } from '../validate.js';

const plan: MvtPlan = { maxTileBytes: 500000, maxTileFeatures: 200000, geometry: 'polygon' };

function tileOf(lon: number, lat: number, z: number) {
  const n = 2 ** z;
  return {
    x: Math.floor((lon + 180) / 360 * n),
    y: Math.floor((1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * n),
  };
}

function readTiles(path: string) {
  const db = new Database(path, { readonly: true });
  try {
    return db.prepare('SELECT zoom_level z, tile_column x, tile_row row, tile_data data FROM tiles ORDER BY z, x, row').all() as { z: number; x: number; row: number; data: Buffer }[];
  } finally { db.close(); }
}

test('permissive MVT writer emits valid MBTiles with ids, properties and polygon holes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-mvt-'));
  try {
    const input = join(dir, 'features.geojsonl'), output = join(dir, 'out.mbtiles');
    const z = 14;
    const lon = 119.410123, lat = -5.150123;
    const polygon = [
      [[lon, lat], [lon + 0.00003, lat], [lon + 0.00003, lat + 0.00003], [lon, lat + 0.00003], [lon, lat]],
      [[lon + 0.000008, lat + 0.000008], [lon + 0.000008, lat + 0.000022], [lon + 0.000022, lat + 0.000022], [lon + 0.000022, lat + 0.000008], [lon + 0.000008, lat + 0.000008]],
    ];
    const features = [
      { type: 'Feature', id: 7, properties: { name: 'point', value: 1.5, active: true }, geometry: { type: 'Point', coordinates: [lon, lat] } },
      { type: 'Feature', id: 8, properties: { name: 'line' }, geometry: { type: 'LineString', coordinates: [[lon, lat], [lon + 0.00002, lat + 0.00001]] } },
      { type: 'Feature', id: 9, properties: { name: 'parcel' }, geometry: { type: 'Polygon', coordinates: polygon } },
      { type: 'Feature', id: 10, properties: { name: 'multi' }, geometry: { type: 'MultiPolygon', coordinates: [polygon, [[[lon + 0.00004, lat], [lon + 0.00005, lat], [lon + 0.00005, lat + 0.00001], [lon + 0.00004, lat]]]] } },
    ];
    await writeFile(input, features.map(feature => JSON.stringify(feature)).join('\n') + '\n');
    const options = parseOptions({ minZoom: z, maxZoom: z, vectorPreset: 'density' });
    const stats = await writeVectorMbtiles(input, output, options, plan, {}, () => {});
    assert.equal(stats.featureCount, 4);
    assert.ok(stats.tileCount > 0);

    const result = validate(output, 'vector', options);
    assert.equal(result.format, 'pbf');
    assert.equal(result.minZoom, z);
    assert.equal(result.maxZoom, z);
    assert.equal(result.vectorLayers[0].id, 'features');
    assert.equal(result.tileFeatureCount, 4);

    const { x, y } = tileOf(lon, lat, z);
    const row = readTiles(output).find(tile => tile.z === z && tile.x === x && tile.row === (1 << z) - 1 - y);
    assert.ok(row, 'expected the feature tile in TMS row order');
    const tile = new VectorTile(new PbfReader(gunzipSync(row.data)));
    const layer = tile.layers.features;
    assert.ok(layer, 'MVT layer must be named features');
    const decoded = Array.from({ length: layer.length }, (_, index) => layer.feature(index));    assert.deepEqual(decoded.map(feature => feature.id).sort((a, b) => a! - b!), [7, 8, 9, 10]);
    const point = decoded.find(feature => feature.id === 7)!;
    assert.equal(point.properties.name, 'point');
    assert.equal(point.properties.value, 1.5);
    assert.equal(point.properties.active, true);
    const parcel = decoded.find(feature => feature.id === 9)!;
    assert.equal(parcel.type, 3);
    assert.equal(parcel.toGeoJSON(x, y, z).geometry.type, 'Polygon');
    assert.equal((parcel.toGeoJSON(x, y, z).geometry as { coordinates: unknown[] }).coordinates.length, 2);
  } finally { await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 }); }
});

test('permissive MVT writer honors feature and byte budgets per tile', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-mvt-budget-'));
  try {
    const input = join(dir, 'features.geojsonl'), output = join(dir, 'out.mbtiles');
    const z = 14, lon = 119.41, lat = -5.15;
    const features = Array.from({ length: 400 }, (_, index) => ({
      type: 'Feature', id: index + 1,
      properties: { name: `feature-${index}`, value: index },
      geometry: { type: 'Point', coordinates: [lon + index * 1e-7, lat + index * 1e-7] },
    }));
    await writeFile(input, features.map(feature => JSON.stringify(feature)).join('\n') + '\n');
    const options = parseOptions({ minZoom: z, maxZoom: z, vectorPreset: 'density' });
    const stats = await writeVectorMbtiles(input, output, options, { maxTileBytes: 1200, maxTileFeatures: 100, geometry: 'point' }, {}, () => {});
    assert.ok(stats.thinnedTiles > 0, 'expected at least one thinned tile');
    assert.equal(stats.oversizedTiles, 0);
    const tiles = readTiles(output);
    assert.ok(tiles.length > 0);
    for (const tile of tiles) {
      assert.ok(tile.data.length <= 1200, `tile ${tile.z}/${tile.x}/${tile.row} is ${tile.data.length} bytes`);
      const decoded = new VectorTile(new PbfReader(gunzipSync(tile.data)));
      const layer = decoded.layers.features;
      assert.ok(layer);
      assert.ok(layer.length <= 100);
    }
    validate(output, 'vector', options);
  } finally { await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 }); }
});
