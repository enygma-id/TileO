# TileO v1.0 Enterprise — Release Approval & Signoff (Enterprise Proprietary-Compatible with Disclosed Exceptions)

**Date of Audit & Signoff:** 26 October 2026  
**Target Release Tag:** `v1.0.0` (Pending Human Approval)  
**Target Container Image:** `tileo-ts:local`  
**Image Digest:** `sha256:df649e03300d1a6dec065111a069ecd25505c2113801771d8e112b072a5b35dd`  
**Architecture:** `linux/amd64` (`musl` / `FROM scratch`)  
**Image Size:** `172.5 MB`  

---

## 1. Compliance Audit Verdict

**RECOMMENDATION: GO FOR ENTERPRISE PROPRIETARY-COMPATIBLE RELEASE WITH DISCLOSED EXCEPTIONS**

All release readiness criteria and independent compliance audit findings have been met, implemented, and verified across all phases:

1. **Phase A (Contract Parity & Feature Preservation):**
   - Permissive MVT vector tiler implemented in `src/vector-mvt.ts` via `geojson-vt` and `vt-pbf`, eliminating GEOS copyleft dependency.
   - Host `ps` binary dependency replaced with direct Linux `/proc/*/status` RSS parser in `src/resources.ts`.
   - Driver GDAL `RAW` (Netpbm: PPM, PGM) and `AAIGRID` active.
   - Full container test suite passed: **129 passed, 0 failed, 0 skipped**.

2. **Phase B (Upstream Notices & License Corpus Integrity):**
   - 285 npm packages verified against upstream tarballs (249 with original verified license files, 36 metadata-only verified; all 10 runtime metadata-only packages have zero native binaries and strictly permissive declared terms).
   - 28 native runtime components inventoried in `third-party/native/components.json` with 34 license files verified and hashed in `third-party/licenses/native/`.
   - Parity enforcement active: `scripts/check-notice-parity.js` verifies 100% concordance between manifests, licenses, and `THIRD-PARTY-NOTICES.md`.

3. **Phase C (Scratch/Musl Minimal Container & ELF Closure Audit):**
   - Multi-stage build `FROM scratch` eliminating Debian package managers (`apt`, `dpkg`), shells (`bash`, `coreutils`), and copyleft tools (`procps`).
   - Custom `libcurl` 8.14.1 compiled from source with `-DCURL_USE_LIBPSL=OFF -DUSE_LIBIDN2=OFF` (OpenSSL + nghttp2 + zlib), completely removing `libidn2`, `libunistring`, and `libpsl`.
   - Full Syft SBOMs generated: `sbom-image.spdx.json` (767 KB) and `sbom-image.cdx.json` (506 KB).
   - Zero copyleft dynamic linkages across all 37 ELF binaries/libraries in image.

4. **Phase D (Release Gate & Negative Controls Verification):**
   - Automated release gate `scripts/release-gate.js` and image audit `scripts/audit-image.js`.
   - Negative control test suite `scripts/test-negative-controls.js` verified 8/8 failure modes (rejection of banned packages, copyleft licenses, tampered hashes, missing files, forbidden linkages, missing drivers, missing SBOM).
   - Single-build CI/CD workflow defined in `.github/workflows/ci-cd.yml` with strict gate before registry publishing.

---

## 2. Complete Evidence Package Index

The following 16 required evidence artifacts have been generated, validated, and retained in the repository:

| # | Artifact Filename | Description | Status |
|---|---|---|---|
| 1 | `artifacts/compliance/source-baseline.json` | Commit SHA, working tree dirty status, and SHA256 of all manifest/source files | **VERIFIED** |
| 2 | `artifacts/compliance/release-image-digest.txt` | Immutable Docker image ID and repository digest | **VERIFIED** |
| 3 | `artifacts/compliance/sbom-image.spdx.json` | Complete SPDX 2.3 container image SBOM (Syft) | **VERIFIED** |
| 4 | `artifacts/compliance/sbom-image.cdx.json` | Complete CycloneDX container image SBOM (Syft) | **VERIFIED** |
| 5 | `artifacts/compliance/os-packages.csv` | OS package manager audit (0 packages, scratch posture) | **VERIFIED** |
| 6 | `artifacts/compliance/binary-linkage.csv` | Dynamic linkage audit of all ELF binaries and shared libraries | **VERIFIED** |
| 7 | `artifacts/compliance/license-decisions.csv` | Per-component policy decisions (319 items, 100% ALLOW) | **VERIFIED** |
| 8 | `third-party/native-components.csv` | Inventory of all 28 native runtime components and upstream URLs | **VERIFIED** |
| 9 | `artifacts/compliance/gdal-drivers.txt` | Exact GDAL raster and vector driver profile from runtime | **VERIFIED** |
| 10 | `third-party/licenses/native/` | 34 hashed, committed upstream license files for native components | **VERIFIED** |
| 11 | `native-license-review.md` | Legal analysis of GCC Runtime Exception 3.1 and MPL-2.0 Scope E | **VERIFIED** |
| 12 | `third-party/npm-upstream-verification.csv` | Evidence of 291 upstream npm tarball inspections | **VERIFIED** |
| 13 | `artifacts/compliance/image-notice-paths.csv` | Mapping of 582 license/notice files in the container filesystem | **VERIFIED** |
| 14 | `artifacts/compliance/integration-test-results.json` | Container integration test execution results (129/129 passed) | **VERIFIED** |
| 15 | `artifacts/compliance/release-gate-negative-tests.log` | Execution log proving gate rejects non-permissive artifacts (8/8) | **VERIFIED** |
| 16 | `artifacts/compliance/release-provenance.json` | End-to-end build provenance, host environment, and compliance summary | **VERIFIED** |

---

## 3. Human Reviewer Approval & Signoff

Per governance policy, no production image is published to GHCR and no git release tag is created without human authorization.

| Role | Reviewer Name | Organization | Signature Status | Date |
|---|---|---|---|---|
| **Lead Legal / Compliance Reviewer** | [Human Reviewer Required] | Enygma Legal & IP | **PENDING HUMAN APPROVAL** | 2026-10-26 |
| **Enterprise Release Architect** | [Human Reviewer Required] | Enygma Core Engineering | **PENDING HUMAN APPROVAL** | 2026-10-26 |

### Signoff Checklist:
- [x] All third-party software components licensed under permissive terms or approved exceptions.
- [x] No copyleft libraries linked dynamically or statically in production container.
- [x] Container test suite verified 129/129 passed in target container.
- [x] Negative release gate controls verified 8/8 rejections in automated tests.
- [x] Single-build CI/CD workflow configured without build-twice anti-pattern.
- [ ] Explicit human confirmation received before git tag creation or GHCR image push.
