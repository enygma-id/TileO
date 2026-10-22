import type { Job } from './types.js';

// Semantic benchmark: turns raw source/result metadata into judged verdicts
// (ok/warn/info) plus source-vs-result rows. Pure module (no DOM) so unit
// tests can pin the thresholds. All byte thresholds mirror the worker guards:
// 500 KB web tile budget, 200k tippecanoe feature budget, 20k preserve floor.

export type VerdictLevel = 'ok' | 'warn' | 'info';
export interface BenchmarkVerdict { level: VerdictLevel; text: string }
export interface BenchmarkRow { metric: string; source: string; result: string; note?: string }
export interface BenchmarkSection { title: string; rows: BenchmarkRow[] }
export interface BenchmarkReport { title: string; subtitle: string; verdicts: BenchmarkVerdict[]; sections: BenchmarkSection[] }

export const WEB_TILE_BUDGET = 500000;

type Meta = Record<string, unknown>;
type Source = Record<string, unknown>;

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function fmtBytes(value: number): string {
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(2)} GB`;
  if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(1)} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${Math.round(value)} B`;
}

function fmtInt(value: number): string {
  return Math.round(value).toLocaleString();
}

function ratioText(outBytes: number, inBytes: number): string {
  if (!(inBytes > 0)) return '—';
  return `${((outBytes / inBytes) * 100).toFixed(1)}% of input`;
}

function compressionVerdict(outBytes: number, inBytes: number, what: string): BenchmarkVerdict {
  if (!(inBytes > 0) || !(outBytes >= 0)) return { level: 'info', text: `${what} size could not be compared.` };
  const ratio = outBytes / inBytes;
  if (ratio <= 0.2) return { level: 'ok', text: `Excellent compression: ${what} is ${ratioText(outBytes, inBytes)}.` };
  if (ratio <= 0.6) return { level: 'ok', text: `Good compression: ${what} is ${ratioText(outBytes, inBytes)}.` };
  if (ratio <= 1) return { level: 'info', text: `Moderate compression: ${what} is ${ratioText(outBytes, inBytes)}.` };
  return { level: 'warn', text: `Output is larger than the input (${ratioText(outBytes, inBytes)}). Narrow the zoom range or filter attributes.` };
}

function tileHealthVerdict(maxTileBytes: number | null, budget = WEB_TILE_BUDGET): BenchmarkVerdict {
  if (maxTileBytes === null || maxTileBytes <= 0) return { level: 'info', text: 'Largest tile is unknown.' };
  if (maxTileBytes <= budget) return { level: 'ok', text: `Largest tile ${fmtBytes(maxTileBytes)} fits the ${fmtBytes(budget)} web budget.` };
  return { level: 'warn', text: `Largest tile ${fmtBytes(maxTileBytes)} exceeds the ${fmtBytes(budget)} web budget — expect slow loads on that viewport.` };
}

function zoomRow(reqMin: number, reqMax: number, actMin: number | null, actMax: number | null): BenchmarkRow {
  const requested = `Zoom ${reqMin}–${reqMax}`;
  const actual = actMin !== null && actMax !== null ? `Zoom ${actMin}–${actMax}` : '—';
  const note = actMin !== null && actMin > reqMin ? `Empty low zooms ${reqMin}–${actMin - 1} omitted` : undefined;
  return { metric: 'Zoom coverage', source: requested, result: actual, note };
}

function vectorBenchmark(job: Job, meta: Meta, source: Source): BenchmarkReport {
  const o = job.options;
  const featureCount = num(source.featureCount) ?? 0;
  const tileFeatures = num(meta.tileFeatureCount);
  const totalBytes = num(meta.totalTileBytes) ?? 0;
  const maxTile = num(meta.maxTileBytes);
  const minKept = num(meta.minKeptPct);
  const tileCount = num(meta.tileCount);
  const actMin = num(meta.minZoom), actMax = num(meta.maxZoom);
  const plan = (meta.vectorPlan ?? {}) as Meta;
  const fields = Array.isArray(source.fields) ? (source.fields as unknown[]).filter(f => typeof f === 'string') as string[] : [];
  const collisions = Array.isArray(source.fieldCollisions)
    ? (source.fieldCollisions as unknown[]).filter((g): g is string[] => Array.isArray(g) && g.every(n => typeof n === 'string'))
    : [];
  const kept = Array.isArray(o.includeProperties) ? o.includeProperties : null;
  const preset = o.vectorPreset ?? 'density';
  const verdicts: BenchmarkVerdict[] = [compressionVerdict(totalBytes, job.size, 'Vector tiles'), tileHealthVerdict(maxTile)];
  if (tileFeatures !== null && featureCount > 0) {
    if (tileFeatures >= featureCount) verdicts.push({ level: 'ok', text: `All ${fmtInt(featureCount)} features present at zoom ${actMax ?? o.maxZoom}.` });
    else verdicts.push({ level: 'warn', text: `Only ${fmtInt(tileFeatures)} of ${fmtInt(featureCount)} features survive at zoom ${actMax ?? o.maxZoom} — densest tiles exceeded the budget even at full detail.` });
  }
  if (minKept !== null && minKept < 100) {
    verdicts.push(minKept < 10
      ? { level: 'warn', text: `Heavily thinned at low zooms (kept as low as ${minKept}%). Zoom to z13–14 for full parcel detail.` }
      : { level: 'info', text: `Low zooms thinned to ${minKept}% to fit the tile budget. Full detail returns as you zoom in.` });
  }
  if (actMin !== null && actMin > o.minZoom) verdicts.push({ level: 'info', text: `Requested zoom ${o.minZoom} produced no tiles — coverage starts at zoom ${actMin}.` });
  if (preset === 'preserve' && featureCount > 100000) verdicts.push({ level: 'warn', text: 'Preserve keeps every feature at every zoom: output is archival-grade but tiles are large by design.' });
  if (kept !== null) {
    verdicts.push(kept.length === 0
      ? { level: 'info', text: 'Pure-geometry output: all attributes excluded.' }
      : { level: 'ok', text: `Attribute filter keeps ${kept.length} of ${fields.length || 'all'} columns (${kept.slice(0, 5).join(', ')}${kept.length > 5 ? ', …' : ''}).` });
  }
  if (String((source.geometryType ?? '')).toLowerCase().includes('point') && preset === 'density') {
    verdicts.push({ level: 'info', text: 'Point layer clustered instead of dropped — no dot silently vanishes.' });
  }
  const sections: BenchmarkSection[] = [
    {
      title: 'Input vs output',
      rows: [
        { metric: 'Dataset size', source: fmtBytes(job.size), result: totalBytes > 0 ? fmtBytes(totalBytes) : '—', note: ratioText(totalBytes, job.size) },
        { metric: 'Features', source: featureCount > 0 ? fmtInt(featureCount) : '—', result: tileFeatures !== null ? fmtInt(tileFeatures) : '—', note: 'at maximum zoom' },
        { metric: 'Attributes', source: fields.length ? `${fields.length} columns` : '—', result: kept === null ? 'all kept' : kept.length === 0 ? 'none (pure geometry)' : `${kept.length} kept`, note: collisions.length ? `${collisions.map(group => group.join(' ↔ ')).join('; ')} differ only by case (both preserved)` : undefined },
        { metric: 'Tiles', source: '—', result: tileCount !== null ? fmtInt(tileCount) : '—' },
        zoomRow(o.minZoom, o.maxZoom, actMin, actMax),
      ],
    },
    {
      title: 'Effective parameters',
      rows: [
        { metric: 'Detail policy', source: `preset: ${preset}`, result: `engine: ${o.vectorEngine ?? 'auto'}` },
        { metric: 'Tile detail', source: `full ${plan.detail ?? '—'}`, result: `low ${plan.lowDetail ?? '—'} / min ${plan.minimumDetail ?? '—'}`, note: 'quantization grid' },
        { metric: 'Tile budget', source: `≤ ${fmtBytes(num(o.maxTileBytes) ?? 500000)}`, result: `≤ ${fmtInt(num(o.maxTileFeatures) ?? 200000)} features` },
        { metric: 'Layer', source: String(source.layer ?? (o.layer ?? '—')), result: String(plan.geometry ?? '—'), note: 'geometry family' },
      ],
    },
  ];
  return {
    title: 'Vector benchmark',
    subtitle: `${job.filename} · source vs MVT result`,
    verdicts,
    sections,
  };
}

function rasterBenchmark(job: Job, meta: Meta, source: Source): BenchmarkReport {
  const o = job.options;
  const totalBytes = num(meta.totalTileBytes) ?? 0;
  const maxTile = num(meta.maxTileBytes);
  const avgTile = num(meta.avgTileBytes);
  const tileCount = num(meta.tileCount);
  const nativeZoom = num(source.nativeZoom);
  const width = num(source.width), height = num(source.height), bands = num(source.bands);
  const verdicts: BenchmarkVerdict[] = [compressionVerdict(totalBytes, job.size, 'Raster tiles'), tileHealthVerdict(maxTile)];
  if (nativeZoom !== null) {
    if (o.maxZoom > nativeZoom) verdicts.push({ level: 'warn', text: `Max zoom ${o.maxZoom} is ${o.maxZoom - nativeZoom} level(s) above native zoom ${nativeZoom} — overzoomed tiles add ~4× tiles per level with no new detail.` });
    else if (o.maxZoom === nativeZoom) verdicts.push({ level: 'ok', text: `Max zoom matches native resolution (z${nativeZoom}).` });
    else verdicts.push({ level: 'info', text: `Max zoom ${o.maxZoom} is below native zoom ${nativeZoom} — finest source detail is left unused.` });
  }
  if ((o.tileFormat === 'webp' || o.tileFormat === 'jpeg') && o.quality === 100) {
    verdicts.push({ level: 'warn', text: 'Quality 100 activates lossless mode: output is 2–3× larger with no visible gain over 75–80.' });
  }
  if (avgTile !== null && avgTile > 0) verdicts.push({ level: 'info', text: `Average tile ${fmtBytes(avgTile)} across ${tileCount !== null ? fmtInt(tileCount) : '—'} tiles.` });
  return {
    title: 'Raster benchmark',
    subtitle: `${job.filename} · source vs ${String(meta.format ?? o.tileFormat).toUpperCase()} tiles`,
    verdicts,
    sections: [
      {
        title: 'Input vs output',
        rows: [
          { metric: 'Dataset size', source: fmtBytes(job.size), result: totalBytes > 0 ? fmtBytes(totalBytes) : '—', note: ratioText(totalBytes, job.size) },
          { metric: 'Dimensions', source: width !== null && height !== null ? `${fmtInt(width)} × ${fmtInt(height)} px${bands !== null ? ` · ${bands} band(s)` : ''}` : '—', result: tileCount !== null ? `${fmtInt(tileCount)} tiles` : '—' },
          zoomRow(o.minZoom, o.maxZoom, num(meta.minZoom), num(meta.maxZoom)),
        ],
      },
      {
        title: 'Effective parameters',
        rows: [
          { metric: 'Tile format', source: String(o.tileFormat), result: `quality ${o.quality}`, note: o.tileFormat === 'png' ? 'lossless' : undefined },
          { metric: 'Native zoom', source: nativeZoom !== null ? `z${nativeZoom}` : 'unknown', result: `requested z${o.minZoom}–${o.maxZoom}` },
        ],
      },
    ],
  };
}

function elevationBenchmark(job: Job, meta: Meta, source: Source): BenchmarkReport {
  const o = job.options;
  const cogBytes = num(meta.cogBytes) ?? 0;
  const totalBytes = num(meta.totalTileBytes) ?? 0;
  const tileCount = num(meta.tileCount);
  const encoding = String(meta.encoding ?? o.elevationOutput ?? 'cog');
  const missing = num(meta.syntheticNoDataPixels) ?? 0;
  const verdicts: BenchmarkVerdict[] = [
    { level: 'ok', text: 'COG full-resolution pixel bytes and metadata were bit-for-bit verified against the source.' },
    compressionVerdict(cogBytes, job.size, 'COG'),
  ];
  if (o.elevationOutput === 'terrain-rgb' || o.elevationOutput === 'terrarium') {
    verdicts.push({
      level: 'info',
      text: o.elevationOutput === 'terrarium'
        ? 'Terrarium encodes losslessly at 1/256 m steps (−32768 to 32767.996 m).'
        : 'Terrain-RGB encodes at 0.1 m steps (≤0.05 m rounding on resampled heights).',
    });
    if (missing > 0) verdicts.push({ level: 'info', text: `${fmtInt(missing)} missing pixels filled with the display height for rendering only — the COG keeps original NoData.` });
    if (tileCount !== null) verdicts.push(tileHealthVerdict(num(meta.maxTileBytes)));
  }
  const cog = (meta.cog ?? {}) as Meta;
  const rows: BenchmarkRow[] = [
    { metric: 'Dataset size', source: fmtBytes(job.size), result: cogBytes > 0 ? fmtBytes(cogBytes) : '—', note: `COG ${ratioText(cogBytes, job.size)}` },
    { metric: 'Grid', source: `${num(source.width) !== null ? fmtInt(num(source.width) as number) : '?'} × ${num(source.height) !== null ? fmtInt(num(source.height) as number) : '?'} px · ${String(source.dataType ?? '?')}`, result: encoding },
  ];
  if (tileCount !== null) {
    rows.push({ metric: 'Terrain tiles', source: '—', result: fmtInt(tileCount) });
    rows.push(zoomRow(o.minZoom, o.maxZoom, num(meta.minZoom), num(meta.maxZoom)));
  }
  return {
    title: 'Elevation benchmark',
    subtitle: `${job.filename} · ${String(o.elevationKind ?? 'dem').toUpperCase()} ${String(o.elevationOutput ?? 'cog')}`,
    verdicts,
    sections: [
      { title: 'Input vs output', rows },
      {
        title: 'Effective parameters',
        rows: [
          { metric: 'Surface / output', source: String(o.elevationKind ?? 'dem'), result: String(o.elevationOutput ?? 'cog') },
          { metric: 'Units / reference', source: String(o.elevationUnit ?? 'unknown'), result: String(o.heightReference ?? 'unknown') },
        ],
      },
    ],
  };
}

function model3dBenchmark(job: Job, meta: Meta): BenchmarkReport {
  const triangles = num(meta.triangles) ?? 0;
  const primitives = num(meta.primitives);
  const tiles = num(meta.tiles) ?? 0;
  const lod = num(meta.lodLevels) ?? 0;
  const strategy = String(meta.strategy ?? '—');
  const verdicts: BenchmarkVerdict[] = [];
  if (lod >= 3) verdicts.push({ level: 'ok', text: `${lod} LOD levels with ${strategy} tiling — smooth progressive streaming.` });
  else if (lod === 2) verdicts.push({ level: 'info', text: '2 LOD levels: root overview plus full-detail children.' });
  else if (tiles <= 1 && triangles > 200000) verdicts.push({ level: 'warn', text: `Large indivisible mesh (${fmtInt(triangles)} triangles) in a single tile — split it into mesh nodes for spatial tiling.` });
  else verdicts.push({ level: 'ok', text: 'Small model in a single tile — optimal, no subdivision overhead.' });
  if (tiles > 1) verdicts.push({ level: 'ok', text: `${fmtInt(tiles)} spatial tiles keep each download small.` });
  return {
    title: '3D Tiles benchmark',
    subtitle: `${job.filename} · source GLB vs 3D Tiles 1.1`,
    verdicts,
    sections: [
      {
        title: 'Input vs output',
        rows: [
          { metric: 'Dataset size', source: fmtBytes(job.size), result: tiles > 0 ? `${fmtInt(tiles)} tile(s)` : '—' },
          { metric: 'Geometry', source: triangles > 0 ? `${fmtInt(triangles)} triangles${primitives !== null ? ` · ${fmtInt(primitives)} primitive(s)` : ''}` : '—', result: `${lod} LOD level(s) · ${strategy}` },
        ],
      },
      {
        title: 'Placement',
        rows: [
          { metric: 'WGS84 position', source: 'GLB local units', result: `${num(meta.latitude) ?? '—'}, ${num(meta.longitude) ?? '—'} · ${num(meta.height) ?? '—'} m ellipsoid` },
          { metric: 'Orientation', source: '—', result: `heading ${num(meta.heading) ?? 0}° · pitch ${num(meta.pitch) ?? 0}° · roll ${num(meta.roll) ?? 0}° · scale ${num(meta.scale) ?? 1}` },
        ],
      },
    ],
  };
}

export function benchmarkReport(job: Job): BenchmarkReport {
  const meta = (job.metadata ?? {}) as Meta;
  const source = ((meta.source ?? {}) as Meta);
  const kind = String(meta.kind ?? '');
  if (kind === 'vector') return vectorBenchmark(job, meta, source);
  if (kind === 'elevation') return elevationBenchmark(job, meta, source);
  if (kind === 'model3d') return model3dBenchmark(job, meta);
  if (kind === 'raster') return rasterBenchmark(job, meta, source);
  return {
    title: 'Benchmark',
    subtitle: job.filename,
    verdicts: [{ level: 'info', text: 'No completed result metadata to benchmark yet.' }],
    sections: [],
  };
}
