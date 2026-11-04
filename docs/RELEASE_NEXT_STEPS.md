# Preparing the next release candidate

Release readiness is specific to a source commit, dependency lockfile, toolchain, and immutable image. Do not reuse a previous candidate's evidence or approvals after changing those inputs.

1. Complete and review the implementation PR. Include relevant English documentation, regression tests, output-conformance reports, and any required notices.
2. Wait for the actual required GitHub checks. Local checks help find problems but cannot predict all runner or repository-policy outcomes.
3. Create a candidate through the protected [release process](RELEASE_PROCESS.md). Record its commit, image identity, tool versions, fixtures, test results, failures, and skips.
4. Verify source access, license/SBOM evidence, artifact assembly, checksums, and anonymous distribution requirements against that exact candidate.
5. Obtain the authorized engineering, legal/IP, and steward decisions required by [Release Policy](RELEASE_POLICY.md). Automated conformance checks do not replace those decisions.
6. Publish only through the authorized workflow and verify the resulting public assets. If publication is partial, retain the candidate identity and diagnose the failed step before rebuilding or retrying.

For local preparation use [Local Publication Preflight](LOCAL_PUBLICATION_PREFLIGHT.md). For output-format testing use [Output Validation](OUTPUT_VALIDATION.md). This document deliberately does not state the current status of a remote package, branch protection, approval, or release.
