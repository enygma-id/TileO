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

These commands are **development checks**, not a full image-compliance certificate. For the first public release `v0.1.0`, the release owner must use `.github/workflows/release.yml` to build one candidate, archive raw integration/browser output, validate the frozen core manifest and final-image SPDX/CycloneDX SBOMs, and confirm authentic GCC/Mozilla source fulfillment. Tagging, GitHub Release creation and GHCR push remain disabled until the exact candidate receives separate authenticated Engineering, Legal/IP and Release Steward approvals. See [source availability](../third-party/SOURCE_ACCESS.md) and [exceptions](../third-party/ENTERPRISE_EXCEPTIONS.md).

Some real-tool integration and browser tests require dedicated fixtures, installed executables or explicit environment configuration. Do not treat skipped tests as successful end-to-end validation. See [Testing](TESTING.md), [Verification](VERIFICATION.md) and [Tools & Prerequisites](TOOLS.md).

## Edition labeling

Identify Community and Enterprise artifacts distinctly. The separate commercial licensing path applies only to code and rights explicitly covered by an executed agreement; public AGPL permissions already granted are not retroactively revoked.

See [Release Policy](RELEASE_POLICY.md) and [Third-Party License Gate](../third-party/RELEASE_GATE.md).
