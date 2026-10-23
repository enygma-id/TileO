# Third-Party License Archive

This directory contains collected third-party license texts and notices
for TileO's JavaScript packages, bundled icon assets, and selected
native components. It is separate from TileO's own software license.

## Contents

| Directory | Recorded material |
| --- | --- |
| [`npm/`](npm/) | 284 notice records indexed by [`../MANIFEST.json`](../MANIFEST.json), including version-specific nested dependency paths. |
| [`assets/lucide-icons/`](assets/lucide-icons/) | Lucide/Feather attribution and license information. |
| [`native/tippecanoe-2.79.0/`](native/tippecanoe-2.79.0/) | Tippecanoe and bundled component license notices. |
| [`standard/`](standard/) | Reference Apache-2.0 license text. |

The directory names `node_modules` under `npm/` are **archival package
identifiers**, not install directories. The local `npm/.gitignore`
allows Git to track the nested license notices without changing the
repository's global ignore rules.

## Verification and release limitations

The 284 notice records match the file paths and SHA-256 values in
[`../MANIFEST.json`](../MANIFEST.json). This establishes **archive
integrity**, not complete, independently verified upstream license
compliance. Some notices were collected as license-text fallbacks and
need to be compared with the exact upstream package archives.

GDAL, PROJ, system libraries, containers, and other native dependencies
are covered by the repository's
[`../NATIVE_COMPONENTS.md`](../NATIVE_COMPONENTS.md) inventory and
release checks. This directory **does not yet include all original
license/NOTICE files for those native binaries**. Collect them from
their exact source releases and verify the linked dependency set before
distributing production artifacts. Do not treat the presence of this
archive as a permissive-only certification.

Asset and dataset licenses are distinct from TileO Community Edition's
AGPL-3.0-only software license. See
[`../ASSET_LICENSES.md`](../ASSET_LICENSES.md) and
[`../LICENSE_COVERAGE.md`](../LICENSE_COVERAGE.md).
