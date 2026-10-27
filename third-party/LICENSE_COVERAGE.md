# Third-Party License Evidence and Coverage

## Recorded candidate source inventory

The RC9 source tree records **285 non-root npm package entries** in [`package-lock.json`](../package-lock.json) and [`MANIFEST.json`](MANIFEST.json). The manifest's `npm_verification` record reports **249 verified exact upstream tarballs**, **36 metadata-only entries without license/notice files in their tarballs**, and **0 failed checks**. The numbers describe this **source snapshot**, not necessarily the contents of a final distributable image. Regenerate them after any dependency change.

Native components are recorded in [`native/components.json`](native/components.json), with **28 catalogued components** and three **non-permissive exception candidates**: `libstdc++`, `libgcc` and Mozilla-derived CA trust-store material. The license corpus and file checksums must be checked against the actual shipped binary/data.

## Coverage and remaining work

| Material | Evidence in candidate repository | Release-specific work |
| --- | --- | --- |
| npm graph and package notices | 285 entries; 249 exact-tarball verifications, 36 metadata-only | Confirm shipped package subset, bundled binaries and notices; regenerate after changes |
| Native tools (GDAL, PROJ, Node.js, Tippecanoe, linked libraries) | [Native component register](native/components.json) and [license corpus](licenses/native/) | Image filesystem, static/dynamic linkage and embedded-binary coverage |
| GCC runtime libraries | GPL and GCC Runtime Library Exception texts archived | Match shipped files and corresponding-source archive/access; obtain approval |
| Mozilla CA trust store | Preliminary Mozilla license text archived | Establish exact source/provenance and all applicable packaging terms; meet access/notice conditions |
| Lucide/Feather and other assets | [Asset notices](licenses/assets/lucide-icons/LICENSE-ISC-and-Feather-MIT.txt) | Confirm actual versions, modifications and attribution |
| Container environment | RC9 [`Dockerfile`](../Dockerfile) is multi-stage with final `FROM scratch` | **Do not infer permissive compliance**; inventory all files copied into final image |
| Sample datasets | [CC BY 4.0 notices](../samples/TileO-Samples-01/LICENSE-CC-BY-4.0.md) | Retain provenance, checksums and applicable privacy/data review |

License evidence is not a certification of a build. A complete source license or notice without the corresponding source required by the applicable GPL/MPL terms is insufficient for binary distribution. Enterprise contracts cannot remove third-party rights; the same obligations apply to Community binaries that contain the relevant components.

See [Upstream Verification](UPSTREAM_VERIFICATION.md), [Native Components](NATIVE_COMPONENTS.md), [Exceptions](ENTERPRISE_EXCEPTIONS.md), [Source Access](SOURCE_ACCESS.md) and [Release Gate](RELEASE_GATE.md).
