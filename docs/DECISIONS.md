# Architecture Decision Records

This index records **rationale** separately from tested behavior. Material implementation choices require an ADR before or with merge.

| ADR | Decision | Rationale | Status |
| --- | --- | --- | --- |
| 0001 | Prefer open geospatial interchange artifacts | Reduce downstream vendor lock-in | Founding principle |
| 0002 | Explicit elevation and CRS semantics | Prevent misrepresentation of measurements | Founding principle |
| 0003 | Begin with bounded self-hosted single-worker architecture | Predictable local operations; avoid premature distributed claims | Current single-host architecture; review when implementation changes |
| 0004 | Maintain AGPL-3.0-only Community with separate Enterprise license rights | Preserve community freedoms and support commercial deployment under separate legal terms | Founding policy |

For new records create `docs/adr/NNNN-short-title.md` with context, options, decision, consequences, authorship and review date.
