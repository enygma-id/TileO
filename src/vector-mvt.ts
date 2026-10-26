// Permissive vector tiling fallback.
//
// GDAL's MBTiles writer needs GEOS for vector output. GEOS is copyleft, so the
// shipped image cannot enable it. This module keeps the documented `gdal`
// vector engine working by normalizing with GDAL and writing MVT tiles itself
// with permissive libraries (geojson-vt ISC, vt-pbf MIT, pbf BSD-3). It is a
// density-only fallback: preserve mode still requires Tippecanoe, which is
// enforced by vector().
import { createReadStream } from 'node:fs';
import { rm } from 'node:fs/promises';
import { basename } from 'node:path';
import { createInterface } from 'node:readline';
import { gzipSync } from 'node:zlib';
import Database from 'better-sqlite3';
import GeoJSONVT from 'geojson-vt';
import { fromGeojsonVt } from 'vt-pbf';
import { JobError, type Options } from './types.js';
import type { RunOptions } from './process.js';

// The fallback builds an in-memory index. Above this input size Tippecanoe is
// the only safe engine; failing closed is better than an OOM kill mid-job.
export const MVT_MAX_INPUT_BYTES = 256 * 1024 * 1024;
const EXTENT = 4096;
const BUFFER = 64;

interface MvtFeature {
  type: 'Feature';
  id?: number | string;
  properties?: Record<string, unknown> | null;
  geometry: { type: string; coordinates: unknown } | null;
}

interface ReadResult {
  features: MvtFeature[];
  skipped: number;
  droppedIds: number;
}

export interface MvtPlan {
  maxTileBytes: number;
  maxTileFeatures: number;
  geometry: 'point' | 'line' | 'polygon';
}

export interface MvtWriteStats {
  featureCount: number;
  tileCount: number;
  skippedFeatures: number;
  droppedFeatureIds: number;
  thinnedTiles: number;
  oversizedTiles: number;
}

function toBbox(coordinates: unknown, bbox: [number, number, number, number]): void {
  if (Array.isArray(coordinates) && typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
    const lon = coordinates[0], lat = coordinates[1];
    if (Number.isFinite(lon) && Number.isFinite(lat)) {
      bbox[0] = Math.min(bbox[0], lon); bbox[1] = Math.min(bbox[1], lat);
      bbox[2] = Math.max(bbox[2], lon); bbox[3] = Math.max(bbox[3], lat);
    }
    return;
  }
  if (Array.isArray(coordinates)) for (const part of coordinates) toBbox(part, bbox);
}

// MVT ids are unsigned 64-bit integers. geojson-vt keeps source ids as-is, but
// vt-pbf only serializes numeric ids. Promote integer strings that survive
// Number.isSafeInteger so parcel IDs are not silently lost; other strings stay
// as properties and are reported by the caller.
function normalizeIds(features: MvtFeature[]): number {
  let dropped = 0;
  for (const feature of features) {
    if (feature.id === undefined) continue;
    if (typeof feature.id === 'string') {
      const parsed = Number(feature.id);
      if (feature.id.trim() !== '' && Number.isSafeInteger(parsed)) feature.id = parsed;
      else { delete feature.id; dropped++; }
    } else if (typeof feature.id === 'number' && !Number.isSafeInteger(feature.id)) {
      delete feature.id; dropped++;
    }
  }
  return dropped;
}

async function readFeatures(path: string): Promise<ReadResult> {
  const features: MvtFeature[] = [];
  let bytes = 0, lineNumber = 0, skipped = 0;
  const input = createReadStream(path);
  try {
    const lines = createInterface({ input, crlfDelay: Infinity });
    for await (const line of lines) {
      lineNumber++;
      bytes += Buffer.byteLength(line);
      if (bytes > MVT_MAX_INPUT_BYTES) {
        throw new JobError('RESOURCE_LIMIT', `Vector fallback input exceeds ${Math.round(MVT_MAX_INPUT_BYTES / 1024 / 1024)} MiB. Use the Tippecanoe engine for this dataset.`);
      }
      if (!line.trim()) continue;
      let feature: MvtFeature;
      try { feature = JSON.parse(line) as MvtFeature; }
      catch { throw new JobError('INVALID_OUTPUT', `Normalized GeoJSON line ${lineNumber} is not valid JSON.`); }
      if (feature?.type !== 'Feature' || !feature.geometry) { skipped++; continue; }
      if (!feature.properties || typeof feature.properties !== 'object') feature.properties = {};
      features.push(feature);
    }
  } finally {
    input.destroy();
  }
  if (!features.length) throw new JobError('INVALID_OUTPUT', 'Normalized vector input contains no features with geometry.');
  return { features, skipped, droppedIds: normalizeIds(features) };
}

function inferredFields(features: MvtFeature[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const feature of features) {
    for (const [key, value] of Object.entries(feature.properties ?? {})) {
      if (value === null || value === undefined) continue;
      const type = typeof value === 'number' ? 'Number' : typeof value === 'boolean' ? 'Boolean' : 'String';
      // A column carrying both numbers and strings is advertised as String:
      // consumers must not assume numeric typing for a mixed column.
      if (!fields[key]) fields[key] = type;
      else if (fields[key] !== type) fields[key] = 'String';
    }
  }
  return fields;
}

function tileRange(bounds: [number, number, number, number], zoom: number) {
  const n = 2 ** zoom;
  const clamp = (value: number) => Math.max(0, Math.min(n - 1, value));
  const latToY = (lat: number) => {
    const clamped = Math.max(-85.0511287798066, Math.min(85.0511287798066, lat));
    return (1 - Math.asinh(Math.tan(clamped * Math.PI / 180)) / Math.PI) / 2;
  };
  return {
    x0: clamp(Math.floor((bounds[0] + 180) / 360 * n)),
    x1: clamp(Math.floor((bounds[2] + 180) / 360 * n)),
    y0: clamp(Math.floor(latToY(bounds[3]) * n)),
    y1: clamp(Math.floor(latToY(bounds[1]) * n)),
  };
}

function sample<T>(items: readonly T[], count: number): T[] {
  if (count >= items.length) return [...items];
  if (count <= 0) return [];
  const out: T[] = [];
  for (let i = 0; i < count; i++) out.push(items[Math.floor(i * items.length / count)]!);
  return out;
}

function encode(features: readonly unknown[]): Buffer {
  return Buffer.from(fromGeojsonVt({ features: { features } } as never, { version: 2, extent: EXTENT }));
}

export async function writeVectorMbtiles(
  input: string,
  output: string,
  options: Options,
  plan: MvtPlan,
  execution: RunOptions,
  progress: (stage: string, percent: number) => void,
): Promise<MvtWriteStats> {
  const started = Date.now();
  progress('Vector: reading normalized features for permissive MVT writer', 45);
  const read = await readFeatures(input);
  const features = read.features;
  const featureCount = features.length;
  const bbox: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const feature of features) if (feature.geometry) toBbox(feature.geometry.coordinates, bbox);
  if (!Number.isFinite(bbox[0])) throw new JobError('INVALID_OUTPUT', 'Normalized vector input has no finite coordinates.');
  const bounds: [number, number, number, number] = [
    Math.max(-180, Math.min(180, bbox[0])),
    Math.max(-85.0511287798066, Math.min(85.0511287798066, bbox[1])),
    Math.max(-180, Math.min(180, bbox[2])),
    Math.max(-85.0511287798066, Math.min(85.0511287798066, bbox[3])),
  ];
  const fields = inferredFields(features);

  const index = new GeoJSONVT({ type: 'FeatureCollection', features } as never, {
    maxZoom: options.maxZoom,
    indexMaxZoom: options.maxZoom,
    indexMaxPoints: 0,
    tolerance: 1,
    extent: EXTENT,
    buffer: BUFFER,
    lineMetrics: false,
  });
  // The index owns its converted geometry; release the parsed source so the
  // peak stays bounded by one copy during tile generation.
  features.length = 0;

  const db = new Database(output);
  let tileCount = 0, thinnedTiles = 0, oversizedTiles = 0;
  let closed = false;
  const close = () => { if (!closed) { db.close(); closed = true; } };
  try {
    db.exec('PRAGMA journal_mode = MEMORY; PRAGMA synchronous = OFF; CREATE TABLE metadata (name TEXT PRIMARY KEY, value TEXT); CREATE TABLE tiles (zoom_level INTEGER, tile_column INTEGER, tile_row INTEGER, tile_data BLOB, PRIMARY KEY (zoom_level, tile_column, tile_row));');
    const insert = db.prepare('INSERT OR REPLACE INTO tiles (zoom_level, tile_column, tile_row, tile_data) VALUES (?, ?, ?, ?)');
    db.exec('BEGIN');

    const visit = async (z: number, x: number, y: number): Promise<void> => {
      execution.signal?.throwIfAborted();
      const tile = index.getTile(z, x, y);
      if (!tile || tile.features.length === 0) return;
      let selected = tile.features;
      if (selected.length > plan.maxTileFeatures) {
        selected = sample(selected, plan.maxTileFeatures);
        thinnedTiles++;
      }
      let payload: Uint8Array = gzipSync(encode(selected), { level: 9 });
      if (payload.length > plan.maxTileBytes) {
        // Binary-search the largest evenly sampled feature subset that fits the
        // byte budget. Sampling instead of truncation keeps spatial coverage.
        let low = 1, high = selected.length - 1;
        let best: { features: typeof selected; payload: Uint8Array } | null = null;
        while (low <= high) {
          const mid = (low + high) >> 1;
          const candidate = sample(selected, mid);
          const candidatePayload = gzipSync(encode(candidate), { level: 9 });
          if (candidatePayload.length <= plan.maxTileBytes) { best = { features: candidate, payload: candidatePayload }; low = mid + 1; }
          else high = mid - 1;
        }
        if (best) { selected = best.features; payload = best.payload; }
        else {
          // A single feature may exceed the cap (same last-resort behaviour as
          // Tippecanoe); keep exactly one and count it as oversized.
          selected = sample(selected, 1);
          payload = gzipSync(encode(selected), { level: 9 });
          oversizedTiles++;
        }
        thinnedTiles++;
      }
      insert.run(z, x, (1 << z) - 1 - y, payload);
      tileCount++;
      if (z >= options.maxZoom) return;
      for (let dy = 0; dy <= 1; dy++) for (let dx = 0; dx <= 1; dx++) await visit(z + 1, x * 2 + dx, y * 2 + dy);
    };

    const range = tileRange(bounds, options.minZoom);
    for (let x = range.x0; x <= range.x1; x++) for (let y = range.y0; y <= range.y1; y++) await visit(options.minZoom, x, y);
    if (tileCount === 0) throw new JobError('INVALID_OUTPUT', 'Vector fallback produced no tiles.');
    const center = `${((bounds[0] + bounds[2]) / 2).toFixed(6)},${((bounds[1] + bounds[3]) / 2).toFixed(6)},${options.minZoom}`;
    const metadata: [string, string][] = [
      ['name', basename(output).replace(/\.[^.]+$/, '')],
      ['format', 'pbf'],
      ['type', 'overlay'],
      ['version', '2'],
      ['minzoom', String(options.minZoom)],
      ['maxzoom', String(options.maxZoom)],
      ['bounds', bounds.map(value => value.toFixed(6)).join(',')],
      ['center', center],
      ['json', JSON.stringify({
        vector_layers: [{ id: 'features', description: '', minzoom: options.minZoom, maxzoom: options.maxZoom, fields }],
        tilestats: { layerCount: 1, layers: [{ layer: 'features', count: featureCount, geometry: plan.geometry === 'point' ? 'Point' : plan.geometry === 'line' ? 'LineString' : 'Polygon', attributeCount: Object.keys(fields).length, fields: Object.entries(fields).map(([name, type]) => ({ name, type })) }] },
      })],
    ];
    const meta = db.prepare('INSERT OR REPLACE INTO metadata (name, value) VALUES (?, ?)');
    for (const [name, value] of metadata) meta.run(name, value);
    db.exec('COMMIT');
    progress(`Vector: wrote ${tileCount.toLocaleString()} MVT tiles`, 85);
    return { featureCount, tileCount, skippedFeatures: read.skipped, droppedFeatureIds: read.droppedIds, thinnedTiles, oversizedTiles };
  } catch (error) {
    try { db.exec('ROLLBACK'); } catch { /* transaction may not have started */ }
    close();
    await rm(output, { force: true, maxRetries: 5, retryDelay: 50 });
    throw error;
  } finally {
    close();
  }
}
