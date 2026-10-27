# Third-Party Dependencies, Assets and License Notices

The original TileO Community license does not supersede independently licensed upstream libraries, tools, icons, certificates or datasets. This directory contains source-level attribution and compliance evidence, **not** blanket clearance for an image or Enterprise sale.

## Documentation map

| Record | Purpose |
| --- | --- |
| [npm dependency inventory](DEPENDENCIES.md) | Generated inventory from the current lockfile and manifest |
| [npm manifest](MANIFEST.json) | Pinned package paths/versions, upstream verification records and notice hashes |
| [npm notices](licenses/npm/) | Archived exact-package texts where available |
| [Combined license/notice corpus](../THIRD-PARTY-NOTICES.md) | Generated notice content; not human approval |
| [Native register](native/components.json) and [native licenses](licenses/native/) | Source-level inventory and collected upstream terms |
| [Native audit guidance](NATIVE_COMPONENTS.md) | Driver, binary and linkage checks |
| [Asset/data licenses](ASSET_LICENSES.md) | Icon and dataset notices |
| [Evidence coverage](LICENSE_COVERAGE.md) | Known completeness limits and unverified items |
| [Upstream verification](UPSTREAM_VERIFICATION.md) | Pinning and source-evidence procedure |
| [Disclosed exceptions](ENTERPRISE_EXCEPTIONS.md) | GCC runtimes and Mozilla-derived CA material; approvals are release-specific |
| [Source availability](SOURCE_ACCESS.md) | Recipient access requirements for Community and Enterprise binaries |
| [Release gate](RELEASE_GATE.md) | Required checks and human authorization |

**RC9 snapshot only:** the manifest reports 285 npm packages, 249 exact-tarball verifications, 36 metadata-only packages and zero verification failures. Counts can change on the next engineering candidate; generate the authoritative inventory from the final lockfile and `MANIFEST.json`, rather than manually carrying figures forward.

Generate notices and inventories via their maintained scripts, and use `node scripts/check-notice-parity.js` after source changes. The two GCC runtime libraries and identified CA trust-store material are **exception candidates, not permissive passes**.
