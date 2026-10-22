import { createReadStream } from 'node:fs';
import { basename, extname } from 'node:path';
import { config } from './config.js';
import { collectionFeatures, sequenceFeatures } from './json-stream.js';
import { JobError, type Options } from './types.js';
import proj4 from 'proj4';

export interface VectorPreflightResult {
  featureCount: number; fields: string[]; geometryType?: string;
  bounds?: [number, number, number, number]; crs: string | null; epsg: string | null;
  layerName: string; hasId: boolean; hasId2: boolean;
}
export interface VectorBatch { batchIndex: number; features: string[]; byteSize: number }
interface ScanOptions { maxFeatureBytes?: number; signal?: AbortSignal; onRootMeta?: (meta: { name?: string; crs?: unknown }) => void }
export function scanGeoJsonFeatures(path: string, options: ScanOptions = {}) {
  return collectionFeatures(path, options.maxFeatureBytes ?? config.vectorMaxFeatureMb * 1024 ** 2, options.signal, options.onRootMeta);
}
export function scanGeoJsonlFeatures(path: string, options: ScanOptions = {}) {
  return sequenceFeatures(createReadStream(path, { signal: options.signal }), options.maxFeatureBytes ?? config.vectorMaxFeatureMb * 1024 ** 2, options.signal);
}
export function scanVectorFeatures(path: string, options: ScanOptions = {}) {
  return extname(path).toLowerCase() === '.geojsonl' ? scanGeoJsonlFeatures(path, options) : scanGeoJsonFeatures(path, options);
}
export function updateBounds(coords: unknown, bounds: [number, number, number, number]): boolean {
  if (!Array.isArray(coords) || coords.length === 0) return false;
  if (typeof coords[0] === 'number') {
    const [x, y] = coords;
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new JobError('INVALID_INPUT', 'Geometry coordinates must be finite.');
    bounds[0] = Math.min(bounds[0], x); bounds[1] = Math.min(bounds[1], y);
    bounds[2] = Math.max(bounds[2], x); bounds[3] = Math.max(bounds[3], y);
    return true;
  }
  let found = false;
  for (const item of coords) found = updateBounds(item, bounds) || found;
  return found;
}
function crsName(crs: any): string | null {
  const name = String(crs?.properties?.name ?? '');
  if (/^(?:urn:ogc:def:crs:OGC:1\.3:CRS84|OGC:CRS84|CRS84)$/i.test(name)) return 'EPSG:4326';
  const match = name.match(/^(?:EPSG:|urn:ogc:def:crs:EPSG::)(\d{4,7})$/i);
  return match ? `EPSG:${match[1]}` : null;
}
export async function preflightGeoJson(path: string, options: Options, signal?: AbortSignal): Promise<VectorPreflightResult> {
  const fields = new Set<string>(), geometries = new Set<string>();
  const bounds: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
  let featureCount = 0, rootName: string | undefined, rootCrs: unknown, crsDeclared = false;
  let hasId = false, hasId2 = false, schemaBytes = 0;
  const visit = (geometry: any) => {
    if (!geometry) return;
    if (geometry.type === 'GeometryCollection') { for (const item of geometry.geometries ?? []) visit(item); }
    else { geometries.add(geometry.type); updateBounds(geometry.coordinates, bounds); }
  };
  for await (const { raw } of scanVectorFeatures(path, { signal, onRootMeta(meta) {
    if (meta.name !== undefined) rootName = meta.name;
    if ('crs' in meta) { rootCrs = meta.crs; crsDeclared = true; }
  } })) {
    const feature = JSON.parse(raw);
    featureCount++;
    for (const key of Object.keys(feature.properties ?? {})) {
      if (!fields.has(key)) { fields.add(key); schemaBytes += Buffer.byteLength(key) + 8; }
      if (schemaBytes > 1024 ** 2) throw new JobError('METADATA_LIMIT', 'Vector schema exceeds 1 MiB.');
      if (key === 'id') hasId = true;
      if (key === 'id2') hasId2 = true;
    }
    visit(feature.geometry);
  }
  if (!featureCount) throw new JobError('EMPTY_DATASET', 'The selected layer contains no features.');
  // GeoJSON without legacy CRS uses its format-defined WGS84 semantics. An
  // explicit but unsupported CRS must never be reinterpreted from its bbox.
  const crs = options.sourceCrs ?? (crsDeclared ? crsName(rootCrs) : 'EPSG:4326');
  let wgsBounds: VectorPreflightResult['bounds'];
  if (bounds.every(Number.isFinite) && crs) {
    if (crs === 'EPSG:4326') wgsBounds = bounds;
    else {
      try {
        const convert = proj4(crs, 'EPSG:4326');
        const points: number[][] = [];
        // Densify edges; transforming four corners alone can underestimate
        // projected extents. If PROJ definition is unavailable, leave unknown.
        for (let i = 0; i <= 32; i++) {
          const x = bounds[0] + (bounds[2] - bounds[0]) * i / 32;
          const y = bounds[1] + (bounds[3] - bounds[1]) * i / 32;
          for (const p of [[x, bounds[1]], [x, bounds[3]], [bounds[0], y], [bounds[2], y]]) points.push(convert.forward(p));
        }
        const b: [number, number, number, number] = [Math.min(...points.map(p => p[0]!)), Math.min(...points.map(p => p[1]!)), Math.max(...points.map(p => p[0]!)), Math.max(...points.map(p => p[1]!))];
        if (b.every(Number.isFinite) && b[0] >= -180 && b[2] <= 180 && b[1] >= -90 && b[3] <= 90) wgsBounds = b;
      } catch { /* Native PROJ in ogr2ogr validates reprojection later. */ }
    }
  }
  if (wgsBounds && (wgsBounds[0] < -180 || wgsBounds[2] > 180 || wgsBounds[1] < -90 || wgsBounds[3] > 90)) {
    throw new JobError('INVALID_CRS', 'WGS84 coordinates exceed longitude/latitude ranges. Provide the correct source CRS.');
  }
  return { featureCount, fields: [...fields], geometryType: geometries.size === 1 ? [...geometries][0] : 'Unknown',
    bounds: wgsBounds, crs, epsg: crs, layerName: rootName || basename(path, extname(path)) || 'features', hasId, hasId2 };
}
export async function* readGeoJsonBatches(path: string, options: {
  batchFeatures: number; batchBytes: number; maxFeatureBytes: number; signal?: AbortSignal;
}): AsyncGenerator<VectorBatch> {
  let features: string[] = [], byteSize = 0, batchIndex = 0;
  for await (const { raw } of scanVectorFeatures(path, options)) {
    const bytes = Buffer.byteLength(raw);
    if (bytes > options.batchBytes) throw new JobError('FEATURE_TOO_LARGE', 'FEATURE_TOO_LARGE: Feature exceeds batch byte budget.');
    if (features.length && (features.length >= options.batchFeatures || byteSize + bytes > options.batchBytes)) {
      yield { batchIndex: batchIndex++, features, byteSize }; features = []; byteSize = 0;
    }
    features.push(raw); byteSize += bytes;
  }
  if (features.length) yield { batchIndex, features, byteSize };
}
