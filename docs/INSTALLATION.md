# Installation and First Run

TileO is a self-hosted geospatial processing application built with TypeScript and Node.js. The repository includes the application source, Docker build files, runtime configuration, and helper scripts. Choose **Docker Compose** for the simplest cross-platform setup or **native installation** when you want to manage GDAL and Tippecanoe on your host.

For platform-specific tool installation and troubleshooting, read [Tools & Prerequisites](TOOLS.md) before proceeding with a native setup.

## Prerequisites

| Requirement | Docker Compose | Native installation |
| --- | --- | --- |
| Operating system | Windows/macOS with Docker Desktop using Linux containers, or Linux with Docker Engine and Compose plugin | Windows, macOS, or Linux |
| Node.js | Included in the container image | `>=24.13.0 <25` |
| GDAL | Built into the container image | GDAL 3.8+ with the drivers required for your workflows |
| Tippecanoe | Built into the container image | Required for the vector **Preserve** strategy; preferred for **Density** |
| Resources | Sufficient SSD capacity; at least 8 GB RAM recommended for larger datasets | RAM and disk space proportional to the dataset, temporary files, and outputs |

Tippecanoe has no standard native Windows distribution. Use WSL2 or Docker for workflows that require Tippecanoe; some Density vector jobs can fall back to GDAL when Tippecanoe cannot start. See [Tools](TOOLS.md) for the relevant limitations and available helper scripts.

## Option A — Docker Compose

From the **repository root**, which contains `compose.yaml` and `Dockerfile`:

```sh
docker compose up -d --build
docker compose exec worker node dist/doctor.js
docker compose logs -f worker
```

Open **http://localhost:8090**. The application also serves interactive [API documentation](http://localhost:8090/docs) and an [OpenAPI file](http://localhost:8090/openapi.yaml).

`compose.yaml` defines an API service and a worker service, sharing the named volume `tileo-data`. The published API port binds to `127.0.0.1` by default (configurable with `TILEO_BIND_ADDRESS` and `TILEO_PORT`). The current Compose configuration sets an API memory limit of **512 MB** and a worker limit of **6 GB by default**; these are resource constraints, not guarantees about the size of data that can be converted.

To stop services without deleting saved jobs and outputs:

```sh
docker compose down
```

**Do not run `docker compose down -v` unless you intend to delete the named data volume.** Rebuilding the image requires connectivity to fetch container, npm, and upstream build dependencies.

## Option B — Native installation

Install Node.js 24.13+ (major version 24), GDAL with appropriate raster/vector drivers, and Tippecanoe as needed. Follow [Tools & Prerequisites](TOOLS.md) for OS-specific installation procedures and executable discovery.

On macOS or Linux, run the following from the repository root:

```sh
cp .env.example .env
npm ci
npm run build
npm run doctor
npm start
```

On Windows PowerShell, use `Copy-Item .env.example .env` in place of `cp .env.example .env`; the remaining npm commands are unchanged.

`npm start` launches the API and worker processes for a single-host deployment. If managed separately by your service manager, use `npm run api` and `npm run worker` with a shared `TILEO_DATA_DIR`:

```sh
npm run api
# Start in a separate terminal or service process:
npm run worker
```

Do **not** run multiple workers against the same SQLite-backed queue. Configure deployment-specific settings in `.env` or your process manager; never commit credentials, access tokens, or private endpoint secrets.

## Configuration and network access

Relevant variables defined by the application and deployment configuration include:

| Variable | Purpose |
| --- | --- |
| `TILEO_HOST` / `TILEO_PORT` | API listen address and port for native deployment |
| `TILEO_BIND_ADDRESS` | Host-side port binding in Docker Compose |
| `TILEO_DATA_DIR` | Directory for SQLite state, inputs, scratch files, output and logs |
| `TILEO_API_TOKEN` | Shared administrator token for protected access |
| `TILEO_PUBLIC_ORIGIN` / `TILEO_SECURE_COOKIES` | Public HTTPS origin and secure session cookies |
| `TILEO_ALLOW_LAN` / `TILEO_CORS_ORIGINS` | LAN access and allowed cross-origin requests |
| `TILEO_S3_CONNECTIONS` / `TILEO_REMOTE_URL_HOSTS` | Optional server-side remote source connections and approved hosts |

Keep the default loopback binding unless you explicitly intend to expose TileO to other devices. Use appropriate TLS, authentication, firewalling, and reverse-proxy configuration for a network-accessible deployment. The token is an administrator credential, not a multi-user permission system. Details: [Operations](OPERATIONS.md) and [Security](../SECURITY.md).

## Verification

From the repository root after installing dependencies:

```sh
npm run doctor
npm test
npm run typecheck
npm run release:gate
```

The doctor reports tool availability; it does not certify every file format or guarantee successful processing of an arbitrary dataset. Unit tests and type checking run locally. A release gate may include checks beyond a normal local setup and must be assessed on the target environment.

To run GDAL-backed pipeline integration tests **inside a successfully built Docker image**:

```sh
docker run --rm -e TILEO_INTEGRATION=1 tileo-ts:local node --test dist/tests/pipeline.test.js
```

For native elevation integration tests, first run `npm run build`, then enable `TILEO_INTEGRATION=1` in your shell and run `node --test dist/tests/elevation.test.js`. Tests involving real conversion jobs and browsers should run on an isolated instance with suitable storage and tool prerequisites. See [Testing](TESTING.md) and [Verification](VERIFICATION.md).

## Next steps

- [Tools & Prerequisites](TOOLS.md) — GDAL/Tippecanoe installation and troubleshooting.
- [API](API.md) and [OpenAPI](../openapi.yaml) — inspection, jobs, storage sources, previews and downloads.
- [Formats and semantics](FORMATS_AND_SEMANTICS.md) — supported workflows and geospatial constraints.
- [Samples](../samples/README.md) — datasets for trying the workflows.
- [Operations](OPERATIONS.md) — persistence, resource limits, networking and maintenance.
