# Release Process

## Prerequisites

- Confirm the candidate commit, protected branch approvals and authoritative version information.
- Run build, typecheck and relevant unit/API and native-tool integration tests on supported target environments.
- Verify security-sensitive inputs, storage credentials, API exposure and operational limits.
- Audit the complete final image and immutable identity, including embedded binaries, native linkage and required third-party notices; verify the three narrowly scoped GCC/CA exceptions and corresponding-source access before signoff.
- Verify contributor provenance, the applicable Community/Enterprise grant, sample data permissions and attribution.
- Prepare release notes, known limitations, compatibility/migration guidance and reproducible checksums.
- Require separate Release Engineering, Legal/IP, and Release Steward human approval of the same source/image/core evidence digest; publish the exact approved image and compare its registry digest to the evidence.

## Verification commands

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run release:gate
```

These commands are **development checks**, not a full image-compliance certificate. The version-specific `v0.1.0` protected workflow requires the release owner to build one candidate, archive raw integration/browser output, validate the frozen core manifest and final-image SPDX/CycloneDX SBOMs, and confirm authentic GCC/Mozilla source fulfillment. Within that workflow, tagging, GitHub Release creation and GHCR push are gated on separate authenticated Engineering, Legal/IP and Release Steward approvals for the exact candidate. See [source availability](../third-party/SOURCE_ACCESS.md) and [exceptions](../third-party/ENTERPRISE_EXCEPTIONS.md).

Some real-tool integration and browser tests require dedicated fixtures, installed executables or explicit environment configuration. Do not treat skipped tests as successful end-to-end validation. See [Testing](TESTING.md), [Verification](VERIFICATION.md) and [Tools & Prerequisites](TOOLS.md).

## Published v0.1.0 status

As reviewed on 2026-11-04, the public [v0.1.0 release notes](https://github.com/enygma-id/TileO/releases/tag/v0.1.0) describe a release candidate and state that publication, final URLs, and registry digests remain pending authenticated Engineering, Legal/IP, and Release Steward approval. A GitHub Release entry exists, while its notes still record pending authorization. Full production approval is therefore not established by that entry.

Before changing this status, reconcile the release notes with authenticated approval records and publication verification for the same source commit, immutable image, and frozen core evidence. CI results, output conformance, and signature verification support that review but do not grant human authorization. Approval records must reflect actual decisions; preserve the existing tag and artifacts when correcting status documentation.

## Edition labeling

Identify Community and Enterprise artifacts distinctly. The separate commercial licensing path applies only to code and rights explicitly covered by an executed agreement; public AGPL permissions already granted are not retroactively revoked.

See [Release Policy](RELEASE_POLICY.md) and [Third-Party License Gate](../third-party/RELEASE_GATE.md).
