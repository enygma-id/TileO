export class JobError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
export type Status = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
export type LocalInputSource = { kind: 'local'; input: string; filename: string; size: number; sha256: string };
export type S3InputSource = {
  kind: 's3'; connectionId: string; bucket: string; key: string; versionId?: string;
  readMode: 'remote' | 'stage'; size: number; etag: string; lastModified?: string;
  rangeSupported: boolean; cog: boolean;
  /** BYOC credential reference (credentialId in the server vault / credential store). Never logged. */
  credentialId?: string;
  /** Session binding hash recorded at inspect time; the worker re-checks ownership. */
  credentialOwner?: string;
  /** User-supplied endpoint scope for BYOC targets (endpoint/region/bucket/prefix). No secrets. */
  credentialTarget?: { endpoint: string; region: string; bucket: string; prefix?: string };
};
export type UrlInputSource = {
  kind: 'url'; url: string; auth: 'public' | 'presigned'; readMode: 'remote' | 'stage';
  size: number; etag: string; lastModified?: string; rangeSupported: boolean; cog: boolean;
};
export type InputSource = LocalInputSource | S3InputSource | UrlInputSource;
export interface Options {
  pipeline?: 'elevation' | 'scientific'; rasterPurpose?: 'imagery' | 'elevation' | 'scientific'; elevationOutput?: 'cog' | 'terrain-rgb' | 'terrarium'; elevationKind?: 'dem' | 'dsm' | 'dtm';
  elevationUnit?: 'unknown' | 'm' | 'ft'; heightReference?: 'unknown' | 'ellipsoid' | 'orthometric';
  terrainNoDataHeight?: number; exportPmtiles?: boolean;
  minZoom: number; maxZoom: number; tileFormat: 'webp' | 'png' | 'jpeg'; quality: number;
  sourceCrs: string | null; layer: string | null; vectorPreset: 'preserve' | 'density';
  vectorEngine: 'auto' | 'tippecanoe' | 'gdal';
  includeProperties: string[] | null; maxTileBytes: number | null; maxTileFeatures: number | null;
  latitude?: number; longitude?: number; height?: number; heading?: number; pitch?: number; roll?: number;
  anchor?: 'origin' | 'base' | 'center'; scale?: number; exportB3dm?: boolean;
}
export function parseOptions(input: unknown, model3d = false): Options {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new JobError('INVALID_OPTIONS', 'Options must be an object.');
  const value = input as Record<string, unknown>;
  if (!model3d && value.pipeline === 'elevation') {
    const allowed = ['pipeline', 'rasterPurpose', 'elevationOutput', 'elevationKind', 'elevationUnit', 'heightReference', 'sourceCrs', 'minZoom', 'maxZoom', 'terrainNoDataHeight', 'exportPmtiles'];
    for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new JobError('INVALID_OPTIONS', `Unknown elevation option: ${key}`);
    const choice = <T extends string>(key: string, choices: readonly T[], fallback: T): T => {
      const selected = value[key] ?? fallback;
      if (!choices.includes(selected as T)) throw new JobError('INVALID_OPTIONS', `Invalid ${key}.`);
      return selected as T;
    };
    const elevationOutput = choice('elevationOutput', ['cog', 'terrain-rgb', 'terrarium'], 'cog');
    if (value.rasterPurpose !== undefined && value.rasterPurpose !== 'elevation') throw new JobError('INVALID_OPTIONS', 'Elevation jobs require rasterPurpose=elevation.');
    const elevationKind = choice('elevationKind', ['dem', 'dsm', 'dtm'], 'dem');
    const elevationUnit = choice('elevationUnit', ['unknown', 'm', 'ft'], 'unknown');
    const heightReference = choice('heightReference', ['unknown', 'ellipsoid', 'orthometric'], 'unknown');
    if (elevationOutput !== 'cog' && (elevationUnit === 'unknown' || heightReference === 'unknown')) throw new JobError('ELEVATION_METADATA_REQUIRED', 'Terrain output requires explicit elevation units and height reference. COG can preserve unknown metadata.');
    const terrainNoDataHeight = value.terrainNoDataHeight;
    if (elevationOutput !== 'cog' && (typeof terrainNoDataHeight !== 'number' || !Number.isFinite(terrainNoDataHeight) || terrainNoDataHeight < (elevationOutput === 'terrarium' ? -32768 : -10000) || terrainNoDataHeight > (elevationOutput === 'terrarium' ? 32767.99609375 : 1667721.5))) throw new JobError('INVALID_OPTIONS', `Choose a finite NoData display height in meters (${elevationOutput === 'terrarium' ? '-32768 to 32767.99609375' : '-10000 to 1667721.5'}).`);
    if (value.exportPmtiles !== undefined && typeof value.exportPmtiles !== 'boolean') throw new JobError('INVALID_OPTIONS', 'exportPmtiles must be boolean.');
    if (elevationOutput === 'cog' && value.exportPmtiles) throw new JobError('INVALID_OPTIONS', 'PMTiles requires terrain tiles.');
    const common = parseOptions({ exportPmtiles: value.exportPmtiles, sourceCrs: value.sourceCrs, minZoom: value.minZoom, maxZoom: value.maxZoom });
    return { ...common, pipeline: 'elevation', rasterPurpose: 'elevation', elevationOutput, elevationKind, elevationUnit, heightReference, terrainNoDataHeight: terrainNoDataHeight as number | undefined, tileFormat: 'png' };
  }
  if (!model3d && value.pipeline === 'scientific') {
    const allowed = ['pipeline', 'rasterPurpose', 'sourceCrs'];
    for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new JobError('INVALID_OPTIONS', `Unknown scientific-raster option: ${key}`);
    if (value.rasterPurpose !== undefined && value.rasterPurpose !== 'scientific') throw new JobError('INVALID_OPTIONS', 'Scientific jobs require rasterPurpose=scientific.');
    const common = parseOptions({ sourceCrs: value.sourceCrs });
    return { ...common, pipeline: 'scientific', rasterPurpose: 'scientific', tileFormat: 'png' };
  }
  const allowed = new Set(model3d ? ['latitude', 'longitude', 'height', 'heading', 'pitch', 'roll', 'anchor', 'scale', 'exportB3dm'] : ['rasterPurpose', 'minZoom', 'maxZoom', 'tileFormat', 'quality', 'sourceCrs', 'layer', 'vectorPreset', 'vectorEngine', 'exportPmtiles', 'includeProperties', 'maxTileBytes', 'maxTileFeatures']);
  for (const key of Object.keys(value)) if (!allowed.has(key)) throw new JobError('INVALID_OPTIONS', `Unknown option: ${key}`);
  const number = (key: string, fallback: number, min: number, max: number) => {
    const n = value[key] ?? fallback;
    if (typeof n !== 'number' || !Number.isInteger(n) || n < min || n > max) throw new JobError('INVALID_OPTIONS', `${key} must be an integer from ${min} to ${max}.`);
    return n;
  };
  if (value.exportPmtiles !== undefined && typeof value.exportPmtiles !== 'boolean') throw new JobError('INVALID_OPTIONS', 'exportPmtiles must be boolean.');
  const minZoom = number('minZoom', 0, 0, 22), maxZoom = number('maxZoom', 18, 0, 22);
  if (minZoom > maxZoom) throw new JobError('INVALID_OPTIONS', 'Minimum zoom cannot exceed maximum zoom.');
  const tileFormat = value.tileFormat ?? 'webp';
  if (!['webp', 'png', 'jpeg'].includes(String(tileFormat))) throw new JobError('INVALID_OPTIONS', 'Unsupported tile format.');
  const rasterPurpose = value.rasterPurpose;
  if (rasterPurpose !== undefined && rasterPurpose !== 'imagery') throw new JobError('INVALID_OPTIONS', 'Raster jobs require rasterPurpose=imagery.');
  const sourceCrs = value.sourceCrs || null;
  if (sourceCrs !== null && (typeof sourceCrs !== 'string' || !/^EPSG:\d{4,7}$/.test(sourceCrs))) throw new JobError('INVALID_CRS', 'Source CRS must be an EPSG identifier, for example EPSG:32750.');
  const layer = value.layer || null;
  if (layer !== null && (typeof layer !== 'string' || !/^[\w .-]{1,100}$/.test(layer) || layer.startsWith('-'))) throw new JobError('INVALID_OPTIONS', 'Invalid layer name.');
  const vectorPreset = value.vectorPreset ?? 'density';
  if (vectorPreset !== 'preserve' && vectorPreset !== 'density') throw new JobError('INVALID_OPTIONS', 'Invalid vector preset.');
  const vectorEngine = value.vectorEngine ?? 'auto';
  if (!['auto', 'tippecanoe', 'gdal'].includes(String(vectorEngine))) throw new JobError('INVALID_OPTIONS', 'Invalid vector engine.');
  // Attribute filter: null/undefined keeps all attributes (backward compatible).
  // An array keeps only the listed attributes; an empty array produces pure
  // geometry via --exclude-all (tippecanoe) without sending -select '' to GDAL.
  let includeProperties: string[] | null = null;
  if (value.includeProperties !== undefined && value.includeProperties !== null) {
    if (!Array.isArray(value.includeProperties)) throw new JobError('INVALID_OPTIONS', 'includeProperties must be an array of attribute names or null.');
    if (value.includeProperties.length > 100) throw new JobError('INVALID_OPTIONS', 'includeProperties supports at most 100 attributes.');
    const seen = new Set<string>();
    for (const name of value.includeProperties) {
      if (typeof name !== 'string' || !/^[\w .-]{1,100}$/.test(name) || name.startsWith('-')) throw new JobError('INVALID_OPTIONS', `Invalid attribute name: ${String(name).slice(0, 60)}`);
      seen.add(name);
    }
    includeProperties = [...seen];
  }
  const optionalInt = (key: string, min: number, max: number) => {
    const v = value[key];
    if (v === undefined || v === null) return null;
    if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) throw new JobError('INVALID_OPTIONS', `${key} must be an integer from ${min} to ${max}.`);
    return v;
  };
  const maxTileBytes = optionalInt('maxTileBytes', 50000, 10000000);
  const maxTileFeatures = optionalInt('maxTileFeatures', 1000, 1000000);
  if (model3d) {
    if (value.exportB3dm !== undefined && typeof value.exportB3dm !== 'boolean') throw new JobError('INVALID_OPTIONS', 'exportB3dm must be boolean.');
    for (const [key, min, max] of [['latitude', -90, 90], ['longitude', -180, 180], ['height', -12000, 100000], ['heading', -360, 360], ['pitch', -180, 180], ['roll', -180, 180], ['scale', 0.001, 1000]] as const) {
      const v = value[key];
      if (!['heading', 'pitch', 'roll', 'scale'].includes(key) || v !== undefined) if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) throw new JobError('INVALID_OPTIONS', `${key} must be a finite number from ${min} to ${max}.`);
    }
    if (value.anchor !== undefined && !['origin', 'base', 'center'].includes(String(value.anchor))) throw new JobError('INVALID_OPTIONS', 'anchor must be origin, base, or center.');
  }
  return { exportPmtiles: value.exportPmtiles as boolean | undefined, ...(rasterPurpose ? { rasterPurpose } : {}), minZoom, maxZoom, tileFormat: tileFormat as Options['tileFormat'], quality: number('quality', 80, 1, 100), sourceCrs, layer, vectorPreset: vectorPreset as Options['vectorPreset'], vectorEngine: vectorEngine as Options['vectorEngine'], includeProperties, maxTileBytes, maxTileFeatures, ...(model3d ? { latitude: value.latitude as number, longitude: value.longitude as number, height: value.height as number, heading: (value.heading ?? 0) as number, pitch: (value.pitch ?? 0) as number, roll: (value.roll ?? 0) as number, anchor: (value.anchor ?? 'base') as Options['anchor'], scale: (value.scale ?? 1) as Options['scale'], exportB3dm: value.exportB3dm === true } : {}) };
}
export interface Job {
  id: string; filename: string; input: string; sha256: string; size: number; options: Options;
  source?: InputSource;
  status: Status; stage: string; progress: number; cancel: number; attempt: number;
  created: string; updated: string; started: string | null; error: string | null; code: string | null;
  output: string | null; metadata: Record<string, unknown> | null;
  elapsedMs?: number | null; remainingMs?: number | null;
}
