# Third-party licenses and attribution

TileO's Community source is AGPL-3.0-only where identified. Third-party packages, icons, native binaries and datasets are governed by their own licenses and must retain required notices.

## License records

- [Combined collected notices and license texts](THIRD-PARTY-NOTICES.md)
- [Dependency inventory](third-party/DEPENDENCIES.md) and [manifest](third-party/MANIFEST.json)
- [Per-package npm licenses](third-party/licenses/npm/)
- [Native components](third-party/native/components.json), [inventory](third-party/NATIVE_COMPONENTS.md) and [license corpus](third-party/licenses/native/)
- [Assets, icons and data licenses](third-party/ASSET_LICENSES.md)
- [Release compliance checklist](third-party/RELEASE_GATE.md)

## Current coverage

- **291** locked npm entries: 252 notices verified from the exact upstream tarball (sha512 integrity, extracted LICENSE/COPYING/NOTICE, SHA-256 recorded); 39 entries have no license file in the tarball and are explicitly marked **metadata-only** (13 runtime/optional, 26 development-only).
- **28** native runtime components with a pinned upstream corpus; **3** are documented exceptions: `libstdc++` and `libgcc` under the GCC Runtime Library Exception, and the CA certificate bundle as MPL-2.0 data.
- The checked-in evidence is **source-level**. A strict permissive-only claim for a distributed image additionally requires a final-image SBOM, an ELF linkage closure audit and human approval of the documented exceptions.

Do not represent this record as blanket permissive-only certification. Verify offline with `node scripts/verify-npm-notices.js` and `node scripts/verify-native-licenses.js`; check document parity with `node scripts/check-notice-parity.js`.
