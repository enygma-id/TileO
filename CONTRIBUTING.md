# Contributing to TileO

Thank you for contributing to TileO.

TileO is an Enygma-founded open-source project whose canonical public code is licensed under **AGPL-3.0-only**, with a separate Enterprise/commercial licensing path for material over which Enygma holds sufficient rights. Contribution provenance is therefore a core project requirement, not an administrative afterthought.

## Before contributing

Read:

- [GOVERNANCE.md](GOVERNANCE.md)
- [CLA.md](CLA.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

Do not submit a pull request containing source or assets you are not authorized to contribute.

## Contribution workflow

1. Create an issue or design discussion when a change is material, security-sensitive, architectural, or likely to affect persisted formats or public APIs.
2. Work in a branch or fork; do not rely on direct pushes to the primary branch.
3. Keep commits attributable to the people who actually authored the work.
4. Add or update tests and documentation appropriate to the change.
5. Identify all new third-party code, assets, generated material, standards text, datasets, fonts, or binaries.
6. Submit a pull request using the repository template.
7. Complete the applicable CLA process before merge when required.
8. Address maintainer review and licensing/security checks.

## Authorship and provenance

Do not manufacture Git history, co-author trailers, or source-file authorship merely to acknowledge historical roles. Historical founding credit belongs in [FOUNDING_TEAM.md](FOUNDING_TEAM.md); code authorship belongs in actual source history.

If a contribution reuses code from an earlier prototype or another repository, preserve the original authorship and provide enough provenance for maintainers to verify that TileO has the right to publish and, where intended, commercially license that material.

If earlier work only informed the design but no source was copied, describe that honestly as knowledge transfer rather than code derivation.

## Licensing of contributions

Unless a file is clearly identified otherwise, contributions accepted into the canonical public TileO codebase are distributed under **AGPL-3.0-only**.

By submitting a contribution, you must have the right to grant the permissions required by the applicable [CLA.md](CLA.md). The Project Steward may require a recorded electronic or signed CLA before merging a contribution.

## Source headers

For new source files owned by the project, use the project SPDX license identifier where file-header conventions allow it:

```text
SPDX-License-Identifier: AGPL-3.0-only
```

Do not replace or remove valid third-party copyright or license notices.

## Dependencies

A new dependency must be reviewed for:

- license identity and version;
- required notices;
- relevant transitive licensing obligations;
- binary bundling/runtime behavior;
- compatibility with AGPL distribution; and
- compatibility with any separate Enterprise distribution.

Update [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) when a merged change affects the dependency inventory. Newly introduced non-permissive or unknown-license components are not automatically covered by the three [narrowly scoped exceptions](third-party/ENTERPRISE_EXCEPTIONS.md); propose an explicit review before merge.

## Security

Do not disclose suspected vulnerabilities in a public issue. Follow [SECURITY.md](SECURITY.md).

Never commit secrets, cloud credentials, signed storage URLs, private keys, production tokens, internal customer data, or sensitive infrastructure configuration.

## Quality

Implementation pull requests should be reproducible and testable. Claims such as "production-ready", "lossless", "validated", or "cross-platform" must be supported by evidence that matches the scope of the claim.

## Maintainer review

Maintainers may request changes or decline a contribution for technical, security, provenance, licensing, scope, maintenance, or compatibility reasons.

Acceptance of one contribution does not guarantee acceptance of similar future work.

## AI-assisted contributions

AI assistance is allowed as an engineering aid, but contributors remain responsible for submitted code, tests, provenance, license compliance and security. In PR descriptions, disclose material AI-assisted changes when relevant for review or rights clearance. Do not list an AI model as a human co-author, create synthetic commits, or assume generated code is free of third-party obligations. See [AI_ACKNOWLEDGEMENT.md](AI_ACKNOWLEDGEMENT.md).
