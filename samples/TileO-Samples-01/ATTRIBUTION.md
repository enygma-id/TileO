# Attribution and Cross-Project Provenance

**Collection:** [TileO-Samples-01](README.md)  
**Original dataset project:** [ATAP](https://github.com/enygma-id/atap)  
**Rights holder / publisher as declared:** PT Enygma Solusi Negeri (Enygma)  
**Data license:** [CC BY 4.0](LICENSE-CC-BY-4.0.md)

## ATAP Sample Area 01 — included

The following three original datasets are supplied together and verified against the unchanged [ATAP SHA-256 manifest](MANIFEST.sha256):

- [`data/footprints.geojson`](data/footprints.geojson): 37 manually delineated building footprints; original geometry and coordinates retained, provenance metadata added by ATAP.
- [`data/dsm.tif`](data/dsm.tif): clipped DSM from Enygma drone survey.
- [`data/dtm.tif`](data/dtm.tif): clipped DTM from Enygma drone survey.

**Suggested attribution:**

> ATAP Sample Area 01 (building footprints, DSM and DTM), created by Enygma, licensed under Creative Commons Attribution 4.0 International (CC BY 4.0). Originating project: ATAP (https://github.com/enygma-id/atap). Changes: none to the reused original ATAP sample files.

An attribution to ATAP recognizes the **originating research/workflow**; the ATAP source-code license is independent of these files. The original package's [license notice](LICENSE-DATA.md) and [source README](ATAP_SOURCE_README.md) are retained without edits.

## TileO RGB GeoTIFF — included

**Source:** Enygma / TileO (`data/rgb-tif.tif`). This dataset belongs to the TileO sample collection and is separate from the three-input ATAP source archive and checksum manifest.

**Suggested attribution:**

> RGB GeoTIFF (`rgb-tif.tif`), © 2026 PT Enygma Solusi Negeri, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Published with TileO-Samples-01. Changes: [none / describe your changes].

## Downstream transformation

If you filter, reproject, convert, resample, aggregate or tile the datasets, cite the source and state material modifications as required by CC BY 4.0. Output data does not inherit TileO's AGPL merely because TileO created it. The original ATAP coordinates are unchanged and potentially identifiable as a real location; do not describe this dataset as geographically anonymized.
