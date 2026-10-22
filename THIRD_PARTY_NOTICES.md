# TileO — Third-Party Notices

TileO is developed with open-source libraries and external command-line tools. **Their licenses remain those of their original authors**. TileO's AGPL-3.0-only license covers Enygma-controlled original Community Edition material; it does not relicense GDAL, Node.js, npm packages, native libraries, bundled icons, or data.

## Complete third-party license materials supplied with this founding package

| Coverage | Location | What it contains |
| --- | --- | --- |
| **284 npm package entries** | [Full versioned inventory](third-party/DEPENDENCIES.md) and [machine-readable manifest](third-party/MANIFEST.json) | Exact Clean 4 package lockfile names, versions, SPDX metadata, flags, SHA-256 hashes, and **individual notice/licensing texts for every entry** in [`third-party/licenses/npm/`](third-party/licenses/npm/) |
| npm notice corpus | [Clean 4 reference notices](third-party/reference/THIRD-PARTY-NOTICES.CLEAN4.md) | The combined generated source notices, preserved for traceability |
| Native GIS stack | [Native components](third-party/NATIVE_COMPONENTS.md) | GDAL/OGR, PROJ, Tippecanoe, Node/runtime and build-linked libraries; exact image licenses to be certified per release |
| Tippecanoe notices | [Tippecanoe license set](third-party/licenses/native/tippecanoe-2.79.0/) | BSD-2-Clause and relevant bundled subcomponent notices from the documented snapshot |
| Icon and asset rights | [Asset license registry](third-party/ASSET_LICENSES.md) and [Lucide/Feather notices](third-party/licenses/assets/lucide-icons/LICENSE-ISC-and-Feather-MIT.txt) | License obligations for Lucide-derived SVGs; separately notes OSM data and TileO branding |
| Legal completeness | [License coverage](third-party/LICENSE_COVERAGE.md), [upstream verification](third-party/UPSTREAM_VERIFICATION.md) and [release gate](third-party/RELEASE_GATE.md) | Scope limits, outstanding original-notice retrieval and image auditing |

**Snapshot basis:** `Tileo-Clean4.zip`; Clean 4 npm lockfile SHA-256 `70a37f180438e667479f0b8e29fbe282a020930397afc8dd964b403599897a61`. Its **284** dependency entries have archived notice texts, but **36** were generated from license-metadata fallback text because an upstream notice file was not available to the generator. Such texts are not a substitute for exact-version upstream copyright notices. Do not claim they have been independently verified until compared with the actual npm tarballs/release artifacts.

## Multiple-license selections

The Clean 4 generated notices record intended permissive options: `jszip@3.10.2` — MIT under `MIT OR GPL-3.0-or-later`; `expand-template@2.0.3` — MIT under `MIT OR WTFPL`; `rc@1.2.8` — BSD-2-Clause under the offered BSD/MIT/Apache alternatives; `@maplibre/mlt@1.3.0` — MIT under `MIT OR Apache-2.0`. These **do not** change the upstream license text and must be rechecked if versions change.

## Native libraries and container images

The Clean 4 reference notices identify a restricted GDAL/PROJ build and Tippecanoe. They also identify residual LGPL/GPL license choices in the historical minimal-image **spike** through `libcurl → libpsl → libidn2/libunistring`, and an MPL-covered certificate bundle. A candidate runtime Docker image must be assessed independently. Neither a clean npm lockfile nor a library's permissive core license certifies all binary/native transitive dependencies.

The imported application's Dockerfile, its full linked ELF inventory and deployed image are authoritative for **which components are actually distributed**, not this founding documentation alone. See [native components](third-party/NATIVE_COMPONENTS.md).

## Data, typography and trademark separation

OpenStreetMap geographical datasets are licensed under ODbL and can have separate tile-service usage restrictions. An optional connection to such data is not a license for the application source. Third-party sample imagery, models, raster data and fonts must have documented origin and distribution rights. The [TileO brand assets](assets/branding/README.md) are separate from library licenses and do not automatically grant trademark rights.

## Before publishing software or Enterprise deliverables

Resolve exact runtime dependencies, reproduce original license/NOTICE files and any modified-source notices, build a binary-aware SBOM, and review Enterprise relicensing rights. [Read the release license checklist](third-party/RELEASE_GATE.md). Third-party license obligations apply independently of TileO's Community or Enterprise license.
