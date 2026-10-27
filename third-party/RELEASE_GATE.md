# Third-Party and Binary Release Gate

**Applicability:** Every published TileO Community binary/image and every Enterprise distributable. Source publication alone does not certify an executable distribution.

## Technical and legal acceptance checks

- [ ] Freeze a clean source commit; record `package-lock.json`, native manifest and Dockerfile hashes.
- [ ] Build one candidate artifact. Record its local image ID, architecture, SHA-256 digests and published OCI digest when available; avoid treating a mutable tag as an immutable identity.
- [ ] Create final-image SPDX/CycloneDX SBOMs and **complete filesystem/binary inventories**; examine npm packages, static/embedded binaries, ELF dependencies, GDAL drivers, frontend assets, data and certificate material.
- [ ] Reject non-permissive components not specifically documented and human-approved. Detect restricted vendor binaries even when the parent npm package declares MIT/BSD.
- [ ] Match all notices, license texts and provenance to exact shipped components. Metadata-only cases require special examination if shipped.
- [ ] For **EXC-001 `libstdc++`** and **EXC-002 `libgcc`**, confirm the exact binary filenames/hashes, applicable GPL and GCC Runtime Library Exception, source package versions/patches/build instructions and a legally adequate corresponding-source delivery mechanism.
- [ ] For **EXC-003 Mozilla-derived CA trust store**, confirm the shipped file hashes, original source form and packaging lineage, actual licenses/notices and source availability where required; do not rely on an unverified generic “MPL data exception.”
- [ ] Provide recipients of both Community and Enterprise binaries a working, release-specific [source access route](SOURCE_ACCESS.md) and required license/notice material. Private Enterprise terms never override third-party recipient rights.
- [ ] Run required API, worker, vector, raster, elevation, 3D, browser and security/regression suites on the actual candidate; preserve raw TAP/test logs and machine-readable pass/fail/skip counts.
- [ ] Validate baseline source hashes, image identity, SBOM freshness, evidence integrity and exception register with fail-closed controls. Reject missing evidence and unsigned authorizations.
- [ ] Collect authorized Legal/IP and Release Engineering human signoff **for the same immutable artifact** before tag or publication; retain private customer/contracts data outside the public repository.
- [ ] Verify the published GHCR image digest equals the approved artifact and publish matching release notes, notices and applicable source-access information.

## Status interpretation

- **PERMISSIVE:** Exact package and any bundled materials verified under eligible permissive terms.
- **EXCEPTION CANDIDATE:** Narrowly scoped GCC runtime or CA component; **not** automatically approved.
- **APPROVED EXCEPTION:** Evidence complete and authorized, tied to a specific release artifact.
- **BLOCKED:** Missing source/license/identity, unknown component, unsupported exception, failed test or absent human approval.

No release-wide “all permissive” or “zero copyleft” claim is valid while approved non-permissive exceptions are included. See [Dependency Policy](../docs/DEPENDENCY_POLICY.md), [Exceptions](ENTERPRISE_EXCEPTIONS.md) and [Native Components](NATIVE_COMPONENTS.md).
