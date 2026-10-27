# TileO Native Runtime License & ELF Closure Review — Historical Candidate

**Date:** 26 October 2026  
**Audited Artifact:** Container Image `tileo-ts:local` (`FROM scratch`)  
**Image Digest:** `sha256:df649e03300d1a6dec065111a069ecd25505c2113801771d8e112b072a5b35dd`  
**Target policy:** Predominantly permissive third-party components with three precisely reviewed GCC/CA exception candidates. **Review status: HISTORICAL / NOT RELEASE CERTIFICATION.** The candidate image identity below is not evidence that a later release image has passed.

---

## 1. Executive Summary

This document records engineering observations for an earlier **candidate image**, not a certified production release. Any reported `ALLOW` below is a historical source-level decision, not automatic approval for another image; the three exceptions remain pending until release-specific evidence and human signoff.

Through the migration from Debian trixie to an isolated `FROM scratch` musl container environment:
1. The team reported no unexpected LGPL/GPL libraries beyond the **known GPL-with-GCC-exception runtimes**, which cannot honestly be described as zero copyleft.
2. `libidn2`, `libunistring`, and `libpsl` (which were pulled by default Debian and Alpine curl packages) have been **completely eliminated**.
3. `libcurl` 8.14.1 is compiled from source with `-DCURL_USE_LIBPSL=OFF -DUSE_LIBIDN2=OFF -DCURL_USE_OPENSSL=ON -DUSE_NGHTTP2=ON -DCURL_ZLIB=ON`.
4. `GEOS` is disabled (`-DGDAL_USE_GEOS=OFF`). All vector MVT tiling is performed permissively via `src/vector-mvt.ts` and Tippecanoe 2.79.0.
5. The historical report described 37 ELF objects scanned via `scanelf`; results require revalidation against the exact final image, including embedded/static code, source compliance and authorized exceptions.

---

## 2. ELF Closure and Dynamic Linkage Audit

The table below summarizes the dynamic linkage of every binary and shared library in the final rootfs, verified by `scripts/audit-image.js`:

| Binary / Library Path | Soname / Target | Direct Dependencies (`DT_NEEDED`) | Effective License | License Verdict |
|---|---|---|---|---|
| `/usr/local/bin/node` | `node` v24.13.1 | `libstdc++.so.6`, `libgcc_s.so.1`, `libc.musl-x86_64.so.1` | MIT / Node core + bundled | **ALLOW** |
| `/usr/local/bin/tippecanoe` | `tippecanoe` v2.79.0 | `libsqlite3.so.0`, `libz.so.1`, `libstdc++.so.6`, `libgcc_s.so.1`, `libc.musl-x86_64.so.1` | BSD-2-Clause + Clipper2 (BSL-1.0) | **ALLOW** |
| `/usr/local/bin/gdalinfo` | GDAL CLI | `libgdal.so.36`, `libstdc++.so.6`, `libgcc_s.so.1`, `libc.musl-x86_64.so.1` | MIT | **ALLOW** |
| `/usr/local/bin/gdalwarp` | GDAL CLI | `libgdal.so.36`, `libstdc++.so.6`, `libgcc_s.so.1`, `libc.musl-x86_64.so.1` | MIT | **ALLOW** |
| `/usr/local/bin/gdal_translate` | GDAL CLI | `libgdal.so.36`, `libstdc++.so.6`, `libgcc_s.so.1`, `libc.musl-x86_64.so.1` | MIT | **ALLOW** |
| `/usr/local/bin/ogr2ogr` | OGR CLI | `libgdal.so.36`, `libstdc++.so.6`, `libgcc_s.so.1`, `libc.musl-x86_64.so.1` | MIT | **ALLOW** |
| `/usr/local/lib/libgdal.so.36` | GDAL 3.11.4 core | `libproj.so.25`, `libsqlite3.so.0`, `libz.so.1`, `libcurl.so.4`, `libexpat.so.1`, `libopenjp2.so.7`, `libwebp.so.7`, `libpng16.so.16`, `libjpeg.so.8`, `libstdc++.so.6`, `libgcc_s.so.1`, `libc.musl-x86_64.so.1` | MIT / GDAL Style | **ALLOW** |
| `/usr/local/lib/libproj.so.25` | PROJ 9.6.2 core | `libsqlite3.so.0`, `libcurl.so.4`, `libstdc++.so.6`, `libgcc_s.so.1`, `libc.musl-x86_64.so.1` | MIT | **ALLOW** |
| `/usr/local/lib/libcurl.so.4` | Custom curl 8.14.1 | `libssl.so.3`, `libcrypto.so.3`, `libnghttp2.so.14`, `libz.so.1`, `libc.musl-x86_64.so.1` | curl (MIT/X11-style) | **ALLOW** |
| `/app/node_modules/better-sqlite3/...` | native addon | `libsqlite3.so.0`, `libstdc++.so.6`, `libgcc_s.so.1`, `libc.musl-x86_64.so.1` | MIT | **ALLOW** |
| `/usr/lib/libwebp.so.7` | WebP library | `libsharpyuv.so.0`, `libc.musl-x86_64.so.1` | BSD-3-Clause | **ALLOW** |
| `/usr/lib/libsharpyuv.so.0` | SharpYUV | `libc.musl-x86_64.so.1` | BSD-3-Clause | **ALLOW** |
| `/usr/lib/libsqlite3.so.0` | SQLite 3.47.2 | `libc.musl-x86_64.so.1` | Blessing (Public Domain) | **ALLOW** |
| `/usr/lib/libssl.so.3` | OpenSSL 3.3.3 | `libcrypto.so.3`, `libc.musl-x86_64.so.1` | Apache-2.0 | **ALLOW** |
| `/usr/lib/libcrypto.so.3` | OpenSSL 3.3.3 | `libc.musl-x86_64.so.1` | Apache-2.0 | **ALLOW** |
| `/usr/lib/libnghttp2.so.14` | nghttp2 1.64.0 | `libc.musl-x86_64.so.1` | MIT | **ALLOW** |
| `/usr/lib/libexpat.so.1` | Expat 2.6.4 | `libc.musl-x86_64.so.1` | MIT | **ALLOW** |
| `/usr/lib/libopenjp2.so.7` | OpenJPEG 2.5.3 | `libc.musl-x86_64.so.1` | BSD-2-Clause | **ALLOW** |
| `/usr/lib/libpng16.so.16` | libpng 1.6.44 | `libz.so.1`, `libc.musl-x86_64.so.1` | libpng-2.0 | **ALLOW** |
| `/usr/lib/libjpeg.so.8` | libjpeg-turbo 3.0.4 | `libc.musl-x86_64.so.1` | IJG / BSD-3-Clause | **ALLOW** |
| `/usr/lib/libz.so.1` | zlib 1.3.1 | `libc.musl-x86_64.so.1` | Zlib | **ALLOW** |
| `/lib/ld-musl-x86_64.so.1` | Musl libc 1.2.5 | none (direct system calls) | MIT | **ALLOW** |

---

## 3. Review of Legal Exceptions

### Exception 1 & 2: GCC Runtime Library Exception 3.1 (`libstdc++` & `libgcc`)
- **Components:** `libstdc++.so.6.0.33` and `libgcc_s.so.1` (GCC 14.2.0, Alpine/musl).
- **Underlying License:** GPL-3.0-or-later with GCC Runtime Library Exception 3.1.
- **Legal Analysis:** Under Section 1 of the Runtime Library Exception 3.1, you have permission to propagate a work of Target Code formed by combining the Runtime Library with Independent Modules, even if such combination would otherwise violate GPL-3.0. Because TileO is compiled using an Eligible Compilation Process (standard GCC toolchain without proprietary high-level Intermediate Representation plugins), the combined work is exempt from copyleft terms. Proprietary and permissive redistribution of the resulting binary artifacts is explicitly permitted.
- **Policy status:** **EXCEPTION CANDIDATE — PENDING RELEASE-SPECIFIC APPROVAL.** GPL/GCC exception license texts are archived; corresponding source/access obligations for the exact shipped binary and human authorization still require evidence.

### Exception 3: Mozilla-derived CA trust-store material (`ca-certificates`)
- **Component:** `ca-certificates.crt` (Alpine / Mozilla NSS trust store).
- **Reported candidate license:** MPL-2.0; verify actual Mozilla/NSS and Alpine packaging terms for the distributed trust store.
- **Review note:** The candidate trust bundle is reported to derive from Mozilla NSS certificate data. A generic “Scope E” classification does not establish the actual applicable upstream/packaging licenses or satisfy source and notice obligations. Review the actual trust-store source, extraction method, versions, changes and any required source-access mechanism; unrelated proprietary application code is assessed separately.
- **Policy status:** **EXCEPTION CANDIDATE — PENDING RELEASE-SPECIFIC APPROVAL.** Existing license text is a starting point, not source/provenance fulfillment. The current corpus path to examine is `third-party/licenses/native/ca-certificates/`.

---

## 4. Historical Verification of Component Absence

The earlier candidate audit reported the following removals. Their absence must be rechecked on the final delivered artifact (and any embedded/static code), rather than inferred from these notes:
- `libidn2.so.*` (GNU Libidn2 - LGPL-2.1+ / GPL-2.0+) -> **ABSENT**
- `libunistring.so.*` (GNU Libunistring - LGPL-3.0+ / GPL-2.0+) -> **ABSENT**
- `libpsl.so.*` (Public Suffix List library - MIT / MPL-2.0) -> **ABSENT**
- `libgeos.so.*` / `libgeos_c.so.*` (GEOS - LGPL-2.1-only) -> **ABSENT**
- `procps` (`/bin/ps`, `/bin/top` - GPL-2.0+) -> **ABSENT**
- `coreutils` (`/bin/ls`, `/bin/cat`, etc. - GPL-3.0+) -> **ABSENT**
- `bash` (`/bin/bash` - GPL-3.0+) -> **ABSENT**
- `dpkg`, `apt` (Debian package managers - GPL-2.0+) -> **ABSENT**

---

## 5. Current Interpretation and Required Closure

The 28-component register and prior ELF scan support further release analysis, **not** a zero-copyleft or 100%-permissive certification. The intended Enterprise standard is **proprietary-compatible distribution based predominantly on permissive licenses, with three disclosed, independently approved exceptions**.

Before any production release: rebuild/reconcile the exact source and image identity; rerun the complete binary and license audit; provide corresponding-source/archive and applicable CA provenance; validate functional tests and fail-closed gates; record authorized human approval. See [exceptions](third-party/ENTERPRISE_EXCEPTIONS.md), [source access](third-party/SOURCE_ACCESS.md), and [release gate](third-party/RELEASE_GATE.md). For TileO v0.2.0, see [release-approval.md](release-approval.md) for official signoff.
