# Engineering verification strategy

## Coverage categories

| Category | Verification objective |
| --- | --- |
| Parsing and inspect | Reject invalid inputs; detect CRS, georeferencing and metadata accurately |
| Raster | COG layout, dimensions, NoData, scale/offset, full-resolution values, representative previews |
| Terrain | Decode tiles at representative zoom levels; verify encoding semantics and boundary handling |
| Vector | Verify geospatial extent, feature behavior, source-vs-tile limitations and loss disclosure |
| 3D | Validate tileset schema/structure, placement transforms and actual loadability |
| API | Contract tests, negative paths, auth, size limits and concurrency/race behavior |
| Worker | Queue recovery, cancellation/retry semantics, timeouts, scratch limits and atomic publication |
| Security | Upload parsing, URI validation, SSRF, path traversal, archive bombs, credentials and signed URL leakage |
| Deployment | Container and native smoke tests; health signals, backup and recovery checks |
| Licensing | Dependency inventory, binary and driver attribution, SBOM and contributor-rights review |

## Standard before publication

Each material capability claim must have a reproducible command/test, known configuration, input fixture, expected behavior, observed result and date. An assertion in a document is not evidence of a successful test run. Keep public limitations and failures discoverable.

The reference snapshot includes Node test scripts and Playwright browser test files. Their presence alone does not mean the full suite passed in the current environment.


---

**Snapshot note:** This founding documentation describes the TileO Clean 4 implementation baseline. Actual commands, integrations, drivers, versions, test results and release images must be verified when code is imported. See [Technical baseline](TECHNICAL_BASELINE.md) and [Release policy](RELEASE_POLICY.md).
