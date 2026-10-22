import { fromUrl, type RemoteSourceOptions, type BlockedSourceOptions } from 'geotiff';
import proj4 from 'proj4';
import type { Map, AddProtocolAction } from 'maplibre-gl';
import type { Job } from '../types.js';

export interface TiffGeoref {
  crsWkt: string;
  geoTransform: number[];
  width: number;
  height: number;
  bands: { type: string; noData: number | null; colorInterpretation?: string; scale?: number; offset?: number; unit?: string }[];
  display?: { mode: string; kind: string; minimum: number; maximum: number; unit: string };
  bounds?: number[]; nativeZoom?: number;
}

// Renders the original TIFF bytes (grayscale, RGB or RGBA) straight from the
// uploaded file. Unlike the 1536 px PNG preview this streams full-resolution
// windows on demand, so the compare view shows the true source data.
export async function showOriginalTiff(
  map: Map,
  gl: { addProtocol: (name: string, handler: AddProtocolAction) => void; removeProtocol: (name: string) => void },
  options: { url: string; protocol: string; georef: TiffGeoref; bounds?: number[] },
): Promise<() => void> {
  const lifetime = new AbortController();
  let settled = false;
  let legend: import('maplibre-gl').IControl | undefined;
  const cleanup = () => {
    if (settled) return;
    settled = true;
    lifetime.abort();
    map.off('remove', cleanup);
    if (legend) { try { map.removeControl(legend); } catch { /* map already removed */ } }
    try { gl.removeProtocol(options.protocol); } catch { /* already removed */ }
  };
  map.once('remove', cleanup);
  try {
    const tiff = await fromUrl(options.url, { allowFullFile: false, blockSize: 65536, cacheSize: 32 } as RemoteSourceOptions & BlockedSourceOptions, lifetime.signal);
    const base = await tiff.getImage();
    const samples = base.getSamplesPerPixel();
    if (![1, 2, 3, 4].includes(samples)) throw new Error('Only grayscale, RGB and RGBA TIFFs can be previewed directly.');
    const numeric = ['elevation', 'scientific'].includes(options.georef.display?.mode ?? '') ? options.georef.display : undefined;
    if (numeric && (samples !== 1 || !Number.isFinite(numeric.minimum) || !Number.isFinite(numeric.maximum))) throw new Error('Invalid numeric-raster preview metadata.');
    if (!numeric && !options.georef.bands.every(band => ['Byte', 'UInt16'].includes(band.type))) throw new Error('Only 8-bit and unsigned 16-bit TIFFs can be previewed directly.');
    const palette = options.georef.bands[0]?.colorInterpretation === 'Palette';
    const whiteIsZero = base.fileDirectory.getValue('PhotometricInterpretation') === 0;
    const maximum = options.georef.bands.map(band => band.type === 'UInt16' ? 65535 : 255);
    const { crsWkt, geoTransform } = options.georef;
    if (!crsWkt || !geoTransform) throw new Error('TIFF georeferencing metadata is missing.');
    const transform = proj4('EPSG:3857', crsWkt);
    const [a, b, c, d, e, f] = geoTransform as [number, number, number, number, number, number];
    const determinant = b * f - c * e;
    if (!Number.isFinite(determinant) || determinant === 0) throw new Error('Invalid TIFF geotransform.');
    const images = [base];
    for (let i = 1, count = await tiff.getImageCount(); i < count; i++) images.push(await tiff.getImage(i));
    images.sort((x, y) => y.getWidth() - x.getWidth());
    const bandNoData = options.georef.bands?.[0]?.noData ?? base.getGDALNoData();
    const sampleIndex = Array.from({ length: samples }, (_, i) => i);
    gl.addProtocol(options.protocol, async (request, abort) => {
      const signal = AbortSignal.any([lifetime.signal, abort.signal]); signal.throwIfAborted();
      const match = /\/(\d+)\/(\d+)\/(\d+)$/.exec(request.url);
      if (!match) throw new Error('Invalid TIFF tile URL.');
      const [z, x, y] = match.slice(1).map(Number) as [number, number, number];
      const span = 40075016.68557849 / 2 ** z, coordinates = new Float64Array(256 * 256 * 2);
      let west = Infinity, north = Infinity, east = -Infinity, south = -Infinity;
      for (let row = 0; row < 256; row++) for (let col = 0; col < 256; col++) {
        const position = transform.forward([-20037508.342789244 + (x + (col + 0.5) / 256) * span, 20037508.342789244 - (y + (row + 0.5) / 256) * span]);
        const dx = position[0]! - a, dy = position[1]! - d;
        const u = (f * dx - c * dy) / determinant, v = (-e * dx + b * dy) / determinant;
        const p = (row * 256 + col) * 2; coordinates[p] = u; coordinates[p + 1] = v;
        if (Number.isFinite(u) && Number.isFinite(v)) { west = Math.min(west, u); east = Math.max(east, u); north = Math.min(north, v); south = Math.max(south, v); }
      }
      const desired = Math.max((east - west) / 256, (south - north) / 256);
      let image = base;
      for (const candidate of images) if (base.getWidth() / candidate.getWidth() <= desired) image = candidate;
      const sx = image.getWidth() / base.getWidth(), sy = image.getHeight() / base.getHeight();
      const window = [Math.max(0, Math.floor(west * sx)), Math.max(0, Math.floor(north * sy)), Math.min(image.getWidth(), Math.ceil(east * sx) + 1), Math.min(image.getHeight(), Math.ceil(south * sy) + 1)];
      const rgba = new Uint8ClampedArray(256 * 256 * 4);
      if (window[0]! < window[2]! && window[1]! < window[3]!) {
        if (image.getTileWidth() * image.getTileHeight() * 8 > 128 * 1024 ** 2) throw new Error('Source TIFF strips exceed the preview memory budget. Prepare a tiled GeoTIFF for comparison.');
        const width = Math.min(1024, window[2]! - window[0]!), height = Math.min(1024, window[3]! - window[1]!);
        // Bound decoded work even for a rotated raster or a very coarse map tile.
        if ((window[2]! - window[0]!) * (window[3]! - window[1]!) > 16777216) throw new Error('Zoom in to render this TIFF within the preview memory budget.');
        const values = palette
          ? await image.readRGB({ window, width, height, interleave: true, signal })
          : await image.readRasters({ window, width, height, samples: sampleIndex, interleave: true, signal });
        const channels = palette ? 3 : samples;
        for (let i = 0; i < 256 * 256; i++) {
          const u = coordinates[i * 2]!, v = coordinates[i * 2 + 1]!;
          if (!Number.isFinite(u) || !Number.isFinite(v) || u < 0 || v < 0 || u >= base.getWidth() || v >= base.getHeight()) continue;
          const col = Math.floor((u * sx - window[0]!) * width / (window[2]! - window[0]!));
          const row = Math.floor((v * sy - window[1]!) * height / (window[3]! - window[1]!));
          if (col < 0 || row < 0 || col >= width || row >= height) continue;
          const offset = (row * width + col) * channels;
          const clamp = (n: unknown, band = 0) => Math.max(0, Math.min(255, Math.round(Number(n) * 255 / (palette ? 255 : maximum[band]!))));
          if (!palette && samples <= 2) {
            const value = Number(values[offset]);
            if (!Number.isFinite(value) || value === bandNoData) continue;
            if (numeric) {
              const height = value * (options.georef.bands[0]?.scale ?? 1) + (options.georef.bands[0]?.offset ?? 0);
              if (!Number.isFinite(height)) continue;
              const range = numeric.maximum - numeric.minimum;
              const t = range === 0 ? 0.5 : Math.max(0, Math.min(1, (height - numeric.minimum) / range));
              rgba[i * 4] = Math.round(30 + 220 * t);
              rgba[i * 4 + 1] = Math.round(120 + 100 * t);
              rgba[i * 4 + 2] = Math.round(170 - 110 * t);
              rgba[i * 4 + 3] = 255;
            } else {
              const gray = whiteIsZero ? 255 - clamp(value) : clamp(value);
              const alpha = samples === 2 ? clamp(values[offset + 1], 1) : 255;
              rgba[i * 4] = gray; rgba[i * 4 + 1] = gray; rgba[i * 4 + 2] = gray; rgba[i * 4 + 3] = alpha;
            }
          } else {
            const alpha = !palette && samples === 4 ? clamp(values[offset + 3], 3) : 255;
            if (!Number.isFinite(alpha) || alpha === 0) continue;
            rgba[i * 4] = clamp(values[offset]); rgba[i * 4 + 1] = clamp(values[offset + 1], 1); rgba[i * 4 + 2] = clamp(values[offset + 2], 2); rgba[i * 4 + 3] = alpha;
          }
        }
      }
      signal.throwIfAborted();
      const canvas = new OffscreenCanvas(256, 256); canvas.getContext('2d')!.putImageData(new ImageData(rgba, 256, 256), 0, 0);
      const data = await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer();
      signal.throwIfAborted(); return { data };
    });
    lifetime.signal.throwIfAborted();
    map.addSource('original-tiff', { type: 'raster', tiles: [`${options.protocol}://tiles/{z}/{x}/{y}`], tileSize: 256, minzoom: 0, maxzoom: options.georef.nativeZoom ?? 18, ...(options.bounds ? { bounds: options.bounds as [number, number, number, number] } : {}) });
    map.addLayer({ id: 'original-tiff', type: 'raster', source: 'original-tiff', paint: { 'raster-resampling': numeric ? 'nearest' : 'linear', 'raster-fade-duration': 120 } });
    if (numeric) {
      const node = document.createElement('div');
      node.className = 'maplibregl-ctrl elevation-legend';
      const title = document.createElement('strong');
      title.textContent = `${numeric.kind.toUpperCase()} · ${numeric.unit || 'unit unspecified'}`;
      const ramp = document.createElement('div'); ramp.className = 'elevation-legend-ramp';
      const range = document.createElement('div'); range.className = 'elevation-legend-range';
      for (const value of [numeric.minimum, numeric.maximum]) {
        const label = document.createElement('span'); label.textContent = value.toLocaleString(undefined, { maximumFractionDigits: 2 }); range.append(label);
      }
      const note = document.createElement('small'); note.textContent = 'Approximate display range';
      node.append(title, ramp, range, note);
      legend = { onAdd: () => node, onRemove: () => node.remove() };
      map.addControl(legend, 'bottom-right');
    }
    return cleanup;
  } catch (error) { cleanup(); throw error; }
}

export async function showCog(map: Map, gl: { addProtocol: (name: string, handler: AddProtocolAction) => void; removeProtocol: (name: string) => void }, job: Job, source = false) {
  const lifetime = new AbortController();
  map.once('remove', () => lifetime.abort());
  const tiff = await fromUrl(`/api/jobs/${job.id}/${source ? 'source' : 'cog'}`, { allowFullFile: false, blockSize: 65536, cacheSize: 32 } as RemoteSourceOptions & BlockedSourceOptions, lifetime.signal);
  const base = await tiff.getImage();
  const meta = job.metadata?.cog as { crsWkt: string; geoTransform: number[]; scale: number; offset: number; noData?: number | string } | undefined;
  if (!meta?.crsWkt || !meta.geoTransform) throw new Error('COG preview metadata is missing. Recreate this job to enable elevation rendering.');
  const transform = proj4('EPSG:3857', meta.crsWkt);
  const [a, b, c, d, e, f] = meta.geoTransform as [number, number, number, number, number, number];
  const determinant = b * f - c * e;
  if (!Number.isFinite(determinant) || determinant === 0) throw new Error('Invalid COG geotransform.');
  const images = [base];
  for (let i = 1, count = await tiff.getImageCount(); i < count; i++) images.push(await tiff.getImage(i));
  images.sort((x, y) => y.getWidth() - x.getWidth());
  const statistics = job.metadata?.sourceStatistics as Record<string, string>;
  const minimum = Number(statistics?.STATISTICS_MINIMUM ?? 0) * meta.scale + meta.offset;
  const maximum = Number(statistics?.STATISTICS_MAXIMUM ?? 1) * meta.scale + meta.offset;
  const low = Math.min(minimum, maximum), range = Math.max(1e-9, Math.abs(maximum - minimum));
  const protocol = `tileo-cog-${job.id}${source ? '-source' : ''}`;
  gl.addProtocol(protocol, async (request, abort) => {
    const signal = AbortSignal.any([lifetime.signal, abort.signal]); signal.throwIfAborted();
    const match = /\/(\d+)\/(\d+)\/(\d+)$/.exec(request.url);
    if (!match) throw new Error('Invalid COG tile URL.');
    const [z, x, y] = match.slice(1).map(Number) as [number, number, number];
    const span = 40075016.68557849 / 2 ** z, coordinates = new Float64Array(256 * 256 * 2);
    let west = Infinity, north = Infinity, east = -Infinity, south = -Infinity;
    for (let row = 0; row < 256; row++) for (let col = 0; col < 256; col++) {
      const position = transform.forward([-20037508.342789244 + (x + (col + 0.5) / 256) * span, 20037508.342789244 - (y + (row + 0.5) / 256) * span]);
      const dx = position[0]! - a, dy = position[1]! - d;
      const u = (f * dx - c * dy) / determinant, v = (-e * dx + b * dy) / determinant;
      const p = (row * 256 + col) * 2; coordinates[p] = u; coordinates[p + 1] = v;
      if (Number.isFinite(u) && Number.isFinite(v)) { west = Math.min(west, u); east = Math.max(east, u); north = Math.min(north, v); south = Math.max(south, v); }
    }
    const desired = Math.max((east - west) / 256, (south - north) / 256);
    let image = base;
    for (const candidate of images) if (base.getWidth() / candidate.getWidth() <= desired) image = candidate;
    const sx = image.getWidth() / base.getWidth(), sy = image.getHeight() / base.getHeight();
    const window = [Math.max(0, Math.floor(west * sx)), Math.max(0, Math.floor(north * sy)), Math.min(image.getWidth(), Math.ceil(east * sx) + 1), Math.min(image.getHeight(), Math.ceil(south * sy) + 1)];
    const rgba = new Uint8ClampedArray(256 * 256 * 4);
    if (window[0]! < window[2]! && window[1]! < window[3]!) {
      if (source && image.getTileWidth() * image.getTileHeight() * 8 > 128 * 1024 ** 2) throw new Error('Source TIFF strips exceed the preview memory budget. Prepare a tiled GeoTIFF for comparison.');
      const width = Math.min(1024, window[2]! - window[0]!), height = Math.min(1024, window[3]! - window[1]!);
      // Bound decoded work even for a rotated raster or a very coarse map tile.
      if ((window[2]! - window[0]!) * (window[3]! - window[1]!) > 16777216) throw new Error('Zoom in to render this COG within the preview memory budget.');
      const values = await image.readRasters({ window, width, height, samples: [0], interleave: true, signal });
      const noData = image.getGDALNoData();
      for (let i = 0; i < 256 * 256; i++) {
        const u = coordinates[i * 2]!, v = coordinates[i * 2 + 1]!;
        if (!Number.isFinite(u) || !Number.isFinite(v) || u < 0 || v < 0 || u >= base.getWidth() || v >= base.getHeight()) continue;
        const col = Math.floor((u * sx - window[0]!) * width / (window[2]! - window[0]!));
        const row = Math.floor((v * sy - window[1]!) * height / (window[3]! - window[1]!));
        if (col < 0 || row < 0 || col >= width || row >= height) continue;
        const value = Number(values[row * width + col]);
        if (!Number.isFinite(value) || value === noData) continue;
        const t = Math.max(0, Math.min(1, (value * meta.scale + meta.offset - low) / range));
        rgba[i * 4] = Math.round(30 + 220 * t); rgba[i * 4 + 1] = Math.round(120 + 100 * t); rgba[i * 4 + 2] = Math.round(170 - 110 * t); rgba[i * 4 + 3] = 230;
      }
    }
    signal.throwIfAborted();
    const canvas = new OffscreenCanvas(256, 256); canvas.getContext('2d')!.putImageData(new ImageData(rgba, 256, 256), 0, 0);
    const data = await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer();
    signal.throwIfAborted(); return { data };
  });
  lifetime.signal.addEventListener('abort', () => gl.removeProtocol(protocol), { once: true });
  lifetime.signal.throwIfAborted();
  map.addSource('cog-elevation', { type: 'raster', tiles: [`${protocol}://tiles/{z}/{x}/{y}`], tileSize: 256, ...(job.metadata?.bounds ? { bounds: job.metadata.bounds as [number, number, number, number] } : {}) });
  map.addLayer({ id: 'cog-elevation', type: 'raster', source: 'cog-elevation', paint: { 'raster-resampling': 'nearest', 'raster-fade-duration': 0 } });
}
