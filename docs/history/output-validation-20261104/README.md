# Pre-fix output validation baseline — 2026-11-04

This is a historical summary of local testing of commit `acd8145fe8eff8d5e6e788a74061900300caf1c2`, before the output-conformance changes. It is not a certificate or a result for the current branch.

Four local jobs and synthetic fixtures were tested. Private datasets, generated files, downloaded tools, and machine-specific paths are not included in the public source. Local evidence was retained under the ignored `artifacts/output-validation-20261104` directory.

| Area | Baseline result |
| --- | --- |
| Raster MBTiles | All 2,978 WebP payloads decoded |
| Vector MBTiles | 39 tiles decoded; 7,518 source IDs present at maximum zoom |
| PMTiles | Four archives passed structural checks and payload comparisons |
| Projected elevation COG | OGC GeoTIFF ETS 1.2: 39 passed, zero failed/skipped |
| Geographic elevation/scientific COG | 38 passed, one failed: missing linear-unit GeoKey when semi-major axis was explicit |
| Terrain encodings | Controlled constant-height/NoData fixtures decoded as expected; accompanying geographic COGs had the GeoKey failure |
| Modern 3D Tiles and original models | Cesium/Khronos reported zero errors on the synthetic model |
| B3DM | Missing `content.uri`; two content lengths failed eight-byte alignment after a diagnostic URI correction |
| WMTS PNG | EARL: 22 passed, 11 failed, 18 skipped, eight inherited failures |

Diagnostic GeoTIFF 1.1 re-encodings passed all 39 implemented ETS checks. They did not replace the original datasets. This baseline motivated the URI/alignment, GeoTIFF encoding, and WMTS protocol corrections. See [the current validation guide](../../OUTPUT_VALIDATION.md) and the current commit's CI artifacts for subsequent results.
