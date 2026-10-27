# Enterprise-Compatible Third-Party Exceptions

TileO Community source is licensed under **AGPL-3.0-only** for covered first-party material. Where Enygma holds sufficient rights, it may separately license its first-party software under a written commercial agreement. Independently licensed third-party software and certificate data **retain their own licenses** in Community and Enterprise distributions.

## Distribution policy

TileO Enterprise is **designed for proprietary-compatible distribution using predominantly permissively licensed third-party components**, plus the three narrowly scoped exception candidates below. **None is a permissive license.** A listed component is **not approved for a particular release** merely because it appears here.

| ID | Specific material | Applicable terms to verify on the actual distribution | Required fulfillment |
| --- | --- | --- | --- |
| EXC-001 | GCC C++ runtime (`libstdc++.so.6` and verified variants) | GPL with **GCC Runtime Library Exception 3.1**, where supported by the exact GCC build | Original texts/notices, applicable corresponding source and a legally adequate access method; matching file/hash/image review |
| EXC-002 | GCC runtime support (`libgcc_s.so.1` and verified variants) | GPL with **GCC Runtime Library Exception 3.1**, where applicable | Same; one corresponding GCC source package may cover both only when verified |
| EXC-003 | Identified Mozilla-derived root CA certificate/trust-store material | Actual Mozilla/NSS certificate source and packaging notices, potentially including **MPL-2.0** and **MIT** | Precise file hashes and source lineage, applicable notices/source availability and review of modifications |

The GCC Runtime Library Exception can permit eligible linking with independent proprietary programs; **it does not remove obligations relating to redistribution of the runtime libraries themselves**. Mozilla/MPL terms likewise do not automatically impose a license on unrelated proprietary application files, but the actual terms on the distributed CA material still apply. A commercial TileO license does not override third-party rights.

## Release-specific approval and customer rights

A release requires a signed record tying each exception to **the exact shipped filename, version, SHA-256, source package/patch provenance, immutable image digest, notice delivery and source-access location**. Missing or unverifiable evidence is a release blocker. The final decision belongs to authorized Enygma Legal/IP and Release Engineering reviewers, not to this public document.

A customer does **not** need to purchase separate GCC or Mozilla licenses merely to run the covered binaries. The customer may keep independently licensed proprietary application code private where the relevant combination is lawful and applicable terms are met. Redistribution or modification of the third-party components may create additional obligations; the applicable upstream licenses—not the Enterprise contract—govern those rights.

## Third-party source availability

For each Community or Enterprise binary distribution containing covered materials, provide the actual required notices and a legally adequate corresponding-source mechanism **for that same release**. See the [source-access policy](SOURCE_ACCESS.md). Do not describe a future or unavailable archive as already accessible. A public GHCR release carrying these components is subject to applicable recipient rights even when no Enterprise customer is involved.

## Status

**Policy adopted for drafting; release-specific exception authorization PENDING.** This file does not certify any build, satisfy source-delivery duties by itself, or announce that `v1.0.0` has shipped. Refer to the [release gate](RELEASE_GATE.md) for verification.
