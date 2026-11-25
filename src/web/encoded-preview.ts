import type { AddProtocolAction, Map as MapLibreMap } from 'maplibre-gl';
import { decodeEncodedPixel, interpolateEncodedPixels } from '../encoded-pixel.js';
import type { EncodedOptions } from '../encoded-options.js';
import { encodingPresets } from '../encoded-presets.js';

const size = 256;
const stride = size * 4 + 1;
let previewId = 0;

type Channel = { parameter: string; unit: string; unscale: [number, number]; byteRole?: string };
type Metadata = Pick<EncodedOptions, 'profile' | 'unscale'> & {
  preset?: string;
  channels: Channel[];
  bounds: [number, number, number, number];
  minzoom: number;
  maxzoom: number;
  template: string;
};

export function parseEncodedTileJSON(payload: unknown): Metadata {
  const tileJSON = payload as {
    scheme?: string; tileSize?: number; minzoom: number; maxzoom: number;
    bounds: Metadata['bounds']; tiles: string[];
    raster_layers?: { id?: string; profile: Metadata['profile']; encoding: string; tileFormat: string;
      channels?: { R?: Channel; G?: Channel | null; A?: string } }[];
  } | null;
  const layer = tileJSON?.raster_layers?.[0];
  const { profile, encoding, channels } = layer ?? {};
  const r = channels?.R, g = channels?.G;
  const validChannel = (channel?: Channel | null): channel is Channel => !!channel
    && typeof channel.parameter === 'string' && !!channel.parameter
    && typeof channel.unit === 'string' && !!channel.unit
    && Array.isArray(channel.unscale) && channel.unscale.length === 2
    && channel.unscale.every(Number.isFinite) && channel.unscale[0] < channel.unscale[1]
    && Number.isFinite(channel.unscale[1] - channel.unscale[0]);
  if (!tileJSON || tileJSON.scheme !== 'xyz' || tileJSON.tileSize !== size || layer?.tileFormat !== 'image/png'
    || !validChannel(r) || channels?.A !== 'nodata-mask'
    || !Number.isInteger(tileJSON.minzoom) || !Number.isInteger(tileJSON.maxzoom)
    || tileJSON.minzoom < 0 || tileJSON.maxzoom > 22 || tileJSON.minzoom > tileJSON.maxzoom
    || !Array.isArray(tileJSON.bounds) || tileJSON.bounds.length !== 4 || !tileJSON.bounds.every(Number.isFinite)
    || tileJSON.bounds[0] >= tileJSON.bounds[2] || tileJSON.bounds[1] >= tileJSON.bounds[3]
    || !Array.isArray(tileJSON.tiles) || typeof tileJSON.tiles[0] !== 'string'
    || !['{z}', '{x}', '{y}'].every(token => tileJSON.tiles[0]!.includes(token))) {
    throw new Error('Encoded TileJSON is missing raster metadata.');
  }
  const sameRange = validChannel(g) && g.unit === r.unit && g.unscale.every((value, i) => value === r.unscale[i]);
  const validProfile =
    (profile === 'r-encoded' && encoding === 'r-linear-8bit' && g === null) ||
    (profile === 'rg-encoded' && encoding === 'rg-linear-8bit' && sameRange) ||
    (profile === 'rg-encoded-16bit' && encoding === 'rg-linear-16bit' && sameRange
      && r.byteRole === 'high' && g.byteRole === 'low' && r.parameter === g.parameter);
  if (!validProfile) throw new Error('Encoded TileJSON has an unsupported profile or channel order.');
  return {
    profile, preset: typeof layer?.id === 'string' ? layer.id : undefined, unscale: r.unscale, channels: profile === 'rg-encoded' ? [r, g!] : [r],
    minzoom: tileJSON.minzoom, maxzoom: tileJSON.maxzoom, bounds: tileJSON.bounds, template: tileJSON.tiles[0]!,
  };
}

// TileO emits filter-zero RGBA PNG. Read the scanlines directly so browser
// image decoding cannot change data channels through color or alpha conversion.
export async function readEncodedPng(png: ArrayBuffer) {
  const bytes = new Uint8Array(png), view = new DataView(png);
  if (bytes.length < 33 || bytes.length > 512 * 1024 || view.getUint32(0) !== 0x89504e47 || view.getUint32(4) !== 0x0d0a1a0a
    || view.getUint32(8) !== 13 || view.getUint32(12) !== 0x49484452 || view.getUint32(16) !== size || view.getUint32(20) !== size
    || bytes[24] !== 8 || bytes[25] !== 6 || bytes[26] || bytes[27] || bytes[28]) {
    throw new Error('Expected a 256 × 256 encoded RGBA tile.');
  }
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let ended = false;
  for (let offset = 33; offset + 12 <= bytes.length;) {
    const length = view.getUint32(offset), kind = view.getUint32(offset + 4);
    const next = offset + length + 12;
    if (next > bytes.length) throw new Error('Truncated encoded PNG chunk.');
    if (kind === 0x49444154) chunks.push(bytes.subarray(offset + 8, next - 4));
    if (kind === 0x49454e44) { ended = length === 0 && next === bytes.length; break; }
    offset = next;
  }
  if (!ended || !chunks.length) throw new Error('Incomplete encoded PNG.');
  const reader = new Blob(chunks).stream().pipeThrough(new DecompressionStream('deflate')).getReader();
  const rows = new Uint8Array(size * stride);
  let received = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (received + value.length > rows.length) throw new Error('Encoded PNG scanlines exceed the tile size.');
      rows.set(value, received);
      received += value.length;
    }
  } finally { await reader.cancel(); }
  if (received !== rows.length) throw new Error('Encoded PNG is missing scanlines.');
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    if (rows[y * stride] !== 0) throw new Error('Unexpected encoded PNG row filter.');
    pixels.set(rows.subarray(y * stride + 1, (y + 1) * stride), y * size * 4);
  }
  return pixels;
}

const colorPalettes = new Map([
  ['temp-2m', ['#253494', '#3686bd', '#8cd6c5', '#f6d66f', '#ed8c4a', '#a43b52']],
  ['rh-2m', ['#ce7844', '#e5bd66', '#94c4b1', '#3189a3', '#184b88']],
  ['cloud-cover', ['#293e68', '#526e99', '#8ca6c1', '#c8d8e8', '#f8fbfd']],
  ['precip-hourly', ['#283455', '#3788b2', '#5abb97', '#f8d668', '#d95b43']],
  ['cape', ['#242564', '#4e54a0', '#a26cb0', '#ee9a6a', '#f7df8b']],
  ['mslp', ['#43398c', '#467db5', '#9dc9d4', '#f2db93', '#b86c49']],
  ['wave-height', ['#123a67', '#286b98', '#59a9ba', '#9fd3b9', '#f7dc88']],
]);
const defaultColors = ['#20366f', '#2d79a2', '#4db7a8', '#b0d285', '#ffd46a'];

function colorScale(metadata: Metadata) {
  const vector = metadata.profile === 'rg-encoded';
  const [min, max] = metadata.unscale;
  const low = vector ? 0 : min;
  const high = vector ? Math.min(Number.MAX_VALUE, Math.hypot(Math.max(Math.abs(min), Math.abs(max)), Math.max(Math.abs(min), Math.abs(max)))) : max;
  // Expand smaller magnitudes where most wind and precipitation samples lie.
  const curved = vector || metadata.preset === 'precip-hourly' || metadata.preset === 'cape';
  const hex = colorPalettes.get(metadata.preset ?? '') ?? defaultColors;
  const steps = hex.map(color => {
    const rgb = Number.parseInt(color.slice(1), 16);
    return [rgb >>> 16, (rgb >>> 8) & 255, rgb & 255];
  });
  return {
    gradient: `linear-gradient(to right in srgb, ${hex.join(', ')})`,
    ticks: [low, low + (high - low) * (curved ? 0.25 : 0.5), high],
    paint(target: Uint8ClampedArray, p: number, value: number) {
      const fraction = Math.min(1, Math.max(0, (value - low) / (high - low)));
      const position = (curved ? Math.sqrt(fraction) : fraction) * (steps.length - 1);
      const index = Math.min(steps.length - 2, Math.floor(position)), weight = position - index;
      const left = steps[index]!, right = steps[index + 1]!;
      for (let c = 0; c < 3; c++) target[p + c] = Math.round(left[c]! + weight * (right[c]! - left[c]!));
      target[p + 3] = 255;
    },
  };
}

type TileRequest = (url: string, init?: RequestInit) => Promise<Response>;

export function showEncodedTiles(map: MapLibreMap, gl: { addProtocol(name: string, handler: AddProtocolAction): void; removeProtocol(name: string): void },
  metadata: Metadata, fetchTile: TileRequest) {
  const lifetime = new AbortController();
  const protocol = `tileo-encoded-preview-${++previewId}`;
  const source = 'encoded-raster-preview';
  const tiles = new Map<string, Promise<Uint8Array | null>>();
  const getTile = (z: number, x: number, y: number) => {
    const key = `${z}/${x}/${y}`;
    let tile = tiles.get(key);
    if (tile) tiles.delete(key);
    else tile = (async () => {
      const href = metadata.template.replaceAll('{z}', String(z)).replaceAll('{x}', String(x)).replaceAll('{y}', String(y));
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) throw new Error('Encoded tile URL must use the console origin.');
      const response = await fetchTile(url.href, { signal: lifetime.signal });
      return response.status === 204 ? null : readEncodedPng(await response.arrayBuffer());
    })().catch(error => {
      if (tiles.get(key) === tile) tiles.delete(key);
      throw error;
    });
    tiles.set(key, tile);
    if (tiles.size > 48) tiles.delete(tiles.keys().next().value!);
    return tile;
  };

  const vector = metadata.profile === 'rg-encoded';
  const scale = colorScale(metadata);
  const codes = metadata.profile === 'rg-encoded-16bit' ? 65535 : 255;
  const step = (metadata.unscale[1] - metadata.unscale[0]) / codes;
  const digits = Math.min(6, Math.max(1, 1 - Math.floor(Math.log10(step))));
  const format = new Intl.NumberFormat(undefined, { maximumFractionDigits: digits });
  const formatTick = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 4 });
  const channelLabel = (channel: Channel) => channel.parameter.replaceAll('_', ' ');
  const firstChannel = metadata.channels[0]!;
  const fieldLabel = encodingPresets.get(metadata.preset ?? '')?.label ?? channelLabel(firstChannel);
  const idle = 'Point to the map or tap for a value.';
  const panel = document.createElement('div');
  panel.className = 'maplibregl-ctrl encoded-preview';
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', 'Encoded raster legend');

  const header = document.createElement('div');
  header.className = 'encoded-preview-header';
  const title = document.createElement('strong');
  title.textContent = vector ? metadata.preset?.startsWith('wind-') ? 'Wind speed'
    : metadata.preset === 'ocean-currents' ? 'Current speed' : 'Vector magnitude' : fieldLabel;
  const unit = document.createElement('span');
  unit.className = 'encoded-preview-unit';
  unit.textContent = firstChannel.unit;
  header.append(title, unit);

  const ramp = document.createElement('div');
  ramp.className = 'encoded-preview-ramp';
  ramp.style.backgroundImage = scale.gradient;
  ramp.setAttribute('aria-hidden', 'true');
  const ticks = document.createElement('div');
  ticks.className = 'encoded-preview-ticks';
  for (const value of scale.ticks) {
    const tick = document.createElement('span');
    tick.textContent = formatTick.format(value);
    ticks.append(tick);
  }

  const missing = document.createElement('div');
  missing.className = 'encoded-preview-mask';
  const swatch = document.createElement('span');
  swatch.setAttribute('aria-hidden', 'true');
  missing.append(swatch, 'NoData');

  const reading = document.createElement('output');
  reading.setAttribute('aria-label', 'Encoded raster sample');
  reading.textContent = idle;
  panel.append(header, ramp, ticks, missing, reading);
  const control = { onAdd: () => panel, onRemove: () => panel.remove() };

  const pixelAt = async (z: number, column: number, row: number) => {
    const span = size * 2 ** z;
    if (row < 0 || row >= span) return null;
    const wrapX = ((column % span) + span) % span;
    const tile = await getTile(z, Math.floor(wrapX / size), Math.floor(row / size));
    const offset = ((row % size) * size + wrapX % size) * 4;
    return tile?.subarray(offset, offset + 4) ?? null;
  };
  async function sample(lng: number, lat: number) {
    if (lat < metadata.bounds[1] || lat > metadata.bounds[3]) return null;
    // MapLibre rounds raster zoom and adds one level for 256 px sources.
    const z = Math.min(metadata.maxzoom, Math.round(map.getZoom() + 1));
    if (z < metadata.minzoom) return null;
    const span = size * 2 ** z;
    const longitude = ((lng + 180) % 360 + 360) % 360 - 180;
    if (longitude < metadata.bounds[0] || longitude > metadata.bounds[2]) return null;
    const x = (longitude + 180) / 360 * span - 0.5;
    const y = (1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) * span / 2 - 0.5;
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const anchor = await pixelAt(z, Math.round(x), Math.round(y));
    if (anchor?.[3] !== 255) return null; // Keep the displayed NoData footprint.
    const samples = await Promise.all([pixelAt(z, x0, y0), pixelAt(z, x0 + 1, y0), pixelAt(z, x0, y0 + 1), pixelAt(z, x0 + 1, y0 + 1)]);
    return interpolateEncodedPixels(samples, [(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy], metadata);
  }

  let point: { lng: number; lat: number } | undefined, sequence = 0, sampling = false;
  const setReading = (text: string) => { if (reading.textContent !== text) reading.textContent = text; };
  const locate = async ({ lngLat }: { lngLat: { lng: number; lat: number } }) => {
    point = lngLat;
    sequence++;
    if (sampling) return;
    sampling = true;
    try {
      while (point && !lifetime.signal.aborted) {
        const current = point, version = sequence;
        point = undefined;
        try {
          const values = await sample(current.lng, current.lat);
          if (version !== sequence || lifetime.signal.aborted) continue;
          if (!values) { setReading('NoData'); continue; }
          const lines = values.map((value, i) => {
            const channel = metadata.channels[i]!;
            return `${vector ? i === 0 ? 'U · ' : 'V · ' : ''}${channelLabel(channel)}: ${format.format(value)} ${channel.unit}`;
          });
          if (vector) lines.unshift(`${title.textContent}: ${format.format(Math.hypot(...values))} ${firstChannel.unit}`);
          setReading(lines.join('\n'));
        } catch {
          if (!lifetime.signal.aborted && version === sequence) setReading('Could not load the tile value.');
        }
      }
    } finally { sampling = false; }
  };
  const reset = () => { sequence++; point = undefined; setReading(idle); };

  gl.addProtocol(protocol, async (request, abort) => {
    const signal = AbortSignal.any([lifetime.signal, abort.signal]);
    const match = /\/(\d+)\/(\d+)\/(\d+)$/.exec(request.url);
    if (!match) throw new Error('Invalid encoded preview tile URL.');
    signal.throwIfAborted();
    const pixels = await getTile(Number(match[1]), Number(match[2]), Number(match[3]));
    signal.throwIfAborted();
    const colors = new Uint8ClampedArray(size * size * 4);
    if (pixels) for (let p = 0; p < pixels.length; p += 4) {
      const values = decodeEncodedPixel(pixels.subarray(p, p + 4), metadata);
      if (!values) continue;
      const value = vector ? Math.hypot(values[0]!, values[1]!) : values[0]!;
      scale.paint(colors, p, value);
    }
    const canvas = new OffscreenCanvas(size, size);
    canvas.getContext('2d')!.putImageData(new ImageData(colors, size, size), 0, 0);
    const data = await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer();
    signal.throwIfAborted();
    return { data };
  });

  const cleanup = () => {
    if (lifetime.signal.aborted) return;
    lifetime.abort();
    map.off('remove', cleanup);
    map.off('mousemove', locate);
    map.off('click', locate);
    map.off('movestart', reset);
    map.getCanvas().removeEventListener('mouseleave', reset);
    if (map.hasControl(control)) map.removeControl(control);
    gl.removeProtocol(protocol);
    tiles.clear();
  };
  try {
    map.once('remove', cleanup);
    map.addSource(source, { type: 'raster', tiles: [`${protocol}://tiles/{z}/{x}/{y}`], tileSize: size,
      minzoom: metadata.minzoom, maxzoom: metadata.maxzoom, bounds: metadata.bounds });
    map.addLayer({ id: source, type: 'raster', source, paint: { 'raster-resampling': 'nearest', 'raster-fade-duration': 0 } });
    map.addControl(control, 'top-left');
    map.on('mousemove', locate);
    map.on('click', locate);
    map.on('movestart', reset);
    map.getCanvas().addEventListener('mouseleave', reset);
    return cleanup;
  } catch (error) {
    cleanup();
    throw error;
  }
}
