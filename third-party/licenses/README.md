# Third-Party License Archive

This directory contains collected third-party license texts and notices for TileO's JavaScript packages, bundled icon assets, and native runtime components. It is separate from TileO's own software license.

## Contents

| Directory | Recorded material |
| --- | --- |
| [`npm/`](npm/) | Candidate source notice records indexed by [`../MANIFEST.json`](../MANIFEST.json); consult its `npm_verification` summary for verified versus metadata-only counts. |
| [`assets/lucide-icons/`](assets/lucide-icons/) | Lucide/Feather attribution and license information. |
| [`native/`](native/) | 28 pinned native runtime components: GDAL, PROJ, Node.js, Tippecanoe, linked libraries and documented exceptions. |
| [`standard/`](standard/) | Reference Apache-2.0 license text. |

The directory names `node_modules` under `npm/` are **archival package identifiers**, not install directories. The local `npm/.gitignore` allows Git to track the nested license notices without changing the repository's global ignore rules.

## Verification and release limitations

In the RC9 manifest, 249 npm records were verified against exact upstream tarballs and 36 are metadata-only. Original hashes and package versions are recorded in [`../MANIFEST.json`](../MANIFEST.json). Metadata-only status requires inspection of the actual payload if it ships. Archive integrity is not a substitute for a final-image audit.

GDAL, PROJ, Node.js, Tippecanoe and linked libraries are covered by [`../NATIVE_COMPONENTS.md`](../NATIVE_COMPONENTS.md) and by [`native/components.json`](../native/components.json). The final image must still be reconciled with its SBOM and ELF linkage closure. The three candidate GCC/CA exceptions also require corresponding-source and distribution evidence; license text alone is not fulfillment. Do not treat this archive as artifact-level certification. See [exceptions](../ENTERPRISE_EXCEPTIONS.md) and [source access](../SOURCE_ACCESS.md).

Asset and dataset licenses are distinct from TileO Community Edition's AGPL-3.0-only software license. See [`../ASSET_LICENSES.md`](../ASSET_LICENSES.md) and [`../LICENSE_COVERAGE.md`](../LICENSE_COVERAGE.md).
