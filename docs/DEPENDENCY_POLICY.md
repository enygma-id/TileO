# Third-Party Dependency and Enterprise Distribution Policy

## License boundaries

The original TileO Community source is published under **AGPL-3.0-only** where identified. Enygma may separately license first-party material when it has sufficient rights. Third-party software and certificate data remain subject to their own licenses, regardless of edition.

**Enterprise policy:** TileO Enterprise is designed for proprietary-compatible distribution using **predominantly permissively licensed third-party components, with three narrowly scoped, evidence-backed exceptions**. An exception is not a permissive license and is not a license grant by Enygma.

| License family or material | Default decision |
| --- | --- |
| MIT, BSD, ISC, Apache-2.0, 0BSD, Zlib and other verified permissive terms | Eligible with complete notices, applicable patent/copyright conditions and artifact checks |
| `OR` expressions | Record the valid selected alternative; preserve the required terms |
| `AND` expressions | Satisfy every applicable license |
| `libstdc++`, `libgcc` (exact eligible GCC runtime files) | **Exception candidate**, only if shipped licenses, GCC Runtime Library Exception, corresponding source and approvals are verified |
| Mozilla-derived CA trust-store material (exact files) | **Exception candidate**, only if provenance, applicable Mozilla/packaging terms, source/access and approvals are verified |
| Other LGPL, GPL, AGPL, MPL, EPL, CDDL or custom/restrictive terms | **REVIEW/BLOCK**: not automatically approved merely because another component has an exception |
| Unknown license, embedded binary or untraceable asset | **BLOCK** until resolved |

The three exception candidates are described in [Enterprise Third-Party Exceptions](../third-party/ENTERPRISE_EXCEPTIONS.md). Their eligibility applies to **verified exact files in a specific image** and requires authorized human approval. It cannot be inherited by another package sharing the same license family.

## Release evidence

A package manager license field, `FROM scratch`, collected license text, SBOM or prior audit result does not alone certify a build. The final audit must enumerate **all shipped files and relevant linkage**, inspect embedded binaries, match original sources/notices, demonstrate legal source access, verify source commit and immutable image identity, and record functional tests and reviewer decisions. Community binary distribution triggers relevant third-party obligations independently of any Enterprise contract.

See [Dependency Inventory](../third-party/DEPENDENCIES.md), [Native Components](../third-party/NATIVE_COMPONENTS.md), [License Coverage](../third-party/LICENSE_COVERAGE.md), [Source Access](../third-party/SOURCE_ACCESS.md) and [Release Gate](../third-party/RELEASE_GATE.md).
