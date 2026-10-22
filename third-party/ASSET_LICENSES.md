# Third-Party UI Assets and Geospatial Data

## Lucide / Feather icon SVGs

Clean 4 source `src/web/icons.ts` includes copied inline SVG icon paths from Lucide. The Lucide project uses ISC; its upstream LICENSE additionally identifies Feather-derived glyphs and retains a corresponding MIT copyright statement. The selected license text is archived as a **current-upstream reference**, not a version-pinned npm tarball notice, at [Lucide and Feather license](licenses/assets/lucide-icons/LICENSE-ISC-and-Feather-MIT.txt). Retain these notices with any code or binary that distributes the SVGs. The initial documentation commit does **not** contain the SVG source itself.

## Basemap and sample data

The neutral basemap defaults documented in Clean 4 mean no OpenStreetMap data is automatically redistributed with the founding docs. When enabled, OSM has ODbL-1.0 data licensing, separate service-use restrictions and attribution. Operators need their own rights for third-party PMTiles, imagery, DEM/DSM/DTM, 3D models and captured images. See [sample data policy](../docs/SAMPLE_DATA_POLICY.md).

## Fonts / logos

No Font Awesome runtime dependency appears in Clean 4 `package-lock.json`. This says nothing about copied imagery, screenshots, fonts or marks in future code. Do not assume project ownership of third-party trademarks.


## TileO branding (user-provided PNG files)

[`tileo-logo-light.png`](../assets/branding/tileo-logo-light.png) and [`tileo-logo-dark.png`](../assets/branding/tileo-logo-dark.png) are official project branding supplied separately from the source archive, not npm dependencies. They are included unchanged. Their presence is not an open trademark grant; see [brand usage](../assets/branding/README.md).
