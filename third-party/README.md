# Third-Party Dependencies, Assets and License Notices

TileO's original software license does not override the licenses of upstream libraries, native tools, icons or datasets. The files below document dependency versions and collected attribution material; they are not a blanket certification of every distributed image.

## Documentation map

| Record | Purpose |
| --- | --- |
| [Npm dependency inventory](DEPENDENCIES.md) | 284 locked npm entries; direct, transitive, development and optional-platform packages |
| [Manifest](MANIFEST.json) | Machine-readable package versions, notice paths and SHA-256 records |
| [Per-package notices](licenses/npm/) | Collected notice files indexed by the manifest |
| [Combined notice corpus](../THIRD-PARTY-NOTICES.md) | Consolidated collected license and notice text |
| [Native license files](licenses/native/) | Tippecanoe and other available native notices; not yet a complete image license closure |
| [Asset notices](licenses/assets/) | Lucide/Feather and related assets |
| [Native component inventory](NATIVE_COMPONENTS.md) | GDAL/PROJ, Node, Tippecanoe and linked-library audit requirements |
| [Asset and data licensing](ASSET_LICENSES.md) | Icons, brand assets and third-party datasets |
| [Evidence coverage](LICENSE_COVERAGE.md) | What has been collected and what remains unverified |
| [Verification process](UPSTREAM_VERIFICATION.md) | Obtaining license/NOTICE files from pinned source versions |
| [Release gate](RELEASE_GATE.md) | Binary/container/Enterprise compliance before publication |

Some collected npm notice texts are **fallback standard-license forms**, not authenticated, package-specific copyright notices. Before shipping a redistributable product, verify exact upstream LICENSE/NOTICE documents against the installed/pinned versions, including native and transitive components. See [Evidence Coverage](LICENSE_COVERAGE.md).
