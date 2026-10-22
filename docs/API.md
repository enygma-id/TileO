> **Implementation reference — TileO Clean 4, supplied 21 October 2026.** Commands and behavior are transcribed from the source document. This founding package has no runnable implementation; check the merged source before describing any behavior as release-certified.

# TileO API

Base URL: `http://localhost:8090`

Interactive API documentation and Playground: `http://localhost:8090/docs`  
Raw OpenAPI specification: `http://localhost:8090/openapi.yaml`

The API accepts raw file uploads and returns a persistent conversion job. The API does not wait for GDAL or Tippecanoe to finish; upload success is `202 Accepted`, then poll the job.

## Authentication

Localhost works without a token by default. When `TILEO_API_TOKEN` is set, send either:

```http
Authorization: Bearer <token>
```

or create a browser session:

```sh
curl -c cookies.txt -H 'Content-Type: application/json' \
  -d '{"token":"<token>"}' \
  http://localhost:8090/api/session
```

The token is a shared administrator credential: it can create and delete jobs, read source data and logs, and download results. Generate it randomly with at least 128 bits of entropy. Browser sessions last 12 hours but become invalid immediately when `TILEO_API_TOKEN` changes. End the current session with:

```sh
curl -b cookies.txt -X POST http://localhost:8090/api/session/logout
```

Sign-in attempts are rate limited. For HTTPS behind a reverse proxy, set `TILEO_PUBLIC_ORIGIN=https://...` or `TILEO_SECURE_COOKIES=1` so session cookies always carry `Secure`.

## Health and status

```http
GET /healthz
GET /api/status
```

`/api/status` returns the application version, worker heartbeat state, available tools, free disk space, upload limit, and basemap settings.

## Create a job from a public or authenticated URL

The primary flow accepts a public HTTPS URL or a presigned/authenticated URL. Authentication is carried by the URL signature; access keys are not entered in the browser. The MVP accepts standalone `.tif`/`.tiff` COG objects that support HTTP Range and return an ETag.

```http
POST /api/storage/inspect
Content-Type: application/json

{"url":"https://storage.example.com/bucket/source.tif","readMode":"auto"}
```

The URL may contain S3/MinIO presigned query parameters. TileO keeps the complete URL internally for the job but removes the query string from API responses and redacts it from process logs. The URL must remain valid through queueing and processing; after it expires, inspect a newly signed URL and create a new job. Inspection performs a small range probe and bounded GDAL metadata inspection. It returns an `inspectionId`, detected raster metadata, ETag/size identity, and the selected `remote` or `stage` strategy. Use it within 30 minutes:

```http
POST /api/jobs/from-source
Content-Type: application/json

{"inspectionId":"<uuid>","options":{"minZoom":0,"maxZoom":14,"tileFormat":"webp"}}
```

`auto` defaults to conditional staging. Direct URL range reading is offered only when the URL pins an S3 `versionId`; otherwise mixed-version reads cannot be ruled out. Staging uses `If-Match` with the inspected ETag and fails if the object changed. Its effective size limit is the smaller of `TILEO_MAX_REMOTE_STAGE_MB` and `TILEO_MAX_SCRATCH_MB`; free-disk preflight reserves the input size before transfer. Output and the configured disk reserve still need additional space.

Public internet URLs must use HTTPS and cannot resolve to local/private addresses. For an intentional private MinIO or development HTTP endpoint, the administrator must add its exact hostname to `TILEO_REMOTE_URL_HOSTS` on both API and worker.

The previous server-side registry remains available as an advanced option:

```http
GET /api/storage/connections
POST /api/storage/inspect

{"connectionId":"archive","bucket":"gis-data","key":"cog/source.tif","readMode":"auto"}
```

Example server configuration (keep it in `.env` or a deployment secret store):

```json
[{"id":"archive","name":"GIS Archive","region":"ap-southeast-1","accessKeyId":"...","secretAccessKey":"...","allowedBuckets":["gis-data"],"allowedPrefixes":["cog/"],"allowUnversionedRemote":false}]
```

For registry-based MinIO, add an HTTPS `endpoint` and `forcePathStyle:true`. HTTP additionally requires `allowInsecure:true` and is intended only for controlled development networks.

Each registry entry declares `auth`: `static` (keys in server config, as above), `iam` (instance/task-role credentials, optionally assuming a `roleArn` with `externalId` via STS AssumeRole — no AWS SDK required), `byoc` (no server keys; each caller registers their own), or `public` (unsigned requests). For `iam` with a role:

```json
[{"id":"secure","name":"Secure Archive","auth":"iam","region":"ap-southeast-1","roleArn":"arn:aws:iam::123456789012:role/TileOReader","externalId":"<external-id>","allowedBuckets":["gis-data"],"allowedPrefixes":["cog/"]}]
```

For a `byoc` connection, or any S3-compatible bucket you own (R2, Spaces, MinIO, Supabase), register keys first — they are sealed with `TILEO_CREDENTIAL_KEY`, bound to your session, and never returned by the API:

```http
POST /api/storage/credentials
Content-Type: application/json

{"endpoint":"https://s3.example.com","region":"auto","bucket":"my-bucket","accessKeyId":"<key>","secretAccessKey":"<secret>","ttlSeconds":3600}
```

For AWS IAM Role integration (Option 3, cross-account zero-password), query `GET /api/storage/iam-info` to obtain TileO's AWS Account ID and External ID. After creating the role with trust and `s3:GetObject` policies in your AWS account, register the role:

```http
POST /api/storage/credentials
Content-Type: application/json

{"roleArn":"arn:aws:iam::123456789012:role/TileOReader","bucket":"my-bucket","region":"us-east-1","ttlSeconds":3600}
```

```http
POST /api/storage/inspect
Content-Type: application/json

{"credentialId":"<uuid>","key":"cog/source.tif","readMode":"auto"}
```

`GET /api/storage/credentials` lists your registrations (scope and expiry only); `DELETE /api/storage/credentials/{id}` revokes one. Credentials expire after `ttlSeconds` (default 15 minutes, at most 90 days for recurring syncs) and cannot be spent by another session. BYOC endpoints require HTTPS on a public host unless the exact host is allowlisted by `TILEO_REMOTE_URL_HOSTS`, which also permits `http://` and private/LAN addresses for self-hosted MinIO; `TILEO_BYOC_ALLOW_HTTP=1` relaxes this for loopback local development.

## Create a conversion job

```sh
curl -X POST \
  --data-binary @source.tif \
  -H 'Content-Type: application/octet-stream' \
  'http://localhost:8090/api/jobs?filename=source.tif&options=%7B%22minZoom%22%3A0%2C%22maxZoom%22%3A18%2C%22tileFormat%22%3A%22webp%22%2C%22quality%22%3A80%7D'
```

Supported input extensions include GeoTIFF, GeoJSON, GeoPackage, FlatGeobuf, zipped Shapefile, common raster formats, MBTiles, PMTiles, and GLB. Conversion inputs use `POST /api/jobs`; already tiled MBTiles preview uses the Quick Open endpoint below.

For a self-contained GLB 2.0 file, pass `filename=model.glb` and JSON options with `latitude` (-90 to 90), `longitude` (-180 to 180), `height` (WGS84 ellipsoid meters), and optional `heading` (degrees clockwise from north, default 0; model forward is local +Y). The web form reads placement from metadata that explicitly declares WGS84/EPSG:4979; missing placement must be entered manually. This creates a 3D Tiles 1.1 package. Small models use one GLB; larger models automatically use a simplified root LOD and spatial child GLBs. Set `exportB3dm=true`, or choose B3DM in the advanced 3D form, to add the compatibility output. `GET /api/jobs/{id}/download` returns the modern ZIP containing `tileset.json` and its `tiles/*.glb` content. Use `?file=b3dm` to download the separate 3D Tiles 1.0 ZIP whose hierarchy and LOD are identical but whose tile content is wrapped as B3DM. The main MapLibre map previews the 1.1 package through deck.gl. Preview files are served below `/api/jobs/{id}/3d/` after the job succeeds.

Options:

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `minZoom` | integer | `0` | 0–22 |
| `maxZoom` | integer | `18` | 0–22 |
| `tileFormat` | string | `webp` | `webp`, `png`, or `jpeg` |
| `quality` | integer | `80` | 1–100 |
| `sourceCrs` | string/null | `null` | EPSG form, for example `EPSG:32750` |
| `layer` | string/null | `null` | Required when a vector file has multiple layers |
| `vectorPreset` | string | `density` | `density` adapts to geometry: points cluster, lines/polygons drop-densest; wide zoom spans coarsen low-zoom detail. `preserve` keeps all features (`-r1`) and is extent-gated for >100k features (dynamic floor, ~20k features/tile budget). Both clip and quantize geometry. |
| `vectorEngine` | string | `auto` | `auto`, `tippecanoe`, or `gdal`. Auto falls back only when Tippecanoe cannot start and Density is selected. GDAL + Preserve is rejected. GDAL fallback inherits the resolved tile budget. |
| `includeProperties` | string[]/null | `null` (all) | Keep only these vector attributes; `[]` produces pure geometry. Unknown names are rejected against inspection. Names are case-sensitive and preserved exactly, including case-only variants (`id` vs `ID`). Shrinks tiles 30–50% on wide cadastral schemas. |
| `maxTileBytes` | integer/null | `500000` (density) | 50000–10000000. Explicit `--maximum-tile-bytes`; Preserve honors it when set, otherwise stays unlimited. |
| `maxTileFeatures` | integer/null | `200000` (density) | 1000–1000000. Explicit `--maximum-tile-features`. |

## Jobs

Elevation GeoTIFF jobs use an explicit, separate options object. For lossless COG:

```json
{"pipeline":"elevation","elevationOutput":"cog","elevationKind":"dtm"}
```

For a single-band numeric raster whose values are measurements rather than
heights, create a lossless scientific COG instead:

```json
{"pipeline":"scientific","rasterPurpose":"scientific"}
```

For COG plus Terrain-RGB MBTiles:

```json
{"pipeline":"elevation","elevationOutput":"terrain-rgb","elevationKind":"dtm","elevationUnit":"m","heightReference":"orthometric","terrainNoDataHeight":0,"minZoom":0,"maxZoom":12}
```

Pass this JSON URL-encoded in `options` to `POST /api/jobs`, optionally with an `inspectionId`. `elevationKind` is `dem` (default), `dsm`, or `dtm`. `elevationUnit` is `unknown` (default), `m`, or `ft` (international feet). `heightReference` is `unknown` (default), `ellipsoid`, or `orthometric`. Terrain requires explicit units and height reference and a finite `terrainNoDataHeight` in meters. Terrain-RGB accepts -10000 to 1667721.5 m; Terrarium accepts -32768 to 32767.99609375 m. The example's zero fill is a display choice, not a declaration that missing data is sea level. Native maximum zoom, coverage and resource limits are checked by the worker.

COG preserves source units, raw values, scale/offset and NoData; full-resolution pixel bytes are compared with SHA-256 after conversion. Declared unit/reference are annotations, not a vertical transformation. `sourceCrs` can assign a CRS for COG-only output. A scientific COG has no terrain endpoint and its values are never converted to meters. Terrain requires the correct embedded CRS, an extent within Web Mercator limits and no antimeridian crossing. Recognized source units and vertical references must match the requested options. It applies source scale/offset, converts feet to meters, and checks the resulting minimum/maximum against the selected encoding before generating tiles. Terrain-RGB encoding precision is 0.1 m; the source accuracy and resampling error are separate.

```http
GET /api/jobs/:id/cog
GET /api/jobs/:id/cog              Range: bytes=0-16383
GET /api/jobs/:id/tilejson
GET /api/jobs/:id/download?file=cog
GET /api/jobs/:id/download?file=terrain
```

`/cog` supports single HTTP byte ranges, returns `206` with `Content-Range`, and returns `416` for invalid or unsatisfiable ranges. `/tilejson` advertises XYZ terrain URLs, bounds, zooms and `encoding: mapbox` or `terrarium`; a MapLibre source must use `type: raster-dem`. Terrain tiles use the existing `/tiles/:z/:x/:y` endpoint. COG-only jobs have no PNG tiles. Default download returns TIFF for COG-only jobs, or an elevation ZIP for terrain jobs (COG, MBTiles and manifest). Endpoints use the existing authentication and same-origin rules; downloaded files can be hosted separately with the appropriate CORS/Range configuration.

```http
GET    /api/jobs
GET    /api/jobs/:id
POST   /api/jobs/:id/cancel
POST   /api/jobs/:id/retry
DELETE /api/jobs/:id
GET    /api/jobs/:id/log
GET    /api/jobs/:id/download
GET    /api/jobs/:id/3d/tileset.json
GET    /api/jobs/:id/3d/tiles/:file
GET    /api/jobs/:id/tiles/:z/:x/:y
```

Only `SUCCEEDED` jobs expose downloads and tiles. `DELETE` removes terminal jobs and their input, output, log, and scratch files. Queued or running jobs must be cancelled or completed first.

Poll a job with `GET /api/jobs/:id` until `status` is `SUCCEEDED`, `FAILED`, or `CANCELLED`.

Vector jobs carry a per-attempt batch summary in `metadata.batch` (also rendered in the UI result line as `batch file|stream … · N features · M batches`, or `fallback …` when the GDAL fallback ran):

```json
{"mode":"on","delivery":"stream","active":true,"stream":true,"normalization":"ogr",
 "featureCount":150000,"batchCount":15,"bytesNormalized":22166688,"fallback":null,
 "normalizeMs":0,"tileMs":5026,"peakMemoryBytes":41451520,"peakScratchBytes":123456789}
```

`mode`/`delivery` are frozen at attempt start (a mid-attempt config change never applies; rollback with `off` + restart takes effect on the next job). While running, `stage` carries progress such as `Vector: processed batch 3/15 (30,000 features)`; updates are throttled to ~1 Hz plus a final flush. Batch totals can be estimates until byte-limited grouping finishes. Batch policy is operator configuration, not a per-job option: `TILEO_VECTOR_BATCH_MODE` (`off`/`auto`/`on`, default `off`), `TILEO_VECTOR_BATCH_FEATURES` (default 10000), `TILEO_VECTOR_BATCH_MB` (default 16), `TILEO_VECTOR_MAX_FEATURE_MB` (default 16), `TILEO_VECTOR_BATCH_DELIVERY` (`file`/`stream`, default `file`). Qualified adapters include GeoJSON/GeoJSONL, GPKG, FGB and GDAL-recognized ZIP Shapefile. KML remains legacy in `auto` and is rejected in strict `on`. The fallback string can be `legacy:unqualified-driver:<driver>` as well as `gdal:tippecanoe-missing`. Streaming `normalizeMs`/`tileMs` overlap, `peakMemoryBytes` is nullable sampling, and `peakScratchBytes` excludes open-unlinked files. See `OPERATIONS.md` and `BATCH_SYSTEM_AUDIT.md` for evidence and rollout limits.

## Quick Open

```http
POST /api/quick/mbtiles?filename=map.mbtiles
GET  /api/quick/:id/tiles/:z/:x/:y
POST /api/quick/tiff?filename=photo.tif
GET  /api/quick/:id/file
```

`POST /api/quick/mbtiles` accepts an existing MBTiles file and returns a temporary preview id. It does not convert TIFF or create a new tile archive. Uploads are bounded by the global upload limit with incremental disk checks, and archives with more than 5,000,000 tiles are rejected. Previews expire after 30 minutes of inactivity and at most 2 hours after creation; at most 20 MBTiles and 20 TIFF previews are kept.

`POST /api/quick/tiff` accepts georeferenced imagery (Byte or UInt16 grayscale, grayscale with alpha, palette, RGB or RGBA) or single-band numeric elevation (Byte, Int16/UInt16, Int32/UInt32, Float32/Float64) GeoTIFF and returns a temporary streaming id with its georeferencing metadata. `GET /api/quick/:id/file` streams the original file with HTTP Range support so the map renders full-resolution windows on demand without tiling anything.

Job tiles (`/api/jobs/:id/tiles/...`) and Quick Open tiles (`/api/quick/:id/tiles/...`) return `Cache-Control: private, max-age=86400, immutable` with an `ETag` (`If-None-Match` yields `304`); missing tiles return `204` with a short cache header. Concurrent source previews are rate-limited with the `PREVIEW_BUSY` code (HTTP 429).

## Basemap

```http
GET /api/basemap/osm/:z/:x/:y.png
```

## Errors

Errors use this shape:

```json
{"error":{"code":"INVALID_INPUT","message":"..."}}
```

Common codes include `AUTH_REQUIRED`, `INVALID_INPUT`, `INVALID_OPTIONS`, `INVALID_CRS`, `QUEUE_FULL`, `TOOL_MISSING`, `INVALID_STATE`, `NOT_FOUND`, and `DISK_FULL`.

Machine-readable endpoint definitions are in `openapi.yaml` (provided with the approved code import).

### Terrarium, PMTiles and WMTS

Visual comparison shows the original upload on the left and the published output on the right, with synchronized map position and a movable divider. `GET /api/jobs/{id}/source-preview` renders imagery as a bounded 1536 px PNG, or converts vector sources to WGS84 GeoJSON. Optional `bbox=west,south,east,north` filters vector features intersecting a WGS84 viewport; geometries are not clipped or simplified. The compare view refreshes this area on pan/zoom. There is no total dataset feature-count rejection. Each response contains at most 5,000 features and reports `preview.truncated` and `preview.scope`; without bbox, the response is a bounded dataset preview. A partial preview is explicitly labeled: zoom in to inspect a smaller area. The native runner capture, memory and timeout budgets still apply; very complex geometries may exceed the size budget. Preview rendering accepts at most two concurrent requests. `GET /api/jobs/{id}/source` serves the original elevation GeoTIFF or GLB, with HTTP byte ranges; `GET /api/jobs/{id}/source-tileset.json` places the original GLB using the output placement transform. These routes require a completed job and the usual API authentication. Imagery previews are for visual inspection and do not expose full source resolution.

Use `elevationOutput: "terrarium"` with the same terrain metadata and zoom options. Heights are encoded in meters as `(R * 256 + G + B / 256) - 32768`, with 1/256 m increments and a range of -32768 to 32767.99609375 m. The NoData display height must fit that range. The COG keeps the original values and NoData.

Add `exportPmtiles: true` to imagery/vector options or terrain options to generate a PMTiles v3 archive alongside MBTiles. COG-only and GLB jobs do not accept this option. The default download is a ZIP; `GET /api/jobs/{id}/download?file=pmtiles` returns the additional PMTiles file. To host it remotely, configure HTTP Range and suitable CORS on your storage host. This application exports the file; it does not publish to external storage.

WMTS uses `GET /api/jobs/{id}/wmts` with KVP parameters:

- Capabilities: `SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities`
- Tile: `SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER={id}&STYLE=default&TILEMATRIXSET=WebMercatorQuad&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}&FORMAT=image/png`

Use the exact format advertised by capabilities: `image/png`, `image/webp`, `image/jpeg` or `application/vnd.mapbox-vector-tile`. Rows use XYZ orientation, whereas MBTiles storage uses TMS. Invalid requests return an OWS ExceptionReport; missing tiles return 204. GetFeatureInfo is not advertised. COG-only and GLB outputs have no WMTS layer. Terrain PNGs remain encoded elevation, and MVT requires a compatible vector client. Existing authentication and same-origin rules apply.

COG preview reads numeric elevations on demand and applies scale/offset, keeping NoData transparent. It uses bounded windows/overviews, nearest-neighbor display sampling and a relative color ramp; it does not convert vertical datums or turn COG into Quantized-Mesh.

Quick Open TIFF accepts `mode=auto|imagery|dem|dsm|dtm`. Auto uses elevation for numeric non-Byte single-band files without a palette; Byte defaults to imagery. Select DEM/DSM/DTM explicitly to preview Byte elevation or specify surface type. Elevation returns `kind=elevation` and `display` with kind, approximate minimum/maximum and declared unit. Colors apply the band scale/offset and exclude NoData; source bytes and vertical reference remain unchanged. Units are not inferred.
