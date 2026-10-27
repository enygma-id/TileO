# Third-Party Source Availability and Recipient Rights

TileO Community source is provided under AGPL-3.0-only for identified first-party files. The corresponding source and redistribution terms for **third-party runtime libraries and certificate data** are independent of the license granted by Enygma for Community or Enterprise TileO code.

## When TileO binaries are distributed

If a published Community image/binary or a delivered Enterprise image contains `libstdc++`, `libgcc` or Mozilla-derived CA trust-store material, the distributor must supply required licenses/notices and meet the **actual applicable upstream source-availability and distribution terms**. Making the TileO application's source available is not a substitute for the corresponding-source obligations of third-party GPL libraries.

For each binary release, the responsible maintainer must publish or deliver a release-specific inventory identifying:

- immutable distributed image digest and platform;
- exact library/certificate file names, versions and SHA-256 hashes;
- corresponding upstream source, relevant distribution patches/build recipes, and their archive checksums;
- original GPL, GCC Runtime Library Exception and verified Mozilla/packaging licenses and notices;
- a working download/access method satisfying the applicable license and distribution mode, including any required offer/retention conditions;
- contact or support instructions for recipient requests, where that is part of the chosen compliance method.

## Publication status

**Release v1.0.0 source-access artifacts are not declared available by this policy page.** A release must not be distributed until the required source files and access method have been checked, documented and approved. Do not substitute placeholders, a generic upstream homepage or a mismatched version for the source required by a particular shipped binary.

Community and Enterprise recipients retain all rights their relevant third-party licenses grant, including applicable redistribution rights. Customer-specific delivery packages may be private, but requirements attached to publicly distributed binaries must be honored for their recipients as well.

See [Enterprise Third-Party Exceptions](ENTERPRISE_EXCEPTIONS.md), [Native Component Register](NATIVE_COMPONENTS.md) and [Release Gate](RELEASE_GATE.md).
