import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { config } from './config.js';
import { run } from './process.js';
import { JobError, type Job } from './types.js';
import type { Inspection } from './inspect.js';

export async function sourcePreview(job: Pick<Job, 'input' | 'options' | 'metadata'>, signal: AbortSignal, bbox?: string) {
  let viewport: number[] | undefined;
  if (bbox !== undefined) {
    if (typeof bbox !== 'string') throw new JobError('INVALID_OPTIONS', 'Preview bbox must be a comma-separated string.');
    viewport = bbox.split(',').map(Number);
    if (viewport.length !== 4 || bbox.split(',').some(value => !value.trim()) || !viewport.every(Number.isFinite) || viewport[0]! < -180 || viewport[2]! > 180 || viewport[1]! < -90 || viewport[3]! > 90 || viewport[0]! >= viewport[2]! || viewport[1]! >= viewport[3]!) throw new JobError('INVALID_OPTIONS', 'Preview bbox must be west,south,east,north in WGS84 within -180..180 and -90..90.');
  }
  const info = job.metadata?.source as Inspection | undefined;
  let input = join(config.data, 'input', job.input);
  if (job.input.endsWith('.zip')) input = `/vsizip/${input.replaceAll('\\', '/')}`;
  const execution = { signal, timeoutMs: 60000 };
  if (job.metadata?.kind === 'vector') {
    const args = ['-f', 'GeoJSON', '-t_srs', 'EPSG:4326', '-dim', '2', '-limit', '5001', '-lco', 'COORDINATE_PRECISION=15', '-lco', 'AUTODETECT_JSON_STRINGS=NO'];
    if (job.options.sourceCrs) args.push('-s_srs', job.options.sourceCrs);
    if (viewport) args.push('-spat', ...viewport.map(String), '-spat_srs', 'EPSG:4326');
    let data;
    try { data = JSON.parse(await run('ogr2ogr', [...args, '/vsistdout/', input, ...(info?.layer ? [info.layer] : [])], { ...execution, capture: true })); }
    catch (error) {
      if (error instanceof JobError && error.code === 'METADATA_LIMIT') throw new JobError('PREVIEW_LIMIT', 'Source geometries in this area exceed the preview size budget. Zoom in on a smaller area or download the source for inspection.');
      throw error;
    }
    data.preview = { truncated: data.features.length > 5000, scope: viewport ? 'viewport' : 'dataset' };
    data.features = data.features.slice(0, 5000);
    return { mime: 'application/geo+json', data: Buffer.from(JSON.stringify(data)) };
  }
  if (job.metadata?.kind !== 'raster') throw new JobError('UNSUPPORTED_PREVIEW', 'Use the elevation or 3D source preview for this job.');
  const bounds = (info?.bounds ?? job.metadata.bounds) as number[] | undefined;
  if (!bounds || bounds.length !== 4 || !bounds.every(Number.isFinite) || bounds[0]! >= bounds[2]! || bounds[1]! >= bounds[3]!) throw new JobError('MISSING_EXTENT', 'Source coverage is unavailable for visual comparison.');
  const directory = await mkdtemp(join(config.data, 'scratch', 'compare-'));
  try {
    const warped = join(directory, 'preview.tif'), png = join(directory, 'preview.png');
    if (bounds[1]! < -85.05112878 || bounds[3]! > 85.05112878) throw new JobError('UNSUPPORTED_EXTENT', 'Source comparison requires coverage within Web Mercator latitude limits.');
    // Warp to EPSG:4326 so pixels are linear in lon/lat, matching the MapLibre image overlay coordinates.
    const args = ['-of', 'GTiff', '-t_srs', 'EPSG:4326', '-te', ...bounds.map(String), '-ts', '1536', '1536', '-r', 'near', '-dstalpha', '-wm', '128', '-co', 'COMPRESS=DEFLATE'];
    if (job.options.sourceCrs) args.push('-s_srs', job.options.sourceCrs);
    // ponytail: bound imagery comparison to 1536 px; source tile rendering if full-resolution inspection is needed.
    await run('gdalwarp', [...args, input, warped], execution);
    await run('gdal_translate', ['-of', 'PNG', warped, png], execution);
    return { mime: 'image/png', data: await readFile(png) };
  } finally { await rm(directory, { recursive: true, force: true }); }
}
