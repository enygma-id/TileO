# TileO-Samples-01

**Enygma GIS sample collection · ATAP cross-project provenance · CC BY 4.0 data license**

This sample collection follows the **[ATAP Sample Area 01](ATAP_SOURCE_README.md)** directory convention. It retains the source project's building footprints, DSM and DTM as unmodified file payloads, together with Enygma's RGB GeoTIFF for TileO raster/imagery workflows. The source project is [ATAP by Enygma](https://github.com/enygma-id/atap).

## Directory structure

```text
samples/TileO-Samples-01/
├── README.md                         # Collection catalogue and usage
├── ATAP_SAMPLE.md                    # ATAP source and processing context
├── ATAP_SOURCE_README.md             # Original ATAP README (unchanged)
├── LICENSE-DATA.md                   # Original ATAP data notice (unchanged)
├── LICENSE-CC-BY-4.0.md              # Collection scope and TileO RGB notice
├── ATTRIBUTION.md                    # Source-project attribution
├── MANIFEST.sha256                   # Original ATAP three-file integrity manifest
├── DATA_MANIFEST.json                # TileO collection metadata
├── RGB_GEOTIFF_SAMPLE.md             # RGB raster usage and verification
└── data/
    ├── footprints.geojson
    ├── dsm.tif
    ├── dtm.tif
    └── rgb-tif.tif
```

## Included data

| File | Origin | CRS / description | Workflow |
| --- | --- | --- | --- |
| [`data/footprints.geojson`](data/footprints.geojson) | ATAP / Enygma | WGS 84 lon/lat; 37 manually delineated footprints | Vector inspection and supported MBTiles/PMTiles |
| [`data/dsm.tif`](data/dsm.tif) | ATAP / Enygma | EPSG:32750; drone-survey DSM clipping | Elevation and raster conversion |
| [`data/dtm.tif`](data/dtm.tif) | ATAP / Enygma | EPSG:4326; drone-survey DTM clipping | Terrain-reference inspection |
| `data/rgb-tif.tif` | TileO / Enygma | RGB GeoTIFF; inspect source for actual CRS, bands and NoData | Imagery inspection, COG and raster tiles |

Original ATAP coordinates remain unchanged; this sample is **not geographically anonymized**. The files serve interoperability research and demonstration, **not** cadastral/surveying-grade accuracy claims.

## TileO exercises

1. Start the TileO application from the root [Quick Start](../../README.md#quick-start) after its application source is incorporated.
2. **Vector:** inspect `data/footprints.geojson`, convert using a supported vector workflow and validate output geometry and attributes.
3. **DSM/DTM:** inspect rasters independently. Because DSM and DTM use different CRSs, resample/reproject to a common CRS, pixel grid, resolution and extent before any `nDSM = DSM − DTM` calculations. TileO does not claim to reproduce the full ATAP building-mass decomposition pipeline.
4. **RGB:** inspect `data/rgb-tif.tif`, confirm actual raster metadata and run a supported COG or raster tile conversion. See [RGB_GEOTIFF_SAMPLE.md](RGB_GEOTIFF_SAMPLE.md).
5. Record source metadata, processing options, output format, relevant checks and any loss of attributes/geospatial semantics.

See [TileO formats and semantics](../../docs/FORMATS_AND_SEMANTICS.md) and [verification guidance](../../docs/VERIFICATION.md).

## Data integrity

The original [ATAP `MANIFEST.sha256`](MANIFEST.sha256) verifies **only** `footprints.geojson`, `dsm.tif` and `dtm.tif`. It remains unchanged so provenance can be compared to the original source ZIP.

```sh
# Run from samples/TileO-Samples-01 on macOS:
shasum -a 256 -c MANIFEST.sha256

# Or on Linux:
sha256sum -c MANIFEST.sha256
```

The RGB file has separate collection-level metadata in [DATA_MANIFEST.json](DATA_MANIFEST.json) and does not alter the ATAP manifest. For the full pre-publication sample verification procedure, see [Sample Data Policy](../../docs/SAMPLE_DATA_POLICY.md).

## Licensing and cross-project credit

All four sample inputs are designated **[Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE-CC-BY-4.0.md)** data. The ATAP-origin trio additionally retains the [original ATAP data notice](LICENSE-DATA.md), [unaltered source README](ATAP_SOURCE_README.md) and [integrity manifest](MANIFEST.sha256). Suggested source-specific attribution is in [ATTRIBUTION.md](ATTRIBUTION.md).

This data license does not apply to TileO/ATAP application code, third-party software or Enygma trademarks. Please credit Enygma, identify ATAP as the originating project for its three files, and disclose changes to any dataset derivatives.
