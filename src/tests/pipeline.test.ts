import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { run } from '../process.js';
import { inspect } from '../inspect.js';
import { raster } from '../raster.js';
import { vector } from '../vector.js';
import { validate } from '../validate.js';
import { JobError, parseOptions } from '../types.js';

const enabled = process.env.TILEO_INTEGRATION === '1';
test('real GDAL: embedded CRS, WebP tiles, invalid CRS and missing CRS', { skip: !enabled }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-gdal-'));
  try {
    const pgm = join(dir, 'source.pgm'), tif = join(dir, 'with spaces.tif'), output = join(dir, 'raster.mbtiles');
    await writeFile(pgm, Buffer.concat([Buffer.from('P5\n64 64\n255\n'), Buffer.alloc(4096, 128)]));
    await run('gdal_translate', ['-a_srs', 'EPSG:3857', '-a_ullr', '0', '10000', '10000', '0', pgm, tif]);
    const options = parseOptions({ minZoom: 0, maxZoom: 10 });
    const info = await inspect(tif, options, {}); assert.equal(info.kind, 'raster'); assert.equal(info.crs, 'EPSG:3857');
    await raster(tif, output, options, { timeoutMs: 60000 }, () => {});
    const result = validate(output, 'raster', options); assert.equal(result.format, 'webp'); assert.equal(result.maxZoom, 10);
    await assert.rejects(inspect(tif, { ...options, sourceCrs: 'EPSG:8611' }, {}), /not recognized/);
    await assert.rejects(inspect(pgm, options, {}), /no CRS/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('real GDAL and Tippecanoe: normalize and create vector tiles', { skip: !enabled || process.env.TILEO_RASTER_ONLY === '1' }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-vector-'));
  try {
    const input = join(dir, 'points.geojson'), output = join(dir, 'vector.mbtiles');
    await writeFile(input, JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: { name: 'Makassar' }, geometry: { type: 'Point', coordinates: [119.41, -5.15] } }] }));
    const options = parseOptions({ minZoom: 0, maxZoom: 4, vectorEngine: 'tippecanoe', vectorPreset: 'preserve' });
    const info = await inspect(input, options, {}); assert.equal(info.kind, 'vector');
    await vector(input, output, dir, info, options, {}, () => {});
    const result = validate(output, 'vector', options); assert.equal(result.format, 'pbf'); assert.equal(result.maxZoom, 4);
    const decoded = await run('tippecanoe-decode', [output, '0', '0', '0'], { capture: true });
    assert.match(decoded, /Makassar/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('real GDAL: normalization preserves sub-centimeter coordinates and string attributes', { skip: !enabled }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-vector-normalize-'));
  try {
    const input = join(dir, 'source.geojson'), projected = join(dir, 'projected.gpkg');
    const coordinates = [119.410123456789, -5.150123456789];
    const properties = { name: 'Makassar', label: '[123]', value: 1.23456789012345, active: true };
    await writeFile(input, JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties, geometry: { type: 'Point', coordinates: [...coordinates, 25] } }] }));
    await run('ogr2ogr', ['-f', 'GPKG', '-t_srs', 'EPSG:3857', projected, input]);
    const options = parseOptions({ minZoom: 16, maxZoom: 16, vectorEngine: 'gdal' });
    const info = await inspect(projected, options, {});
    await vector(projected, join(dir, 'tiles.mbtiles'), dir, info, options, {}, () => {});
    const feature = JSON.parse((await readFile(join(dir, 'features.geojsonl'), 'utf8')).trim());
    assert.equal(feature.geometry.coordinates.length, 2);
    // Normalization explicitly writes 9 decimal places (~0.11 mm), with a
    // small allowance for reprojection floating-point error.
    coordinates.forEach((coordinate, i) => assert.ok(Math.abs(feature.geometry.coordinates[i] - coordinate) <= 0.5e-9 + 1e-12));
    assert.deepEqual(feature.properties, properties);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('real Tippecanoe: fine vertices, polygon holes, attributes and engine failures', { skip: !enabled || process.env.TILEO_RASTER_ONLY === '1' }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-vector-precision-'));
  try {
    const input = join(dir, 'geometry.geojson');
    const x = 119.410123456789, y = -5.150123456789;
    const coordinates = [[x, y], [x + 0.000001, y + 0.0000003], [x + 0.000002, y], [x + 0.000003, y + 0.0000003]];
    const polygon = [[[x, y], [x + 0.00001, y], [x + 0.00001, y + 0.00001], [x, y + 0.00001], [x, y]], [[x + 0.000002, y + 0.000002], [x + 0.000002, y + 0.000008], [x + 0.000008, y + 0.000008], [x + 0.000008, y + 0.000002], [x + 0.000002, y + 0.000002]]];
    await writeFile(input, JSON.stringify({ type: 'FeatureCollection', features: [
      { type: 'Feature', id: 7, properties: { name: 'fine line', label: '[123]', value: 1.23456789012345 }, geometry: { type: 'LineString', coordinates } },
      { type: 'Feature', id: 8, properties: { name: 'parcel' }, geometry: { type: 'Polygon', coordinates: polygon } },
    ] }));
    const tileX = Math.floor((x + 180) / 360 * 2 ** 16);
    const tileY = Math.floor((1 - Math.asinh(Math.tan(y * Math.PI / 180)) / Math.PI) / 2 * 2 ** 16);
    for (const vectorPreset of ['preserve', 'density'] as const) {
      const output = join(dir, `${vectorPreset}.mbtiles`), scratch = join(dir, vectorPreset);
      await mkdir(scratch);
      const options = parseOptions({ minZoom: 16, maxZoom: 16, vectorPreset });
      const info = await inspect(input, options, {});
      await vector(input, output, scratch, info, options, {}, () => {});
      assert.equal(validate(output, 'vector', options).maxZoom, 16);
      const decoded = JSON.parse(await run('tippecanoe-decode', [output, '16', String(tileX), String(tileY)], { capture: true }));
      const features = decoded.features.flatMap((layer: any) => layer.features);
      const line = features.find((feature: any) => feature.properties.name === 'fine line');
      assert.equal(line.id, 7); assert.equal(line.properties.label, '[123]'); assert.equal(line.properties.value, 1.23456789012345);
      assert.equal(line.geometry.coordinates.length, coordinates.length);
      // Check the encoded tile grid directly: geographic JSON emitted by
      // installed tippecanoe-decode can round coordinates to six decimals.
      const integerTile = JSON.parse(await run('tippecanoe-decode', ['-I', output, '16', String(tileX), String(tileY)], { capture: true }));
      const integerLayer = integerTile.features[0];
      const integerLine = integerLayer.features.find((feature: any) => feature.properties.name === 'fine line');
      const extent = integerLayer.properties.extent;
      coordinates.forEach(([lon, lat], i) => {
        const expected = [((lon! + 180) / 360 * 2 ** 16 - tileX) * extent,
          ((1 - Math.asinh(Math.tan(lat! * Math.PI / 180)) / Math.PI) / 2 * 2 ** 16 - tileY) * extent];
        expected.forEach((value, axis) => assert.ok(Math.abs(integerLine.geometry.coordinates[i][axis] - value) <= 1));
      });
      const parcel = features.find((feature: any) => feature.properties.name === 'parcel');
      assert.equal(parcel.id, 8); assert.equal(parcel.geometry.coordinates.length, 2);
      // Existing output forces Tippecanoe to fail; Auto must not hide it with GDAL.
      await rm(join(scratch, 'features.geojsonl'));
      await assert.rejects(vector(input, output, scratch, info, options, {}, () => {}), (error: unknown) => error instanceof JobError && error.code === 'TOOL_FAILED' && error.message.startsWith('tippecanoe:'));
    }
  } finally { await rm(dir, { recursive: true, force: true }); }
});
