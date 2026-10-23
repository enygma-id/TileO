# RGB GeoTIFF — `data/rgb.tif`

**Origin:** Enygma / TileO  
**Data license:** [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE-CC-BY-4.0.md)  
**Location in collection:** `samples/TileO-Samples-01/data/rgb.tif`

## Purpose

The RGB GeoTIFF is the imagery member of **[TileO-Samples-01](README.md)**, alongside the three ATAP-origin datasets. Use it to exercise source-raster inspection, georeferencing checks, supported COG creation, raster tiling and visual preview.

## Inspection and processing

- Inspect the actual CRS, image dimensions, pixel size, bounds, number and order of bands, data type, color interpretation and NoData/alpha semantics.
- Do not infer those values solely from the filename or assume the raster has exactly three bands before inspection.
- Choose suitable output compression and resampling for imagery; verify georeferencing, color and preview quality against the source.
- Record any reprojection, lossy compression, filtering or color adjustments when redistributing derivatives.

For GDAL-equipped environments, this inspection command reports the file's declared metadata:

```sh
gdalinfo samples/TileO-Samples-01/data/rgb.tif
```

For application usage see the root [Quick Start](../../README.md#quick-start), [installation guide](../../docs/INSTALLATION.md) and [TileO format semantics](../../docs/FORMATS_AND_SEMANTICS.md).

## Integrity and provenance

The RGB file is tracked separately from the preserved [ATAP three-input checksum manifest](MANIFEST.sha256), because it is a TileO-origin sample. Its file metadata and SHA-256 belong in the [collection data manifest](DATA_MANIFEST.json); the original ATAP manifest must remain unchanged. See the [sample data policy](../../docs/SAMPLE_DATA_POLICY.md) for publication verification.

**Attribution:** “RGB GeoTIFF (`rgb.tif`), © 2026 PT Enygma Solusi Negeri, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Source: TileO-Samples-01. Changes: [describe changes or state none].”
