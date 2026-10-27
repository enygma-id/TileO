# Third-party licenses and attribution

TileO's first-party Community source is AGPL-3.0-only where identified. Independently licensed third-party packages, native binaries, certificates, icons and datasets retain their own licenses and redistribution rights.

## Public compliance records

- [Combined license and notice corpus](THIRD-PARTY-NOTICES.md) — generated from committed source evidence; not an artifact-level certification.
- [Dependency inventory](third-party/DEPENDENCIES.md) and [machine-readable manifest](third-party/MANIFEST.json).
- [Per-package npm notices](third-party/licenses/npm/) and [native license corpus](third-party/licenses/native/).
- [Native component register](third-party/native/components.json) and [native review guidance](third-party/NATIVE_COMPONENTS.md).
- [Assets and data notices](third-party/ASSET_LICENSES.md).
- [Enterprise-compatible third-party exceptions](third-party/ENTERPRISE_EXCEPTIONS.md).
- [Source availability and redistribution information](third-party/SOURCE_ACCESS.md).
- [Release compliance gate](third-party/RELEASE_GATE.md).

## Recorded source inventory (RC9, not a release certification)

The candidate `package-lock.json` and `third-party/MANIFEST.json` each record **285 non-root npm packages**. The manifest records **249 exact-tarball license/notice verifications** and **36 metadata-only cases**, with **0 verification failures** in that recorded check. These figures are snapshot data and must be regenerated if the dependency graph changes. A metadata-only record is not proof of a bundled binary's terms or completed notice obligations.

The native register records **28 components**, including two GCC runtime components and Mozilla-derived CA trust-store material proposed for narrowly reviewed exceptions. Their presence is **not** a claim of 100% permissive licensing. Final distribution depends on the exact release artifact, accompanying licenses and corresponding-source fulfillment, test evidence, and authorized human signoff.

Verification commands: `node scripts/verify-npm-notices.js`, `node scripts/verify-native-licenses.js`, and `node scripts/check-notice-parity.js`.
