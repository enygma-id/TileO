# TileO v0.1.0 — Release Readiness and Human Signoff Record

**Edition policy:** Community original source AGPL-3.0-only; Enterprise commercial first-party licensing subject to Enygma rights. Distributed third-party components must be **predominantly permissive with only exact-file, reviewed GCC/CA exceptions**; neither edition alters upstream license rights.

**Decision: PENDING — not authorized for publication or tagging.**

## Required evidence for candidate v0.1.0

| Gate | Required verified record | Status |
| --- | --- | --- |
| E0 — Baseline | Clean commit, source/lockfile/Dockerfile/manifest hashes and image ID | **PENDING CANDIDATE EVIDENCE** |
| E1 — Distribution inventory | Final image SPDX/CycloneDX, complete filesystem/ELF/embedded-binary closure, disallowed binary absence | **PENDING CANDIDATE EVIDENCE** |
| E2 — Functional tests | Raw Node TAP/integration/browser logs, exit status, parsed counts and declared scope exclusions | **PENDING CANDIDATE EVIDENCE** |
| E3 — License obligations | License/notice parity, exact GCC runtime source/patches and CA trust-store source/provenance/access | **PENDING CANDIDATE EVIDENCE** |
| E4 — Scoped exceptions | EXC-001 `libstdc++`, EXC-002 `libgcc`, EXC-003 Mozilla CA: hashes, legal terms, delivery route, authorizations | **HUMAN AUTHORIZATION PENDING** |
| E5 — Release controls | Fail-closed certification and negative controls, approved source/image identity, protected publication workflow | **PENDING CANDIDATE EVIDENCE** |

## Human release authorization

| Reviewer role | Decision | Source commit | Image identity | Review date |
| --- | --- | --- | --- | --- |
| Authorized Enygma Legal/IP reviewer | **PENDING** | — | — | — |
| Authorized Release Engineering reviewer | **PENDING** | — | — | — |
| Authorized Release Steward | **PENDING** | — | — | — |

Actual signed approval must be supplied to the protected release environment as a commit-, image-, and evidence-bound attestation. This public Markdown reports status only and cannot authorize a release.

**Release rule:** Do not create `v0.1.0`, publish a container image, GitHub Release, or announce a compliant Enterprise distribution without authenticated approval of the exact candidate from Engineering, Legal/IP, and the Release Steward. See [release process](docs/RELEASE_PROCESS.md), [third-party release gate](third-party/RELEASE_GATE.md), [exceptions](third-party/ENTERPRISE_EXCEPTIONS.md), and [source access](third-party/SOURCE_ACCESS.md).
