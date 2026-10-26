# Third-Party Dependencies, Assets and License Notices

TileO's original software license does not override the licenses of upstream libraries, native tools, icons or datasets. The files below document dependency versions and collected attribution material; they are not a blanket certification of every distributed image.

## Documentation map

| Record | Purpose |
| --- | --- |
| [Npm dependency inventory](DEPENDENCIES.md) | 291 locked npm entries; direct, transitive, development and optional-platform packages |
| [Manifest](MANIFEST.json) | Machine-readable package versions, verification status, tarball hashes and notice SHA-256 records |
| [Per-package notices](licenses/npm/) | Upstream license files extracted from exact npm tarballs |
| [Combined notice corpus](../THIRD-PARTY-NOTICES.md) | Consolidated license and notice text generated from committed evidence |
| [Native components](native/components.json) | Pinned native runtime component declarations and license-file hashes |
| [Native license files](licenses/native/) | Corpus for GDAL, PROJ, Node.js, Tippecanoe and linked libraries |
| [Asset notices](licenses/assets/) | Lucide/Feather and related assets |
| [Native component inventory](NATIVE_COMPONENTS.md) | GDAL/PROJ, Node, Tippecanoe and linked-library audit requirements |
| [Asset and data licensing](ASSET_LICENSES.md) | Icons, brand assets and third-party datasets |
| [Evidence coverage](LICENSE_COVERAGE.md) | What has been collected and what remains unverified |
| [Verification process](UPSTREAM_VERIFICATION.md) | Automated extraction from pinned sources and tarballs |
| [Release gate](RELEASE_GATE.md) | Binary/container/Enterprise compliance before publication |

## Verification status

- **252 of 291** npm entries are verified from the exact tarball recorded in `package-lock.json`.
- **39** entries contain no LICENSE/COPYING/NOTICE file in their tarball. Their `package.json` metadata is retained and the entries are explicitly marked `metadata_only_no_license_file`; they are not represented as verified upstream license files.
- Native evidence is pinned in `native/components.json`. The GCC runtime libraries and the CA certificate bundle are recorded as documented exceptions, not permissive passes.

Regenerate documents with `node scripts/generate-third-party-notices.js` and `node scripts/generate-dependency-inventory.js`. Fail-closed parity is enforced by `node scripts/check-notice-parity.js`.
