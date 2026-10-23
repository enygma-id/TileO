# License verification protocol

Use this checklist whenever importing source or publishing a distributable TileO build.

1. Match the candidate `package-lock.json` checksum to [`MANIFEST.json`](MANIFEST.json). If it changed, regenerate the package table and license evidence from the **new** dependency closure.
2. Run `npm ci` in the approved source tree. Record `npm ls --all --json` and inspect every installed `package.json` license expression and any bundled source assets.
3. For each packaged dependency, copy **the exact upstream license and NOTICE/COPYRIGHT files from that package's pinned tarball**; do not copy the latest upstream `main` license to represent an old version.
4. Prioritize all entries marked `generated_notice_only` in `MANIFEST.json`. Replace or supplement standard fallback texts with the upstream copyright notice required for redistribution.
5. Record license elections only where the upstream license explicitly offers alternatives. `AND` conditions impose cumulative requirements.
6. Generate a binary/container SBOM from the actual release image, including Node executable, native addons (`better-sqlite3`), GDAL drivers, Tippecanoe, PROJ data and linked ELF libraries. Compare the machine-reported package list with direct filesystem `ldd`/`readelf` checks and the image build definition.
7. Audit any license-linked/copyleft native dependencies, e.g. `libidn2`, `libunistring`, `libpsl`, plus certificate bundle and data licenses. The policy may allow compliance with LGPL but cannot assert strict permissive-only while nonpermissive dependencies remain distributed.
8. Preserve full upstream notices within the binary/image release, sign or checksum the artifact, generate SPDX and CycloneDX SBOMs, and record a human approval for any remaining policy exception.
9. Evaluate Enygma's chain of title/contributor grants separately; third-party permissiveness alone does not prove Enterprise relicensing rights.

This document defines the release-time license verification process. The 284 collected npm notices are repository inventory evidence; they do not establish that each upstream package tarball and its exact-version LICENSE/NOTICE files have been independently verified.
