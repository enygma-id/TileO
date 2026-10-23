# TileO Architecture

TileO is a self-hosted geospatial processing and publication toolkit. Its current application uses a **Node.js/TypeScript API**, a **worker process**, an **SQLite-backed job queue**, and a **shared filesystem** for uploaded data, temporary processing, results, and logs. External geospatial command-line tools and JavaScript libraries are used according to the workflow.

The architecture is optimized for a controlled **single-host deployment**. It is not a distributed job platform and should not be described as providing multi-node clustering, general multi-tenant isolation, or unlimited concurrent processing.

## Processing flow

```text
GeoTIFF / vector / GLB / supported remote COG
                  |
           Source inspection
                  |
       Input checks and options
                  |
            Persisted job
                  |
           SQLite job queue
                  |
               Worker
                  |
       +----------+-----------+
       |          |           |
  GDAL raster   Vector     3D model
  processing    tiling     packaging
       |          |           |
       +----------+-----------+
                  |
       Validation and metadata
                  |
    COG / MBTiles / PMTiles /
     3D Tiles / job artifacts
                  |
        API / preview / download
```

TileO distinguishes source inspection from potentially long-running conversion. Job creation returns before the worker finishes; job status, logs and generated artifacts are accessed separately through the [HTTP API](API.md).

## Runtime components

| Component | Responsibility |
| --- | --- |
| **API** (`src/api.ts`) | HTTP endpoints, authentication/session handling, source inspection, job management, previews and artifact delivery |
| **Job/state layer** (`src/jobs.ts`) | SQLite-backed job records and associated state |
| **Worker** (`src/worker.ts`) | Claims jobs and runs bounded conversion tasks |
| **Pipelines** (`src/pipeline.ts`, raster/vector/elevation/3D modules) | Input-specific processing, tool invocation and validation |
| **Local data directory** | Stores persisted queue state, inputs, scratch files, outputs and logs |
| **Web UI** (`web/`, `src/web/`) | Operator workflow for inspection, conversion, preview and delivery |

For native development, `npm start` launches API and worker child processes. Under [Docker Compose](../compose.yaml), the services run separately but share the `tileo-data` volume. The worker resource limits and timeouts are configurable. Multiple workers must not be attached to the same SQLite job queue without an architectural change.

## Supported data families

### Imagery raster

Raster imagery is inspected for its coordinate reference system, dimensions, bands and appropriate conversion options. Workflows may produce **Cloud Optimized GeoTIFF (COG)**, **MBTiles**, **PMTiles**, or previews, subject to input and output compatibility.

### Numeric and elevation rasters

Single-band scientific data and elevation surfaces (DEM, DSM, DTM) must not be conflated. Output selection must respect numeric type, scale/offset, NoData, CRS, height units and vertical reference. TileO supports selected COG and encoded elevation-tile workflows but does not infer or perform arbitrary vertical datum transformations.

### Vector data

Supported vector formats can be inspected and normalized, then tiled into archives for web consumption. **Tippecanoe** is used for vector tiling where required, while **GDAL** supports normalization and a constrained Density fallback. The Preserve strategy requires Tippecanoe. Feature/property selection and tile-size limits are part of the conversion configuration.

### 3D content

Self-contained **GLB 2.0** content can be packaged with explicit geographic placement into **3D Tiles 1.1** artifacts, with optional **B3DM** compatibility output. Position and elevation require explicit geographic semantics; missing placement is not silently invented.

For precise format restrictions, see [Formats and Semantics](FORMATS_AND_SEMANTICS.md).

## Inputs, remote sources and storage

The API accepts direct uploads and supports configured remote-source inspection for supported COG objects, including signed URLs and certain S3-compatible connections. Remote reading and staging are subject to authentication, URL restrictions, input identity checks, expiry, disk budgets and source-format limits.

TileO produces **local artifacts for download and preview**. Connecting to remote object storage does **not** by itself mean that the application has automatic scheduled bucket synchronization or remote output publishing. See [Storage](STORAGE.md) and [API](API.md).

## Security and resource boundaries

- HTTP access can be restricted with `TILEO_API_TOKEN`; the token is a shared administrator credential.
- Docker Compose binds to loopback by default. Public exposure requires appropriate TLS, networking and access controls.
- The processing worker uses bounded memory, scratch-space, timeout and job-queue settings.
- Source and output data persist in a shared local directory/volume; back up and protect it as appropriate.
- Conversion completion, successful validation and strict standards conformance are different claims. Review evidence per output type.

See [Operations](OPERATIONS.md), [Testing](TESTING.md), [Security](../SECURITY.md) and [Verification](VERIFICATION.md).

## Dependencies and distribution

TileO invokes **GDAL** and **Tippecanoe**, and uses Node.js/TypeScript dependencies for geospatial formats, job handling, rendering and storage. Their licensing and redistribution requirements are **separate from the TileO project code license**. See [Third-Party Notices](../THIRD_PARTY_NOTICES.md), [Native Components](../third-party/NATIVE_COMPONENTS.md) and [Release Policy](RELEASE_POLICY.md).
