# TileO Architecture Direction

This document describes the documented design and processing model for TileO, informed by the TileO Clean 4 TypeScript reference implementation. Specific runtime claims must be verified in the canonical release source and tests.

## Purpose

TileO is designed as a geospatial conversion and distribution layer rather than a GIS authoring desktop application.

At a high level:

```text
Source data
   ↓
Inspection / metadata validation
   ↓
Normalized job descriptor
   ↓
Queue + worker
   ↓
Format-specific processing
   ↓
Validation / manifest
   ↓
Preview + download + API delivery
```

## Data families

The current project direction covers four broad data families:

1. **Imagery raster** — georeferenced imagery prepared for efficient web delivery.
2. **Numeric / elevation raster** — DEM/DSM/DTM or other numeric surfaces where semantic purpose and vertical metadata must not be guessed from a filename alone.
3. **Vector** — common GIS vector formats converted into web-consumable tile archives.
4. **3D** — georeferenced or explicitly placed 3D content packaged for interoperable 3D delivery.

## Distribution artifacts

The implementation direction includes interoperable artifacts such as:

- Cloud Optimized GeoTIFF (COG);
- MBTiles;
- PMTiles;
- Terrain-RGB / Terrarium-style elevation tiles where selected;
- 3D Tiles packages; and
- manifests/metadata describing generated outputs.

Not every input supports every output.

## Processing model

The candidate implementation is intentionally simpler than a distributed cluster architecture: a single API and worker can share a local queue and data directory for a controlled self-hosted deployment.

This baseline should not be represented as multi-tenant or horizontally scalable unless and until the implementation changes and verification proves those properties.

## External tooling

TileO may invoke established geospatial tooling such as GDAL and Tippecanoe and may use JavaScript/TypeScript libraries for map, tile, raster, storage, and 3D workflows.

The exact versions and licensing obligations must be recorded when source code is imported. See [../THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).

## Design principles

- Preserve source meaning rather than infer semantics aggressively.
- Make lossy/resampled outputs explicit.
- Keep validation evidence proportional to the claims made.
- Treat vertical reference and CRS metadata as first-class information.
- Prefer interoperable artifacts over proprietary lock-in.
- Keep resource limits and failure behavior observable.
- Separate source provenance from generated artifacts.
- Keep public documentation aligned with actual tested behavior.


---

**Snapshot note:** This founding documentation describes the TileO Clean 4 implementation baseline. Actual commands, integrations, drivers, versions, test results and release images must be verified when code is imported. See [Technical baseline](TECHNICAL_BASELINE.md) and [Release policy](RELEASE_POLICY.md).
