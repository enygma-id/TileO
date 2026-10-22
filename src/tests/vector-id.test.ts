import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findFieldCollisions, inspect, type Inspection } from '../inspect.js';
import { planVectorNormalization, restoreIdProperty, vector } from '../vector.js';
import { run } from '../process.js';
import { JobError, parseOptions } from '../types.js';

const enabled = process.env.TILEO_INTEGRATION === '1';

test('Case-only attribute collisions are grouped deterministically', () => {
  assert.deepEqual(findFieldCollisions(['OBJECTID', 'ID', 'NIB', 'id']), [['ID', 'id']]);
  assert.deepEqual(findFieldCollisions(['name', 'NAME', 'Name', 'other']), [['NAME', 'Name', 'name']]);
  assert.deepEqual(findFieldCollisions(['a', 'b', 'c']), []);
  assert.deepEqual(findFieldCollisions([]), []);
  // Exact duplicates collapse; near-misses do not collide.
  assert.deepEqual(findFieldCollisions(['id', 'id', 'ID']), [['ID', 'id']]);
  assert.deepEqual(findFieldCollisions(['id2', 'ID2x']), []);
});

test('Normalization plan keeps exact names: direct when provable, restore otherwise', () => {
  const withId = { kind: 'vector', crs: 'Embedded CRS', fields: ['OBJECTID', 'ID', 'id'], epsg: 'EPSG:4326' } as Inspection;
  const noId = { kind: 'vector', crs: 'Embedded CRS', fields: ['OBJECTID', 'ID'] } as Inspection;
  const options = parseOptions({ minZoom: 10, maxZoom: 14 });
  // No lowercase id anywhere: legacy ogr path, nothing to restore.
  assert.deepEqual(planVectorNormalization(noId, options, 'layer.geojson'), { mode: 'ogr', restoreId: false, warnings: [] });
  // WGS84 GeoJSON: skip the GDAL rewrite entirely (it would rename id to id2).
  // restoreId stays true: the GDAL fallback path still normalizes on demand.
  const direct = planVectorNormalization(withId, options, 'layer.geojson');
  assert.equal(direct.mode, 'direct');
  assert.equal(direct.restoreId, true);
  // Non-4326 CRS still needs reprojection, then a transparent restore.
  const utm = planVectorNormalization(withId, parseOptions({ minZoom: 10, maxZoom: 14, sourceCrs: 'EPSG:32750' }), 'layer.geojson');
  assert.equal(utm.mode, 'ogr');
  assert.equal(utm.restoreId, true);
  // Non-GeoJSON formats always go through GDAL first.
  const gpkg = planVectorNormalization(withId, options, 'layer.gpkg');
  assert.equal(gpkg.mode, 'ogr');
  assert.equal(gpkg.restoreId, true);
  // Unprovable CRS (no EPSG id, no override): rewrite + restore, never assume.
  const unknownCrs = planVectorNormalization({ ...withId, epsg: undefined } as Inspection, options, 'layer.geojson');
  assert.equal(unknownCrs.mode, 'ogr');
  assert.equal(unknownCrs.restoreId, true);
  // id2 genuinely present: restoring would merge two real columns.
  assert.throws(
    () => planVectorNormalization({ ...withId, fields: ['ID', 'id', 'id2'] } as Inspection, options, 'layer.gpkg'),
    (error: unknown) => error instanceof JobError && error.code === 'INVALID_OPTIONS' && /silently merge/.test(error.message),
  );
  // ...but direct mode needs no rename at all, so coexistence is fine there.
  assert.equal(planVectorNormalization({ ...withId, fields: ['ID', 'id', 'id2'] } as Inspection, options, 'layer.geojson').mode, 'direct');
});

test('GeoJSONSeq id2-placholders restore to id only when unambiguous', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-restore-'));
  try {
    const file = join(dir, 'features.geojsonl');
    const lines = [
      JSON.stringify({ type: 'Feature', id: 1, properties: { OBJECTID: 1, ID: 'UPPER-1', id2: 'lower-1' }, geometry: null }),
      JSON.stringify({ type: 'Feature', properties: { OBJECTID: 2, ID: 'UPPER-2' }, geometry: null }),
      JSON.stringify({ type: 'Feature', properties: { OBJECTID: 3, ID: 'UPPER-3', id: 'kept', id2: 'ambiguous' }, geometry: null }),
      'not json at all',
      '',
    ];
    await writeFile(file, lines.join('\n'));
    const restored = await restoreIdProperty(file, undefined);
    assert.equal(restored, 1);
    const out = (await readFile(file, 'utf8')).split('\n');
    assert.deepEqual(Object.keys(JSON.parse(out[0]!).properties), ['OBJECTID', 'ID', 'id']);
    assert.equal(JSON.parse(out[0]!).properties.id, 'lower-1');
    assert.deepEqual(Object.keys(JSON.parse(out[1]!).properties), ['OBJECTID', 'ID']);
    // Both id and id2 present: left untouched, never merged.
    assert.deepEqual(JSON.parse(out[2]!).properties, { OBJECTID: 3, ID: 'UPPER-3', id: 'kept', id2: 'ambiguous' });
    assert.equal(out[3], 'not json at all');
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('real pipeline: lowercase id survives end to end, never id2', { skip: !enabled || process.env.TILEO_RASTER_ONLY === '1' }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-vector-id-'));
  try {
    const x = 119.41, y = -5.15;
    const polygon = [[[x, y], [x + 0.01, y], [x + 0.01, y + 0.01], [x, y + 0.01], [x, y]]];
    const input = join(dir, 'parcels.geojson');
    await writeFile(input, JSON.stringify({ type: 'FeatureCollection', features: [1, 2].map(i => ({
      type: 'Feature', id: 9000 + i,
      properties: { OBJECTID: i, ID: `UPPER-${i}`, NIB: `X${i}`, id: `lower-${i}` },
      geometry: { type: 'Polygon', coordinates: polygon },
    })) }));
    const tileX = Math.floor((x + 180) / 360 * 2 ** 14);
    const tileY = Math.floor((1 - Math.asinh(Math.tan(y * Math.PI / 180)) / Math.PI) / 2 * 2 ** 14);
    const decodedProps = async (mbtiles: string) => {
      const decoded = JSON.parse(await run('tippecanoe-decode', [mbtiles, '14', String(tileX), String(tileY)], { capture: true }));
      return (decoded.features as any[]).flatMap(layer => layer.features).map(feature => feature.properties);
    };
    // Direct path (WGS84 GeoJSON): no GDAL rewrite, exact names.
    // (The worker always creates the scratch directory first.)
    const directOptions = parseOptions({ minZoom: 14, maxZoom: 14, vectorEngine: 'tippecanoe' });
    const directInfo = await inspectSample(input, directOptions);
    await mkdir(join(dir, 'scratch-direct'), { recursive: true });
    await vector(input, join(dir, 'direct.mbtiles'), join(dir, 'scratch-direct'), directInfo, directOptions, {}, () => {});
    const directProps = await decodedProps(join(dir, 'direct.mbtiles'));
    assert.ok(directProps.length > 0);
    for (const props of directProps) {
      assert.equal(props.id, props.NIB.replace('X', 'lower-'));
      assert.equal(props.ID, props.NIB.replace('X', 'UPPER-'));
      assert.ok(!('id2' in props), `unexpected id2 in ${JSON.stringify(props)}`);
    }
    // GDAL path (CRS unprovable to the planner): rewrite + transparent restore.
    const ogrOptions = parseOptions({ minZoom: 14, maxZoom: 14, vectorEngine: 'tippecanoe' });
    const ogrInfo = await inspectSample(input, ogrOptions, true);
    await mkdir(join(dir, 'scratch-ogr'), { recursive: true });
    await vector(input, join(dir, 'ogr.mbtiles'), join(dir, 'scratch-ogr'), ogrInfo, ogrOptions, {}, () => {});
    const ogrProps = await decodedProps(join(dir, 'ogr.mbtiles'));
    assert.ok(ogrProps.length > 0);
    for (const props of ogrProps) {
      assert.ok('id' in props && !('id2' in props), `id must be restored, got ${JSON.stringify(props)}`);
    }
    // Attribute filtering by the exact lowercase name keeps real values.
    const filterOptions = parseOptions({ minZoom: 14, maxZoom: 14, vectorEngine: 'tippecanoe', includeProperties: ['id', 'NIB'] });
    await mkdir(join(dir, 'scratch-filtered'), { recursive: true });
    await vector(input, join(dir, 'filtered.mbtiles'), join(dir, 'scratch-filtered'), directInfo, filterOptions, {}, () => {});
    const filteredProps = await decodedProps(join(dir, 'filtered.mbtiles'));
    assert.ok(filteredProps.length > 0);
    for (const props of filteredProps) {
      assert.deepEqual(Object.keys(props).sort(), ['NIB', 'id']);
      assert.ok(String(props.id).startsWith('lower-'));
    }
  } finally { await rm(dir, { recursive: true, force: true }); }
});

async function inspectSample(input: string, options: ReturnType<typeof parseOptions>, stripEpsg = false) {
  const info = await inspect(input, options, {});
  assert.ok((info.fields ?? []).includes('id'), `sample must expose id, got ${JSON.stringify(info.fields)}`);
  if (stripEpsg) delete info.epsg;
  else assert.equal(info.epsg, 'EPSG:4326');
  return info;
}
