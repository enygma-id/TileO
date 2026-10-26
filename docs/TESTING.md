# Testing and Engineering Verification

TileO uses TypeScript build/type checks, Node.js tests, browser tests and native geospatial-tool checks. Each test result is specific to its configuration, sample inputs, tool versions and date.

## Standard commands

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run test:browser
```

`npm test` builds the application before running the Node test suite. Browser tests require a suitable browser environment. Some integration tests depend on GDAL, Tippecanoe, environment flags, representative files or accessible storage providers and may be skipped without those prerequisites. Consult [Tools & Prerequisites](TOOLS.md) and [Installation](INSTALLATION.md).

## Coverage categories

| Category | Verification objective |
| --- | --- |
| Parsing and inspection | Invalid inputs, CRS, bounds, raster metadata, vector schemas |
| Raster and elevation | COG structure, NoData, scale/offset, decoded terrain tiles and loss disclosure |
| Vector | Normalization, clipping/quantization, size limits and output validation |
| 3D | Packaging, GLB transforms, tileset structure and viewer loading |
| HTTP API | OpenAPI alignment, error paths, auth and upload limits |
| Worker | Recovery, cancellation, retries, timeouts and atomic artifact publication |
| Security | URL restrictions, traversal, resource exhaustion, credential redaction |
| Deployment | Docker/native smoke tests, disk limits, backup and recovery |
| Licensing | Source/asset notices, native dependencies, SBOM and contribution rights |

## Reporting evidence

For material capability claims record the exact commit, OS/architecture, Node/native versions, inputs, commands, observed outcomes, failures and skipped checks. Follow the repeatable checks in [Verification](VERIFICATION.md) and the batch-specific checks in [Vector Batching](VECTOR_BATCHING.md). Store dated test reports and raw evidence against the candidate commit and artifact digest; do not treat previous runs as certification of a new release.
