# API Contract and Compatibility Policy

The committed [OpenAPI specification](../openapi.yaml) describes TileO's HTTP API. The application also serves its OpenAPI document at `/openapi.yaml` and the interactive API page at `/docs` when running. See the [HTTP API reference](../API.md) for explanations and examples, and [API guide](API.md) for usage-oriented details.

The OpenAPI document and implementation should be reviewed together for every release. A committed contract does not, by itself, demonstrate that every endpoint has passed a compliance test.

## Contract rules

1. Publish an OpenAPI specification alongside the implementation used for each release.
2. Test representative success, validation-failure, authentication-failure and missing-resource responses against the specification.
3. Document authentication and authorization separately from data conversion semantics.
4. Do not silently repurpose fields, units, geospatial reference systems or vertical semantics.
5. Record compatibility implications for changes to response types, job states, storage manifests or API parameters.
6. Treat uploads, job creation, retries, remote object access and storage credentials as security-sensitive surfaces.
7. Do not promise multi-tenant isolation without a corresponding architecture and security review.

## Change review

When an endpoint or schema changes, update `openapi.yaml`, the relevant implementation and tests, and public documentation in the same pull request. Note breaking changes in [CHANGELOG.md](../CHANGELOG.md) and the [release process](RELEASE_PROCESS.md).
