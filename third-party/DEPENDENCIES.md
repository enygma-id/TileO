# Third-Party NPM Dependency Inventory

This inventory lists **284 non-root entries from the committed `package-lock.json`** (direct, transitive, development and platform-optional packages). Entries do not necessarily correspond one-for-one to packages distributed in every platform image. Licenses and notices are not changed by TileO.

- `package-lock.json` SHA-256: `70a37f180438e667479f0b8e29fbe282a020930397afc8dd964b403599897a61`
- Lockfile entries: **284** (252 non-development/production-classified; 32 development-classified, with optional platform packages included)
- Collected notice entries: **284**; **36** entries use standard-license fallback text rather than verified package-specific upstream LICENSE files. These require upstream version-specific copyright/NOTICE checks before distributing packages.
- This is **npm dependency metadata and collected license evidence**, not a certification of the final binary/container image.

## License metadata from the committed lockfile

| SPDX expression | Entries |
| --- | ---: |
| `(BSD-2-Clause OR MIT OR Apache-2.0)` | 1 |
| `(MIT AND Zlib)` | 2 |
| `(MIT OR Apache-2.0)` | 1 |
| `(MIT OR GPL-3.0-or-later)` | 1 |
| `(MIT OR WTFPL)` | 1 |
| `0BSD` | 1 |
| `Apache-2.0` | 15 |
| `BSD-2-Clause` | 2 |
| `BSD-3-Clause` | 17 |
| `CC0-1.0` | 1 |
| `ISC` | 22 |
| `MIT` | 219 |
| `MIT AND BSD-3-Clause` | 1 |

## Complete package-level inventory

| Package | Locked version | SPDX metadata | Scope | Notice text | Notice origin |
| --- | --- | --- | --- | --- | --- |
| `@deck.gl/core` | `9.4.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@deck.gl/core/9.4.0/LICENSE.txt) | LICENSE |
| `@deck.gl/extensions` | `9.4.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@deck.gl/extensions/9.4.0/LICENSE.txt) | LICENSE |
| `@deck.gl/geo-layers` | `9.4.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@deck.gl/geo-layers/9.4.0/LICENSE.txt) | LICENSE |
| `@deck.gl/layers` | `9.4.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@deck.gl/layers/9.4.0/LICENSE.txt) | LICENSE |
| `@deck.gl/maplibre` | `9.4.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@deck.gl/maplibre/9.4.0/LICENSE.txt) | LICENSE |
| `@deck.gl/mesh-layers` | `9.4.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@deck.gl/mesh-layers/9.4.0/LICENSE.txt) | LICENSE |
| `@esbuild/aix-ppc64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/aix-ppc64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/android-arm` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/android-arm/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/android-arm64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/android-arm64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/android-x64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/android-x64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/darwin-arm64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/darwin-arm64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/darwin-x64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/darwin-x64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/freebsd-arm64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/freebsd-arm64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/freebsd-x64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/freebsd-x64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/linux-arm` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/linux-arm/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/linux-arm64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/linux-arm64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/linux-ia32` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/linux-ia32/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/linux-loong64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/linux-loong64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/linux-mips64el` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/linux-mips64el/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/linux-ppc64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/linux-ppc64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/linux-riscv64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/linux-riscv64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/linux-s390x` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/linux-s390x/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/linux-x64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/linux-x64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/netbsd-arm64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/netbsd-arm64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/netbsd-x64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/netbsd-x64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/openbsd-arm64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/openbsd-arm64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/openbsd-x64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/openbsd-x64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/openharmony-arm64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/openharmony-arm64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/sunos-x64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/sunos-x64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/win32-arm64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/win32-arm64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/win32-ia32` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/win32-ia32/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@esbuild/win32-x64` | `0.28.2` | `MIT` | dev, optional | [LICENSE/notice](licenses/npm/@esbuild/win32-x64/0.28.2/LICENSE.txt) | fallback — source file not found |
| `@fastify/ajv-compiler` | `4.0.7` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@fastify/ajv-compiler/4.0.7/LICENSE.txt) | LICENSE |
| `@fastify/deepmerge` | `3.2.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@fastify/deepmerge/3.2.2/LICENSE.txt) | LICENSE |
| `@fastify/error` | `4.2.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@fastify/error/4.2.1/LICENSE.txt) | LICENSE |
| `@fastify/fast-json-stringify-compiler` | `5.1.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@fastify/fast-json-stringify-compiler/5.1.1/LICENSE.txt) | LICENSE |
| `@fastify/forwarded` | `3.1.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@fastify/forwarded/3.1.1/LICENSE.txt) | LICENSE |
| `@fastify/merge-json-schemas` | `0.2.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@fastify/merge-json-schemas/0.2.2/LICENSE.txt) | LICENSE |
| `@fastify/proxy-addr` | `5.1.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@fastify/proxy-addr/5.1.2/LICENSE.txt) | LICENSE |
| `@gltf-transform/core` | `4.5.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@gltf-transform/core/4.5.1/LICENSE.txt) | LICENSE.md |
| `@gltf-transform/extensions` | `4.5.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@gltf-transform/extensions/4.5.1/LICENSE.txt) | LICENSE.md |
| `@loaders.gl/3d-tiles` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/3d-tiles/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/3d-tiles/node_modules/long` | `5.3.2` | `Apache-2.0` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/3d-tiles/node_modules/long/5.3.2/LICENSE.txt) | LICENSE |
| `@loaders.gl/compression` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/compression/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/core` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/core/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/crypto` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/crypto/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/draco` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/draco/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/geoarrow` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/geoarrow/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/gis` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/gis/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/gltf` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/gltf/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/images` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/images/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/loader-utils` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/loader-utils/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/math` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/math/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/mvt` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/mvt/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/schema` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/schema/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/schema-utils` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/schema-utils/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/terrain` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/terrain/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/textures` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/textures/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/textures/node_modules/ktx-parse` | `0.7.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/textures/node_modules/ktx-parse/0.7.1/LICENSE.txt) | LICENSE |
| `@loaders.gl/tiles` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/tiles/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/wms` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/wms/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/worker-utils` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/worker-utils/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/xml` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/xml/4.5.4/LICENSE.txt) | LICENSE |
| `@loaders.gl/zip` | `4.5.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@loaders.gl/zip/4.5.4/LICENSE.txt) | LICENSE |
| `@luma.gl/core` | `9.4.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/core/9.4.2/LICENSE.txt) | LICENSE |
| `@luma.gl/engine` | `9.4.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/engine/9.4.2/LICENSE.txt) | LICENSE |
| `@luma.gl/gltf` | `9.4.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/gltf/9.4.2/LICENSE.txt) | LICENSE |
| `@luma.gl/gltf/node_modules/@loaders.gl/core` | `4.4.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/core/4.4.5/LICENSE.txt) | LICENSE |
| `@luma.gl/gltf/node_modules/@loaders.gl/draco` | `4.4.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/draco/4.4.5/LICENSE.txt) | LICENSE |
| `@luma.gl/gltf/node_modules/@loaders.gl/gltf` | `4.4.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/gltf/4.4.5/LICENSE.txt) | LICENSE |
| `@luma.gl/gltf/node_modules/@loaders.gl/images` | `4.4.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/images/4.4.5/LICENSE.txt) | LICENSE |
| `@luma.gl/gltf/node_modules/@loaders.gl/loader-utils` | `4.4.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/loader-utils/4.4.5/LICENSE.txt) | LICENSE |
| `@luma.gl/gltf/node_modules/@loaders.gl/schema` | `4.4.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/schema/4.4.5/LICENSE.txt) | LICENSE |
| `@luma.gl/gltf/node_modules/@loaders.gl/schema-utils` | `4.4.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/schema-utils/4.4.5/LICENSE.txt) | LICENSE |
| `@luma.gl/gltf/node_modules/@loaders.gl/textures` | `4.4.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/textures/4.4.5/LICENSE.txt) | LICENSE |
| `@luma.gl/gltf/node_modules/@loaders.gl/worker-utils` | `4.4.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/worker-utils/4.4.5/LICENSE.txt) | LICENSE |
| `@luma.gl/gltf/node_modules/ktx-parse` | `0.7.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/gltf/node_modules/ktx-parse/0.7.1/LICENSE.txt) | LICENSE |
| `@luma.gl/gpgpu` | `9.4.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/gpgpu/9.4.2/LICENSE.txt) | LICENSE |
| `@luma.gl/shadertools` | `9.4.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/shadertools/9.4.2/LICENSE.txt) | LICENSE |
| `@luma.gl/webgl` | `9.4.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/webgl/9.4.2/LICENSE.txt) | LICENSE |
| `@luma.gl/webgpu` | `9.4.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@luma.gl/webgpu/9.4.2/LICENSE.txt) | LICENSE |
| `@mapbox/jsonlint-lines-primitives` | `2.0.3` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@mapbox/jsonlint-lines-primitives/2.0.3/LICENSE.txt) | LICENSE |
| `@mapbox/martini` | `0.2.0` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/@mapbox/martini/0.2.0/LICENSE.txt) | LICENSE |
| `@mapbox/point-geometry` | `0.1.0` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/@mapbox/point-geometry/0.1.0/LICENSE.txt) | LICENSE |
| `@mapbox/tiny-sdf` | `2.3.0` | `BSD-2-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/@mapbox/tiny-sdf/2.3.0/LICENSE.txt) | LICENSE.txt |
| `@mapbox/unitbezier` | `1.0.0` | `BSD-2-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/@mapbox/unitbezier/1.0.0/LICENSE.txt) | LICENSE |
| `@mapbox/vector-tile` | `1.3.1` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/@mapbox/vector-tile/1.3.1/LICENSE.txt) | LICENSE.txt |
| `@maplibre/geojson-vt` | `6.1.2` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/@maplibre/geojson-vt/6.1.2/LICENSE.txt) | LICENSE |
| `@maplibre/maplibre-gl-style-spec` | `26.4.4` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/@maplibre/maplibre-gl-style-spec/26.4.4/LICENSE.txt) | LICENSE.txt |
| `@maplibre/mlt` | `1.3.0` | `(MIT OR Apache-2.0)` | runtime-classified | [LICENSE/notice](licenses/npm/@maplibre/mlt/1.3.0/LICENSE.txt) | LICENSE.txt |
| `@maplibre/mlt/node_modules/@mapbox/point-geometry` | `1.1.0` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/@maplibre/mlt/node_modules/@mapbox/point-geometry/1.1.0/LICENSE.txt) | LICENSE |
| `@maplibre/vt-pbf` | `4.3.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@maplibre/vt-pbf/4.3.2/LICENSE.txt) | LICENSE |
| `@maplibre/vt-pbf/node_modules/@mapbox/point-geometry` | `1.1.0` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/@maplibre/vt-pbf/node_modules/@mapbox/point-geometry/1.1.0/LICENSE.txt) | LICENSE |
| `@maplibre/vt-pbf/node_modules/pbf` | `5.1.2` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/@maplibre/vt-pbf/node_modules/pbf/5.1.2/LICENSE.txt) | LICENSE |
| `@math.gl/core` | `4.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@math.gl/core/4.1.0/LICENSE.txt) | LICENSE |
| `@math.gl/culling` | `4.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@math.gl/culling/4.1.0/LICENSE.txt) | LICENSE |
| `@math.gl/geospatial` | `4.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@math.gl/geospatial/4.1.0/LICENSE.txt) | LICENSE |
| `@math.gl/polygon` | `4.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@math.gl/polygon/4.1.0/LICENSE.txt) | LICENSE |
| `@math.gl/sun` | `4.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@math.gl/sun/4.1.0/LICENSE.txt) | LICENSE |
| `@math.gl/types` | `4.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@math.gl/types/4.1.0/LICENSE.txt) | LICENSE |
| `@math.gl/web-mercator` | `4.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@math.gl/web-mercator/4.1.0/LICENSE.txt) | LICENSE |
| `@nodable/entities` | `3.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@nodable/entities/3.1.0/LICENSE.txt) | fallback — source file not found |
| `@petamoriken/float16` | `3.9.3` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@petamoriken/float16/3.9.3/LICENSE.txt) | LICENSE |
| `@pinojs/redact` | `0.4.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@pinojs/redact/0.4.0/LICENSE.txt) | LICENSE |
| `@playwright/test` | `1.64.0` | `Apache-2.0` | dev | [LICENSE/notice](licenses/npm/@playwright/test/1.64.0/LICENSE.txt) | LICENSE |
| `@probe.gl/env` | `4.1.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@probe.gl/env/4.1.2/LICENSE.txt) | LICENSE |
| `@probe.gl/log` | `4.1.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@probe.gl/log/4.1.2/LICENSE.txt) | LICENSE |
| `@probe.gl/stats` | `4.1.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@probe.gl/stats/4.1.2/LICENSE.txt) | LICENSE |
| `@turf/boolean-clockwise` | `5.1.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@turf/boolean-clockwise/5.1.5/LICENSE.txt) | LICENSE |
| `@turf/clone` | `5.1.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@turf/clone/5.1.5/LICENSE.txt) | LICENSE |
| `@turf/helpers` | `5.1.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@turf/helpers/5.1.5/LICENSE.txt) | LICENSE |
| `@turf/invariant` | `5.2.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@turf/invariant/5.2.0/LICENSE.txt) | LICENSE |
| `@turf/meta` | `5.2.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@turf/meta/5.2.0/LICENSE.txt) | LICENSE |
| `@turf/rewind` | `5.1.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@turf/rewind/5.1.5/LICENSE.txt) | LICENSE |
| `@types/better-sqlite3` | `7.6.13` | `MIT` | dev | [LICENSE/notice](licenses/npm/@types/better-sqlite3/7.6.13/LICENSE.txt) | LICENSE |
| `@types/brotli` | `1.3.5` | `MIT` | runtime-classified, optional | [LICENSE/notice](licenses/npm/@types/brotli/1.3.5/LICENSE.txt) | LICENSE |
| `@types/crypto-js` | `4.2.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@types/crypto-js/4.2.2/LICENSE.txt) | LICENSE |
| `@types/geojson` | `7946.0.16` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@types/geojson/7946.0.16/LICENSE.txt) | LICENSE |
| `@types/node` | `24.19.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@types/node/24.19.2/LICENSE.txt) | LICENSE |
| `@types/offscreencanvas` | `2019.7.3` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@types/offscreencanvas/2019.7.3/LICENSE.txt) | LICENSE |
| `@types/pako` | `1.0.7` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/@types/pako/1.0.7/LICENSE.txt) | LICENSE |
| `@webgpu/types` | `0.1.74` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/@webgpu/types/0.1.74/LICENSE.txt) | LICENSE |
| `a5-js` | `0.10.1` | `Apache-2.0` | runtime-classified | [LICENSE/notice](licenses/npm/a5-js/0.10.1/LICENSE.txt) | LICENSE |
| `abstract-logging` | `2.0.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/abstract-logging/2.0.1/LICENSE.txt) | fallback — source file not found |
| `ajv` | `8.20.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/ajv/8.20.0/LICENSE.txt) | LICENSE |
| `ajv-formats` | `3.0.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/ajv-formats/3.0.1/LICENSE.txt) | LICENSE |
| `ajv/node_modules/fast-uri` | `3.1.8` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/ajv/node_modules/fast-uri/3.1.8/LICENSE.txt) | LICENSE |
| `anynum` | `1.0.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/anynum/1.0.1/LICENSE.txt) | LICENSE |
| `apache-arrow` | `21.2.0` | `Apache-2.0` | runtime-classified | [LICENSE/notice](licenses/npm/apache-arrow/21.2.0/LICENSE.txt) | LICENSE.txt |
| `apache-arrow/node_modules/@types/node` | `25.9.9` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/apache-arrow/node_modules/@types/node/25.9.9/LICENSE.txt) | LICENSE |
| `argparse` | `1.0.10` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/argparse/1.0.10/LICENSE.txt) | LICENSE |
| `atomic-sleep` | `1.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/atomic-sleep/1.0.0/LICENSE.txt) | LICENSE |
| `avvio` | `9.3.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/avvio/9.3.1/LICENSE.txt) | LICENSE |
| `base64-js` | `1.5.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/base64-js/1.5.1/LICENSE.txt) | LICENSE |
| `better-sqlite3` | `12.11.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/better-sqlite3/12.11.1/LICENSE.txt) | LICENSE |
| `bidi-js` | `1.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/bidi-js/1.1.0/LICENSE.txt) | LICENSE.txt |
| `bindings` | `1.5.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/bindings/1.5.0/LICENSE.txt) | LICENSE.md |
| `bl` | `4.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/bl/4.1.0/LICENSE.txt) | LICENSE.md |
| `bl/node_modules/readable-stream` | `3.6.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/bl/node_modules/readable-stream/3.6.2/LICENSE.txt) | LICENSE |
| `brotli` | `1.3.3` | `MIT` | runtime-classified, optional | [LICENSE/notice](licenses/npm/brotli/1.3.3/LICENSE.txt) | fallback — source file not found |
| `buf-compare` | `1.0.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/buf-compare/1.0.1/LICENSE.txt) | license |
| `buffer` | `5.7.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/buffer/5.7.1/LICENSE.txt) | LICENSE |
| `buffer-crc32` | `1.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/buffer-crc32/1.0.0/LICENSE.txt) | LICENSE |
| `charenc` | `0.0.2` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/charenc/0.0.2/LICENSE.txt) | LICENSE.mkd |
| `chownr` | `1.1.4` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/chownr/1.1.4/LICENSE.txt) | LICENSE |
| `cookie` | `2.0.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/cookie/2.0.1/LICENSE.txt) | LICENSE |
| `core-assert` | `0.2.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/core-assert/0.2.1/LICENSE.txt) | license |
| `core-util-is` | `1.0.3` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/core-util-is/1.0.3/LICENSE.txt) | LICENSE |
| `crypt` | `0.0.2` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/crypt/0.0.2/LICENSE.txt) | LICENSE.mkd |
| `decompress-response` | `6.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/decompress-response/6.0.0/LICENSE.txt) | license |
| `deep-extend` | `0.6.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/deep-extend/0.6.0/LICENSE.txt) | LICENSE |
| `deep-strict-equal` | `0.2.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/deep-strict-equal/0.2.0/LICENSE.txt) | license |
| `dequal` | `2.0.3` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/dequal/2.0.3/LICENSE.txt) | license |
| `detect-libc` | `2.1.2` | `Apache-2.0` | runtime-classified | [LICENSE/notice](licenses/npm/detect-libc/2.1.2/LICENSE.txt) | LICENSE |
| `draco3d` | `1.5.7` | `Apache-2.0` | runtime-classified | [LICENSE/notice](licenses/npm/draco3d/1.5.7/LICENSE.txt) | fallback — source file not found |
| `earcut` | `2.2.4` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/earcut/2.2.4/LICENSE.txt) | LICENSE |
| `end-of-stream` | `1.4.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/end-of-stream/1.4.5/LICENSE.txt) | LICENSE |
| `esbuild` | `0.28.2` | `MIT` | dev | [LICENSE/notice](licenses/npm/esbuild/0.28.2/LICENSE.txt) | LICENSE.md |
| `expand-template` | `2.0.3` | `(MIT OR WTFPL)` | runtime-classified | [LICENSE/notice](licenses/npm/expand-template/2.0.3/LICENSE.txt) | LICENSE |
| `fast-decode-uri-component` | `1.0.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/fast-decode-uri-component/1.0.1/LICENSE.txt) | LICENSE |
| `fast-deep-equal` | `3.1.3` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/fast-deep-equal/3.1.3/LICENSE.txt) | LICENSE |
| `fast-json-stringify` | `7.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/fast-json-stringify/7.1.0/LICENSE.txt) | LICENSE |
| `fast-querystring` | `1.1.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/fast-querystring/1.1.2/LICENSE.txt) | LICENSE |
| `fast-uri` | `4.2.2` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/fast-uri/4.2.2/LICENSE.txt) | LICENSE |
| `fast-xml-builder` | `1.3.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/fast-xml-builder/1.3.1/LICENSE.txt) | LICENSE |
| `fast-xml-parser` | `5.11.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/fast-xml-parser/5.11.2/LICENSE.txt) | LICENSE |
| `fastify` | `5.12.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/fastify/5.12.5/LICENSE.txt) | LICENSE |
| `fastq` | `1.20.3` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/fastq/1.20.3/LICENSE.txt) | LICENSE |
| `fflate` | `0.7.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/fflate/0.7.4/LICENSE.txt) | LICENSE |
| `file-uri-to-path` | `1.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/file-uri-to-path/1.0.0/LICENSE.txt) | LICENSE |
| `find-my-way` | `9.10.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/find-my-way/9.10.0/LICENSE.txt) | LICENSE |
| `flatbuffers` | `25.9.23` | `Apache-2.0` | runtime-classified | [LICENSE/notice](licenses/npm/flatbuffers/25.9.23/LICENSE.txt) | LICENSE |
| `fs-constants` | `1.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/fs-constants/1.0.0/LICENSE.txt) | LICENSE |
| `geotiff` | `3.0.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/geotiff/3.0.5/LICENSE.txt) | LICENSE |
| `geotiff/node_modules/pako` | `2.2.0` | `(MIT AND Zlib)` | runtime-classified | [LICENSE/notice](licenses/npm/geotiff/node_modules/pako/2.2.0/LICENSE.txt) | LICENSE |
| `github-from-package` | `0.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/github-from-package/0.0.0/LICENSE.txt) | LICENSE |
| `gl-matrix` | `3.4.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/gl-matrix/3.4.4/LICENSE.txt) | LICENSE.md |
| `h3-js` | `4.5.0` | `Apache-2.0` | runtime-classified | [LICENSE/notice](licenses/npm/h3-js/4.5.0/LICENSE.txt) | LICENSE |
| `ieee754` | `1.2.1` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/ieee754/1.2.1/LICENSE.txt) | LICENSE |
| `image-size` | `0.7.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/image-size/0.7.5/LICENSE.txt) | LICENSE |
| `immediate` | `3.0.6` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/immediate/3.0.6/LICENSE.txt) | LICENSE.txt |
| `inherits` | `2.0.4` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/inherits/2.0.4/LICENSE.txt) | LICENSE |
| `ini` | `1.3.8` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/ini/1.3.8/LICENSE.txt) | LICENSE |
| `ipaddr.js` | `2.5.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/ipaddr.js/2.5.0/LICENSE.txt) | LICENSE |
| `is-buffer` | `1.1.6` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/is-buffer/1.1.6/LICENSE.txt) | LICENSE |
| `is-error` | `2.2.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/is-error/2.2.2/LICENSE.txt) | LICENSE |
| `is-unsafe` | `2.0.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/is-unsafe/2.0.2/LICENSE.txt) | LICENSE |
| `isarray` | `1.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/isarray/1.0.0/LICENSE.txt) | fallback — source file not found |
| `json-schema-ref-resolver` | `3.0.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/json-schema-ref-resolver/3.0.1/LICENSE.txt) | LICENSE |
| `json-schema-traverse` | `1.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/json-schema-traverse/1.0.0/LICENSE.txt) | LICENSE |
| `json-stringify-pretty-compact` | `4.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/json-stringify-pretty-compact/4.0.0/LICENSE.txt) | LICENSE |
| `json-with-bigint` | `3.5.12` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/json-with-bigint/3.5.12/LICENSE.txt) | LICENSE |
| `jszip` | `3.10.2` | `(MIT OR GPL-3.0-or-later)` | runtime-classified | [LICENSE/notice](licenses/npm/jszip/3.10.2/LICENSE.txt) | LICENSE.markdown |
| `kdbush` | `4.1.0` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/kdbush/4.1.0/LICENSE.txt) | LICENSE |
| `ktx-parse` | `1.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/ktx-parse/1.1.0/LICENSE.txt) | LICENSE |
| `lerc` | `3.0.0` | `Apache-2.0` | runtime-classified | [LICENSE/notice](licenses/npm/lerc/3.0.0/LICENSE.txt) | fallback — source file not found |
| `lie` | `3.3.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/lie/3.3.0/LICENSE.txt) | license.md |
| `light-my-request` | `6.8.0` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/light-my-request/6.8.0/LICENSE.txt) | LICENSE |
| `long` | `3.2.0` | `Apache-2.0` | runtime-classified | [LICENSE/notice](licenses/npm/long/3.2.0/LICENSE.txt) | LICENSE |
| `lz4js` | `0.2.0` | `ISC` | runtime-classified, optional | [LICENSE/notice](licenses/npm/lz4js/0.2.0/LICENSE.txt) | fallback — source file not found |
| `maplibre-gl` | `6.12.0` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/maplibre-gl/6.12.0/LICENSE.txt) | LICENSE.txt |
| `maplibre-gl/node_modules/@mapbox/point-geometry` | `1.1.0` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/maplibre-gl/node_modules/@mapbox/point-geometry/1.1.0/LICENSE.txt) | LICENSE |
| `maplibre-gl/node_modules/@mapbox/vector-tile` | `3.0.0` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/maplibre-gl/node_modules/@mapbox/vector-tile/3.0.0/LICENSE.txt) | LICENSE.txt |
| `maplibre-gl/node_modules/earcut` | `3.2.4` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/maplibre-gl/node_modules/earcut/3.2.4/LICENSE.txt) | LICENSE |
| `maplibre-gl/node_modules/pbf` | `5.1.2` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/maplibre-gl/node_modules/pbf/5.1.2/LICENSE.txt) | LICENSE |
| `md5` | `2.3.0` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/md5/2.3.0/LICENSE.txt) | LICENSE |
| `meshoptimizer` | `1.3.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/meshoptimizer/1.3.0/LICENSE.txt) | LICENSE.md |
| `mgrs` | `1.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/mgrs/1.0.0/LICENSE.txt) | license.md |
| `mimic-response` | `3.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/mimic-response/3.1.0/LICENSE.txt) | license |
| `minimist` | `1.2.8` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/minimist/1.2.8/LICENSE.txt) | LICENSE |
| `mjolnir.js` | `3.1.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/mjolnir.js/3.1.1/LICENSE.txt) | LICENSE |
| `mkdirp-classic` | `0.5.3` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/mkdirp-classic/0.5.3/LICENSE.txt) | LICENSE |
| `murmurhash-js` | `1.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/murmurhash-js/1.0.0/LICENSE.txt) | fallback — source file not found |
| `napi-build-utils` | `2.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/napi-build-utils/2.0.0/LICENSE.txt) | LICENSE |
| `node-abi` | `3.98.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/node-abi/3.98.0/LICENSE.txt) | LICENSE |
| `on-exit-leak-free` | `2.1.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/on-exit-leak-free/2.1.2/LICENSE.txt) | LICENSE |
| `once` | `1.4.0` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/once/1.4.0/LICENSE.txt) | LICENSE |
| `pako` | `1.0.11` | `(MIT AND Zlib)` | runtime-classified | [LICENSE/notice](licenses/npm/pako/1.0.11/LICENSE.txt) | LICENSE |
| `parse-headers` | `2.0.6` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/parse-headers/2.0.6/LICENSE.txt) | LICENCE |
| `path-expression-matcher` | `1.6.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/path-expression-matcher/1.6.2/LICENSE.txt) | LICENSE |
| `pbf` | `3.3.0` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/pbf/3.3.0/LICENSE.txt) | LICENSE |
| `pino` | `10.4.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/pino/10.4.0/LICENSE.txt) | LICENSE |
| `pino-abstract-transport` | `3.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/pino-abstract-transport/3.0.0/LICENSE.txt) | LICENSE |
| `pino-std-serializers` | `7.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/pino-std-serializers/7.1.0/LICENSE.txt) | LICENSE |
| `playwright` | `1.64.0` | `Apache-2.0` | dev | [LICENSE/notice](licenses/npm/playwright/1.64.0/LICENSE.txt) | LICENSE |
| `playwright-core` | `1.64.0` | `Apache-2.0` | dev | [LICENSE/notice](licenses/npm/playwright-core/1.64.0/LICENSE.txt) | LICENSE |
| `pmtiles` | `4.5.0` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/pmtiles/4.5.0/LICENSE.txt) | fallback — source file not found |
| `pmtiles/node_modules/fflate` | `0.8.3` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/pmtiles/node_modules/fflate/0.8.3/LICENSE.txt) | LICENSE |
| `potpack` | `2.1.0` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/potpack/2.1.0/LICENSE.txt) | LICENSE |
| `prebuild-install` | `7.1.3` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/prebuild-install/7.1.3/LICENSE.txt) | LICENSE |
| `process-nextick-args` | `2.0.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/process-nextick-args/2.0.1/LICENSE.txt) | license.md |
| `process-warning` | `5.1.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/process-warning/5.1.1/LICENSE.txt) | LICENSE |
| `proj4` | `2.22.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/proj4/2.22.0/LICENSE.txt) | LICENSE.md |
| `property-graph` | `4.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/property-graph/4.1.0/LICENSE.txt) | LICENSE |
| `protocol-buffers-schema` | `3.6.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/protocol-buffers-schema/3.6.1/LICENSE.txt) | LICENSE |
| `pump` | `3.0.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/pump/3.0.4/LICENSE.txt) | LICENSE |
| `quick-format-unescaped` | `4.0.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/quick-format-unescaped/4.0.4/LICENSE.txt) | LICENSE |
| `quick-lru` | `6.1.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/quick-lru/6.1.2/LICENSE.txt) | license |
| `quickselect` | `3.0.0` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/quickselect/3.0.0/LICENSE.txt) | LICENSE |
| `rc` | `1.2.8` | `(BSD-2-Clause OR MIT OR Apache-2.0)` | runtime-classified | [LICENSE/notice](licenses/npm/rc/1.2.8/LICENSE.txt) | LICENSE.APACHE2 |
| `readable-stream` | `2.3.8` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/readable-stream/2.3.8/LICENSE.txt) | LICENSE |
| `real-require` | `1.0.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/real-require/1.0.0/LICENSE.txt) | LICENSE.md |
| `require-from-string` | `2.0.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/require-from-string/2.0.2/LICENSE.txt) | license |
| `resolve-protobuf-schema` | `2.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/resolve-protobuf-schema/2.1.0/LICENSE.txt) | LICENSE |
| `ret` | `0.5.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/ret/0.5.0/LICENSE.txt) | LICENSE |
| `reusify` | `1.1.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/reusify/1.1.0/LICENSE.txt) | LICENSE |
| `rfdc` | `1.4.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/rfdc/1.4.1/LICENSE.txt) | LICENSE |
| `safe-buffer` | `5.1.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/safe-buffer/5.1.2/LICENSE.txt) | LICENSE |
| `safe-regex2` | `5.1.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/safe-regex2/5.1.2/LICENSE.txt) | LICENSE |
| `safe-stable-stringify` | `2.5.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/safe-stable-stringify/2.5.0/LICENSE.txt) | LICENSE |
| `secure-json-parse` | `4.1.1` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/secure-json-parse/4.1.1/LICENSE.txt) | LICENSE |
| `semver` | `7.8.5` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/semver/7.8.5/LICENSE.txt) | LICENSE |
| `set-cookie-parser` | `3.1.3` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/set-cookie-parser/3.1.3/LICENSE.txt) | LICENSE |
| `setimmediate` | `1.0.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/setimmediate/1.0.5/LICENSE.txt) | LICENSE.txt |
| `simple-concat` | `1.0.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/simple-concat/1.0.1/LICENSE.txt) | LICENSE |
| `simple-get` | `4.0.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/simple-get/4.0.1/LICENSE.txt) | LICENSE |
| `snappyjs` | `0.6.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/snappyjs/0.6.1/LICENSE.txt) | LICENSE |
| `sonic-boom` | `4.2.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/sonic-boom/4.2.1/LICENSE.txt) | LICENSE |
| `split2` | `4.2.0` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/split2/4.2.0/LICENSE.txt) | LICENSE |
| `sprintf-js` | `1.0.3` | `BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/sprintf-js/1.0.3/LICENSE.txt) | LICENSE |
| `string_decoder` | `1.1.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/string_decoder/1.1.1/LICENSE.txt) | LICENSE |
| `strip-json-comments` | `2.0.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/strip-json-comments/2.0.1/LICENSE.txt) | license |
| `strnum` | `2.5.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/strnum/2.5.1/LICENSE.txt) | LICENSE |
| `tar-fs` | `2.1.5` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/tar-fs/2.1.5/LICENSE.txt) | LICENSE |
| `tar-stream` | `2.2.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/tar-stream/2.2.0/LICENSE.txt) | LICENSE |
| `tar-stream/node_modules/readable-stream` | `3.6.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/tar-stream/node_modules/readable-stream/3.6.2/LICENSE.txt) | LICENSE |
| `texture-compressor` | `1.0.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/texture-compressor/1.0.2/LICENSE.txt) | LICENSE |
| `thread-stream` | `4.2.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/thread-stream/4.2.0/LICENSE.txt) | LICENSE |
| `tinyqueue` | `3.0.0` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/tinyqueue/3.0.0/LICENSE.txt) | LICENSE |
| `toad-cache` | `3.7.4` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/toad-cache/3.7.4/LICENSE.txt) | LICENSE |
| `tslib` | `2.8.1` | `0BSD` | runtime-classified | [LICENSE/notice](licenses/npm/tslib/2.8.1/LICENSE.txt) | LICENSE.txt |
| `tunnel-agent` | `0.6.0` | `Apache-2.0` | runtime-classified | [LICENSE/notice](licenses/npm/tunnel-agent/0.6.0/LICENSE.txt) | LICENSE |
| `typescript` | `5.9.3` | `Apache-2.0` | dev | [LICENSE/notice](licenses/npm/typescript/5.9.3/LICENSE.txt) | LICENSE.txt |
| `undici-types` | `7.24.6` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/undici-types/7.24.6/LICENSE.txt) | LICENSE |
| `util-deprecate` | `1.0.2` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/util-deprecate/1.0.2/LICENSE.txt) | LICENSE |
| `web-worker` | `1.5.0` | `Apache-2.0` | runtime-classified | [LICENSE/notice](licenses/npm/web-worker/1.5.0/LICENSE.txt) | LICENSE |
| `wkt-parser` | `1.5.6` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/wkt-parser/1.5.6/LICENSE.txt) | LICENSE.md |
| `wrappy` | `1.0.2` | `ISC` | runtime-classified | [LICENSE/notice](licenses/npm/wrappy/1.0.2/LICENSE.txt) | LICENSE |
| `xml-naming` | `0.3.0` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/xml-naming/0.3.0/LICENSE.txt) | LICENSE |
| `xml-utils` | `1.10.2` | `CC0-1.0` | runtime-classified | [LICENSE/notice](licenses/npm/xml-utils/1.10.2/LICENSE.txt) | LICENSE |
| `yazl` | `3.3.1` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/yazl/3.3.1/LICENSE.txt) | LICENSE |
| `zod` | `4.6.7` | `MIT` | runtime-classified | [LICENSE/notice](licenses/npm/zod/4.6.7/LICENSE.txt) | LICENSE |
| `zstd-codec` | `0.1.5` | `MIT` | runtime-classified, optional | [LICENSE/notice](licenses/npm/zstd-codec/0.1.5/LICENSE.txt) | fallback — source file not found |
| `zstddec` | `0.2.0` | `MIT AND BSD-3-Clause` | runtime-classified | [LICENSE/notice](licenses/npm/zstddec/0.2.0/LICENSE.txt) | LICENSE |

For distributions, archive the exact upstream files and verify all native transitive dependencies against the final artifact; see [coverage](LICENSE_COVERAGE.md) and [release gate](RELEASE_GATE.md).
