<div align="center">
  <a href="https://tileo.org/" title="TileO Official Website">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/branding/tileo-logo-dark.png">
      <source media="(prefers-color-scheme: light)" srcset="assets/branding/tileo-logo-light.png">
      <img src="assets/branding/tileo-logo-light.png" alt="TileO" width="420">
    </picture>
  </a>

  <p>
    <a href="https://tileo.org/">Official Website</a>
    &nbsp;·&nbsp;
    <a href="#quick-start">Quick Start</a>
    &nbsp;·&nbsp;
    <a href="#samples">Samples</a>
  </p>
</div>

# TileO

**GIS-native geospatial conversion, tiling, and interoperable distribution.**

**TileO** is an open-source geospatial processing and publication toolkit founded by **Enygma**. It brings raster imagery, elevation surfaces, vector datasets, and georeferenced 3D content into formats that can be inspected, converted, validated, distributed, and consumed through modern GIS and web-rendering applications. TileO is designed around open formats, explicit geospatial semantics, inspectable processing, and deployment under the operator's control.

**Project history:** [Founding team and contributors](FOUNDING_TEAM.md).

## Why TileO

Traditional geospatial conversion frequently requires users to know low-level command-line flags, toolchains, tile container conventions, map projection rules, storage configuration, and format-specific limitations. TileO provides a coherent processing workflow spanning **source inspection → deliberate conversion choices → bounded processing → output validation → preview and distribution**.

Its central promise is **interoperability without silently changing the meaning of source data**. Source CRS, raster bands, NoData, scale/offset, height units, vertical reference, and 3D placement are material facts, not optional decoration. Where information is missing or a conversion is lossy, TileO aims to make that explicit.

## Capabilities and supported workflows

| Domain | Source and processing workflow | Output / consumption |
| --- | --- | --- |
| Imagery | Inspect georeferenced rasters; normalize imagery; apply explicit output choices | COG, raster tile archives, web preview |
| Elevation | Inspect numeric GeoTIFF and distinguish DEM/DSM/DTM from non-elevation scientific rasters | COG, optional Terrain-RGB or Terrarium MBTiles/PMTiles |
| Vector | Read supported vector sources; use GDAL-based normalization and vector tiling strategies | MBTiles / PMTiles containing vector tiles |
| 3D | Inspect self-contained GLB; configure geographic placement and packaging | 3D Tiles 1.1 packages and B3DM compatibility packages |
| Delivery | Job API, local queue, worker, download, source inspection and previews | Browser-based workflow and machine-readable API |

**Format compatibility is conditional, not universal.** Some outputs require specific input types, external tools, explicit coordinates, or chosen conversion strategies. See [the compatibility and semantics matrix](docs/FORMATS_AND_SEMANTICS.md).

## How it works

```text
                  ┌────────────────────────────┐
                  │  Geospatial source inputs  │
                  │ raster · vector · 3D model │
                  └──────────────┬─────────────┘
                                 │
                        Inspect and preflight
                                 │
                  CRS · metadata · provenance
                                 │
                    Explicit job configuration
                                 │
                    Queue · worker · budgets
                                 │
               ┌─────────────────┼─────────────────┐
               ▼                 ▼                 ▼
           GDAL paths       vector tiling       3D processing
               │                 │                 │
               └─────────────────┼─────────────────┘
                                 ▼
                   Validation and manifests
                                 │
                 COG · MBTiles · PMTiles · 3D Tiles
                                 │
                Browser preview · API · download
```

TileO uses **TypeScript/Node.js**, a single API process, a single worker, **SQLite-backed job management**, local filesystem outputs, **GDAL**, and **Tippecanoe** where applicable. This architecture is intentional for controlled self-hosting; it is **not a claim of multi-node clustering or unrestricted parallel conversion**. Full design: [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Principles

1. **GIS-native first.** Keep CRS, georeferencing, height semantics, and data lineage visible.
2. **Interoperable outputs.** Favor COG, MBTiles, PMTiles, MVT, glTF, and 3D Tiles where appropriate.
3. **No silent semantics.** Explicitly distinguish elevation from arbitrary numeric raster data; disclose vertical datum and precision limits.
4. **Validation by evidence.** Do not confuse successful task completion with exhaustive file conformance.
5. **Practical self-hosting.** Budget time, memory, disk and subprocess workloads; document operational constraints.
6. **Traceable processing.** Keep provenance and manifest information with generated deliverables.
7. **Transparent ecosystem.** Preserve upstream notices, dependencies, and external tool licenses.

## Quick start

TileO runs as a **single-host** TypeScript/Node.js API and worker with a local SQLite job queue, local storage, GDAL and Tippecanoe. Run the following commands from the root of this repository.

### Prerequisites

| Component | Docker Compose | Native installation |
| --- | --- | --- |
| Container runtime | Docker Desktop or Docker Engine with Compose | Not required |
| Node.js | Provided by the image | `>=24.13.0 <25` |
| GDAL | Provided by the image | GDAL 3.8+ with necessary drivers |
| Tippecanoe | Provided by the image | Needed for Preserve vector tiling; preferred for Density |
| System resources | SSD space for source, scratch and output; at least 8 GB RAM recommended for larger inputs | Capacity depends on dataset size and conversion |

**Start with [Tools & Prerequisites](docs/TOOLS.md)** for operating-system installation, helper commands, executable discovery, and troubleshooting. Native GDAL is necessary for raster processing; Docker avoids host-level native tool setup.

### Docker Compose (Windows, macOS and Linux)

Use Docker Desktop with Linux containers (Windows/macOS) or Docker Engine with the Compose plugin (Linux). From the repository root:

```sh
docker compose up -d --build
docker compose exec worker node dist/doctor.js
docker compose logs -f worker
```

Open **http://localhost:8090**. The API and worker share a named data volume. Do not use `docker compose down -v` unless intentionally deleting persisted TileO data. Allow **at least 8 GB RAM** for larger datasets and sufficient SSD space; memory needs depend on source size and conversion.

### Native (without Docker)

Requires **Node.js >=24.13.0 <25**, GDAL **3.8+** with the required drivers, and Tippecanoe for preferred vector tiling.

```sh
cp .env.example .env
npm ci
npm run build
npm run doctor
npm start
```

`npm start` launches the API and worker. For separate service-manager processes, use `npm run api` and `npm run worker` with the same data directory. **Do not run multiple workers against the same SQLite queue.**

### Test and verification

```sh
npm test
npm run typecheck
npm run release:gate
```

See [Tools & Prerequisites](docs/TOOLS.md) for platform-specific GDAL and Tippecanoe setup, [Installation](docs/INSTALLATION.md) for detailed first-run instructions, [Testing](docs/TESTING.md) for integration/browser checks, and [Operations](docs/OPERATIONS.md) for deployment and security. Test results depend on the installed native tools and environment.

## Samples

TileO publishes **[TileO-Samples-01](samples/TileO-Samples-01/README.md)**, a reproducible sample collection combining Enygma's **[ATAP Sample Area 01](samples/TileO-Samples-01/ATAP_SAMPLE.md)** and an RGB GeoTIFF for TileO raster workflows.

The **ATAP cross-project sample** consists of 37 manually delineated building footprints, a Digital Surface Model (DSM), and a Digital Terrain Model (DTM). Their original dataset license and checksum manifest are preserved, and the originating [ATAP GitHub project](https://github.com/enygma-id/atap) is credited here. The fourth input is Enygma's RGB GeoTIFF, included in the collection for image inspection and tiling exercises.

| Sample | Intended workflow | Provenance | Data license |
| --- | --- | --- | --- |
| **[Building footprints](samples/TileO-Samples-01/data/footprints.geojson)** — `footprints.geojson` | GeoJSON inspection, vector normalization, MBTiles/PMTiles | [ATAP Sample Area 01](samples/TileO-Samples-01/ATAP_SAMPLE.md) | [CC BY 4.0](samples/TileO-Samples-01/LICENSE-DATA.md) |
| **[Surface elevation](samples/TileO-Samples-01/data/dsm.tif)** — `dsm.tif` | GeoTIFF/COG inspection and supported elevation workflows | [ATAP](https://github.com/enygma-id/atap) | CC BY 4.0 |
| **[Terrain elevation](samples/TileO-Samples-01/data/dtm.tif)** — `dtm.tif` | Terrain-reference inspection and supported raster workflows | [ATAP](https://github.com/enygma-id/atap) | CC BY 4.0 |
| **[RGB GeoTIFF](samples/TileO-Samples-01/RGB_GEOTIFF_SAMPLE.md)** — `rgb.tif` | RGB imagery inspection, COG and raster tiling | Enygma / TileO | [CC BY 4.0](samples/TileO-Samples-01/LICENSE-CC-BY-4.0.md) |

**All four datasets are licensed as data under Creative Commons Attribution 4.0 International (`CC-BY-4.0`)** by Enygma as the declared rights holder. The three ATAP-origin files also retain the [original license notice](samples/TileO-Samples-01/LICENSE-DATA.md), [source README](samples/TileO-Samples-01/ATAP_SOURCE_README.md) and [SHA-256 manifest](samples/TileO-Samples-01/MANIFEST.sha256). This data license is **distinct from the `AGPL-3.0-only` software license** of TileO and ATAP. ATAP attribution recognizes the originating project; it does not relicense its software or imply that all ATAP datasets have the same license.

**Geospatial note:** the sample DSM uses EPSG:32750 and the DTM uses EPSG:4326. Reproject and align their grids, resolutions and extents before elevation differencing. The original ATAP sample coordinates remain identifiable as a real-world location, so this collection is not geographically anonymized.

**Sample size and tiling behavior:** TileO sample datasets are intentionally compact for quick downloads, functional testing, and reproducible workflows, rather than imagery quality or large-scale performance benchmarking. Tiled output size does not necessarily correlate with source file size: small rasters may generate larger tile archives due to zoom-level pyramids, encoding, and storage overhead, while large rasters may produce substantially smaller outputs depending on resolution, zoom range, and compression. For production validation and performance benchmarking, use representative datasets at their native resolution.

See the [sample catalogue](samples/README.md), [collection README](samples/TileO-Samples-01/README.md), [data manifest](samples/TileO-Samples-01/DATA_MANIFEST.json), [attribution guide](samples/TileO-Samples-01/ATTRIBUTION.md) and [sample policy](docs/SAMPLE_DATA_POLICY.md).
## API and integration

TileO provides source inspection, job management, artifact delivery, status endpoints, preview functions and a web console. See the [API reference](API.md), the [OpenAPI description](openapi.yaml), and [API compatibility policy](docs/API_CONTRACT.md).

## Community and Enterprise

**TileO Community Edition:** the Enygma-controlled original code published in this official repository is licensed under **GNU AGPL v3 only (`AGPL-3.0-only`)**, except for clearly identified third-party code or differently licensed files. Consult the complete [LICENSE](LICENSE), [NOTICE](NOTICE.md), and [third-party notices](THIRD_PARTY_NOTICES.md).

**TileO Enterprise Edition:** Enygma offers a **separate commercial licensing path**, subject to a signed agreement and demonstrable rights over the code concerned. Enterprise is not an exception embedded into the AGPL, nor does it diminish AGPL rights already granted. No proprietary Enterprise source code is implicitly included in this Community repository. See [ENTERPRISE.md](ENTERPRISE.md) and [CLA.md](CLA.md).

## Project stewardship and founding contributors

| Founding role | Contributor | Historic responsibility |
| --- | --- | --- |
| **Founder & Founding Vision Lead** | **[Erick Karya](https://github.com/erickkarya)** — Enygma CEO | Project conception, founding direction, and mandate |
| **Founding Prototype Engineer** | **[Hanafi](https://github.com/hanafi2274)** | First individual requested to develop the initial prototype |
| **Founding Official Implementation Engineer** | **[Dony](https://github.com/donyariefianto)** | Development of the official TileO implementation building on prototype knowledge |

This is **historical recognition**, independent of commit identity, source-file authorship, repository permissions, and employment status. Read [FOUNDING_TEAM.md](FOUNDING_TEAM.md), [PROJECT_HISTORY.md](docs/PROJECT_HISTORY.md), and [GOVERNANCE.md](GOVERNANCE.md).


## AI acknowledgement

TileO acknowledges the use of **AI-assisted tools** in portions of project research, technical exploration and documentation development. AI is a supporting tool—not a founding contributor, legal author or substitute for verification. Human contributors and Enygma remain responsible for technical decisions, code review, dataset provenance, licensing and publication within their respective rights and roles.

See the [AI Acknowledgement](AI_ACKNOWLEDGEMENT.md) for scope and accountability. Historical founding recognition remains independently documented in [FOUNDING_TEAM.md](FOUNDING_TEAM.md).

## Documentation index

| Topic | Document |
| --- | --- |
| Architecture, boundaries and data flow | [Architecture](docs/ARCHITECTURE.md) |
| Supported formats and geospatial semantics | [Formats and semantics](docs/FORMATS_AND_SEMANTICS.md) |
| Installation and operating model | [Installation](docs/INSTALLATION.md) · [Operations](docs/OPERATIONS.md) |
| API contract and integration | [API](docs/API.md) · [API contract](docs/API_CONTRACT.md) |
| Validation and engineering quality | [Verification](docs/VERIFICATION.md) · [Testing](docs/TESTING.md) |
| Founding and knowledge transfer | [Founding team](FOUNDING_TEAM.md) · [Project history](docs/PROJECT_HISTORY.md) |
| Roadmap and decisions | [Roadmap](ROADMAP.md) · [Architecture decisions](docs/DECISIONS.md) |
| Governance, security and contribution | [Governance](GOVERNANCE.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) |
| License and commercial rights | [License](LICENSE) · [Enterprise](ENTERPRISE.md) · [CLA](CLA.md) |
| Project branding | [Logo assets and usage](assets/branding/README.md) |
| Samples | [Sample catalogue](samples/README.md) · [TileO-Samples-01](samples/TileO-Samples-01/README.md) |
| AI transparency | [AI Acknowledgement](AI_ACKNOWLEDGEMENT.md) |
| Third-party licensing and provenance | [Notices](THIRD_PARTY_NOTICES.md) · [Inventory](third-party/DEPENDENCIES.md) · [Release compliance](third-party/RELEASE_GATE.md) |

## Contributing

We welcome rigorous, reproducible work on geospatial data conversion, reliability, tests, documentation, and interoperable output formats. Review [CONTRIBUTING.md](CONTRIBUTING.md), [GOVERNANCE.md](GOVERNANCE.md), [CLA.md](CLA.md), and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before opening a PR. Security issues belong in private disclosure channels described in [SECURITY.md](SECURITY.md).

---

**Founded by Enygma · Open GIS tooling · AGPL-3.0-only Community Edition · Separately licensed Enterprise Edition.**
