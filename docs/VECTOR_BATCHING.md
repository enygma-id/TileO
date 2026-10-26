# Vector Batching and Streaming

TileO can normalize supported vector inputs in bounded batches before creating a single vector-tile archive. Batching is **optional and disabled by default**. This guide describes public behavior and operational requirements; it is not a benchmark or a certificate for a particular release image.

## Supported input paths

| Input | Batch qualification |
| --- | --- |
| GeoJSON FeatureCollection (`.geojson`, supported `.json`) | Incremental preflight and bounded feature processing; direct WGS84 or supported CRS normalization |
| GeoJSONSeq / GeoJSONL (`.geojsonl`) | Incremental record processing and field inspection |
| GeoPackage (`.gpkg`) | Qualified sequential OGR reader; explicit layer selection where needed |
| FlatGeobuf (`.fgb`) | Qualified sequential OGR reader |
| ZIP Shapefile (`.zip` containing Shapefile) | Qualified sequential OGR reader after format/driver validation |
| KML | Not eligible for strict batching (`on`); `auto` uses the legacy path with a fallback reason |

Eligibility depends on actual driver identification, valid geometries, CRS information, layer selection, and resource limits. A filename extension is not sufficient evidence of eligibility. Format availability also depends on the native tools compiled into the deployment.

## Configuration

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `TILEO_VECTOR_BATCH_MODE` | `off` | `off`: legacy processing; `auto`: batch qualified inputs and fall back otherwise; `on`: require supported batching or reject the input |
| `TILEO_VECTOR_BATCH_DELIVERY` | `file` | `file`: normalized scratch records; `stream`: pipe records into one Tippecanoe process |
| `TILEO_VECTOR_BATCH_FEATURES` | `10000` | Maximum feature count per normalization batch |
| `TILEO_VECTOR_BATCH_MB` | `16` | Maximum size in MiB of a normalization batch |
| `TILEO_VECTOR_MAX_FEATURE_MB` | `16` | Maximum size in MiB of one feature; must not exceed the batch size |

The application validates the supported feature-count and byte ranges. Do not infer that the largest permitted setting is safe on every machine. Configuration is frozen per job attempt; update the service configuration and restart the relevant processes before running new jobs.

## Processing behavior

1. Inspect the input and validate its format, source CRS and selected layer as applicable.
2. Perform bounded preflight/normalization; the API preflight uses a separate supervised process with a maximum budget of 256 MiB.
3. Normalize batches with preserved source properties and IDs where the supported path permits; projected input geometry is transformed using the native OGR path.
4. Deliver normalized records through a scratch file or a controlled input stream to **one** Tippecanoe process.
5. Validate the produced output and only publish a completed artifact after the job succeeds.

`stream` eliminates a full normalized GeoJSONSeq intermediate on the eligible pipeline. It does **not** guarantee constant total memory or zero temporary disk usage: OGR drivers and Tippecanoe may allocate memory or create their own temporary files. Cancellation, timeouts, memory budgets and scratch-disk restrictions still apply.

## Operations and rollback

- Keep `TILEO_VECTOR_BATCH_MODE=off` until the target environment and representative inputs have been validated.
- To compare modes, use the **same source file, zooms, strategy, input options, native-tool versions and hardware** for `off/file`, `on/file` and `on/stream`.
- Compare decoded tile geometry, feature counts, attributes, source IDs, layers and zooms. Raw MBTiles file hashes alone do not establish semantic equivalence.
- Some strategies deliberately clip, quantize or drop features under documented constraints. Evaluate the selected strategy rather than demanding bitwise equality to the original vector data.
- To roll back, set `TILEO_VECTOR_BATCH_MODE=off` and restart the affected API/worker processes. Changes apply to new job attempts, not an attempt already running.

## Validation and limitations

Batching does not guarantee that every uploaded file will convert successfully. Very large individual geometries, problematic source CRS declarations, memory required inside Tippecanoe, insufficient disk, and unsupported native drivers can still cause a job to fail. A `SUCCEEDED` job and a verified standards-compliant export are different statements.

Use [Testing](TESTING.md) and [Verification](VERIFICATION.md) for repeatable validation and release evidence. Use [Operations](OPERATIONS.md) for deployment configuration and resource limits, [Formats and Semantics](FORMATS_AND_SEMANTICS.md) for preservation limits, and [API](API.md) for job status and per-attempt batch metadata.
