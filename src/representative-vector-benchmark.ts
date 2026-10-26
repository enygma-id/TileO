import { mkdtemp, rm, writeFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { inspect } from './inspect.js';
import { vector } from './vector.js';
import { parseOptions } from './types.js';
import { directoryBytes } from './resources.js';
import { validate } from './validate.js';

interface BenchmarkResult {
  fixtureName: string;
  featureCount: number;
  inputBytes: number;
  runs: {
    mode: 'off' | 'on';
    delivery: 'file' | 'stream';
    totalMs: number;
    peakScratchBytes: number;
    outputBytes: number;
    tileCount: number;
    minZoom: number;
    maxZoom: number;
    sampleTileBytes: number;
    layers: string[];
  }[];
  equivalent: boolean;
  notes: string[];
}

// Generate representative fixtures
function generateFeatures() {
  const features: any[] = [];

  // 1. LineStrings
  for (let i = 0; i < 50; i++) {
    const coords = Array.from({ length: 50 }, (_, j) => [
      106.8 + (j * 0.005) + (i * 0.001),
      -6.2 + Math.sin(j / 5) * 0.01 + (i * 0.001)
    ]);
    features.push({
      type: 'Feature',
      id: `line-${i}`,
      properties: { name: `River Route ${i}`, type: 'line', rank: i },
      geometry: { type: 'LineString', coordinates: coords }
    });
  }

  // 2. Polygons with holes (exterior + interior donut hole)
  for (let i = 0; i < 30; i++) {
    const cx = 106.9 + (i % 6) * 0.05;
    const cy = -6.2 - Math.floor(i / 6) * 0.05;
    const exterior = [
      [cx - 0.02, cy - 0.02],
      [cx + 0.02, cy - 0.02],
      [cx + 0.02, cy + 0.02],
      [cx - 0.02, cy + 0.02],
      [cx - 0.02, cy - 0.02]
    ];
    const hole = [
      [cx - 0.008, cy - 0.008],
      [cx + 0.008, cy - 0.008],
      [cx + 0.008, cy + 0.008],
      [cx - 0.008, cy + 0.008],
      [cx - 0.008, cy - 0.008]
    ];
    features.push({
      type: 'Feature',
      id: `poly-hole-${i}`,
      properties: { name: `Admin Zone ${i}`, hasHole: true, areaHa: 150 + i },
      geometry: { type: 'Polygon', coordinates: [exterior, hole] }
    });
  }

  // 3. Multi-geometry (MultiPolygon)
  for (let i = 0; i < 20; i++) {
    const cx = 107.2 + (i % 5) * 0.04;
    const cy = -6.1 - Math.floor(i / 5) * 0.04;
    const partA = [
      [[cx, cy], [cx + 0.01, cy], [cx + 0.01, cy + 0.01], [cx, cy + 0.01], [cx, cy]]
    ];
    const partB = [
      [[cx + 0.015, cy + 0.015], [cx + 0.025, cy + 0.015], [cx + 0.025, cy + 0.025], [cx + 0.015, cy + 0.025], [cx + 0.015, cy + 0.015]]
    ];
    features.push({
      type: 'Feature',
      id: `multi-${i}`,
      properties: { name: `Archipelago Group ${i}`, islands: 2 },
      geometry: { type: 'MultiPolygon', coordinates: [partA, partB] }
    });
  }

  // 4. Large complex feature near limit with dense vertices & attributes
  const denseCoords = Array.from({ length: 2000 }, (_, k) => [
    106.7 + Math.cos(k * 2 * Math.PI / 2000) * 0.08,
    -6.3 + Math.sin(k * 2 * Math.PI / 2000) * 0.08
  ]);
  denseCoords.push(denseCoords[0]!); // close loop
  features.push({
    type: 'Feature',
    id: 'complex-boundary-999',
    properties: {
      name: 'Grand Watershed National Boundary',
      description: 'x'.repeat(4096),
      vertexCount: 2000,
      code: 'WS-BIG-01',
      active: true
    },
    geometry: { type: 'Polygon', coordinates: [denseCoords] }
  });

  return features;
}

async function runBenchmark(): Promise<BenchmarkResult[]> {
  const rootDir = await mkdtemp(join(tmpdir(), 'tileo-repr-bench-'));
  const allResults: BenchmarkResult[] = [];

  try {
    const features = generateFeatures();
    const geojson = { type: 'FeatureCollection', name: 'representative_data', features };
    const inputFile = join(rootDir, 'representative.geojson');
    await writeFile(inputFile, JSON.stringify(geojson));
    const inputSize = (await stat(inputFile)).size;

    console.log(`[Representative Benchmark] Fixture created: ${features.length} features, ${(inputSize / 1024).toFixed(1)} KB`);

    const modes: Array<{ mode: 'off' | 'on'; delivery: 'file' | 'stream' }> = [
      { mode: 'off', delivery: 'file' },
      { mode: 'on', delivery: 'file' },
      { mode: 'on', delivery: 'stream' },
    ];

    const result: BenchmarkResult = {
      fixtureName: 'lines_polygons_holes_multipolygon_complex',
      featureCount: features.length,
      inputBytes: inputSize,
      runs: [],
      equivalent: true,
      notes: [],
    };

    const options = parseOptions({
      minZoom: 0,
      maxZoom: 6,
      vectorPreset: 'preserve',
      vectorEngine: 'tippecanoe',
    });

    for (const { mode, delivery } of modes) {
      const scratch = await mkdtemp(join(rootDir, `scratch-${mode}-${delivery}-`));
      const outputFile = join(scratch, 'out.mbtiles');
      const execution = {
        batchMode: mode,
        batchDelivery: delivery,
        timeoutMs: 120000,
        deadlineMs: Date.now() + 120000,
      } as const;

      let peakScratch = 0, sampleTimer: NodeJS.Timeout | undefined;
      const sample = async () => {
        try {
          const b = await directoryBytes(scratch);
          peakScratch = Math.max(peakScratch, b);
        } catch {}
      };
      sampleTimer = setInterval(sample, 50);

      const startTime = performance.now();
      try {
        const info = await inspect(inputFile, options, execution);
        await vector(inputFile, outputFile, scratch, info, options, execution, () => {});
        clearInterval(sampleTimer);
        await sample();

        const totalMs = Math.round(performance.now() - startTime);
        const outStat = await stat(outputFile);

        // Read SQLite MBTiles metadata and sample tile
        const db = new Database(outputFile, { readonly: true });
        const countRow = db.prepare('SELECT COUNT(*) as count FROM tiles').get() as { count: number };
        const minZRow = db.prepare('SELECT MIN(zoom_level) as minz, MAX(zoom_level) as maxz FROM tiles').get() as { minz: number; maxz: number };
        const sampleRow = db.prepare('SELECT tile_data FROM tiles LIMIT 1').get() as { tile_data: Buffer } | undefined;
        
        let metaJson: any = {};
        const metaRows = db.prepare('SELECT name, value FROM metadata').all() as Array<{ name: string; value: string }>;
        for (const r of metaRows) {
          if (r.name === 'json') {
            try { metaJson = JSON.parse(r.value); } catch {}
          }
        }
        const layers = (metaJson.vector_layers ?? []).map((l: any) => l.id);
        db.close();

        result.runs.push({
          mode,
          delivery,
          totalMs,
          peakScratchBytes: peakScratch,
          outputBytes: outStat.size,
          tileCount: countRow.count,
          minZoom: minZRow.minz,
          maxZoom: minZRow.maxz,
          sampleTileBytes: sampleRow ? sampleRow.tile_data.length : 0,
          layers,
        });

        console.log(`  Mode [${mode}/${delivery}]: ${totalMs}ms | Peak Scratch: ${(peakScratch / 1024).toFixed(1)} KB | Tiles: ${countRow.count} (z${minZRow.minz}-z${minZRow.maxz}) | Out: ${(outStat.size / 1024).toFixed(1)} KB`);
      } finally {
        if (sampleTimer) clearInterval(sampleTimer);
      }
    }

    // Check equivalence across modes
    const baseline = result.runs[0]!;
    for (let i = 1; i < result.runs.length; i++) {
      const r = result.runs[i]!;
      if (r.tileCount !== baseline.tileCount) {
        result.equivalent = false;
        result.notes.push(`Tile count mismatch: ${r.mode}/${r.delivery} had ${r.tileCount} vs baseline ${baseline.tileCount}`);
      }
      if (r.minZoom !== baseline.minZoom || r.maxZoom !== baseline.maxZoom) {
        result.equivalent = false;
        result.notes.push(`Zoom range mismatch: ${r.mode}/${r.delivery} had z${r.minZoom}-z${r.maxZoom} vs baseline z${baseline.minZoom}-z${baseline.maxZoom}`);
      }
    }

    allResults.push(result);
    return allResults;
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
}

runBenchmark().then(res => {
  console.log('\n[SUMMARY RESULT]');
  console.log(JSON.stringify(res, null, 2));
  process.exit(res.every(r => r.equivalent) ? 0 : 1);
}).catch(err => {
  console.error('[BENCHMARK ERROR]', err);
  process.exit(1);
});
