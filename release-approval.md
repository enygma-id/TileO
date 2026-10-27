# TileO v0.2.0 — Release Readiness and Human Signoff Record

**Edition policy:** Community original source AGPL-3.0-only; Enterprise commercial first-party licensing subject to Enygma rights. Distributed third-party components must be **predominantly permissive with only exact-file, reviewed GCC/CA exceptions**; neither edition alters upstream license rights.

**Status: NOT APPROVED — awaiting regenerated, artifact-bound evidence and human authorization.** The 26 October candidate report, its asserted 129 passing tests and any preliminary image digest are historical and do not by themselves certify this or a later commit.

## Evidence that must be completed for the final candidate

| Gate | Required verified record | Status |
| --- | --- | --- |
| E0 — Baseline | Clean commit, source/lockfile/Dockerfile/manifest hashes and image ID | PENDING |
| E1 — Distribution inventory | Final image SPDX/CycloneDX, complete filesystem/ELF/embedded-binary closure, disallowed binary absence | PENDING |
| E2 — Functional tests | Raw Node TAP/integration/browser logs, exit status, parsed counts with no mandatory failure/skip | PENDING |
| E3 — License obligations | License/notice parity, exact GCC runtime source/patches and CA trust-store source/provenance/access | PENDING |
| E4 — Scoped exceptions | EXC-001 `libstdc++`, EXC-002 `libgcc`, EXC-003 Mozilla CA: hashes, legal terms, delivery route, authorizations | PENDING |
| E5 — Release controls | Fail-closed certification and negative controls, approved source/image identity, protected publication workflow | PENDING |

Previous candidate artifacts may be found under `artifacts/compliance/`, but their mere presence or recorded `passed: true` is not E0–E5 acceptance. Do not reuse stale test counts or SBOMs without evidence they belong to the exact final candidate.

## Human release authorization

| Reviewer role | Decision | Source commit | Image identity | Review date |
| --- | --- | --- | --- | --- |
| Authorized Enygma Legal/IP reviewer | **PENDING** | Not recorded | Not recorded | Not signed |
| Authorized Release Engineering reviewer | **PENDING** | Not recorded | Not recorded | Not signed |

Actual signed approval should be maintained in the controlled release evidence system; this public Markdown reports only the current decision state and must not expose private reviewer identities, contracts or customer information.

**Release rule:** Do not create `v0.2.0`, publish a container image or announce a compliant Enterprise distribution while any required evidence or signoff is pending. See [release process](docs/RELEASE_PROCESS.md), [third-party release gate](third-party/RELEASE_GATE.md), [exceptions](third-party/ENTERPRISE_EXCEPTIONS.md), and [source access](third-party/SOURCE_ACCESS.md).
