import { mkdir, open, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { crc32, deflateSync, inflateSync } from 'node:zlib';
import Database from 'better-sqlite3';
import { config, toolEnvironment } from './config.js';
import { run, type RunOptions } from './process.js';
import { checkDisk } from './resources.js';
import { inspect, type Inspection } from './inspect.js';
import { exportPmtiles } from './pmtiles.js';
import { validate } from './validate.js';
import { JobError, type Options } from './types.js';

const world = 20037508.342789244, tileSize = 256;
export function terrainGrid(bounds: number[], zoom: number) {
  const n = 2 ** zoom;
  const x = (lon: number) => (lon + 180) / 360 * n;
  const y = (lat: number) => (1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * n;
  if (bounds.length !== 4 || !bounds.every(Number.isFinite) || bounds[0]! >= bounds[2]! || bounds[1]! >= bounds[3]! || bounds[0]! < -180 || bounds[2]! > 180 || bounds[1]! < -85.05112878 || bounds[3]! > 85.05112878 || bounds[2]! - bounds[0]! > 180) throw new JobError('UNSUPPORTED_EXTENT', 'Terrain requires a non-wrapping extent inside Web Mercator latitude limits. COG can preserve other extents.');
  const x0 = Math.max(0, Math.floor(x(bounds[0]!))), x1 = Math.min(n - 1, Math.ceil(x(bounds[2]!)) - 1);
  const y0 = Math.max(0, Math.floor(y(bounds[3]!))), y1 = Math.min(n - 1, Math.ceil(y(bounds[1]!)) - 1);
  return { x0, x1, y0, y1, count: (x1 - x0 + 1) * (y1 - y0 + 1), span: 2 * world / n };
}

export function encodeHeight(height: number, encoding: 'mapbox' | 'terrarium' = 'mapbox') {
  if (encoding === 'terrarium') {
    if (!Number.isFinite(height) || height < -32768 || height > 32767.99609375) throw new JobError('ELEVATION_RANGE', 'Elevation is outside the Terrarium range (-32768 to 32767.99609375 m). Use COG to preserve these values.');
    return Math.round((height + 32768) * 256);
  }
  if (!Number.isFinite(height) || height < -10000 || height > 1667721.5) throw new JobError('ELEVATION_RANGE', 'Elevation is outside the Terrain-RGB encoding range. Use COG to preserve these values.');
  return Math.round((height + 10000) * 10);
}
// PNG is lossless; no imagery compression or color transforms may touch these bytes.
export function terrainPng(heights: Float64Array, encoding: 'mapbox' | 'terrarium' = 'mapbox'): Buffer {
  if (heights.length !== tileSize * tileSize) throw new JobError('INVALID_TILE', 'Unexpected elevation tile size.');
  const rows = Buffer.alloc(tileSize * (1 + tileSize * 3));
  for (let y = 0; y < tileSize; y++) for (let x = 0; x < tileSize; x++) {
    const encoded = encodeHeight(heights[y * tileSize + x]!, encoding);
    const p = y * (1 + tileSize * 3) + 1 + x * 3;
    rows[p] = encoded >>> 16; rows[p + 1] = encoded >>> 8; rows[p + 2] = encoded & 255;
  }
  const chunk = (type: string, data: Buffer) => {
    const result = Buffer.alloc(data.length + 12); result.writeUInt32BE(data.length);
    result.write(type, 4, 'ascii'); data.copy(result, 8);
    result.writeUInt32BE(crc32(result.subarray(4, -4)), result.length - 4); return result;
  };
  const header = Buffer.alloc(13); header.writeUInt32BE(tileSize); header.writeUInt32BE(tileSize, 4); header[8] = 8; header[9] = 2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}

async function exactRasterHash(path: string, raw: string, execution: RunOptions) {
  await run('gdal_translate', ['-of', 'ENVI', '-co', 'INTERLEAVE=BSQ', path, raw], execution);
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(raw)) hash.update(chunk);
  await rm(raw, { force: true }); await rm(raw.replace(/\.bin$/, '.hdr'), { force: true });
  return hash.digest('hex');
}

function validateTerrainPng(png: Buffer) {
  if (!png.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new JobError('INVALID_TERRAIN', 'Terrain tile has an invalid PNG signature.');
  const idat: Buffer[] = []; let width = 0, height = 0;
  for (let p = 8; p < png.length;) {
    if (p + 12 > png.length) throw new JobError('INVALID_TERRAIN', 'Terrain PNG is truncated.');
    const size = png.readUInt32BE(p), end = p + 12 + size;
    if (end > png.length) throw new JobError('INVALID_TERRAIN', 'Terrain PNG chunk is truncated.');
    const type = png.subarray(p + 4, p + 8).toString();
    if (crc32(png.subarray(p + 4, p + 8 + size)) !== png.readUInt32BE(p + 8 + size)) throw new JobError('INVALID_TERRAIN', 'Terrain PNG checksum failed.');
    if (type === 'IHDR') { width = png.readUInt32BE(p + 8); height = png.readUInt32BE(p + 12); }
    if (type === 'IDAT') idat.push(png.subarray(p + 8, p + 8 + size));
    p = end;
  }
  if (width !== tileSize || height !== tileSize || !idat.length) throw new JobError('INVALID_TERRAIN', 'Terrain PNG must be a 256 × 256 RGB image.');
  const rows = inflateSync(Buffer.concat(idat));
  if (rows.length !== tileSize * (1 + tileSize * 3)) throw new JobError('INVALID_TERRAIN', 'Terrain PNG pixel buffer has an invalid size.');
  for (let y = 0; y < tileSize; y++) if (rows[y * (1 + tileSize * 3)] !== 0) throw new JobError('INVALID_TERRAIN', 'Terrain PNG uses an unexpected row filter.');
}

export async function buildElevation(input: string, output: string, options: Options, execution: RunOptions, progress: (stage: string, percent: number) => void) {
  const info = await inspect(input, options, execution);
  if (options.pipeline !== 'elevation' || !info.elevationCandidate) throw new JobError('UNSUPPORTED_ELEVATION', 'Select the elevation pipeline for a single-band GeoTIFF.');
  let grids: ReturnType<typeof terrainGrid>[] = [];
  if (options.elevationOutput !== 'cog') {
    if (info.unit) {
      const declared = /^(m|metre|meter|metres|meters)$/i.test(info.unit) ? 'm' : /^(ft|foot|feet|international foot|international feet)$/i.test(info.unit) ? 'ft' : undefined;
      if (!declared || declared !== options.elevationUnit) throw new JobError('ELEVATION_UNIT_CONFLICT', `Source band units (${info.unit}) do not match supported terrain units. Correct the source metadata or units before generating terrain.`);
    }
    if (info.inferredHeightReference && info.inferredHeightReference !== options.heightReference) throw new JobError('HEIGHT_REFERENCE_CONFLICT', `Source vertical metadata indicates ${info.inferredHeightReference} heights, but ${options.heightReference} was selected.`);
    if (options.sourceCrs) throw new JobError('TERRAIN_CRS_OVERRIDE', 'Prepare a GeoTIFF with its correct embedded CRS before terrain generation. COG supports CRS assignment.');
    if (!info.bounds || info.nativeZoom === undefined) throw new JobError('MISSING_EXTENT', 'Could not determine terrain coverage and resolution from the embedded CRS.');
    if (options.maxZoom > info.nativeZoom) throw new JobError('EXCESSIVE_ZOOM', `Maximum terrain zoom ${options.maxZoom} exceeds source resolution (recommended ${info.nativeZoom}).`);
    grids = Array.from({ length: options.maxZoom - options.minZoom + 1 }, (_, i) => terrainGrid(info.bounds!, options.minZoom + i));
    if (grids.reduce((sum, grid) => sum + grid.count, 0) > config.maxTiles) throw new JobError('TILE_LIMIT', 'Terrain tile count exceeds the configured limit. Reduce zoom or coverage.');
  }
  // Conservative preflight includes the source, COG and GDAL temporary overviews.
  const cogBudget = info.width! * info.height! * 16;
  const terrainBudget = grids.length ? (Math.max(...grids.map(g => g.count)) * 8 + grids.reduce((sum, g) => sum + g.count, 0) * 4) * tileSize ** 2 : 0;
  if (cogBudget + terrainBudget > config.scratchBytes) throw new JobError('SCRATCH_LIMIT', 'Estimated elevation scratch space exceeds the configured budget. Reduce terrain zoom or use a smaller input.');
  await checkDisk(cogBudget + terrainBudget);
  const source = JSON.parse(await run('gdalinfo', ['-json', '-checksum', '-stats', input], { ...execution, capture: true }));
  if (Number(source.bands[0].metadata?.['']?.STATISTICS_VALID_PERCENT) === 0) throw new JobError('EMPTY_ELEVATION', 'The elevation raster has no valid pixels.');
  if (options.elevationOutput !== 'cog') {
    const stats = source.bands[0].metadata?.[''] ?? {}, raw = [Number(stats.STATISTICS_MINIMUM), Number(stats.STATISTICS_MAXIMUM)];
    if (!raw.every(Number.isFinite)) throw new JobError('ELEVATION_STATS', 'Could not determine the valid elevation range before terrain encoding.');
    const factor = options.elevationUnit === 'ft' ? 0.3048 : 1, scale = info.scale ?? 1, offset = info.offset ?? 0;
    const range = raw.map(value => (value * scale + offset) * factor).sort((a, b) => a - b);
    encodeHeight(range[0]!, options.elevationOutput === 'terrarium' ? 'terrarium' : 'mapbox'); encodeHeight(range[1]!, options.elevationOutput === 'terrarium' ? 'terrarium' : 'mapbox');
  }
  await mkdir(output, { recursive: true });
  const environment = { ...(execution.env ?? toolEnvironment()), CPL_TMPDIR: output };
  const work = { ...execution, env: environment };
  progress('Elevation: creating lossless COG', 10);
  const cog = join(output, 'elevation.tif');
  const args = ['-of', 'COG', '-co', 'COMPRESS=DEFLATE', '-co', 'PREDICTOR=YES', '-co', 'BLOCKSIZE=512', '-co', 'BIGTIFF=IF_SAFER', '-co', 'RESAMPLING=AVERAGE', '-mo', `TILEO_ELEVATION_KIND=${options.elevationKind}`, '-mo', `TILEO_DECLARED_UNIT=${options.elevationUnit}`, '-mo', `TILEO_HEIGHT_REFERENCE=${options.heightReference}`];
  if (options.sourceCrs) args.push('-a_srs', options.sourceCrs);
  await run('gdal_translate', [...args, input, cog], work);
  progress('Elevation: validating COG and source values', 45);
  const result = JSON.parse(await run('gdalinfo', ['-json', '-checksum', cog], { ...work, capture: true }));
  const a = source.bands[0], b = result.bands?.[0];
  if (result.metadata?.IMAGE_STRUCTURE?.LAYOUT !== 'COG' || result.driverShortName !== 'GTiff' || result.bands?.length !== 1 || !b || b.type !== a.type || b.checksum !== a.checksum || JSON.stringify(result.size) !== JSON.stringify(source.size) || JSON.stringify(result.geoTransform) !== JSON.stringify(source.geoTransform) || String(b.noDataValue) !== String(a.noDataValue) || (b.scale ?? 1) !== (a.scale ?? 1) || (b.offset ?? 0) !== (a.offset ?? 0) || (b.unit ?? '') !== (a.unit ?? '') || (!options.sourceCrs && result.coordinateSystem?.wkt !== source.coordinateSystem?.wkt) || (Math.max(...result.size) > 512 && !b.overviews?.length)) throw new JobError('INVALID_COG', 'COG layout, georeference, elevation values or metadata did not pass validation.');
  const sourceHash = await exactRasterHash(input, join(output, 'source-pixels.bin'), work);
  const cogHash = await exactRasterHash(cog, join(output, 'cog-pixels.bin'), work);
  if (sourceHash !== cogHash) throw new JobError('INVALID_COG', 'COG full-resolution pixel bytes differ from the source.');
  let terrain: Record<string, unknown> | undefined;
  if (grids.length) terrain = await buildTerrain(cog, output, options, info, grids, work, progress);
  if (terrain && options.exportPmtiles) { progress('Elevation: exporting PMTiles', 92); await exportPmtiles(join(output, 'terrain.mbtiles'), join(output, 'terrain.pmtiles'), execution.signal); }
  execution.signal?.throwIfAborted();
  const metadata: Record<string, unknown> = { ...(terrain ?? {}), kind: 'elevation', format: options.elevationOutput, elevationKind: options.elevationKind, elevationUnit: options.elevationUnit, heightReference: options.heightReference, bounds: info.bounds, source: info, sourceStatistics: source.bands[0].metadata?.[''] ?? {}, exportPmtiles: !!options.exportPmtiles, cog: { crsWkt: result.coordinateSystem?.wkt, geoTransform: result.geoTransform, width: result.size[0], height: result.size[1], noData: b.noDataValue, scale: b.scale ?? 1, offset: b.offset ?? 0, pixelSha256: cogHash }, cogBytes: (await stat(cog)).size };
  await writeFile(join(output, 'manifest.json'), JSON.stringify(metadata, null, 2));
  for (const name of ['elevation.tif', 'manifest.json', ...(terrain ? ['terrain.mbtiles', ...(options.exportPmtiles ? ['terrain.pmtiles'] : [])] : [])]) {
    const file = await open(join(output, name), 'r+'); try { await file.sync(); } finally { await file.close(); }
  }
  return metadata;
}

// Scientific rasters use the same lossless COG container as elevation, but do
// not claim that numeric values represent heights or permit terrain encoding.
export async function buildScientific(input: string, output: string, options: Options, execution: RunOptions, progress: (stage: string, percent: number) => void) {
  const info = await inspect(input, options, execution);
  if (options.pipeline !== 'scientific' || !info.elevationCandidate) throw new JobError('UNSUPPORTED_SCIENTIFIC_RASTER', 'Select the scientific raster pipeline for a single-band numeric GeoTIFF.');
  const budget = info.width! * info.height! * 16;
  if (budget > config.scratchBytes) throw new JobError('SCRATCH_LIMIT', 'Estimated scientific-raster scratch space exceeds the configured budget. Use a smaller input.');
  await checkDisk(budget);
  const source = JSON.parse(await run('gdalinfo', ['-json', '-checksum', '-stats', input], { ...execution, capture: true }));
  if (Number(source.bands[0].metadata?.['']?.STATISTICS_VALID_PERCENT) === 0) throw new JobError('EMPTY_SCIENTIFIC_RASTER', 'The raster has no valid pixels.');
  await mkdir(output, { recursive: true });
  const work = { ...execution, env: { ...(execution.env ?? toolEnvironment()), CPL_TMPDIR: output } };
  progress('Scientific raster: creating lossless COG', 15);
  const cog = join(output, 'scientific.tif');
  const args = ['-of', 'COG', '-co', 'COMPRESS=DEFLATE', '-co', 'PREDICTOR=YES', '-co', 'BLOCKSIZE=512', '-co', 'BIGTIFF=IF_SAFER', '-co', 'RESAMPLING=AVERAGE'];
  if (options.sourceCrs) args.push('-a_srs', options.sourceCrs);
  await run('gdal_translate', [...args, input, cog], work);
  progress('Scientific raster: validating COG and source values', 65);
  const result = JSON.parse(await run('gdalinfo', ['-json', '-checksum', cog], { ...work, capture: true }));
  const a = source.bands[0], b = result.bands?.[0];
  if (result.metadata?.IMAGE_STRUCTURE?.LAYOUT !== 'COG' || result.driverShortName !== 'GTiff' || result.bands?.length !== 1 || !b || b.type !== a.type || b.checksum !== a.checksum || JSON.stringify(result.size) !== JSON.stringify(source.size) || JSON.stringify(result.geoTransform) !== JSON.stringify(source.geoTransform) || String(b.noDataValue) !== String(a.noDataValue) || (b.scale ?? 1) !== (a.scale ?? 1) || (b.offset ?? 0) !== (a.offset ?? 0) || (b.unit ?? '') !== (a.unit ?? '') || (!options.sourceCrs && result.coordinateSystem?.wkt !== source.coordinateSystem?.wkt) || (Math.max(...result.size) > 512 && !b.overviews?.length)) throw new JobError('INVALID_COG', 'COG layout, georeference, numeric values or metadata did not pass validation.');
  const metadata = { kind: 'scientific', format: 'cog', purpose: 'scientific', bounds: info.bounds, source: info, sourceStatistics: source.bands[0].metadata?.[''] ?? {}, cog: { crsWkt: result.coordinateSystem?.wkt, geoTransform: result.geoTransform, width: result.size[0], height: result.size[1], noData: b.noDataValue, scale: b.scale ?? 1, offset: b.offset ?? 0, unit: b.unit ?? '' }, cogBytes: (await stat(cog)).size };
  await writeFile(join(output, 'manifest.json'), JSON.stringify(metadata, null, 2));
  for (const name of ['scientific.tif', 'manifest.json']) {
    const file = await open(join(output, name), 'r+'); try { await file.sync(); } finally { await file.close(); }
  }
  return metadata;
}

async function buildTerrain(cog: string, output: string, options: Options, info: Inspection, grids: ReturnType<typeof terrainGrid>[], execution: RunOptions, progress: (stage: string, percent: number) => void) {
  const file = join(output, 'terrain.mbtiles'), db = new Database(file);
  const encoding = options.elevationOutput === 'terrarium' ? 'terrarium' : 'mapbox';
  let missing = 0, complete = 0;
  const total = grids.reduce((sum, grid) => sum + grid.count, 0);
  const heights = new Float64Array(tileSize ** 2);
  const factor = options.elevationUnit === 'ft' ? 0.3048 : 1;
  try {
    db.exec('PRAGMA synchronous=FULL; CREATE TABLE metadata(name TEXT PRIMARY KEY,value TEXT); CREATE TABLE tiles(zoom_level INTEGER,tile_column INTEGER,tile_row INTEGER,tile_data BLOB,PRIMARY KEY(zoom_level,tile_column,tile_row));');
    const metadata = { name: 'TileO elevation', format: 'png', type: 'overlay', version: '1.3', description: `${options.elevationOutput} elevation in meters; synthetic NoData fill is for display only.`, bounds: info.bounds!.join(','), minzoom: String(options.minZoom), maxzoom: String(options.maxZoom), encoding, height_reference: options.heightReference!, nodata_display_height: String(options.terrainNoDataHeight) };
    const insertMeta = db.prepare('INSERT INTO metadata VALUES(?,?)');
    for (const [key, value] of Object.entries(metadata)) insertMeta.run(key, value);
    const insert = db.prepare('INSERT INTO tiles VALUES(?,?,?,?)');
    for (let i = 0; i < grids.length; i++) {
      execution.signal?.throwIfAborted();
      const grid = grids[i]!, zoom = options.minZoom + i;
      const width = (grid.x1 - grid.x0 + 1) * tileSize, height = (grid.y1 - grid.y0 + 1) * tileSize;
      const raw = join(output, 'terrain.bin');
      progress(`Elevation: resampling numeric heights at zoom ${zoom}`, 50 + Math.floor(40 * complete / total));
      await checkDisk(width * height * 8);
      await run('gdalwarp', ['-of', 'ENVI', '-ot', 'Float64', '-t_srs', 'EPSG:3857', '-te', String(-world + grid.x0 * grid.span), String(world - (grid.y1 + 1) * grid.span), String(-world + (grid.x1 + 1) * grid.span), String(world - grid.y0 * grid.span), '-ts', String(width), String(height), '-r', 'average', '-dstnodata', 'nan', '-wo', `NUM_THREADS=${config.threads}`, '-wm', '256', cog, raw], execution);
      const header = await readFile(join(output, 'terrain.hdr'), 'utf8');
      if (!/data type\s*=\s*5\b/i.test(header) || !/header offset\s*=\s*0\b/i.test(header) || !/bands\s*=\s*1\b/i.test(header)) throw new JobError('INVALID_TERRAIN', 'Unexpected GDAL elevation buffer layout.');
      const little = /byte order\s*=\s*0\b/i.test(header);
      const handle = await open(raw, 'r'), row = Buffer.alloc(tileSize * 8);
      try {
        db.exec('BEGIN');
        for (let ty = grid.y0; ty <= grid.y1; ty++) for (let tx = grid.x0; tx <= grid.x1; tx++) {
          execution.signal?.throwIfAborted();
          for (let y = 0; y < tileSize; y++) {
            const position = (((ty - grid.y0) * tileSize + y) * width + (tx - grid.x0) * tileSize) * 8;
            const read = await handle.read(row, 0, row.length, position);
            if (read.bytesRead !== row.length) throw new JobError('INVALID_TERRAIN', 'Truncated GDAL elevation buffer.');
            for (let x = 0; x < tileSize; x++) {
              const value = little ? row.readDoubleLE(x * 8) : row.readDoubleBE(x * 8);
              if (Number.isFinite(value)) heights[y * tileSize + x] = (value * (info.scale ?? 1) + (info.offset ?? 0)) * factor;
              else { heights[y * tileSize + x] = options.terrainNoDataHeight!; missing++; }
            }
          }
          insert.run(zoom, tx, 2 ** zoom - 1 - ty, terrainPng(heights, encoding)); complete++;
          if (complete % 32 === 0) { db.exec('COMMIT; BEGIN'); await checkDisk(); progress(`Elevation: encoding terrain tiles (${complete}/${total})`, 50 + Math.floor(40 * complete / total)); }
        }
        db.exec('COMMIT');
      } finally { await handle.close(); }
      await rm(raw, { force: true }); await rm(join(output, 'terrain.hdr'), { force: true });
    }
  } finally { db.close(); }
  const validated = validate(file, 'raster', options);
  const sampleDb = new Database(file, { readonly: true, fileMustExist: true });
  try {
    for (const zoom of grids.map((_grid, index) => options.minZoom + index)) {
      const count = Number((sampleDb.prepare('SELECT count(*) count FROM tiles WHERE zoom_level=?').get(zoom) as { count: number }).count);
      const statement = sampleDb.prepare('SELECT tile_data data FROM tiles WHERE zoom_level=? ORDER BY tile_column,tile_row LIMIT 1 OFFSET ?');
      for (const index of new Set([0, Math.floor(count / 2), count - 1])) {
        const sample = index >= 0 ? statement.get(zoom, index) as { data: Buffer } | undefined : undefined;
        if (!sample) throw new JobError('INVALID_TERRAIN', `Terrain zoom ${zoom} is missing a validation sample.`);
        validateTerrainPng(sample.data);
      }
    }
  } finally { sampleDb.close(); }
  return { ...validated, format: options.elevationOutput, encoding, syntheticNoDataPixels: missing, terrainNoDataHeight: options.terrainNoDataHeight };
}
