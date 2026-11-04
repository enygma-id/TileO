# Security maintenance

This guide describes repository controls and the administrator work needed to operate them. It complements the [security reporting policy](../SECURITY.md), [dependency policy](DEPENDENCY_POLICY.md), and [release process](RELEASE_PROCESS.md).

## Automated checks

| Control | Implementation | Evidence and limits |
| --- | --- | --- |
| Dependency updates | [Dependabot configuration](../.github/dependabot.yml) | Weekly proposals for application npm dependencies, independent validators, and GitHub Actions. Updates require review and passing checks. |
| Dependency vulnerability checks | [Security workflow](../.github/workflows/security.yml) | Audits both complete lockfiles, including development dependencies. Either audit failure fails the job; both JSON reports are retained. |
| Static analysis | [CodeQL workflow](../.github/workflows/codeql.yml) | JavaScript/TypeScript and Python with extended security queries on pull requests, pushes to `main`, and a weekly schedule. Findings are published to code scanning after GitHub runs the workflow. |
| Property-based fuzzing | [Security properties](../tests/security-fuzz.test.js) | fast-check exercises JSON preservation, attribute filtering, UTF-8 stream boundaries, feature byte limits, and origin spoofing. Normal `npm test` runs 1,000 cases per property; the security workflow runs 10,000. |
| Action integrity | GitHub workflow `uses` references | Actions are pinned to full commit SHAs. Dependabot proposals must preserve full SHA pins. |
| Signed release provenance | [Protected release workflow](../.github/workflows/release.yml) | After human authorization, GitHub OIDC signs the staged release assets. Verification must succeed before tag/release publication. |

Fuzzing is a development check, separate from the production image's integration tests. Reproduce a reported fast-check seed from the repository root:

```bash
npm ci
npm run build
FC_SEED=12345 FC_NUM_RUNS=10000 node --test tests/security-fuzz.test.js
```

Failure output includes the seed, shrinking path, and counterexample. Preserve that output when investigating a failure. These properties cover specific input boundaries; they do not claim exhaustive parser or application security coverage.

## Dependency remediation

The 2026-11-04 review started from OpenSSF Scorecard's 5.2 snapshot for commit `f81fb466330f038f7649ac37aed942d1dc290a7d`. The independent validator lockfile contained vulnerable Sharp 0.34.5 and minimatch 3.x/5.x. Its overrides now pin Sharp 0.35.5 and minimatch 11.0.4. These address [Sharp's libvips advisory](https://github.com/advisories/GHSA-f88m-g3jw-g9cj), [libheif advisory](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c), [librsvg advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w), and [minimatch's denial-of-service advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249). Isolation from the runtime image does not substitute for patching audit tools.

The root lockfile already contained patched fast-uri 3.1.9/4.2.3, Fastify 5.12.7, and fflate 0.8.3. `image-size` was absent from both current lockfiles. Do not interpret an aggregate Scorecard finding as proof that every listed advisory affects the currently installed application. Compare affected version ranges and actual dependency paths, then rerun both audits. A clean audit only reflects the advisories known to its provider at that time.

After remediation on 2026-11-04, both npm audits reported zero vulnerabilities. An OSV batch query covering 434 distinct exact package versions across the two lockfiles returned no affected versions. The 14-result output conformance matrix passed with the updated validator tree, including WMTS with 46 passed, zero failed, and 13 skipped checks. The skipped checks remain visible in the report and are not counted as passes.

```bash
npm audit
npm audit --prefix tools/output-validation
npm run validators:setup
npm run validate:outputs -- --out-dir artifacts/security-output-conformance
```

Use a fresh output directory for each conformance run. Validator overrides cross upstream version ranges; the full output matrix must pass before accepting an update. Keep these tools outside the production dependency tree and image, as described in [Output Validation](OUTPUT_VALIDATION.md).

Node type declarations must track the supported runtime major in `package.json` (currently Node 24). Dependabot keeps `@types/node` major updates pending a deliberate runtime migration; its minor and patch updates remain enabled. Compiler updates still require typecheck, build, and runtime tests. IPC callbacks must recheck connection state before disconnecting because the channel can close while a send is queued.

An automated dependency PR does not regenerate TileO's license evidence. Whenever the root lockfile changes, refresh the upstream manifest, redistribution notices, and dependency inventory together, and review the resulting license evidence before merging. A stale inventory can block unrelated workflow-update PRs that inherit the same `main` commit. Formal license-election rows and their tests refer to exact currently locked versions; removed dependencies must not leave placeholder elections.

Root lockfile changes also require the existing upstream notice and license gates:

```bash
node scripts/verify-npm-notices.js --update
node scripts/generate-third-party-notices.js
node scripts/generate-dependency-inventory.js
node scripts/check-notice-parity.js
npm run release:gate
npm test
npm run check:docs
```

Never bypass these checks to merge an automated dependency update.

## Release signatures

The protected workflow still requires Engineering, Legal-IP, and Release Steward review plus the trusted negative proof. Only its authorized publication path requests signing. The new `TileO-v0.1.0-provenance.sigstore.json` asset is a Sigstore bundle generated by the SHA-pinned `actions/attest` action. It is kept outside the frozen payload and checksum directory so source and license evidence retain their existing validation rules.

[Provenance verification](../scripts/lib/release-attestations.js) invokes GitHub CLI for every payload file and `SHA256SUMS`, enforcing the repository, release workflow, exact source and signer commit, `main` ref, and GitHub-hosted runner. The publication verifier downloads the public bundle anonymously and verifies the public payload again. A signature failure cannot produce `PUBLISHED_VERIFIED`.

Consumers can verify an individual downloaded asset using a current GitHub CLI:

```bash
gh attestation verify TileO-0.1.0-source.tar.gz \
  --bundle TileO-v0.1.0-provenance.sigstore.json \
  --repo enygma-id/TileO \
  --signer-workflow enygma-id/TileO/.github/workflows/release.yml \
  --source-digest <approved-release-commit> \
  --deny-self-hosted-runners
```

See [GitHub's attestation documentation](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations) and the [CLI verification policy](https://cli.github.com/manual/gh_attestation_verify). Adding workflow steps does not retroactively sign the published `v0.1.0` release. This workflow remains version-specific; a subsequent release needs its own versioned evidence and normal protected release preparation. Preserve existing release tags and artifacts.

## Administrator follow-up

Repository files cannot establish every Scorecard control. After merging, an administrator should:

1. Confirm private vulnerability reporting is enabled under **Settings → Code security**, then test the [private reporting form](https://github.com/enygma-id/TileO/security/advisories/new). Keep its availability consistent with the reporting policy.
2. Confirm code scanning accepts the advanced CodeQL workflow. If default setup is already enabled, choose the intended setup in repository settings rather than running conflicting configurations.
3. Review `main` protection or rulesets: require pull requests, approving reviews, the applicable CI/security checks, and restrict force pushes and deletion. Preserve the existing release environments and reviewer protections.
4. If Scorecard still reports Branch-Protection as inconclusive, inspect its authentication and permissions using the [official fine-grained token guidance](https://github.com/ossf/scorecard-action/blob/main/docs/authentication/fine-grained-auth-token.md). An unreadable protection API is not evidence that protection is absent. Never commit an administrator token or grant broad write access just to make this check readable.
5. Complete a truthful [OpenSSF Best Practices assessment](https://www.bestpractices.dev/) if the project meets the criteria. Registration and human attestations are separate from adding repository files.

At the 2026-11-04 review, the public reporting API returned `enabled: false` and the public branch-rules endpoint returned an empty ruleset list. The latter does not establish the state of classic branch protection; review both settings through an administrator account.

The Maintained check includes repository age and activity; the Contributors check reflects actual independent participation. These findings require real project history and participation. Do not create artificial activity or claim a badge to alter the score.

After the workflows have run on `main`, inspect the new [Scorecard snapshot](https://scorecard.dev/viewer/?uri=github.com/enygma-id/TileO), including its date and scanned commit. The score may lag the merge. CodeQL execution, hosted signature generation, settings, and a new public score must be verified on GitHub; local checks cannot certify them.
