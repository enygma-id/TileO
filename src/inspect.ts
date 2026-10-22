import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run, type RunOptions } from './process.js';
import { JobError, type Options } from './types.js';
import { config } from './config.js';
import type { VectorPreflightResult } from './vector-reader.js';
import { vectorAdapter } from './vector-adapter.js';
import proj4 from 'proj4';

export interface Inspection {
  kind: 'raster' | 'vector'; crs: string | null; layer?: string; bands?: number;
  width?: number; height?: number; nativeZoom?: number; estimatedTiles?: number; featureCount?: number; layers?: string[]; fields?: string[];
  allFields?: string[];
  driver?: string;
  geometryType?: string; epsg?: string | null; fieldCollisions?: string[][];
  elevationCandidate?: boolean; dataType?: string; noData?: number | string; unit?: string;
  scale?: number; offset?: number; bounds?: number[]; verticalCrs?: string | null;
  inferredElevationUnit?: 'm' | 'ft'; inferredHeightReference?: 'ellipsoid' | 'orthometric'; minimum?: number; maximum?: number; suggestedNoDataHeight?: number;
  pixelSize?: number[];
  cog?: boolean;
}
// Groups attribute names that differ only by letter case (e.g. ID vs id).
// MVT and GeoJSON keep both, but humans and case-insensitive consumers mix
// them up, so the worker and UI call this out explicitly.
export function findFieldCollisions(names: string[]): string[][] {
  const groups = new Map<string, string[]>();
  for (const name of names) {
    const key = name.toLowerCase();
    const group = groups.get(key);
    if (group) { if (!group.includes(name)) group.push(name); }
    else groups.set(key, [name]);
  }
  return [...groups.values()].filter(group => group.length > 1).map(group => [...group].sort());
}
// Web Mercator tiles intersecting a WGS84 bbox at a zoom: an exact upper
// bound for how many tiles that zoom level can produce over the extent.
export function tilesAtZoom(bounds: [number, number, number, number], zoom: number) {
  const n = 2 ** zoom;
  const x = (lon: number) => ((lon + 180) / 360) * n;
  const y = (lat: number) => {
    const clamped = Math.min(85.05112878, Math.max(-85.05112878, lat)) * Math.PI / 180;
    return ((1 - Math.asinh(Math.tan(clamped)) / Math.PI) / 2) * n;
  };
  return (Math.floor(x(bounds[2])) - Math.floor(x(bounds[0])) + 1) * (Math.floor(y(bounds[1])) - Math.floor(y(bounds[3])) + 1);
}
// Largest max-zoom whose tile count still fits the budget. Each zoom level
// down quarters the worst case, so this converges in a few steps.
export function suggestMaxZoom(bounds: [number, number, number, number], limit: number, from: number) {
  let zoom = Math.max(0, Math.min(22, Math.floor(from)));
  while (zoom > 0 && tilesAtZoom(bounds, zoom) > limit) zoom--;
  return zoom;
}
// Reproject a native layer extent to WGS84 for tile budgeting. Geographic
// extents (the common GeoJSON case) are used as-is so datum quirks and axis
// order can never corrupt the estimate; anything else goes through proj4.
export function toWgs84Bounds(extent: unknown, wkt?: string): [number, number, number, number] | undefined {
  if (!Array.isArray(extent) || extent.length !== 4 || !extent.every(Number.isFinite)) return undefined;
  const minx = Number(extent[0]), miny = Number(extent[1]), maxx = Number(extent[2]), maxy = Number(extent[3]);
  if (!(minx < maxx && miny < maxy)) return undefined;
  if (Math.abs(minx) <= 180 && Math.abs(maxx) <= 180 && Math.abs(miny) <= 90 && Math.abs(maxy) <= 90
    && (!wkt || /GEOG?CRS|GEOGCS/i.test(wkt))) return [minx, miny, maxx, maxy];
  if (!wkt) return undefined;
  try {
    const convert = proj4(wkt, 'EPSG:4326');
    const corners = [[minx, miny], [maxx, miny], [maxx, maxy], [minx, maxy]]
      .map(([x, y]) => convert.forward([x!, y!]) as unknown as [number, number]);
    const xs = corners.map(c => c[0]), ys = corners.map(c => c[1]);
    const bounds: [number, number, number, number] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    if (!bounds.every(Number.isFinite) || bounds[0] < -180 || bounds[2] > 180 || bounds[1] < -90 || bounds[3] > 90 || bounds[0] >= bounds[2] || bounds[1] >= bounds[3]) return undefined;
    return bounds;
  } catch { return undefined; }
}
export async function inspect(input: string, options: Options, execution: RunOptions, probe = false): Promise<Inspection> {
  // Probe runs inside the 512 MiB API container, independently of worker RAM.
  if (probe) execution = { ...execution, memoryBytes: Math.min(execution.memoryBytes ?? config.memoryBytes, 256 * 1024 ** 2) };
  if ((execution.batchMode ?? config.vectorBatchMode) === 'on' && extname(input).toLowerCase() === '.kml') {
    throw new JobError('UNSUPPORTED_INPUT', 'Strict batch mode does not qualify KML: its reader retains document state. Use auto/off or convert to GPKG/FGB first.');
  }
  if (options.sourceCrs) {
    try { await run('gdalsrsinfo', ['-V', options.sourceCrs], execution); }
    catch (error) {
      if (error instanceof JobError && error.code === 'TOOL_FAILED') throw new JobError('INVALID_CRS', `Source CRS ${options.sourceCrs} is not recognized by PROJ. Leave Source CRS empty to use the file's embedded CRS.`);
      throw error;
    }
  }
  const batchMode = execution.batchMode ?? config.vectorBatchMode;
  if (batchMode !== 'off' && vectorAdapter(input) === 'geojson') {
    const memoryBytes = Math.min(execution.memoryBytes ?? config.memoryBytes, 256 * 1024 ** 2);
    const response = JSON.parse(await run(process.execPath, [
      `--max-old-space-size=${Math.floor(memoryBytes / 1024 ** 2 * 0.6)}`,
      fileURLToPath(new URL('./vector-preflight-cli.js', import.meta.url)), input, JSON.stringify(options),
    ], { ...execution, memoryBytes, memoryRootPid: undefined, capture: true }));
    if (response.error) throw new JobError(response.error.code, response.error.message);
    const pre = response.result as VectorPreflightResult;
    if (!pre.crs && !probe) throw new JobError('MISSING_CRS', 'Vector layer has no recognized CRS. Provide its correct Source CRS.');
    if (options.layer && options.layer !== pre.layerName && !probe) throw new JobError('LAYER_REQUIRED', `Select layer ${pre.layerName}.`);
    return {
      kind: 'vector', driver: 'GeoJSON', crs: pre.crs, epsg: pre.epsg,
      layer: pre.layerName, layers: [pre.layerName], featureCount: pre.featureCount,
      fields: pre.fields.slice(0, 100), allFields: pre.fields, fieldCollisions: findFieldCollisions(pre.fields),
      geometryType: pre.geometryType,
      ...(pre.bounds ? { bounds: pre.bounds, estimatedTiles: tilesAtZoom(pre.bounds, options.maxZoom) } : {}),
    };
  }
  let raster: Record<string, any> | undefined;
  try { raster = JSON.parse(await run('gdalinfo', ['-json', ...(probe && !execution.remoteProbe ? ['-approx_stats'] : []), input], { ...execution, capture: true })); }
  catch (error) { if (!(error instanceof JobError) || error.code !== 'TOOL_FAILED') throw error; }
  if (raster?.size?.length === 2 && raster.bands?.length) {
    const wkt = raster.coordinateSystem?.wkt;
    if (!options.sourceCrs && !wkt && !probe) throw new JobError('MISSING_CRS', 'Raster has no CRS. Provide its correct Source CRS.');
    if (!raster.geoTransform) throw new JobError('MISSING_GEOREFERENCE', 'Raster has no affine georeference. Georeference it before tiling.');
    const band = raster.bands[0];
    const elevationCandidate = raster.driverShortName === 'GTiff' && raster.bands.length === 1 && ['Byte', 'Int16', 'UInt16', 'Int32', 'UInt32', 'Float32', 'Float64'].includes(band.type) && !band.colorTable;
    if (elevationCandidate && (![band.scale ?? 1, band.offset ?? 0].every(Number.isFinite))) throw new JobError('INVALID_ELEVATION', 'Elevation scale and offset must be finite numbers.');
    if (options.pipeline === 'elevation' && !elevationCandidate) throw new JobError('UNSUPPORTED_ELEVATION', 'Elevation input must be a georeferenced, single-band numeric GeoTIFF without a palette.');
    if (options.pipeline === 'scientific' && !elevationCandidate) throw new JobError('UNSUPPORTED_SCIENTIFIC_RASTER', 'Scientific raster input must be a georeferenced, single-band numeric GeoTIFF without a palette.');
    if (!['elevation', 'scientific'].includes(options.pipeline ?? '') && !(probe && elevationCandidate) && (!raster.bands.every((b: any) => b.type === 'Byte') || ![1,3,4].includes(raster.bands.length) || raster.bands.some((b: any) => b.colorTable))) {
      throw new JobError('UNSUPPORTED_RASTER', 'This console accepts Byte grayscale/RGB/RGBA rasters. Scale non-Byte data or expand a palette with GDAL first.');
    }
    const epsg = raster.stac?.['proj:epsg'];
    // GDAL reads the actual WKT from the dataset; never infer CRS from the last nested EPSG ID.
    const result: Inspection = { kind: 'raster', crs: options.sourceCrs ?? (wkt ? (epsg ? `EPSG:${epsg}` : 'Embedded CRS') : null), bands: raster.bands.length, width: raster.size[0], height: raster.size[1], cog: raster.metadata?.IMAGE_STRUCTURE?.LAYOUT === 'COG' };
    if (elevationCandidate) {
      const inferredHeightReference = /gravity-related height|orthometric|geoid|mean sea level|\bEGM(?:84|96|2008)?\b/i.test(wkt ?? '') ? 'orthometric' : /ellipsoidal height/i.test(wkt ?? '') ? 'ellipsoid' : undefined;
      const bandUnit = String(band.unit ?? '');
      const verticalUnitText = inferredHeightReference ? String(wkt ?? '') : '';
      const inferredElevationUnit = /^(?:ft|foot|feet|international foot|international feet)$/i.test(bandUnit) || /LENGTHUNIT\["(?:foot|feet|international foot)"/i.test(verticalUnitText) ? 'ft' : /^(?:m|metre|meter|metres|meters)$/i.test(bandUnit) || /LENGTHUNIT\["(?:metre|meter)"/i.test(verticalUnitText) ? 'm' : undefined;
      const stats = band.metadata?.[''] ?? {};
      const rawMin = Number(stats.STATISTICS_MINIMUM), rawMax = Number(stats.STATISTICS_MAXIMUM), scale = band.scale ?? 1, offset = band.offset ?? 0;
      const physical = [rawMin * scale + offset, rawMax * scale + offset].sort((a, b) => a - b);
      const factor = inferredElevationUnit === 'ft' ? 0.3048 : inferredElevationUnit === 'm' ? 1 : undefined;
      const suggestedNoDataHeight = factor && physical.every(Number.isFinite) ? Math.max(-10000, Math.floor((physical[0]! * factor - Math.max(10, (physical[1]! - physical[0]!) * factor * 0.05)) * 10) / 10) : undefined;
      Object.assign(result, { elevationCandidate: true, dataType: band.type, noData: band.noDataValue, unit: band.unit ?? '', scale, offset, pixelSize: [Math.abs(raster.geoTransform[1]), Math.abs(raster.geoTransform[5])], verticalCrs: /VERT(?:_CS|CRS)\[/.test(wkt ?? '') ? wkt : null, ...(inferredElevationUnit ? { inferredElevationUnit } : {}), ...(inferredHeightReference ? { inferredHeightReference } : {}), ...(physical.every(Number.isFinite) ? { minimum: physical[0], maximum: physical[1] } : {}), ...(suggestedNoDataHeight !== undefined ? { suggestedNoDataHeight } : {}) });
    }
    const coordinates = raster.wgs84Extent?.coordinates?.[0] as number[][] | undefined;
    if (coordinates?.length) {
      result.bounds = [Math.min(...coordinates.map(c => c[0]!)), Math.min(...coordinates.map(c => c[1]!)), Math.max(...coordinates.map(c => c[0]!)), Math.max(...coordinates.map(c => c[1]!))];
      result.estimatedTiles = tilesAtZoom(result.bounds as [number, number, number, number], options.maxZoom);
      const distance = (a: number[], b: number[]) => {
        const lat1 = a[1]! * Math.PI / 180, lat2 = b[1]! * Math.PI / 180, dlat = lat2 - lat1, dlon = (b[0]! - a[0]!) * Math.PI / 180;
        const h = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
        return 2 * 6378137 * Math.asin(Math.min(1, Math.sqrt(h)));
      };
      // GDAL's WGS84 ring is UL → LL → LR → UR. Measuring its actual edges
      // avoids inflating native resolution for rotated rasters via their bbox.
      const resolution = coordinates.length >= 4 ? Math.min(distance(coordinates[0]!, coordinates[1]!) / result.height!, distance(coordinates[1]!, coordinates[2]!) / result.width!) : NaN;
      if (resolution > 0 && Number.isFinite(resolution)) result.nativeZoom = Math.max(0, Math.min(22, Math.ceil(Math.log2(156543.03392 / resolution))));
    }
    return result;
  }
  if (options.pipeline === 'elevation') throw new JobError('UNSUPPORTED_ELEVATION', 'Elevation jobs require a single-band GeoTIFF.');
  if (options.pipeline === 'scientific') throw new JobError('UNSUPPORTED_SCIENTIFIC_RASTER', 'Scientific raster jobs require a single-band GeoTIFF.');

  let vector: any;
  try { vector = JSON.parse(await run('ogrinfo', ['-json', '-so', '-al', input], { ...execution, capture: true })); }
  catch (error) { if (error instanceof JobError && error.code === 'TOOL_FAILED') throw new JobError('UNSUPPORTED_INPUT', 'GDAL could not read this file. Vector inspection requires GDAL 3.7 or newer. See the job log.'); throw error; }
  const layers = vector.layers ?? [];
  const driver = vector.driverShortName as string | undefined;
  if (batchMode === 'on' && vectorAdapter(input, { driver } as Inspection) === 'legacy') {
    throw new JobError('UNSUPPORTED_INPUT', `Strict batch mode has no qualified adapter for ${driver ?? extname(input)}. KML remains legacy because its reader retains the document in memory.`);
  }
  const selected = options.layer ? layers.find((l: any) => l.name === options.layer) : layers.length === 1 || probe ? layers[0] : undefined;
  if (!selected && !probe) throw new JobError('LAYER_REQUIRED', `Select one input layer. Available layers: ${layers.map((l: any) => l.name).join(', ') || '(none)'}`);
  if (selected?.featureCount === 0 && !probe) throw new JobError('EMPTY_DATASET', 'The selected layer contains no features.');
  const wkt = selected.geometryFields?.[0]?.coordinateSystem?.wkt;
  if (!options.sourceCrs && !wkt && !probe) throw new JobError('MISSING_CRS', 'Vector layer has no CRS. Provide its correct Source CRS.');
  const bounds = toWgs84Bounds(selected?.geometryFields?.[0]?.extent, wkt);
  const allFields: string[] | undefined = Array.isArray(selected?.fields) ? selected.fields.map((f: any) => String(f.name)).filter((n: string) => n.length > 0) : undefined;
  const fields = allFields?.slice(0, 100);
  const geometryType = typeof selected?.geometryFields?.[0]?.type === 'string' && selected.geometryFields[0].type ? String(selected.geometryFields[0].type) : undefined;
  // Authoritative EPSG from the layer's own PROJJSON (never inferred from a
  // nested ID): drives the direct-to-tippecanoe decision in vector().
  const projId = selected?.geometryFields?.[0]?.coordinateSystem?.projjson?.id as { authority?: unknown; code?: unknown } | undefined;
  const epsg = typeof projId?.authority === 'string' && projId.authority.toUpperCase() === 'EPSG' && Number.isInteger(projId?.code) ? `EPSG:${projId.code}` : null;
  return {
    kind: 'vector', driver, crs: options.sourceCrs ?? (wkt ? 'Embedded CRS' : null), layer: selected?.name,
    featureCount: selected?.featureCount, layers: layers.map((l: any) => l.name),
    ...(fields ? { fields, allFields, fieldCollisions: findFieldCollisions(allFields!) } : {}),
    ...(geometryType ? { geometryType } : {}),
    ...(epsg ? { epsg } : {}),
    ...(bounds ? { bounds, estimatedTiles: tilesAtZoom(bounds, options.maxZoom) } : {}),
  };
}
