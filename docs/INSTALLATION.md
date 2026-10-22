# Installation and first run

This guide reproduces the installation commands and constraints of the **TileO Clean 4** implementation README and `package.json` (`tileo-console` v0.1.1). The documentation-only founding commit does not contain `package.json`, `compose.yaml` or application source yet. The steps below are applicable **after the approved source-code import**.

## Requirements

| Deployment | Requirements |
| --- | --- |
| Docker | Docker Desktop in Linux container mode (Windows/macOS), or Docker Engine + Compose plugin on Linux |
| Native | Node.js `>=24.13.0 <25`; GDAL 3.8+ with required format drivers, including MBTiles and WebP; Tippecanoe for preferred vector tiling |
| Capacity | SSD storage proportional to datasets; at least 8 GB RAM for larger Docker inputs; one active worker |

Clean 4 identifies GDAL 3.10.3 and Tippecanoe 2.79.0 as tested Linux image versions, distinct from the custom/restricted GDAL build profile. This is a report from the supplied implementation documentation, not a fresh test result.

## Docker Compose

From the root of the imported application:

```sh
docker compose up -d --build
docker compose exec worker node dist/doctor.js
docker compose logs -f worker
```

Then open `http://localhost:8090` (local bind by default). The API and worker share a named volume (`tileo-ts_tileo-data`). `docker compose down` retains this volume; `docker compose down -v` deletes it. The first build requires network access. Avoid public exposure without authentication, TLS, and an infrastructure review.

The source README documents an API memory limit of 512 MB and a worker container limit of approximately 5 GB in its standard setup. Check the **actual** `compose.yaml` at code-import time because deployed overrides can change those values.

## Native without Docker

```sh
cp .env.example .env
npm ci
npm run build
npm run doctor
npm start
```

The service started by `npm start` runs an API and a worker. To run them under a process manager independently:

```sh
npm run api
# In a separate service on the same host/data directory:
npm run worker
```

Do not start two workers on the same SQLite queue. Configure environment variables using the shell, service manager or `.env` according to the imported implementation's `.env.example`. On Windows, Tippecanoe requires a working WSL2 or Docker path; review [Tools](TOOLS.md).

## Verification and advanced tests

```sh
npm test
npm run typecheck
npm run release:gate
```

With the Docker image successfully built, the Clean 4 implementation README documents integration testing via:

```sh
docker run --rm -e TILEO_INTEGRATION=1 tileo-ts:local node --test dist/tests/pipeline.test.js
```

For native GDAL testing, build first and set `TILEO_INTEGRATION=1` before `node --test dist/tests/elevation.test.js`. Browser tests create real jobs; run them against a disposable instance, following [Testing](TESTING.md) and [Clean 4 reference](IMPLEMENTATION_REFERENCE.md).

## Deploying on a LAN or domain

The code README documents `TILEO_BIND_ADDRESS`, `TILEO_HOST`, `TILEO_PORT`, `TILEO_ALLOW_LAN`, `TILEO_API_TOKEN`, `TILEO_PUBLIC_ORIGIN`, `TILEO_SECURE_COOKIES` and `TILEO_CORS_ORIGINS`. Restrict LAN/public access by default, use a sufficiently random token and HTTPS when appropriate, and avoid wildcard CORS origins. Consult [Operations](OPERATIONS.md) and the original [Implementation reference](IMPLEMENTATION_REFERENCE.md) for the full example.

## Source reference and publication policy

This document does not assert that a runnable distribution has been released, that tests were rerun during documentation packaging, or that native license compliance was certified. Before publishing source, reconcile these commands with the merged `package.json`, build files and exact released platform; see [Release policy](RELEASE_POLICY.md).
