> **Clean 4 implementation-reference document.** This preserves the README text supplied with the code snapshot. It is reference material, not the canonical root README and not an assertion that runnable source is present in the documentation-only founding commit. Relative links to unavailable code-only files have been replaced by descriptions.

# Tileo TypeScript Console

A separate implementation from the Python project. The UI is in English; GDAL handles raster and vector normalization, Tippecanoe handles vector tiles. Does not require Restate, Redis, or object storage.

Target: single host, single API, single worker, one active conversion job. SQLite stores the queue; the local filesystem stores input and generated tiles. Not a multi-tenant or cluster service.

## Docker: Windows, macOS, Linux

Install Docker Desktop in Linux containers mode on Windows/macOS, or Docker Engine + Compose plugin on Linux. Run from this folder:

```sh
docker compose up -d --build
docker compose exec worker node dist/doctor.js
docker compose logs -f worker
```

Open **http://localhost:8090**. Selecting a 2D raster or vector uploads it once for inspection: TileO detects its CRS, dimensions/resolution or layer/feature count, fills recommended conversion settings, and reuses that staged upload when you create the job. Inspected uploads expire after 30 minutes. Output is MBTiles. For GLB, the form reads latitude, longitude, and ellipsoid height only from location metadata that explicitly declares WGS84 or EPSG:4979. Ambiguous `CESIUM_RTC` metadata is reported but is not used automatically. Generic GLBs often have no geographic location metadata, so enter the placement manually when the fields remain empty. The main 3D ZIP contains 3D Tiles 1.1, the original GLB, a glTF 2.0 JSON/BIN pair, a manifest, and a README. Selecting B3DM compatibility creates a separate 3D Tiles 1.0 ZIP for older viewers.

Recognized GLB location metadata may be placed in root `extras` or `asset.extras`, for example: `{"location":{"crs":"EPSG:4979","latitude":-5.147,"longitude":119.433,"height":10}}`. Height is meters above the WGS84 ellipsoid.

Docker builds Tippecanoe for the container architecture and installs Linux GDAL. The project-local `tools` folder is ignored by the Docker build because the image supplies its own tools. Data resides in the named volume `tileo-ts_tileo-data`; `docker compose down` does not delete it. Do not use `down -v` unless you intend to delete all console data.

Provide at least 8 GB of RAM for Docker on large inputs; the worker is limited to 5 GB and the API to 512 MB. Use an SSD with tens of GB of free space. The first build requires internet; the worker tiling process does not.

## Native without Docker

Use Node.js **24.13+ within major 24**, GDAL **3.8+ with MBTiles and WebP drivers**, and Tippecanoe. Tested Linux image versions: GDAL 3.10.3 and Tippecanoe 2.79.0.

```sh
cp .env.example .env 
npm ci
npm run build
npm run doctor
npm start
```

`npm start` runs the API and worker as separate processes. With a production service manager, run `npm run api` and `npm run worker` as two services sharing the same data directory. Do not run two workers on the same data.

`NODE_ENV=production` makes the hosted console read-only for job creation. The Create button opens a local-install dialog, while the API rejects job creation and retry requests. Set `TILEO_REPOSITORY_URL=https://github.com/OWNER/REPOSITORY` so the dialog links to your repository and provides the correct `git clone` command.

Windows: GDAL can run natively from `tools/gdal/bin/gdal/apps`. Tippecanoe has no official native Windows install; use WSL2 or Docker for Tippecanoe, while TileO can fall back to GDAL for vector jobs. A `tools/bin` wrapper is only valid when WSL2 is installed and working. Per-OS environment instructions: [TOOLS.md](TOOLS.md).

Native environment is set through the shell/service manager or `.env`, which is loaded at startup.

### Clean export

Create a copy of this project without local state, secrets, or build artifacts (useful before publishing or archiving):

```bash
npm run copy:clean -- D:/path/to/export
```

The export keeps source, docs, scripts, and configs while skipping `node_modules`, `dist`, `data`, `test-results`, `.env*` secrets, logs, session notes, `tippecanoe`, `samples`, and `.git`. Add `--with-git` to keep repository history, `--with-samples` to keep sample payloads, `--force` to merge into an existing folder, or `--dry-run` to preview. Full guide: [CLEAN-EXPORT.md](CLEAN_EXPORT.md).

## Application version

The application version is stored in `package.json` and is exposed in the console footer and `/api/status`. Update it with npm when releasing a new build:

```sh
npm run release:patch
npm run release:minor
npm run release:major
```

Use `npm run version:show` to print the current version. These commands update `package.json` and `package-lock.json`; conversion jobs do not have separate dataset versions.

Create a release and trigger GitHub Actions with the matching tag:

```sh
npm run release:patch
npm run version:show
git add package.json package-lock.json
git commit -m "release: v0.1.2"
git tag v0.1.2
git push origin main --tags
```

Replace `0.1.2` with the version printed by `npm run version:show`. GitHub Actions runs `npm test` on pull requests and pushes to `main`. Pushing a matching `vMAJOR.MINOR.PATCH` tag additionally validates the version and publishes the Docker image to GHCR with both the version tag and `latest`. The workflow is the source `.github/workflows/ci-cd.yml` (available after code import).

## Intentional limits

- Imagery: Byte grayscale/RGB/RGBA with affine georeference. Palette imagery must be expanded beforehand.
- Numeric rasters: a single-band numeric GeoTIFF can be **Elevation** (DEM/DSM/DTM) or a **Scientific raster** (for example NDVI, temperature, or another measurement). The console requires this purpose to be confirmed. Elevation can create terrain tiles; Scientific raster creates a lossless COG with a false-color range preview and never represents values as heights.
- Vector: GeoJSON, GeoPackage, FlatGeobuf, zipped Shapefile. Include `.shp`, `.shx`, `.dbf`, `.prj`; select a layer in Source options if there are multiple layers.

## DSM / DTM distribution

1. Choose a georeferenced single-band GeoTIFF. Inspection shows data type, CRS, dimensions, NoData, scale/offset and any declared units or vertical CRS. Select DSM, DTM or unspecified DEM; the application does not infer surface type from a filename.
2. **COG** is the default output: lossless DEFLATE compression, internal overviews, unchanged full-resolution pixel values, source CRS, NoData and scale/offset. A source CRS override assigns a CRS without moving pixels. Unknown units and height reference are preserved as unknown. Full-resolution source and COG pixel bytes are compared with SHA-256 after conversion. Preview renders elevation colors directly on the MapLibre map using HTTP Range reads and COG overviews. NoData is transparent; source scale/offset is applied. Older jobs without COG preview metadata must be recreated.
3. **COG + Terrain-RGB MBTiles** additionally creates PNG elevation tiles for MapLibre/deck.gl. Recognized source units and vertical references are selected automatically and conflicting choices are rejected; ambiguous metadata still requires confirmation. The UI recommends a NoData display height below the valid source range. The COG retains original NoData; terrain uses the chosen synthetic height for missing pixels and space outside the source. This can create artificial slopes at coverage edges. No vertical datum transformation is performed; orthometric heights must not be treated as WGS84 ellipsoid heights when combining terrain with GLB models.
4. Terrain resamples numeric heights before RGB encoding, applies scale/offset and converts international feet to meters. Encoding increments are 0.1 m, with at most 0.05 m rounding error on the resampled height. This is encoding precision, not source survey accuracy. Terrain is limited to a non-wrapping Web Mercator extent, source-derived maximum zoom, tile count and scratch budgets. Use a correctly georeferenced file; terrain does not accept a CRS override.
5. COG-only download returns a `.tif`; terrain download returns a ZIP containing `elevation.tif`, `terrain.mbtiles` and `manifest.json`. Download the individual files with `?file=cog` or `?file=terrain`. Select **MBTiles + PMTiles** to add `terrain.pmtiles` to the ZIP, or download it with `?file=pmtiles`. The same additional archive option is available for imagery and vector jobs; these download as a ZIP containing `tiles.mbtiles` and `tiles.pmtiles`. MBTiles is retained for preview and tile serving. Completed outputs remain deletable and have no dataset versioning.

The existing GDAL installation supplies the COG and ENVI drivers and `gdal_translate`; no additional Python or terrain service is needed. `npm run doctor` reports COG availability. COGs are checked using GDAL layout metadata, dimensions, georeference, overviews, band metadata and SHA-256 comparison of full-resolution pixel bytes; this is not a standalone exhaustive TIFF structural validator. Terrain output validates representative first, middle and last PNG tiles at every zoom, including chunk checksums, dimensions and decoded row layout. Terrarium is also available: select **COG + Terrarium MBTiles** for lossless PNG encoding with 1/256 m increments and a height range of -32768 to 32767.99609375 m. Source accuracy is unchanged. Quantized-Mesh is not yet a supported output.

For a real GDAL check, build and run `TILEO_INTEGRATION=1 node --test dist/tests/elevation.test.js` (PowerShell: `$env:TILEO_INTEGRATION='1'; node --test dist/tests/elevation.test.js`). API options and terrain/COG endpoints are documented in [API.md](API.md) and the interactive API reference at `/docs`.
- 3D: self-contained GLB 2.0. Output is a structurally validated 3D Tiles 1.1 ZIP with `tileset.json` and generated GLB content under `tiles/`, plus `models/original.glb`, `models/original.gltf`, `models/original.bin`, `manifest.json`, and `README.md`. A separate B3DM ZIP mirrors the same hierarchy and LOD as a 3D Tiles 1.0 compatibility package. The glTF and BIN files must stay together. The original GLB and glTF use local coordinates; each `tileset.json` applies the geographic placement. You can also download the original GLB or glTF pair separately from the completed job. Small models remain one tile. Larger models receive up to three LOD levels and spatial child tiles. Placement supports base-center, origin, or model-center anchoring plus heading, pitch, roll, and scale. GLB units should be meters; scale is available for other units. Meshopt-compressed geometry is supported. Draco, GPU instancing, skins, and morph targets must be expanded or pre-baked before tiling. A large indivisible mesh receives LOD but cannot be divided spatially until it is separated into mesh nodes. If requested LOD generation fails or exceeds the configured worker memory budget, the job fails with a clear error instead of silently publishing one tile.
- Tippecanoe normalization writes 15 decimal places and keeps JSON-looking string attributes as strings. Preserve disables point thinning, line/polygon simplification and tiny-polygon reduction, with up to 16 bits of tile detail (capped by Tippecanoe's 32-bit internal coordinates). Clipping, quantization and polygon repair still apply; shapes smaller than the tile grid can disappear. MVT is not a lossless geometry archive. At zoom 16 with detail 16, the projected grid spacing is about 9.3 mm; source and CRS accuracy remain separate limits. Preserve needs Tippecanoe and can create large tiles; use fewer zoom levels to reduce cost.
- Density keeps lower zooms compact by dropping features and simplifying geometry, but disables simplification and tiny-polygon replacement at maximum zoom. It never extends the requested zoom range. Auto falls back to GDAL only when Tippecanoe cannot start and Density is selected; conversion failures remain errors. GDAL Density can reduce precision or discard features in oversized tiles. Thread, memory, scratch and job deadline limits still apply to both engines.
- Preserve is not rejected based on feature count multiplied by zoom levels; that number does not predict encoded output size. The worker enforces actual scratch usage, disk reserve, tool memory and deadline limits, plus the existing coverage-based maximum-zoom tile estimate.
- Defaults: one active upload, 16 GiB/input, 20 queued jobs, 32 GiB scratch/job, 2 hours/job, 8 MiB log/attempt. Completed results can be deleted from the job list.
- Zoom 22 remains expensive. WebP reduces file size/transfer but does not guarantee faster encoding. Reduce zoom if source resolution does not require it.
- Progress shows phases, not time estimates. Closing the browser does not cancel an accepted job.

## Tests

```sh
npm test
docker run --rm -e TILEO_INTEGRATION=1 tileo-ts:local node --test dist/tests/pipeline.test.js
```

Browser tests create real jobs. Use a disposable instance, not production data:

```sh
docker run --rm -d --name tileo-ts-smoke -p 127.0.0.1:8091:8090 -e TILEO_HOST=0.0.0.0 -e TILEO_LOCAL_PROXY=1 tileo-ts:local node dist/start.js
npm run test:browser
docker stop tileo-ts-smoke
```

Windows uses the installed Microsoft Edge. Linux/macOS: run `npx playwright install chromium` first.

Continue with [API](API.md), the implementation `openapi.yaml` (available after code import), [architecture](TYPESCRIPT_ARCHITECTURE.md), [cross-OS tools](TOOLS.md), [operations](OPERATIONS.md), and [verification reference](VERIFICATION.md).

When TileO is running, the same documents are available at `/docs` and `/openapi.yaml`.

WMTS 1.0 is available for completed imagery, vector and encoded terrain jobs at `/api/jobs/{id}/wmts?SERVICE=WMTS&REQUEST=GetCapabilities`. It exposes the WebMercatorQuad matrix set with XYZ row numbering. Encoded elevation PNGs require a client configured for Mapbox/Terrarium decoding; an ordinary WMTS imagery client displays their encoded colors. Authentication applies to WMTS as to XYZ. See [API.md](API.md) for GetTile parameters.

## LAN access and CORS

For native runs, add these values to `.env`, then restart with `npm start`:

```dotenv
TILEO_HOST=0.0.0.0
TILEO_PORT=8092
TILEO_ALLOW_LAN=1
TILEO_PUBLIC_ORIGIN=
```

Open `http://<server-LAN-IP>:8092` or `/docs` from another device. The API docs use the current server address. Allow inbound TCP port 8092 in the server firewall if necessary.

For Docker Compose, also set `TILEO_BIND_ADDRESS=0.0.0.0`, then run `docker compose up -d --build`. `TILEO_PORT` selects the published host port; the container continues listening on 8090.

For an HTTPS domain behind Nginx, Caddy, or another reverse proxy, set the public origin to the exact browser URL and enable secure cookies:

```dotenv
TILEO_PUBLIC_ORIGIN=https://tiles.example.com
TILEO_SECURE_COOKIES=1
```

The supplied Nginx example forwards `Host`, `X-Forwarded-Proto`, and `X-Forwarded-Host`; TileO uses those forwarded values for loopback/proxy deployments, so same-origin requests such as deleting a result continue to work through HTTPS.

LAN mode permits HTTP/HTTPS origins on localhost, private IPv4 addresses, CGNAT addresses (100.64–100.127), and `.local` names, with CORS preflight support. It grants access to devices on the trusted LAN. For a frontend on a named host, explicitly list its complete origin:

```dotenv
TILEO_CORS_ORIGINS=http://my-frontend:5173,http://192.168.1.20:5173
```

Bearer authentication remains enforced when `TILEO_API_TOKEN` is configured. Cross-site clients should use a Bearer token; session cookies use SameSite=Strict. Public origins are rejected unless explicitly configured. Do not use a wildcard origin.
Use a randomly generated token with at least 128 bits of entropy. Rotating it invalidates existing browser sessions. Set `TILEO_SECURE_COOKIES=1` for HTTPS deployments whose proxy does not forward the original protocol.

Quick Open also previews single-band DEM, DSM, DTM, and scientific GeoTIFFs without conversion. Choose **TIFF mode** explicitly for elevation or scientific measurements; **Auto** previews numeric non-Byte data as a scientific raster, while Byte defaults to imagery. Signed/unsigned 16-bit and 32-bit, Float32, Float64, and explicit Byte elevation are supported. Preview colors use an approximate dataset range, preserve NoData transparency, and apply declared scale/offset. A legend displays declared units (or unspecified). Quick Open files expire after 30 minutes of inactivity and are also released when another Quick Open TIFF replaces them.

After source changes, stop the running native server and use `npm run start:build` to rebuild before starting the API and worker. A running process retains its old API code even after rebuilding `dist`. For Docker, recreate the services with `docker compose up -d --build`. Refresh the browser after restarting. The old error “Quick Open supports Byte and UInt16 grayscale...” indicates an API build from before elevation Quick Open support.
