# TileO Governance

## 1. Purpose

This document defines governance for the canonical TileO project: project stewardship, historical founding recognition, maintainer authority, contribution decisions, release control, licensing governance, and repository security.

## 2. Canonical project

The official TileO repository is maintained under the Enygma-controlled GitHub organization. Mirrors, forks, experiments, or private deployments are not canonical unless the Project Steward explicitly designates them as such.

The canonical repository should remain organization-owned rather than dependent on a single individual's personal account.

## 3. Founding Organization

**PT Enygma Solusi Negeri (Enygma)** is the TileO **Founding Organization**.

Enygma initiated TileO, established the official project, and is responsible for long-term stewardship of the canonical repository and official project identity.

## 4. Founding Leadership

### Erick Karya — Founder & Founding Vision Lead

**GitHub:** [@erickkarya](https://github.com/erickkarya)  
**Role at founding:** CEO, Enygma

Erick originated and directed the founding vision for TileO and is permanently recognized as Founder and Founding Vision Lead.

### Hanafi — Founding Prototype Engineer & First Prototype Initiator

**GitHub:** [@hanafi2274](https://github.com/hanafi2274)

Hanafi was the first person asked to create a TileO prototype and established the early implementation knowledge that informed the official project.

### Dony — Founding Official Implementation Engineer & Initial Core Developer

**GitHub:** [@donyariefianto](https://github.com/donyariefianto)

Dony built the first official TileO implementation using the technical knowledge and lessons established through the prototype phase.

The permanent historical record is maintained in [FOUNDING_TEAM.md](FOUNDING_TEAM.md).

## 5. Project Steward

**PT Enygma Solusi Negeri** serves as Project Steward.

The Project Steward is responsible for long-term continuity of the official project, including:

- official project identity and canonical repository designation;
- governance policy;
- trademark and brand stewardship;
- license stewardship where Enygma has sufficient legal rights;
- contributor-agreement policy;
- appointment and removal of maintainers;
- official release policy;
- security escalation;
- institutional representation;
- commercial and Enterprise licensing decisions; and
- sustainability of official project infrastructure.

Project Stewardship does not permit revocation of open-source rights already granted to recipients under an applicable release.

## 6. Governance roles

### 6.1 Founding Leadership

Founding Leadership is a permanent historical designation. It does not expire when a person's employment title changes and does not itself grant perpetual administrative or merge authority.

### 6.2 Core Maintainers

Core Maintainers are trusted contributors with review and merge authority over one or more core areas.

They are responsible for:

- reviewing pull requests;
- maintaining quality and compatibility;
- enforcing engineering, security, and licensing standards;
- coordinating releases;
- maintaining documentation;
- protecting contribution provenance; and
- escalating material architectural, security, or legal issues.

### 6.3 Area Maintainers

Area Maintainers may be appointed for domains such as:

- raster and elevation processing;
- vector processing;
- 3D and 3D Tiles;
- storage and remote I/O;
- API and worker runtime;
- web preview and visualization;
- documentation;
- security; and
- build/release infrastructure.

### 6.4 Contributors

Contributors participate through issues, documentation, tests, code, design proposals, review, or other accepted project work. Contribution does not automatically confer maintainer status.

## 7. Repository authority

Operational access should follow least privilege.

The primary branch should be protected. Once implementation work begins, normal changes should enter through reviewed pull requests rather than direct pushes. Force-push and history rewriting on the primary branch should be disabled except for extraordinary recovery explicitly approved by the Project Steward.

Repository administration should be limited to persons who need organization, security, or release authority. Write access does not imply Admin access.

## 8. Decisions

Routine technical decisions are made through normal maintainer review.

Material decisions should be documented when they affect:

- public APIs or persisted formats;
- architecture boundaries;
- security posture;
- licensing or dependency policy;
- project governance;
- release compatibility; or
- the boundary between Community and Enterprise offerings.

Where consensus cannot be reached, the Project Steward may make the final official-project decision after considering maintainer input.

## 9. Release governance

Official releases must originate from the canonical repository and should be reproducible from a tagged commit.

A release must not be labeled production-certified merely because unit, browser, or single-environment integration tests pass. Claims must match documented verification evidence.

## 10. Contributions and provenance

Contributors must have the legal right to submit their work. Third-party code must not be copied into TileO without compatible licensing, attribution, and provenance.

External contributions require the applicable CLA process unless the Project Steward explicitly establishes another contribution regime.

Where implementation knowledge is transferred without direct code copying, the project should preserve historical recognition without manufacturing false source authorship. Where source code is reused, actual authorship and applicable rights must be preserved.

## 11. Founding recognition vs. current authority

Founding recognition and current operational authority are intentionally separate.

A Founding Team member remains historically credited even if they later leave Enygma or no longer maintain the project. A future community contributor may become a Core Maintainer without becoming a founding member.

## 12. Licensing governance

Canonical public TileO source is released under **GNU Affero General Public License, Version 3 only (`AGPL-3.0-only`)**, except for components clearly identified as third-party material under another license.

No maintainer may unilaterally change the license of code for which the project does not hold sufficient rights.

Where Enygma owns or has sufficient rights, Enygma may grant separate commercial licenses. Alternative commercial licensing does not revoke rights already granted under an AGPL release.

The Project Steward must preserve sufficient chain-of-title or licensing authority before representing community contributions as available under Enterprise terms.

## 13. Enterprise licensing

The Enterprise Edition is a separate commercial offering governed by [ENTERPRISE.md](ENTERPRISE.md) and the applicable written agreement with Enygma.

No feature, module, or contribution may be moved from Community to Enterprise in a way that purports to revoke rights already granted in an AGPL release.

## 14. Third-party and dependency governance

Third-party dependencies retain their own licenses. Before a dependency or binary distribution is introduced, maintainers must review:

- declared license and version;
- direct and relevant transitive dependencies;
- required notices and attribution;
- binary/runtime bundling obligations;
- compatibility with AGPL distribution; and
- compatibility with any separate Enterprise distribution where applicable.

The project maintains [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) as the public inventory entry point.

## 15. Security

The Project Steward and designated security maintainers may temporarily restrict disclosure, repository access, or release information when reasonably necessary to coordinate vulnerability remediation or protect users and infrastructure.

Security procedures must not be used as a pretext to remove open-source rights already granted under the license.

## 16. Governance changes

Material changes to this governance document require:

1. a documented proposal;
2. reasonable opportunity for Core Maintainer review; and
3. approval by the Project Steward.

Changes must not retroactively erase founding recognition or purport to revoke rights already granted under an applicable open-source license.

---

**Founded by Enygma. Governed with auditable provenance.**
