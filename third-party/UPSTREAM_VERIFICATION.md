# Upstream License and Binary Provenance Verification

This is a release-time procedure, not evidence that a particular build has passed.

1. Freeze `package-lock.json` and confirm its SHA-256 matches [`MANIFEST.json`](MANIFEST.json); regenerate the package-level notice archive after changes.
2. Resolve package versions and upstream tarballs; verify integrity and archive exact LICENSE/COPYING/NOTICE/COPYRIGHT material. Examine packages with no upstream license file via declared license metadata **and bundled payloads**, not metadata alone.
3. Use the recorded `npm_verification` summary in the manifest for exact-tarball versus metadata-only counts. The manifest may retain historical collection-status fields; do not mistake them for final artifact-level evidence.
4. Build the exact candidate image once. Inventory shipped npm files, native tools, shared and statically linked libraries, GDAL drivers, frontend content, embedded binaries, certificate data and relevant third-party assets. Verify actual licenses against those payloads, not only the parent package field.
5. For GCC runtime **EXC-001/EXC-002**, record actual `libstdc++.so.6*` and `libgcc_s.so.1` filenames and hashes, the compiler/runtime package version and revision, upstream source/patches/build recipe, GPL/GCC exception terms and corresponding-source distribution mechanism.
6. For CA trust-store **EXC-003**, record actual trust-store file/hash, source origin/revision, certificate extraction/build process, notices and exact applicable Mozilla/packaging licenses. Supply source/access where required by those terms; do not invent a blanket MPL “Scope E” exemption.
7. Match each exception to a verified immutable artifact, approved release register, correct notices and source-access method. A scoped exception does not authorize unrelated GPL/MPL components.
8. Generate SPDX and CycloneDX for the final image, check filesystem and ELF linkage closure, preserve the raw tests and fail closed on missing/old/mismatched evidence.
9. Record authorized release/Legal-IP human decisions, independently of automated checks; verify customer- and public-image recipient obligations before publication.

At the **RC9 source snapshot**, the manifest reports **285 packages**, including **249 verified exact-tarball notices** and **36 metadata-only entries**. This is not a later release guarantee.

See [Exception Disclosure](ENTERPRISE_EXCEPTIONS.md), [Source Access](SOURCE_ACCESS.md), [License Coverage](LICENSE_COVERAGE.md) and [Release Gate](RELEASE_GATE.md).
