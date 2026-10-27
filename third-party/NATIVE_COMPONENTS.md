# Native Dependencies and Distribution Licenses

TileO uses native geospatial tools and a Node.js runtime. **Their licensing and third-party notices depend on the exact versions, build flags, linked libraries and container images that are distributed.** This inventory is a starting point for release verification, not a complete license grant or a proof that the container is free of copyleft components.

| Component | Function | Licensing observation | Verification needed for release |
| --- | --- | --- | --- |
| GDAL | Raster/vector conversion and inspection | GDAL core uses permissive-style terms; drivers and linked libraries can introduce additional licenses | Preserve exact source-version LICENSE/NOTICE and the enabled-driver/library closure |
| PROJ | CRS transformation | Core license is permissive-style; bundled data and libraries have their own attribution | Preserve exact upstream notices and data terms |
| Tippecanoe | Vector tiling | BSD-2-Clause core; additional code notices apply | Refer to [Tippecanoe notices](licenses/native/tippecanoe-2.79.0/) and verify built binary |
| Node.js | API/worker runtime | Runtime distributes its own bundled third-party software | Verify bundled runtime license corpus for the actual binary |
| SQLite and `better-sqlite3` | Queue and persistence | SQLite is public-domain; addon npm metadata declares MIT | Check specific binaries and linked libraries |
| System libc and support libraries | Native execution | May include license exceptions, weak-copyleft or stronger-copyleft components | Audit package manifest and linked binaries in the actual image |
| libcurl and related libraries | Transfer and URL access | libcurl core license does not establish licensing of transitively linked `libpsl`, `libidn2`, `libunistring`, etc. | Inspect runtime closure and preserve or remove dependencies according to policy |
| Certificate trust bundle | TLS validation | Data and redistribution terms are separate from npm code | Record source, revision and applicable notice obligations |

## Narrowly scoped third-party exception candidates

The current source register lists **28 native components**. The following three components require exact-artifact review; they are **not permissively licensed** merely because their use may be compatible with proprietary TileO code.

| ID | Candidate | Terms to verify | Required proof |
| --- | --- | --- | --- |
| EXC-001 | `libstdc++.so.6*` (GCC runtime) | Applicable GPL and GCC Runtime Library Exception 3.1 | Exact file hashes, GCC source/patches/build recipe, notices, source access, authorization |
| EXC-002 | `libgcc_s.so.1` (GCC runtime) | Applicable GPL and GCC Runtime Library Exception 3.1 | Same; matched GCC source may cover both binaries if verified |
| EXC-003 | Mozilla-derived CA trust-store material | Actual NSS/certificate and packaging licenses, potentially MPL-related | Source revision, generation procedure, exact trust-store hash, notices, source access and authorization |

See [public exception disclosure](ENTERPRISE_EXCEPTIONS.md) and [source access](SOURCE_ACCESS.md). Actual inclusion and licensing must be proven from the distributed image, not inferred solely from this register.

## Actual build versus historical alternatives

The repository's current [`Dockerfile`](../Dockerfile) and [`compose.yaml`](../compose.yaml) determine what the default build attempts to create. The RC9 Dockerfile uses a multi-stage build with final `FROM scratch`; do not treat this architectural choice or a historical image report as proof of the next distributed artifact. Tool versions must be derived from the final image, not merely copied from earlier engineering reports.

The checked [CI workflows](../.github/workflows/) use **Node.js 24**. Runtime licensing is not established by this Node version setting.

## Compliance status

- [Tippecanoe notices](licenses/native/tippecanoe-2.79.0/) and [Lucide/Feather attribution](licenses/assets/lucide-icons/LICENSE-ISC-and-Feather-MIT.txt) are collected in this repository.
- Native GDAL/PROJ and all linked library copyright/license files must still be reconciled against the final distributed artifacts.
- Prior investigation reported possible LGPL/copyleft transitive components in alternative images; **do not assert their presence or absence in the current production image without a build-level audit**.
- See [Dependency Policy](../docs/DEPENDENCY_POLICY.md), [License Coverage](LICENSE_COVERAGE.md), and [Release Gate](RELEASE_GATE.md).
