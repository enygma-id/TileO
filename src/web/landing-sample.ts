// Builds the `SAMPLE` object featured on the landing hero map. The console
// shows the tile URL, bounds, and tile count from a finished raster job, but
// the hero config lives in source (web/landing-map.js), so this helper renders
// a readable properties panel plus a paste-ready snippet.

export type LandingSampleJob = {
  id: string;
  filename: string;
  options: { minZoom?: number; maxZoom?: number };
  metadata?: Record<string, unknown> | null;
};

export type LandingSample = {
  kind: 'raster' | 'vector';
  name: string;
  url: string;
  bounds: [number, number, number, number];
  center: [number, number];
  zoom: number;
  minzoom: number;
  maxzoom: number;
  tiles: string;
  sourceLayer?: string;
  geometryType?: string;
  fields?: string[];
};

const WEB_MERCATOR_LIMIT = 85.05112878;

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function mercatorY(latitude: number) {
  const clamped = Math.max(-WEB_MERCATOR_LIMIT, Math.min(WEB_MERCATOR_LIMIT, latitude));
  const radians = clamped * Math.PI / 180;
  return (1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2;
}

function singleQuote(value: string) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** Result bounds for a standard raster or vector job, or null when it cannot feed the hero map. */
export function landingSampleBounds(job: LandingSampleJob): [number, number, number, number] | null {
  const metadata = job.metadata;
  if (!metadata || !['raster', 'vector'].includes(String(metadata.kind))) return null;
  const source = metadata.source as Record<string, unknown> | undefined;
  const raw = metadata.bounds ?? source?.bounds;
  if (!Array.isArray(raw) || raw.length !== 4) return null;
  const values = raw.map(finiteNumber);
  if (values.some(value => value === null)) return null;
  const [west, south, east, north] = values as [number, number, number, number];
  if (!(west < east && south < north)) return null;
  return [west, south, east, north];
}

/** Zoom that fits the bounds into a viewport using 256 px XYZ tiles. */
export function fitBoundsZoom(
  bounds: [number, number, number, number],
  width: number,
  height: number,
  minZoom = 0,
  maxZoom = 22,
  padding = 32
) {
  const [west, south, east, north] = bounds;
  const usableWidth = Math.max(64, width - padding * 2);
  const usableHeight = Math.max(64, height - padding * 2);
  const longitudeFraction = Math.abs(east - west) / 360;
  const latitudeFraction = Math.abs(mercatorY(north) - mercatorY(south));
  const clamp = (value: number) => Math.max(minZoom, Math.min(maxZoom, value));
  if (longitudeFraction <= 0 || latitudeFraction <= 0) return clamp(0);
  const zoom = Math.min(
    Math.log2(usableWidth / (256 * longitudeFraction)),
    Math.log2(usableHeight / (256 * latitudeFraction))
  );
  if (!Number.isFinite(zoom)) return clamp(0);
  return clamp(Math.round(zoom * 10) / 10);
}

/** Readable values behind the snippet, or null for jobs the hero map cannot show. */
export function landingSampleData(job: LandingSampleJob, zoom: number): LandingSample | null {
  const bounds = landingSampleBounds(job);
  if (!bounds) return null;
  const metadata = job.metadata ?? {};
  const minzoom = finiteNumber(metadata.minZoom) ?? job.options.minZoom ?? 0;
  const maxzoom = finiteNumber(metadata.maxZoom) ?? job.options.maxZoom ?? 22;
  const tileCount = finiteNumber(metadata.tileCount);
  const kind = metadata.kind as 'raster' | 'vector';
  const source = metadata.source as Record<string, unknown> | undefined;
  const centerLongitude = Number(((bounds[0] + bounds[2]) / 2).toFixed(4));
  const centerLatitude = Number(((bounds[1] + bounds[3]) / 2).toFixed(4));
  const requestedZoom = finiteNumber(zoom) ?? minzoom;
  const sampleZoom = Math.max(minzoom, Math.min(maxzoom, Math.round(requestedZoom * 10) / 10));
  return {
    kind,
    name: job.filename,
    url: `/api/jobs/${encodeURIComponent(job.id)}/tiles/{z}/{x}/{y}`,
    bounds,
    center: [centerLongitude, centerLatitude],
    zoom: sampleZoom,
    minzoom,
    maxzoom,
    tiles: tileCount === null ? 'unknown' : tileCount.toLocaleString('en-US'),
    ...(kind === 'vector' ? {
      sourceLayer: Array.isArray(metadata.vectorLayers) && (metadata.vectorLayers[0] as { id?: unknown } | undefined)?.id
        ? String((metadata.vectorLayers[0] as { id: unknown }).id)
        : typeof source?.layer === 'string' ? source.layer : 'features',
      ...(typeof source?.geometryType === 'string' ? { geometryType: source.geometryType } : {}),
      ...(Array.isArray(source?.fields) ? { fields: source.fields.map(String) } : {}),
    } : {}),
  };
}

/** Paste-ready `const SAMPLE = {...};` for web/landing-map.js. */
export function landingSampleText(sample: LandingSample): string {
  const vectorLines = sample.kind === 'vector'
    ? [`  kind: 'vector',`, `  sourceLayer: ${singleQuote(sample.sourceLayer ?? 'features')},`]
    : [];
  return [
    'const SAMPLE = {',
    ...vectorLines,
    `  name: ${singleQuote(sample.name)},`,
    `  url: ${singleQuote(sample.url)},`,
    `  bounds: [${sample.bounds.join(', ')}],`,
    `  center: [${sample.center.join(', ')}],`,
    `  zoom: ${sample.zoom},`,
    `  minzoom: ${sample.minzoom},`,
    `  maxzoom: ${sample.maxzoom},`,
    `  tiles: ${singleQuote(sample.tiles)}`,
    '};',
    ''
  ].join('\n');
}

/** Paste-ready `const SAMPLE = {...};` for web/landing-map.js, or null for unsupported jobs. */
export function buildLandingSample(job: LandingSampleJob, zoom: number): string | null {
  const sample = landingSampleData(job, zoom);
  return sample ? landingSampleText(sample) : null;
}
