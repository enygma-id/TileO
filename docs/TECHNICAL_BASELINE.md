# Technical Baseline — TileO Clean 4

This is a documentation baseline derived from the user-supplied `Tileo-Clean4.zip` implementation snapshot, **not an assertion that code is present in the founding documentation commit**.

## Implementation identity

- Application manifest: `tileo-console`, version `0.1.1`.
- Runtime: TypeScript / Node.js `>=24.13.0 <25`.
- Main design: single host, local SQLite queue, one active worker, local filesystem data, API and browser console.
- Libraries: GDAL/OGR custom/restricted build path, Tippecanoe, deck.gl, MapLibre GL JS, GeoTIFF.js, PMTiles, glTF Transform core/extensions, meshoptimizer, Fastify, better-sqlite3, proj4.
- Pipeline: metadata inspection → explicit conversion configuration → queued bounded processing → output validation → preview and delivery.

## Updated licensing-related implementation

- Removed declared `@gltf-transform/functions`, `sharp`, `ndarray-pixels` and `@img/sharp-*` from the Clean 4 npm lockfile; local `src/gltf-ops.ts` now handles selected geometry utilities. Do not assume algorithmic equivalence beyond verified cases.
- Font Awesome is removed from the Clean 4 dependency manifest; `src/web/icons.ts` contains Lucide-derived SVGs that retain upstream ISC/Feather attribution obligations.
- Basemap is neutral/opt-in; OpenStreetMap usage and data licensing are separate from software licensing.
- A restricted GDAL/PROJ build, two scratch-image spikes, release gate and SBOM reports were described in migration materials. The main Dockerfile and CI still need alignment with the final approved release path.

## Current evidence boundaries

The Clean 4 lockfile lists 284 resolved non-root packages and license metadata; corresponding exported npm notice sections exist. The scratch/musl candidate reports residual `libidn2`/`libunistring` licensing and an MPL-licensed certificate bundle. The container-specific native package inventory must be reconciled at the actual release digest. The `release-gate.yml` snapshot uses Node 22 despite the Node 24 engine requirement; the import PR must correct it.

The previous reported suite of 118 tests (104 passed, 14 skipped) is *report evidence*, not a fresh execution within this documentation pack. Integration-dependent skipped tests must be completed before asserting end-to-end verification.

See [architecture](ARCHITECTURE.md), [verification](VERIFICATION.md), [testing](TESTING.md), [code import](CODE_IMPORT_POLICY.md), and [release compliance](../third-party/RELEASE_GATE.md).


## Current source documentation

The canonical [Quick start](../README.md#quick-start) reproduces commands from the [Clean 4 implementation reference](IMPLEMENTATION_REFERENCE.md). Application version in Clean 4: `0.1.1`; locked Node requirement `>=24.13.0 <25`. The Clean 4 lockfile is identical byte-for-byte to the Clean 4 reference in the preceding foundation pack; the notice corpus differs and is refreshed in this revision.
