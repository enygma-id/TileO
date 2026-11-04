# Local publication preflight

Use this checklist before asking the protected release workflow to publish a candidate. It does not authorize publication or replace the repository's release policy.

1. Review the intended source changes and staged file list. Keep private keys, tokens, presigned URLs, local datasets, and generated audit tools out of commits.
2. Run `npm ci`, `npm run typecheck`, `npm run check:docs`, `npm test`, and the notice/license checks used by CI.
3. For output-format changes, prepare the isolated validators and run `npm run validate:outputs` as described in [Output Validation](OUTPUT_VALIDATION.md). Keep the reports attached to the tested commit.
4. Review native/browser integration results and all skipped tests against the candidate's required scope. Unit-only success is not release evidence for an untested native workflow.
5. Confirm required reviewers, branch/environment protections, source-access obligations, registry permissions, and artifact identities using the current protected release process.
6. Run the candidate dry run before any authorized publication. Preserve diagnostics when a step fails and resolve failures before advancing.

The local scripts do not establish GitHub organization permissions or package visibility. Use current service state rather than historical PR numbers or a prior run's approval.

See [Release Process](RELEASE_PROCESS.md), [Release Policy](RELEASE_POLICY.md), [Verification](VERIFICATION.md), and [Release Source Access](RELEASE_SOURCE_ACCESS.md) for authoritative procedures.
