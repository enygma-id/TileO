import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspect } from '../inspect.js';
import { run } from '../process.js';
import { parseOptions } from '../types.js';
import { tippecanoeArgs, vector } from '../vector.js';
import { validate } from '../validate.js';

const enabled = process.env.TILEO_INTEGRATION === '1' && process.env.TILEO_RASTER_ONLY !== '1';

function distanceToBoundary(px: number, py: number, ring: number[][]): number {
  let distance = Infinity;
  for (let i = 1; i < ring.length; i++) {
    const [ax, ay] = ring[i - 1]!, [bx, by] = ring[i]!;
    const dx = bx! - ax!, dy = by! - ay!;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared ? Math.max(0, Math.min(1, ((px - ax!) * dx + (py - ay!) * dy) / lengthSquared)) : 0;
    distance = Math.min(distance, Math.hypot(px - ax! - t * dx, py - ay! - t * dy));
  }
  return distance;
}

test('Tippecanoe parallel reads are restricted to newline-delimited features', () => {
  const options = parseOptions({ vectorPreset: 'preserve' });
  for (const input of ['footprints.geojson', 'footprints.json', 'FOOTPRINTS.GEOJSON']) {
    assert.ok(!tippecanoeArgs('out.mbtiles', 'scratch', options, undefined, input).includes('-P'), input);
  }
  assert.ok(tippecanoeArgs('out.mbtiles', 'scratch', options, undefined, 'features.geojsonl').includes('-P'));
});

for (const delivery of ['legacy', 'file', 'stream'] as const) {
  test(`real footprints: all 37 buildings and attributes survive ${delivery} delivery`, { skip: !enabled }, async () => {
    const scratch = await mkdtemp(join(tmpdir(), 'tileo-footprints-'));
    try {
      // Keep the original formatted collection, including its root metadata:
      // -P previously split it inside nested JSON and silently lost buildings.
      const input = fileURLToPath(new URL('../../samples/TileO-Samples-01/data/footprints.geojson', import.meta.url));
      const source = JSON.parse(await readFile(input, 'utf8')) as {
        features: { properties: Record<string, unknown>; geometry: { coordinates: number[][][] } }[];
      };
      const options = parseOptions({ minZoom: 0, maxZoom: 16, vectorPreset: 'preserve', vectorEngine: 'tippecanoe' });
      const execution = { batchMode: delivery === 'legacy' ? 'off' as const : 'on' as const,
        batchDelivery: delivery === 'stream' ? 'stream' as const : 'file' as const, log: join(scratch, 'tools.log') };
      const info = await inspect(input, options, execution);
      assert.equal(info.featureCount, 37);
      const output = join(scratch, 'footprints.mbtiles');
      await vector(input, output, scratch, info, options, execution, () => {});
      assert.equal(validate(output, 'vector', options).tileFeatureCount, 37);
      const z = options.maxZoom, n = 2 ** z;
      const [lon, lat] = source.features[0]!.geometry.coordinates[0]![0]!;
      const x = Math.floor((lon! + 180) / 360 * n);
      const y = Math.floor((1 - Math.asinh(Math.tan(lat! * Math.PI / 180)) / Math.PI) / 2 * n);
      const decoded = JSON.parse(await run('tippecanoe-decode', ['-I', output, String(z), String(x), String(y)], { capture: true }));
      const layer = decoded.features[0];
      assert.equal(layer.features.length, 37);
      assert.equal(new Set(layer.features.map((f: any) => f.properties.id)).size, 37);
      for (const original of source.features) {
        const feature = layer.features.find((f: any) => f.properties.id === original.properties.id);
        assert.ok(feature, `Missing building ${original.properties.id}`);
        assert.deepEqual(feature.properties, original.properties);
        assert.equal(feature.geometry.type, 'Polygon');
        assert.equal(feature.geometry.coordinates.length, original.geometry.coordinates.length);
        for (const [ringIndex, ring] of original.geometry.coordinates.entries()) {
          const projected = ring.map(([sx, sy]) => [((sx! + 180) / 360 * n - x) * layer.properties.extent,
            ((1 - Math.asinh(Math.tan(sy! * Math.PI / 180)) / Math.PI) / 2 * n - y) * layer.properties.extent]);
          const actual = feature.geometry.coordinates[ringIndex] as number[][];
          // Tile quantization may remove collinear vertices. Compare both
          // boundaries within one grid unit per axis instead of vertex counts.
          for (const [px, py] of projected) assert.ok(distanceToBoundary(px!, py!, actual) <= Math.SQRT2,
            `Changed source boundary in building ${original.properties.id}`);
          for (const [px, py] of actual) assert.ok(distanceToBoundary(px!, py!, projected) <= Math.SQRT2,
            `Changed output boundary in building ${original.properties.id}`);
        }
      }
      assert.doesNotMatch(await readFile(execution.log, 'utf8'), /Found .* at top level|Reached EOF without all containers/);
    } finally { await rm(scratch, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 }); }
  });
}
