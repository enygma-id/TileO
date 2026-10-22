import { extname } from 'node:path';
import { PassThrough } from 'node:stream';
import { run, type RunOptions } from './process.js';
import { config, toolEnvironment } from './config.js';
import type { Inspection } from './inspect.js';
import type { Options } from './types.js';
import { JobError } from './types.js';
import { sequenceFeatures, rawMembers, compactJson } from './json-stream.js';

export type VectorAdapter = 'geojson' | 'ogr-sequential' | 'legacy';
export function vectorAdapter(input: string, inspection?: Inspection): VectorAdapter {
  const ext = extname(input).toLowerCase();
  if (['.json', '.geojson', '.geojsonl'].includes(ext)) return 'geojson';
  const driver = inspection?.driver;
  if ((ext === '.gpkg' && driver === 'GPKG') || (ext === '.fgb' && driver === 'FlatGeobuf')
    || (input.includes('/vsizip/') && driver === 'ESRI Shapefile')) return 'ogr-sequential';
  return 'legacy';
}
export function ogrNormalizationArgs(options: Options, inspection: Inspection): string[] {
  const args = ['-f', 'GeoJSONSeq', '-t_srs', 'EPSG:4326', '-dim', '2', '-lco', 'RS=NO',
    '-lco', 'COORDINATE_PRECISION=9', '-lco', 'AUTODETECT_JSON_STRINGS=NO'];
  if (options.sourceCrs) args.push('-s_srs', options.sourceCrs);
  if (options.includeProperties?.length) args.push('-select', options.includeProperties.join(','));
  return args;
}
// Restore only the reserved property name, preserving numeric JSON tokens and
// the original top-level FID. A single OGR invocation never resets IDs at a
// batch boundary. Genuine id/id2 collisions are rejected by the planner.
export function restoreOgrId(raw: string, restore: boolean): string {
  if (!restore) return compactJson(raw);
  const members = rawMembers(raw).map(([key, value]): [string, string] => {
    if (key !== 'properties' || value === 'null') return [key, value];
    const properties = rawMembers(value);
    if (!properties.some(([k]) => k === 'id2') || properties.some(([k]) => k === 'id')) return [key, value];
    return [key, `{${properties.map(([k, v]) => `${JSON.stringify(k === 'id2' ? 'id' : k)}:${v}`).join(',')}}`];
  });
  return compactJson(`{${members.map(([k, v]) => `${JSON.stringify(k)}:${v}`).join(',')}}`);
}
export async function* ogrSequentialFeatures(input: string, inspection: Inspection, options: Options, execution: RunOptions): AsyncGenerator<string> {
  const pipe = new PassThrough({ highWaterMark: 64 * 1024 });
  const controller = new AbortController();
  const signal = execution.signal ? AbortSignal.any([execution.signal, controller.signal]) : controller.signal;
  // Reserve CPU for the concurrently running Tippecanoe consumer.
  const env = { ...(execution.env ?? toolEnvironment()), GDAL_NUM_THREADS: '1' };
  const task = run('ogr2ogr', [...ogrNormalizationArgs(options, inspection), '/vsistdout/', input, ...(inspection.layer ? [inspection.layer] : [])],
    { ...execution, env, signal, capture: false, combined: false, stdout: pipe });
  // Observe rejection immediately, including when the scanner is suspended at
  // a yield. The original error is propagated again when task is awaited.
  void task.catch(error => pipe.destroy(error));
  try {
    for await (const { raw } of sequenceFeatures(pipe, config.vectorMaxFeatureMb * 1024 ** 2, signal)) yield raw;
    await task;
  } finally {
    controller.abort(new JobError('CANCELLED', 'Vector normalization stream closed.'));
    pipe.destroy();
    await task.catch(() => undefined);
  }
}
