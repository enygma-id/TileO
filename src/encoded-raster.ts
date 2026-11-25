import { mkdir, open, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import Database from 'better-sqlite3';
import { config } from './config.js';
import { inspect, type Inspection } from './inspect.js';
import { resolveEncodedBands, type EncodedOptions } from './encoded-options.js';
import { quantize } from './encoded-pixel.js';
import { run, type RunOptions } from './process.js';
import { checkDisk } from './resources.js';
import { tilePng, tileSize } from './tile-png.js';
import { JobError, type Options } from './types.js';
import { validate } from './validate.js';

const world = 20037508.342789244;
const latitudeLimit = 85.05112877980659;
const doubleBytes = 8;

export function encodedTilePlan(info: Inspection, options: Options) {
  const source = info.bounds;
  if (!source || source.length !== 4 || !source.every(Number.isFinite) || source[0]! < -180 || source[2]! > 180 ||
    source[0]! >= source[2]! || source[1]! >= source[3]!) {
    throw new JobError('UNSUPPORTED_EXTENT', 'Encoded tiles require a geographic extent within the −180° to 180° longitude range.');
  }
  const bounds = [source[0]!, Math.max(-latitudeLimit, source[1]!), source[2]!, Math.min(latitudeLimit, source[3]!)];
  if (bounds[1]! >= bounds[3]!) throw new JobError('UNSUPPORTED_EXTENT', 'The source is outside Web Mercator latitude limits.');
  const grids = [];
  let count = 0;
  for (let z = options.minZoom; z <= options.maxZoom; z++) {
    const n = 2 ** z;
    const x = (lon: number) => (lon + 180) / 360 * n;
    const y = (lat: number) => (1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * n;
    const x0 = Math.max(0, Math.floor(x(bounds[0]!))), x1 = Math.min(n - 1, Math.ceil(x(bounds[2]!)) - 1);
    const y0 = Math.max(0, Math.floor(y(bounds[3]!))), y1 = Math.min(n - 1, Math.ceil(y(bounds[1]!)) - 1);
    const width = (x1 - x0 + 1) * tileSize, height = (y1 - y0 + 1) * tileSize;
    count += width / tileSize * (height / tileSize);
    if (count > config.maxTiles) throw new JobError('TILE_LIMIT', `Encoded tile count exceeds ${config.maxTiles} across the requested zooms. Reduce maximum zoom.`);
    grids.push({ z, n, x0, x1, y0, y1, width, height, span: 2 * world / n });
  }
  return { bounds, grids, count };
}

function rasterLayers(encoding: EncodedOptions) {
  const { profile, unit, unscale, parameters } = encoding;
  const first = { parameter: parameters[0], unit, unscale };
  const R = profile === 'rg-encoded-16bit' ? { ...first, byteRole: 'high' } : first;
  const G = profile === 'rg-encoded-16bit' ? { ...first, byteRole: 'low' }
    : profile === 'rg-encoded' ? { parameter: parameters[1], unit, unscale } : null;
  const code = profile === 'rg-encoded-16bit' ? 'rg-linear-16bit' : profile === 'rg-encoded' ? 'rg-linear-8bit' : 'r-linear-8bit';
  return [{ id: encoding.preset ?? profile, profile, encoding: code, tileFormat: 'image/png', channels: { R, G, B: null, A: 'nodata-mask' } }];
}

async function removeEnvi(raw: string) {
  await rm(raw, { force: true });
  await rm(raw.replace(/\.bin$/, '.hdr'), { force: true });
}

async function readEnviLayout(raw: string, width: number, height: number, bands: number) {
  const header = await readFile(raw.replace(/\.bin$/, '.hdr'), 'utf8');
  const field = (key: string) => header.match(new RegExp(`^${key}\\s*=\\s*(\\w+)\\s*$`, 'im'))?.[1]?.toLowerCase();
  const order = field('byte order');
  if (field('data type') !== '5' || field('header offset') !== '0' || field('interleave') !== 'bip' ||
    Number(field('samples')) !== width || Number(field('lines')) !== height || Number(field('bands')) !== bands ||
    (order !== '0' && order !== '1') || (await stat(raw)).size !== width * height * bands * doubleBytes) {
    throw new JobError('INVALID_ENCODED_RASTER', 'Unexpected GDAL numeric buffer layout.');
  }
  return order === '0'
    ? { read: (b: Buffer, p: number) => b.readDoubleLE(p), write: (b: Buffer, v: number, p: number) => b.writeDoubleLE(v, p) }
    : { read: (b: Buffer, p: number) => b.readDoubleBE(p), write: (b: Buffer, v: number, p: number) => b.writeDoubleBE(v, p) };
}

async function normalizeSource(input: string, work: string, info: Inspection, bands: ReturnType<typeof resolveEncodedBands>, execution: RunOptions) {
  const width = info.width!, height = info.height!;
  const { crs, transform } = info.encodedGrid!;
  const raw = join(work, 'source.bin');
  const stride = bands.length * 2 * doubleBytes;
  const selections = [...bands.map(b => String(b.index)), ...bands.map(b => `mask,${b.index}`)];
  await run('gdal_translate', ['-of', 'ENVI', '-ot', 'Float64', '-co', 'INTERLEAVE=BIP', '-mask', 'none',
    '-a_nodata', 'none', '-a_ullr', '0', '0', String(width), String(-height),
    ...selections.flatMap(b => ['-b', b]), input, raw], execution);

  const layout = await readEnviLayout(raw, width, height, selections.length);
  const handle = await open(raw, 'r+');
  const pixelsPerBlock = 32768;
  const block = Buffer.alloc(pixelsPerBlock * stride);
  const values = new Float64Array(bands.length);
  try {
    for (let index = 0; index < width * height; index += pixelsPerBlock) {
      execution.signal?.throwIfAborted();
      const length = Math.min(pixelsPerBlock, width * height - index) * stride;
      if ((await handle.read(block, 0, length, index * stride)).bytesRead !== length) throw new JobError('INVALID_ENCODED_RASTER', 'Truncated source samples.');
      for (let p = 0; p < length; p += stride) {
        let valid = true;
        for (let b = 0; b < bands.length; b++) {
          const band = bands[b]!;
          const sample = layout.read(block, p + b * doubleBytes);
          const mask = layout.read(block, p + (bands.length + b) * doubleBytes);
          const physical = (sample * band.scale + band.offset) * band.unitFactor + band.unitOffset;
          values[b] = physical;
          if (!(mask > 0) || sample === band.noData || !Number.isFinite(sample) || !Number.isFinite(physical)) valid = false;
        }
        for (let b = 0; b < bands.length; b++) layout.write(block, valid ? values[b]! : NaN, p + b * doubleBytes);
      }
      if ((await handle.write(block, 0, length, index * stride)).bytesWritten !== length) throw new JobError('INVALID_ENCODED_RASTER', 'Incomplete normalized raster write.');
    }
  } finally { await handle.close(); }

  // Restore the exact source georeference on the normalized values only.
  const vrt = join(work, 'normalized.vrt');
  const xmlBands = bands.map((_, i) => `<VRTRasterBand dataType="Float64" band="${i + 1}"><NoDataValue>nan</NoDataValue><SimpleSource><SourceFilename relativeToVRT="1">${basename(raw)}</SourceFilename><SourceBand>${i + 1}</SourceBand></SimpleSource></VRTRasterBand>`).join('');
  await writeFile(vrt, `<VRTDataset rasterXSize="${width}" rasterYSize="${height}"><SRS>${crs}</SRS><GeoTransform>${transform.join(', ')}</GeoTransform>${xmlBands}</VRTDataset>`);
  return vrt;
}

export function encodeSample(rows: Buffer, p: number, encoding: EncodedOptions, first: number, second?: number) {
  if (!Number.isFinite(first) || (encoding.profile === 'rg-encoded' && !Number.isFinite(second))) return;
  const packed = quantize(first, encoding.unscale, encoding.profile === 'rg-encoded-16bit' ? 65535 : 255);
  rows[p] = encoding.profile === 'rg-encoded-16bit' ? packed >>> 8 : packed;
  rows[p + 1] = encoding.profile === 'rg-encoded-16bit' ? packed & 255
    : encoding.profile === 'rg-encoded' ? quantize(second!, encoding.unscale, 255) : 0;
  rows[p + 3] = 255;
}

export async function buildEncodedRaster(input: string, output: string, scratch: string, options: Options, execution: RunOptions, progress: (stage: string, percent: number) => void) {
  const encoding = options.encoding!;
  const info = await inspect(input, options, execution);
  const bands = resolveEncodedBands(encoding, info.encodedBands);
  const { grids, bounds, count } = encodedTilePlan(info, options);
  const warpedBands = bands.length + 1; // The final band records GDAL output validity.
  const pixelBytes = warpedBands * doubleBytes;
  const sourceBytes = info.width! * info.height! * bands.length * 2 * doubleBytes;
  const warpBytes = Math.max(...grids.map(grid => grid.width * grid.height * pixelBytes));
  if (!Number.isSafeInteger(sourceBytes) || sourceBytes + warpBytes > config.scratchBytes) {
    throw new JobError('SCRATCH_LIMIT', 'Encoded processing buffers exceed the job scratch budget. Reduce source size or maximum zoom.');
  }
  await checkDisk(sourceBytes + warpBytes);
  await mkdir(output, { recursive: true });
  progress('Encoded raster: normalizing source samples', 10);
  const normalized = await normalizeSource(input, scratch, info, bands, execution);

  const raster_layers = rasterLayers(encoding);
  const path = join(output, 'tiles.mbtiles');
  const db = new Database(path);
  let complete = 0;
  try {
    db.exec('PRAGMA synchronous=FULL; CREATE TABLE metadata(name TEXT PRIMARY KEY,value TEXT); CREATE TABLE tiles(zoom_level INTEGER,tile_column INTEGER,tile_row INTEGER,tile_data BLOB,PRIMARY KEY(zoom_level,tile_column,tile_row));');
    const metadata = { name: 'TileO encoded raster', type: 'overlay', version: '1.3', format: 'png', bounds: bounds.join(','),
      minzoom: String(options.minZoom), maxzoom: String(options.maxZoom), json: JSON.stringify({ raster_layers }) };
    const insertMetadata = db.prepare('INSERT INTO metadata VALUES (?,?)');
    for (const [key, value] of Object.entries(metadata)) insertMetadata.run(key, value);

    const insertTile = db.prepare('INSERT INTO tiles VALUES (?,?,?,?)');
    const tileRow = Buffer.alloc(tileSize * pixelBytes);
    const rowStride = 1 + tileSize * 4;
    const pngRows = Buffer.alloc(tileSize * rowStride);
    const raw = join(scratch, 'warped.bin');
    for (const grid of grids) {
      progress(`Encoded raster: generating zoom ${grid.z}`, 20 + Math.floor(70 * complete / count));
      const extent = [-world + grid.x0 * grid.span, world - (grid.y1 + 1) * grid.span,
        -world + (grid.x1 + 1) * grid.span, world - grid.y0 * grid.span];
      await run('gdalwarp', ['-of', 'ENVI', '-co', 'INTERLEAVE=BIP', '-ot', 'Float64', '-t_srs', 'EPSG:3857',
        '-te', ...extent.map(String), '-ts', String(grid.width), String(grid.height), '-r', 'bilinear',
        '-ovr', 'NONE', '-srcnodata', 'nan', '-dstnodata', 'nan', '-dstalpha', '-et', '0', '-wm', '64', normalized, raw], execution);
      const layout = await readEnviLayout(raw, grid.width, grid.height, warpedBands);
      const handle = await open(raw, 'r');
      try {
        db.exec('BEGIN');
        for (let y = grid.y0; y <= grid.y1; y++) for (let x = grid.x0; x <= grid.x1; x++) {
          execution.signal?.throwIfAborted();
          pngRows.fill(0);
          for (let row = 0; row < tileSize; row++) {
            const firstPixel = ((y - grid.y0) * tileSize + row) * grid.width + (x - grid.x0) * tileSize;
            if ((await handle.read(tileRow, 0, tileRow.length, firstPixel * pixelBytes)).bytesRead !== tileRow.length) {
              throw new JobError('INVALID_ENCODED_RASTER', 'Truncated warped raster samples.');
            }
            for (let column = 0; column < tileSize; column++) {
              const p = column * pixelBytes;
              if (layout.read(tileRow, p + bands.length * doubleBytes) > 0) {
                encodeSample(pngRows, row * rowStride + 1 + column * 4, encoding, layout.read(tileRow, p),
                  bands.length === 2 ? layout.read(tileRow, p + doubleBytes) : undefined);
              }
            }
          }
          insertTile.run(grid.z, x, grid.n - 1 - y, tilePng(pngRows, 4));
          complete++;
          if (complete % 32 === 0) {
            db.exec('COMMIT; BEGIN');
            await checkDisk();
            progress(`Encoded raster: encoded ${complete}/${count} tiles`, 20 + Math.floor(70 * complete / count));
          }
        }
        db.exec('COMMIT');
      } finally { await handle.close(); }
      await removeEnvi(raw);
    }
  } finally { db.close(); }
  const result = validate(path, 'raster', options);
  if (result.tileCount !== count) throw new JobError('INVALID_ENCODED_RASTER', 'Encoded tile count does not match the planned coverage.');
  return { ...result, kind: 'encoded-raster', bounds, raster_layers, exportPmtiles: !!options.exportPmtiles };
}
