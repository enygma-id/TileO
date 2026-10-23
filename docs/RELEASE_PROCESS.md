# Release Process

## Prerequisites

- Confirm the candidate commit, protected branch approvals and authoritative version information.
- Run build, typecheck and relevant unit/API and native-tool integration tests on supported target environments.
- Verify security-sensitive inputs, storage credentials, API exposure and operational limits.
- Review `package-lock.json`, native binaries and linked libraries against the exact candidate image; resolve required third-party notices and distribution obligations.
- Verify contributor provenance, the applicable Community/Enterprise grant, sample data permissions and attribution.
- Prepare release notes, known limitations, compatibility/migration guidance and reproducible checksums.
- Have an authorized maintainer approve publication and record the released artifact digests.

## Verification commands

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run release:gate
```

Some real-tool integration and browser tests require dedicated fixtures, installed executables or explicit environment configuration. Do not treat skipped tests as successful end-to-end validation. See [Testing](TESTING.md), [Verification](VERIFICATION.md) and [Tools & Prerequisites](TOOLS.md).

## Edition labeling

Identify Community and Enterprise artifacts distinctly. The separate commercial licensing path applies only to code and rights explicitly covered by an executed agreement; public AGPL permissions already granted are not retroactively revoked.

See [Release Policy](RELEASE_POLICY.md) and [Third-Party License Gate](../third-party/RELEASE_GATE.md).
