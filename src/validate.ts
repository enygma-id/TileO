import Database from 'better-sqlite3';
import { gunzipSync } from 'node:zlib';
import { JobError, type Options } from './types.js';
export function validate(path: string, kind: 'raster' | 'vector', options: Options) {
  const db = new Database(path, { readonly: true, fileMustExist: true });
  try {
    if (db.pragma('integrity_check', { simple: true }) !== 'ok') throw new JobError('INVALID_OUTPUT', 'MBTiles integrity check failed.');
    const metadata = Object.fromEntries((db.prepare('SELECT name,value FROM metadata').all() as { name: string; value: string }[]).map(r => [r.name, r.value]));
    const counts = db.prepare('SELECT min(zoom_level) AS minZoom,max(zoom_level) AS maxZoom,count(*) AS tileCount FROM tiles').get() as { minZoom: number; maxZoom: number; tileCount: number };
    if (!counts.tileCount) throw new JobError('INVALID_OUTPUT', 'MBTiles contains no tiles.');
    // Tile-size stats use a streaming aggregate (no full-table fetch) so 300 MB
    // outputs do not OOM the worker. Surfaces the "berat vs hilang" tradeoff.
    const sizes = db.prepare('SELECT max(length(tile_data)) AS maxBytes, avg(length(tile_data)) AS avgBytes, sum(length(tile_data)) AS totalBytes FROM tiles').get() as { maxBytes: number; avgBytes: number; totalBytes: number };
    if (counts.minZoom !== options.minZoom || counts.maxZoom !== options.maxZoom) {
      // Ultra-dense vector data (e.g. hundreds of thousands of parcels) can lose
      // extreme low zooms entirely: even the sparsest kept fraction would overflow
      // a world-view tile, so Tippecanoe writes nothing there. Accept the usable
      // range instead of discarding a successfully built artifact. Raster output
      // always covers the full requested range, so a mismatch there is a real bug.
      if (kind !== 'vector' || counts.minZoom < options.minZoom || counts.maxZoom !== options.maxZoom) throw new JobError('INVALID_OUTPUT', `MBTiles has ${counts.tileCount} tiles at zoom ${counts.minZoom}–${counts.maxZoom} but zoom ${options.minZoom}–${options.maxZoom} was requested.`);
    }
    const tile = db.prepare('SELECT tile_data AS data FROM tiles LIMIT 1').get() as { data: Buffer };
    const format = metadata.format;
    if (kind === 'vector') {
      if (format !== 'pbf' || !JSON.parse(metadata.json ?? '{}').vector_layers?.length) throw new JobError('INVALID_OUTPUT', 'Missing vector layer metadata.');
      if (tile.data[0] === 0x1f && tile.data[1] === 0x8b && !gunzipSync(tile.data, { maxOutputLength: 16 * 1024 ** 2 }).length) throw new JobError('INVALID_OUTPUT', 'Empty vector tile.');
    } else {
      const valid = format === 'webp' ? tile.data.toString('ascii', 8, 12) === 'WEBP' : format === 'png' ? tile.data.subarray(1, 4).toString() === 'PNG' : ['jpg', 'jpeg'].includes(format ?? '') && tile.data[0] === 0xff && tile.data[1] === 0xd8;
      if (!valid) throw new JobError('INVALID_OUTPUT', 'Tile payload does not match the raster format.');
    }
    return { ...counts, format, bounds: metadata.bounds?.split(',').map(Number), vectorLayers: kind === 'vector' ? JSON.parse(metadata.json ?? '{}').vector_layers : [], kind, maxTileBytes: Math.round(sizes.maxBytes ?? 0), avgTileBytes: Math.round(sizes.avgBytes ?? 0), totalTileBytes: Math.round(sizes.totalBytes ?? 0), tileFeatureCount: kind === 'vector' ? (JSON.parse(metadata.json ?? '{}').tilestats?.layers?.[0]?.count ?? null) : null };
  } finally { db.close(); }
}
