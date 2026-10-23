# Samples

TileO publishes a reproducible collection of **geospatial input datasets**, with dedicated documentation, provenance, licensing and verification. Dataset licensing is separate from TileO's [AGPL-3.0-only software license](../LICENSE).

## Sample collection

| Collection | Contents | Origin | Data license |
| --- | --- | --- | --- |
| **[TileO-Samples-01](TileO-Samples-01/README.md)** | `footprints.geojson` (37 features), `dsm.tif`, `dtm.tif`, `rgb.tif` | Enygma: [ATAP Sample Area 01](https://github.com/enygma-id/atap) (first three); Enygma/TileO (RGB) | **[CC BY 4.0](TileO-Samples-01/LICENSE-CC-BY-4.0.md)** |

The three ATAP-origin files retain their original [ATAP data license](TileO-Samples-01/LICENSE-DATA.md), [source documentation](TileO-Samples-01/ATAP_SOURCE_README.md) and [SHA-256 manifest](TileO-Samples-01/MANIFEST.sha256). RGB is a separate TileO-origin input and does not alter the ATAP source manifest. File-level credit is in [ATTRIBUTION.md](TileO-Samples-01/ATTRIBUTION.md).

**Usage:** these are demonstration inputs, not a claim of cadastral ground truth or geospatial accuracy certification. Original ATAP coordinates remain potentially identifying. Observe the [sample-data policy](../docs/SAMPLE_DATA_POLICY.md) and the different DSM/DTM coordinate systems before numerical elevation operations.
