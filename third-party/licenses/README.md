# Third-Party License Archive

This directory contains collected third-party license texts and notices for TileO's JavaScript packages, bundled icon assets, and native runtime components. It is separate from TileO's own software license.

## Contents

| Directory | Recorded material |
| --- | --- |
| [`npm/`](npm/) | 291 notice records indexed by [`../MANIFEST.json`](../MANIFEST.json); 252 extracted from exact upstream tarballs and 39 metadata-only records. |
| [`assets/lucide-icons/`](assets/lucide-icons/) | Lucide/Feather attribution and license information. |
| [`native/`](native/) | 28 pinned native runtime components: GDAL, PROJ, Node.js, Tippecanoe, linked libraries and documented exceptions. |
| [`standard/`](standard/) | Reference Apache-2.0 license text. |

The directory names `node_modules` under `npm/` are **archival package identifiers**, not install directories. The local `npm/.gitignore` allows Git to track the nested license notices without changing the repository's global ignore rules.

## Verification and release limitations

The 252 verified npm records correspond to exact tarballs from `package-lock.json`; their tarball SHA-256 and stored-file SHA-256 are recorded in [`../MANIFEST.json`](../MANIFEST.json). The 39 metadata-only entries have no license file in the tarball and are flagged for review. Archive integrity is not a substitute for a final-image audit.

GDAL, PROJ, Node.js, Tippecanoe and linked libraries are covered by [`../NATIVE_COMPONENTS.md`](../NATIVE_COMPONENTS.md) and by [`native/components.json`](../native/components.json). The final image must still be reconciled with its SBOM and ELF linkage closure. Do not treat the presence of this archive as a permissive-only certification.

Asset and dataset licenses are distinct from TileO Community Edition's AGPL-3.0-only software license. See [`../ASSET_LICENSES.md`](../ASSET_LICENSES.md) and [`../LICENSE_COVERAGE.md`](../LICENSE_COVERAGE.md).
