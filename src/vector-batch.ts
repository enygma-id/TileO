import { createReadStream, createWriteStream } from 'node:fs';
import { rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { finished } from 'node:stream/promises';
import type { Writable } from 'node:stream';
import { run, type RunOptions } from './process.js';
import { writeLine, type StreamStats } from './pipeline.js';
import type { Inspection } from './inspect.js';
import { JobError, type Options } from './types.js';
import { readGeoJsonBatches } from './vector-reader.js';
import { config } from './config.js';
import { filterFeature, rawMembers, sequenceFeatures } from './json-stream.js';
import { ogrSequentialFeatures, restoreOgrId, vectorAdapter } from './vector-adapter.js';

export interface BatchProcessingResult { normalizedPath: string; featureCount: number; batchCount: number; bytesWritten: number }
export interface StreamBatchResult { featureCount: number; batchCount: number; bytesSent: number }

async function* normalizedFeatures(input: string, scratch: string, inspection: Inspection, options: Options, execution: RunOptions): AsyncGenerator<string> {
  if (vectorAdapter(input, inspection) === 'ogr-sequential') {
    const fields = inspection.allFields ?? inspection.fields ?? [];
    for await (const raw of ogrSequentialFeatures(input, inspection, options, execution)) {
      yield filterFeature(restoreOgrId(raw, fields.includes('id') && !fields.includes('id2')), options.includeProperties);
    }
    return;
  }
  const direct = (options.sourceCrs ?? inspection.epsg) === 'EPSG:4326';
  for await (const batch of readGeoJsonBatches(input, { batchFeatures: config.vectorBatchFeatures,
    batchBytes: config.vectorBatchMb * 1024 ** 2, maxFeatureBytes: config.vectorMaxFeatureMb * 1024 ** 2, signal: execution.signal })) {
    if (direct) {
      for (const raw of batch.features) { execution.signal?.throwIfAborted(); yield filterFeature(raw, options.includeProperties); }
    } else {
      const batchInput = join(scratch, `batch-${batch.batchIndex}.geojson`);
      const batchOutput = join(scratch, `batch-${batch.batchIndex}.geojsonl`);
      try {
        await writeFile(batchInput, `{"type":"FeatureCollection","features":[${batch.features.join(',')}]}`, { signal: execution.signal });
        const crs = options.sourceCrs ?? inspection.epsg;
        if (!crs) throw new JobError('MISSING_CRS', 'Batch reprojection requires a recognized source CRS.');
        // Only geometry is taken from OGR; source attributes and source IDs
        // are kept as raw JSON. This avoids per-batch schema coercion and FID
        // resets, including mixed types and integers beyond JS safe range.
        await run('ogr2ogr', ['-f', 'GeoJSONSeq', '-s_srs', crs, '-t_srs', 'EPSG:4326', '-dim', '2',
          '-lco', 'RS=NO', '-lco', 'COORDINATE_PRECISION=9', '-lco', 'AUTODETECT_JSON_STRINGS=NO', batchOutput, batchInput], execution);
        let index = 0;
        for await (const { raw } of sequenceFeatures(createReadStream(batchOutput), config.vectorMaxFeatureMb * 1024 ** 2, execution.signal)) {
          const source = batch.features[index++];
          if (source === undefined) throw new JobError('INVALID_OUTPUT', 'GDAL emitted more features than the input batch.');
          const geometry = rawMembers(raw).find(([key]) => key === 'geometry')?.[1];
          if (geometry === undefined) throw new JobError('INVALID_OUTPUT', 'GDAL omitted geometry.');
          yield filterFeature(source, options.includeProperties, geometry);
        }
        if (index !== batch.features.length) throw new JobError('INVALID_OUTPUT', 'GDAL emitted fewer features than the input batch.');
      } finally { await rm(batchInput, { force: true }); await rm(batchOutput, { force: true }); }
    }
  }
}

// Both deliveries share the same normalization and accounting. Native format
// adapters invoke OGR once; public batches count bounded output groups.
export async function streamVectorBatches(input: string, stdin: Writable, scratch: string, inspection: Inspection,
  options: Options, execution: RunOptions, progress: (stage: string, percent: number) => void, stats?: StreamStats): Promise<StreamBatchResult> {
  const counter = stats ?? { bytesSent: 0, featuresSent: 0, peakMemoryBytes: null };
  let batchCount = 0, count = 0, bytes = 0, featureCount = 0, lastUpdate = 0;
  const report = (final = false) => {
    if (!final && Date.now() - lastUpdate < 1000) return;
    lastUpdate = Date.now();
    const estimate = inspection.featureCount ?? 0;
    const total = estimate ? Math.max(batchCount, Math.ceil(estimate / config.vectorBatchFeatures)) : '?';
    progress(`Vector: processed batch ${batchCount}/${total} (${featureCount.toLocaleString()} features)`,
      estimate ? Math.min(40, 10 + Math.round(30 * featureCount / estimate)) : 10);
  };
  progress('Vector: reading bounded vector batches', 10);
  for await (const line of normalizedFeatures(input, scratch, inspection, options, execution)) {
    execution.signal?.throwIfAborted();
    const size = Buffer.byteLength(line);
    if (size > config.vectorBatchMb * 1024 ** 2) throw new JobError('FEATURE_TOO_LARGE', 'Normalized feature exceeds batch byte budget.');
    if (count && (count >= config.vectorBatchFeatures || bytes + size > config.vectorBatchMb * 1024 ** 2)) {
      batchCount++; report(); count = 0; bytes = 0;
    }
    if (!await writeLine(stdin, line, counter)) {
      execution.signal?.throwIfAborted();
      throw new JobError('TOOL_FAILED', 'Consumer closed before all vector features were sent.');
    }
    count++; bytes += size; featureCount++; counter.featuresSent++;
  }
  if (count) batchCount++;
  report(true);
  if (inspection.featureCount !== undefined && inspection.featureCount >= 0 && featureCount !== inspection.featureCount) {
    throw new JobError('INVALID_OUTPUT', `Normalized ${featureCount} features; inspection counted ${inspection.featureCount}.`);
  }
  return { featureCount, batchCount, bytesSent: counter.bytesSent };
}

export async function processVectorBatches(input: string, outputSeq: string, scratch: string, inspection: Inspection,
  options: Options, execution: RunOptions, progress: (stage: string, percent: number) => void): Promise<BatchProcessingResult> {
  const sink = createWriteStream(outputSeq);
  const completion = finished(sink);
  void completion.catch(() => undefined);
  try {
    const result = await streamVectorBatches(input, sink, scratch, inspection, options, execution, progress);
    sink.end(); await completion;
    return { normalizedPath: outputSeq, featureCount: result.featureCount, batchCount: result.batchCount, bytesWritten: result.bytesSent };
  } catch (error) {
    sink.destroy(); await completion.catch(() => undefined); await rm(outputSeq, { force: true }); throw error;
  }
}
