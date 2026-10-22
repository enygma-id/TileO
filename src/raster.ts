import { config } from './config.js';
import { run, type RunOptions } from './process.js';
import type { Options } from './types.js';
export async function raster(input: string, output: string, options: Options, execution: RunOptions, progress: (stage: string, percent: number) => void) {
  const resolution = 156543.03392804097 / 2 ** options.maxZoom;
  const args = ['-of', 'MBTiles', '-t_srs', 'EPSG:3857', '-tr', String(resolution), String(resolution), '-r', 'bilinear', '-multi', '-wo', `NUM_THREADS=${config.threads}`, '-wm', '256', '-co', `TILE_FORMAT=${options.tileFormat.toUpperCase()}`, '-co', `QUALITY=${options.quality}`];
  if (options.sourceCrs) args.push('-s_srs', options.sourceCrs);
  if (options.tileFormat !== 'jpeg') args.push('-dstalpha');
  progress(`Raster: building zoom ${options.maxZoom}`, 10);
  await run('gdalwarp', [...args, input, output], execution);
  progress('Raster: building lower zoom levels', 65);
  // Sequential levels keep peak resampling memory bounded for large orthophotos.
  for (let zoom = options.maxZoom; zoom > options.minZoom; zoom--) {
    progress(`Raster: building zoom ${zoom - 1}`, 65 + Math.floor(25 * (options.maxZoom - zoom) / Math.max(1, options.maxZoom - options.minZoom)));
    await run('gdaladdo', ['-oo', `ZOOM_LEVEL=${zoom}`, '-oo', 'USE_BOUNDS=NO', '-oo', `TILE_FORMAT=${options.tileFormat.toUpperCase()}`, '-oo', `QUALITY=${options.quality}`, '-r', 'average', output, '2'], execution);
  }
}
