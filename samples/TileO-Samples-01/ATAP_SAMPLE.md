# ATAP Sample Area 01 — Cross-Project Dataset

**Originating project:** [ATAP by Enygma](https://github.com/enygma-id/atap)  
**Reused in:** [TileO-Samples-01](README.md)  
**Data license:** [CC BY 4.0 — original ATAP data notice](LICENSE-DATA.md)  
**Integrity:** [ATAP manifest](MANIFEST.sha256)

## Included inputs

| File | Original creator/production method | CRS | Role |
| --- | --- | --- | --- |
| [`data/footprints.geojson`](data/footprints.geojson) | Enygma; manual delineation of 37 buildings | WGS 84 lon/lat (GeoJSON) | Footprints with preserved original coordinates/IDs and added provenance metadata |
| [`data/dsm.tif`](data/dsm.tif) | Enygma; clipping from its own drone-survey DSM | EPSG:32750 | Surface elevation input |
| [`data/dtm.tif`](data/dtm.tif) | Enygma; clipping from its own drone-survey DTM | EPSG:4326 | Terrain elevation input |

These creator and ownership statements come from the original ATAP sample package supplied by Enygma. The files are not a cadastral or surveyed-accuracy benchmark. The original coordinates were retained, so the sample is **not geographically anonymized**.

## Intended pipeline

```text
data/footprints.geojson ──┐
                          ├── inspect CRS, bounds, attributes
  data/dsm.tif ───────────┤
  data/dtm.tif ───────────┘
       │
       ├── TileO: supported vector / COG / raster tile conversions
       └── ATAP: DSM + reprojected DTM → nDSM → building-mass research
```

**Do not subtract DSM and DTM arrays without reprojection, grid alignment and appropriate interpolation.** Different coordinate systems and pixel grids require deliberate preparation. Converting these inputs using TileO does not imply TileO implements the complete ATAP decomposition engine.

## Original upstream documentation

The original sample includes a complete [README](ATAP_SOURCE_README.md), unchanged [LICENSE-DATA.md](LICENSE-DATA.md) and [MANIFEST.sha256](MANIFEST.sha256). The SHA-256 file verifies the exact bytes of the three ATAP inputs placed in this collection's `data/` directory. Enygma's [ATAP repository](https://github.com/enygma-id/atap) is acknowledged as the originating project; the repository homepage is not represented as an immutable file-asset URL.

## Suggested attribution

> ATAP Sample Area 01 (37 manually delineated footprints, DSM, DTM), created by Enygma, licensed under CC BY 4.0. Originating project: ATAP (https://github.com/enygma-id/atap). Changes: none to the copied sample data files.

If you change, resample, filter or transform the input, cite the original sample and describe your changes. See [ATTRIBUTION.md](ATTRIBUTION.md).
