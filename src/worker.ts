import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, open, readdir, writeFile, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { config, initializeData } from './config.js';
import { Jobs } from './jobs.js';
import { inspect, suggestMaxZoom } from './inspect.js';
import { raster } from './raster.js';
import { vector, summarizeTippecanoeDrop, estimatedVectorCopies, resolveVectorPlan, suggestPreserveFloor, DENSE_FEATURE_THRESHOLD, PRESERVE_PER_TILE_BUDGET, type VectorBatchSummary } from './vector.js';
import { validate } from './validate.js';
import { run } from './process.js';
import { exportPmtiles } from './pmtiles.js';
import { buildElevation, buildScientific } from './elevation.js';
import { doctor } from './doctor.js';
import { checkDisk, directoryBytes } from './resources.js';
import { JobError, type Job } from './types.js';
import { assertS3SourceUnchanged, assertUrlSourceUnchanged, s3GdalInput, stageS3Object, stageUrlObject, urlGdalInput, type SealedCredentialLoader } from './storage.js';

initializeData();
const jobs = new Jobs(), owner = randomUUID();
// The worker resolves sealed BYOC credentials from the same database the API
// wrote them to (cross-process safe; the memory vault is process-local).
const sealedLoader: SealedCredentialLoader = id => jobs.getStorageCredential(id) ?? null;
jobs.acquire(owner);
let stopping = false, active: AbortController | undefined;
function shutdown() { stopping = true; active?.abort(new JobError('WORKER_INTERRUPTED', 'Worker shutdown interrupted this attempt. Retry to start again.')); }
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
const heartbeat = setInterval(() => {
  try { jobs.heartbeat(owner); } catch (error) { active?.abort(error); stopping = true; }
}, 5000);

async function execute(job: Job) {
  const scratch = join(config.data, 'scratch', `${job.id}-${job.attempt}`);
  const model3d = job.input.endsWith('.glb');
  const elevation = job.options.pipeline === 'elevation';
  const scientific = job.options.pipeline === 'scientific';
  const directoryOutput = model3d || elevation || scientific || !!job.options.exportPmtiles;
  const outputName = model3d ? `${job.id}-${job.attempt}-3dtiles` : elevation ? `${job.id}-${job.attempt}-elevation` : scientific ? `${job.id}-${job.attempt}-scientific` : job.options.exportPmtiles ? `${job.id}-${job.attempt}-tiles` : `${job.id}-${job.attempt}.mbtiles`;
  const final = join(config.data, 'output', outputName);
  const staged = join(scratch, directoryOutput ? 'result' : 'result.mbtiles');
  await mkdir(scratch, { recursive: true });
  active = new AbortController();
  const abort = active;
  const timeout = setTimeout(() => abort.abort(new JobError('TIMEOUT', 'The job exceeded its overall time limit.')), config.timeout * 1000);
  let checking = false;
  let peakScratchBytes = 0;
  const check = async () => {
    if (checking) return;
    checking = true;
    try {
      if (jobs.get(job.id)?.cancel) throw new JobError('CANCELLED', 'Job cancelled by the user.');
      if (jobs.runtime()?.owner !== owner) throw new JobError('WORKER_LEASE_LOST', 'Another worker took ownership.');
      await checkDisk();
      const scratchBytes = await directoryBytes(scratch);
      if (scratchBytes > peakScratchBytes) peakScratchBytes = scratchBytes;
      if (scratchBytes > config.scratchBytes) throw new JobError('SCRATCH_LIMIT', 'This job exceeded its scratch disk budget.');
    } catch (error) { abort.abort(error); }
    finally { checking = false; }
  };
  const resources = setInterval(() => void check(), 2000);
  let published = false;
  try {
    await check(); abort.signal.throwIfAborted();
    let input: string;
    let sourceEnvironment: NodeJS.ProcessEnv | undefined;
    let sourceRedactions: string[] | undefined;
    if (job.source?.kind === 's3') {
      await assertS3SourceUnchanged(job.source, abort.signal, sealedLoader);
      if (job.source.readMode === 'stage') {
        await checkDisk(job.source.size);
        jobs.update(job.id, 'Downloading source from S3', 1);
        input = await stageS3Object(job.source, scratch, abort.signal, (done, total) => jobs.update(job.id, `Downloading source from S3 (${Math.floor(done / total * 100)}%)`, Math.min(6, 1 + Math.floor(done / total * 5))), sealedLoader);
      } else {
        const resolved = await s3GdalInput(job.source, sealedLoader); input = resolved.input; sourceEnvironment = resolved.env; sourceRedactions = resolved.redactions;
        jobs.update(job.id, 'Opening COG from S3', 2);
      }
    } else if (job.source?.kind === 'url') {
      await assertUrlSourceUnchanged(job.source, abort.signal);
      if (job.source.readMode === 'stage') {
        await checkDisk(job.source.size);
        jobs.update(job.id, 'Downloading source URL', 1);
        input = await stageUrlObject(job.source, scratch, abort.signal, (done, total) => jobs.update(job.id, `Downloading source URL (${Math.floor(done / total * 100)}%)`, Math.min(6, 1 + Math.floor(done / total * 5))));
      } else {
        const resolved = urlGdalInput(job.source); input = resolved.input; sourceEnvironment = resolved.env; sourceRedactions = resolved.redactions;
        jobs.update(job.id, 'Opening remote COG URL', 2);
      }
    } else {
      input = join(config.data, 'input', job.input);
      if (extname(input).toLowerCase() === '.zip') input = `/vsizip/${input.replaceAll('\\', '/')}`;
    }
    const execution = { signal: abort.signal, log: join(config.data, 'logs', `${job.id}-${job.attempt}.log`), timeoutMs: config.timeout * 1000, deadlineMs: Date.now() + config.timeout * 1000, batchMode: config.vectorBatchMode, batchDelivery: config.vectorBatchDelivery, ...(sourceEnvironment ? { env: sourceEnvironment } : {}), ...(sourceRedactions ? { redactions: sourceRedactions } : {}) };
    if (elevation) {
      const result = await buildElevation(input, staged, job.options, execution, (stage, progress) => jobs.update(job.id, stage, progress));
      await check(); abort.signal.throwIfAborted();
      if (job.source?.kind === 's3' && job.source.readMode === 'remote') await assertS3SourceUnchanged(job.source, abort.signal, sealedLoader);
      if (job.source?.kind === 'url' && job.source.readMode === 'remote') await assertUrlSourceUnchanged(job.source, abort.signal);
      jobs.update(job.id, 'Publishing elevation output', 95);
      await rename(staged, final);
      published = jobs.finish(job.id, job.attempt, owner, outputName, result);
      if (!published) throw new JobError('CANCELLED', 'Publication cancelled because the job or worker ownership changed.');
      return;
    }
    if (scientific) {
      const result = await buildScientific(input, staged, job.options, execution, (stage, progress) => jobs.update(job.id, stage, progress));
      await check(); abort.signal.throwIfAborted();
      if (job.source?.kind === 's3' && job.source.readMode === 'remote') await assertS3SourceUnchanged(job.source, abort.signal, sealedLoader);
      if (job.source?.kind === 'url' && job.source.readMode === 'remote') await assertUrlSourceUnchanged(job.source, abort.signal);
      jobs.update(job.id, 'Publishing scientific raster output', 95);
      await rename(staged, final);
      published = jobs.finish(job.id, job.attempt, owner, outputName, result);
      if (!published) throw new JobError('CANCELLED', 'Publication cancelled because the job or worker ownership changed.');
      return;
    }
    if (model3d) {
      jobs.update(job.id, 'Validating GLB and placing 3D model', 10);
      await checkDisk(job.size);
      const resultPath = join(scratch, 'model3d-result.json');
      try {
        await run(process.execPath, [fileURLToPath(new URL('./model3d-cli.js', import.meta.url)), input, staged, JSON.stringify(job.options), String(config.memoryBytes), resultPath], execution);
      } catch (error) {
        if (error instanceof JobError && error.code === 'TOOL_FAILED') {
          const detail = JSON.parse(await readFile(resultPath, 'utf8').catch(() => '{}')) as { error?: { code: string; message: string } };
          if (detail.error) throw new JobError(detail.error.code, detail.error.message);
        }
        throw error;
      }
      const resultFile = JSON.parse(await readFile(resultPath, 'utf8')) as { result?: Awaited<ReturnType<typeof import('./model3d.js').build3dTiles>> };
      if (!resultFile.result) throw new JobError('TOOL_FAILED', '3D conversion ended without result metadata.');
      const result = resultFile.result;
      await check(); abort.signal.throwIfAborted();
      await writeFile(execution.log, `Validated self-contained GLB. ${result.primitives} mesh primitive(s), ${result.triangles} triangle(s).\nPlaced at ${result.latitude}, ${result.longitude}, ${result.height} m WGS84 ellipsoid height; anchor ${result.anchor}; heading ${result.heading}°, pitch ${result.pitch}°, roll ${result.roll}°; scale ${result.scale}.\nCreated and structurally validated 3D Tiles 1.1 package${result.formats.includes('b3dm') ? ' plus B3DM compatibility output' : ''}: ${result.tiles} tile(s), ${result.lodLevels} LOD level(s), strategy ${result.strategy}.\n`);
      jobs.update(job.id, 'Publishing 3D Tiles', 95);
      await rename(staged, final);
      published = jobs.finish(job.id, job.attempt, owner, outputName, result);
      if (!published) throw new JobError('CANCELLED', 'Publication cancelled because the job or worker ownership changed.');
      return;
    }
    if (directoryOutput) await mkdir(staged, { recursive: true });
    const mbtiles = directoryOutput ? join(staged, 'tiles.mbtiles') : staged;
    const info = await inspect(input, job.options, execution);
    if (info.estimatedTiles && info.estimatedTiles > config.maxTiles) {
      const bounds = info.bounds as [number, number, number, number] | undefined;
      const fitting = bounds ? suggestMaxZoom(bounds, config.maxTiles, job.options.maxZoom) : undefined;
      throw new JobError('TILE_LIMIT', `Estimated ${info.estimatedTiles.toLocaleString()} tiles at maximum zoom exceeds the configured limit of ${config.maxTiles.toLocaleString()}.${fitting !== undefined && fitting < job.options.maxZoom ? ` Try maximum zoom ${fitting}.` : ' Reduce maximum zoom.'}`);
    }
    if (info.kind === 'vector') {
      // Early attribute validation: fail fast before burning scratch/disk.
      const wanted = job.options.includeProperties;
      const available = (info as { allFields?: string[]; fields?: string[] }).allFields ?? info.fields;
      if (wanted && wanted.length > 0 && available) {
        const unknown = wanted.filter(name => !available.includes(name));
        if (unknown.length > 0) throw new JobError('INVALID_OPTIONS', `Unknown attribute(s): ${unknown.slice(0, 5).join(', ')}${unknown.length > 5 ? ` (+${unknown.length - 5} more)` : ''}. Available: ${available.slice(0, 10).join(', ')}${available.length > 10 ? ', …' : ''}`);
      }
      const featureCount = info.featureCount ?? 0;
      const copies = estimatedVectorCopies(featureCount, job.options.minZoom, job.options.maxZoom);
      if (copies > 50000000) throw new JobError('INVALID_OPTIONS', `This request would process ~${copies.toLocaleString()} feature copies (${featureCount.toLocaleString()} features × ${job.options.maxZoom - job.options.minZoom + 1} zooms). Narrow the zoom range or filter attributes.`);
      // Preserve keeps every feature at every zoom (-r1, no limits): the floor
      // is derived from the layer extent (avg features per tile), not a fixed
      // zoom. A national 150k-feature layer is safe from z5; 388k parcels in
      // one city need z10+. Density tolerates low minZoom (it thins instead of
      // exploding) so it is only reported via the drop summary below.
      if (job.options.vectorPreset === 'preserve' && featureCount > DENSE_FEATURE_THRESHOLD) {
        const perTile = Math.min(job.options.maxTileFeatures ?? Number.POSITIVE_INFINITY, PRESERVE_PER_TILE_BUDGET);
        const floor = suggestPreserveFloor(featureCount, info.bounds as [number, number, number, number] | undefined, job.options.maxZoom, perTile);
        if (job.options.minZoom < floor) {
          const avg = resolveVectorPlan(info, job.options).avgPerTileAtMin;
          const avgText = avg !== null && Number.isFinite(avg) ? ` (~${Math.round(avg).toLocaleString()} features per tile at zoom ${job.options.minZoom})` : '';
          throw new JobError('INVALID_OPTIONS', `Preserve with ${featureCount.toLocaleString()} features cannot start at zoom ${job.options.minZoom}${avgText}: low-zoom tiles would be multi-MB. Use minimum zoom ${floor} or higher, select Density, or filter attributes with includeProperties.`);
        }
      }
    }
    jobs.db.prepare('UPDATE jobs SET metadata=? WHERE id=? AND attempt=?').run(JSON.stringify({ source: info }), job.id, job.attempt);
    jobs.update(job.id, `Detected ${info.kind}; ${info.crs}${info.estimatedTiles ? `; ~${info.estimatedTiles.toLocaleString()} top-level tiles` : ''}`, 8);
    const report = (stage: string, progress: number) => jobs.update(job.id, stage, progress);
    let batchSummary: VectorBatchSummary | null = null;
    if (info.kind === 'raster') await raster(input, mbtiles, job.options, execution, report);
    else batchSummary = await vector(input, mbtiles, scratch, info, job.options, execution, report);
    await check(); abort.signal.throwIfAborted();
    jobs.update(job.id, 'Validating MBTiles', 95);
    const result = validate(mbtiles, info.kind, job.options) as Record<string, unknown> & { maxTileBytes?: number };
    // Surface density thinning: scan the tool log tail for tippecanoe's
    // "keeping the sparsest X%" lines. No full-log parse; last 512 KB is enough
    // (progress lines repeat per tile). Stored in metadata for the UI badge.
    if (info.kind === 'vector' && job.options.vectorPreset === 'density') {
      try {
        const logText = await readFile(execution.log, 'utf8').catch(() => '');
        const { minKeptPct, samples } = summarizeTippecanoeDrop(logText.slice(-512 * 1024));
        if (minKeptPct !== null) {
          (result as Record<string, unknown>).minKeptPct = minKeptPct;
          (result as Record<string, unknown>).thinnedTiles = samples;
        }
      } catch { /* thinning hint is best-effort; validation already passed */ }
    }
    // NOTE (P2): deliberately no Maptiler-style map/images dedup rewrite here.
    // Rewriting via DROP TABLE tiles + CREATE VIEW tiles breaks MBTiles clients
    // expecting a real tiles table, and a full-table SELECT ... .all() OOMs on
    // 300 MB outputs. Size is controlled upstream (detail cap, precision 9,
    // explicit tile budgets, attribute filtering) instead.
    // Flush the artifact before making it visible. A failed DB commit never exposes it through the API.
    const handle = await open(mbtiles, 'r+'); try { await handle.sync(); } finally { await handle.close(); }
    if (job.source?.kind === 's3' && job.source.readMode === 'remote') await assertS3SourceUnchanged(job.source, abort.signal, sealedLoader);
    if (job.source?.kind === 'url' && job.source.readMode === 'remote') await assertUrlSourceUnchanged(job.source, abort.signal);
    if (job.options.exportPmtiles) { jobs.update(job.id, 'Exporting and validating PMTiles', 96); await exportPmtiles(mbtiles, join(staged, 'tiles.pmtiles'), abort.signal); }
    abort.signal.throwIfAborted();
    const planSummary = info.kind === 'vector' ? (() => { const p = resolveVectorPlan(info, job.options); return { geometry: p.geometry, densityTier: p.densityTier, detail: p.detail, lowDetail: p.lowDetail, minimumDetail: p.minimumDetail, maxTileBytes: p.maxTileBytes, maxTileFeatures: p.maxTileFeatures, avgPerTileAtMin: p.avgPerTileAtMin }; })() : null;
    await rename(staged, final);
    published = jobs.finish(job.id, job.attempt, owner, outputName, { ...result, source: info, exportPmtiles: !!job.options.exportPmtiles, ...(planSummary ? { vectorPlan: planSummary } : {}), ...(batchSummary ? { batch: { ...batchSummary, peakScratchBytes } } : {}) });
    if (!published) throw new JobError('CANCELLED', 'Publication cancelled because the job or worker ownership changed.');
    console.log(JSON.stringify({ event: 'job_completed', job: job.id, attempt: job.attempt, ...result }));
  } catch (error) {
    jobs.fail(job.id, job.attempt, error);
    console.error(JSON.stringify({ event: 'job_failed', job: job.id, error: String(error) }));
  } finally {
    clearInterval(resources); clearTimeout(timeout); active = undefined;
    if (!published) await rm(final, { recursive: directoryOutput, force: true });
    await rm(scratch, { recursive: true, force: true, maxRetries: 3 });
  }
}
try {
  // Only reclaim application-owned attempt paths after acquiring the exclusive worker lease.
  for (const name of await readdir(join(config.data, 'scratch'))) {
    const match = name.match(/^([a-f0-9-]{36})-\d+$/);
    if (match && jobs.get(match[1]!)?.status !== 'RUNNING') await rm(join(config.data, 'scratch', name), { recursive: true, force: true });
  }
  for (const name of await readdir(join(config.data, 'output'))) {
    const match = name.match(/^([a-f0-9-]{36})-\d+(?:\.mbtiles|-3dtiles|-elevation|-scientific|-tiles)$/);
    if (match) {
      const job = jobs.get(match[1]!);
      if (job?.status !== 'SUCCEEDED' || job.output !== name) await rm(join(config.data, 'output', name), { recursive: !name.endsWith('.mbtiles'), force: true });
    }
  }
  const tools = await doctor(); jobs.heartbeat(owner, tools);
  console.log(JSON.stringify({ event: 'worker_ready', owner, tools }));
  while (!stopping) {
    const job = jobs.claim(owner);
    if (job) await execute(job); else await sleep(500);
  }
} finally { clearInterval(heartbeat); jobs.release(owner); jobs.close(); }
