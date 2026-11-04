# Output validation

TileO performs pipeline checks before publishing a job. Independent conformance tools can also block publication in strict mode and run against synthetic outputs in CI. These checks do not grant OGC certification or establish survey accuracy.

## Runtime profiles

`TILEO_OUTPUT_VALIDATION=builtin` is the default. Existing pipeline checks cover MBTiles integrity, metadata/zoom/payload samples, COG values and georeferencing, terrain PNG structure, PMTiles sample round-trips, and generated model structure. New COGs explicitly use GeoTIFF 1.1. B3DM content uses `content.uri` and an eight-byte-aligned embedded GLB.

For independent checks on every new job, prepare the toolchain below and set:

```sh
TILEO_OUTPUT_VALIDATION=strict
TILEO_VALIDATOR_TOOLS_DIR=/absolute/path/to/artifacts/output-validators
```

Restart the worker after changing its environment. Every pipeline invokes the strict validator before moving its staged output into the published directory. A missing tool, timeout, validator error, or failed report prevents a successful publication. The job metadata records `validation.profile`, `validation.status`, and completed check names. Builtin results are explicitly labeled `builtin`; they are not reported as external conformance results.

Strict mode requires Linux x64, Python with GDAL bindings and its COG validator module, Java 17, and `tiffdump`. It is an operator-provided toolchain, not part of the default application/container installation. Run the GeoTIFF ETS as an unprivileged user: its released Linux metadata reader attempts package-manager commands before invoking `tiffdump`; install that tool beforehand. Full decoding and ETS runs can significantly increase processing time and memory use.

## Prepare the independent tools

Install Node.js 24 and native prerequisites. On Ubuntu:

```sh
sudo apt-get update
sudo apt-get install -y gdal-bin python3-gdal libtiff-tools openjdk-17-jre-headless
npm ci
npm run build
npm run validators:setup
```

The setup command verifies pinned SHA-256 digests of the OGC GeoTIFF 1.2 ETS, WMTS 1.11 ETS, and Protomaps 1.31.2 archive. It installs the separate lockfile in `tools/output-validation` with lifecycle scripts disabled. Cesium 0.6.1, Khronos glTF Validator 2.0.0-dev.3.10, and the MVT decoder are development tools. They do not change the application's production dependency lockfile and are excluded from its Docker image. `JAVA` and `PYTHON` may select explicit executable paths.

Do not copy downloaded tools or their transitive libraries into a production distribution without a separate license and provenance review. In particular, the isolated Cesium dependency tree contains components prohibited by the application's production dependency policy. See [the tooling boundary](../tools/output-validation/README.md).

## Validate an existing output

```sh
npm run validate:output -- \
  --input /path/to/result \
  --kind elevation \
  --report /path/to/evidence/result.json
```

Supported kinds: `raster`, `vector`, `pmtiles`, `elevation`, `scientific`, `model3d`, `glb`, and `gltf`. Raster/vector inputs may be MBTiles files or TileO export directories containing `tiles.mbtiles` and optional `tiles.pmtiles`. Model inputs use their output directory. Numeric rasters accept a COG file or pipeline directory. Optional `--reference` compares COG data/georeferencing with a source or PMTiles payloads with MBTiles. Use `--tools-dir` to override the downloaded tool directory.

Reports contain named checks and return a nonzero process status when any required check fails. GeoTIFF decisions parse TestNG failures/skips and require passed tests; Java exit code zero alone is insufficient. WMTS decisions parse EARL, including inherited failures. Optional WMTS tests that are not implemented can be skipped and remain recorded as skipped.

## Coverage by format

| Output | Independent checks |
| --- | --- |
| Raster MBTiles | SQLite integrity, required metadata, coordinates/duplicates, full GDAL payload decoding |
| Vector MBTiles | Container checks and every MVT feature's geometry/type/layer structure |
| Raster/vector PMTiles | Protomaps `verify`; every payload compared with MBTiles when a reference is supplied |
| Elevation/scientific COG | GDAL full COG structure check, full raster decoding, OGC GeoTIFF ETS; optional source comparison |
| Terrain-RGB/Terrarium | COG checks, MBTiles/PNG decoding, height decoding, and PMTiles equivalence |
| 3D Tiles 1.1 and B3DM | Cesium tileset/content checks, including embedded glTF |
| Original GLB and glTF/BIN | Khronos asset/resource validation |
| WMTS | Released OGC WMTS ETS against the actual API's PNG KVP binding |

MBTiles, PMTiles, Terrain-RGB, Terrarium, and glTF have their own specifications; these checks are not OGC tests of those encodings. Cesium validates the OGC 3D Tiles format but is not TEAM Engine. The GeoTIFF ETS covers its implemented TIFF/GeoKey classes, not all numeric-raster semantics.

## Reproduce the PR/CI gate

```sh
npm run validate:outputs -- --out-dir artifacts/my-output-conformance-run
```

Choose a new output directory for each run. The command builds deterministic, synthetic RGB, vector, numeric, terrain, and model inputs; creates all twelve output categories; runs the independent validators; and starts an isolated API for the WMTS suite. It uses no production database or private dataset. `summary.json`, individual reports, TestNG XML, EARL, logs, and fixture identities are retained in the selected directory. The CI job uploads that directory even on failure.

The gate uses small representative fixtures. It does not prove every driver, dataset size, glTF extension, vertical datum, resampling error, or all WMTS payload formats. WebP/MVT payloads have independent decoder checks; the Java WMTS image suite runs on PNG. Review both failures and skips before making a compatibility claim.

The [pre-fix local baseline](history/output-validation-20261104/README.md) is historical evidence and must not be presented as results for a later commit. Current CI artifacts belong to the commit that produced them.

References: [OGC GeoTIFF ETS](https://github.com/opengeospatial/ets-geotiff11), [WMTS ETS](https://github.com/opengeospatial/ets-wmts10), [GDAL COG Validator](https://gdal.org/en/stable/programs/gdal_driver_cog_validate.html), [Cesium Validator](https://github.com/CesiumGS/3d-tiles-validator), [Khronos Validator](https://github.com/KhronosGroup/glTF-Validator), and [Protomaps CLI](https://docs.protomaps.com/pmtiles/cli).
