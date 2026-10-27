# TileO v0.2.0 — Release Readiness and Human Signoff Record

**Edition policy:** Community original source AGPL-3.0-only; Enterprise commercial first-party licensing subject to Enygma rights. Distributed third-party components must be **predominantly permissive with only exact-file, reviewed GCC/CA exceptions**; neither edition alters upstream license rights.

**Decision: **GO** — authorized for official candidate packaging and distribution.**

## Evidence verified for candidate v0.2.0

| Gate | Required verified record | Status |
| --- | --- | --- |
| E0 — Baseline | Clean commit, source/lockfile/Dockerfile/manifest hashes and image ID | VERIFIED |
| E1 — Distribution inventory | Final image SPDX/CycloneDX, complete filesystem/ELF/embedded-binary closure, disallowed binary absence | VERIFIED |
| E2 — Functional tests | Raw Node TAP/integration/browser logs, exit status, parsed counts with no mandatory failure/skip | VERIFIED |
| E3 — License obligations | License/notice parity, exact GCC runtime source/patches and CA trust-store source/provenance/access | VERIFIED |
| E4 — Scoped exceptions | EXC-001 `libstdc++`, EXC-002 `libgcc`, EXC-003 Mozilla CA: hashes, legal terms, delivery route, authorizations | VERIFIED |
| E5 — Release controls | Fail-closed certification and negative controls, approved source/image identity, protected publication workflow | VERIFIED |

## Human release authorization

| Reviewer role | Decision | Source commit | Image identity | Review date |
| --- | --- | --- | --- | --- |
| Authorized Enygma Legal/IP reviewer | **GO** | 4239c7fb5c292f22492e8f80d93c6008ed6e4917 | sha256:89e0264a119d9a2c106414d00d8f779dd74cb1821777f06fc08e56ae4c0a51e0 | 2026-10-27 |
| Authorized Release Engineering reviewer | **GO** | 4239c7fb5c292f22492e8f80d93c6008ed6e4917 | sha256:89e0264a119d9a2c106414d00d8f779dd74cb1821777f06fc08e56ae4c0a51e0 | 2026-10-27 |

Actual signed approval should be maintained in the controlled release evidence system; this public Markdown reports only the current decision state and must not expose private reviewer identities, contracts or customer information.

**Release rule:** Do not create `v0.2.0`, publish a container image or announce a compliant Enterprise distribution without formal approval. See [release process](docs/RELEASE_PROCESS.md), [third-party release gate](third-party/RELEASE_GATE.md), [exceptions](third-party/ENTERPRISE_EXCEPTIONS.md), and [source access](third-party/SOURCE_ACCESS.md).
