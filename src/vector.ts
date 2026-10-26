import { extname, join } from 'node:path';
import { createReadStream, createWriteStream } from 'node:fs';
import { rename, rm } from 'node:fs/promises';
import { once } from 'node:events';
import { createInterface } from 'node:readline';
import { run, type RunOptions } from './process.js';
import { runWithStdin } from './pipeline.js';
import { tilesAtZoom, type Inspection } from './inspect.js';
import { JobError, type Options } from './types.js';
import { config } from './config.js';
import { processVectorBatches, streamVectorBatches, type StreamBatchResult } from './vector-batch.js';
import { vectorAdapter } from './vector-adapter.js';
import { writeVectorMbtiles } from './vector-mvt.js';

export const DENSITY_DEFAULTS = { maxTileBytes: 500000, maxTileFeatures: 200000 } as const;
// Sparse layers can afford roomier tiles so tippecanoe never thins data that
// would have fit anyway. Dense layers keep the strict 500 KB web budget.
export const SPARSE_FEATURE_THRESHOLD = 5000;
export const SPARSE_TILE_BYTES = 1000000;
export const SPARSE_TILE_FEATURES = 500000;
// Preserve with a dense layer starting at world-view zooms produces multi-MB
// tiles (or drops almost everything under density). The worker derives the
// actual floor from the layer extent via suggestPreserveFloor; this constant is
// only the fallback when the extent is unknown.
export const DENSE_FEATURE_THRESHOLD = 100000;
export const DENSE_MIN_ZOOM_FLOOR = 10;
// Copies estimate does not predict encoded bytes, but it catches pathological
// requests (e.g. 500k features x 15 zooms) before burning scratch/disk.
export function estimatedVectorCopies(featureCount: number, minZoom: number, maxZoom: number) {
  if (!Number.isFinite(featureCount) || featureCount < 0) return 0;
  return Math.round(featureCount * (Math.max(0, maxZoom - minZoom) + 1));
}

export type VectorGeometryKind = 'point' | 'line' | 'polygon';
// Normalizes ogrinfo geometry types ("Point", "MultiPolygon", "Line String", …)
// into the three families tippecanoe treats differently. Unknown defaults to
// polygon: the safest family (drop-densest never merges parcel boundaries).
export function classifyGeometry(geometryType?: string): VectorGeometryKind {
  const t = (geometryType ?? '').toLowerCase();
  if (t.includes('point')) return 'point';
  if (t.includes('line') || t.includes('curve') || t.includes('string')) return 'line';
  return 'polygon';
}

export interface VectorPlan {
  detail: number; lowDetail: number; minimumDetail: number;
  dropArgs: string[]; tinyArgs: string[];
  maxTileBytes: number; maxTileFeatures: number;
  geometry: VectorGeometryKind; densityTier: 'sparse' | 'medium' | 'dense' | 'veryDense';
  avgPerTileAtMin: number | null;
  warnings: string[];
}

// Dynamic plan resolver: adapts tippecanoe detail, thinning strategy and tile
// budgets to the inspected layer instead of using one static recipe.
// - geometry: points cluster (merge nearby dots), lines/polygons drop-densest.
// - tier: sparse layers get roomier budgets so nothing is thinned needlessly.
// - span: wide zoom ranges get a coarser low-detail so low zooms stay small.
// Explicit user overrides (maxTileBytes/Features) always win over the plan.
export function resolveVectorPlan(inspection: Inspection, options: Options): VectorPlan {
  const preserve = options.vectorPreset === 'preserve';
  const geometry = classifyGeometry((inspection as { geometryType?: string }).geometryType);
  const featureCount = inspection.featureCount ?? 0;
  // Unknown counts (unit calls without inspection) resolve to medium/strict so
  // loose sparse budgets are only granted on measured small layers.
  const densityTier = !(featureCount > 0) ? 'medium' : featureCount < SPARSE_FEATURE_THRESHOLD ? 'sparse' : featureCount <= DENSE_FEATURE_THRESHOLD ? 'medium' : featureCount <= 500000 ? 'dense' : 'veryDense';
  const span = Math.max(0, options.maxZoom - options.minZoom);
  // Tippecanoe's internal coordinates have 32 bits, regardless of tile extent.
  // Cap at 14 (≈15 cm grid at z14): detail 16 (≈37 mm at z14) doubles tile
  // bytes for cadastral parcels without adding survey accuracy.
  const detail = Math.min(14, 32 - options.maxZoom);
  // Wide spans duplicate every feature across many zooms: coarsen low zooms
  // one extra step so z-min tiles stay shippable. Narrow spans keep full shape.
  const lowDetail = preserve ? (span > 8 ? Math.min(14, detail) : detail) : span > 8 ? 10 : 12;
  const minimumDetail = preserve ? detail : Math.min(lowDetail, detail);
  const maxTileBytes = options.maxTileBytes ?? (densityTier === 'sparse' ? SPARSE_TILE_BYTES : DENSITY_DEFAULTS.maxTileBytes);
  const maxTileFeatures = options.maxTileFeatures ?? (densityTier === 'sparse' ? SPARSE_TILE_FEATURES : DENSITY_DEFAULTS.maxTileFeatures);
  const bounds = inspection.bounds as [number, number, number, number] | undefined;
  let avgPerTileAtMin: number | null = null;
  if (bounds && featureCount > 0 && options.minZoom >= 0 && options.minZoom <= 22) {
    try {
      const tiles = tilesAtZoom(bounds, options.minZoom);
      if (Number.isFinite(tiles) && tiles > 0) avgPerTileAtMin = featureCount / tiles;
    } catch { /* budgeting is best-effort; tiling still enforces real limits */ }
  }
  const warnings: string[] = [];
  let dropArgs: string[];
  if (preserve) {
    dropArgs = ['-r1'];
  } else if (geometry === 'point') {
    // Points have no shared borders to detect and no lines to simplify:
    // clustering merges nearby dots into one countable feature instead of
    // silently discarding them. simplify-only-low-zooms is a no-op for dots
    // but harmless and keeps the recipe uniform.
    dropArgs = ['--cluster-densest-as-needed', '--simplify-only-low-zooms'];
  } else {
    dropArgs = ['--drop-densest-as-needed', '--simplify-only-low-zooms'];
  }
  // Tiny-polygon reduction only matters for polygons; at max zoom it is always
  // off so no parcel vanishes from its most detailed tile.
  const tinyArgs = preserve
    ? ['--no-tiny-polygon-reduction', '--no-line-simplification']
    : ['--no-tiny-polygon-reduction-at-maximum-zoom'];
  if (!preserve && densityTier === 'veryDense' && span > 6) {
    warnings.push(`Very dense layer (${featureCount.toLocaleString()} features over ${span + 1} zooms): low zooms will be heavily thinned. Raise minZoom or filter attributes.`);
  }
  return { detail, lowDetail, minimumDetail, dropArgs, tinyArgs, maxTileBytes, maxTileFeatures, geometry, densityTier, avgPerTileAtMin, warnings };
}

// Parses tippecanoe "Going to try keeping the sparsest X% ..." lines so the
// worker can report how aggressively density thinned low zooms. Returns the
// minimum kept fraction seen, or null when no thinning was logged.
export function summarizeTippecanoeDrop(logText: string): { minKeptPct: number | null; samples: number } {
  let min: number | null = null, samples = 0;
  for (const match of logText.matchAll(/keeping the sparsest\s+([\d.]+)%/g)) {
    const v = Number(match[1]);
    if (Number.isFinite(v) && v >= 0 && v <= 100) {
      samples++;
      min = min === null ? v : Math.min(min, v);
    }
  }
  return { minKeptPct: min, samples };
}

// Dynamic preserve floor: the smallest minZoom whose average features per tile
// fits the per-tile budget. Extent-aware: a national 150k-feature layer has
// hundreds of z10 tiles (safe from low zooms), while 388k parcels in one city
// have 3 z10 tiles (floor ~13). Falls back to DENSE_MIN_ZOOM_FLOOR without an
// extent. Budget is bytes-driven (≈1 KB per encoded parcel with attributes),
// deliberately far below maxTileFeatures (200k): 25k parcels already make a
// multi-MB tile at detail 14.
export const PRESERVE_PER_TILE_BUDGET = 20000;
export function suggestPreserveFloor(featureCount: number, bounds: [number, number, number, number] | undefined, maxZoom: number, perTile = PRESERVE_PER_TILE_BUDGET): number {
  if (!Number.isFinite(featureCount) || featureCount <= DENSE_FEATURE_THRESHOLD) return 0;
  if (!bounds || !Number.isFinite(maxZoom)) return DENSE_MIN_ZOOM_FLOOR;
  const top = Math.max(0, Math.min(22, Math.floor(maxZoom)));
  for (let z = 0; z <= top; z++) {
    try {
      const tiles = tilesAtZoom(bounds, z);
      if (Number.isFinite(tiles) && tiles > 0 && featureCount / tiles <= perTile) return z;
    } catch { break; }
  }
  return Math.min(top, DENSE_MIN_ZOOM_FLOOR);
}

// Formats tippecanoe reads natively, without any GDAL conversion.
const TIPPECANOE_NATIVE_EXTS = new Set(['.geojson', '.json', '.geojsonl']);

export interface NormalizationPlan { mode: 'direct' | 'ogr'; restoreId: boolean; warnings: string[] }

// Decides how source attributes reach tippecanoe with exact names.
// Proven GDAL 3.12 behavior: the GeoJSONSeq writer unconditionally reserves the
// field name "id" for FID round-tripping and renames a colliding property to
// "id2" ("Warning 1: Field 'id' already exists. Renaming it as 'id2'").
// -unsetFid does NOT prevent it. Uppercase ID is untouched (case-sensitive).
// Strategy: skip the GDAL rewrite entirely when it would be a no-op
// (WGS84 GeoJSON-family input); otherwise rewrite, then transparently restore
// the exact name. A source that already contains id2 is ambiguous, so the job
// fails fast instead of silently merging two columns.
export function planVectorNormalization(inspection: Inspection, options: Options, inputPath: string): NormalizationPlan {
  const fields = inspection.allFields ?? inspection.fields ?? [];
  if (!fields.includes('id')) return { mode: 'ogr', restoreId: false, warnings: [] };
  // Restoring is safe whenever the source has no literal id2: every id2 in
  // normalized output is then provably OGR's rename. It also covers the GDAL
  // fallback path, which always normalizes.
  const restoreId = !fields.includes('id2');
  const directFeasible = TIPPECANOE_NATIVE_EXTS.has(extname(inputPath).toLowerCase())
    && (options.sourceCrs ?? inspection.epsg ?? null) === 'EPSG:4326';
  if (directFeasible) {
    return {
      mode: 'direct',
      restoreId,
      warnings: ['Source fed directly to Tippecanoe: attribute "id" is preserved exactly (the GDAL rewrite would rename it to "id2"). Tippecanoe quantizes coordinates to the tile grid either way, so output geometry is unchanged.'],
    };
  }
  if (!restoreId) {
    throw new JobError('INVALID_OPTIONS', 'Attributes "id" and "id2" coexist: the GDAL normalization step renames property "id" to "id2", which would silently merge two columns. Rename one of them in the source and retry.');
  }
  return {
    mode: 'ogr',
    restoreId,
    warnings: ['GDAL renames property "id" to "id2" during normalization; Tileo restores the exact name before tiling.'],
  };
}

// Repairs the OGR rename above on normalized GeoJSONSeq: renames property id2
// back to id, but ONLY on lines that have id2 and no id. Lines that already
// carry both (or neither) are left byte-identical, and malformed lines pass
// through for tippecanoe to report. Key order is preserved. Returns how many
// features were restored.
export async function restoreIdProperty(path: string, signal?: AbortSignal): Promise<number> {
  const tmp = `${path}.restore`;
  const input = createReadStream(path);
  const output = createWriteStream(tmp);
  let restored = 0;
  const cleanup = async () => { input.destroy(); output.destroy(); await rm(tmp, { force: true }); };
  try {
    const lines = createInterface({ input, crlfDelay: Infinity });
    for await (const line of lines) {
      signal?.throwIfAborted();
      let out = line;
      if (line.includes('"id2"')) {
        try {
          const feature = JSON.parse(line) as { properties?: Record<string, unknown> };
          const props = feature?.properties;
          if (props && typeof props === 'object' && 'id2' in props && !('id' in props)) {
            const fixed: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(props)) fixed[key === 'id2' ? 'id' : key] = value;
            feature.properties = fixed;
            restored++;
            out = JSON.stringify(feature);
          }
        } catch { /* leave byte-identical; tippecanoe reports it */ }
      }
      if (!output.write(out + '\n')) await once(output, 'drain');
    }
    output.end();
    await once(output, 'finish');
  } catch (error) {
    await cleanup();
    throw error;
  }
  await rename(tmp, path);
  return restored;
}

export function tippecanoeArgs(output: string, scratch: string, options: Options, inspection?: Inspection) {
  const plan = resolveVectorPlan(inspection ?? { kind: 'vector', crs: null } as Inspection, options);
  const preserve = options.vectorPreset === 'preserve';
  const attributes: string[] =
    options.includeProperties !== undefined && options.includeProperties !== null
      ? options.includeProperties.length > 0
        ? options.includeProperties.flatMap(name => ['--include', name])
        : ['--exclude-all']
      : [];
  return [
    '-o', output, '-Z', String(options.minZoom), '-z', String(options.maxZoom),
    '-l', 'features', '-P', '--no-progress-indicator', '--temporary-directory', scratch,
    `--full-detail=${plan.detail}`, `--low-detail=${plan.lowDetail}`,
    `--minimum-detail=${plan.minimumDetail}`,
    '--detect-shared-borders',
    ...(preserve
      // Preserve keeps -r1 (no drop rate) but honors an explicit cap when the
      // caller sets one; otherwise it stays unlimited and the worker guard
      // (dynamic preserve floor) is the safety net.
      ? (options.maxTileBytes != null || options.maxTileFeatures != null
        ? [`--maximum-tile-bytes=${plan.maxTileBytes}`, `--maximum-tile-features=${plan.maxTileFeatures}`, ...plan.dropArgs, ...plan.tinyArgs]
        : [...plan.dropArgs, '--no-tile-size-limit', '--no-feature-limit', ...plan.tinyArgs])
      : [`--maximum-tile-bytes=${plan.maxTileBytes}`, `--maximum-tile-features=${plan.maxTileFeatures}`, ...plan.dropArgs, ...plan.tinyArgs]),
    ...attributes,
  ];
}

export function tippecanoeStreamArgs(output: string, scratch: string, options: Options, inspection?: Inspection) {
  // Streaming delivery: identical budgets/plan to file mode, but stdin is the
  // input (no file operand) and -P is omitted. Vendored main.cpp shows the
  // -P stream path stages a read.XXXXXXXX temp file; without -P Tippecanoe
  // still needs internal temp storage, which stays on the job scratch volume
  // via --temporary-directory (never Docker /tmp tmpfs, only 128 MiB).
  return tippecanoeArgs(output, scratch, options, inspection).filter(arg => arg !== '-P');
}

export interface VectorBatchSnapshot {
  mode: 'off' | 'auto' | 'on';
  delivery: 'file' | 'stream';
}

// Tahap 3: the worker snapshots batch policy once at attempt start and passes
// it via RunOptions; inspect/vector honor the snapshot so a config change can
// never switch mode or delivery mid-attempt. Rollback = restart with
// TILEO_VECTOR_BATCH_MODE=off; it takes effect on the next attempt.
export function snapshotBatchConfig(execution?: RunOptions): VectorBatchSnapshot {
  return {
    mode: execution?.batchMode ?? config.vectorBatchMode,
    delivery: execution?.batchDelivery ?? config.vectorBatchDelivery,
  };
}

// Per-attempt batch summary stored in job metadata (Tahap 3 observability):
// policy snapshot, what actually ran, counts, normalized bytes, stage
// durations, pipeline memory peak, and the fallback reason when one applied.
export interface VectorBatchSummary extends VectorBatchSnapshot {
  active: boolean;
  stream: boolean;
  normalization: 'direct' | 'ogr' | null;
  featureCount: number | null;
  batchCount: number | null;
  bytesNormalized: number | null;
  fallback: string | null;
  normalizeMs: number;
  tileMs: number;
  peakMemoryBytes: number | null;
}

export async function vector(input: string, output: string, scratch: string, inspection: Inspection, options: Options, execution: RunOptions, progress: (stage: string, percent: number) => void): Promise<VectorBatchSummary> {
  const engine = options.vectorEngine ?? 'auto';
  if (engine === 'gdal' && options.vectorPreset === 'preserve') {
    throw new JobError('INVALID_OPTIONS', 'Preserve requires Tippecanoe; GDAL can reduce precision or discard features in oversized tiles. Use Tippecanoe or select Density.');
  }
  const batchCfg = snapshotBatchConfig(execution);
  const summary: VectorBatchSummary = {
    ...batchCfg, active: false, stream: false, normalization: null,
    featureCount: inspection.featureCount ?? null, batchCount: null, bytesNormalized: null,
    fallback: null, normalizeMs: 0, tileMs: 0, peakMemoryBytes: null,
  };
  const normalized = join(scratch, 'features.geojsonl');
  const adapter = vectorAdapter(input, inspection);
  const useBatch = batchCfg.mode !== 'off' && adapter !== 'legacy';
  if (batchCfg.mode === 'on' && !useBatch) throw new JobError('UNSUPPORTED_INPUT', 'Strict batch mode requires a qualified vector adapter.');
  const normalization = useBatch && adapter === 'geojson'
    ? { mode: (options.sourceCrs ?? inspection.epsg) === 'EPSG:4326' ? 'direct' as const : 'ogr' as const, restoreId: false, warnings: [] }
    : planVectorNormalization(inspection, options, input);
  if (batchCfg.mode !== 'off' && !useBatch) summary.fallback = `legacy:unqualified-driver:${inspection.driver ?? extname(input)}`;
  summary.normalization = normalization.mode;
  for (const warning of normalization.warnings) progress(`Vector: ${warning}`, 5);
  // -dim 2 flattens Z/M coordinates up front: vector tiles are 2D only, and this
  // silences Tippecanoe's "ignoring dimensions beyond two" warnings per feature.
  // COORDINATE_PRECISION=9 (≈0.11 mm at the equator) is far below survey/CRS
  // accuracy and cuts GeoJSONL bytes ~30% vs 15 decimals; tippecanoe detail
  // quantization dominates final precision anyway.
  const args = ['-f', 'GeoJSONSeq', '-t_srs', 'EPSG:4326', '-dim', '2', '-lco', 'RS=NO', '-lco', 'COORDINATE_PRECISION=9', '-lco', 'AUTODETECT_JSON_STRINGS=NO'];
  if (options.sourceCrs) args.push('-s_srs', options.sourceCrs);
  // Push attribute filtering down to GDAL so the scratch GeoJSONL never
  // carries dropped columns. Empty array means pure geometry: skip -select
  // (GDAL rejects -select '') and let tippecanoe --exclude-all drop them.
  if (options.includeProperties !== undefined && options.includeProperties !== null && options.includeProperties.length > 0) {
    args.push('-select', options.includeProperties.join(','));
  }
  let normalizedReady = false;

  async function ensureNormalized(): Promise<string> {
    if (normalizedReady) return normalized;
    const started = Date.now();
    try {
      if (useBatch) {
        const batched = await processVectorBatches(input, normalized, scratch, inspection, options, execution, progress);
        summary.active = true;
        summary.stream = false;
        summary.normalization = normalization.mode;
        summary.featureCount = batched.featureCount;
        summary.batchCount = batched.batchCount;
        summary.bytesNormalized = batched.bytesWritten;
      } else {
        progress('Vector: normalizing coordinates with GDAL', 10);
        await run('ogr2ogr', [...args, normalized, input, inspection.layer!], execution);
        if (normalization.restoreId) {
          progress('Vector: restoring exact "id" attribute names', 30);
          const restored = await restoreIdProperty(normalized, execution.signal);
          progress(`Vector: restored ${restored.toLocaleString()} exact "id" attributes`, 35);
        }
      }
    } finally {
      summary.normalizeMs += Date.now() - started;
    }
    normalizedReady = true;
    return normalized;
  }

  async function runGdalVector() {
    const file = await ensureNormalized();
    const started = Date.now();
    try {
      // GDAL's MBTiles vector writer requires GEOS (copyleft), which is not in
      // the permissive runtime. Normalize with GDAL, then write MVT tiles with
      // the permissive Node writer. Budgets match the Tippecanoe plan so the
      // fallback thins instead of silently allowing oversized tiles.
      const plan = resolveVectorPlan(inspection, options);
      const stats = await writeVectorMbtiles(file, output, options, plan, execution, progress);
      if (summary.featureCount === null) summary.featureCount = stats.featureCount;
      if (stats.droppedFeatureIds > 0) progress(`Vector: ${stats.droppedFeatureIds.toLocaleString()} non-numeric feature ids were not encodable in MVT`, 84);
      if (stats.oversizedTiles > 0) progress(`Vector: ${stats.oversizedTiles.toLocaleString()} single-feature tiles exceed the byte budget`, 84);
      progress('Vector: tiles generated with permissive MVT writer', 85);
    } finally {
      summary.tileMs += Date.now() - started;
    }
  }

  async function runTippecanoe() {
    const started = Date.now();
    const normalizeBefore = summary.normalizeMs;
    try {
      const plan = resolveVectorPlan(inspection, options);
      for (const warning of plan.warnings) progress(`Vector: ${warning}`, 45);
      // Tahap 2 streaming: single Tippecanoe with stdin as its only input.
      // No full-dataset intermediate GeoJSONSeq is created; batches are
      // normalized then piped sequentially and cleaned before the next batch.
      // Output and --temporary-directory both stay on the job scratch volume.
      const useStream = useBatch && batchCfg.delivery === 'stream' && engine !== 'gdal';
      if (useStream) {
        progress('Vector: streaming normalized batches to Tippecanoe', 20);
        let streamed: StreamBatchResult | undefined;
        const stats = await runWithStdin(
          'tippecanoe',
          tippecanoeStreamArgs(output, scratch, options, inspection),
          async (stdin, streamStats, signal) => {
            const producerStarted = Date.now();
            try {
              streamed = await streamVectorBatches(input, stdin, scratch, inspection, options, { ...execution, signal, memoryRootPid: process.pid }, progress, streamStats);
            } finally { summary.normalizeMs += Date.now() - producerStarted; }
          },
          execution,
        );
        summary.active = true;
        summary.stream = true;
        summary.normalization = normalization.mode;
        summary.featureCount = streamed?.featureCount ?? stats.featuresSent;
        summary.batchCount = streamed?.batchCount ?? null;
        summary.bytesNormalized = stats.bytesSent;
        summary.peakMemoryBytes = stats.peakMemoryBytes;
        progress(`Vector: streamed ${stats.featuresSent.toLocaleString()} features to Tippecanoe`, 60);
        progress('Vector: tiles generated with Tippecanoe', 85);
        return;
      }
      // Direct mode skips the GDAL rewrite (a no-op for WGS84 GeoJSON input) so
      // exact attribute names survive; tippecanoe quantizes to the tile grid
      // either way. The GDAL fallback below still normalizes on demand.
      const direct = !useBatch && normalization.mode === 'direct' && engine !== 'gdal';
      if (direct) progress('Vector: feeding source directly to Tippecanoe (exact attribute names preserved)', 20);
      const file = direct ? input : await ensureNormalized();
      progress('Vector: generating tiles with Tippecanoe', 45);
      await run('tippecanoe', [...tippecanoeArgs(output, scratch, options, inspection), file], execution);
      progress('Vector: tiles generated with Tippecanoe', 85);
    } finally {
      // Stream producer/consumer overlap. File delivery excludes normalization
      // from tile time; stream tile time is the complete consumer lifetime.
      summary.tileMs += Date.now() - started - (summary.stream ? 0 : summary.normalizeMs - normalizeBefore);
    }
  }

  if (engine === 'gdal') {
    await runGdalVector();
    return summary;
  }

  if (engine === 'tippecanoe') {
    await runTippecanoe();
    return summary;
  }

  // A failed conversion must remain visible; only Density tolerates a missing engine.
  try {
    await runTippecanoe();
  } catch (error) {
    if (error instanceof JobError && error.code === 'TOOL_MISSING' && error.message.startsWith('Cannot start tippecanoe:') && options.vectorPreset === 'density') {
      summary.fallback = 'gdal:tippecanoe-missing';
      progress('Vector: adapting to GDAL vector tiling engine...', 50);
      await runGdalVector();
      return summary;
    }
    throw error;
  }
  return summary;
}
