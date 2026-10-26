# Verification and Release Evidence

This guide defines repeatable checks for TileO releases. **It does not claim that any particular commit, native-tool build or container image has passed.** Verification results must be identified by exact versions, environment and artifact digests, not inferred from historical test reports.

## Candidate identity

Before testing, record the source commit, lockfile and build configuration, operating system and architecture, Node.js, GDAL, PROJ and Tippecanoe versions, enabled GDAL drivers, container image digest, and relevant configuration values. A locally tagged image name by itself is not an immutable identity.

## Development checks

From the repository root:

```sh
npm ci
npm run typecheck
npm run build
npm test
```

`npm test` may skip tests requiring native dependencies or an enabled integration environment. Record actual passed, failed and skipped counts, not merely the command's exit status. Check the relevant scripts in `package.json` for the current test entry points.

## Integration and browser checks

Run the repository's native-tool integration tests in a suitable environment with `TILEO_INTEGRATION=1`, Node test configuration, installed tools and representative fixtures. Run browser E2E tests against a live API and worker, setting `TILEO_TEST_URL` to the correct deployment URL as required by the suite. See [Testing](TESTING.md), [Tools](TOOLS.md) and [Installation](INSTALLATION.md).

Cover raster/COG and elevation encoding, vector tiling and batching, 3D packaging, CRS and NoData handling, download/preview, invalid input, cancellation, timeout, worker recovery, storage and security restrictions. Representative datasets and checksum-qualified fixtures are required for material compatibility or performance claims.

For vector batching specifically, compare `off/file`, `on/file` and `on/stream` when supported, including geometry, attributes, IDs, layer selection and resource use; see [Vector Batching](VECTOR_BATCHING.md). Explain intentional geometry quantization, clipping or feature thinning rather than suppressing differences.

## Artifact and license verification

For a distributable release, inspect the **actual final artifact**. Inventory npm packages, native executables and dynamically/statically linked dependencies, base-image packages, frontend assets and any included notices. Collect licenses and upstream provenance for the exact versions. Tie SBOM, license evidence and release authorization to the exact immutable artifact digest. An npm-only scan does not certify the complete runtime.

See [Dependency Policy](DEPENDENCY_POLICY.md), [Release Process](RELEASE_PROCESS.md) and [Native Components](../third-party/NATIVE_COMPONENTS.md). Do not equate completion of documentation with engineering remediation.

## Required evidence per release candidate

| Evidence | Minimum contents |
| --- | --- |
| Source and artifact identity | Commit, lockfile hash, image/build digest, platform |
| Toolchain details | Node, GDAL, PROJ, Tippecanoe, enabled drivers and relevant native libraries |
| Test results | Exact commands, pass/fail/skip counts, raw logs, fixtures and their SHA-256 hashes |
| Functional output | Representative output files, decoded semantic checks and resource measurements |
| Security and operations | Relevant negative tests, deployment limits and known unsupported targets |
| License compliance | SBOM, upstream license/notice archive, native dependency inventory and exceptions/blockers |
| Review | Reviewer, date, unresolved risks and an explicit GO/NO-GO decision |

**Release rule:** no failed required test, unresolved license blocker or unverified distributable component may be silently relabeled as passed. Where support is deliberately out of scope, state it explicitly in the product's supported-platform and release notes.
