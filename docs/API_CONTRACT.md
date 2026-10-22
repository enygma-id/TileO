# API contract and compatibility policy

TileO's API is governed by the committed OpenAPI description **after it is imported and tested against the actual implementation**. API.md and `openapi.yaml` in the source snapshot are informative candidate inputs, not automatically canonical for releases that have not yet imported code.

## Contract rules

1. Publish an OpenAPI spec alongside the implementation used for each release.
2. Test representative success, validation failure, authentication failure, and missing-resource responses against the spec.
3. Document authentication and authorization separately from data conversion semantics.
4. Do not silently repurpose fields, units, or geospatial reference meanings.
5. Changes to response shapes, storage manifest schemas or jobs require compatibility discussion and changelog entry.
6. Treat job creation, retries, remote downloads and storage connectors as security-sensitive surfaces.
7. Never promise multi-tenant isolation absent independent security review and tests.

## Status of reference input

The provided archive contains `API.md` and `openapi.yaml`. The versioned contract will be incorporated after implementation approval; refer to [API.md](API.md) for snapshot-derived interface context.


---

**Snapshot note:** This founding documentation describes the TileO Clean 4 implementation baseline. Actual commands, integrations, drivers, versions, test results and release images must be verified when code is imported. See [Technical baseline](TECHNICAL_BASELINE.md) and [Release policy](RELEASE_POLICY.md).
