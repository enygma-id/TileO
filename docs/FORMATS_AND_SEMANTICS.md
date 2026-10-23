# Formats, conversions, and semantics

This matrix describes input/output workflows in the current TileO application and their geospatial interpretation. It is **not a blanket conformance certificate** for every input file, external driver, or deployment environment.

| Input class | Documented supported input | Documented outputs | Important qualification |
| --- | --- | --- | --- |
| Raster imagery | Affine-georeferenced byte grayscale/RGB/RGBA | COG and optional tile archives | Palette rasters require preprocessing; source accuracy is not improved by encoding |
| Numeric raster | Single-band numeric GeoTIFF | COG; if explicitly elevation, Terrain-RGB / Terrarium tile archives | DSM/DTM/DEM vs scientific raster must be explicitly selected; do not assume source vertical datum |
| Vector | GeoJSON, GeoPackage, FlatGeobuf, zipped Shapefile | MVT-based MBTiles and optional PMTiles | Vector tile quantization/clipping can be lossy; preserve mode still has technical limits |
| 3D | Self-contained GLB 2.0 | 3D Tiles 1.1 ZIP, optional B3DM package | Placement / transform / units required; not all glTF extensions are accepted |

## Coordinate reference systems

Inspection should report declared source CRS, coordinate units, georeference, extent and transformations. A **CRS override** that simply assigns metadata is not reprojection and should never be described as such. For elevation rasters, horizontal CRS and **vertical datum** must be handled separately.

## Elevation and numeric raster

- Preserve scale/offset, NoData and available unit information when producing a COG.
- A DEM/DSM/DTM is not interchangeable with NDVI/temperature or other scientific raster.
- Terrain-RGB stores heights at 0.1-m increments. The encoding introduces up to 0.05 m of *encoding-rounding* error, separately from any resampling error; that is **not geodetic accuracy**.
- Terrarium encodes at 1/256-m increments within its numeric range.
- Edge and NoData fill values may create artificial slopes. Unknown vertical reference must remain unknown.
- Quantized-mesh output is not included in the documented output contract.

## Vector preservation limits

Tile archives are for map delivery, not a replacement for the authoritative source vector dataset. Clipping, quantization, MVT geometry restrictions, and precision changes require documentation. Even a preservation-oriented option is not bitwise identity.

## 3D placement and packaging

The 3D processing workflow provides GLB placement options based on geographic location, orientation and scale, with both 3D Tiles 1.1 and B3DM-compatible packaging. A local GLB coordinate system is not geographic placement by itself. Do not claim support for all Draco, instancing, skins or morph-target inputs.

## Validation

A successful output requires structure, metadata, driver-specific assertions, and representative sample checks. See [VERIFICATION.md](VERIFICATION.md); do not claim certification from a partial validation procedure.
