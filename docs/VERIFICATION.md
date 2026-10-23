# Engineering Verification Report — 6 October 2026

## Environments reported for the 6 October 2026 test session

- Windows host, Node 24.13.1, native GDAL from `../tools`.
- Docker Linux amd64: Node 24.13.1, GDAL 3.10.3, Tippecanoe 2.79.0.
- Microsoft Edge headless for desktop/mobile viewport UI.

The report does not establish successful testing of macOS/Apple Silicon or native Linux outside Docker. Instructions are available, but cross-platform success must still be proven with integration tests on the target machine.

## Results

| Check | Result |
| --- | --- |
| TypeScript build + unit/API | Passed: 5 tests; 2 integration tests intentionally skipped without environment opt-in |
| GDAL native Windows | Raster WebP, embedded CRS, invalid EPSG, missing CRS passed |
| Docker real-tool integration | 2 tests passed: raster GDAL and vector OGR/Tippecanoe |
| Browser end-to-end | Passed: upload vector, SUCCEEDED, reload/persistence, preview, download SQLite, INVALID_CRS, mobile without horizontal overflow |
| Queue tests | Persistence, exclusive claim, cancellation fencing, interruption/retry, SQLite backup/restore |
| Process runner tests | Large stderr, nonzero exit, timeout termination |
| npm dependency audit at build | 0 reported vulnerabilities; not a substitute for native/container/security audit |
| Doctor container | All seven executables available |

## MARISO.tif through the API console

The original file was uploaded via the streaming endpoint used by the UI, not by automatically sending a 3.65 GB browser form. After acceptance, the upload request completes while the worker continues processing.

| Parameter | Value |
| --- | --- |
| Job ID | `424c4114-0d1a-43af-bb8a-a3997704faeb` |
| Input | 3,650,650,734 bytes; 39,354 × 59,655; RGB Byte |
| Source CRS | Embedded `EPSG:32750`, no override |
| Zoom / format | 0–22 / WebP quality 80 |
| Accepted | 2026-10-06 02:48:10.869 UTC |
| Completed | 2026-10-06 02:57:16.642 UTC |
| Duration accepted-to-complete | 545.773 seconds, approximately 9 minutes 6 seconds; excludes upload |
| Status | SUCCEEDED; 43,931 tiles; actual zoom 0–22 |
| Output | 296,210,432 bytes, approximately 282.5 MiB |
| Download after redeploy | HTTP 200, same size; job/artifact persisted |

Input SHA-256: `19042476e7f65b2f6718925777aad40b55274fc5e7fab26c1f47173d9fe8bdb5`.

No broken pipe occurred during this test. A single run result does not guarantee the error can never occur or prove that Node is faster than Python; a comparative benchmark must use identical options and storage. Worker container limits: 2 CPU / 5 GiB; tool threads 2. A single `docker stats` sample showed approximately 3.26 GiB container usage, **not** a peak RAM measurement.

In the documented test session, the artifact was available through the local console for the MARISO job. The test report states that its input/output were retained in a Docker volume at the time of testing; current availability is not asserted. Temporary test containers were handled separately from persistent application data.

## Limitations of the documented test evidence

Soak/load test, real disk-full, power-loss, kill-tree across all OSes, production TLS proxy, untrusted hostile datasets, full production volume restore, and multi-user isolation. Native RSS limit is sampling only. The worker queue is single-host; horizontal scaling is not supported. Do not call these results production-certified without the additional verification listed above.
