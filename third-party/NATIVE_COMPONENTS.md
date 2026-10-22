# Native Tools, System Packages and Non-npm Rights

## Scope

This is a careful summary of the *TileO Clean 4 evidence*, not a fresh decompilation or validated inventory of a downloadable final container. Core project licenses do not automatically account for binaries, enabled GDAL drivers and their linked dependencies.

| Component | Snapshot description | License note | Distribution requirement |
|---|---|---|---|
| GDAL 3.11.4 restricted build | Raster/vector conversion | MIT-style core, additional notices may apply by source/driver/build | Ship exact version `LICENSE.TXT` and linked library notices |
| PROJ 9.6.2 | Coordinate transformations | MIT-style core | Preserve relevant notices and any bundled data licensing |
| Tippecanoe 2.79.0 | Vector tiling | BSD-2-Clause; additional Clipper2/Mapbox notices | Exact files supplied in `licenses/native/` |
| Node.js 24 | API / worker runtime | MIT core and bundled upstream notices | Inspect exact runtime distribution |
| SQLite / better-sqlite3 addon | Queue and data storage | SQLite public domain; addon MIT by npm metadata | Document bundled sqlite native build and linked libraries |
| musl / libc, libstdc++, gcc support | Candidate scratch container | mixed permits/license exceptions depending on build | Identify precise packages and static/dynamic closure |
| libcurl / libpsl | URL and transfer support | MIT-style libcurl but additional transitive requirements | Build-specific notices, ELF closure |
| libidn2 2.3.8, libunistring 1.4.2 | Reported in `tileo:min-musl` | `GPL-2.0-or-later OR LGPL-3.0-or-later` reported | Not strict-permissive-only; remove/rebuild or document compliance |
| ca-certificates-bundle | Public trust anchors | MPL-2.0 reported in candidate | Preserve actual certificate bundle terms, scope separately |
| libpng, libjpeg-turbo, libwebp, zlib, expat, openjpeg | Raster ecosystem | various permissive/mixed component notices | Capture exact version licenses from final image |

## Distinguish build targets

Clean 4's **main `Dockerfile`** still has a Debian-based runtime stage. The `baseline/docker/Dockerfile.musl-min` file represents a **scratch/musl candidate**, not necessarily the image built and released by default. Both must not be described interchangeably. `release-gate.yml` in the implementation snapshot currently requests Node 22, contradicting its Node 24 engine requirement. These are code-import/release tasks, not barriers to publishing documentation.

See [source scope](../docs/TECHNICAL_BASELINE.md) and [release checks](RELEASE_GATE.md).


## Clean 4 reference versus release image

The Clean 4 repository has a multi-stage `Dockerfile` with a restricted GDAL/PROJ build and a `compose.yaml` that builds this Dockerfile; `baseline/docker/` also contains historical scratch/musl and glibc spike Dockerfiles. The image identified in those spike reports is **not automatically the image produced by the project root**. License/version differences in these artifacts require verification against the actual released image and its linked libraries.
