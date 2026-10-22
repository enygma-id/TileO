# Sample Dataset and Asset Provenance Policy

TileO's original software is licensed AGPL-3.0-only where identified; sample datasets carry separate explicit data licenses. The software license does not automatically relicense any input dataset, externally sourced content or output data.

## Required sample information

For each published dataset, document: creator/licensor, source project, production process, redistribution authority, exact filename, format, CRS and relevant vertical reference, byte length, SHA-256 digest, geographic/privacy review, data license, and mandatory attribution. Do not infer file-level raster properties from filenames.

## TileO-Samples-01 — cross-project collection

The collection is organized in [`samples/TileO-Samples-01/data/`](../samples/TileO-Samples-01/README.md) with the four named inputs:

| File | Source project | Scope |
| --- | --- | --- |
| [`footprints.geojson`](../samples/TileO-Samples-01/data/footprints.geojson) | [ATAP](https://github.com/enygma-id/atap) | 37 manually delineated footprints, WGS 84 lon/lat |
| [`dsm.tif`](../samples/TileO-Samples-01/data/dsm.tif) | ATAP | DSM, EPSG:32750 |
| [`dtm.tif`](../samples/TileO-Samples-01/data/dtm.tif) | ATAP | DTM, EPSG:4326 |
| `rgb-tif.tif` | TileO / Enygma | RGB GeoTIFF; source-specific metadata must be inspected |

Enygma designates all four datasets [CC BY 4.0](../samples/TileO-Samples-01/LICENSE-CC-BY-4.0.md). The ATAP-origin trio retains its original [data license](../samples/TileO-Samples-01/LICENSE-DATA.md), [source README](../samples/TileO-Samples-01/ATAP_SOURCE_README.md) and [unchanged original SHA-256 manifest](../samples/TileO-Samples-01/MANIFEST.sha256). RGB is maintained in the [TileO data manifest](../samples/TileO-Samples-01/DATA_MANIFEST.json), not appended retroactively to the ATAP source manifest.

The original ATAP coordinates were **not changed** and can identify the geographic area. These files are not a cadastral or surveyed-accuracy benchmark. For elevation differencing, the DSM and DTM require compatible CRSs, resolution, pixel grids and spatial extents.

## Pre-publication dataset integrity

Before publishing the repository with the complete dataset collection, check that all four payloads are present and their file metadata is consistent with the data manifest. Run the standard-library helper `python3 scripts/finalize-sample-rgb.py` to compute the RGB byte length and SHA-256 and update the collection manifest **without changing the original ATAP manifest**. Use `python3 scripts/finalize-sample-rgb.py --check` in local release verification to check the manifest against the present RGB payload. The helper does not invent or certify raster CRS, bands, acquisition provenance or accuracy.

If the large RGB sample uses Git LFS, confirm the published GitHub object resolves to the actual TIFF bytes rather than only an LFS pointer and that LFS storage/bandwidth are provisioned.

## Cross-project and third-party boundaries

Crediting ATAP identifies the originating research/workflow for its three files; it does not relicense its application code or assert that other ATAP datasets use CC BY 4.0. Third-party basemaps, OSM-derived data, external imagery, logos and libraries retain their own rights and obligations. State modifications when republishing data derivatives, and do not claim Enygma endorsement of downstream adaptations.
