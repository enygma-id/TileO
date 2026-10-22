# Canonical GitHub Founding Upload Plan

## Stage 1 — Open the official repository

- Repository owner: Enygma-controlled organization (target `enygma-id`).
- Create **without** generating GitHub's README, license or `.gitignore` automatically; upload this complete foundation as one reviewed first commit.
- Founding commit by the authenticated real committing account. Recommended message: `Initialize TileO project foundation`.
- Verify root `LICENSE` is AGPL-3.0-only, markdown links resolve, notices exist and history identifies the actual committer.

## Stage 2 — Configure governance before code

- Configure two-factor authentication and organization/repository access as appropriate.
- Protect `main`, disable force-push, require PR review and status checks **once the code checks actually exist**.
- Enable private vulnerability reporting and restrict release / settings privileges.
- Maintain historical founding recognition separately from operational permissions.

## Stage 3 — Give explicitly approved contributors access

- Appoint only authorized accounts. Hanafi's prototype attribution and Dony's official implementation attribution are historical; they are not automatic administrative permissions.
- Recommend `Write` or PR-based contribution rights, rather than unrestricted `Admin`, for implementation import.
- Verify a CLA/rights record **for the actual source**, including employer/contractor authorization.

## Stage 4 — Import official code as a PR

- Dony or another authorized developer opens PR for the actual implementation with provenance, versioned lockfile, source, tests, scripts and Docker paths.
- Compare the PR with [technical baseline](TECHNICAL_BASELINE.md), correct Node 24 CI and define the supported release Dockerfile.
- Re-run tests and security review, regenerate third-party notices/manifest from built artifacts.

## Stage 5 — Release separately

- Mark any findings that are documentation-and-sample-data versus blocking a published container.
- Approve distribution only against tested digests and exact licenses; separately record commercial rights for Enterprise.

**Do not fabricate historical Git commits** to credit prototype, vision or official implementation; preserve the truthful history and use [FOUNDING_TEAM.md](../FOUNDING_TEAM.md).


## Clean 4 branding and practical documentation checks

- Verify both theme-aware logo files exist in `assets/branding/` and render in README on light/dark GitHub themes. The social-preview/organization avatar must be configured separately in GitHub settings if needed.
- Confirm Quick Start commands refer to the **Clean 4 implementation**, but do not claim runnable source is already present in the documentation-and-sample-data commit.
- Preserve the 284 Clean 4 package notice archives and check the manifest SHA-256. Review exact upstream notice files before releasing actual software or Enterprise artifacts.

## Cross-project sample assets

Before committing the public four-file sample catalogue, place all four original datasets under `samples/TileO-Samples-01/data/`: the three ATAP Sample Area 01 inputs and Enygma’s `rgb-tif.tif`. Preserve the original ATAP license, source README and three-file checksum manifest unchanged; generate RGB integrity metadata using `python3 scripts/finalize-sample-rgb.py` after copying its actual bytes. Install Git LFS before staging the large RGB file, and confirm its remote object is uploaded. This is a **founding documentation-and-sample-data commit**, not an executable TileO source release; import official application code separately through reviewed PRs.
