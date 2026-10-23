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

## Actual build versus historical alternatives

The repository's current [`Dockerfile`](../Dockerfile) and [`compose.yaml`](../compose.yaml) determine what the default build attempts to create. Do not substitute a separately tested scratch/musl candidate or historical image report for the actual release artifact. Tool versions must be derived from the final image, not merely copied from earlier engineering reports.

The checked [CI workflows](../.github/workflows/) use **Node.js 24**. Runtime licensing is not established by this Node version setting.

## Compliance status

- [Tippecanoe notices](licenses/native/tippecanoe-2.79.0/) and [Lucide/Feather attribution](licenses/assets/lucide-icons/LICENSE-ISC-and-Feather-MIT.txt) are collected in this repository.
- Native GDAL/PROJ and all linked library copyright/license files must still be reconciled against the final distributed artifacts.
- Prior investigation reported possible LGPL/copyleft transitive components in alternative images; **do not assert their presence or absence in the current production image without a build-level audit**.
- See [Dependency Policy](../docs/DEPENDENCY_POLICY.md), [License Coverage](LICENSE_COVERAGE.md), and [Release Gate](RELEASE_GATE.md).
