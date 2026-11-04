# Test coverage and evidence

TileO has unit, native integration, browser, release-tooling, and independent output-conformance checks. The presence of a test is not evidence that it ran on a particular commit or image.

| Area | Relevant tests and checks |
| --- | --- |
| Raster and vector pipelines | [Pipeline tests](../src/tests/pipeline.test.ts), vector adapters, MVT geometry/ID/attribute tests |
| Elevation and scientific rasters | [Elevation tests](../src/tests/elevation.test.ts): COG values, NoData, scale/offset, numeric types, units, and terrain encoding |
| 3D | [Model tests](../src/tests/model3d.test.ts), [validation tests](../src/tests/model3d-validation.test.ts), and independent Cesium/Khronos checks |
| Tile delivery | [Distribution tests](../src/tests/distribution.test.ts): MBTiles/PMTiles, XYZ/WMTS, downloads, and deletion |
| Publication gate | [Output validation tests](../src/tests/output-validation.test.ts): strict failures and incomplete reports cannot be accepted |
| Browser | [Playwright tests](../src/browser): upload, preview, comparison, downloads, and error handling |
| Release | Source-access, CA rebuild, final SBOM, notices, approval proof, and negative-control checks |

## Commands

- `npm test`: build, Node tests, and release-tooling regression checks. Native integration tests may skip unless `TILEO_INTEGRATION=1` and their tools are installed.
- `npm run test:browser`: Playwright against a running isolated API/worker instance.
- `npm run check:docs`: validate maintained documentation links and reject references to ignored local evidence in public guides.
- `npm run validate:outputs`: generate synthetic outputs and run the independent validators described in [Output Validation](OUTPUT_VALIDATION.md).

CI preserves conformance reports even when a required check fails. Inspect per-test failures and skips; a successful process exit alone is not a conformance result. Browser/native tests are not implied by a passing typecheck or unit-only run.

## Limits

Fixtures are representative and generally small. They do not prove all driver combinations, geometry types, data sizes, browser/device combinations, vertical datums, glTF extensions, or production capacity. Raster resampling and vector quantization/clipping require separate quality assessment. Read [Testing](TESTING.md), [Verification](VERIFICATION.md), and the exact run artifacts before making a compatibility claim.
