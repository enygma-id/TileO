# TileO output formats

This catalog describes outputs supported by the application. Availability depends on the selected pipeline and export options; it does not mean every format has been generated for a particular dataset. See [output validation](OUTPUT_VALIDATION.md) for checks and their limits.

| Output | Files | Contents |
| --- | --- | --- |
| Raster MBTiles | `.mbtiles` | PNG, JPEG, or WebP imagery tiles |
| Vector MBTiles | `.mbtiles` | Mapbox Vector Tile (MVT/PBF) payloads |
| Raster PMTiles | `.pmtiles` | Optional PMTiles v3 archive of imagery tiles |
| Vector PMTiles | `.pmtiles` | Optional PMTiles v3 archive of MVT payloads |
| Elevation COG | `elevation.tif` | Numeric DEM/DSM/DTM selected explicitly as elevation |
| Scientific COG | `scientific.tif` | Single-band numeric values, with their NoData, scale, offset, and units |
| Terrain-RGB | `terrain.mbtiles`, optional `terrain.pmtiles` | PNG tiles encoding heights using the Mapbox formula |
| Terrarium | `terrain.mbtiles`, optional `terrain.pmtiles` | PNG tiles encoding heights using the Terrarium formula |
| 3D Tiles 1.1 | `tileset.json`, `tiles/*.glb` | Geographically placed model and generated levels of detail |
| 3D Tiles 1.0 compatibility | `tileset.json`, `tiles/*.b3dm` | Optional compatibility package with embedded GLB content |
| Original GLB | `.glb` | The uploaded model, unchanged |
| glTF companion | `original.gltf`, `original.bin` | The original GLB split into a JSON description and binary buffer |

COG uses the `.tif` extension. MBTiles and PMTiles use the plural extensions shown above. A 3D Tiles dataset consists of a tileset and referenced content; this application does not export a `.3dtiles` database.

## Download packages

| Package | Contents |
| --- | --- |
| `*-tiles.zip` | `tiles.mbtiles` and `tiles.pmtiles` when PMTiles export is enabled |
| `*-elevation.zip` | Elevation COG, terrain MBTiles, manifest, and optional terrain PMTiles |
| `*-3dtiles.zip` | Modern tileset, generated GLBs, original GLB/glTF/BIN models, manifest, and README |
| `*-b3dm.zip` | Compatibility tileset, B3DM content, and README |
| `*-gltf.zip` | Original model's glTF description and BIN buffer |

ZIPs are assembled when downloaded. A ZIP need not exist as a persistent file in `data/output`. Terrain workflows retain an elevation COG alongside the encoded tiles. The imagery pipeline produces tile archives; it has no separate imagery COG export option.

## Service responses and supporting files

- XYZ and WMTS return individual PNG/JPEG/WebP or MVT tile payloads. XYZ URLs have no extension; inspect their HTTP content type.
- WMTS `GetCapabilities` returns XML for jobs containing tile archives. COG-only, scientific, and 3D jobs do not expose WMTS tiles.
- Terrain TileJSON returns JSON with the selected encoding and coverage.
- Source comparison returns a bounded GeoJSON preview for vectors or a PNG preview for imagery. These previews are not full dataset exports.
- Browser COG previews generate temporary colored PNG tiles from TIFF range reads.
- `manifest.json` records numeric raster metadata or 3D placement. `README.md` explains a 3D package. Process logs use `.log`.

Original GLB/glTF models use local coordinates. Geographic placement belongs to the tileset transform and package manifest. Tile archives may clip, quantize, resample, or duplicate features across zoom levels; preserve the authoritative source separately.
