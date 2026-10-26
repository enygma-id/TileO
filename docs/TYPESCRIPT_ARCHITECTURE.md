# TypeScript implementation architecture

This document describes the TileO TypeScript implementation, including the HTTP API, local SQLite queue, worker and native geospatial tools. It supplements the [Architecture](ARCHITECTURE.md) and [Operations](OPERATIONS.md) guides.

## Flow

```text
English Web Console
  | streaming upload -> 202 Accepted + job ID
  v
Fastify API <---- status polling / logs / preview / download
  | SQLite WAL queue + input file
  v
Single worker (separate process, exclusive lease)
  | inspect CRS/input -> native tool guardian
  +-- Raster: GDAL warp -> MBTiles -> GDAL overviews
  +-- Vector: OGR -> GeoJSONSeq -> Tippecanoe -> MBTiles
  | validate SQLite / tiles / zoom / format
  v
fsync artifact -> same-volume rename -> commit SUCCEEDED
```

Upload must complete before the job is accepted. After HTTP 202, the browser may be closed. HTTP does not wait for GDAL. Polling does not repeat the conversion. The API and worker share local SQLite/disk, not long-lived HTTP streams.

## Structure

```text
src/
  api.ts          HTTP, upload, session, preview, download
  worker.ts       job claim, pipeline, resource checks, publish
  jobs.ts         SQLite queue, lease, state transitions
  process.ts      bounded logs/output, timeout, abort
  pipeline.ts     stdin streaming runner with backpressure
  vector-batch.ts batched normalization: scratch file or stdin stream
  vector-reader.ts incremental GeoJSON scanner, preflight, batch splitter
  json-stream.ts  bounded JSON records and lossless property rewriting
  vector-preflight-cli.ts supervised metadata scan with API memory budget
  vector-adapter.ts qualified sequential OGR readers (GPKG/FGB/ZIP Shapefile)
  tool-host.ts    guardian and process-tree termination
  inspect.ts      GDAL inspection and source CRS validation
  raster.ts       gdalwarp / gdaladdo
  vector.ts       ogr2ogr / tippecanoe, per-attempt batch summary
  validate.ts     output validation before publish
  config.ts       environment and cross-OS executables
  resources.ts    disk/scratch checks, process-tree kill and memory sampling
  doctor.ts       executable availability check
  start.ts        local supervisor for API + worker
  web/app.ts      upload, polling, MapLibre preview
  tests/          unit/API and real-tool integration
  browser/        UI end-to-end test
web/              HTML/CSS (English)
Dockerfile
compose.yaml
data/             runtime native; not source controlled
```

## Simplicity decisions

- Single TypeScript application, not a layered monorepo. Native DOM and MapLibre for preview; no additional UI framework.
- Fastify HTTP, `child_process` executables, SQLite transactions. No Restate, Redis, RustFS, or speculative generic adapters.
- One active job limits CPU/RAM/disk contention. Parallel workers are only considered after benchmarks and changes to the lease/storage model.
- Interrupted jobs become failed; manual retry uses a new attempt from the intact input. No pretense of resuming partial MBTiles.
- Not distributed exactly-once. Attempt ID/lease prevents publishing stale attempts. The API only serves SUCCEEDED artifacts.

## Native pipeline

Raster writes directly to MBTiles without a full reprojection GeoTIFF copy. Target resolution follows max zoom; bilinear, cache/memory/thread are bounded. WebP quality 80 default. Overviews are built incrementally from the previous level, saving work but adding lossy resampling/re-encoding; choose PNG if lossless is more important.

OGR normalizes vector to GeoJSONSeq EPSG:4326 on scratch with 15 decimal places; Tippecanoe reads in parallel with bounded threads. Density retains tile limits and permits feature dropping. Preserve disables thinning, simplification and tile limits, while worker resource limits remain enforced. Both clip and quantize geometry. Preserve requires Tippecanoe; Auto only falls back to GDAL for Density when Tippecanoe cannot start.

Large GeoJSON (`.geojson`/`.json`/`.geojsonl`) can bypass whole-file GDAL parsing: a streaming preflight collects count/schema/bounds/CRS, then bounded batches normalize either to a scratch GeoJSONSeq (`file` delivery) or straight into one Tippecanoe stdin pipe (`stream` delivery, no parallel flag, same single invocation). Policy (`TILEO_VECTOR_BATCH_*`) defaults to `off`, is frozen per attempt, and each attempt stores counts, bytes, stage durations, and memory/scratch peaks in job `metadata.batch`.

Qualified GPKG/FGB/ZIP Shapefile readers use one sequential OGR pass for normalization. Stream data passes through inherited guardian descriptors with backpressure, never metadata IPC/capture. The same guardian owns file and streaming tools; worker IPC loss terminates native process groups. Streaming memory sampling includes the worker tree so sibling GDAL/Tippecanoe processes share a budget. Preflight runs in a separate supervised process with at most 256 MiB for API inspection. Source properties/IDs in projected GeoJSON are kept as raw tokens while OGR supplies normalized geometry. KML remains legacy because measured reader memory grows with document size. Retry still restarts from the original input; resumable checkpoints are not part of the current contract. See [Vector Batching](VECTOR_BATCHING.md) for supported modes and operational limitations.

## Stability and security

SQLite WAL/synchronous FULL; scratch/output on one filesystem. Subprocesses without shell; stdout/stderr are continuously drained; metadata/log are bounded. Cancel/timeout terminates the process tree. The guardian handles worker disconnect. Containers provide a hard memory limit; native RSS sampling is best effort, not a hard total limit.

The queue survives API restart. Worker takeover waits for the 30-second lease; long-running RUNNING jobs become FAILED/WORKER_INTERRUPTED. Abandoned private attempt scratch is cleaned up at startup.

Bound to localhost by default; remote requires a token/TLS reverse proxy. The token provides shared access, not user isolation. Complex GDAL input: use a non-root read-only container, worker without network. The extension allowlist is not a format sandbox.

## Platform and production acceptance

The Windows GDAL bundle is auto-detected. On Windows, Docker or WSL2 is recommended for workflows requiring Tippecanoe; the native GDAL fallback applies only to supported Density workloads. Linux/macOS uses PATH or an explicit folder: see [TOOLS.md](TOOLS.md).

Before production: real-tool tests, representative datasets, cancellation/restart, disk-full, backup/restore, client validation, and soak/load/security tests in the target environment. Windows native GDAL and Linux Docker do not prove macOS/ARM64 has been tested. Operational limits: [OPERATIONS.md](OPERATIONS.md).
