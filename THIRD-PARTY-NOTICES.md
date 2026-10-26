# TileO Third-Party Software Notices and Licenses

This document is generated from committed, exact-version license evidence. It is the redistribution notice set for TileO third-party components.

> **Certification boundary:** this notice document records evidence, not a blanket permissive-only certification of an image. A release claim additionally requires a final-image SBOM, an `ldd`/`readelf` closure audit and human approval of the documented exceptions listed below.

Generated: 2026-10-26 · Lockfile SHA-256: `d7a17b3fa9ec1d16131d2319805b52873245b31c4c508119e278d3d570128683`

## Verification summary

| Evidence set | Count | Method |
| --- | ---: | --- |
| npm entries in `package-lock.json` | 291 | Direct, transitive, development and platform-optional entries |
| npm notices verified from exact tarball | 252 | sha512 integrity + extracted LICENSE/COPYING/NOTICE + SHA-256 |
| npm metadata-only entries | 39 | Tarball has no license file; only `package.json` metadata retained |
| npm runtime entries marked metadata-only | 13 | Review required before strict release |
| Native runtime components | 28 | Pinned upstream license corpus |
| Native permissive expressions | 25 | Policy evaluation by `scripts/lib/license-policy.js` |
| Native documented exceptions | 3 | GCC runtime exception + certificate data |

**Permissive Migration Objective**: TileO targets a distribution whose shipped third-party software is limited to verified permissive licenses. This objective is tracked per component. Components marked `REVIEW_REQUIRED_METADATA_ONLY` or `LEGAL_EXCEPTION_RECORDED` are not represented as permissive passes.

---

## Primary Application License

- **TileO Application**: Copyright (c) 2026 TileO Contributors. Licensed under **GNU Affero General Public License v3.0 only (AGPL-3.0-only)**. See [`LICENSE`](LICENSE).
- The AGPL-3.0-only license applies to TileO source code identified as such. Third-party components remain under their own licenses and notices.

---

## Dual-License / Multi-License Elections

Where upstream explicitly offers alternative licenses, TileO elects the following permissive option. Elections are valid only for the exact versions listed.

| Package | Upstream Offered Options | Formal TileO Election | Rationale |
|---|---|---|---|
| `jszip@3.10.2` | `MIT OR GPL-3.0-or-later` | **MIT** | Elects the permissive terms; copyleft alternatives are not selected or exercised. |
| `expand-template@2.0.3` | `MIT OR WTFPL` | **MIT** | Elects the permissive terms; copyleft alternatives are not selected or exercised. |
| `rc@1.2.8` | `BSD-2-Clause OR MIT OR Apache-2.0` | **BSD-2-Clause** | Elects the permissive terms; copyleft alternatives are not selected or exercised. |
| `@maplibre/mlt@1.3.0` | `MIT OR Apache-2.0` | **MIT** | Elects the permissive terms; copyleft alternatives are not selected or exercised. |

---

## Native Runtime Components

The release target is a minimal scratch/musl image. The table below is the declared native component set. The final image audit must prove the exact versions and ELF closure; see [`third-party/NATIVE_COMPONENTS.md`](third-party/NATIVE_COMPONENTS.md).

| Component | Version | License expression | Linkage | Evidence |
| --- | --- | --- | --- | --- |
| Musl C Library | 1.2.5 | `MIT` | static | `third-party/licenses/native/musl/COPYING.txt` |
| Node.js | 24.13.1 | `MIT` | executable | `third-party/licenses/native/node/LICENSE.txt` |
| ICU | 77.1 | `Unicode-3.0` | static | `third-party/licenses/native/icu/LICENSE.txt` |
| GDAL | 3.11.4 | `MIT` | shared-library-and-executable | `third-party/licenses/native/gdal/LICENSE.txt` |
| PROJ | 9.6.2 | `MIT` | shared-library-and-data | `third-party/licenses/native/proj/COPYING.txt` |
| Tippecanoe | 2.79.0 | `BSD-2-Clause` | executable | `third-party/licenses/native/tippecanoe/LICENSE.txt` |
| protozero (Tippecanoe) | 1.7.1 | `BSD-2-Clause` | static | `third-party/licenses/native/tippecanoe-protozero/LICENSE.txt` |
| Clipper2 (Tippecanoe) | 1.5.4 | `BSL-1.0` | static | `third-party/licenses/native/tippecanoe-clipper2/LICENSE.txt` |
| mapbox geometry.hpp (Tippecanoe) | 2.0.3 | `ISC` | static | `third-party/licenses/native/tippecanoe-geometry/LICENSE.txt` |
| mapbox variant (Tippecanoe) | 2.0.0 | `BSD-2-Clause` | static | `third-party/licenses/native/tippecanoe-variant/LICENSE.txt` |
| SQLite | 3.48.0 | `Public-Domain` | static | `third-party/licenses/native/sqlite/COPYRIGHT.html` |
| libcurl | 8.14.1 | `curl` | shared-library | `third-party/licenses/native/curl/COPYING.txt` |
| OpenSSL | 3.5.1 | `Apache-2.0` | shared-library | `third-party/licenses/native/openssl/LICENSE.txt` |
| nghttp2 | 1.64.0 | `MIT` | shared-library | `third-party/licenses/native/nghttp2/COPYING.txt` |
| zlib | 1.3.1 | `Zlib` | shared-library | `third-party/licenses/native/zlib/LICENSE.txt` |
| libpng | 1.6.47 | `libpng-2.0` | shared-library | `third-party/licenses/native/libpng/LICENSE.txt` |
| libjpeg-turbo | 3.1.0 | `IJG AND BSD-3-Clause AND Zlib` | shared-library | `third-party/licenses/native/libjpeg-turbo/LICENSE.txt` |
| libwebp | 1.5.0 | `BSD-3-Clause` | shared-library | `third-party/licenses/native/libwebp/COPYING.txt` |
| OpenJPEG | 2.5.3 | `BSD-2-Clause` | shared-library | `third-party/licenses/native/openjpeg/LICENSE.txt` |
| Expat | 2.6.4 | `MIT` | shared-library | `third-party/licenses/native/expat/COPYING.txt` |
| libtiff | 4.7.0 | `libtiff` | shared-library | `third-party/licenses/native/libtiff/LICENSE.txt` |
| libgeotiff | 1.7.4 | `MIT` | shared-library | `third-party/licenses/native/libgeotiff/LICENSE.txt` |
| libdeflate | 1.23 | `MIT` | shared-library | `third-party/licenses/native/libdeflate/COPYING.txt` |
| XZ Utils | 5.8.1 | `0BSD` | shared-library | `third-party/licenses/native/xz/COPYING.txt` |
| FlatBuffers | 25.2.10 | `Apache-2.0` | static | `third-party/licenses/native/flatbuffers/LICENSE.txt` |
| GNU Standard C++ Library (libstdc++) | 14.2.0 | `GPL-3.0-only WITH GCC-exception-3.1` **(LEGAL_EXCEPTION_REQUIRED)** | shared-library | `third-party/licenses/native/libstdc++/COPYING3.txt`<br>`third-party/licenses/native/libstdc++/COPYING-RUNTIME.txt` |
| GNU Compiler Collection runtime (libgcc) | 14.2.0 | `GPL-3.0-only WITH GCC-exception-3.1` **(LEGAL_EXCEPTION_REQUIRED)** | shared-library | `third-party/licenses/native/libgcc/COPYING3.txt`<br>`third-party/licenses/native/libgcc/COPYING-RUNTIME.txt` |
| Mozilla CA Certificate Bundle | 2025-06-19 | `MPL-2.0` **(DATA_LICENSE_RECORDED)** | data | `third-party/licenses/native/ca-certificates/MPL-2.0.txt` |

### Documented Exceptions

These are **not** permissive licenses and must be approved explicitly before a strict permissive-only claim:

- **GNU Standard C++ Library (libstdc++) 14.2.0** — `GPL-3.0-only WITH GCC-exception-3.1`. This is a documented exception to the permissive-only objective, covered by the GCC Runtime Library Exception 3.1. The exception permits distribution of the runtime library with independent programs.
- **GNU Compiler Collection runtime (libgcc) 14.2.0** — `GPL-3.0-only WITH GCC-exception-3.1`. Same GCC Runtime Library Exception as libstdc++; recorded as a legal exception, not as a permissive license.
- **Mozilla CA Certificate Bundle 2025-06-19** — `MPL-2.0`. Trust-anchor data redistributed under MPL-2.0. It is not linked code and does not affect the TileO source license; it must be recorded as a data-scope obligation.

The GCC runtime exception permits distributing `libstdc++`/`libgcc` with independent programs. The CA bundle is data-scope MPL-2.0 and is not linked into TileO code. Both require a recorded human decision; neither is silently counted as permissive.

---

## Geospatial Data & Client Renderer Legal Separation

### 1. OpenStreetMap (OSM) Geodata Separation
- **Data License**: OpenStreetMap geographical data is licensed under the **Open Database License 1.0 (ODbL-1.0)** by the OpenStreetMap Foundation (OSMF).
- **Separation**: ODbL is a *database/data license* and does not apply to or infect the TileO application source code, API, or build artifacts.
- **Configuration**: TileO defaults to a **neutral dark canvas (`#0b131e`) with zero network tile requests and zero ODbL data exposure**. OpenStreetMap tile services are only accessed when an operator explicitly opts in via `TILEO_BASEMAP_URL=osm` or custom configuration.
- **Attribution & Usage Policy**: When OSM is enabled, mandatory attribution (`© OpenStreetMap contributors`) is displayed in the user interface and API metadata, and tile proxying respects OSMF Tile Usage Policies.

### 2. Client-Side Renderers & Vector Tile Archives
- **MapLibre GL JS**: Copyright (c) MapLibre contributors. Licensed under **BSD-3-Clause**.
- **PMTiles Client**: Copyright (c) Protomaps LLC. Licensed under **BSD-3-Clause**.
- Both client libraries are strictly permissive and operate offline without external services.

---

## npm License Inventory

Each entry names the exact locked version, the recorded license expression, the verification state and the SHA-256 of the stored upstream notice. Development-only entries are not shipped in the runtime image; platform-optional entries are shipped only on matching platforms.

### Runtime and optional entries (257)

#### @deck.gl/core (9.4.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `28328885fe8dd7c5411eb681930a3395a41f26aa0a636cb5d1a4c2ef5f59dd38`
- **Notice**: [`third-party/licenses/npm/@deck.gl/core/9.4.0/LICENSE.txt`](third-party/licenses/npm/@deck.gl/core/9.4.0/LICENSE.txt) · SHA-256 `e499a2c2ba3b9faabe91fdfddf43e329439263264b7148e5548d0ec605cce9f2`

````text
Copyright Vis.gl contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @deck.gl/extensions (9.4.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `0e685b6539b8d1ccdaea903d4793720028ad0657bd96d7d212525b9956a84bf3`
- **Notice**: [`third-party/licenses/npm/@deck.gl/extensions/9.4.0/LICENSE.txt`](third-party/licenses/npm/@deck.gl/extensions/9.4.0/LICENSE.txt) · SHA-256 `e499a2c2ba3b9faabe91fdfddf43e329439263264b7148e5548d0ec605cce9f2`

````text
Copyright Vis.gl contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @deck.gl/geo-layers (9.4.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `a91e4ed871c0b29b29b5f0314dbe0c7d96cfab1692c6a6d5410b5c747ddb6080`
- **Notice**: [`third-party/licenses/npm/@deck.gl/geo-layers/9.4.0/LICENSE.txt`](third-party/licenses/npm/@deck.gl/geo-layers/9.4.0/LICENSE.txt) · SHA-256 `e499a2c2ba3b9faabe91fdfddf43e329439263264b7148e5548d0ec605cce9f2`

````text
Copyright Vis.gl contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @deck.gl/layers (9.4.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `0e27fefa2e2e4fbaaff228307c36b4d14ff74f0f990b0619c413e08fef857052`
- **Notice**: [`third-party/licenses/npm/@deck.gl/layers/9.4.0/LICENSE.txt`](third-party/licenses/npm/@deck.gl/layers/9.4.0/LICENSE.txt) · SHA-256 `e499a2c2ba3b9faabe91fdfddf43e329439263264b7148e5548d0ec605cce9f2`

````text
Copyright Vis.gl contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @deck.gl/maplibre (9.4.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d0c2bc170807632a573e0dabfd61f42ba53f60d5be2502cf58552f5d39ce7fa3`
- **Notice**: [`third-party/licenses/npm/@deck.gl/maplibre/9.4.0/LICENSE.txt`](third-party/licenses/npm/@deck.gl/maplibre/9.4.0/LICENSE.txt) · SHA-256 `e499a2c2ba3b9faabe91fdfddf43e329439263264b7148e5548d0ec605cce9f2`

````text
Copyright Vis.gl contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @deck.gl/mesh-layers (9.4.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `c341f82ce7453ec9550096f5fe2afd9d6ce41dde72ac6c7b4582d7a0aa71e5bc`
- **Notice**: [`third-party/licenses/npm/@deck.gl/mesh-layers/9.4.0/LICENSE.txt`](third-party/licenses/npm/@deck.gl/mesh-layers/9.4.0/LICENSE.txt) · SHA-256 `e499a2c2ba3b9faabe91fdfddf43e329439263264b7148e5548d0ec605cce9f2`

````text
Copyright Vis.gl contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @fastify/ajv-compiler (4.0.7)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `ef9fc96f65c5f3f29af8282428a3e794524b6241b1b3653e6b4048a5fa82c512`
- **Notice**: [`third-party/licenses/npm/@fastify/ajv-compiler/4.0.7/LICENSE.txt`](third-party/licenses/npm/@fastify/ajv-compiler/4.0.7/LICENSE.txt) · SHA-256 `e2d09f74a77005e85e9f9bd501e3b7599ccae19d918538461196dde42f7f1b97`

````text
MIT License

Copyright (c) 2022-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @fastify/deepmerge (3.2.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `4c420354f20188d794460db35053b6ea8bd043e5c3e95da4cb44e6b9830d3abb`
- **Notice**: [`third-party/licenses/npm/@fastify/deepmerge/3.2.2/LICENSE.txt`](third-party/licenses/npm/@fastify/deepmerge/3.2.2/LICENSE.txt) · SHA-256 `e2d09f74a77005e85e9f9bd501e3b7599ccae19d918538461196dde42f7f1b97`

````text
MIT License

Copyright (c) 2022-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @fastify/error (4.2.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `a11e7577f97eb35330f835e7cc0e465f810c5ac87ab8043be01049fcc5caf233`
- **Notice**: [`third-party/licenses/npm/@fastify/error/4.2.1/LICENSE.txt`](third-party/licenses/npm/@fastify/error/4.2.1/LICENSE.txt) · SHA-256 `8d3c1dd501e056405ab56f4ad87b987070d55d1fe814616584ec2360045f9017`

````text
MIT License

Copyright (c) 2020-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @fastify/fast-json-stringify-compiler (5.1.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `e5b1e1f25c722582e7c8089dca0d93d9705035876ffb22013d82af5c8289b6b2`
- **Notice**: [`third-party/licenses/npm/@fastify/fast-json-stringify-compiler/5.1.1/LICENSE.txt`](third-party/licenses/npm/@fastify/fast-json-stringify-compiler/5.1.1/LICENSE.txt) · SHA-256 `e2d09f74a77005e85e9f9bd501e3b7599ccae19d918538461196dde42f7f1b97`

````text
MIT License

Copyright (c) 2022-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @fastify/forwarded (3.1.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `6dd69e690a3107e073f224ca7af14e72c1456973e5641dc338353df76e68af9f`
- **Notice**: [`third-party/licenses/npm/@fastify/forwarded/3.1.1/LICENSE.txt`](third-party/licenses/npm/@fastify/forwarded/3.1.1/LICENSE.txt) · SHA-256 `9276503e39bdcaad7d26993fae17b1e82d7ef65cf0fe0ae54c361bbc6cbc33da`

````text
MIT License

Copyright (c) 2014-2017 Douglas Christopher Wilson
Copyright (c) 2021-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @fastify/merge-json-schemas (0.2.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `fabcf6f570e0874273e1933b800cc0e17d69750227be0288f137f308199d5745`
- **Notice**: [`third-party/licenses/npm/@fastify/merge-json-schemas/0.2.2/LICENSE.txt`](third-party/licenses/npm/@fastify/merge-json-schemas/0.2.2/LICENSE.txt) · SHA-256 `6881fdd0f607b4f202c5421b0e6de1cf72041e0207b73681bbf6509fe7b86c44`

````text
MIT License

Copyright (c) 2024-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @fastify/proxy-addr (5.1.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `29f44224a47b700754365205ef0b178c7959efd4cb69349999b56baa984d46cf`
- **Notice**: [`third-party/licenses/npm/@fastify/proxy-addr/5.1.2/LICENSE.txt`](third-party/licenses/npm/@fastify/proxy-addr/5.1.2/LICENSE.txt) · SHA-256 `4ffb54af38f35ca8005893c382e19f3c3e919c499d50804c00d3c124bc6508f4`

````text
MIT License

Copyright (c) 2014-2016 Douglas Christopher Wilson
Copyright (c) 2021-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @gltf-transform/core (4.5.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `2fc4be506118926705a1a6390079cfeb91f7d785af1755b3d7913dec52540c3d`
- **Notice**: [`third-party/licenses/npm/@gltf-transform/core/4.5.1/LICENSE.txt`](third-party/licenses/npm/@gltf-transform/core/4.5.1/LICENSE.txt) · SHA-256 `2c4f111d00dbf22b10d31a14813c5f5de6a828640f7311f26b9dda89b3fce165`

````text
The MIT License (MIT)

Copyright (c) 2024 Don McCurdy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @gltf-transform/extensions (4.5.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `5ae8a23186a50b7af3d2dbaae985b5ebd3e36a4a260dcf6b18296f24313e67e9`
- **Notice**: [`third-party/licenses/npm/@gltf-transform/extensions/4.5.1/LICENSE.txt`](third-party/licenses/npm/@gltf-transform/extensions/4.5.1/LICENSE.txt) · SHA-256 `2c4f111d00dbf22b10d31a14813c5f5de6a828640f7311f26b9dda89b3fce165`

````text
The MIT License (MIT)

Copyright (c) 2024 Don McCurdy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @loaders.gl/3d-tiles (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `805da6e818a344dd954827584fb482e3968842141cbb1b8151b53164189026a0`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/3d-tiles/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/3d-tiles/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/3d-tiles/node_modules/long (5.3.2)
- **Declared License**: `Apache-2.0`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `68033e466773df7d52c9e59341bb729d83716cd920c56460395724456d646b26`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/3d-tiles/node_modules/long/5.3.2/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/3d-tiles/node_modules/long/5.3.2/LICENSE.txt) · SHA-256 `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`

````text
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
````

#### @loaders.gl/compression (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `a4f50228629027f97beb8586f70b89802fcdca27e5cf4836591ca8bde5333654`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/compression/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/compression/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/core (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `dfd8ca41a7fa27681c5bf081485b4e5a888f3458d99bef480d6caeaf24fc6f28`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/core/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/core/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/crypto (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `87383373501c0a4ba9108d46431d2a57e0482126afda2f392d1ae9f39df5f577`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/crypto/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/crypto/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/draco (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `a63cff7027b755cc649cb7936cc96a5c63d8b2c7965289a9bc2175a781ad66d8`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/draco/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/draco/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/geoarrow (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `b2ac2706baa2e0c8f0bcbd9a0754df40ec5b8eb0b07788243452016ea8e27e06`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/geoarrow/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/geoarrow/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/gis (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `1cdd42f9531fa6672eedda1e1aec3d4228266abd7a9244c9ac2be9334e2aaaf8`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/gis/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/gis/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/gis/node_modules/@mapbox/vector-tile (1.3.1)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `c302d0529df2189e82edf0e1ef50be6786dd3af6cc19e2873e80d74325416bac`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/gis/node_modules/@mapbox/vector-tile/1.3.1/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/gis/node_modules/@mapbox/vector-tile/1.3.1/LICENSE.txt) · SHA-256 `de11b2b7d4af85d160347e7cbe734b5bc7b5beb5584281506bc1a5bc84b3aa3e`

````text
Copyright (c) 2014, Mapbox


All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    * Neither the name of Mapbox nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### @loaders.gl/gis/node_modules/pbf (3.3.0)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d77164e7d8d3bbcf3054b0ced2dd7ae9fb808a6469c44404b83a27bf275f2c10`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/gis/node_modules/pbf/3.3.0/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/gis/node_modules/pbf/3.3.0/LICENSE.txt) · SHA-256 `5d081d1d4848771dfef5e445660f918aedefd6ae9bb02058a1f7db9cee6c0902`

````text
Copyright (c) 2017, Mapbox
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of pbf nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### @loaders.gl/gltf (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `1f53c3fb8c0eff60cfc39ae4ce4f823c8f7d193d9a73c4cab8aa02da3bbf429b`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/gltf/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/gltf/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/images (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `07c034d5a3faf590348a4e62a8d6c575bb8669408a9bd7cea6de324bb0eee20b`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/images/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/images/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/loader-utils (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d41ded6863fe0d8db06341991192c775de843ad1ee35c63ebd3f11e8949b6e3f`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/loader-utils/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/loader-utils/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/math (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `a288648a14c04513d3bcdd383fbd3ccc5d2e8b823e7d7e7759618d423b45ff15`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/math/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/math/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/mvt (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `7d3ade60d6d942de5dc8c697db874dd8951dc38ef813131e09b8c6312a7d8e13`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/mvt/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/mvt/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/mvt/4.5.4/LICENSE-2.txt`](third-party/licenses/npm/@loaders.gl/mvt/4.5.4/LICENSE-2.txt) · SHA-256 `193b26b35d0732393d5862b9ba7982c7e92b126145aaf1592b48112d32319c73`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/mvt/4.5.4/LICENSE-3.txt`](third-party/licenses/npm/@loaders.gl/mvt/4.5.4/LICENSE-3.txt) · SHA-256 `ae703a54ad23db8a7351c272337cc1e44f7e87802a9ca8502b23391aa8f5ac7b`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

````text
This code is forked from https://github.com/mapbox/vector-tile-js under BSD 3-clause license.

---

Copyright (c) 2014, Mapbox

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    * Neither the name of Mapbox nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

````text
This directory is forked from Mapbox's https://github.com/mapbox/geojson-vt under ISC License.

```
ISC License

Copyright (c) 2015, Mapbox

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```
````

#### @loaders.gl/mvt/node_modules/pbf (3.3.0)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d77164e7d8d3bbcf3054b0ced2dd7ae9fb808a6469c44404b83a27bf275f2c10`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/mvt/node_modules/pbf/3.3.0/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/mvt/node_modules/pbf/3.3.0/LICENSE.txt) · SHA-256 `5d081d1d4848771dfef5e445660f918aedefd6ae9bb02058a1f7db9cee6c0902`

````text
Copyright (c) 2017, Mapbox
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of pbf nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### @loaders.gl/schema (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `ec5f06c31d8fb1c7fe290290a9aad722731cfe256e7eeb5dd4a839201acd3674`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/schema/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/schema/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/schema-utils (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `543fa0759b52e0fb8002d194f2026ca8755d32dac51376a9cae9824ee8b2ec28`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/schema-utils/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/schema-utils/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/terrain (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `992c79a03109a10bd57e522f42055e217791e836f25228ef49c58e6cc9755683`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/terrain/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/terrain/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/textures (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `334ad5d583462384358e7714beeaa6cc0bab79ee7cff669a1ba1222e9c0ccc2e`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/textures/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/textures/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/textures/node_modules/ktx-parse (0.7.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9c189a0c97a63edc39e8e37613e7916bc8cbde315c6ea9e06ef7d31168236ed7`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/textures/node_modules/ktx-parse/0.7.1/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/textures/node_modules/ktx-parse/0.7.1/LICENSE.txt) · SHA-256 `79847431f9ecef9cf399085cb863452e71a6dab99738f4f0c1ea06c6484b5692`

````text
The MIT License (MIT)

Copyright (c) 2020 Don McCurdy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @loaders.gl/tiles (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `3ce9308a68eed7dccb1f304d746cf5bee9d3ca009a7bf7fc9dfff2ec93f2420c`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/tiles/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/tiles/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/wms (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `10d6a1f831bb3a71a34a73827f22a7a8030a8ac3f00247495a5ad11049b7cb91`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/wms/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/wms/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/worker-utils (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `7b86460613bd4f07b5050d6329b68a036d4dd66b5f86fb697b73bb39e2d82f7a`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/worker-utils/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/worker-utils/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/xml (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `945e8cc1704a17f58a4158cc01e26ecb00310b6861b17c1ff152d25bf2466f6c`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/xml/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/xml/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @loaders.gl/zip (4.5.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `b142192b8e46c541948709f821911d955f402d637dea624814a1c0047b52cdf9`
- **Notice**: [`third-party/licenses/npm/@loaders.gl/zip/4.5.4/LICENSE.txt`](third-party/licenses/npm/@loaders.gl/zip/4.5.4/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @luma.gl/core (9.4.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `77b9fb231888974d1e0320e4fd831ec12b8d631f85fbbbf1f7975a11ed411668`
- **Notice**: [`third-party/licenses/npm/@luma.gl/core/9.4.2/LICENSE.txt`](third-party/licenses/npm/@luma.gl/core/9.4.2/LICENSE.txt) · SHA-256 `798eb174985988b167e86a01ba86142c902a4d1dd85cb310289b04877be60db3`

````text
luma.gl is provided under the MIT license

Copyright (c) 2020 vis.gl contributors

This software includes parts initially developed by Uber and open sourced under MIT license.
Copyright (c) 2015 Uber Technologies, Inc.

This software includes parts of PhiloGL (https://github.com/philogb/philogl)
under MIT license. PhiloGL parts Copyright © 2013 Sencha Labs.

This software includes adaptations of some postprocessing code from 
THREE.js (https://github.com/mrdoob/three.js/) under MIT license. 
THREE.js parts Copyright © 2010-2018 three.js authors. 

This software includes adaptations of Gaussian-splat rendering and
level-of-detail behavior from Spark (https://github.com/sparkjsdev/spark)
under MIT license.
Spark parts Copyright © 2025 WORLD LABS TECHNOLOGIES, INC.

Additional attribution given in specific source files. 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @luma.gl/engine (9.4.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9d09e7276f84818a3cee12c571cda62b86f5ea54fb4977c42bf670d2d3365392`
- **Notice**: [`third-party/licenses/npm/@luma.gl/engine/9.4.2/LICENSE.txt`](third-party/licenses/npm/@luma.gl/engine/9.4.2/LICENSE.txt) · SHA-256 `798eb174985988b167e86a01ba86142c902a4d1dd85cb310289b04877be60db3`

````text
luma.gl is provided under the MIT license

Copyright (c) 2020 vis.gl contributors

This software includes parts initially developed by Uber and open sourced under MIT license.
Copyright (c) 2015 Uber Technologies, Inc.

This software includes parts of PhiloGL (https://github.com/philogb/philogl)
under MIT license. PhiloGL parts Copyright © 2013 Sencha Labs.

This software includes adaptations of some postprocessing code from 
THREE.js (https://github.com/mrdoob/three.js/) under MIT license. 
THREE.js parts Copyright © 2010-2018 three.js authors. 

This software includes adaptations of Gaussian-splat rendering and
level-of-detail behavior from Spark (https://github.com/sparkjsdev/spark)
under MIT license.
Spark parts Copyright © 2025 WORLD LABS TECHNOLOGIES, INC.

Additional attribution given in specific source files. 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @luma.gl/gltf (9.4.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `cd953a20d7d1d0625eb0c5d2f161770ac55afd783ec914c53e59134d79fcc71c`
- **Notice**: [`third-party/licenses/npm/@luma.gl/gltf/9.4.2/LICENSE.txt`](third-party/licenses/npm/@luma.gl/gltf/9.4.2/LICENSE.txt) · SHA-256 `798eb174985988b167e86a01ba86142c902a4d1dd85cb310289b04877be60db3`

````text
luma.gl is provided under the MIT license

Copyright (c) 2020 vis.gl contributors

This software includes parts initially developed by Uber and open sourced under MIT license.
Copyright (c) 2015 Uber Technologies, Inc.

This software includes parts of PhiloGL (https://github.com/philogb/philogl)
under MIT license. PhiloGL parts Copyright © 2013 Sencha Labs.

This software includes adaptations of some postprocessing code from 
THREE.js (https://github.com/mrdoob/three.js/) under MIT license. 
THREE.js parts Copyright © 2010-2018 three.js authors. 

This software includes adaptations of Gaussian-splat rendering and
level-of-detail behavior from Spark (https://github.com/sparkjsdev/spark)
under MIT license.
Spark parts Copyright © 2025 WORLD LABS TECHNOLOGIES, INC.

Additional attribution given in specific source files. 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @luma.gl/gltf/node_modules/@loaders.gl/core (4.4.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `3570c7d4295cd101605392e24faeb1fc36d9137aae612758cec4c2060feba6bb`
- **Notice**: [`third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/core/4.4.5/LICENSE.txt`](third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/core/4.4.5/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @luma.gl/gltf/node_modules/@loaders.gl/draco (4.4.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `382d851eae588f911e77a1729396d3086638f28799a93abe326d45f1e2844bae`
- **Notice**: [`third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/draco/4.4.5/LICENSE.txt`](third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/draco/4.4.5/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @luma.gl/gltf/node_modules/@loaders.gl/gltf (4.4.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `b46e615f7f3b7ec83c735f67e6e12318d44830c33ae7118ac98776115b8b1156`
- **Notice**: [`third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/gltf/4.4.5/LICENSE.txt`](third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/gltf/4.4.5/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @luma.gl/gltf/node_modules/@loaders.gl/images (4.4.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `e5098d72054b35083652c4f2aa4d6f0a0fb94330bb8626e5ebdb2166cbec2e88`
- **Notice**: [`third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/images/4.4.5/LICENSE.txt`](third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/images/4.4.5/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @luma.gl/gltf/node_modules/@loaders.gl/loader-utils (4.4.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `10098f780b876bae85c5e0495de3d89a884b449d839af1e605a7adfbc35b230c`
- **Notice**: [`third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/loader-utils/4.4.5/LICENSE.txt`](third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/loader-utils/4.4.5/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @luma.gl/gltf/node_modules/@loaders.gl/schema (4.4.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `7cbc3695adefdfa36f03bc28a1c2de51b9ddf3d66c8890e57623b95b59a3c412`
- **Notice**: [`third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/schema/4.4.5/LICENSE.txt`](third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/schema/4.4.5/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @luma.gl/gltf/node_modules/@loaders.gl/schema-utils (4.4.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `b5e85034beb344322247b5640de5e18836a61a3c1ea54a6d78b1e5a672536b0a`
- **Notice**: [`third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/schema-utils/4.4.5/LICENSE.txt`](third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/schema-utils/4.4.5/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @luma.gl/gltf/node_modules/@loaders.gl/textures (4.4.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9c28678e57d255a5f5e2e6f47402ad70f6257d19c331c19c1dd80d95690a4855`
- **Notice**: [`third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/textures/4.4.5/LICENSE.txt`](third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/textures/4.4.5/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @luma.gl/gltf/node_modules/@loaders.gl/worker-utils (4.4.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `1f9c400dd6c2afd6f31ffe6db79bc6f4e9715ac63c01490720d8359d95be5f0d`
- **Notice**: [`third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/worker-utils/4.4.5/LICENSE.txt`](third-party/licenses/npm/@luma.gl/gltf/node_modules/@loaders.gl/worker-utils/4.4.5/LICENSE.txt) · SHA-256 `092a0a3ad1bc93e3667f666257cadb82b9a2acac483d6c798df3aed156c876e3`

````text
loaders.gl is licensed under the MIT license

Copyright (c) vis.gl contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--- 

Copyright (c) 2015 Uber Technologies, Inc.

loaders.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) 
under the  Apache 2 License (found in the submodule: modules/3d-tiles):)

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
````

#### @luma.gl/gltf/node_modules/ktx-parse (0.7.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9c189a0c97a63edc39e8e37613e7916bc8cbde315c6ea9e06ef7d31168236ed7`
- **Notice**: [`third-party/licenses/npm/@luma.gl/gltf/node_modules/ktx-parse/0.7.1/LICENSE.txt`](third-party/licenses/npm/@luma.gl/gltf/node_modules/ktx-parse/0.7.1/LICENSE.txt) · SHA-256 `79847431f9ecef9cf399085cb863452e71a6dab99738f4f0c1ea06c6484b5692`

````text
The MIT License (MIT)

Copyright (c) 2020 Don McCurdy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @luma.gl/gpgpu (9.4.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `6e6a6969d092125a30ee9eb923867641a89c28cfeeb5914bca77f9d579a14769`
- **Notice**: [`third-party/licenses/npm/@luma.gl/gpgpu/9.4.2/LICENSE.txt`](third-party/licenses/npm/@luma.gl/gpgpu/9.4.2/LICENSE.txt) · SHA-256 `798eb174985988b167e86a01ba86142c902a4d1dd85cb310289b04877be60db3`

````text
luma.gl is provided under the MIT license

Copyright (c) 2020 vis.gl contributors

This software includes parts initially developed by Uber and open sourced under MIT license.
Copyright (c) 2015 Uber Technologies, Inc.

This software includes parts of PhiloGL (https://github.com/philogb/philogl)
under MIT license. PhiloGL parts Copyright © 2013 Sencha Labs.

This software includes adaptations of some postprocessing code from 
THREE.js (https://github.com/mrdoob/three.js/) under MIT license. 
THREE.js parts Copyright © 2010-2018 three.js authors. 

This software includes adaptations of Gaussian-splat rendering and
level-of-detail behavior from Spark (https://github.com/sparkjsdev/spark)
under MIT license.
Spark parts Copyright © 2025 WORLD LABS TECHNOLOGIES, INC.

Additional attribution given in specific source files. 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @luma.gl/shadertools (9.4.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `78837a55f4e08568f1b10f36896e24b2392e3765967d2b5c95ab259301dd5dc8`
- **Notice**: [`third-party/licenses/npm/@luma.gl/shadertools/9.4.2/LICENSE.txt`](third-party/licenses/npm/@luma.gl/shadertools/9.4.2/LICENSE.txt) · SHA-256 `798eb174985988b167e86a01ba86142c902a4d1dd85cb310289b04877be60db3`

````text
luma.gl is provided under the MIT license

Copyright (c) 2020 vis.gl contributors

This software includes parts initially developed by Uber and open sourced under MIT license.
Copyright (c) 2015 Uber Technologies, Inc.

This software includes parts of PhiloGL (https://github.com/philogb/philogl)
under MIT license. PhiloGL parts Copyright © 2013 Sencha Labs.

This software includes adaptations of some postprocessing code from 
THREE.js (https://github.com/mrdoob/three.js/) under MIT license. 
THREE.js parts Copyright © 2010-2018 three.js authors. 

This software includes adaptations of Gaussian-splat rendering and
level-of-detail behavior from Spark (https://github.com/sparkjsdev/spark)
under MIT license.
Spark parts Copyright © 2025 WORLD LABS TECHNOLOGIES, INC.

Additional attribution given in specific source files. 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @luma.gl/webgl (9.4.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `bd891e2e5768de9adeb0c9306848b6009efb8b78f31bdb1897f52129203b6427`
- **Notice**: [`third-party/licenses/npm/@luma.gl/webgl/9.4.2/LICENSE.txt`](third-party/licenses/npm/@luma.gl/webgl/9.4.2/LICENSE.txt) · SHA-256 `798eb174985988b167e86a01ba86142c902a4d1dd85cb310289b04877be60db3`

````text
luma.gl is provided under the MIT license

Copyright (c) 2020 vis.gl contributors

This software includes parts initially developed by Uber and open sourced under MIT license.
Copyright (c) 2015 Uber Technologies, Inc.

This software includes parts of PhiloGL (https://github.com/philogb/philogl)
under MIT license. PhiloGL parts Copyright © 2013 Sencha Labs.

This software includes adaptations of some postprocessing code from 
THREE.js (https://github.com/mrdoob/three.js/) under MIT license. 
THREE.js parts Copyright © 2010-2018 three.js authors. 

This software includes adaptations of Gaussian-splat rendering and
level-of-detail behavior from Spark (https://github.com/sparkjsdev/spark)
under MIT license.
Spark parts Copyright © 2025 WORLD LABS TECHNOLOGIES, INC.

Additional attribution given in specific source files. 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @luma.gl/webgpu (9.4.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `025b284117d472c6aa9bb78a0cff7286578b75cb22a5a5e0649116c158ae2fd9`
- **Notice**: [`third-party/licenses/npm/@luma.gl/webgpu/9.4.2/LICENSE.txt`](third-party/licenses/npm/@luma.gl/webgpu/9.4.2/LICENSE.txt) · SHA-256 `798eb174985988b167e86a01ba86142c902a4d1dd85cb310289b04877be60db3`

````text
luma.gl is provided under the MIT license

Copyright (c) 2020 vis.gl contributors

This software includes parts initially developed by Uber and open sourced under MIT license.
Copyright (c) 2015 Uber Technologies, Inc.

This software includes parts of PhiloGL (https://github.com/philogb/philogl)
under MIT license. PhiloGL parts Copyright © 2013 Sencha Labs.

This software includes adaptations of some postprocessing code from 
THREE.js (https://github.com/mrdoob/three.js/) under MIT license. 
THREE.js parts Copyright © 2010-2018 three.js authors. 

This software includes adaptations of Gaussian-splat rendering and
level-of-detail behavior from Spark (https://github.com/sparkjsdev/spark)
under MIT license.
Spark parts Copyright © 2025 WORLD LABS TECHNOLOGIES, INC.

Additional attribution given in specific source files. 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @mapbox/jsonlint-lines-primitives (2.0.3)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `a6be7b423dafaf19ff46c6b3587d3ac8ce01d666087a84a79aac6052046593ec`
- **Notice**: [`third-party/licenses/npm/@mapbox/jsonlint-lines-primitives/2.0.3/LICENSE.txt`](third-party/licenses/npm/@mapbox/jsonlint-lines-primitives/2.0.3/LICENSE.txt) · SHA-256 `5dcae6b71018b5454d00228bd08ccbcd9801ee27b19959b88ebcb55602604e6d`

````text
MIT License

Copyright (c) 2012 Zachary Carter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @mapbox/martini (0.2.0)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `29363b9639103563fb3388b5f184fd5fb05efba2ef93226f01e56ac2b23ae600`
- **Notice**: [`third-party/licenses/npm/@mapbox/martini/0.2.0/LICENSE.txt`](third-party/licenses/npm/@mapbox/martini/0.2.0/LICENSE.txt) · SHA-256 `c6a01684eb9061a00589d483e9cf9ea5a82b3e8270f9992501ceb79f32753fb5`

````text
ISC License

Copyright (c) 2019, Mapbox

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
````

#### @mapbox/point-geometry (0.1.0)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `c41636a57118b2cb611dfbc87580388f179dbaa7ca5677f92c10c0fc38473755`
- **Notice**: [`third-party/licenses/npm/@mapbox/point-geometry/0.1.0/LICENSE.txt`](third-party/licenses/npm/@mapbox/point-geometry/0.1.0/LICENSE.txt) · SHA-256 `dd21817f71dfddadd36108266c1f19c89e2d1f24e4e27ee5b6c34743462d8310`

````text
Copyright (c) 2015, Mapbox <>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
````

#### @mapbox/tiny-sdf (2.3.0)
- **Declared License**: `BSD-2-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `df88dd624bb2c525b8449d5252cba6a7535c5b5ff7374e8423c64b6175e42ea2`
- **Notice**: [`third-party/licenses/npm/@mapbox/tiny-sdf/2.3.0/LICENSE.txt`](third-party/licenses/npm/@mapbox/tiny-sdf/2.3.0/LICENSE.txt) · SHA-256 `4f78063c6c0757df950aa3440cef9a2a6bd1c552c994c32237c3acc283e72ee6`

````text
BSD-2-Clause
Copyright (c) 2016-2024 Mapbox, Inc.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### @mapbox/unitbezier (1.0.0)
- **Declared License**: `BSD-2-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `040cdc8400a3949a2764db4a4c68e59758c8cbca94e5ccb9df58c28dd9ad1a76`
- **Notice**: [`third-party/licenses/npm/@mapbox/unitbezier/1.0.0/LICENSE.txt`](third-party/licenses/npm/@mapbox/unitbezier/1.0.0/LICENSE.txt) · SHA-256 `f0dc305ad097eddbc66eebb79288c92d8a5043818ace81206383a4c1a3268fe3`

````text
BSD-2-Clause

Copyright (C) 2008 Apple Inc. All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Ported from Webkit
http://svn.webkit.org/repository/webkit/trunk/Source/WebCore/platform/graphics/UnitBezier.h
````

#### @mapbox/vector-tile (3.0.0)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `08f01e39d143cad5b106a7561394663b0a020d6a068acac6fa74de465739edb6`
- **Notice**: [`third-party/licenses/npm/@mapbox/vector-tile/3.0.0/LICENSE.txt`](third-party/licenses/npm/@mapbox/vector-tile/3.0.0/LICENSE.txt) · SHA-256 `5b09a507df6f21d6c2112c46dcaf2927b9dbd8b580a08b542d8ec2f9191d783d`

````text
Copyright (c) 2024, Mapbox

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    * Neither the name of Mapbox nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### @mapbox/vector-tile/node_modules/@mapbox/point-geometry (1.1.0)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9bf202082ba414ef99d82ca466445bfeddff3631922cfa74f9b4ce5caafde038`
- **Notice**: [`third-party/licenses/npm/@mapbox/vector-tile/node_modules/@mapbox/point-geometry/1.1.0/LICENSE.txt`](third-party/licenses/npm/@mapbox/vector-tile/node_modules/@mapbox/point-geometry/1.1.0/LICENSE.txt) · SHA-256 `0c0ede0036a425ff8b2d49341ea9aa8eccbeeae1ac4eb59874c9dd8bcf5186d3`

````text
Copyright (c) 2024, Mapbox

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
````

#### @maplibre/geojson-vt (6.1.2)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `8e73fc58113aae0accb5624e4b9ffffb78768411f7c34c309c400a9560b4cb68`
- **Notice**: [`third-party/licenses/npm/@maplibre/geojson-vt/6.1.2/LICENSE.txt`](third-party/licenses/npm/@maplibre/geojson-vt/6.1.2/LICENSE.txt) · SHA-256 `9eb90e1c920aeccc6d630bd48c1512683d454c669701d46ff8c4c41f922dc4f3`

````text
The MIT License (MIT)

Copyright (c) 2025 MapLibre contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

--------------------------------------------------------------------------------

ISC License

Copyright (c) 2024, Mapbox

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
````

#### @maplibre/maplibre-gl-style-spec (26.4.4)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `a91a2c7553837daaef41893f9ffe8d3feac046ae68b9340cc626715e7eada7ac`
- **Notice**: [`third-party/licenses/npm/@maplibre/maplibre-gl-style-spec/26.4.4/LICENSE.txt`](third-party/licenses/npm/@maplibre/maplibre-gl-style-spec/26.4.4/LICENSE.txt) · SHA-256 `bfd4cb919eec574e9213e1e61f880831eb5fc372d467be429fd0a8d51d1df890`

````text
Copyright (c) 2020, MapLibre contributors

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    * Neither the name of MapLibre GL JS nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


-------------------------------------------------------------------------------

Contains code from mapbox-gl-js v1.13 and earlier

Version v1.13 of mapbox-gl-js and earlier are licensed under a BSD-3-Clause license

Copyright (c) 2020, Mapbox
Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.
* Neither the name of Mapbox GL JS nor the names of its contributors
  may be used to endorse or promote products derived from this software
  without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


-------------------------------------------------------------------------------

Contains code from glfx.js

Copyright (C) 2011 by Evan Wallace

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--------------------------------------------------------------------------------

Contains a portion of d3-color https://github.com/d3/d3-color

Copyright 2010-2016 Mike Bostock
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the author nor the names of contributors may be used to
  endorse or promote products derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### @maplibre/mlt (1.3.0)
- **Declared License**: `(MIT OR Apache-2.0)`
- **Scope**: `runtime`
- **Election**: **MIT** (upstream: `MIT OR Apache-2.0`)
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `31e1081edc4491a39c6e4f7ac715fe424aac31ec20d326a414b1cc1eb989af3e`
- **Notice**: [`third-party/licenses/npm/@maplibre/mlt/1.3.0/LICENSE.txt`](third-party/licenses/npm/@maplibre/mlt/1.3.0/LICENSE.txt) · SHA-256 `3c0a2cc8dfe44b856c2577b4d6fe30a999557c795686d52b159a6e1659ea8023`

````text
===== MIT License =====
MIT License

Copyright (c) 2024 MapLibre contributors

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

===== Apache License 2.0 =====
                              Apache License
                        Version 2.0, January 2004
                     http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

   "License" shall mean the terms and conditions for use, reproduction,
   and distribution as defined by Sections 1 through 9 of this document.

   "Licensor" shall mean the copyright owner or entity authorized by
   the copyright owner that is granting the License.

   "Legal Entity" shall mean the union of the acting entity and all
   other entities that control, are controlled by, or are under common
   control with that entity. For the purposes of this definition,
   "control" means (i) the power, direct or indirect, to cause the
   direction or management of such entity, whether by contract or
   otherwise, or (ii) ownership of fifty percent (50%) or more of the
   outstanding shares, or (iii) beneficial ownership of such entity.

   "You" (or "Your") shall mean an individual or Legal Entity
   exercising permissions granted by this License.

   "Source" form shall mean the preferred form for making modifications,
   including but not limited to software source code, documentation
   source, and configuration files.

   "Object" form shall mean any form resulting from mechanical
   transformation or translation of a Source form, including but
   not limited to compiled object code, generated documentation,
   and conversions to other media types.

   "Work" shall mean the work of authorship, whether in Source or
   Object form, made available under the License, as indicated by a
   copyright notice that is included in or attached to the work
   (an example is provided in the Appendix below).

   "Derivative Works" shall mean any work, whether in Source or Object
   form, that is based on (or derived from) the Work and for which the
   editorial revisions, annotations, elaborations, or other modifications
   represent, as a whole, an original work of authorship. For the purposes
   of this License, Derivative Works shall not include works that remain
   separable from, or merely link (or bind by name) to the interfaces of,
   the Work and Derivative Works thereof.

   "Contribution" shall mean any work of authorship, including
   the original version of the Work and any modifications or additions
   to that Work or Derivative Works thereof, that is intentionally
   submitted to Licensor for inclusion in the Work by the copyright owner
   or by an individual or Legal Entity authorized to submit on behalf of
   the copyright owner. For the purposes of this definition, "submitted"
   means any form of electronic, verbal, or written communication sent
   to the Licensor or its representatives, including but not limited to
   communication on electronic mailing lists, source code control systems,
   and issue tracking systems that are managed by, or on behalf of, the
   Licensor for the purpose of discussing and improving the Work, but
   excluding communication that is conspicuously marked or otherwise
   designated in writing by the copyright owner as "Not a Contribution."

   "Contributor" shall mean Licensor and any individual or Legal Entity
   on behalf of whom a Contribution has been received by Licensor and
   subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   copyright license to reproduce, prepare Derivative Works of,
   publicly display, publicly perform, sublicense, and distribute the
   Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of
   this License, each Contributor hereby grants to You a perpetual,
   worldwide, non-exclusive, no-charge, royalty-free, irrevocable
   (except as stated in this section) patent license to make, have made,
   use, offer to sell, sell, import, and otherwise transfer the Work,
   where such license applies only to those patent claims licensable
   by such Contributor that are necessarily infringed by their
   Contribution(s) alone or by combination of their Contribution(s)
   with the Work to which such Contribution(s) was submitted. If You
   institute patent litigation against any entity (including a
   cross-claim or counterclaim in a lawsuit) alleging that the Work
   or a Contribution incorporated within the Work constitutes direct
   or contributory patent infringement, then any patent licenses
   granted to You under this License for that Work shall terminate
   as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the
   Work or Derivative Works thereof in any medium, with or without
   modifications, and in Source or Object form, provided that You
   meet the following conditions:

   (a) You must give any other recipients of the Work or
       Derivative Works a copy of this License; and

   (b) You must cause any modified files to carry prominent notices
       stating that You changed the files; and

   (c) You must retain, in the Source form of any Derivative Works
       that You distribute, all copyright, patent, trademark, and
       attribution notices from the Source form of the Work,
       excluding those notices that do not pertain to any part of
       the Derivative Works; and

   (d) If the Work includes a "NOTICE" text file as part of its
       distribution, then any Derivative Works that You distribute must
       include a readable copy of the attribution notices contained
       within such NOTICE file, excluding those notices that do not
       pertain to any part of the Derivative Works, in at least one
       of the following places: within a NOTICE text file distributed
       as part of the Derivative Works; within the Source form or
       documentation, if provided along with the Derivative Works; or,
       within a display generated by the Derivative Works, if and
       wherever such third-party notices normally appear. The contents
       of the NOTICE file are for informational purposes only and
       do not modify the License. You may add Your own attribution
       notices within Derivative Works that You distribute, alongside
       or as an addendum to the NOTICE text from the Work, provided
       that such additional attribution notices cannot be construed
       as modifying the License.

   You may add Your own copyright statement to Your modifications and
   may provide additional or different license terms and conditions
   for use, reproduction, or distribution of Your modifications, or
   for any such Derivative Works as a whole, provided Your use,
   reproduction, and distribution of the Work otherwise complies with
   the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise,
   any Contribution intentionally submitted for inclusion in the Work
   by You to the Licensor shall be under the terms and conditions of
   this License, without any additional terms or conditions.
   Notwithstanding the above, nothing herein shall supersede or modify
   the terms of any separate license agreement you may have executed
   with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade
   names, trademarks, service marks, or product names of the Licensor,
   except as required for reasonable and customary use in describing the
   origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or
   agreed to in writing, Licensor provides the Work (and each
   Contributor provides its Contributions) on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
   implied, including, without limitation, any warranties or conditions
   of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
   PARTICULAR PURPOSE. You are solely responsible for determining the
   appropriateness of using or redistributing the Work and assume any
   risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory,
   whether in tort (including negligence), contract, or otherwise,
   unless required by applicable law (such as deliberate and grossly
   negligent acts) or agreed to in writing, shall any Contributor be
   liable to You for damages, including any direct, indirect, special,
   incidental, or consequential damages of any character arising as a
   result of this License or out of the use or inability to use the
   Work (including but not limited to damages for loss of goodwill,
   work stoppage, computer failure or malfunction, or any and all
   other commercial damages or losses), even if such Contributor
   has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing
   the Work or Derivative Works thereof, You may choose to offer,
   and charge a fee for, acceptance of support, warranty, indemnity,
   or other liability obligations and/or rights consistent with this
   License. However, in accepting such obligations, You may act only
   on Your own behalf and on Your sole responsibility, not on behalf
   of any other Contributor, and only if You agree to indemnify,
   defend, and hold each Contributor harmless for any liability
   incurred by, or claims asserted against, such Contributor by reason
   of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS

APPENDIX: How to apply the Apache License to your work.

   To apply the Apache License to your work, attach the following
   boilerplate notice, with the fields enclosed by brackets "[]"
   replaced with your own identifying information. (Don't include
   the brackets!)  The text should be enclosed in the appropriate
   comment syntax for the file format. We also recommend that a
   file or class name and description of purpose be included on the
   same "printed page" as the copyright notice for easier
   identification within third-party archives.

Copyright 2024 MapLibre contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
````

#### @maplibre/mlt/node_modules/@mapbox/point-geometry (1.1.0)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9bf202082ba414ef99d82ca466445bfeddff3631922cfa74f9b4ce5caafde038`
- **Notice**: [`third-party/licenses/npm/@maplibre/mlt/node_modules/@mapbox/point-geometry/1.1.0/LICENSE.txt`](third-party/licenses/npm/@maplibre/mlt/node_modules/@mapbox/point-geometry/1.1.0/LICENSE.txt) · SHA-256 `0c0ede0036a425ff8b2d49341ea9aa8eccbeeae1ac4eb59874c9dd8bcf5186d3`

````text
Copyright (c) 2024, Mapbox

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
````

#### @maplibre/vt-pbf (4.3.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `837fe7a668cd0280af6a38b8e9ed81e299dd51f4571d4eb9f6f9de859e9f13f7`
- **Notice**: [`third-party/licenses/npm/@maplibre/vt-pbf/4.3.2/LICENSE.txt`](third-party/licenses/npm/@maplibre/vt-pbf/4.3.2/LICENSE.txt) · SHA-256 `4c61c5753d4b021bc3b07f21d2a830506974ce200c19cfadf3d4a25e747fc853`

````text
The MIT License (MIT)

Copyright (c) 2025 MapLibre contributors

Copyright (c) 2015 Anand Thakker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

--------------------------------------------------------------------------------

Contains geojson_wrapper.js from https://github.com/mapbox/mapbox-gl-js

Copyright (c) 2014, Mapbox

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    * Neither the name of Mapbox GL JS nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### @maplibre/vt-pbf/node_modules/@mapbox/point-geometry (1.1.0)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9bf202082ba414ef99d82ca466445bfeddff3631922cfa74f9b4ce5caafde038`
- **Notice**: [`third-party/licenses/npm/@maplibre/vt-pbf/node_modules/@mapbox/point-geometry/1.1.0/LICENSE.txt`](third-party/licenses/npm/@maplibre/vt-pbf/node_modules/@mapbox/point-geometry/1.1.0/LICENSE.txt) · SHA-256 `0c0ede0036a425ff8b2d49341ea9aa8eccbeeae1ac4eb59874c9dd8bcf5186d3`

````text
Copyright (c) 2024, Mapbox

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
````

#### @math.gl/core (4.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `219fc7192718521ebdf9b5c591112e1a6175aeeda4ad7881e761203c79f3ffd9`
- **Notice**: [`third-party/licenses/npm/@math.gl/core/4.1.0/LICENSE.txt`](third-party/licenses/npm/@math.gl/core/4.1.0/LICENSE.txt) · SHA-256 `0a713c4944b0e1d3104ba648cc9757f592f521144e537689a65574fc28d1b94a`

````text
MIT License

Copyright (c) 2017 Uber Technologies, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl builds on docs and code from "gl-matrix", which is MIT licensed as follows:

Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--

math.gl builds on docs and code from THREE.js, which is MIT licensed as follows:

The MIT License

Copyright © 2010-2017 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) under the Apache 2 License:

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

Cesium-derived code can be found in the submodule: modules/3d-tiles
````

#### @math.gl/culling (4.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `407f704cf93a1fdc99d798681bb3f13a66b75a508c911f077c6df89ef3408708`
- **Notice**: [`third-party/licenses/npm/@math.gl/culling/4.1.0/LICENSE.txt`](third-party/licenses/npm/@math.gl/culling/4.1.0/LICENSE.txt) · SHA-256 `0a713c4944b0e1d3104ba648cc9757f592f521144e537689a65574fc28d1b94a`

````text
MIT License

Copyright (c) 2017 Uber Technologies, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl builds on docs and code from "gl-matrix", which is MIT licensed as follows:

Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--

math.gl builds on docs and code from THREE.js, which is MIT licensed as follows:

The MIT License

Copyright © 2010-2017 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) under the Apache 2 License:

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

Cesium-derived code can be found in the submodule: modules/3d-tiles
````

#### @math.gl/geospatial (4.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `c4e2449e0a881c6a126808d823cff5c985b3aadc9254c286174aa4ba2d5daf46`
- **Notice**: [`third-party/licenses/npm/@math.gl/geospatial/4.1.0/LICENSE.txt`](third-party/licenses/npm/@math.gl/geospatial/4.1.0/LICENSE.txt) · SHA-256 `0a713c4944b0e1d3104ba648cc9757f592f521144e537689a65574fc28d1b94a`

````text
MIT License

Copyright (c) 2017 Uber Technologies, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl builds on docs and code from "gl-matrix", which is MIT licensed as follows:

Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--

math.gl builds on docs and code from THREE.js, which is MIT licensed as follows:

The MIT License

Copyright © 2010-2017 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) under the Apache 2 License:

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

Cesium-derived code can be found in the submodule: modules/3d-tiles
````

#### @math.gl/polygon (4.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9c1d282dd695ae28e59e15ae3ddb2aa7b47c916938f1b2ab913e342cda539167`
- **Notice**: [`third-party/licenses/npm/@math.gl/polygon/4.1.0/LICENSE.txt`](third-party/licenses/npm/@math.gl/polygon/4.1.0/LICENSE.txt) · SHA-256 `0a713c4944b0e1d3104ba648cc9757f592f521144e537689a65574fc28d1b94a`

````text
MIT License

Copyright (c) 2017 Uber Technologies, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl builds on docs and code from "gl-matrix", which is MIT licensed as follows:

Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--

math.gl builds on docs and code from THREE.js, which is MIT licensed as follows:

The MIT License

Copyright © 2010-2017 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) under the Apache 2 License:

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

Cesium-derived code can be found in the submodule: modules/3d-tiles
````

#### @math.gl/sun (4.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `f6d2eb040bae69750eba04f40b64c81101f4245d24252b5cace56e63f3d624a4`
- **Notice**: [`third-party/licenses/npm/@math.gl/sun/4.1.0/LICENSE.txt`](third-party/licenses/npm/@math.gl/sun/4.1.0/LICENSE.txt) · SHA-256 `0a713c4944b0e1d3104ba648cc9757f592f521144e537689a65574fc28d1b94a`

````text
MIT License

Copyright (c) 2017 Uber Technologies, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl builds on docs and code from "gl-matrix", which is MIT licensed as follows:

Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--

math.gl builds on docs and code from THREE.js, which is MIT licensed as follows:

The MIT License

Copyright © 2010-2017 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) under the Apache 2 License:

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

Cesium-derived code can be found in the submodule: modules/3d-tiles
````

#### @math.gl/types (4.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `e62675f2f82581b41672a193816906f127731601ccdd23cb7cd054f2d0b2d957`
- **Notice**: [`third-party/licenses/npm/@math.gl/types/4.1.0/LICENSE.txt`](third-party/licenses/npm/@math.gl/types/4.1.0/LICENSE.txt) · SHA-256 `0a713c4944b0e1d3104ba648cc9757f592f521144e537689a65574fc28d1b94a`

````text
MIT License

Copyright (c) 2017 Uber Technologies, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl builds on docs and code from "gl-matrix", which is MIT licensed as follows:

Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--

math.gl builds on docs and code from THREE.js, which is MIT licensed as follows:

The MIT License

Copyright © 2010-2017 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) under the Apache 2 License:

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

Cesium-derived code can be found in the submodule: modules/3d-tiles
````

#### @math.gl/web-mercator (4.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `bc89d99ac773849fccf5504402f3e9b4a1325ee5e21eb45589b8e1a38d488461`
- **Notice**: [`third-party/licenses/npm/@math.gl/web-mercator/4.1.0/LICENSE.txt`](third-party/licenses/npm/@math.gl/web-mercator/4.1.0/LICENSE.txt) · SHA-256 `0a713c4944b0e1d3104ba648cc9757f592f521144e537689a65574fc28d1b94a`

````text
MIT License

Copyright (c) 2017 Uber Technologies, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl builds on docs and code from "gl-matrix", which is MIT licensed as follows:

Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--

math.gl builds on docs and code from THREE.js, which is MIT licensed as follows:

The MIT License

Copyright © 2010-2017 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---

math.gl includes certain files from Cesium (https://github.com/AnalyticalGraphicsInc/cesium) under the Apache 2 License:

Copyright 2011-2018 CesiumJS Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

Cesium-derived code can be found in the submodule: modules/3d-tiles
````

#### @nodable/entities (3.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `3b7cbfe696f570ada57df3eb6981f6c668737a2158ec88a53134f243f9f1db8e`
- **Notice**: [`third-party/licenses/npm/@nodable/entities/3.1.0/package.json`](third-party/licenses/npm/@nodable/entities/3.1.0/package.json) · SHA-256 `81fc13661f9431f9f72ae5a1723482a1bcb473af463b93ca0b27c42461a6c6c9`

````text
{
  "name": "@nodable/entities",
  "version": "3.1.0",
  "description": "Entity parser for XML, HTML, External entites with security and NCR control",
  "main": "./src/index.js",
  "type": "module",
  "sideEffects": false,
  "types": "./src/index.d.ts",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/.bin/jest",
    "test:watch": "node --experimental-vm-modules node_modules/.bin/jest --watch",
    "test:coverage": "node --experimental-vm-modules node_modules/.bin/jest --coverage",
    "lint": "eslint src/ test/"
  },
  "files": [
    "src",
    "README.md"
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/nodable/val-parsers.git"
  },
  "keywords": [
    "fast",
    "xml",
    "html",
    "entity",
    "entities",
    "stringify",
    "encode",
    "decode",
    "ncr",
    "security",
    "safe",
    "performance"
  ],
  "author": "Amit Gupta (https://solothought.com)",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  },
  "funding": [
    {
      "type": "github",
      "url": "https://github.com/sponsors/nodable"
    }
  ],
  "jest": {
    "testMatch": [
      "**/?(*.)+(spec|test).[jt]s?(x)",
      "**/*_spec.[jt]s?(x)"
    ]
  }
}
````

#### @petamoriken/float16 (3.9.3)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `350ec2b8bc20dbb5f09f6a39eb58e2137803dd57b7e013dbbd7a4f36b71a9c7d`
- **Notice**: [`third-party/licenses/npm/@petamoriken/float16/3.9.3/LICENSE.txt`](third-party/licenses/npm/@petamoriken/float16/3.9.3/LICENSE.txt) · SHA-256 `3b833441ea7e5766f591a927e9f26960be46670a8fbc302732b72afd5623c0e9`

````text
MIT License

Copyright (c) 2017-2025 Kenta Moriuchi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @pinojs/redact (0.4.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d66004def64efb6c13629b0740639344e0775fe537373674571711a2bb2fc704`
- **Notice**: [`third-party/licenses/npm/@pinojs/redact/0.4.0/LICENSE.txt`](third-party/licenses/npm/@pinojs/redact/0.4.0/LICENSE.txt) · SHA-256 `58d4023bfbed5fb530c5bb8d44641299eac62c850267415ec939cc42dea87e4f`

````text
MIT License

Copyright (c) 2025 pinojs contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### @probe.gl/env (4.1.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `fc607ddfcdab91d435d31f199da5a9a4f7e71a37ea2bc459cedfc0f181e3c654`
- **Notice**: [`third-party/licenses/npm/@probe.gl/env/4.1.2/LICENSE.txt`](third-party/licenses/npm/@probe.gl/env/4.1.2/LICENSE.txt) · SHA-256 `e499a2c2ba3b9faabe91fdfddf43e329439263264b7148e5548d0ec605cce9f2`

````text
Copyright Vis.gl contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @probe.gl/log (4.1.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `fc746f5cddbb0a5597a5c210d8f9af665e113b3668fd8a119497eb7e9b84df14`
- **Notice**: [`third-party/licenses/npm/@probe.gl/log/4.1.2/LICENSE.txt`](third-party/licenses/npm/@probe.gl/log/4.1.2/LICENSE.txt) · SHA-256 `e499a2c2ba3b9faabe91fdfddf43e329439263264b7148e5548d0ec605cce9f2`

````text
Copyright Vis.gl contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @probe.gl/stats (4.1.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `53450f2de4af18b5e101c6cf34a0b7c98ac7a0891b4fc96ecda3867ccb459926`
- **Notice**: [`third-party/licenses/npm/@probe.gl/stats/4.1.2/LICENSE.txt`](third-party/licenses/npm/@probe.gl/stats/4.1.2/LICENSE.txt) · SHA-256 `e499a2c2ba3b9faabe91fdfddf43e329439263264b7148e5548d0ec605cce9f2`

````text
Copyright Vis.gl contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### @turf/boolean-clockwise (5.1.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `6dd0b9e358c0e1cafd3611e222fa96035fa5e7ce5353d7eee2bbec12a8ca5667`
- **Notice**: [`third-party/licenses/npm/@turf/boolean-clockwise/5.1.5/LICENSE.txt`](third-party/licenses/npm/@turf/boolean-clockwise/5.1.5/LICENSE.txt) · SHA-256 `f9b32b82fd5a1d3a990526d86da97f42fb805d9f4d9f978125c4679b674fce44`

````text
The MIT License (MIT)

Copyright (c) 2017 TurfJS

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### @turf/clone (5.1.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `7c3db72a4475d03cebb779c275c9576279ffcd37b5bc6fc8a134fec82ab03d41`
- **Notice**: [`third-party/licenses/npm/@turf/clone/5.1.5/LICENSE.txt`](third-party/licenses/npm/@turf/clone/5.1.5/LICENSE.txt) · SHA-256 `f9b32b82fd5a1d3a990526d86da97f42fb805d9f4d9f978125c4679b674fce44`

````text
The MIT License (MIT)

Copyright (c) 2017 TurfJS

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### @turf/helpers (5.1.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `790c6ed9fe92a45d9fb9b8811aa66e1d2156f01361f53dd7c2ffb645e51905a1`
- **Notice**: [`third-party/licenses/npm/@turf/helpers/5.1.5/LICENSE.txt`](third-party/licenses/npm/@turf/helpers/5.1.5/LICENSE.txt) · SHA-256 `f9b32b82fd5a1d3a990526d86da97f42fb805d9f4d9f978125c4679b674fce44`

````text
The MIT License (MIT)

Copyright (c) 2017 TurfJS

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### @turf/invariant (5.2.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `e100017b38d1f4412186fca0bb9855aab4359403959a75528b830c78c85b9868`
- **Notice**: [`third-party/licenses/npm/@turf/invariant/5.2.0/LICENSE.txt`](third-party/licenses/npm/@turf/invariant/5.2.0/LICENSE.txt) · SHA-256 `f9b32b82fd5a1d3a990526d86da97f42fb805d9f4d9f978125c4679b674fce44`

````text
The MIT License (MIT)

Copyright (c) 2017 TurfJS

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### @turf/meta (5.2.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `bbf8dc1039a895af42468816fa5091dcabe49ecff3f8a8672f3c5876ec075d95`
- **Notice**: [`third-party/licenses/npm/@turf/meta/5.2.0/LICENSE.txt`](third-party/licenses/npm/@turf/meta/5.2.0/LICENSE.txt) · SHA-256 `f9b32b82fd5a1d3a990526d86da97f42fb805d9f4d9f978125c4679b674fce44`

````text
The MIT License (MIT)

Copyright (c) 2017 TurfJS

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### @turf/rewind (5.1.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `1ebf94404d7a310df912aa6260c46fdb8b6fe4938a5c0b7060613e404a23d005`
- **Notice**: [`third-party/licenses/npm/@turf/rewind/5.1.5/LICENSE.txt`](third-party/licenses/npm/@turf/rewind/5.1.5/LICENSE.txt) · SHA-256 `f9b32b82fd5a1d3a990526d86da97f42fb805d9f4d9f978125c4679b674fce44`

````text
The MIT License (MIT)

Copyright (c) 2017 TurfJS

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### @types/brotli (1.3.5)
- **Declared License**: `MIT`
- **Scope**: `runtime-optional`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `196a83c9ae23796fd6ea5518e944b4ffcadbe9050d3699a190ec2553a0f29a9a`
- **Notice**: [`third-party/licenses/npm/@types/brotli/1.3.5/LICENSE.txt`](third-party/licenses/npm/@types/brotli/1.3.5/LICENSE.txt) · SHA-256 `c2cfccb812fe482101a8f04597dfc5a9991a6b2748266c47ac91b6a5aae15383`

````text
MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
````

#### @types/crypto-js (4.2.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `1a0d9251d2150678c1053152c55f77734c9eda73ee0245879eff384ae057131a`
- **Notice**: [`third-party/licenses/npm/@types/crypto-js/4.2.2/LICENSE.txt`](third-party/licenses/npm/@types/crypto-js/4.2.2/LICENSE.txt) · SHA-256 `c2cfccb812fe482101a8f04597dfc5a9991a6b2748266c47ac91b6a5aae15383`

````text
MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
````

#### @types/geojson (7946.0.16)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `5275058028351e9656972a31295f81b61637c641df6cc13766f48a5fdab1b39e`
- **Notice**: [`third-party/licenses/npm/@types/geojson/7946.0.16/LICENSE.txt`](third-party/licenses/npm/@types/geojson/7946.0.16/LICENSE.txt) · SHA-256 `c2cfccb812fe482101a8f04597dfc5a9991a6b2748266c47ac91b6a5aae15383`

````text
MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
````

#### @types/node (24.19.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `e01cc90bdafb14295f15a8dfbcddd37834250e9dfab4763ff686fb751915d9ce`
- **Notice**: [`third-party/licenses/npm/@types/node/24.19.2/LICENSE.txt`](third-party/licenses/npm/@types/node/24.19.2/LICENSE.txt) · SHA-256 `c2cfccb812fe482101a8f04597dfc5a9991a6b2748266c47ac91b6a5aae15383`

````text
MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
````

#### @types/offscreencanvas (2019.7.3)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `dd3209c9a4c3346bd9774768c030bb8c0dcc91b7d70f9d45304b20eac4769ed4`
- **Notice**: [`third-party/licenses/npm/@types/offscreencanvas/2019.7.3/LICENSE.txt`](third-party/licenses/npm/@types/offscreencanvas/2019.7.3/LICENSE.txt) · SHA-256 `c2cfccb812fe482101a8f04597dfc5a9991a6b2748266c47ac91b6a5aae15383`

````text
MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
````

#### @types/pako (1.0.7)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9ed0b1b269ec414f615231de4c61f6493a57891ff3642a179324793b5d51fdb4`
- **Notice**: [`third-party/licenses/npm/@types/pako/1.0.7/LICENSE.txt`](third-party/licenses/npm/@types/pako/1.0.7/LICENSE.txt) · SHA-256 `c2cfccb812fe482101a8f04597dfc5a9991a6b2748266c47ac91b6a5aae15383`

````text
MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
````

#### @webgpu/types (0.1.74)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `338b7fd717168ed7fdab61c124bf426cb90e2ffa30f61539e5c7cc6ea0a28062`
- **Notice**: [`third-party/licenses/npm/@webgpu/types/0.1.74/LICENSE.txt`](third-party/licenses/npm/@webgpu/types/0.1.74/LICENSE.txt) · SHA-256 `ad88400fc55c2871ba2ed33930dc13001ef01907c2ddcbfa3caa8656e9142f05`

````text
Copyright 2022 WebGPU Developers

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

   3. Neither the name of the copyright holder nor the names of its
      contributors may be used to endorse or promote products derived from this
      software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### a5-js (0.10.1)
- **Declared License**: `Apache-2.0`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `7f47f00dbff837e93bbcadc2f98da7e08333e287a0cdf23e2026b6874126be80`
- **Notice**: [`third-party/licenses/npm/a5-js/0.10.1/LICENSE.txt`](third-party/licenses/npm/a5-js/0.10.1/LICENSE.txt) · SHA-256 `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4`

````text
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
````

#### abstract-logging (2.0.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `9a2ab6159e9d3b04e10f1536fab762d18e09d353941a298171e57b6e25640994`
- **Notice**: [`third-party/licenses/npm/abstract-logging/2.0.1/package.json`](third-party/licenses/npm/abstract-logging/2.0.1/package.json) · SHA-256 `33f6c3a8ec869b76fba4173cd688d1865ae74d746cc3f3b5d85abf9f40ab4038`

````text
{
  "name": "abstract-logging",
  "version": "2.0.1",
  "description": "A noop logger that conforms to the Log4j interface for modules to stub out internal logging",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jsumners/abstract-logging.git"
  },
  "keywords": [
    "log",
    "logging",
    "logger",
    "pino"
  ],
  "author": "James Sumners <james.sumners@gmail.com>",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/jsumners/abstract-logging/issues"
  },
  "homepage": "https://github.com/jsumners/abstract-logging#readme"
}
````

#### ajv (8.20.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `b2f0b3a893bbb8cc5efb6814f08b1499e19e31d5dd73683f5893382f48f6e7b3`
- **Notice**: [`third-party/licenses/npm/ajv/8.20.0/LICENSE.txt`](third-party/licenses/npm/ajv/8.20.0/LICENSE.txt) · SHA-256 `a05350a88e318e4f5f2c2a1ff1e2e88daa4dd38e6e78b71cccae422bdc762cc3`

````text
The MIT License (MIT)

Copyright (c) 2015-2021 Evgeny Poberezkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### ajv-formats (3.0.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `f4d6980fd367381fd29199066911e863db8d97496613b6c2c5b91563a150acc5`
- **Notice**: [`third-party/licenses/npm/ajv-formats/3.0.1/LICENSE.txt`](third-party/licenses/npm/ajv-formats/3.0.1/LICENSE.txt) · SHA-256 `9df3bb69929a3b650ed73b3bfa1756725aaff0ac296461605753547004eafeaf`

````text
MIT License

Copyright (c) 2020 Evgeny Poberezkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### ajv/node_modules/fast-uri (3.1.8)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `86be033b406a7737c0521edc8fe3e15c7ac0cb6b5e509478cc9539a2efaa086c`
- **Notice**: [`third-party/licenses/npm/ajv/node_modules/fast-uri/3.1.8/LICENSE.txt`](third-party/licenses/npm/ajv/node_modules/fast-uri/3.1.8/LICENSE.txt) · SHA-256 `b010b0dfdfdb23d7396e03b82cd4621fc9bb8f95d6b0aea70b9c24e12074c786`

````text
Copyright (c) 2011-2021, Gary Court until https://github.com/garycourt/uri-js/commit/a1acf730b4bba3f1097c9f52e7d9d3aba8cdcaae
Copyright (c) 2021-present The Fastify team <https://github.com/fastify/fastify#team>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * The names of any contributors may not be used to endorse or promote
      products derived from this software without specific prior written
      permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS AND CONTRIBUTORS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

                                  *   *   *

The complete list of contributors can be found at:
- https://github.com/garycourt/uri-js/graphs/contributors
````

#### anynum (1.0.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `705d5c67f0438588aded995c6f88fee65495d0bf6a785a5fa2c448a2fb1f341a`
- **Notice**: [`third-party/licenses/npm/anynum/1.0.1/LICENSE.txt`](third-party/licenses/npm/anynum/1.0.1/LICENSE.txt) · SHA-256 `8e75fc0e776c62ccadb8178ece8d3daa9ba7601fb0a49b2dfb0ea9a7a5c0aa07`

````text
MIT License

Copyright (c) 2026 Natural Intelligence

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### apache-arrow (21.2.0)
- **Declared License**: `Apache-2.0`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `dd63a3a4c380eddeb00c718740414ff33c4ded015c8720798afdfcc61b5dac41`
- **Notice**: [`third-party/licenses/npm/apache-arrow/21.2.0/LICENSE.txt`](third-party/licenses/npm/apache-arrow/21.2.0/LICENSE.txt) · SHA-256 `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`
- **Notice**: [`third-party/licenses/npm/apache-arrow/21.2.0/NOTICE.txt`](third-party/licenses/npm/apache-arrow/21.2.0/NOTICE.txt) · SHA-256 `f4cdb3db59bdaccc1447eae829905cde61dfd7508dca5c4ebff98a998c036ae6`

````text
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
````

````text
Apache Arrow JavaScript
Copyright 2017-2025 The Apache Software Foundation

This product includes software developed at
The Apache Software Foundation (http://www.apache.org/).
````

#### apache-arrow/node_modules/@types/node (25.9.9)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `fb7f3d16a84ea47e898159a010c1cfba3266de74b42528f0bf99584c2309accb`
- **Notice**: [`third-party/licenses/npm/apache-arrow/node_modules/@types/node/25.9.9/LICENSE.txt`](third-party/licenses/npm/apache-arrow/node_modules/@types/node/25.9.9/LICENSE.txt) · SHA-256 `c2cfccb812fe482101a8f04597dfc5a9991a6b2748266c47ac91b6a5aae15383`

````text
MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
````

#### argparse (1.0.10)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `7faa149cd7811b7e11fc8353dc6e4e9c4de68a02f8221aa8f7dc22108315ac0d`
- **Notice**: [`third-party/licenses/npm/argparse/1.0.10/LICENSE.txt`](third-party/licenses/npm/argparse/1.0.10/LICENSE.txt) · SHA-256 `c8442419dc614089ea022b3da6bfc089b41a58fb7b9030d1e651f2f36189dce2`

````text
(The MIT License)

Copyright (C) 2012 by Vitaly Puzrin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### atomic-sleep (1.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `44749ee4b82d2b5fa66323af77c5b836c08368667015a9c8a966033801a56964`
- **Notice**: [`third-party/licenses/npm/atomic-sleep/1.0.0/LICENSE.txt`](third-party/licenses/npm/atomic-sleep/1.0.0/LICENSE.txt) · SHA-256 `8d58741278b289a7f4b6dde2d6273fca7711b9849452c477933d1cccd03db1e7`

````text
The MIT License (MIT)
Copyright (c) 2020 David Mark Clements


Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.
````

#### avvio (9.3.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `5a620668020a86e2e73e59d43d331cb5c5aaa369ebbe3bd2fc68c2f87f3b174d`
- **Notice**: [`third-party/licenses/npm/avvio/9.3.1/LICENSE.txt`](third-party/licenses/npm/avvio/9.3.1/LICENSE.txt) · SHA-256 `0dae13c0bb4d8c6dc73d7d49ddecdba7f56075975ffb2ee17050c63f3f3666f0`

````text
MIT License

Copyright (c) 2016-2020 Matteo Collina
Copyright (c) 2020-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### base64-js (1.5.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `b1b7a945b52685269083425216d6597e33d97bf21699d656e92fdb3eb5210a85`
- **Notice**: [`third-party/licenses/npm/base64-js/1.5.1/LICENSE.txt`](third-party/licenses/npm/base64-js/1.5.1/LICENSE.txt) · SHA-256 `5b37224c080cdcc97c871ada971c224e9926370fe74f11b539aa1cf9f3b1aca1`

````text
The MIT License (MIT)

Copyright (c) 2014 Jameson Little

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### better-sqlite3 (12.11.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `ebf0ed75a7a59dbcb3b24bbd014ef49d9f15bc328e4adcbf516f2a8fadfa2835`
- **Notice**: [`third-party/licenses/npm/better-sqlite3/12.11.1/LICENSE.txt`](third-party/licenses/npm/better-sqlite3/12.11.1/LICENSE.txt) · SHA-256 `09856b52897c91ab67e7456ef43067019f31dfd3b87fda72e655736b1ebdee55`

````text
The MIT License (MIT)

Copyright (c) 2017 Joshua Wise

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### bidi-js (1.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `8a89fce4e2b00c5141929ecde8336e955901e8fa2c7f01c6b5c9732639dd4175`
- **Notice**: [`third-party/licenses/npm/bidi-js/1.1.0/LICENSE.txt`](third-party/licenses/npm/bidi-js/1.1.0/LICENSE.txt) · SHA-256 `49d4d143fed599deb502a0fe6e02f49832f87e9a3a4cd0502e469596d50faa6d`

````text
Copyright (c) 2021 Jason Johnston

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### bindings (1.5.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d77781178c5bd89a91b1f6c5556acd511b1b5927eb13e2ad8189cac29eeb0907`
- **Notice**: [`third-party/licenses/npm/bindings/1.5.0/LICENSE.txt`](third-party/licenses/npm/bindings/1.5.0/LICENSE.txt) · SHA-256 `85fde19744c84cfacb04aed732c0392ba221231b26090d3271d2ed865bfc0792`

````text
(The MIT License)

Copyright (c) 2012 Nathan Rajlich &lt;nathan@tootallnate.net&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### bl (4.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `83deb909ad1829ca990e5b0852810dd1f4402fa5e3a00978fb16a05c49a5a7cb`
- **Notice**: [`third-party/licenses/npm/bl/4.1.0/LICENSE.txt`](third-party/licenses/npm/bl/4.1.0/LICENSE.txt) · SHA-256 `9377db95383c8befacf05c6e465d969d756edf178487ca1344fdf3ba147c596f`

````text
The MIT License (MIT)
=====================

Copyright (c) 2013-2019 bl contributors
----------------------------------

*bl contributors listed at <https://github.com/rvagg/bl#contributors>*

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### bl/node_modules/readable-stream (3.6.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `edd866c05e318aa9c091763eebdd4207409b7a7648be19c5317a96047305ab5d`
- **Notice**: [`third-party/licenses/npm/bl/node_modules/readable-stream/3.6.2/LICENSE.txt`](third-party/licenses/npm/bl/node_modules/readable-stream/3.6.2/LICENSE.txt) · SHA-256 `ec62dc96da0099b87f4511736c87309335527fb7031639493e06c95728dc8c54`

````text
Node.js is licensed for use as follows:

"""
Copyright Node.js contributors. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
"""

This license applies to parts of Node.js originating from the
https://github.com/joyent/node repository:

"""
Copyright Joyent, Inc. and other Node contributors. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
"""
````

#### brotli (1.3.3)
- **Declared License**: `MIT`
- **Scope**: `runtime-optional`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `3c7c260f6263df95fee49a9119e9fd21227d628b6c9d99080a75edfd9e2bdb24`
- **Notice**: [`third-party/licenses/npm/brotli/1.3.3/package.json`](third-party/licenses/npm/brotli/1.3.3/package.json) · SHA-256 `387b47d00ea96cab9b4c521629fbcdc7621053ac061812526f3c69700924cef5`

````text
{
  "name": "brotli",
  "version": "1.3.3",
  "description": "A port of the Brotli compression algorithm as used in WOFF2",
  "main": "index.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/devongovett/brotli.js.git"
  },
  "keywords": [
    "compress",
    "decompress",
    "encode",
    "decode"
  ],
  "author": "Devon Govett <devongovett@gmail.com>",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/devongovett/brotli.js/issues"
  },
  "homepage": "https://github.com/devongovett/brotli.js",
  "dependencies": {
    "base64-js": "^1.1.2"
  },
  "devDependencies": {
    "mocha": "^2.2.1"
  },
  "browser": {
    "./dec/dictionary-data.js": "./dec/dictionary-browser.js"
  },
  "scripts": {
    "test": "mocha",
    "prepublish": "make"
  }
}
````

#### buf-compare (1.0.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `f56951ea645b366256506e771ec34ea008f82a4c61e855c34ccd61ec8f42f2fd`
- **Notice**: [`third-party/licenses/npm/buf-compare/1.0.1/LICENSE.txt`](third-party/licenses/npm/buf-compare/1.0.1/LICENSE.txt) · SHA-256 `6fb9754611c20f6649f68805e8c990e83261f29316e29de9e6cedae607b8634c`

````text
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### buffer (5.7.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `98bfac55b7a37ade644f5eccbcf94a59269afd13e1f9af597e61fd06c057c0bc`
- **Notice**: [`third-party/licenses/npm/buffer/5.7.1/LICENSE.txt`](third-party/licenses/npm/buffer/5.7.1/LICENSE.txt) · SHA-256 `06bafa45fdad2579ba0e43b0c9b2c6290287c99c4203c300254a462b38a307f6`

````text
The MIT License (MIT)

Copyright (c) Feross Aboukhadijeh, and other contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### buffer-crc32 (1.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `bbedaab7c94b9d392ea85da0a77c18c3a0bce3d47a1ca1685af11a747b2883ee`
- **Notice**: [`third-party/licenses/npm/buffer-crc32/1.0.0/LICENSE.txt`](third-party/licenses/npm/buffer-crc32/1.0.0/LICENSE.txt) · SHA-256 `ddc9158fa20e427bc12fa8e1e6d07c642ed4d2c618607df768b30ae2986b3b7c`

````text
The MIT License

Copyright (c) 2013-2024 Brian J. Brennan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### charenc (0.0.2)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `e36769a5316880df93e88212368f8987c8ef3f0f65b5de67d3fdf2ceefe1e89a`
- **Notice**: [`third-party/licenses/npm/charenc/0.0.2/package.json`](third-party/licenses/npm/charenc/0.0.2/package.json) · SHA-256 `c7d1cdd93aabca9fd7ac1c27445a633435fd18ff6666e94645358f08ed22363c`

````text
{
  "author": "Paul Vorbach <paul@vorb.de> (http://vorb.de)",
  "name": "charenc",
  "description": "character encoding utilities",
  "tags": [
    "utf8",
    "binary",
    "byte",
    "string"
  ],
  "version": "0.0.2",
  "license": "BSD-3-Clause",
  "repository": {
    "type": "git",
    "url": "git://github.com/pvorb/node-charenc.git"
  },
  "bugs": {
    "url": "https://github.com/pvorb/node-charenc/issues"
  },
  "main": "charenc.js",
  "engines": {
    "node": "*"
  }
}
````

#### chownr (1.1.4)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `72863e05d34d031def689cbc3609aff0443fab0c64e0e6e81bf86d885d59833e`
- **Notice**: [`third-party/licenses/npm/chownr/1.1.4/LICENSE.txt`](third-party/licenses/npm/chownr/1.1.4/LICENSE.txt) · SHA-256 `4ec3d4c66cd87f5c8d8ad911b10f99bf27cb00cdfcff82621956e379186b016b`

````text
The ISC License

Copyright (c) Isaac Z. Schlueter and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
````

#### cookie (2.0.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `8516126668fc55128916561047c055db77d0401dee1db108adce7267b4b06ff0`
- **Notice**: [`third-party/licenses/npm/cookie/2.0.1/LICENSE.txt`](third-party/licenses/npm/cookie/2.0.1/LICENSE.txt) · SHA-256 `c02110eedc16c7114f1a9bdc026c65626ce1d9c7e27fd51a8e0feee8a48a6858`

````text
(The MIT License)

Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### core-assert (0.2.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `43c103ff9a77ccc8b495da954a4dbeb5a6d4597ff98d76c2a6c4816c191b904b`
- **Notice**: [`third-party/licenses/npm/core-assert/0.2.1/LICENSE.txt`](third-party/licenses/npm/core-assert/0.2.1/LICENSE.txt) · SHA-256 `6fb9754611c20f6649f68805e8c990e83261f29316e29de9e6cedae607b8634c`

````text
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### core-util-is (1.0.3)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `4430fdc71f2cf3b5e297113b9a692da2d6cff96cf84da00f0ecef5e5a6e74d0c`
- **Notice**: [`third-party/licenses/npm/core-util-is/1.0.3/LICENSE.txt`](third-party/licenses/npm/core-util-is/1.0.3/LICENSE.txt) · SHA-256 `33b734d60042d0fe0c92dd1fc1e874193a1c899ec3e276a2eb935d2d0bf5b710`

````text
Copyright Node.js contributors. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
````

#### crypt (0.0.2)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `011d343351e9ac1de36a622a3e678f0f393f188f1cffb5988b7387834a519099`
- **Notice**: [`third-party/licenses/npm/crypt/0.0.2/package.json`](third-party/licenses/npm/crypt/0.0.2/package.json) · SHA-256 `c9f1d099aac008e1fa481ce494b28333e1dfbc90c76a77e75b75b2c25fc8f605`

````text
{
  "author": "Paul Vorbach <paul@vorb.de> (http://vorb.de)",
  "name": "crypt",
  "description": "utilities for encryption and hashing",
  "tags": [
    "hash",
    "security"
  ],
  "version": "0.0.2",
  "license": "BSD-3-Clause",
  "repository": {
    "type": "git",
    "url": "git://github.com/pvorb/node-crypt.git"
  },
  "bugs": {
    "url": "https://github.com/pvorb/node-crypt/issues"
  },
  "main": "crypt.js",
  "engines": {
    "node": "*"
  }
}
````

#### decompress-response (6.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d57e4c5b047bcea4c47cb4cabc14f360d3399389a14ef5a7ce524d181d2a3b4f`
- **Notice**: [`third-party/licenses/npm/decompress-response/6.0.0/LICENSE.txt`](third-party/licenses/npm/decompress-response/6.0.0/LICENSE.txt) · SHA-256 `5c932d88256b4ab958f64a856fa48e8bd1f55bc1d96b8149c65689e0c61789d3`

````text
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### deep-extend (0.6.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `0dcc5f34920c23f5da2916d1d42e53ae5574913dfb78c406902b7189cf0b1386`
- **Notice**: [`third-party/licenses/npm/deep-extend/0.6.0/LICENSE.txt`](third-party/licenses/npm/deep-extend/0.6.0/LICENSE.txt) · SHA-256 `e17120ad3deff741c2ca5cbe511971ca33971a1ba6e49694c6498309bb2680b9`

````text
The MIT License (MIT)

Copyright (c) 2013-2018, Viacheslav Lotsmanov

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### deep-strict-equal (0.2.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `c3045eaecdaa3b83f2bab787ac64210b58b335266f961696748f5a8e673b7271`
- **Notice**: [`third-party/licenses/npm/deep-strict-equal/0.2.0/LICENSE.txt`](third-party/licenses/npm/deep-strict-equal/0.2.0/LICENSE.txt) · SHA-256 `6fb9754611c20f6649f68805e8c990e83261f29316e29de9e6cedae607b8634c`

````text
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### dequal (2.0.3)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `941d90d6629878167d10d2a05d8c6df8f8fa13acc826616abb49db63ac6a5c35`
- **Notice**: [`third-party/licenses/npm/dequal/2.0.3/LICENSE.txt`](third-party/licenses/npm/dequal/2.0.3/LICENSE.txt) · SHA-256 `306fa513e39b23a6e8747520de761809d206b99800ef41907b530226574c59ae`

````text
The MIT License (MIT)

Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### detect-libc (2.1.2)
- **Declared License**: `Apache-2.0`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `270dec0fc06cff86481da8af2dd8f18dee6b602790b14ef0e1c2c18d7da39427`
- **Notice**: [`third-party/licenses/npm/detect-libc/2.1.2/LICENSE.txt`](third-party/licenses/npm/detect-libc/2.1.2/LICENSE.txt) · SHA-256 `b40930bbcf80744c86c46a12bc9da056641d722716c378f5659b9e555ef833e1`

````text
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "{}"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright {yyyy} {name of copyright owner}

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
````

#### draco3d (1.5.7)
- **Declared License**: `Apache-2.0`
- **Scope**: `runtime`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `f2d2b97a938c514dfc1a0f07564eee95b1d889f6862c9c9ccad3001eb0c6f26e`
- **Notice**: [`third-party/licenses/npm/draco3d/1.5.7/package.json`](third-party/licenses/npm/draco3d/1.5.7/package.json) · SHA-256 `6ef40efeb553eb7c2794228b52b22af1110b3d1ff4945ac8d5c29955df3a3c55`

````text
{
  "name": "draco3d",
  "version": "1.5.7",
  "description": "Draco is a library for compressing and decompressing 3D geometric meshes and point clouds. It is intended to improve the storage and transmission of 3D graphics.",
  "main": "draco3d.js",
  "scripts": {
    "test": "nodejs draco_nodejs_example.js"
  },
  "keywords": [
    "geometry",
    "compression",
    "mesh",
    "point cloud"
  ],
  "author": "Google Draco Team",
  "license": "Apache-2.0",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/google/draco.git"
  }
}
````

#### earcut (2.2.4)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `6db1957d339d2db7187c55b14cbb0e3fe2bc78f0458cfb947f7e62113cb8d6cb`
- **Notice**: [`third-party/licenses/npm/earcut/2.2.4/LICENSE.txt`](third-party/licenses/npm/earcut/2.2.4/LICENSE.txt) · SHA-256 `cd661c432ea8243974e6fde6fc433ebee3e96525ca8b66321b9d9971674ede60`

````text
ISC License

Copyright (c) 2016, Mapbox

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
````

#### end-of-stream (1.4.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `6d9c2a6030dc642b77b3a4979dfa82138cdb426d2c0e5b09626ad063e384a309`
- **Notice**: [`third-party/licenses/npm/end-of-stream/1.4.5/LICENSE.txt`](third-party/licenses/npm/end-of-stream/1.4.5/LICENSE.txt) · SHA-256 `3fe8d55a98dbf260eace67c00cf9bc53edb46234e840098a0b93df3096b97fb6`

````text
The MIT License (MIT)

Copyright (c) 2014 Mathias Buus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### expand-template (2.0.3)
- **Declared License**: `(MIT OR WTFPL)`
- **Scope**: `runtime`
- **Election**: **MIT** (upstream: `MIT OR WTFPL`)
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `135592c19c447b6f2c14d6c1d958538a0f4f44d35f87263d8ba2c40d1bc0e0df`
- **Notice**: [`third-party/licenses/npm/expand-template/2.0.3/LICENSE.txt`](third-party/licenses/npm/expand-template/2.0.3/LICENSE.txt) · SHA-256 `0967624813244bf47da346449804af853437433cbdeb8c977f1e0d4bd14e0a3b`

````text
The MIT License (MIT)

Copyright (c) 2018 Lars-Magnus Skog

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### fast-decode-uri-component (1.0.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `de015feadef7113b88f0a56a04f8f7b4f3566d43823adc452216fc081ce8d2a7`
- **Notice**: [`third-party/licenses/npm/fast-decode-uri-component/1.0.1/LICENSE.txt`](third-party/licenses/npm/fast-decode-uri-component/1.0.1/LICENSE.txt) · SHA-256 `27384b39baee4b476fb876670a75f282286fa55658bf0db14639621dd3801c9a`

````text
MIT License

Copyright (c) 2018 Tomas Della Vedova
Copyright (c) 2017 Justin Ridgewell
Copyright (c) 2008-2009 Bjoern Hoehrmann <bjoern@hoehrmann.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### fast-deep-equal (3.1.3)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `b019a0980f27638dc3f85836b0e478f188e00d7a6e5852c0819fa86f56e47b8f`
- **Notice**: [`third-party/licenses/npm/fast-deep-equal/3.1.3/LICENSE.txt`](third-party/licenses/npm/fast-deep-equal/3.1.3/LICENSE.txt) · SHA-256 `7bf9b2de73a6b356761c948d0e9eeb4be6c1270bd04c79cd489c1e400ffdfc1a`

````text
MIT License

Copyright (c) 2017 Evgeny Poberezkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### fast-json-stringify (7.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `445baafe7314936099ac66b5ab75e749437adbf840c4ea2ab7d526c96e5e33ff`
- **Notice**: [`third-party/licenses/npm/fast-json-stringify/7.1.0/LICENSE.txt`](third-party/licenses/npm/fast-json-stringify/7.1.0/LICENSE.txt) · SHA-256 `b08de5bb7b21f44a8358edf74febe50c75ef2a1e5470e06c8919eb934cba067c`

````text
MIT License

Copyright (c) 2016-present Matteo Collina
Copyright (c) 2016-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### fast-querystring (1.1.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `f165a9cb6994ee56b985821adcab43d858cbad39cfcd3315424a7552b732a722`
- **Notice**: [`third-party/licenses/npm/fast-querystring/1.1.2/LICENSE.txt`](third-party/licenses/npm/fast-querystring/1.1.2/LICENSE.txt) · SHA-256 `4f8cf48502224399442f7eadd8620d96ef18125f9beb4949c53084ab3b05a4d4`

````text
Copyright (c) 2022 Yagiz Nizipli

Permission is hereby granted, free of charge, to any
person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the
Software without restriction, including without
limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice
shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
````

#### fast-uri (4.2.2)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `0297adcac7b08758bc03252dad873ac841589eb92f09830bc0bab834931bbc67`
- **Notice**: [`third-party/licenses/npm/fast-uri/4.2.2/LICENSE.txt`](third-party/licenses/npm/fast-uri/4.2.2/LICENSE.txt) · SHA-256 `b010b0dfdfdb23d7396e03b82cd4621fc9bb8f95d6b0aea70b9c24e12074c786`

````text
Copyright (c) 2011-2021, Gary Court until https://github.com/garycourt/uri-js/commit/a1acf730b4bba3f1097c9f52e7d9d3aba8cdcaae
Copyright (c) 2021-present The Fastify team <https://github.com/fastify/fastify#team>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * The names of any contributors may not be used to endorse or promote
      products derived from this software without specific prior written
      permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS AND CONTRIBUTORS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

                                  *   *   *

The complete list of contributors can be found at:
- https://github.com/garycourt/uri-js/graphs/contributors
````

#### fast-xml-builder (1.3.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `0e9583b397ee65ab8cfd32b2f78461bc7d9d4c2d398a03506f524d1973d7642a`
- **Notice**: [`third-party/licenses/npm/fast-xml-builder/1.3.1/LICENSE.txt`](third-party/licenses/npm/fast-xml-builder/1.3.1/LICENSE.txt) · SHA-256 `8e75fc0e776c62ccadb8178ece8d3daa9ba7601fb0a49b2dfb0ea9a7a5c0aa07`

````text
MIT License

Copyright (c) 2026 Natural Intelligence

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### fast-xml-parser (5.11.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d8a04c1838235165f66fa2bc8ed6fcc1adfccae6bda34e24e0b2eadd74601321`
- **Notice**: [`third-party/licenses/npm/fast-xml-parser/5.11.2/LICENSE.txt`](third-party/licenses/npm/fast-xml-parser/5.11.2/LICENSE.txt) · SHA-256 `7883225d5e84a6bbb9b170c3d891b4bf6d6259cee869c86bd86381a927071745`

````text
MIT License

Copyright (c) 2017 Amit Kumar Gupta

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### fastify (5.12.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `f088913fd1dd3f42f090c574d068a5b59de233b352cd14f7fb1edc4667f51da5`
- **Notice**: [`third-party/licenses/npm/fastify/5.12.5/LICENSE.txt`](third-party/licenses/npm/fastify/5.12.5/LICENSE.txt) · SHA-256 `23c91863859171455a536380991b4160fee4e19e2d8dc353ecf7143cc4e53ca2`

````text
MIT License

Copyright (c) 2016-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### fastq (1.20.3)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `cdcbf6387484c524461ddc4c338d2acb25276c4072ecea495959178d28367fef`
- **Notice**: [`third-party/licenses/npm/fastq/1.20.3/LICENSE.txt`](third-party/licenses/npm/fastq/1.20.3/LICENSE.txt) · SHA-256 `c3367f6d01a79d368fc4fbb41b3615fcd92f243d6597ab96742f6f976f9325af`

````text
Copyright (c) 2015-2020, Matteo Collina <matteo.collina@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
````

#### fflate (0.7.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `8c0b9a374d498e019b26f1b2d8a7cde58f217cd7077ea4a58786c0ec28af039c`
- **Notice**: [`third-party/licenses/npm/fflate/0.7.4/LICENSE.txt`](third-party/licenses/npm/fflate/0.7.4/LICENSE.txt) · SHA-256 `62249119bb7df6e54300f37a37145c26a6d4420410aac8881a119c5b427cf751`

````text
MIT License

Copyright (c) 2020 Arjun Barrett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### file-uri-to-path (1.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `5440cdf67e75ab96f36a6be63c1d4c3d54255b1d0970273710fecfebfab06fb3`
- **Notice**: [`third-party/licenses/npm/file-uri-to-path/1.0.0/LICENSE.txt`](third-party/licenses/npm/file-uri-to-path/1.0.0/LICENSE.txt) · SHA-256 `75070206e4ee2a749be52444cecc05101ca8d314c9d6d335ff914046cbf086a0`

````text
Copyright (c) 2014 Nathan Rajlich <nathan@tootallnate.net>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### find-my-way (9.10.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `6e2e412b9f166f9dabdb3f2266904cccedfd46008ef53cb56a46f29906cfa7cc`
- **Notice**: [`third-party/licenses/npm/find-my-way/9.10.0/LICENSE.txt`](third-party/licenses/npm/find-my-way/9.10.0/LICENSE.txt) · SHA-256 `693f9539655acc1847add1ccd364312ba570bf8ce84706b6059e7e0b5ceb90e6`

````text
MIT License

Copyright (c) 2017-2019 Tomas Della Vedova

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### flatbuffers (25.9.23)
- **Declared License**: `Apache-2.0`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `484129ef89da43decec3d004810863a70fad9b2aa6df6246602e58d9ba207d26`
- **Notice**: [`third-party/licenses/npm/flatbuffers/25.9.23/LICENSE.txt`](third-party/licenses/npm/flatbuffers/25.9.23/LICENSE.txt) · SHA-256 `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`

````text
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
````

#### fs-constants (1.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `e7936d7e1b24475bd59312c4005f30d42539627dfc1c4f5dfe2326d7b7c7c5fa`
- **Notice**: [`third-party/licenses/npm/fs-constants/1.0.0/LICENSE.txt`](third-party/licenses/npm/fs-constants/1.0.0/LICENSE.txt) · SHA-256 `2281f2db407bdbb54f069eec38128b2dee2c0c952f52b786ef1faecb81767b3c`

````text
The MIT License (MIT)

Copyright (c) 2018 Mathias Buus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### geojson-vt (5.0.4)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `4a45d52671da51714c04b7bda3c2108d7e1a436f034e9a6b2052ba297e8317f1`
- **Notice**: [`third-party/licenses/npm/geojson-vt/5.0.4/LICENSE.txt`](third-party/licenses/npm/geojson-vt/5.0.4/LICENSE.txt) · SHA-256 `0b348fff56384b43dbb37593906904e56d0f9deb51eae590d4dc6d427fbf1808`

````text
ISC License

Copyright (c) 2026, Mapbox

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
````

#### geotiff (3.0.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9b3628c4fd2357cddef76a511fc4df3c054ad3a2a9393a0d79797a052f888355`
- **Notice**: [`third-party/licenses/npm/geotiff/3.0.5/LICENSE.txt`](third-party/licenses/npm/geotiff/3.0.5/LICENSE.txt) · SHA-256 `da0811089f254e909f69f75fa496ca97e5167a8eaa945d9a6bffdd8499b47a49`

````text
The MIT License (MIT)

Copyright (c) 2015 EOX IT Services GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### geotiff/node_modules/pako (2.2.0)
- **Declared License**: `(MIT AND Zlib)`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `62510b5d8ce95dd70942540dd5e9360dcd5b475a5cfe525be27b26d2908a2d64`
- **Notice**: [`third-party/licenses/npm/geotiff/node_modules/pako/2.2.0/LICENSE.txt`](third-party/licenses/npm/geotiff/node_modules/pako/2.2.0/LICENSE.txt) · SHA-256 `a04665b3b2de56c66730c1f720f528175739e4104f79073614aa611da1e85539`

````text
(The MIT License)

Copyright (C) 2014-2017 by Vitaly Puzrin and Andrei Tuputcyn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### github-from-package (0.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `3e46f185e0772ae9b83a3383a2bc7182b9facaef63c247a76b0ffc91114443fa`
- **Notice**: [`third-party/licenses/npm/github-from-package/0.0.0/LICENSE.txt`](third-party/licenses/npm/github-from-package/0.0.0/LICENSE.txt) · SHA-256 `435a6722c786b0a56fbe7387028f1d9d3f3a2d0fb615bb8fee118727c3f59b7b`

````text
This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### gl-matrix (3.4.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `e08f1f9fc56d91d2aa1392e51cbc3db00d3eb9572dcb352acd9e187fc1a7e63a`
- **Notice**: [`third-party/licenses/npm/gl-matrix/3.4.4/LICENSE.txt`](third-party/licenses/npm/gl-matrix/3.4.4/LICENSE.txt) · SHA-256 `af62d31a0cdc1bf95d5e19428c3e0de368b727d9d5b6b6cdb466f8a52e68ad06`

````text
Copyright (c) 2015-2025, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### h3-js (4.5.0)
- **Declared License**: `Apache-2.0`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `f2819d14956bebc98388d25becb84711d0c464c0ef92ffb63e804b01121a6d6d`
- **Notice**: [`third-party/licenses/npm/h3-js/4.5.0/LICENSE.txt`](third-party/licenses/npm/h3-js/4.5.0/LICENSE.txt) · SHA-256 `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4`
- **Notice**: [`third-party/licenses/npm/h3-js/4.5.0/NOTICE.txt`](third-party/licenses/npm/h3-js/4.5.0/NOTICE.txt) · SHA-256 `a265b8d138fa9064bbe12c1e9d6785705bdc91a3655b241b1fd01a7a0ead6663`

````text
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
````

````text
Copyright 2017-2021 Uber Technologies, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
````

#### ieee754 (1.2.1)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `8ef14b9b397e339db89db97881fb714f49319d8f0eb1275901f45567b28f9dac`
- **Notice**: [`third-party/licenses/npm/ieee754/1.2.1/LICENSE.txt`](third-party/licenses/npm/ieee754/1.2.1/LICENSE.txt) · SHA-256 `18d45466ba3253deae04667e267a91ea8de8548f18c1125264d1c9db28194cc1`

````text
Copyright 2008 Fair Oaks Labs, Inc.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### image-size (0.7.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `881e71322c963e472c37e71a87627e4a485419170221f4a67f7912bfb6f21943`
- **Notice**: [`third-party/licenses/npm/image-size/0.7.5/LICENSE.txt`](third-party/licenses/npm/image-size/0.7.5/LICENSE.txt) · SHA-256 `54d0b82d1e7d0bc60a4b48b6172f1a9fa7385cfa8a448d14ad3a638930ef417c`

````text
The MIT License (MIT)

Copyright © 2017 Aditya Yadav, http://netroy.in

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### immediate (3.0.6)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `98c792f39650b00818c05dcc407902034dc4092f368596b37658d44f28739d11`
- **Notice**: [`third-party/licenses/npm/immediate/3.0.6/LICENSE.txt`](third-party/licenses/npm/immediate/3.0.6/LICENSE.txt) · SHA-256 `809e66de579fb7d92503848bbe6d1f348f4f6521a71e5d294fe7cc0c87a3b4ff`

````text
Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, Domenic Denicola, Brian Cavalier

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### inherits (2.0.4)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d94dbc6c1bb3c5ac0fb12a73ade187108fc60de273a1b754f55044eb5e24afaf`
- **Notice**: [`third-party/licenses/npm/inherits/2.0.4/LICENSE.txt`](third-party/licenses/npm/inherits/2.0.4/LICENSE.txt) · SHA-256 `5ffe28e7ade7d8f10d85d5337a73fd793dac5c462fb9a28fbf8c5046c7fbca3b`

````text
The ISC License

Copyright (c) Isaac Z. Schlueter

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
````

#### ini (1.3.8)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `fd9e1145104d8594ba4ee70596feecb2fe2957f998dc18a2a643e858ee12695a`
- **Notice**: [`third-party/licenses/npm/ini/1.3.8/LICENSE.txt`](third-party/licenses/npm/ini/1.3.8/LICENSE.txt) · SHA-256 `4ec3d4c66cd87f5c8d8ad911b10f99bf27cb00cdfcff82621956e379186b016b`

````text
The ISC License

Copyright (c) Isaac Z. Schlueter and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
````

#### ipaddr.js (2.5.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `586f7ae92cc869bf61612f0d2765a02d98f813c7d1fff461745b93178da626c3`
- **Notice**: [`third-party/licenses/npm/ipaddr.js/2.5.0/LICENSE.txt`](third-party/licenses/npm/ipaddr.js/2.5.0/LICENSE.txt) · SHA-256 `62568a2d1337b77171ecca9db10579163446de1ba6151678e81f06cdc199971b`

````text
Copyright (C) 2011-2017 whitequark <whitequark@whitequark.org>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### is-buffer (1.1.6)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `3d1ad8c0a086873150d3dc69e6c6e628a3729e04e954f90ba6c0f7407272880e`
- **Notice**: [`third-party/licenses/npm/is-buffer/1.1.6/LICENSE.txt`](third-party/licenses/npm/is-buffer/1.1.6/LICENSE.txt) · SHA-256 `c7cc929b57080f4b9d0c6cf57669f0463fc5b39906344dfc8d3bc43426b30eac`

````text
The MIT License (MIT)

Copyright (c) Feross Aboukhadijeh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### is-error (2.2.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `3bfa474055003294d3c183df03d6a65ca13a7258aa5163180b7ca1b6bff28e02`
- **Notice**: [`third-party/licenses/npm/is-error/2.2.2/LICENSE.txt`](third-party/licenses/npm/is-error/2.2.2/LICENSE.txt) · SHA-256 `aa0723af232be8bf3b2f937f788909c1596d3ac613c4b3ce9403bbc00034e518`

````text
Copyright (c) 2015 is-error.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### is-unsafe (2.0.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d1dd08942d20c78f5156911f77e60a173c87a4f575eca285fbecf2c6bc36db2b`
- **Notice**: [`third-party/licenses/npm/is-unsafe/2.0.2/LICENSE.txt`](third-party/licenses/npm/is-unsafe/2.0.2/LICENSE.txt) · SHA-256 `8e75fc0e776c62ccadb8178ece8d3daa9ba7601fb0a49b2dfb0ea9a7a5c0aa07`

````text
MIT License

Copyright (c) 2026 Natural Intelligence

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### isarray (1.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `e23c76f14f5222e07e39d89858b61e8e33f96956de9e0df3659cbdf8db950c87`
- **Notice**: [`third-party/licenses/npm/isarray/1.0.0/package.json`](third-party/licenses/npm/isarray/1.0.0/package.json) · SHA-256 `93165ce56e458216c18240cd961a522af5b18e51da06f55d88ac552234455d95`

````text
{
  "name": "isarray",
  "description": "Array#isArray for older browsers",
  "version": "1.0.0",
  "repository": {
    "type": "git",
    "url": "git://github.com/juliangruber/isarray.git"
  },
  "homepage": "https://github.com/juliangruber/isarray",
  "main": "index.js",
  "dependencies": {},
  "devDependencies": {
    "tape": "~2.13.4"
  },
  "keywords": [
    "browser",
    "isarray",
    "array"
  ],
  "author": {
    "name": "Julian Gruber",
    "email": "mail@juliangruber.com",
    "url": "http://juliangruber.com"
  },
  "license": "MIT",
  "testling": {
    "files": "test.js",
    "browsers": [
      "ie/8..latest",
      "firefox/17..latest",
      "firefox/nightly",
      "chrome/22..latest",
      "chrome/canary",
      "opera/12..latest",
      "opera/next",
      "safari/5.1..latest",
      "ipad/6.0..latest",
      "iphone/6.0..latest",
      "android-browser/4.2..latest"
    ]
  },
  "scripts": {
    "test": "tape test.js"
  }
}
````

#### json-schema-ref-resolver (3.0.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `c7be635d66a8650b0720bdc5ce6779cc5b5fa0431056b67cef2068ede13dd2d3`
- **Notice**: [`third-party/licenses/npm/json-schema-ref-resolver/3.0.1/LICENSE.txt`](third-party/licenses/npm/json-schema-ref-resolver/3.0.1/LICENSE.txt) · SHA-256 `8550e7875f553e746be4b2ab732c1574bae2c5bb01cbdbd7423665fcf1c10076`

````text
MIT License

Copyright (c) 2023-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### json-schema-traverse (1.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `023222622df29fc274bde5d3590e47aa1d4a8e3c1d6e2aba029948ed79799b21`
- **Notice**: [`third-party/licenses/npm/json-schema-traverse/1.0.0/LICENSE.txt`](third-party/licenses/npm/json-schema-traverse/1.0.0/LICENSE.txt) · SHA-256 `7bf9b2de73a6b356761c948d0e9eeb4be6c1270bd04c79cd489c1e400ffdfc1a`

````text
MIT License

Copyright (c) 2017 Evgeny Poberezkin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### json-stringify-pretty-compact (4.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `f15336163c9de2e2d9b820516be061235f4eed93a0a4d5bc9593700799c25f4f`
- **Notice**: [`third-party/licenses/npm/json-stringify-pretty-compact/4.0.0/LICENSE.txt`](third-party/licenses/npm/json-stringify-pretty-compact/4.0.0/LICENSE.txt) · SHA-256 `2d51145876dda3dd13253463b852aa83b78aa598b90fca1709f39f1740ff9a2f`

````text
The MIT License (MIT)

Copyright (c) 2014, 2016, 2017, 2019, 2021, 2022 Simon Lydell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### json-with-bigint (3.5.12)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `608af3ce68ceba88a6cec4cdbd2fb35f1ac219a3b038f995344d0881b73b86ae`
- **Notice**: [`third-party/licenses/npm/json-with-bigint/3.5.12/LICENSE.txt`](third-party/licenses/npm/json-with-bigint/3.5.12/LICENSE.txt) · SHA-256 `bea8e581121934176676096d9745f71a67bc2f8fe1d5579ba0a977c78902beea`

````text
MIT License

Copyright (c) 2023 Ivan Korolenko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### jszip (3.10.2)
- **Declared License**: `(MIT OR GPL-3.0-or-later)`
- **Scope**: `runtime`
- **Election**: **MIT** (upstream: `MIT OR GPL-3.0-or-later`)
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `4ee15dcb3f5433b736a41d091bcad37facee4a4aa96f9e21194789da886ac226`
- **Notice**: [`third-party/licenses/npm/jszip/3.10.2/LICENSE.txt`](third-party/licenses/npm/jszip/3.10.2/LICENSE.txt) · SHA-256 `566c953c6090b1218ca6217dd7359d45dde46581968586dc607d59a78af6a9c4`

````text
JSZip is dual licensed. At your choice you may use it under the MIT license *or* the GPLv3
license.

The MIT License
===============

Copyright (c) 2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


GPL version 3
=============

                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 Copyright (C) 2007 Free Software Foundation, Inc. <http://fsf.org/>
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

                            Preamble

  The GNU General Public License is a free, copyleft license for
software and other kinds of works.

  The licenses for most software and other practical works are designed
to take away your freedom to share and change the works.  By contrast,
the GNU General Public License is intended to guarantee your freedom to
share and change all versions of a program--to make sure it remains free
software for all its users.  We, the Free Software Foundation, use the
GNU General Public License for most of our software; it applies also to
any other work released this way by its authors.  You can apply it to
your programs, too.

  When we speak of free software, we are referring to freedom, not
price.  Our General Public Licenses are designed to make sure that you
have the freedom to distribute copies of free software (and charge for
them if you wish), that you receive source code or can get it if you
want it, that you can change the software or use pieces of it in new
free programs, and that you know you can do these things.

  To protect your rights, we need to prevent others from denying you
these rights or asking you to surrender the rights.  Therefore, you have
certain responsibilities if you distribute copies of the software, or if
you modify it: responsibilities to respect the freedom of others.

  For example, if you distribute copies of such a program, whether
gratis or for a fee, you must pass on to the recipients the same
freedoms that you received.  You must make sure that they, too, receive
or can get the source code.  And you must show them these terms so they
know their rights.

  Developers that use the GNU GPL protect your rights with two steps:
(1) assert copyright on the software, and (2) offer you this License
giving you legal permission to copy, distribute and/or modify it.

  For the developers' and authors' protection, the GPL clearly explains
that there is no warranty for this free software.  For both users' and
authors' sake, the GPL requires that modified versions be marked as
changed, so that their problems will not be attributed erroneously to
authors of previous versions.

  Some devices are designed to deny users access to install or run
modified versions of the software inside them, although the manufacturer
can do so.  This is fundamentally incompatible with the aim of
protecting users' freedom to change the software.  The systematic
pattern of such abuse occurs in the area of products for individuals to
use, which is precisely where it is most unacceptable.  Therefore, we
have designed this version of the GPL to prohibit the practice for those
products.  If such problems arise substantially in other domains, we
stand ready to extend this provision to those domains in future versions
of the GPL, as needed to protect the freedom of users.

  Finally, every program is threatened constantly by software patents.
States should not allow patents to restrict development and use of
software on general-purpose computers, but in those that do, we wish to
avoid the special danger that patents applied to a free program could
make it effectively proprietary.  To prevent this, the GPL assures that
patents cannot be used to render the program non-free.

  The precise terms and conditions for copying, distribution and
modification follow.

                       TERMS AND CONDITIONS

  0. Definitions.

  "This License" refers to version 3 of the GNU General Public License.

  "Copyright" also means copyright-like laws that apply to other kinds of
works, such as semiconductor masks.

  "The Program" refers to any copyrightable work licensed under this
License.  Each licensee is addressed as "you".  "Licensees" and
"recipients" may be individuals or organizations.

  To "modify" a work means to copy from or adapt all or part of the work
in a fashion requiring copyright permission, other than the making of an
exact copy.  The resulting work is called a "modified version" of the
earlier work or a work "based on" the earlier work.

  A "covered work" means either the unmodified Program or a work based
on the Program.

  To "propagate" a work means to do anything with it that, without
permission, would make you directly or secondarily liable for
infringement under applicable copyright law, except executing it on a
computer or modifying a private copy.  Propagation includes copying,
distribution (with or without modification), making available to the
public, and in some countries other activities as well.

  To "convey" a work means any kind of propagation that enables other
parties to make or receive copies.  Mere interaction with a user through
a computer network, with no transfer of a copy, is not conveying.

  An interactive user interface displays "Appropriate Legal Notices"
to the extent that it includes a convenient and prominently visible
feature that (1) displays an appropriate copyright notice, and (2)
tells the user that there is no warranty for the work (except to the
extent that warranties are provided), that licensees may convey the
work under this License, and how to view a copy of this License.  If
the interface presents a list of user commands or options, such as a
menu, a prominent item in the list meets this criterion.

  1. Source Code.

  The "source code" for a work means the preferred form of the work
for making modifications to it.  "Object code" means any non-source
form of a work.

  A "Standard Interface" means an interface that either is an official
standard defined by a recognized standards body, or, in the case of
interfaces specified for a particular programming language, one that
is widely used among developers working in that language.

  The "System Libraries" of an executable work include anything, other
than the work as a whole, that (a) is included in the normal form of
packaging a Major Component, but which is not part of that Major
Component, and (b) serves only to enable use of the work with that
Major Component, or to implement a Standard Interface for which an
implementation is available to the public in source code form.  A
"Major Component", in this context, means a major essential component
(kernel, window system, and so on) of the specific operating system
(if any) on which the executable work runs, or a compiler used to
produce the work, or an object code interpreter used to run it.

  The "Corresponding Source" for a work in object code form means all
the source code needed to generate, install, and (for an executable
work) run the object code and to modify the work, including scripts to
control those activities.  However, it does not include the work's
System Libraries, or general-purpose tools or generally available free
programs which are used unmodified in performing those activities but
which are not part of the work.  For example, Corresponding Source
includes interface definition files associated with source files for
the work, and the source code for shared libraries and dynamically
linked subprograms that the work is specifically designed to require,
such as by intimate data communication or control flow between those
subprograms and other parts of the work.

  The Corresponding Source need not include anything that users
can regenerate automatically from other parts of the Corresponding
Source.

  The Corresponding Source for a work in source code form is that
same work.

  2. Basic Permissions.

  All rights granted under this License are granted for the term of
copyright on the Program, and are irrevocable provided the stated
conditions are met.  This License explicitly affirms your unlimited
permission to run the unmodified Program.  The output from running a
covered work is covered by this License only if the output, given its
content, constitutes a covered work.  This License acknowledges your
rights of fair use or other equivalent, as provided by copyright law.

  You may make, run and propagate covered works that you do not
convey, without conditions so long as your license otherwise remains
in force.  You may convey covered works to others for the sole purpose
of having them make modifications exclusively for you, or provide you
with facilities for running those works, provided that you comply with
the terms of this License in conveying all material for which you do
not control copyright.  Those thus making or running the covered works
for you must do so exclusively on your behalf, under your direction
and control, on terms that prohibit them from making any copies of
your copyrighted material outside their relationship with you.

  Conveying under any other circumstances is permitted solely under
the conditions stated below.  Sublicensing is not allowed; section 10
makes it unnecessary.

  3. Protecting Users' Legal Rights From Anti-Circumvention Law.

  No covered work shall be deemed part of an effective technological
measure under any applicable law fulfilling obligations under article
11 of the WIPO copyright treaty adopted on 20 December 1996, or
similar laws prohibiting or restricting circumvention of such
measures.

  When you convey a covered work, you waive any legal power to forbid
circumvention of technological measures to the extent such circumvention
is effected by exercising rights under this License with respect to
the covered work, and you disclaim any intention to limit operation or
modification of the work as a means of enforcing, against the work's
users, your or third parties' legal rights to forbid circumvention of
technological measures.

  4. Conveying Verbatim Copies.

  You may convey verbatim copies of the Program's source code as you
receive it, in any medium, provided that you conspicuously and
appropriately publish on each copy an appropriate copyright notice;
keep intact all notices stating that this License and any
non-permissive terms added in accord with section 7 apply to the code;
keep intact all notices of the absence of any warranty; and give all
recipients a copy of this License along with the Program.

  You may charge any price or no price for each copy that you convey,
and you may offer support or warranty protection for a fee.

  5. Conveying Modified Source Versions.

  You may convey a work based on the Program, or the modifications to
produce it from the Program, in the form of source code under the
terms of section 4, provided that you also meet all of these conditions:

    a) The work must carry prominent notices stating that you modified
    it, and giving a relevant date.

    b) The work must carry prominent notices stating that it is
    released under this License and any conditions added under section
    7.  This requirement modifies the requirement in section 4 to
    "keep intact all notices".

    c) You must license the entire work, as a whole, under this
    License to anyone who comes into possession of a copy.  This
    License will therefore apply, along with any applicable section 7
    additional terms, to the whole of the work, and all its parts,
    regardless of how they are packaged.  This License gives no
    permission to license the work in any other way, but it does not
    invalidate such permission if you have separately received it.

    d) If the work has interactive user interfaces, each must display
    Appropriate Legal Notices; however, if the Program has interactive
    interfaces that do not display Appropriate Legal Notices, your
    work need not make them do so.

  A compilation of a covered work with other separate and independent
works, which are not by their nature extensions of the covered work,
and which are not combined with it such as to form a larger program,
in or on a volume of a storage or distribution medium, is called an
"aggregate" if the compilation and its resulting copyright are not
used to limit the access or legal rights of the compilation's users
beyond what the individual works permit.  Inclusion of a covered work
in an aggregate does not cause this License to apply to the other
parts of the aggregate.

  6. Conveying Non-Source Forms.

  You may convey a covered work in object code form under the terms
of sections 4 and 5, provided that you also convey the
machine-readable Corresponding Source under the terms of this License,
in one of these ways:

    a) Convey the object code in, or embodied in, a physical product
    (including a physical distribution medium), accompanied by the
    Corresponding Source fixed on a durable physical medium
    customarily used for software interchange.

    b) Convey the object code in, or embodied in, a physical product
    (including a physical distribution medium), accompanied by a
    written offer, valid for at least three years and valid for as
    long as you offer spare parts or customer support for that product
    model, to give anyone who possesses the object code either (1) a
    copy of the Corresponding Source for all the software in the
    product that is covered by this License, on a durable physical
    medium customarily used for software interchange, for a price no
    more than your reasonable cost of physically performing this
    conveying of source, or (2) access to copy the
    Corresponding Source from a network server at no charge.

    c) Convey individual copies of the object code with a copy of the
    written offer to provide the Corresponding Source.  This
    alternative is allowed only occasionally and noncommercially, and
    only if you received the object code with such an offer, in accord
    with subsection 6b.

    d) Convey the object code by offering access from a designated
    place (gratis or for a charge), and offer equivalent access to the
    Corresponding Source in the same way through the same place at no
    further charge.  You need not require recipients to copy the
    Corresponding Source along with the object code.  If the place to
    copy the object code is a network server, the Corresponding Source
    may be on a different server (operated by you or a third party)
    that supports equivalent copying facilities, provided you maintain
    clear directions next to the object code saying where to find the
    Corresponding Source.  Regardless of what server hosts the
    Corresponding Source, you remain obligated to ensure that it is
    available for as long as needed to satisfy these requirements.

    e) Convey the object code using peer-to-peer transmission, provided
    you inform other peers where the object code and Corresponding
    Source of the work are being offered to the general public at no
    charge under subsection 6d.

  A separable portion of the object code, whose source code is excluded
from the Corresponding Source as a System Library, need not be
included in conveying the object code work.

  A "User Product" is either (1) a "consumer product", which means any
tangible personal property which is normally used for personal, family,
or household purposes, or (2) anything designed or sold for incorporation
into a dwelling.  In determining whether a product is a consumer product,
doubtful cases shall be resolved in favor of coverage.  For a particular
product received by a particular user, "normally used" refers to a
typical or common use of that class of product, regardless of the status
of the particular user or of the way in which the particular user
actually uses, or expects or is expected to use, the product.  A product
is a consumer product regardless of whether the product has substantial
commercial, industrial or non-consumer uses, unless such uses represent
the only significant mode of use of the product.

  "Installation Information" for a User Product means any methods,
procedures, authorization keys, or other information required to install
and execute modified versions of a covered work in that User Product from
a modified version of its Corresponding Source.  The information must
suffice to ensure that the continued functioning of the modified object
code is in no case prevented or interfered with solely because
modification has been made.

  If you convey an object code work under this section in, or with, or
specifically for use in, a User Product, and the conveying occurs as
part of a transaction in which the right of possession and use of the
User Product is transferred to the recipient in perpetuity or for a
fixed term (regardless of how the transaction is characterized), the
Corresponding Source conveyed under this section must be accompanied
by the Installation Information.  But this requirement does not apply
if neither you nor any third party retains the ability to install
modified object code on the User Product (for example, the work has
been installed in ROM).

  The requirement to provide Installation Information does not include a
requirement to continue to provide support service, warranty, or updates
for a work that has been modified or installed by the recipient, or for
the User Product in which it has been modified or installed.  Access to a
network may be denied when the modification itself materially and
adversely affects the operation of the network or violates the rules and
protocols for communication across the network.

  Corresponding Source conveyed, and Installation Information provided,
in accord with this section must be in a format that is publicly
documented (and with an implementation available to the public in
source code form), and must require no special password or key for
unpacking, reading or copying.

  7. Additional Terms.

  "Additional permissions" are terms that supplement the terms of this
License by making exceptions from one or more of its conditions.
Additional permissions that are applicable to the entire Program shall
be treated as though they were included in this License, to the extent
that they are valid under applicable law.  If additional permissions
apply only to part of the Program, that part may be used separately
under those permissions, but the entire Program remains governed by
this License without regard to the additional permissions.

  When you convey a copy of a covered work, you may at your option
remove any additional permissions from that copy, or from any part of
it.  (Additional permissions may be written to require their own
removal in certain cases when you modify the work.)  You may place
additional permissions on material, added by you to a covered work,
for which you have or can give appropriate copyright permission.

  Notwithstanding any other provision of this License, for material you
add to a covered work, you may (if authorized by the copyright holders of
that material) supplement the terms of this License with terms:

    a) Disclaiming warranty or limiting liability differently from the
    terms of sections 15 and 16 of this License; or

    b) Requiring preservation of specified reasonable legal notices or
    author attributions in that material or in the Appropriate Legal
    Notices displayed by works containing it; or

    c) Prohibiting misrepresentation of the origin of that material, or
    requiring that modified versions of such material be marked in
    reasonable ways as different from the original version; or

    d) Limiting the use for publicity purposes of names of licensors or
    authors of the material; or

    e) Declining to grant rights under trademark law for use of some
    trade names, trademarks, or service marks; or

    f) Requiring indemnification of licensors and authors of that
    material by anyone who conveys the material (or modified versions of
    it) with contractual assumptions of liability to the recipient, for
    any liability that these contractual assumptions directly impose on
    those licensors and authors.

  All other non-permissive additional terms are considered "further
restrictions" within the meaning of section 10.  If the Program as you
received it, or any part of it, contains a notice stating that it is
governed by this License along with a term that is a further
restriction, you may remove that term.  If a license document contains
a further restriction but permits relicensing or conveying under this
License, you may add to a covered work material governed by the terms
of that license document, provided that the further restriction does
not survive such relicensing or conveying.

  If you add terms to a covered work in accord with this section, you
must place, in the relevant source files, a statement of the
additional terms that apply to those files, or a notice indicating
where to find the applicable terms.

  Additional terms, permissive or non-permissive, may be stated in the
form of a separately written license, or stated as exceptions;
the above requirements apply either way.

  8. Termination.

  You may not propagate or modify a covered work except as expressly
provided under this License.  Any attempt otherwise to propagate or
modify it is void, and will automatically terminate your rights under
this License (including any patent licenses granted under the third
paragraph of section 11).

  However, if you cease all violation of this License, then your
license from a particular copyright holder is reinstated (a)
provisionally, unless and until the copyright holder explicitly and
finally terminates your license, and (b) permanently, if the copyright
holder fails to notify you of the violation by some reasonable means
prior to 60 days after the cessation.

  Moreover, your license from a particular copyright holder is
reinstated permanently if the copyright holder notifies you of the
violation by some reasonable means, this is the first time you have
received notice of violation of this License (for any work) from that
copyright holder, and you cure the violation prior to 30 days after
your receipt of the notice.

  Termination of your rights under this section does not terminate the
licenses of parties who have received copies or rights from you under
this License.  If your rights have been terminated and not permanently
reinstated, you do not qualify to receive new licenses for the same
material under section 10.

  9. Acceptance Not Required for Having Copies.

  You are not required to accept this License in order to receive or
run a copy of the Program.  Ancillary propagation of a covered work
occurring solely as a consequence of using peer-to-peer transmission
to receive a copy likewise does not require acceptance.  However,
nothing other than this License grants you permission to propagate or
modify any covered work.  These actions infringe copyright if you do
not accept this License.  Therefore, by modifying or propagating a
covered work, you indicate your acceptance of this License to do so.

  10. Automatic Licensing of Downstream Recipients.

  Each time you convey a covered work, the recipient automatically
receives a license from the original licensors, to run, modify and
propagate that work, subject to this License.  You are not responsible
for enforcing compliance by third parties with this License.

  An "entity transaction" is a transaction transferring control of an
organization, or substantially all assets of one, or subdividing an
organization, or merging organizations.  If propagation of a covered
work results from an entity transaction, each party to that
transaction who receives a copy of the work also receives whatever
licenses to the work the party's predecessor in interest had or could
give under the previous paragraph, plus a right to possession of the
Corresponding Source of the work from the predecessor in interest, if
the predecessor has it or can get it with reasonable efforts.

  You may not impose any further restrictions on the exercise of the
rights granted or affirmed under this License.  For example, you may
not impose a license fee, royalty, or other charge for exercise of
rights granted under this License, and you may not initiate litigation
(including a cross-claim or counterclaim in a lawsuit) alleging that
any patent claim is infringed by making, using, selling, offering for
sale, or importing the Program or any portion of it.

  11. Patents.

  A "contributor" is a copyright holder who authorizes use under this
License of the Program or a work on which the Program is based.  The
work thus licensed is called the contributor's "contributor version".

  A contributor's "essential patent claims" are all patent claims
owned or controlled by the contributor, whether already acquired or
hereafter acquired, that would be infringed by some manner, permitted
by this License, of making, using, or selling its contributor version,
but do not include claims that would be infringed only as a
consequence of further modification of the contributor version.  For
purposes of this definition, "control" includes the right to grant
patent sublicenses in a manner consistent with the requirements of
this License.

  Each contributor grants you a non-exclusive, worldwide, royalty-free
patent license under the contributor's essential patent claims, to
make, use, sell, offer for sale, import and otherwise run, modify and
propagate the contents of its contributor version.

  In the following three paragraphs, a "patent license" is any express
agreement or commitment, however denominated, not to enforce a patent
(such as an express permission to practice a patent or covenant not to
sue for patent infringement).  To "grant" such a patent license to a
party means to make such an agreement or commitment not to enforce a
patent against the party.

  If you convey a covered work, knowingly relying on a patent license,
and the Corresponding Source of the work is not available for anyone
to copy, free of charge and under the terms of this License, through a
publicly available network server or other readily accessible means,
then you must either (1) cause the Corresponding Source to be so
available, or (2) arrange to deprive yourself of the benefit of the
patent license for this particular work, or (3) arrange, in a manner
consistent with the requirements of this License, to extend the patent
license to downstream recipients.  "Knowingly relying" means you have
actual knowledge that, but for the patent license, your conveying the
covered work in a country, or your recipient's use of the covered work
in a country, would infringe one or more identifiable patents in that
country that you have reason to believe are valid.

  If, pursuant to or in connection with a single transaction or
arrangement, you convey, or propagate by procuring conveyance of, a
covered work, and grant a patent license to some of the parties
receiving the covered work authorizing them to use, propagate, modify
or convey a specific copy of the covered work, then the patent license
you grant is automatically extended to all recipients of the covered
work and works based on it.

  A patent license is "discriminatory" if it does not include within
the scope of its coverage, prohibits the exercise of, or is
conditioned on the non-exercise of one or more of the rights that are
specifically granted under this License.  You may not convey a covered
work if you are a party to an arrangement with a third party that is
in the business of distributing software, under which you make payment
to the third party based on the extent of your activity of conveying
the work, and under which the third party grants, to any of the
parties who would receive the covered work from you, a discriminatory
patent license (a) in connection with copies of the covered work
conveyed by you (or copies made from those copies), or (b) primarily
for and in connection with specific products or compilations that
contain the covered work, unless you entered into that arrangement,
or that patent license was granted, prior to 28 March 2007.

  Nothing in this License shall be construed as excluding or limiting
any implied license or other defenses to infringement that may
otherwise be available to you under applicable patent law.

  12. No Surrender of Others' Freedom.

  If conditions are imposed on you (whether by court order, agreement or
otherwise) that contradict the conditions of this License, they do not
excuse you from the conditions of this License.  If you cannot convey a
covered work so as to satisfy simultaneously your obligations under this
License and any other pertinent obligations, then as a consequence you may
not convey it at all.  For example, if you agree to terms that obligate you
to collect a royalty for further conveying from those to whom you convey
the Program, the only way you could satisfy both those terms and this
License would be to refrain entirely from conveying the Program.

  13. Use with the GNU Affero General Public License.

  Notwithstanding any other provision of this License, you have
permission to link or combine any covered work with a work licensed
under version 3 of the GNU Affero General Public License into a single
combined work, and to convey the resulting work.  The terms of this
License will continue to apply to the part which is the covered work,
but the special requirements of the GNU Affero General Public License,
section 13, concerning interaction through a network will apply to the
combination as such.

  14. Revised Versions of this License.

  The Free Software Foundation may publish revised and/or new versions of
the GNU General Public License from time to time.  Such new versions will
be similar in spirit to the present version, but may differ in detail to
address new problems or concerns.

  Each version is given a distinguishing version number.  If the
Program specifies that a certain numbered version of the GNU General
Public License "or any later version" applies to it, you have the
option of following the terms and conditions either of that numbered
version or of any later version published by the Free Software
Foundation.  If the Program does not specify a version number of the
GNU General Public License, you may choose any version ever published
by the Free Software Foundation.

  If the Program specifies that a proxy can decide which future
versions of the GNU General Public License can be used, that proxy's
public statement of acceptance of a version permanently authorizes you
to choose that version for the Program.

  Later license versions may give you additional or different
permissions.  However, no additional obligations are imposed on any
author or copyright holder as a result of your choosing to follow a
later version.

  15. Disclaimer of Warranty.

  THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY
APPLICABLE LAW.  EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT
HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY
OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE.  THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM
IS WITH YOU.  SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF
ALL NECESSARY SERVICING, REPAIR OR CORRECTION.

  16. Limitation of Liability.

  IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING
WILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MODIFIES AND/OR CONVEYS
THE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY
GENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE
USE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED TO LOSS OF
DATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD
PARTIES OR A FAILURE OF THE PROGRAM TO OPERATE WITH ANY OTHER PROGRAMS),
EVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF
SUCH DAMAGES.

  17. Interpretation of Sections 15 and 16.

  If the disclaimer of warranty and limitation of liability provided
above cannot be given local legal effect according to their terms,
reviewing courts shall apply local law that most closely approximates
an absolute waiver of all civil liability in connection with the
Program, unless a warranty or assumption of liability accompanies a
copy of the Program in return for a fee.

                     END OF TERMS AND CONDITIONS
````

#### kdbush (4.1.0)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `ffa16406d8b2f856c9b550c2c6c611a9775392c3791d42a37d131d745c66842b`
- **Notice**: [`third-party/licenses/npm/kdbush/4.1.0/LICENSE.txt`](third-party/licenses/npm/kdbush/4.1.0/LICENSE.txt) · SHA-256 `0aba693a2c2e5b1b1465f9e06d29c21769450add9dbb7dc915b41a60e900196f`

````text
ISC License

Copyright (c) 2026, Vladimir Agafonkin

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
````

#### ktx-parse (1.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9d4303bbd807faa4e0455f8115f6d75cee7036ec9d5160b6911363074d3ee003`
- **Notice**: [`third-party/licenses/npm/ktx-parse/1.1.0/LICENSE.txt`](third-party/licenses/npm/ktx-parse/1.1.0/LICENSE.txt) · SHA-256 `79847431f9ecef9cf399085cb863452e71a6dab99738f4f0c1ea06c6484b5692`

````text
The MIT License (MIT)

Copyright (c) 2020 Don McCurdy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### lerc (3.0.0)
- **Declared License**: `Apache-2.0`
- **Scope**: `runtime`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `5c927cdc5d70387b2f4215f99595f8c119157eacc3cf0fec9a7c4db2da3e784d`
- **Notice**: [`third-party/licenses/npm/lerc/3.0.0/package.json`](third-party/licenses/npm/lerc/3.0.0/package.json) · SHA-256 `886ce794413e5d06fab6751afb4b9cdc8611424122cff1addab7ce9f2d01e7be`

````text
{
  "name": "lerc",
  "browser": "LercDecode.js",
  "bugs": {
    "url": "https://github.com/esri/lerc/issues"
  },
  "description": "Rapid decoding of Lerc compressed raster data for any standard pixel type.",
  "version": "3.0.0",
  "author": "Esri <dev_tools@esri.com> (http://developers.arcgis.com)",
  "contributors": [
    "Johannes Schmid",
    "Chayanika Khatua",
    "Wenxue Ju"
  ],
  "devDependencies": {
    "gh-release": "^2.2.1",
    "jsdoc-to-markdown": "^2.0.1",
    "jshint": "^2.13.0",
    "uglify-js": "^3.14.0"
  },
  "files": [
    "LercDecode.js",
    "LercDecode.min.js"
  ],
  "homepage": "https://github.com/Esri/lerc",
  "license": "Apache-2.0",
  "main": "LercDecode.js",
  "readmeFilename": "README.md",
  "repository": {
    "type": "git",
    "url": "https://github.com/Esri/lerc.git"
  },
  "scripts": {
    "lint": "jshint LercDecode.js",
    "build": "uglifyjs LercDecode.js -o LercDecode.min.js --comments",
    "docs": "jsdoc2md --template README.hbs --files LercDecode.js",
    "release": "./release.sh"
  }
}
````

#### lie (3.3.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `2db8461cd4a10e2fc3588c8c55da34d33465ff81cc19c72416bbcaec7ee6a36e`
- **Notice**: [`third-party/licenses/npm/lie/3.3.0/LICENSE.txt`](third-party/licenses/npm/lie/3.3.0/LICENSE.txt) · SHA-256 `5c81b0caa98593408b03125efa25efe622341ed87ae55561968828cd887d64a4`

````text
#Copyright (c) 2014-2018 Calvin Metcalf, Jordan Harband

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

**THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.**
````

#### light-my-request (6.8.0)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `4dc3b9e02104e235bd74c0cb35164fa158dddf9249ef434ed183d1db695361f2`
- **Notice**: [`third-party/licenses/npm/light-my-request/6.8.0/LICENSE.txt`](third-party/licenses/npm/light-my-request/6.8.0/LICENSE.txt) · SHA-256 `a46f56efbbd8ee5b8f80c8e60b3340f253714e010803b2671180f860222e1317`

````text
Copyright (c) 2012-2014, Walmart
Copyright (c) 2012-2017, Project contributors
Copyright (c) 2017-present The Fastify team <https://github.com/fastify/fastify#team>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * The names of any contributors may not be used to endorse or promote
      products derived from this software without specific prior written
      permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS AND CONTRIBUTORS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

                                  *   *   *

The complete list of contributors can be found at:
- https://github.com/hapijs/shot/graphs/contributors
- https://github.com/fastify/light-my-request/graphs/contributors
````

#### long (3.2.0)
- **Declared License**: `Apache-2.0`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `a5b10daf8eaa2e6507a3e9e648016cdc9777857ad501917316a5228aa5f3d9cb`
- **Notice**: [`third-party/licenses/npm/long/3.2.0/LICENSE.txt`](third-party/licenses/npm/long/3.2.0/LICENSE.txt) · SHA-256 `3ddf9be5c28fe27dad143a5dc76eea25222ad1dd68934a047064e56ed2fa40c5`

````text
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
````

#### lz4js (0.2.0)
- **Declared License**: `ISC`
- **Scope**: `runtime-optional`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `c948b9c0c5e1441cbd1a622c02826eeeeaef88994d634777da0784853f0d3670`
- **Notice**: [`third-party/licenses/npm/lz4js/0.2.0/package.json`](third-party/licenses/npm/lz4js/0.2.0/package.json) · SHA-256 `683538e928de4f5c7a884450dad938980896414a9ea75ec28dc4b215fcd31bdb`

````text
{
  "name": "lz4js",
  "version": "0.2.0",
  "description": "An Lz4 implementation for the browser.",
  "main": "lz4.js",
  "scripts": {
    "test": "mocha -R spec test/cases"
  },
  "repository": {
    "type": "git",
    "url": "git+ssh://git@github.com/Benzinga/lz4js.git"
  },
  "keywords": [
    "lz4",
    "compression",
    "decompression",
    "browser",
    "commonjs"
  ],
  "author": "John Chadwick",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/Benzinga/lz4js/issues"
  },
  "homepage": "https://github.com/Benzinga/lz4js#readme",
  "devDependencies": {
    "chai": "^3.5.0",
    "eslint": "^3.0.1",
    "eslint-config-semistandard": "^6.0.2",
    "eslint-config-standard": "^5.3.5",
    "eslint-plugin-promise": "^2.0.0",
    "eslint-plugin-react": "^5.2.2",
    "eslint-plugin-standard": "^2.0.0",
    "mocha": "^2.5.3"
  }
}
````

#### maplibre-gl (6.12.0)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `1a45dce625ea444b04dccd8e16e8bbfec5244a75f8aaa650edb3660d7062a0f0`
- **Notice**: [`third-party/licenses/npm/maplibre-gl/6.12.0/LICENSE.txt`](third-party/licenses/npm/maplibre-gl/6.12.0/LICENSE.txt) · SHA-256 `ee5fc05a0677eaf69601d2c7db0d9ecd6cc27c3abc1d0733bc9ed34707cf8ef2`

````text
Copyright (c) 2023, MapLibre contributors

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    * Neither the name of MapLibre GL JS nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


-------------------------------------------------------------------------------

Contains code from mapbox-gl-js v1.13 and earlier

Version v1.13 of mapbox-gl-js and earlier are licensed under a BSD-3-Clause license

Copyright (c) 2020, Mapbox
Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.
* Neither the name of Mapbox GL JS nor the names of its contributors
  may be used to endorse or promote products derived from this software
  without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


-------------------------------------------------------------------------------

Contains code from glfx.js

Copyright (C) 2011 by Evan Wallace

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

--------------------------------------------------------------------------------

Contains a portion of d3-color https://github.com/d3/d3-color

Copyright 2010-2016 Mike Bostock
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the author nor the names of contributors may be used to
  endorse or promote products derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### maplibre-gl/node_modules/@mapbox/point-geometry (1.1.0)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9bf202082ba414ef99d82ca466445bfeddff3631922cfa74f9b4ce5caafde038`
- **Notice**: [`third-party/licenses/npm/maplibre-gl/node_modules/@mapbox/point-geometry/1.1.0/LICENSE.txt`](third-party/licenses/npm/maplibre-gl/node_modules/@mapbox/point-geometry/1.1.0/LICENSE.txt) · SHA-256 `0c0ede0036a425ff8b2d49341ea9aa8eccbeeae1ac4eb59874c9dd8bcf5186d3`

````text
Copyright (c) 2024, Mapbox

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
````

#### maplibre-gl/node_modules/earcut (3.2.4)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `2f63624cc056e4f2f8109a84d10fff3daeea37581af14af0f612ff387cc2534a`
- **Notice**: [`third-party/licenses/npm/maplibre-gl/node_modules/earcut/3.2.4/LICENSE.txt`](third-party/licenses/npm/maplibre-gl/node_modules/earcut/3.2.4/LICENSE.txt) · SHA-256 `0b348fff56384b43dbb37593906904e56d0f9deb51eae590d4dc6d427fbf1808`

````text
ISC License

Copyright (c) 2026, Mapbox

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
````

#### md5 (2.3.0)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `dcf1c987696c36f3a52bb2c0933b1156b779b406bebb2bf5b4096e7f2cf4f32a`
- **Notice**: [`third-party/licenses/npm/md5/2.3.0/LICENSE.txt`](third-party/licenses/npm/md5/2.3.0/LICENSE.txt) · SHA-256 `b08b42c21289534dc6dab871be541faec551ea584349370c5081e00e5d58f0b4`

````text
Copyright © 2011-2012, Paul Vorbach.
Copyright © 2009, Jeff Mott.

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.
* Neither the name Crypto-JS nor the names of its contributors may be used to
  endorse or promote products derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### meshoptimizer (1.3.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `6c3e8d653702333ce392cfa377065a9e38531285b74721d7ceffea53e025252b`
- **Notice**: [`third-party/licenses/npm/meshoptimizer/1.3.0/LICENSE.txt`](third-party/licenses/npm/meshoptimizer/1.3.0/LICENSE.txt) · SHA-256 `f03037ca7bad1e3eb7f4a63fa6084a8baabd5ba30d3c239a9a7f35705d873e26`

````text
MIT License

Copyright (c) 2016-2026 Arseny Kapoulkine

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### mgrs (1.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9df8b8b657f828fa8ef6729789865b96a121e148f6fc54128a7b695c6231b8dd`
- **Notice**: [`third-party/licenses/npm/mgrs/1.0.0/LICENSE.txt`](third-party/licenses/npm/mgrs/1.0.0/LICENSE.txt) · SHA-256 `069adb09f8be7a8d31415c476b5e25ea2da2f5150e69e32ac69179826f9d33b5`

````text
Copyright (c) 2012, Mike Adair, Richard Greenwood, Didier Richard, Stephen Irons, Olivier Terral, Calvin Metcalf

 Permission is hereby granted, free of charge, to any person obtaining a
 copy of this software and associated documentation files (the "Software"),
 to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense,
 and/or sell copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included
 in all copies or substantial portions of the Software.

 _THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 DEALINGS IN THE SOFTWARE._
````

#### mimic-response (3.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `321e9b7c155cd47183de9d9cdbd6c37bca8187e15b11a42443883330c063dd54`
- **Notice**: [`third-party/licenses/npm/mimic-response/3.1.0/LICENSE.txt`](third-party/licenses/npm/mimic-response/3.1.0/LICENSE.txt) · SHA-256 `5c932d88256b4ab958f64a856fa48e8bd1f55bc1d96b8149c65689e0c61789d3`

````text
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### minimist (1.2.8)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `350a76c115b393c19d24654834261e5dc9f0e8cc5e08f3937fa80140f3e4ce83`
- **Notice**: [`third-party/licenses/npm/minimist/1.2.8/LICENSE.txt`](third-party/licenses/npm/minimist/1.2.8/LICENSE.txt) · SHA-256 `435a6722c786b0a56fbe7387028f1d9d3f3a2d0fb615bb8fee118727c3f59b7b`

````text
This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### mjolnir.js (3.1.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d4b3d58ebf46b75261a667359506559150d33fb80d18072cf2788225c3547d88`
- **Notice**: [`third-party/licenses/npm/mjolnir.js/3.1.1/LICENSE.txt`](third-party/licenses/npm/mjolnir.js/3.1.1/LICENSE.txt) · SHA-256 `f8493f7af651a9f241f8476e6c6f1d2b43a51343dc0a08d33cb908bf3c81a0b0`

````text
MIT License

Copyright (c) 2017 Uber Technologies, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### mkdirp-classic (0.5.3)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `29bcb44df9b5cc4a5b4c3f44f16ec48c53389d2f3892c95c779e31a980075246`
- **Notice**: [`third-party/licenses/npm/mkdirp-classic/0.5.3/LICENSE.txt`](third-party/licenses/npm/mkdirp-classic/0.5.3/LICENSE.txt) · SHA-256 `a255b85c1a510ecfe660c4d442ecdbc1e9d07f4b4d3d7f90443f7e5570591e0a`

````text
The MIT License (MIT)

Copyright (c) 2020 James Halliday (mail@substack.net) and Mathias Buus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### murmurhash-js (1.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `0807f0738886929c36e3274e6bf0721efe9ba81d6edbe5ad9ec11ab5cb8ecc12`
- **Notice**: [`third-party/licenses/npm/murmurhash-js/1.0.0/package.json`](third-party/licenses/npm/murmurhash-js/1.0.0/package.json) · SHA-256 `e4b3531abcc7da48f732a058112686b44af66004c38d98a8014619542e767cb4`

````text
{
  "name": "murmurhash-js",
  "version": "1.0.0",
  "description": "Native JS murmur hash implementation",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/mikolalysenko/murmurhash-js.git"
  },
  "keywords": [
    "murmur",
    "hash",
    "string",
    "murmur2",
    "murmur3",
    "fast"
  ],
  "author": "Gary Court",
  "license": "MIT",
  "readmeFilename": "README.md",
  "gitHead": "72aabce3f52cb8f16245692a69fd35951e165af0",
  "bugs": {
    "url": "https://github.com/mikolalysenko/murmurhash-js/issues"
  }
}
````

#### napi-build-utils (2.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `a597633b66d0406c4ddfcdcd4eb3fa33aa89cb97f9c46fb52aa13ae889046a9e`
- **Notice**: [`third-party/licenses/npm/napi-build-utils/2.0.0/LICENSE.txt`](third-party/licenses/npm/napi-build-utils/2.0.0/LICENSE.txt) · SHA-256 `9c6a91d2847bd9bfd493c1ca87b9c3f96302cfd069667e6dd4a6278e69a33a31`

````text
MIT License

Copyright (c) 2018 inspiredware

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### node-abi (3.98.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `11c719ec8e33e8ad032a43e5dbee2c904332ef31dac7d7b917792534d6583765`
- **Notice**: [`third-party/licenses/npm/node-abi/3.98.0/LICENSE.txt`](third-party/licenses/npm/node-abi/3.98.0/LICENSE.txt) · SHA-256 `9a508cd4122f2dc1cc39f8ab0b6950efbc49fb087a581c7177a4b8c9d5d0d6a1`

````text
MIT License

Copyright (c) 2016 Lukas Geiger

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### on-exit-leak-free (2.1.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `1ed10cfc6a8a8807b1c7b7eae520dbd15a104d5d0256202f8b08e1ec56cda1a8`
- **Notice**: [`third-party/licenses/npm/on-exit-leak-free/2.1.2/LICENSE.txt`](third-party/licenses/npm/on-exit-leak-free/2.1.2/LICENSE.txt) · SHA-256 `47404ffc18f1267832bc0623857871de5a3a93ebb19693f5e1b963af91fab54b`

````text
MIT License

Copyright (c) 2021 Matteo Collina

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### once (1.4.0)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `cf51460ba370c698f68b976e514d113497339ba018b6003e8e8eb569c6fccfcf`
- **Notice**: [`third-party/licenses/npm/once/1.4.0/LICENSE.txt`](third-party/licenses/npm/once/1.4.0/LICENSE.txt) · SHA-256 `4ec3d4c66cd87f5c8d8ad911b10f99bf27cb00cdfcff82621956e379186b016b`

````text
The ISC License

Copyright (c) Isaac Z. Schlueter and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
````

#### pako (1.0.11)
- **Declared License**: `(MIT AND Zlib)`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `0d4028dc0352a740c30cbfd772917f2744986d42bfa0b06ec7642bffe7ad3941`
- **Notice**: [`third-party/licenses/npm/pako/1.0.11/LICENSE.txt`](third-party/licenses/npm/pako/1.0.11/LICENSE.txt) · SHA-256 `a04665b3b2de56c66730c1f720f528175739e4104f79073614aa611da1e85539`

````text
(The MIT License)

Copyright (C) 2014-2017 by Vitaly Puzrin and Andrei Tuputcyn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### parse-headers (2.0.6)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `baf17b489c3b1c5c05b21a1299db0cbf09b5b0ff294891f3245c4ac00db55528`
- **Notice**: [`third-party/licenses/npm/parse-headers/2.0.6/LICENSE.txt`](third-party/licenses/npm/parse-headers/2.0.6/LICENSE.txt) · SHA-256 `b1c5db90de223cc6ca40bab4ade764220f86c5b0335f56f1ab3baa6e62fe18bd`

````text
Copyright (c) 2014 David Björklund

This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### path-expression-matcher (1.6.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `a501b52ebf8236b2264e98b23000ca67e30d0d6cbb2815a041e8b2c0e3818a36`
- **Notice**: [`third-party/licenses/npm/path-expression-matcher/1.6.2/LICENSE.txt`](third-party/licenses/npm/path-expression-matcher/1.6.2/LICENSE.txt) · SHA-256 `75486ea0af9309140ca6e2c401d7e67bea8f4892344e5707f6394dc5e83dfc44`

````text
MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### pbf (5.1.2)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `3b3dc3c096a3a264ae68722d1e380893d89d56161093f8e90b1910020fbdb5d7`
- **Notice**: [`third-party/licenses/npm/pbf/5.1.2/LICENSE.txt`](third-party/licenses/npm/pbf/5.1.2/LICENSE.txt) · SHA-256 `fdf1d5279107d760c7df8c6edab1faab2b72ba17528273a8b417b08f1e12ebbe`

````text
Copyright (c) 2026, Mapbox
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of pbf nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### pino (10.4.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `f745d3dee0bddd39f11226335ee6dbbe3d49cc037168f2b31a8cdbe78f0e6216`
- **Notice**: [`third-party/licenses/npm/pino/10.4.0/LICENSE.txt`](third-party/licenses/npm/pino/10.4.0/LICENSE.txt) · SHA-256 `03ebd87bfc3fde763e4d698939097903a202163f3365d92d2031a4e63e0c5487`

````text
The MIT License (MIT)

Copyright (c) 2016-present Matteo Collina, David Mark Clements and the Pino contributors listed at <https://github.com/pinojs/pino#the-team> and in the README file.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### pino-abstract-transport (3.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `c02acefdad584490119ebd0ce2cdf29dead64971082a7ea74c28d92eef5a3c6a`
- **Notice**: [`third-party/licenses/npm/pino-abstract-transport/3.0.0/LICENSE.txt`](third-party/licenses/npm/pino-abstract-transport/3.0.0/LICENSE.txt) · SHA-256 `31f005ecff86a12a1351f4c2cb1133267c0b152546b08cd6fa4bdeb1943e00cd`

````text
MIT License

Copyright (c) 2021 pino

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### pino-std-serializers (7.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `c8ee1578a9fd84a929924515d7572eaeb4a3944d38953eaf8eb3dbd165020763`
- **Notice**: [`third-party/licenses/npm/pino-std-serializers/7.1.0/LICENSE.txt`](third-party/licenses/npm/pino-std-serializers/7.1.0/LICENSE.txt) · SHA-256 `6206673d24786f09656f7a480b7c50af289e9690963aaa135af5b626de5250df`

````text
Copyright Mateo Collina, David Mark Clements, James Sumners

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### pmtiles (4.5.0)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `23ae7c575578ad24cd579377d69c46550631da219e6f179997ec2cf3b8c937e5`
- **Notice**: [`third-party/licenses/npm/pmtiles/4.5.0/package.json`](third-party/licenses/npm/pmtiles/4.5.0/package.json) · SHA-256 `5c1f63156b0f76dcda943273176ebbd77ebef73b138602c53ddba22e06c708e4`

````text
{
  "name": "pmtiles",
  "version": "4.5.0",
  "description": "PMTiles archive decoder for browsers",
  "type": "module",
  "main": "dist/cjs/index.cjs",
  "module": "dist/esm/index.js",
  "types": "dist/esm/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "import": {
        "types": "./dist/esm/index.d.ts",
        "default": "./dist/esm/index.js"
      },
      "require": {
        "types": "./dist/cjs/index.d.cts",
        "default": "./dist/cjs/index.cjs"
      }
    }
  },
  "source": "index.ts",
  "files": [
    "dist",
    "src"
  ],
  "scripts": {
    "build": "tsup",
    "test": "tsx test/index.test.ts",
    "tsc": "tsc --noEmit --watch",
    "biome": "biome check src test --apply",
    "biome-check": "biome check src test"
  },
  "homepage": "https://github.com/protomaps/pmtiles",
  "author": "Brandon Liu",
  "license": "BSD-3-Clause",
  "devDependencies": {
    "@biomejs/biome": "^1.5.3",
    "@types/leaflet": "^1.9.8",
    "@types/node": "^20.19.26",
    "msw": "^2.5.0",
    "tsup": "^8.4.0",
    "tsx": "^4.19.3",
    "typedoc": "^0.25.7",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "fflate": "^0.8.2"
  }
}
````

#### pmtiles/node_modules/fflate (0.8.3)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `38c2cd824402407b43153c782274aec2ea83ea688e4aa0b743c5f2c305857d92`
- **Notice**: [`third-party/licenses/npm/pmtiles/node_modules/fflate/0.8.3/LICENSE.txt`](third-party/licenses/npm/pmtiles/node_modules/fflate/0.8.3/LICENSE.txt) · SHA-256 `0a1df3a083d0c010560aa342e87959c8c1070e6fd54545741f083f22d0c8b551`

````text
MIT License

Copyright (c) 2026 Arjun Barrett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### potpack (2.1.0)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `dac2dd4009e2fad0862b723423c8333162e8a6f4d87604af1de23fdec490587c`
- **Notice**: [`third-party/licenses/npm/potpack/2.1.0/LICENSE.txt`](third-party/licenses/npm/potpack/2.1.0/LICENSE.txt) · SHA-256 `cfec0482fb785fe27e3b368a2d9e84bf7a61b275e83ec582bf288e98cd530bb0`

````text
ISC License

Copyright (c) 2025, Mapbox

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
````

#### prebuild-install (7.1.3)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `6741b8ecf3c24c0a652748ca362560405b38797c760ccff531ab61f14930f9ab`
- **Notice**: [`third-party/licenses/npm/prebuild-install/7.1.3/LICENSE.txt`](third-party/licenses/npm/prebuild-install/7.1.3/LICENSE.txt) · SHA-256 `0aa9add6a9158efad3e6649e3affd607c7e2629f6677af19f9988c8fbb0757b0`

````text
The MIT License (MIT)

Copyright (c) 2015 Mathias Buus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### process-nextick-args (2.0.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `425bf8c725d23bc5ac76bcedd10d9cdbbd6354c7273dd7def44417cfbca8889b`
- **Notice**: [`third-party/licenses/npm/process-nextick-args/2.0.1/LICENSE.txt`](third-party/licenses/npm/process-nextick-args/2.0.1/LICENSE.txt) · SHA-256 `ecdccbcf39024f624ded480c01c0b25458e1eca8f26ecf040933865ce56d9a4f`

````text
# Copyright (c) 2015 Calvin Metcalf

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

**THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.**
````

#### process-warning (5.1.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `4d28948634e8d9bda20d268057490ce1d2b63807407974166bee8c11d8d7e04b`
- **Notice**: [`third-party/licenses/npm/process-warning/5.1.1/LICENSE.txt`](third-party/licenses/npm/process-warning/5.1.1/LICENSE.txt) · SHA-256 `8d3c1dd501e056405ab56f4ad87b987070d55d1fe814616584ec2360045f9017`

````text
MIT License

Copyright (c) 2020-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### proj4 (2.22.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `7192ce47111f28ae8c47a39b583ea419202fbc216fe6303117cb1567b42e52d7`
- **Notice**: [`third-party/licenses/npm/proj4/2.22.0/LICENSE.txt`](third-party/licenses/npm/proj4/2.22.0/LICENSE.txt) · SHA-256 `d514fd8b286fc00a5c97a29f8a99b73f1a4053bbdd00c400aee5f24a1b6b301e`

````text
## Proj4js -- Javascript reprojection library. 
 
Authors:
- Mike Adair madairATdmsolutions.ca
- Richard Greenwood richATgreenwoodmap.com
- Didier Richard didier.richardATign.fr
- Stephen Irons stephen.ironsATclear.net.nz
- Olivier Terral oterralATgmail.com
- Calvin Metcalf cmetcalfATappgeo.com

Copyright (c) 2014, Mike Adair, Richard Greenwood, Didier Richard, Stephen Irons, Olivier Terral and Calvin Metcalf

 Permission is hereby granted, free of charge, to any person obtaining a
 copy of this software and associated documentation files (the "Software"),
 to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense,
 and/or sell copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included
 in all copies or substantial portions of the Software.

 _THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 DEALINGS IN THE SOFTWARE._
````

#### property-graph (4.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `da552eabda86428786ac758b50e84daf1ba34c8f7b2516e15ea3467276a8b7c6`
- **Notice**: [`third-party/licenses/npm/property-graph/4.1.0/LICENSE.txt`](third-party/licenses/npm/property-graph/4.1.0/LICENSE.txt) · SHA-256 `ec5114155d92f326802c964dcf9eb5261e09192c62f14d195d2a8be49eb1d489`

````text
The MIT License (MIT)

Copyright (c) 2021 Don McCurdy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### protocol-buffers-schema (3.6.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `907f8fd7d60cc2a96875b128e161b0013bdef8c2523012d3041a0f72f20de852`
- **Notice**: [`third-party/licenses/npm/protocol-buffers-schema/3.6.1/LICENSE.txt`](third-party/licenses/npm/protocol-buffers-schema/3.6.1/LICENSE.txt) · SHA-256 `3fe8d55a98dbf260eace67c00cf9bc53edb46234e840098a0b93df3096b97fb6`

````text
The MIT License (MIT)

Copyright (c) 2014 Mathias Buus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### pump (3.0.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `3c58c7fc4c30035cdabb0b33e81d8e048935e134469491767cbaf89bd64c9b36`
- **Notice**: [`third-party/licenses/npm/pump/3.0.4/LICENSE.txt`](third-party/licenses/npm/pump/3.0.4/LICENSE.txt) · SHA-256 `3fe8d55a98dbf260eace67c00cf9bc53edb46234e840098a0b93df3096b97fb6`

````text
The MIT License (MIT)

Copyright (c) 2014 Mathias Buus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### quick-format-unescaped (4.0.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `acba54ec5587ffddfb0811b693aad4844366772f01511291302d3380d431a485`
- **Notice**: [`third-party/licenses/npm/quick-format-unescaped/4.0.4/LICENSE.txt`](third-party/licenses/npm/quick-format-unescaped/4.0.4/LICENSE.txt) · SHA-256 `5ac141bfc70bec8f40838502436bfcb85e3f4c24377e41b9ddef07bdd6aa51bc`

````text
The MIT License (MIT)

Copyright (c) 2016-2019 David Mark Clements

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### quick-lru (6.1.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `bc8de1866874dbbbe5efcdc41d7c8fe762658b80155bbe6671637ddb8ef08563`
- **Notice**: [`third-party/licenses/npm/quick-lru/6.1.2/LICENSE.txt`](third-party/licenses/npm/quick-lru/6.1.2/LICENSE.txt) · SHA-256 `5c932d88256b4ab958f64a856fa48e8bd1f55bc1d96b8149c65689e0c61789d3`

````text
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### quickselect (3.0.0)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `2cf90a3c6f9eb7ccb618bc31e362a615f9f46de593b8465176d883e66b5f8c84`
- **Notice**: [`third-party/licenses/npm/quickselect/3.0.0/LICENSE.txt`](third-party/licenses/npm/quickselect/3.0.0/LICENSE.txt) · SHA-256 `238ddb00e12a420a54e060afa19bdab4f70bf49e0e2a8ebb1a5e851f9ef447df`

````text
ISC License

Copyright (c) 2024, Vladimir Agafonkin

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
````

#### rc (1.2.8)
- **Declared License**: `(BSD-2-Clause OR MIT OR Apache-2.0)`
- **Scope**: `runtime`
- **Election**: **BSD-2-Clause** (upstream: `BSD-2-Clause OR MIT OR Apache-2.0`)
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `03a5fae485203eb424dd3e9b1c4cf9ce3d04c03b154cb4fb6604497815cae93b`
- **Notice**: [`third-party/licenses/npm/rc/1.2.8/package.json`](third-party/licenses/npm/rc/1.2.8/package.json) · SHA-256 `96f035349a8e6034d380348ec3d454ed8ea3a602c7a5700eb36ff48310bdbe9f`

````text
{
  "name": "rc",
  "version": "1.2.8",
  "description": "hardwired configuration loader",
  "main": "index.js",
  "browser": "browser.js",
  "scripts": {
    "test": "set -e; node test/test.js; node test/ini.js; node test/nested-env-vars.js"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/dominictarr/rc.git"
  },
  "license": "(BSD-2-Clause OR MIT OR Apache-2.0)",
  "keywords": [
    "config",
    "rc",
    "unix",
    "defaults"
  ],
  "bin": "./cli.js",
  "author": "Dominic Tarr <dominic.tarr@gmail.com> (dominictarr.com)",
  "dependencies": {
    "deep-extend": "^0.6.0",
    "ini": "~1.3.0",
    "minimist": "^1.2.0",
    "strip-json-comments": "~2.0.1"
  }
}
````

#### readable-stream (2.3.8)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `1648613948f68ac9cbbe8f72a3f93a67ecdb862ffb57946a2c0bbb5a1479a532`
- **Notice**: [`third-party/licenses/npm/readable-stream/2.3.8/LICENSE.txt`](third-party/licenses/npm/readable-stream/2.3.8/LICENSE.txt) · SHA-256 `ec62dc96da0099b87f4511736c87309335527fb7031639493e06c95728dc8c54`

````text
Node.js is licensed for use as follows:

"""
Copyright Node.js contributors. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
"""

This license applies to parts of Node.js originating from the
https://github.com/joyent/node repository:

"""
Copyright Joyent, Inc. and other Node contributors. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
"""
````

#### real-require (1.0.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `7a12c339665133f4ae2a2f447dfe1521c9969ede6c80dd09e781f600a2da3763`
- **Notice**: [`third-party/licenses/npm/real-require/1.0.0/LICENSE.txt`](third-party/licenses/npm/real-require/1.0.0/LICENSE.txt) · SHA-256 `cbf263504e800cf09f99962cce8497b76eef79c3526bca434b90c3ef4c17220d`

````text
The MIT License (MIT)

Copyright (c) 2021 Paolo Insogna and the real-require contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### require-from-string (2.0.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `cb694a4965908f7775a0c757f00cf4e624d193cd71d77988fbcca0f597b88d82`
- **Notice**: [`third-party/licenses/npm/require-from-string/2.0.2/LICENSE.txt`](third-party/licenses/npm/require-from-string/2.0.2/LICENSE.txt) · SHA-256 `6ee0feb1f6ef996ff5a68600f8cf98909cf412d39ef3cdceaefd87d636fa1b7f`

````text
The MIT License (MIT)

Copyright (c) Vsevolod Strukchinsky <floatdrop@gmail.com> (github.com/floatdrop)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### resolve-protobuf-schema (2.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `3e80010114da31a6f2a09345c62b7b9d67640d816df0f5099cecdeb9342517c5`
- **Notice**: [`third-party/licenses/npm/resolve-protobuf-schema/2.1.0/LICENSE.txt`](third-party/licenses/npm/resolve-protobuf-schema/2.1.0/LICENSE.txt) · SHA-256 `c0993ca46cd47c09710a977d3a3d51602cff96f19e8d2eb8d5887aa20a7beead`

````text
The MIT License (MIT)

Copyright (c) 2014 Mathias Buus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### ret (0.5.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `4a990f0113ddcbc04d77b279730659ccfe5e5d700d014fc584bb09a9f50dff61`
- **Notice**: [`third-party/licenses/npm/ret/0.5.0/LICENSE.txt`](third-party/licenses/npm/ret/0.5.0/LICENSE.txt) · SHA-256 `bfc2c678db20d806b3787956f607a1509da5fca45b4d40a97c671cbee737159d`

````text
MIT License

Copyright (C) 2011 by fent

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### reusify (1.1.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `2460004412100eea8e96b98f14d3dfb4e22a6628654e5431d14f974c6201ca18`
- **Notice**: [`third-party/licenses/npm/reusify/1.1.0/LICENSE.txt`](third-party/licenses/npm/reusify/1.1.0/LICENSE.txt) · SHA-256 `93a1506953b08ad4874e1cc0971a1d2ac387ca510da91e4d05e460a6c4966fa3`

````text
The MIT License (MIT)

Copyright (c) 2015-2024 Matteo Collina

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### rfdc (1.4.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `559af1871d927b198ddfa472da35839ba31b01fdf4645206aae279cab91d566a`
- **Notice**: [`third-party/licenses/npm/rfdc/1.4.1/LICENSE.txt`](third-party/licenses/npm/rfdc/1.4.1/LICENSE.txt) · SHA-256 `1ce941682a96c7b898ecd125d0f2e22319758ea6f3adbf498a65d649b0f3f7dd`

````text
Copyright 2019 "David Mark Clements <david.mark.clements@gmail.com>"

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and 
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions 
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
IN THE SOFTWARE.
````

#### safe-buffer (5.1.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `e09206c60fccafb952c854af7629cbb031a98d6da2e143fb3aa3c8a48402aa22`
- **Notice**: [`third-party/licenses/npm/safe-buffer/5.1.2/LICENSE.txt`](third-party/licenses/npm/safe-buffer/5.1.2/LICENSE.txt) · SHA-256 `c7cc929b57080f4b9d0c6cf57669f0463fc5b39906344dfc8d3bc43426b30eac`

````text
The MIT License (MIT)

Copyright (c) Feross Aboukhadijeh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### safe-regex2 (5.1.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `e102fe1f7a3389fc124862eed458fa49decab642ee208c6d24115f45a78619de`
- **Notice**: [`third-party/licenses/npm/safe-regex2/5.1.2/LICENSE.txt`](third-party/licenses/npm/safe-regex2/5.1.2/LICENSE.txt) · SHA-256 `3871c31d0cc373951d836b8bb97275a2227f8af7464df7c51bc3f98769b87653`

````text
MIT License

Copyright (c) 2019-present The Fastify team <https://github.com/fastify/fastify#team>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### safe-stable-stringify (2.5.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `acf5b4e0f8e5f0bfd9479eae41a6dd90e175d89eecd98fe1c834eab602073e91`
- **Notice**: [`third-party/licenses/npm/safe-stable-stringify/2.5.0/LICENSE.txt`](third-party/licenses/npm/safe-stable-stringify/2.5.0/LICENSE.txt) · SHA-256 `3a6d6de49d284a36c5d271ef0e62eca1838cc460dd7630e3f2c347c8f5b2232a`

````text
The MIT License (MIT)

Copyright (c) Ruben Bridgewater

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### secure-json-parse (4.1.1)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `35022a4c0b31a2d423f36b36462a2a394d55b12d85fcb6b129b20612abcb10c0`
- **Notice**: [`third-party/licenses/npm/secure-json-parse/4.1.1/LICENSE.txt`](third-party/licenses/npm/secure-json-parse/4.1.1/LICENSE.txt) · SHA-256 `354dacd69de5070d69b2e4c5598bd1f51d980775422c3ee663160f9da88ebf63`

````text
Copyright (c) 2019, Sideway Inc, and project contributors
Copyright (c) 2019-present The Fastify team <https://github.com/fastify/fastify#team>
All rights reserved.

The complete list of contributors can be found at:
- https://github.com/hapijs/bourne/graphs/contributors
- https://github.com/fastify/secure-json-parse/graphs/contributors

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### semver (7.8.5)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d85045d4300d7d57c891336b95df532e73f34c22ffcd222452b6d08b9d127d5d`
- **Notice**: [`third-party/licenses/npm/semver/7.8.5/LICENSE.txt`](third-party/licenses/npm/semver/7.8.5/LICENSE.txt) · SHA-256 `4ec3d4c66cd87f5c8d8ad911b10f99bf27cb00cdfcff82621956e379186b016b`

````text
The ISC License

Copyright (c) Isaac Z. Schlueter and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
````

#### set-cookie-parser (3.1.3)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `eb53aeb151617ccca70c2d1f79327eb01ac969b487f8ce381b0192c63e4f24d6`
- **Notice**: [`third-party/licenses/npm/set-cookie-parser/3.1.3/LICENSE.txt`](third-party/licenses/npm/set-cookie-parser/3.1.3/LICENSE.txt) · SHA-256 `c5c6c5183a789d122f267c405f685037efb87e27fcde28ab1dd7378a2d2f5962`

````text
The MIT License (MIT)

Copyright (c) 2015 Nathan Friedly <nathan@nfriedly.com> (http://nfriedly.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### setimmediate (1.0.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `5cb9fc22698364ed42c02d6aa3dc50ffeafa68452ae84699672e3dfd74922c9e`
- **Notice**: [`third-party/licenses/npm/setimmediate/1.0.5/LICENSE.txt`](third-party/licenses/npm/setimmediate/1.0.5/LICENSE.txt) · SHA-256 `c4b4ad3a5746f1f5249a6dd90396ec519264e1bb02e01e48a6522c48a3a97cb4`

````text
Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### simple-concat (1.0.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `6afccb749cab9f33158ad30a51797a8e7e7b4cc7e09151d5537c6dcd8882763e`
- **Notice**: [`third-party/licenses/npm/simple-concat/1.0.1/LICENSE.txt`](third-party/licenses/npm/simple-concat/1.0.1/LICENSE.txt) · SHA-256 `d4c2065e2b936e62a4eb400efb4576edec9ca1388a9f78aa288e147275e7bc8b`

````text
The MIT License (MIT)

Copyright (c) Feross Aboukhadijeh

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### simple-get (4.0.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `f902a1ee61bb7c404b631914833ddcd480dfc20350b275a7e72d45c589459754`
- **Notice**: [`third-party/licenses/npm/simple-get/4.0.1/LICENSE.txt`](third-party/licenses/npm/simple-get/4.0.1/LICENSE.txt) · SHA-256 `d4c2065e2b936e62a4eb400efb4576edec9ca1388a9f78aa288e147275e7bc8b`

````text
The MIT License (MIT)

Copyright (c) Feross Aboukhadijeh

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
````

#### snappyjs (0.6.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `caae0b60a6d320115deed7d2b13e5aa8bfcbb67ef531eed75ab9772cd3c230f5`
- **Notice**: [`third-party/licenses/npm/snappyjs/0.6.1/LICENSE.txt`](third-party/licenses/npm/snappyjs/0.6.1/LICENSE.txt) · SHA-256 `46964f47c4b0a572739d12620f0acc456618f9d81ed9678e05994998946b31a9`

````text
The MIT License (MIT)

Copyright (c) 2016 Zhipeng Jia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### sonic-boom (4.2.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `bf128eca0c2a2ed9eb9f598a69eb374df08f3886dd9c506c5129935487166b87`
- **Notice**: [`third-party/licenses/npm/sonic-boom/4.2.1/LICENSE.txt`](third-party/licenses/npm/sonic-boom/4.2.1/LICENSE.txt) · SHA-256 `db5c3795cb080810fed0380bf4d6adef3f81579e8ae3a867d3c2abab2329db9d`

````text
MIT License

Copyright (c) 2017 Matteo Collina

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### split2 (4.2.0)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `e0061e7f042fc5ff6dcda8afb66619757d92ab1ff514a28a5904f2ebde27bf54`
- **Notice**: [`third-party/licenses/npm/split2/4.2.0/LICENSE.txt`](third-party/licenses/npm/split2/4.2.0/LICENSE.txt) · SHA-256 `c372ef2fa1dfcb124ed807609751e75e3a009f108c5724916b489288fcb88a0c`

````text
Copyright (c) 2014-2018, Matteo Collina <hello@matteocollina.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
````

#### sprintf-js (1.0.3)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `3afb26bcc328dc90f516515acf2783ad35b08dbfe9e0ada18264c3c4ddaa1a83`
- **Notice**: [`third-party/licenses/npm/sprintf-js/1.0.3/LICENSE.txt`](third-party/licenses/npm/sprintf-js/1.0.3/LICENSE.txt) · SHA-256 `a4cdda44b5adea4731d53dcae78fb5124f8fd853e994f01e25d8c33a7daf818b`

````text
Copyright (c) 2007-2014, Alexandru Marasteanu <hello [at) alexei (dot] ro>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
* Redistributions of source code must retain the above copyright
  notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright
  notice, this list of conditions and the following disclaimer in the
  documentation and/or other materials provided with the distribution.
* Neither the name of this software nor the names of its contributors may be
  used to endorse or promote products derived from this software without
  specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### string_decoder (1.1.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `af8262434508fa8292407f7fef4690d19eabb73387ca230b41f2a1155216963a`
- **Notice**: [`third-party/licenses/npm/string_decoder/1.1.1/LICENSE.txt`](third-party/licenses/npm/string_decoder/1.1.1/LICENSE.txt) · SHA-256 `11f2aafb37d06b3ee5bdaf06e9811141d0da05263c316f3d627f45c20d43261b`

````text
Node.js is licensed for use as follows:

"""
Copyright Node.js contributors. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
"""

This license applies to parts of Node.js originating from the
https://github.com/joyent/node repository:

"""
Copyright Joyent, Inc. and other Node contributors. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
"""
````

#### strip-json-comments (2.0.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `dbe45febaf1bf7265c25733242bc0e7ac38b632db6a8e19f0341af4770425899`
- **Notice**: [`third-party/licenses/npm/strip-json-comments/2.0.1/LICENSE.txt`](third-party/licenses/npm/strip-json-comments/2.0.1/LICENSE.txt) · SHA-256 `6fb9754611c20f6649f68805e8c990e83261f29316e29de9e6cedae607b8634c`

````text
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### strnum (2.5.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `ced67dded4b9d8122292bc5f41e0c5e65fee378c4fb902e3680790abcb1b90bd`
- **Notice**: [`third-party/licenses/npm/strnum/2.5.1/LICENSE.txt`](third-party/licenses/npm/strnum/2.5.1/LICENSE.txt) · SHA-256 `2aa16be0f4fad003a352a955a43314e9d1d8deef7034060a82ac9c49f32b81e2`

````text
MIT License

Copyright (c) 2021 Natural Intelligence

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### tar-fs (2.1.5)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `ad3283c3f1f444bbe1b8d807373b682bebf0e145893cca164bb3b6a27135e5e0`
- **Notice**: [`third-party/licenses/npm/tar-fs/2.1.5/LICENSE.txt`](third-party/licenses/npm/tar-fs/2.1.5/LICENSE.txt) · SHA-256 `3fe8d55a98dbf260eace67c00cf9bc53edb46234e840098a0b93df3096b97fb6`

````text
The MIT License (MIT)

Copyright (c) 2014 Mathias Buus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### tar-stream (2.2.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `3a8f83dfd74e9b401ba679e18d7917830c04deed3e2346e9fbca17fab4a1395b`
- **Notice**: [`third-party/licenses/npm/tar-stream/2.2.0/LICENSE.txt`](third-party/licenses/npm/tar-stream/2.2.0/LICENSE.txt) · SHA-256 `3fe8d55a98dbf260eace67c00cf9bc53edb46234e840098a0b93df3096b97fb6`

````text
The MIT License (MIT)

Copyright (c) 2014 Mathias Buus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
````

#### tar-stream/node_modules/readable-stream (3.6.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `edd866c05e318aa9c091763eebdd4207409b7a7648be19c5317a96047305ab5d`
- **Notice**: [`third-party/licenses/npm/tar-stream/node_modules/readable-stream/3.6.2/LICENSE.txt`](third-party/licenses/npm/tar-stream/node_modules/readable-stream/3.6.2/LICENSE.txt) · SHA-256 `ec62dc96da0099b87f4511736c87309335527fb7031639493e06c95728dc8c54`

````text
Node.js is licensed for use as follows:

"""
Copyright Node.js contributors. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
"""

This license applies to parts of Node.js originating from the
https://github.com/joyent/node repository:

"""
Copyright Joyent, Inc. and other Node contributors. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
"""
````

#### texture-compressor (1.0.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `9c871e064f568442c7f4cc54d9e583ceff3e409e990fc2c8fedb15ad8ca0e72f`
- **Notice**: [`third-party/licenses/npm/texture-compressor/1.0.2/LICENSE.txt`](third-party/licenses/npm/texture-compressor/1.0.2/LICENSE.txt) · SHA-256 `0969fa65680b694452c2c65981df14af5c192da24f2b1f87bdd51d8ed24efcfa`
- **Notice**: [`third-party/licenses/npm/texture-compressor/1.0.2/LICENSE-astcenc.txt`](third-party/licenses/npm/texture-compressor/1.0.2/LICENSE-astcenc.txt) · SHA-256 `565412eb7838fcad0da201a4b4b7b823791dd8ba6bd66ebb3a3d9fc78139f986`
- **Notice**: [`third-party/licenses/npm/texture-compressor/1.0.2/LICENSE-crunch.txt`](third-party/licenses/npm/texture-compressor/1.0.2/LICENSE-crunch.txt) · SHA-256 `ad55612d70772c3b01b62add44d8a39af3d0914ea3246667a88df1de99c08b87`
- **Notice**: [`third-party/licenses/npm/texture-compressor/1.0.2/LICENSE-PVRTexToolCLI.txt`](third-party/licenses/npm/texture-compressor/1.0.2/LICENSE-PVRTexToolCLI.txt) · SHA-256 `a428a4a9b6c73387c6d4c22b5abeba44c45351c058182092ad01499c2a315013`

````text
MIT License

Copyright (c) 2019 Tim van Scherpenzeel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

````text
END USER LICENCE AGREEMENT FOR THE MALI ASTC SPECIFICATION AND SOFTWARE CODEC,
VERSION: 1.3

THIS END USER LICENCE AGREEMENT ("LICENCE") IS A LEGAL AGREEMENT BETWEEN YOU
(EITHER A SINGLE INDIVIDUAL, OR SINGLE LEGAL ENTITY) AND ARM LIMITED ("ARM")
FOR THE USE OF THE SOFTWARE ACCOMPANYING THIS LICENCE. ARM IS ONLY WILLING
TO LICENSE THE SOFTWARE TO YOU ON CONDITION THAT YOU ACCEPT ALL OF THE TERMS
IN THIS LICENCE. BY CLICKING "I AGREE" OR BY INSTALLING OR OTHERWISE USING
OR COPYING THE SOFTWARE YOU INDICATE THAT YOU AGREE TO BE BOUND BY ALL THE
TERMS OF THIS LICENCE.

IF YOU DO NOT AGREE TO THE TERMS OF THIS LICENCE, ARM IS UNWILLING TO LICENSE
THE SOFTWARE TO YOU AND YOU MAY NOT INSTALL, USE OR COPY THE SOFTWARE.

1.  DEFINITIONS.

"Authorised Purpose" means the use of the Software solely to develop products
and tools which implement the Khronos ASTC specification to;
(i) compress texture images into ASTC format ("Compression Results"); 
(ii) distribute such Compression Results to third parties; and 
(iii) decompress texture images stored in ASTC format.

"Software" means the source code and Software binaries accompanying this
Licence, and any printed, electronic or online documentation supplied with it,
in all cases relating to the MALI ASTC SPECIFICATION AND SOFTWARE CODEC.

2. LICENCE GRANT.

ARM hereby grants to you, subject to the terms and conditions of this Licence,
a nonexclusive, nontransferable, free of charge, royalty free, worldwide
licence to use, copy, modify and (subject to Clause 3 below) distribute the
Software solely for the Authorised Purpose.

No right is granted to use the Software to develop hardware.

Notwithstanding the foregoing, nothing in this Licence prevents you from
using the Software to develop products that conform to an application
programming interface specification issued by The Khronos Group Inc.
("Khronos"), provided that you have licences to develop such products
under the relevant Khronos agreements.

 3. RESTRICTIONS ON USE OF THE SOFTWARE.

RESTRICTIONS ON TRANSFER OF LICENSED RIGHTS: The rights granted to you under
this Licence may not be assigned by you to any third party without the prior
written consent of ARM.

TITLE AND RESERVATION OF RIGHTS: You acquire no rights to the Software other
than as expressly provided by this Licence. The Software is licensed not sold.
ARM does not transfer title to the Software to you. In no event shall the
licences granted in Clause 2 be construed as granting you expressly or by
implication, estoppel or otherwise, licences to any ARM technology other than
the Software.

NOTICES: You shall not remove from the Software any copyright notice or other
notice (whether ARM's or its licensor's), and you shall ensure that any such
notice is reproduced in any copies of the whole or any part of the Software
made by you.  You shall not use ARM's or its licensor's name, logo or
trademarks to market Compression Results. If you distribute the Software to a
third party, you agree to include a copy of this Licence with such
distribution.

4. NO SUPPORT.

ARM has no obligation to support or to continue providing or updating any of
the Software.

5. NO WARRANTIES.

YOU AGREE THAT THE SOFTWARE IS LICENSED "AS IS", AND THAT ARM EXPRESSLY
DISCLAIMS ALL REPRESENTATIONS, WARRANTIES, CONDITIONS OR OTHER TERMS, EXPRESS,
IMPLIED OR STATUTORY, TO THE FULLEST EXTENT PERMITTED BY LAW. YOU EXPRESSLY
ASSUME ALL LIABILITIES AND RISKS, FOR USE OR OPERATION OF ANY APPLICATION
PROGRAMS YOU CREATE WITH THE SOFTWARE, AND YOU ASSUME THE ENTIRE COST OF ALL
NECESSARY SERVICING, REPAIR OR CORRECTION.

6. LIMITATION OF LIABILITY.

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ARM BE
LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES
(INCLUDING LOSS OF PROFITS) ARISING OUT OF THE USE OR INABILITY TO USE THE
SOFTWARE WHETHER BASED ON A CLAIM UNDER CONTRACT, TORT OR OTHER LEGAL THEORY,
EVEN IF ARM WAS ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

ARM does not seek to limit or exclude liability for death or personal injury
arising from ARM's negligence and because some jurisdictions do not permit the
exclusion or limitation of liability for consequential or incidental damages
the above limitation relating to liability for consequential damages may not
apply to you.

NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED IN THIS LICENCE, THE
MAXIMUM LIABILITY OF ARM TO YOU IN AGGREGATE FOR ALL CLAIMS MADE AGAINST ARM
IN CONTRACT TORT OR OTHERWISE UNDER OR IN CONNECTION WITH THE SUBJECT MATTER
OF THIS LICENCE SHALL NOT EXCEED THE GREATER OF THE TOTAL OF SUMS PAID BY YOU
TO ARM (IF ANY) FOR THIS LICENCE AND US$5.00.

7. U.S. GOVERNMENT END USERS.

US Government Restrictions: Use, duplication, reproduction, release,
modification, disclosure or transfer of this commercial product and
accompanying documentation is restricted in accordance with the terms
of this Licence.

8. TERM AND TERMINATION.

This Licence shall remain in force until terminated by you or by ARM. Without
prejudice to any of its other rights if you are in breach of any of the terms
and conditions of this Licence then ARM may terminate this Licence immediately
upon giving written notice to you. You may terminate this Licence at any time.

Upon termination of this Licence by you or by ARM you shall stop using the
Software and destroy all copies of the Software in your possession together
with all documentation and related materials. The provisions of Clauses 1, 3,
4, 5, 6, 7, 8 and 9  shall survive termination of this Licence.

9. GENERAL.

This Licence is governed by English Law. Except where ARM agrees otherwise in
a written contract signed by you and ARM, this is the only agreement between
you and ARM relating to the Software and it may only be modified by written
agreement between you and ARM. Except as expressly agreed in writing, this
Licence may not be modified by purchase orders, advertising or other
representation by any person. If any clause in this Licence is held by a court
of law to be illegal or unenforceable the remaining provisions of this Licence
shall not be affected thereby. The failure by ARM to enforce any of the
provisions of this Licence, unless waived in writing, shall not constitute a
waiver of ARM's rights to enforce such provision or any other provision of
this Licence in the future.

You agree to comply fully with all laws and regulations of the United States
and other countries ("Export Laws") to assure that the Software is not;
(1) exported, directly or indirectly, in violation of Export Laws, either to
any countries that are subject to U.S.A. export restrictions or to any end
user who has been prohibited from participating in the U.S.A. export
transactions by any federal agency of the U.S.A. government; or 
(2) intended to be used for any purpose prohibited by Export Laws, including,
without limitation, nuclear, chemical, or biological weapons proliferation.
````

````text
crunch/crnlib uses a modified ZLIB license. Specifically, it's the same as zlib except that 
public credits for using the library are *required*.

Copyright (c) 2010-2016 Richard Geldreich, Jr., Tenacious Software, and Binomial LLC

This software is provided 'as-is', without any express or implied
warranty.  In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not
claim that you wrote the original software. 

2. If you use this software in a product, this acknowledgment in the product 
documentation or credits is required:

"Crunch Library Copyright (c) 2010-2016 Richard Geldreich, Jr., Tenacious Software, and Binomial LLC"

3. Altered source versions must be plainly marked as such, and must not be
misrepresented as being the original software.

4. This notice may not be removed or altered from any source distribution.
````

````text
PLEASE READ THIS AGREEMENT CAREFULLY. BY USING ANY PORTION OF THE POWERVR TOOLS SOFTWARE YOU WILL BE LEGALLY BOUND TO THESE TERMS.
Imagination Technologies Limited (“Imagination”) provides this Software subject to the terms of this Agreement. If you do not agree with any of these terms, then do not install or otherwise use the Software.

Definitions
“Software” means all or any component comprising the software in source or binary form, documentation, or other materials including any related updates or upgrades made available by Imagination under this Agreement from time to time.

License Grant
Subject to your compliance with the terms of this Agreement, Imagination grants to you a non-exclusive, non-assignable license to:

(a)	use the Software for the sole purpose of developing, profiling, or assisting in the optimisation of internal, commercial, or non-commercial applications;

(b)	distribute the Software as a component of your application, provided that:

you do not distribute the Software on a stand alone basis;
you distribute such Software under terms no less restrictive than those in this Agreement;
you comply with the attribution requirements set out in Appendix 1;
you are solely responsible for any update, support obligation or other liability that may arise from such distribution; and
you do not make any statements that your application or its performance are certified, guaranteed or otherwise endorsed by Imagination; and
(c)	use the Software as expressly authorised by Imagination in writing, on the payment and/or support terms set out in Appendix 2 (if applicable).

Restrictions
Other than as expressly permitted herein, you may not: (i) use the Software for any unauthorised purpose; (ii) modify, disassemble, decompile, reverse engineer, revise or enhance the Software, create derivative works or attempt to discover the source code for any element of the Software not already provided in source code form; (iii) remove any proprietary or copyright notices on or accompanying the Software; or (iv) incorporate or combine the Software, with any open source software in such a way that would cause the Software, or any portion thereof, to be subject to all or part of the license obligations or other intellectual property related terms with respect to such open source software.

Ownership and Contributions
Imagination retains all ownership of the Software, including without limitation all copyrights and other intellectual property rights therein. To the extent you provide any feedback or make any contributions in connection with the Software (collectively “contributions”), you agree to assign all intellectual property rights in such contribution to Imagination and agree not to assert any related rights against Imagination or any of its customers or licensees. You understand and agree that Imagination is not required to make any use of any contribution that you provide, but that if Imagination makes use of your contribution, neither Imagination nor any of its customers or licensees are required to credit or compensate you for your contribution. You represent and warrant that you have sufficient rights in your contribution to comply with the foregoing.

Warranty Disclaimer
THE SOFTWARE IS PROVIDED “AS IS”. IMAGINATION HEREBY DISCLAIMS ALL EXPRESS OR IMPLIED WARRANTIES AND CONDITIONS WITH REGARD TO THE SOFTWARE, INCLUDING ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT.

Limitation of Liability
IN NO EVENT WILL IMAGINATION BE LIABLE TO YOU FOR ANY DAMAGES, CLAIMS OR COSTS WHATSOEVER ARISING FROM THIS AGREEMENT AND/OR YOUR USE OF THE SOFTWARE OR ANY COMPONENT THEREOF, INCLUDING WITHOUT LIMITATION ANY CONSEQUENTIAL, INDIRECT, INCIDENTAL DAMAGES, OR ANY LOST PROFITS OR LOST SAVINGS, EVEN IF IMAGINATION HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH LOSS, DAMAGES, CLAIMS OR COSTS OR FOR ANY CLAIM BY ANY THIRD PARTY. THE FOREGOING LIMITATIONS AND EXCLUSIONS APPLY TO THE EXTENT PERMITTED BY APPLICABLE LAW IN YOUR JURISDICTION.

Third Party Materials
All third party materials packaged with the Software, including without limitation, artwork, graphics, game demos and patches, are the sole and exclusive property of such third parties. Imagination makes no representations or warranties about the accuracy, usability or validity of any third party materials, and disclaims all liabilities in connection with such third party materials.

Term
This Agreement is effective until terminated. Imagination has the right to terminate this Agreement immediately if you fail to comply with any term of this Agreement. You may terminate this Agreement by destroying or returning to Imagination all copies of the Software in your possession.

Governing Law
This Agreement is governed by and shall be construed in accordance with English law and each party agrees to submit to the exclusive jurisdiction of the courts of England.


APPENDIX 1: ATTRIBUTION REQUIREMENTS
If source code is released as it is, the Copyright notice should be kept in a visible position. If object code is bundled with a product, all branding should be kept as it was originally, and the following acknowledgement should be displayed clearly in any associated documentation or other collateral in printed or electronic form distributed with the product incorporating the Software: “This product includes components of the PowerVR Tools Software from Imagination Technologies Limited”. If source code is used to compile a product, the following acknowledgement should be displayed clearly in any associated documentation or other collateral in printed or electronic form distributed with the product incorporating the Software: “This product includes components of the PowerVR Tools Software from Imagination Technologies Limited”.


APPENDIX 2: FEES
LICENSE FEES: 0 (Zero)

ROYALTY FEES: 0 (Zero)

SUPPORT AND MAINTENANCE TERMS AND FEES: 0 (Zero)
````

#### thread-stream (4.2.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `e98272ddea88338742f60df3328bcb616efcb7c6184ddb0ee5608058b73f1885`
- **Notice**: [`third-party/licenses/npm/thread-stream/4.2.0/LICENSE.txt`](third-party/licenses/npm/thread-stream/4.2.0/LICENSE.txt) · SHA-256 `47404ffc18f1267832bc0623857871de5a3a93ebb19693f5e1b963af91fab54b`

````text
MIT License

Copyright (c) 2021 Matteo Collina

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### tinyqueue (3.0.0)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `64d0414e61332c1ee6a2a99a26d42e847d8650d32b2bea232b563e01bbe643ae`
- **Notice**: [`third-party/licenses/npm/tinyqueue/3.0.0/LICENSE.txt`](third-party/licenses/npm/tinyqueue/3.0.0/LICENSE.txt) · SHA-256 `780453e05abdc22307ee01c706a2e73f508d3e484fc4c804485ebf6fe0964694`

````text
ISC License

Copyright (c) 2017, Vladimir Agafonkin

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
````

#### toad-cache (3.7.4)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `fb7f029bae841d6c98fe234c8fa171c1dce6b287a7c4cf9295f772771a30ffc4`
- **Notice**: [`third-party/licenses/npm/toad-cache/3.7.4/LICENSE.txt`](third-party/licenses/npm/toad-cache/3.7.4/LICENSE.txt) · SHA-256 `644304c533dee96438937c0bdcbb49897d80fd8df3be4573f3c57b9c2ca22587`

````text
MIT License

Copyright (c) 2023 Igor Savin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### tslib (2.8.1)
- **Declared License**: `0BSD`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `66f635d5eeabae44807534976913a102cf615b9a045368359c9f79ae6ee2119e`
- **Notice**: [`third-party/licenses/npm/tslib/2.8.1/LICENSE.txt`](third-party/licenses/npm/tslib/2.8.1/LICENSE.txt) · SHA-256 `210b19e543130388c68654b7497e967119ce17145f66ab7d85688fbd70f08751`

````text
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
````

#### tunnel-agent (0.6.0)
- **Declared License**: `Apache-2.0`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d3e3c04a50d6d2fa40654bf764fa1792f797bd5a62c69d03dceaa7d4a85c5012`
- **Notice**: [`third-party/licenses/npm/tunnel-agent/0.6.0/LICENSE.txt`](third-party/licenses/npm/tunnel-agent/0.6.0/LICENSE.txt) · SHA-256 `d446a8c73d7bbe4872d6524b15ae206f9a2d7eb53f8c9cb6e6c893a43acc5276`

````text
Apache License

Version 2.0, January 2004

http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

"License" shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.

"Licensor" shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.

"Legal Entity" shall mean the union of the acting entity and all other entities that control, are controlled by, or are under common control with that entity. For the purposes of this definition, "control" means (i) the power, direct or indirect, to cause the direction or management of such entity, whether by contract or otherwise, or (ii) ownership of fifty percent (50%) or more of the outstanding shares, or (iii) beneficial ownership of such entity.

"You" (or "Your") shall mean an individual or Legal Entity exercising permissions granted by this License.

"Source" form shall mean the preferred form for making modifications, including but not limited to software source code, documentation source, and configuration files.

"Object" form shall mean any form resulting from mechanical transformation or translation of a Source form, including but not limited to compiled object code, generated documentation, and conversions to other media types.

"Work" shall mean the work of authorship, whether in Source or Object form, made available under the License, as indicated by a copyright notice that is included in or attached to the work (an example is provided in the Appendix below).

"Derivative Works" shall mean any work, whether in Source or Object form, that is based on (or derived from) the Work and for which the editorial revisions, annotations, elaborations, or other modifications represent, as a whole, an original work of authorship. For the purposes of this License, Derivative Works shall not include works that remain separable from, or merely link (or bind by name) to the interfaces of, the Work and Derivative Works thereof.

"Contribution" shall mean any work of authorship, including the original version of the Work and any modifications or additions to that Work or Derivative Works thereof, that is intentionally submitted to Licensor for inclusion in the Work by the copyright owner or by an individual or Legal Entity authorized to submit on behalf of the copyright owner. For the purposes of this definition, "submitted" means any form of electronic, verbal, or written communication sent to the Licensor or its representatives, including but not limited to communication on electronic mailing lists, source code control systems, and issue tracking systems that are managed by, or on behalf of, the Licensor for the purpose of discussing and improving the Work, but excluding communication that is conspicuously marked or otherwise designated in writing by the copyright owner as "Not a Contribution."

"Contributor" shall mean Licensor and any individual or Legal Entity on behalf of whom a Contribution has been received by Licensor and subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable (except as stated in this section) patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work, where such license applies only to those patent claims licensable by such Contributor that are necessarily infringed by their Contribution(s) alone or by combination of their Contribution(s) with the Work to which such Contribution(s) was submitted. If You institute patent litigation against any entity (including a cross-claim or counterclaim in a lawsuit) alleging that the Work or a Contribution incorporated within the Work constitutes direct or contributory patent infringement, then any patent licenses granted to You under this License for that Work shall terminate as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the Work or Derivative Works thereof in any medium, with or without modifications, and in Source or Object form, provided that You meet the following conditions:

You must give any other recipients of the Work or Derivative Works a copy of this License; and

You must cause any modified files to carry prominent notices stating that You changed the files; and

You must retain, in the Source form of any Derivative Works that You distribute, all copyright, patent, trademark, and attribution notices from the Source form of the Work, excluding those notices that do not pertain to any part of the Derivative Works; and

If the Work includes a "NOTICE" text file as part of its distribution, then any Derivative Works that You distribute must include a readable copy of the attribution notices contained within such NOTICE file, excluding those notices that do not pertain to any part of the Derivative Works, in at least one of the following places: within a NOTICE text file distributed as part of the Derivative Works; within the Source form or documentation, if provided along with the Derivative Works; or, within a display generated by the Derivative Works, if and wherever such third-party notices normally appear. The contents of the NOTICE file are for informational purposes only and do not modify the License. You may add Your own attribution notices within Derivative Works that You distribute, alongside or as an addendum to the NOTICE text from the Work, provided that such additional attribution notices cannot be construed as modifying the License. You may add Your own copyright statement to Your modifications and may provide additional or different license terms and conditions for use, reproduction, or distribution of Your modifications, or for any such Derivative Works as a whole, provided Your use, reproduction, and distribution of the Work otherwise complies with the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise, any Contribution intentionally submitted for inclusion in the Work by You to the Licensor shall be under the terms and conditions of this License, without any additional terms or conditions. Notwithstanding the above, nothing herein shall supersede or modify the terms of any separate license agreement you may have executed with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except as required for reasonable and customary use in describing the origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the Work and assume any risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory, whether in tort (including negligence), contract, or otherwise, unless required by applicable law (such as deliberate and grossly negligent acts) or agreed to in writing, shall any Contributor be liable to You for damages, including any direct, indirect, special, incidental, or consequential damages of any character arising as a result of this License or out of the use or inability to use the Work (including but not limited to damages for loss of goodwill, work stoppage, computer failure or malfunction, or any and all other commercial damages or losses), even if such Contributor has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing the Work or Derivative Works thereof, You may choose to offer, and charge a fee for, acceptance of support, warranty, indemnity, or other liability obligations and/or rights consistent with this License. However, in accepting such obligations, You may act only on Your own behalf and on Your sole responsibility, not on behalf of any other Contributor, and only if You agree to indemnify, defend, and hold each Contributor harmless for any liability incurred by, or claims asserted against, such Contributor by reason of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS
````

#### undici-types (7.24.6)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `2abf595a86b87dd22951218848ec4ad89c018db0e656716dc04b8b2f9290a0f4`
- **Notice**: [`third-party/licenses/npm/undici-types/7.24.6/LICENSE.txt`](third-party/licenses/npm/undici-types/7.24.6/LICENSE.txt) · SHA-256 `a6db8096b2707bc0102d256917d4d33f298ba36d8c3f25de067a2b5bb379db27`

````text
MIT License

Copyright (c) Matteo Collina and Undici contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### util-deprecate (1.0.2)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `79a1de983c1b393180c47456d6b73caab278a00ea6e37d5c6675f2dcdec2a3e5`
- **Notice**: [`third-party/licenses/npm/util-deprecate/1.0.2/LICENSE.txt`](third-party/licenses/npm/util-deprecate/1.0.2/LICENSE.txt) · SHA-256 `0154425673db15cdfa80ecba2c9b1f1a867f7197a006764712849bfc3a93cbb7`

````text
(The MIT License)

Copyright (c) 2014 Nathan Rajlich <nathan@tootallnate.net>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
````

#### vt-pbf (3.1.3)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `3dc80f21647d14e1523e4164a1c4f351d1aa47e427471a1c1e138abf8c738aa4`
- **Notice**: [`third-party/licenses/npm/vt-pbf/3.1.3/LICENSE.txt`](third-party/licenses/npm/vt-pbf/3.1.3/LICENSE.txt) · SHA-256 `3d29e124a0236cfefe13458b82c44fde04d7dcc7b3b64b7fa4de0027953274db`

````text
The MIT License (MIT)

Copyright (c) 2015 Anand Thakker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

--------------------------------------------------------------------------------

Contains geojson_wrapper.js from https://github.com/mapbox/mapbox-gl-js

Copyright (c) 2014, Mapbox

All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    * Neither the name of Mapbox GL JS nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### vt-pbf/node_modules/@mapbox/vector-tile (1.3.1)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `c302d0529df2189e82edf0e1ef50be6786dd3af6cc19e2873e80d74325416bac`
- **Notice**: [`third-party/licenses/npm/vt-pbf/node_modules/@mapbox/vector-tile/1.3.1/LICENSE.txt`](third-party/licenses/npm/vt-pbf/node_modules/@mapbox/vector-tile/1.3.1/LICENSE.txt) · SHA-256 `de11b2b7d4af85d160347e7cbe734b5bc7b5beb5584281506bc1a5bc84b3aa3e`

````text
Copyright (c) 2014, Mapbox


All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    * Neither the name of Mapbox nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### vt-pbf/node_modules/pbf (3.3.0)
- **Declared License**: `BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `d77164e7d8d3bbcf3054b0ced2dd7ae9fb808a6469c44404b83a27bf275f2c10`
- **Notice**: [`third-party/licenses/npm/vt-pbf/node_modules/pbf/3.3.0/LICENSE.txt`](third-party/licenses/npm/vt-pbf/node_modules/pbf/3.3.0/LICENSE.txt) · SHA-256 `5d081d1d4848771dfef5e445660f918aedefd6ae9bb02058a1f7db9cee6c0902`

````text
Copyright (c) 2017, Mapbox
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of pbf nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

#### web-worker (1.5.0)
- **Declared License**: `Apache-2.0`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `00ef32e02fce57085539e99cb8ea8afa4fa53bfc30e38d7742ed431869c0c47c`
- **Notice**: [`third-party/licenses/npm/web-worker/1.5.0/LICENSE.txt`](third-party/licenses/npm/web-worker/1.5.0/LICENSE.txt) · SHA-256 `43070e2d4e532684de521b885f385d0841030efa2b1a20bafb76133a5e1379c1`

````text
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
````

#### wkt-parser (1.5.6)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `e7fbc6e1f560857fe74d1e081abe880ab50b2018e46206872ea5819d5a353837`
- **Notice**: [`third-party/licenses/npm/wkt-parser/1.5.6/LICENSE.txt`](third-party/licenses/npm/wkt-parser/1.5.6/LICENSE.txt) · SHA-256 `d514fd8b286fc00a5c97a29f8a99b73f1a4053bbdd00c400aee5f24a1b6b301e`

````text
## Proj4js -- Javascript reprojection library. 
 
Authors:
- Mike Adair madairATdmsolutions.ca
- Richard Greenwood richATgreenwoodmap.com
- Didier Richard didier.richardATign.fr
- Stephen Irons stephen.ironsATclear.net.nz
- Olivier Terral oterralATgmail.com
- Calvin Metcalf cmetcalfATappgeo.com

Copyright (c) 2014, Mike Adair, Richard Greenwood, Didier Richard, Stephen Irons, Olivier Terral and Calvin Metcalf

 Permission is hereby granted, free of charge, to any person obtaining a
 copy of this software and associated documentation files (the "Software"),
 to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense,
 and/or sell copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included
 in all copies or substantial portions of the Software.

 _THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 DEALINGS IN THE SOFTWARE._
````

#### wrappy (1.0.2)
- **Declared License**: `ISC`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `aff3730d91b7b1e143822956d14608f563163cf11b9d0ae602df1fe1e430fdfb`
- **Notice**: [`third-party/licenses/npm/wrappy/1.0.2/LICENSE.txt`](third-party/licenses/npm/wrappy/1.0.2/LICENSE.txt) · SHA-256 `4ec3d4c66cd87f5c8d8ad911b10f99bf27cb00cdfcff82621956e379186b016b`

````text
The ISC License

Copyright (c) Isaac Z. Schlueter and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
````

#### xml-naming (0.3.0)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `da0925864bd4c04ef3384e89ef5d4774d82ed6d9fa241519b003ddbcc0effac8`
- **Notice**: [`third-party/licenses/npm/xml-naming/0.3.0/LICENSE.txt`](third-party/licenses/npm/xml-naming/0.3.0/LICENSE.txt) · SHA-256 `8e75fc0e776c62ccadb8178ece8d3daa9ba7601fb0a49b2dfb0ea9a7a5c0aa07`

````text
MIT License

Copyright (c) 2026 Natural Intelligence

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### xml-utils (1.10.2)
- **Declared License**: `CC0-1.0`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `f7b2e31a2f80b092bcea191f5d486864e00689458c2b90d99c53ba5fdf6c3423`
- **Notice**: [`third-party/licenses/npm/xml-utils/1.10.2/LICENSE.txt`](third-party/licenses/npm/xml-utils/1.10.2/LICENSE.txt) · SHA-256 `a2010f343487d3f7618affe54f789f5487602331c0a8d03f49e9a7c547cf0499`

````text
Creative Commons Legal Code

CC0 1.0 Universal

    CREATIVE COMMONS CORPORATION IS NOT A LAW FIRM AND DOES NOT PROVIDE
    LEGAL SERVICES. DISTRIBUTION OF THIS DOCUMENT DOES NOT CREATE AN
    ATTORNEY-CLIENT RELATIONSHIP. CREATIVE COMMONS PROVIDES THIS
    INFORMATION ON AN "AS-IS" BASIS. CREATIVE COMMONS MAKES NO WARRANTIES
    REGARDING THE USE OF THIS DOCUMENT OR THE INFORMATION OR WORKS
    PROVIDED HEREUNDER, AND DISCLAIMS LIABILITY FOR DAMAGES RESULTING FROM
    THE USE OF THIS DOCUMENT OR THE INFORMATION OR WORKS PROVIDED
    HEREUNDER.

Statement of Purpose

The laws of most jurisdictions throughout the world automatically confer
exclusive Copyright and Related Rights (defined below) upon the creator
and subsequent owner(s) (each and all, an "owner") of an original work of
authorship and/or a database (each, a "Work").

Certain owners wish to permanently relinquish those rights to a Work for
the purpose of contributing to a commons of creative, cultural and
scientific works ("Commons") that the public can reliably and without fear
of later claims of infringement build upon, modify, incorporate in other
works, reuse and redistribute as freely as possible in any form whatsoever
and for any purposes, including without limitation commercial purposes.
These owners may contribute to the Commons to promote the ideal of a free
culture and the further production of creative, cultural and scientific
works, or to gain reputation or greater distribution for their Work in
part through the use and efforts of others.

For these and/or other purposes and motivations, and without any
expectation of additional consideration or compensation, the person
associating CC0 with a Work (the "Affirmer"), to the extent that he or she
is an owner of Copyright and Related Rights in the Work, voluntarily
elects to apply CC0 to the Work and publicly distribute the Work under its
terms, with knowledge of his or her Copyright and Related Rights in the
Work and the meaning and intended legal effect of CC0 on those rights.

1. Copyright and Related Rights. A Work made available under CC0 may be
protected by copyright and related or neighboring rights ("Copyright and
Related Rights"). Copyright and Related Rights include, but are not
limited to, the following:

  i. the right to reproduce, adapt, distribute, perform, display,
     communicate, and translate a Work;
 ii. moral rights retained by the original author(s) and/or performer(s);
iii. publicity and privacy rights pertaining to a person's image or
     likeness depicted in a Work;
 iv. rights protecting against unfair competition in regards to a Work,
     subject to the limitations in paragraph 4(a), below;
  v. rights protecting the extraction, dissemination, use and reuse of data
     in a Work;
 vi. database rights (such as those arising under Directive 96/9/EC of the
     European Parliament and of the Council of 11 March 1996 on the legal
     protection of databases, and under any national implementation
     thereof, including any amended or successor version of such
     directive); and
vii. other similar, equivalent or corresponding rights throughout the
     world based on applicable law or treaty, and any national
     implementations thereof.

2. Waiver. To the greatest extent permitted by, but not in contravention
of, applicable law, Affirmer hereby overtly, fully, permanently,
irrevocably and unconditionally waives, abandons, and surrenders all of
Affirmer's Copyright and Related Rights and associated claims and causes
of action, whether now known or unknown (including existing as well as
future claims and causes of action), in the Work (i) in all territories
worldwide, (ii) for the maximum duration provided by applicable law or
treaty (including future time extensions), (iii) in any current or future
medium and for any number of copies, and (iv) for any purpose whatsoever,
including without limitation commercial, advertising or promotional
purposes (the "Waiver"). Affirmer makes the Waiver for the benefit of each
member of the public at large and to the detriment of Affirmer's heirs and
successors, fully intending that such Waiver shall not be subject to
revocation, rescission, cancellation, termination, or any other legal or
equitable action to disrupt the quiet enjoyment of the Work by the public
as contemplated by Affirmer's express Statement of Purpose.

3. Public License Fallback. Should any part of the Waiver for any reason
be judged legally invalid or ineffective under applicable law, then the
Waiver shall be preserved to the maximum extent permitted taking into
account Affirmer's express Statement of Purpose. In addition, to the
extent the Waiver is so judged Affirmer hereby grants to each affected
person a royalty-free, non transferable, non sublicensable, non exclusive,
irrevocable and unconditional license to exercise Affirmer's Copyright and
Related Rights in the Work (i) in all territories worldwide, (ii) for the
maximum duration provided by applicable law or treaty (including future
time extensions), (iii) in any current or future medium and for any number
of copies, and (iv) for any purpose whatsoever, including without
limitation commercial, advertising or promotional purposes (the
"License"). The License shall be deemed effective as of the date CC0 was
applied by Affirmer to the Work. Should any part of the License for any
reason be judged legally invalid or ineffective under applicable law, such
partial invalidity or ineffectiveness shall not invalidate the remainder
of the License, and in such case Affirmer hereby affirms that he or she
will not (i) exercise any of his or her remaining Copyright and Related
Rights in the Work or (ii) assert any associated claims and causes of
action with respect to the Work, in either case contrary to Affirmer's
express Statement of Purpose.

4. Limitations and Disclaimers.

 a. No trademark or patent rights held by Affirmer are waived, abandoned,
    surrendered, licensed or otherwise affected by this document.
 b. Affirmer offers the Work as-is and makes no representations or
    warranties of any kind concerning the Work, express, implied,
    statutory or otherwise, including without limitation warranties of
    title, merchantability, fitness for a particular purpose, non
    infringement, or the absence of latent or other defects, accuracy, or
    the present or absence of errors, whether or not discoverable, all to
    the greatest extent permissible under applicable law.
 c. Affirmer disclaims responsibility for clearing rights of other persons
    that may apply to the Work or any use thereof, including without
    limitation any person's Copyright and Related Rights in the Work.
    Further, Affirmer disclaims responsibility for obtaining any necessary
    consents, permissions or other rights required for any use of the
    Work.
 d. Affirmer understands and acknowledges that Creative Commons is not a
    party to this document and has no duty or obligation with respect to
    this CC0 or use of the Work.
````

#### yazl (3.3.1)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `24a97a443e47d83d9e2ea2bb4b99b7f91a8ba5a5b9e4b49ffdd2be9e0ca00e38`
- **Notice**: [`third-party/licenses/npm/yazl/3.3.1/LICENSE.txt`](third-party/licenses/npm/yazl/3.3.1/LICENSE.txt) · SHA-256 `b303783d5eb7ca50b853ffa5f145e4e7998fab339831d848f507ca6cd970577a`

````text
The MIT License (MIT)

Copyright (c) 2014 Josh Wolfe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### zod (4.6.7)
- **Declared License**: `MIT`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `84efd155bed93270286e793fc951be270b536cbd5b0eeb111f0fa3967201d698`
- **Notice**: [`third-party/licenses/npm/zod/4.6.7/LICENSE.txt`](third-party/licenses/npm/zod/4.6.7/LICENSE.txt) · SHA-256 `3f1189b28e3866e0d979968d466b78f813f76827cfdca1fbb124cc0a5c8841f8`

````text
MIT License

Copyright (c) 2025 Colin McDonnell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### zstd-codec (0.1.5)
- **Declared License**: `MIT`
- **Scope**: `runtime-optional`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY` · tarball SHA-256 `846ead4c1736901a755a6f956820db2687dc84036aae9f9cb5355929e415f540`
- **Notice**: [`third-party/licenses/npm/zstd-codec/0.1.5/package.json`](third-party/licenses/npm/zstd-codec/0.1.5/package.json) · SHA-256 `553a62392efa2a819be554947b54012d274cb40bbd7312b649069824f436cc8c`

````text
{
  "name": "zstd-codec",
  "version": "0.1.5",
  "description": "Zstandard codec powered by Emscripten",
  "main": "index.js",
  "repository": "https://github.com/yoshihitoh/zstd-codec",
  "author": "yoshihitoh",
  "license": "MIT",
  "scripts": {
    "build-binding": "bash ../update-zstd-binding.sh",
    "build-local": "browserify index-local.js -o dist/bundle.js -t [ babelify --presets [ es2015 ] --compact [false ] ]",
    "lint": "eslint lib",
    "test": "jest",
    "test-coverage": "jest --coverage --collectCoverageFrom=lib/**/*.js --collectCoverageFrom=!lib/zstd-codec-binding.js",
    "test-debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  },
  "devDependencies": {
    "babel-core": "^6.26.0",
    "babel-jest": "^23.6.0",
    "babel-preset-es2015": "^6.22.0",
    "babelify": "^8.0.0",
    "browserify": "^17.0.0",
    "eslint": "^6.0.0",
    "eslint-plugin-jest": "^22.7.1",
    "jest": "^24.8.0",
    "regenerator-runtime": "^0.13.2",
    "text-encoding": "^0.7.0"
  }
}
````

#### zstddec (0.2.0)
- **Declared License**: `MIT AND BSD-3-Clause`
- **Scope**: `runtime`
- **Verification**: `VERIFIED_UPSTREAM` · tarball SHA-256 `4708fc2e97b5ae6e8c2545ceabdd965bfe8858a5064fce30380eeb4c6ba3f41d`
- **Notice**: [`third-party/licenses/npm/zstddec/0.2.0/LICENSE.txt`](third-party/licenses/npm/zstddec/0.2.0/LICENSE.txt) · SHA-256 `8d078b49fc02bd63c1beaf4ddc629a8b48e4ba6a435415408c8209e2a5c3aacf`

````text
The MIT License (MIT)

Copyright (c) 2020 Don McCurdy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

***

BSD License

For Zstandard software

Copyright (c) 2016-present, Yann Collet, Facebook, Inc. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 * Neither the name Facebook nor the names of its contributors may be used to
 endorse or promote products derived from this software without specific
 prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
````

### Development-only entries (34)

These entries are part of the source build and test toolchain, not the runtime image. They are retained for reproducible source compliance.

#### @esbuild/aix-ppc64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/aix-ppc64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/aix-ppc64/0.28.2/package.json) · SHA-256 `34a29fb2a726444f71d730b8c5604fa7d50dccb36cc1e72c6baca89732a34b07`

````text
{
  "name": "@esbuild/aix-ppc64",
  "version": "0.28.2",
  "description": "The IBM AIX PowerPC 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "aix"
  ],
  "cpu": [
    "ppc64"
  ]
}
````

#### @esbuild/android-arm (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/android-arm/0.28.2/package.json`](third-party/licenses/npm/@esbuild/android-arm/0.28.2/package.json) · SHA-256 `d2df5574e70efc2c707077bb4f06bf0b9f0a7200ceb5a955d23c60b57259f111`

````text
{
  "name": "@esbuild/android-arm",
  "version": "0.28.2",
  "description": "A WebAssembly shim for esbuild on Android ARM.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "android"
  ],
  "cpu": [
    "arm"
  ]
}
````

#### @esbuild/android-arm64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/android-arm64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/android-arm64/0.28.2/package.json) · SHA-256 `80ea8ab740159741dc8bce86aa167e1dc9ddab25fb5c795082147a80cbc68d21`

````text
{
  "name": "@esbuild/android-arm64",
  "version": "0.28.2",
  "description": "The Android ARM 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "android"
  ],
  "cpu": [
    "arm64"
  ]
}
````

#### @esbuild/android-x64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/android-x64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/android-x64/0.28.2/package.json) · SHA-256 `9db2fadf680c4272bc35bdb9c27e6841af4840ddf2bad2538c1f42b8a21ab4fe`

````text
{
  "name": "@esbuild/android-x64",
  "version": "0.28.2",
  "description": "A WebAssembly shim for esbuild on Android x64.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "android"
  ],
  "cpu": [
    "x64"
  ]
}
````

#### @esbuild/darwin-arm64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/darwin-arm64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/darwin-arm64/0.28.2/package.json) · SHA-256 `4e652c9e4410daf03da852a664940153601fac397233cdcf276b4b1a312454b9`

````text
{
  "name": "@esbuild/darwin-arm64",
  "version": "0.28.2",
  "description": "The macOS ARM 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "darwin"
  ],
  "cpu": [
    "arm64"
  ]
}
````

#### @esbuild/darwin-x64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/darwin-x64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/darwin-x64/0.28.2/package.json) · SHA-256 `e841d308b3490ed55706aa6362a263f77933010249fc240286b6b6722270d973`

````text
{
  "name": "@esbuild/darwin-x64",
  "version": "0.28.2",
  "description": "The macOS 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "darwin"
  ],
  "cpu": [
    "x64"
  ]
}
````

#### @esbuild/freebsd-arm64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/freebsd-arm64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/freebsd-arm64/0.28.2/package.json) · SHA-256 `2e88f1517bb8e4065a81eaca84f84c6ffb640911c4a1420018bf5c3e5633b903`

````text
{
  "name": "@esbuild/freebsd-arm64",
  "version": "0.28.2",
  "description": "The FreeBSD ARM 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "freebsd"
  ],
  "cpu": [
    "arm64"
  ]
}
````

#### @esbuild/freebsd-x64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/freebsd-x64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/freebsd-x64/0.28.2/package.json) · SHA-256 `3cb54907295a04ccfdbb8ffddf46c58db0058fa09ae63bd27913a5bb1248dbf7`

````text
{
  "name": "@esbuild/freebsd-x64",
  "version": "0.28.2",
  "description": "The FreeBSD 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "freebsd"
  ],
  "cpu": [
    "x64"
  ]
}
````

#### @esbuild/linux-arm (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/linux-arm/0.28.2/package.json`](third-party/licenses/npm/@esbuild/linux-arm/0.28.2/package.json) · SHA-256 `a17e83960cc7cf2a061e247423f48ab344f3d9c626d754e61be524c836bdb02f`

````text
{
  "name": "@esbuild/linux-arm",
  "version": "0.28.2",
  "description": "The Linux ARM binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "linux"
  ],
  "cpu": [
    "arm"
  ]
}
````

#### @esbuild/linux-arm64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/linux-arm64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/linux-arm64/0.28.2/package.json) · SHA-256 `0ee05403f9b919e3ac6108bf555ec0fa3e04c4dd493aede4c72ac9bf57e95b75`

````text
{
  "name": "@esbuild/linux-arm64",
  "version": "0.28.2",
  "description": "The Linux ARM 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "linux"
  ],
  "cpu": [
    "arm64"
  ]
}
````

#### @esbuild/linux-ia32 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/linux-ia32/0.28.2/package.json`](third-party/licenses/npm/@esbuild/linux-ia32/0.28.2/package.json) · SHA-256 `7b24621762eec4efea9b5cef2bb1cae027f3adcc0725d405070e568010c4b57b`

````text
{
  "name": "@esbuild/linux-ia32",
  "version": "0.28.2",
  "description": "The Linux 32-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "linux"
  ],
  "cpu": [
    "ia32"
  ]
}
````

#### @esbuild/linux-loong64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/linux-loong64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/linux-loong64/0.28.2/package.json) · SHA-256 `c73d145407d6460a1941e206ed7ea0c11514a9918e82f2b06a680338c975427f`

````text
{
  "name": "@esbuild/linux-loong64",
  "version": "0.28.2",
  "description": "The Linux LoongArch 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "linux"
  ],
  "cpu": [
    "loong64"
  ]
}
````

#### @esbuild/linux-mips64el (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/linux-mips64el/0.28.2/package.json`](third-party/licenses/npm/@esbuild/linux-mips64el/0.28.2/package.json) · SHA-256 `e5e6d37cdaa01d44fcfbeb9d9b1fc72b105e9b4c7a97d45ecf1b19cc0647aca8`

````text
{
  "name": "@esbuild/linux-mips64el",
  "version": "0.28.2",
  "description": "The Linux MIPS 64-bit Little Endian binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "linux"
  ],
  "cpu": [
    "mips64el"
  ]
}
````

#### @esbuild/linux-ppc64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/linux-ppc64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/linux-ppc64/0.28.2/package.json) · SHA-256 `f26d3c99619ea6159250963f368efa6108f586b196c208d3dda5de8a4ceaf903`

````text
{
  "name": "@esbuild/linux-ppc64",
  "version": "0.28.2",
  "description": "The Linux PowerPC 64-bit Little Endian binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "linux"
  ],
  "cpu": [
    "ppc64"
  ]
}
````

#### @esbuild/linux-riscv64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/linux-riscv64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/linux-riscv64/0.28.2/package.json) · SHA-256 `bc192795e8133dfec839b77eb213bf8bbc4320995fbb4d64de63215e4e60364f`

````text
{
  "name": "@esbuild/linux-riscv64",
  "version": "0.28.2",
  "description": "The Linux RISC-V 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "linux"
  ],
  "cpu": [
    "riscv64"
  ]
}
````

#### @esbuild/linux-s390x (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/linux-s390x/0.28.2/package.json`](third-party/licenses/npm/@esbuild/linux-s390x/0.28.2/package.json) · SHA-256 `f39d95e36df6f2f5c60f0bd78dea4c5e148b5bf3634e3c6ea2d3cad7a1d93f5b`

````text
{
  "name": "@esbuild/linux-s390x",
  "version": "0.28.2",
  "description": "The Linux IBM Z 64-bit Big Endian binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "linux"
  ],
  "cpu": [
    "s390x"
  ]
}
````

#### @esbuild/linux-x64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/linux-x64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/linux-x64/0.28.2/package.json) · SHA-256 `a3924c1835c7849adeb3d82ac24525da0d4190607b60d05265dc6746bde2ddb8`

````text
{
  "name": "@esbuild/linux-x64",
  "version": "0.28.2",
  "description": "The Linux 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "linux"
  ],
  "cpu": [
    "x64"
  ]
}
````

#### @esbuild/netbsd-arm64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/netbsd-arm64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/netbsd-arm64/0.28.2/package.json) · SHA-256 `8f4feb2b6269970d9a0a15c537fc483b9ec8ff2d370453e2714c0d5045f96f4e`

````text
{
  "name": "@esbuild/netbsd-arm64",
  "version": "0.28.2",
  "description": "The NetBSD ARM 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "netbsd"
  ],
  "cpu": [
    "arm64"
  ]
}
````

#### @esbuild/netbsd-x64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/netbsd-x64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/netbsd-x64/0.28.2/package.json) · SHA-256 `09c57ff79e392773c9515190ed108499d20a1f783e1e0fa84de26260514b46c1`

````text
{
  "name": "@esbuild/netbsd-x64",
  "version": "0.28.2",
  "description": "The NetBSD AMD64 binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "engines": {
    "node": ">=18"
  },
  "os": [
    "netbsd"
  ],
  "cpu": [
    "x64"
  ]
}
````

#### @esbuild/openbsd-arm64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/openbsd-arm64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/openbsd-arm64/0.28.2/package.json) · SHA-256 `d8ef5f8ff59f4146ea936e3a851dac0d008519ff570059816ff872de3a6456bb`

````text
{
  "name": "@esbuild/openbsd-arm64",
  "version": "0.28.2",
  "description": "The OpenBSD ARM 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "openbsd"
  ],
  "cpu": [
    "arm64"
  ]
}
````

#### @esbuild/openbsd-x64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/openbsd-x64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/openbsd-x64/0.28.2/package.json) · SHA-256 `d338642cfcbaf12ba228bdab1227615466f1f9e63802eb4497a2da69ab1e2991`

````text
{
  "name": "@esbuild/openbsd-x64",
  "version": "0.28.2",
  "description": "The OpenBSD 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "openbsd"
  ],
  "cpu": [
    "x64"
  ]
}
````

#### @esbuild/openharmony-arm64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/openharmony-arm64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/openharmony-arm64/0.28.2/package.json) · SHA-256 `2034cf9753fd6fe7e8dad6616a58d8436d4bb15dc311e8e4019d4f98f5ac1f3c`

````text
{
  "name": "@esbuild/openharmony-arm64",
  "version": "0.28.2",
  "description": "A WebAssembly shim for esbuild on OpenHarmony ARM64.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "openharmony"
  ],
  "cpu": [
    "arm64"
  ]
}
````

#### @esbuild/sunos-x64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/sunos-x64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/sunos-x64/0.28.2/package.json) · SHA-256 `b2bb2ab05633bca92ab070d024e1307362c8a28feaaa8992cef0d559e4a70591`

````text
{
  "name": "@esbuild/sunos-x64",
  "version": "0.28.2",
  "description": "The illumos 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "sunos"
  ],
  "cpu": [
    "x64"
  ]
}
````

#### @esbuild/win32-arm64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/win32-arm64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/win32-arm64/0.28.2/package.json) · SHA-256 `7c093e2ba7d5a5bea11e1614f8477e72c231cd942136eda8eb69ca02e683cd46`

````text
{
  "name": "@esbuild/win32-arm64",
  "version": "0.28.2",
  "description": "The Windows ARM 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "win32"
  ],
  "cpu": [
    "arm64"
  ]
}
````

#### @esbuild/win32-ia32 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/win32-ia32/0.28.2/package.json`](third-party/licenses/npm/@esbuild/win32-ia32/0.28.2/package.json) · SHA-256 `07505d3173503ecfd699bc8ff477955f108f39d13200875f2642f5f88cdfe569`

````text
{
  "name": "@esbuild/win32-ia32",
  "version": "0.28.2",
  "description": "The Windows 32-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "win32"
  ],
  "cpu": [
    "ia32"
  ]
}
````

#### @esbuild/win32-x64 (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `REVIEW_REQUIRED_METADATA_ONLY`
- **Notice**: [`third-party/licenses/npm/@esbuild/win32-x64/0.28.2/package.json`](third-party/licenses/npm/@esbuild/win32-x64/0.28.2/package.json) · SHA-256 `89382df45735edcd917c492a810ab514920fa07d36c653cdc122bdfd8f526964`

````text
{
  "name": "@esbuild/win32-x64",
  "version": "0.28.2",
  "description": "The Windows 64-bit binary for esbuild, a JavaScript bundler.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/evanw/esbuild.git"
  },
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=18"
  },
  "os": [
    "win32"
  ],
  "cpu": [
    "x64"
  ]
}
````

#### @playwright/test (1.64.0)
- **Declared License**: `Apache-2.0`
- **Verification**: `VERIFIED_UPSTREAM`
- **Notice**: [`third-party/licenses/npm/@playwright/test/1.64.0/LICENSE.txt`](third-party/licenses/npm/@playwright/test/1.64.0/LICENSE.txt) · SHA-256 `45873d00a0dd243596deb4aa23b2493b3d1f0671921bf2538ea431d7380220eb`
- **Notice**: [`third-party/licenses/npm/@playwright/test/1.64.0/NOTICE.txt`](third-party/licenses/npm/@playwright/test/1.64.0/NOTICE.txt) · SHA-256 `6d602191187b35b9b01d2cffa01c8469c2c8d9de8a96f1bf868e0f264f51c81d`

````text
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Portions Copyright (c) Microsoft Corporation.
   Portions Copyright 2017 Google Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
````

````text
Playwright
Copyright (c) Microsoft Corporation

This software contains code derived from the Puppeteer project (https://github.com/puppeteer/puppeteer),
available under the Apache 2.0 license (https://github.com/puppeteer/puppeteer/blob/master/LICENSE).
````

#### @types/better-sqlite3 (7.6.13)
- **Declared License**: `MIT`
- **Verification**: `VERIFIED_UPSTREAM`
- **Notice**: [`third-party/licenses/npm/@types/better-sqlite3/7.6.13/LICENSE.txt`](third-party/licenses/npm/@types/better-sqlite3/7.6.13/LICENSE.txt) · SHA-256 `c2cfccb812fe482101a8f04597dfc5a9991a6b2748266c47ac91b6a5aae15383`

````text
MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
````

#### @types/geojson-vt (3.2.5)
- **Declared License**: `MIT`
- **Verification**: `VERIFIED_UPSTREAM`
- **Notice**: [`third-party/licenses/npm/@types/geojson-vt/3.2.5/LICENSE.txt`](third-party/licenses/npm/@types/geojson-vt/3.2.5/LICENSE.txt) · SHA-256 `c2cfccb812fe482101a8f04597dfc5a9991a6b2748266c47ac91b6a5aae15383`

````text
MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
````

#### @types/vt-pbf (3.1.1)
- **Declared License**: `MIT`
- **Verification**: `VERIFIED_UPSTREAM`
- **Notice**: [`third-party/licenses/npm/@types/vt-pbf/3.1.1/LICENSE.txt`](third-party/licenses/npm/@types/vt-pbf/3.1.1/LICENSE.txt) · SHA-256 `c2cfccb812fe482101a8f04597dfc5a9991a6b2748266c47ac91b6a5aae15383`

````text
MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
````

#### esbuild (0.28.2)
- **Declared License**: `MIT`
- **Verification**: `VERIFIED_UPSTREAM`
- **Notice**: [`third-party/licenses/npm/esbuild/0.28.2/LICENSE.txt`](third-party/licenses/npm/esbuild/0.28.2/LICENSE.txt) · SHA-256 `b40ec5baec7bb34fa5b1c09521fa3cd52d5fad7adafed74932a2010d3612a681`

````text
MIT License

Copyright (c) 2020 Evan Wallace

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

#### playwright (1.64.0)
- **Declared License**: `Apache-2.0`
- **Verification**: `VERIFIED_UPSTREAM`
- **Notice**: [`third-party/licenses/npm/playwright/1.64.0/LICENSE.txt`](third-party/licenses/npm/playwright/1.64.0/LICENSE.txt) · SHA-256 `45873d00a0dd243596deb4aa23b2493b3d1f0671921bf2538ea431d7380220eb`
- **Notice**: [`third-party/licenses/npm/playwright/1.64.0/NOTICE.txt`](third-party/licenses/npm/playwright/1.64.0/NOTICE.txt) · SHA-256 `6d602191187b35b9b01d2cffa01c8469c2c8d9de8a96f1bf868e0f264f51c81d`

````text
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Portions Copyright (c) Microsoft Corporation.
   Portions Copyright 2017 Google Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
````

````text
Playwright
Copyright (c) Microsoft Corporation

This software contains code derived from the Puppeteer project (https://github.com/puppeteer/puppeteer),
available under the Apache 2.0 license (https://github.com/puppeteer/puppeteer/blob/master/LICENSE).
````

#### playwright-core (1.64.0)
- **Declared License**: `Apache-2.0`
- **Verification**: `VERIFIED_UPSTREAM`
- **Notice**: [`third-party/licenses/npm/playwright-core/1.64.0/LICENSE.txt`](third-party/licenses/npm/playwright-core/1.64.0/LICENSE.txt) · SHA-256 `45873d00a0dd243596deb4aa23b2493b3d1f0671921bf2538ea431d7380220eb`
- **Notice**: [`third-party/licenses/npm/playwright-core/1.64.0/NOTICE.txt`](third-party/licenses/npm/playwright-core/1.64.0/NOTICE.txt) · SHA-256 `6d602191187b35b9b01d2cffa01c8469c2c8d9de8a96f1bf868e0f264f51c81d`

````text
Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Portions Copyright (c) Microsoft Corporation.
   Portions Copyright 2017 Google Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
````

````text
Playwright
Copyright (c) Microsoft Corporation

This software contains code derived from the Puppeteer project (https://github.com/puppeteer/puppeteer),
available under the Apache 2.0 license (https://github.com/puppeteer/puppeteer/blob/master/LICENSE).
````

#### typescript (5.9.3)
- **Declared License**: `Apache-2.0`
- **Verification**: `VERIFIED_UPSTREAM`
- **Notice**: [`third-party/licenses/npm/typescript/5.9.3/LICENSE.txt`](third-party/licenses/npm/typescript/5.9.3/LICENSE.txt) · SHA-256 `a7d00bfd54525bc694b6e32f64c7ebcf5e6b7ae3657be5cc12767bce74654a47`

````text
Apache License

Version 2.0, January 2004

http://www.apache.org/licenses/ 

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

"License" shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.

"Licensor" shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.

"Legal Entity" shall mean the union of the acting entity and all other entities that control, are controlled by, or are under common control with that entity. For the purposes of this definition, "control" means (i) the power, direct or indirect, to cause the direction or management of such entity, whether by contract or otherwise, or (ii) ownership of fifty percent (50%) or more of the outstanding shares, or (iii) beneficial ownership of such entity.

"You" (or "Your") shall mean an individual or Legal Entity exercising permissions granted by this License.

"Source" form shall mean the preferred form for making modifications, including but not limited to software source code, documentation source, and configuration files.

"Object" form shall mean any form resulting from mechanical transformation or translation of a Source form, including but not limited to compiled object code, generated documentation, and conversions to other media types.

"Work" shall mean the work of authorship, whether in Source or Object form, made available under the License, as indicated by a copyright notice that is included in or attached to the work (an example is provided in the Appendix below).

"Derivative Works" shall mean any work, whether in Source or Object form, that is based on (or derived from) the Work and for which the editorial revisions, annotations, elaborations, or other modifications represent, as a whole, an original work of authorship. For the purposes of this License, Derivative Works shall not include works that remain separable from, or merely link (or bind by name) to the interfaces of, the Work and Derivative Works thereof.

"Contribution" shall mean any work of authorship, including the original version of the Work and any modifications or additions to that Work or Derivative Works thereof, that is intentionally submitted to Licensor for inclusion in the Work by the copyright owner or by an individual or Legal Entity authorized to submit on behalf of the copyright owner. For the purposes of this definition, "submitted" means any form of electronic, verbal, or written communication sent to the Licensor or its representatives, including but not limited to communication on electronic mailing lists, source code control systems, and issue tracking systems that are managed by, or on behalf of, the Licensor for the purpose of discussing and improving the Work, but excluding communication that is conspicuously marked or otherwise designated in writing by the copyright owner as "Not a Contribution."

"Contributor" shall mean Licensor and any individual or Legal Entity on behalf of whom a Contribution has been received by Licensor and subsequently incorporated within the Work.

2. Grant of Copyright License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form.

3. Grant of Patent License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable (except as stated in this section) patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work, where such license applies only to those patent claims licensable by such Contributor that are necessarily infringed by their Contribution(s) alone or by combination of their Contribution(s) with the Work to which such Contribution(s) was submitted. If You institute patent litigation against any entity (including a cross-claim or counterclaim in a lawsuit) alleging that the Work or a Contribution incorporated within the Work constitutes direct or contributory patent infringement, then any patent licenses granted to You under this License for that Work shall terminate as of the date such litigation is filed.

4. Redistribution. You may reproduce and distribute copies of the Work or Derivative Works thereof in any medium, with or without modifications, and in Source or Object form, provided that You meet the following conditions:

You must give any other recipients of the Work or Derivative Works a copy of this License; and

You must cause any modified files to carry prominent notices stating that You changed the files; and

You must retain, in the Source form of any Derivative Works that You distribute, all copyright, patent, trademark, and attribution notices from the Source form of the Work, excluding those notices that do not pertain to any part of the Derivative Works; and

If the Work includes a "NOTICE" text file as part of its distribution, then any Derivative Works that You distribute must include a readable copy of the attribution notices contained within such NOTICE file, excluding those notices that do not pertain to any part of the Derivative Works, in at least one of the following places: within a NOTICE text file distributed as part of the Derivative Works; within the Source form or documentation, if provided along with the Derivative Works; or, within a display generated by the Derivative Works, if and wherever such third-party notices normally appear. The contents of the NOTICE file are for informational purposes only and do not modify the License. You may add Your own attribution notices within Derivative Works that You distribute, alongside or as an addendum to the NOTICE text from the Work, provided that such additional attribution notices cannot be construed as modifying the License. You may add Your own copyright statement to Your modifications and may provide additional or different license terms and conditions for use, reproduction, or distribution of Your modifications, or for any such Derivative Works as a whole, provided Your use, reproduction, and distribution of the Work otherwise complies with the conditions stated in this License.

5. Submission of Contributions. Unless You explicitly state otherwise, any Contribution intentionally submitted for inclusion in the Work by You to the Licensor shall be under the terms and conditions of this License, without any additional terms or conditions. Notwithstanding the above, nothing herein shall supersede or modify the terms of any separate license agreement you may have executed with Licensor regarding such Contributions.

6. Trademarks. This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except as required for reasonable and customary use in describing the origin of the Work and reproducing the content of the NOTICE file.

7. Disclaimer of Warranty. Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the Work and assume any risks associated with Your exercise of permissions under this License.

8. Limitation of Liability. In no event and under no legal theory, whether in tort (including negligence), contract, or otherwise, unless required by applicable law (such as deliberate and grossly negligent acts) or agreed to in writing, shall any Contributor be liable to You for damages, including any direct, indirect, special, incidental, or consequential damages of any character arising as a result of this License or out of the use or inability to use the Work (including but not limited to damages for loss of goodwill, work stoppage, computer failure or malfunction, or any and all other commercial damages or losses), even if such Contributor has been advised of the possibility of such damages.

9. Accepting Warranty or Additional Liability. While redistributing the Work or Derivative Works thereof, You may choose to offer, and charge a fee for, acceptance of support, warranty, indemnity, or other liability obligations and/or rights consistent with this License. However, in accepting such obligations, You may act only on Your own behalf and on Your sole responsibility, not on behalf of any other Contributor, and only if You agree to indemnify, defend, and hold each Contributor harmless for any liability incurred by, or claims asserted against, such Contributor by reason of your accepting any such warranty or additional liability.

END OF TERMS AND CONDITIONS
````

---

## Evidence Files

- [`third-party/MANIFEST.json`](third-party/MANIFEST.json) — per-package tarball hashes and extracted notice hashes.
- [`third-party/npm-upstream-verification.csv`](third-party/npm-upstream-verification.csv) — machine-readable npm verification table.
- [`third-party/native/components.json`](third-party/native/components.json) — native component declarations and license hashes.
- [`third-party/native-components.csv`](third-party/native-components.csv) — machine-readable native component table.
- [`third-party/licenses/`](third-party/licenses/) — captured upstream license texts (npm, native, assets).

Re-verify offline with `node scripts/verify-npm-notices.js` and `node scripts/verify-native-licenses.js`. Refresh evidence only with `--update`, then review the diff before committing.

> These notices document the stated source and artifact evidence at generation time. They are not a certification of every current platform or release image. For installation and test steps see [Installation](docs/INSTALLATION.md), [Testing](docs/TESTING.md), and [Release Process](docs/RELEASE_PROCESS.md).
