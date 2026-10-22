> **Implementation reference — TileO Clean 4, supplied 21 October 2026.** Commands and behavior are transcribed from the source document. This founding package has no runnable implementation; check the merged source before describing any behavior as release-certified.

# Operations and deployment limits

## Environment

Native uses shell/service manager. Docker Compose reads `.env`; an example is provided in `.env.example`. Variables not yet forwarded in `compose.yaml` must be added to the relevant service's `environment`.

| Variable | Default | Consumer |
| --- | --- | --- |
| TILEO_DATA_DIR | `tileo-ts/data`, Docker `/data` | API + worker must match |
| TILEO_HOST / TILEO_PORT | `127.0.0.1` / 8090 | API |
| TILEO_API_TOKEN | empty for localhost; minimum 24 characters if set | API |
| TILEO_PUBLIC_ORIGIN | request origin | API; HTTPS URL without trailing slash |
| TILEO_SECURE_COOKIES | `0` | Set `1` behind HTTPS if request protocol is not forwarded |
| TILEO_MAX_UPLOAD_MB | 16384 | API |
| TILEO_QUEUE_LIMIT | 20 | API |
| TILEO_THREADS | 2 | worker |
| TILEO_TOOL_MEMORY_MB | 4096 | worker RSS sampling |
| TILEO_JOB_TIMEOUT_SECONDS | 7200 | worker |
| TILEO_MAX_SCRATCH_MB | 32768 | worker |
| TILEO_MAX_TOP_LEVEL_TILES | 2000000 | raster estimate when extent is available |
| TILEO_DISK_RESERVE_MB | 2048 | API + worker |
| TILEO_VECTOR_BATCH_MODE | `off` | worker + API inspect; `off`, `auto`, or `on` |
| TILEO_VECTOR_BATCH_FEATURES | 10000 | worker; max features per batch |
| TILEO_VECTOR_BATCH_MB | 16 | worker; max MiB per batch |
| TILEO_VECTOR_MAX_FEATURE_MB | 16 | worker + API inspect; max MiB per feature, cannot exceed batch MiB |
| TILEO_VECTOR_BATCH_DELIVERY | `file` | worker; `file` (scratch GeoJSONSeq) or `stream` (stdin pipeline) |
| TILEO_S3_CONNECTIONS | empty JSON array | API + worker; server-side S3/MinIO connection registry (auth: static, iam, byoc, or public) |
| TILEO_CREDENTIAL_KEY | empty | API + worker; 64-hex-char key sealing user-supplied (BYOC) bucket credentials with AES-256-GCM |
| TILEO_AWS_ACCOUNT_ID | empty | API; AWS Account ID for cross-account IAM Role integration (Option 3). If empty, IAM Role option is disabled |
| TILEO_AWS_EXTERNAL_ID | `tileo-s3-access` | API; External ID for AWS STS AssumeRole cross-account handshake |
| TILEO_BYOC_ALLOW_HTTP | empty | API; set `1` to also allow plain-HTTP BYOC endpoints on loopback for local development (hosts allowlisted via TILEO_REMOTE_URL_HOSTS never need this) |
| TILEO_REMOTE_URL_HOSTS | empty | API + worker; exact allowlist for private-network or HTTP URL hosts |
| TILEO_REMOTE_INSPECT_SECONDS | `120` | API remote metadata deadline |
| TILEO_MAX_REMOTE_STAGE_MB | `65536` | API + worker; maximum object size eligible for staging |

Docker limits the API to 512 MiB and the worker to `${TILEO_WORKER_MEM_LIMIT:-6g}` / 2 CPU. The worker has outbound networking so configured S3/MinIO endpoints can be reached; the connection registry restricts buckets and prefixes. The local `.env` currently selects 14g for a 12 GiB tool budget. Adjust the container limit together with the tool budget. `TILEO_LOCAL_PROXY=1` is only for containers published on loopback; it does not bypass auth on public ports.

The primary UI accepts a public HTTPS URL or a presigned/authenticated URL. Query credentials are removed from API responses and redacted from native-tool logs. Arbitrary URLs are protected against local/private targets; add an exact hostname to `TILEO_REMOTE_URL_HOSTS` only when an administrator intentionally allows a private MinIO endpoint or development HTTP URL. URL input defaults to conditional staging; direct remote reading requires a `versionId` query parameter.

Each server-side S3 connection also defaults to safe staging with a conditional `If-Match` download. Set `allowUnversionedRemote:true` only for prefixes whose keys are guaranteed immutable; direct GDAL `/vsis3/` reads cannot attach `If-Match` to every range request. Effective staging size is the smaller of `TILEO_MAX_REMOTE_STAGE_MB` and `TILEO_MAX_SCRATCH_MB`; free-disk preflight reserves the full input size before transfer. A 44 GiB staged object therefore requires a scratch limit above 44 GiB, plus enough disk for input, output, temporary files, and the configured reserve.

Each entry of `TILEO_S3_CONNECTIONS` declares `auth`: `static` (keys in server config), `iam` (instance/task-role credentials with optional `roleArn` plus `externalId` for STS AssumeRole), `byoc` (no server keys; callers register their own via `POST /api/storage/credentials`), or `public` (unsigned requests). A `byoc` connection, or a full user-supplied target (`endpoint` plus `bucket` plus keys, for example R2, Spaces, MinIO, or Supabase), lets callers inspect private buckets without sharing keys with each other: credentials are sealed with `TILEO_CREDENTIAL_KEY`, bind to the issuing session, expire after `ttlSeconds` (default 15 minutes, at most 90 days for recurring syncs), and are revocable via `DELETE /api/storage/credentials/{id}`. BYOC endpoints require HTTPS on a public host unless the exact host is allowlisted by `TILEO_REMOTE_URL_HOSTS`, which also permits `http://` and private/LAN addresses (for example a self-hosted MinIO); `TILEO_BYOC_ALLOW_HTTP=1` relaxes this for loopback local development. Without `TILEO_CREDENTIAL_KEY` the credentials endpoints reject requests; rotate the key only together with wiping `storage_credentials`, since sealed rows cannot be decrypted after rotation.

## Vector batch rollout

Batching reads GeoJSON incrementally (preflight + bounded batches) instead of letting GDAL parse the whole file into RAM. Qualified adapters: `.geojson`, `.json`, `.geojsonl` (WGS84 direct or per-batch geometry reprojection), GPKG, FlatGeobuf and GDAL-recognized ZIP Shapefile. Native adapters use one sequential `ogr2ogr` read, with the same bounded-record writer for file/stream delivery. Driver identity and selected layer are checked; an extension alone does not qualify a format. KML remains legacy on `auto` (with an explicit fallback reason), and strict `on` rejects it before opening the document.

See [BATCH_SYSTEM_AUDIT.md](BATCH_SYSTEM_AUDIT.md) for the current audit and measured driver qualification. GeoJSON preflight runs under a guardian with at most 256 MiB of memory; the API probe budget is independent of worker memory. Batch feature count is limited to 1–1,000,000 and byte settings to 1–256 MiB, with max-feature no greater than batch MiB. These are configuration validation ranges, not a recommendation to allocate the maximum on a 512 MiB API container.

1. Ship with `TILEO_VECTOR_BATCH_MODE=off` (default; legacy path, unchanged behavior).
2. Test explicitly with `on` on a benchmark dataset before trusting it: same input/zoom/preset/threads/disk for `off`, `on` + `file`, and `on` + `stream`. Record wall time, peak RSS/scratch, MBTiles size, and a decoded-tile comparison.
3. Only then set `auto` (batch for qualified adapters, legacy otherwise). Keep `file` delivery as the comparison baseline; use `stream` to drop the full-dataset intermediate.
4. Rollback is `off` + restart; it applies to the next job. The worker freezes mode/delivery per attempt (inspect and tiling always agree), so never change the variables mid-attempt — restart instead.

Historical pre-audit reference run (synthetic 150k points, 23 MB single-line GeoJSON, z0–5 density, GDAL 3.12.2 + Tippecanoe 2.79.0, WSL Ubuntu; ogr-normalization path, 15 batches):

| Pipeline | Wall | Peak RSS | Output |
| --- | --- | --- | --- |
| `off` (legacy) | 3.3 s | 74 MB | 6.80 MB |
| `on` + `file` | 6.6 s | 222 MB | 6.78 MB |
| `on` + `stream` | 6.5 s | 216 MB | 6.78 MB |

That historical run decoded the same z5 tile across all three (629 features, same attributes), with equal output sizes for file/stream. The implementation now uses direct WGS84 batching even without an `id` property. The audit includes a new 516.52 MiB synthetic point comparison with identical payloads across all tiles; a large representative parcel/line dataset is still an open release gate.

Per-attempt evidence lands in successful job `metadata.batch`: frozen `mode`/`delivery`, `active`, `stream`, `normalization` (`direct`/`ogr`), `featureCount`, `batchCount`, `bytesNormalized`, and `fallback` (`gdal:tippecanoe-missing` or `legacy:unqualified-driver:<driver>`). `normalizeMs` and `tileMs` are separate for file delivery; on streaming they overlap, so do not add them as wall time. Guardian `peakMemoryBytes` samples the shared worker tree every second (nullable/best effort), and worker `peakScratchBytes` samples visible directory files. Open-but-unlinked temporary files are not included in that directory peak; monitor free disk/container storage separately. Failed jobs do not yet retain a full partial batch summary. Progress updates are throttled to ~1 Hz plus a final flush. Persistent normalization checkpoint/resume remains deferred; retry starts a new attempt from the original input.

## Remote deployment

Keep Docker published to `127.0.0.1`; place a TLS reverse proxy in front. Set a random token with at least 128 bits of entropy and `TILEO_PUBLIC_ORIGIN=https://tiles.example.com`. The UI sign-in creates an HttpOnly/SameSite Strict 12-hour session, Secure if the origin or request is HTTPS. Set `TILEO_SECURE_COOKIES=1` when TLS termination does not forward the original protocol. Rotating the API token invalidates existing sessions.

Configure proxy upload limit and idle timeout, disable request buffering for streaming, and add rate limiting on login/upload. After upload, requests are short; there is no need for hours-long HTTP timeouts waiting for GDAL.

The token provides shared-admin access, not multi-user isolation. Do not open arbitrary public uploads without additional security/quota/rate limit/isolation review. A non-root/read-only/no-network container reduces the impact of malicious input but is not a perfect sandbox guarantee.

## Recovery

`QUEUED -> RUNNING -> SUCCEEDED | FAILED | CANCELLED`.

- Cancel stops the tool; status becomes terminal after the process stops. Partial output is not served.
- Retry is only available for FAILED/CANCELLED, creating a new attempt with the original input.
- Worker crash: the lease expires after approximately 30 seconds, the supervisor attempts a restart, and the old job becomes FAILED/WORKER_INTERRUPTED. Retry manually.
- Restarting the API does not stop a separate worker. Restarting the worker interrupts the running attempt.
- OOM can occur before an error is logged; check container logs/inspect and resource limits.
- Completed, failed, and cancelled jobs can be deleted from the UI; this removes the job record and its input, output, log, and scratch files. Running and queued jobs must be stopped or completed first. There is no retention scheduler yet, so monitor disk usage.

## Backup and upgrade

Wait until no RUNNING/QUEUED jobs remain, stop API/worker, then snapshot/archive the **entire data volume** using the host/Docker backup mechanism. Keep SQLite, input, output, and logs as a single set. Do not copy only a live DB while ignoring the WAL. Test restore to a disposable volume.

Upgrade: perform a consistent backup, save the old image digest, build/test a new image on disposable data, then redeploy. Do not upgrade while a large job is running. The lockfile pins npm; save release images by digest because apt/Homebrew packages change over time.

## Monitoring

```sh
docker compose ps
docker compose logs --tail 100 worker
docker stats --no-stream
```

`/healthz` is API liveness; `/api/status` provides the worker heartbeat, tool availability, and free disk. A healthy API does not automatically mean the worker is available.

Benchmark with the same input/zoom/quality/thread/storage. Measure time, peak RSS/scratch, MBTiles size, tile count, and preview. Comparing native SSD CLI with Docker bind mount on Windows does not measure Node overhead alone.
