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

**Current committed source inventory:** `package-lock.json` and `MANIFEST.json` each record **284 non-root npm packages**: **248 verified from exact upstream tarballs** and **36 metadata-only**. These are source-evidence categories, not release clearance or proof that an image complies. The earlier RC9 figure of 285 packages (249 verified) was a historical snapshot and is not the count of this committed dependency graph. Recalculate figures from the final lockfile and manifest whenever they change.

Generate notices and inventories via their maintained scripts, and use `node scripts/check-notice-parity.js` after source changes. Evidence checks: `node scripts/verify-npm-notices.js` and `node scripts/verify-native-licenses.js`. The only canonical root-level combined notice file is [THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md). The two GCC runtime libraries and identified CA trust-store material are **exception candidates, not permissive passes**.
