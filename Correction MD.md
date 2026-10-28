# TileO — Independent Release Re-Audit of `Tileo-Clean(2).zip`

**Date:** 27 October 2026  
**Reference:** `TileO-Clean1-Independent-Release-Reaudit.md` / last four required closure tasks  
**Candidate:** TileO Community + Enterprise with exactly three disclosed runtime exceptions  
**Decision:** **NO-GO for v1.0.0.** Source-inventory checks PASS; strict Git detection improved; third-party corresponding-source evidence and cross-artifact provenance remain blocked.

## Audit method and limitations

Read the exact uploaded `Tileo-Clean(2).zip` and compared its member SHA-256 values against `Tileo-Clean(1).zip`. Independently extracted both source archives, opened their actual `.c`, `.cc`, headers, generated `certdata.txt`, source-generating script and APKBUILD contents. Ran Node.js license/source inventory checks; ran `certify-release-gate.js --image tileo-rc:0.2.0 --enforce-clean --enforce-human-approval` in an extracted checkout **without `.git`**; and ran the 12-negative-control script. Recomputed six source-baseline hashes and closure manifest hashes, and compared commit, image and test metadata. **No independent Docker image build/run or immutable OCI digest retrieval was possible in this environment.** The supplied ZIP is a clean export without `.git`, so an actual repository state/approval cannot be authenticated by the auditor.

## P0 closure matrix

| P0 | What improved | Independently observed blocker | Result |
|---|---|---|---|
| P0-01 Source–image–SBOM binding | `release-evidence/v0.2.0/source/source-baseline.json` matches the six packaged source files **6/6** | `artifacts/compliance/source-baseline.json` matches only **2/6**; release image provenance cites commit `bfd47d2…` with `dirty:true`, test report `a4ff1aa…`, current source evidence `4239c7f…`; `SOURCE_REPOSITORY_COMMIT.txt` `49c4410…` with `WORKING_TREE_DIRTY=true`. The image is only described by files, not independently executed/verified. | **OPEN** |
| P0-02 Integration tests | Supplied original TAP trailer and JSON both say **130 pass, 0 fail, 0 skipped** and exit code 0 | These logs identify test commit `a4ff1aaba869…` rather than source baseline `4239c7fb5c29…`; they cannot certify the final combined commit. | **PARTIAL PASS** |
| P0-03 Fail-closed certification and 12 negatives | Gate now refuses a missing Git checkout: **exit code 1**, `BLOCKED`; no release pass is generated in the reproduced test. | Gate 5 tests TAR entry names, **not source authenticity or sufficiency**; it prints verified for synthetic content. Gate 7 still accepts an editable Markdown `Decision: **GO**` by regex, not an authenticated reviewer/signature; image/test provenance is not cross-bound sufficiently. In ZIP environment, negative controls **11 PASS, NC-12 FAIL** due absent `.git`; rerun in real clean Git checkout. | **PARTIAL / OPEN** |
| P0-04 GCC / Mozilla CA source and reviewer evidence | `gcc` tar contains named trees and APKBUILD; `Mozilla` tar contains `certdata.txt`, PEM bundle and extraction script; hashes are registered. | GCC tree is **generated placeholder**, not GCC source; Mozilla `certdata.txt` is **reverse-created from the already-shipped PEM**, with invented labels and blanket trust bits; neither establishes genuine version-specific upstream provenance. Generation of exception `APPROVED` state depends on a mutable Markdown GO string. | **CRITICAL OPEN** |
| P0-05 Governance & release readiness | Source package and lockfile consistent at version **0.2.0**; v1 provisional closure from Clean1 no longer included. | The **v1.0.0** version/tag is not prepared; root `release-approval.md` reports GO for v0.2.0 but records **image sha256:89e…**, while image evidence identifies **sha256:e833…**. Closure hash manifest has **32 present matching + 2 missing** log files. Human protected-environment approval cannot be verified from source ZIP. | **OPEN** |

## Critical technical finding 1 — GCC source is an artificial source tree

**Artifact:** `release-evidence/v0.2.0/compliance/source/gcc-runtime-corresponding-source.tar.gz`, size **16,603 bytes**. Contains 51 TAR members, with **43,641 bytes total regular-file payload, of which `COPYING3` alone is 35,147 bytes**. The actual files include:

- `gcc-runtime-14.2.0/libgcc/libgcc2.c`: only a comment and `#include <stddef.h>`.
- `gcc-runtime-14.2.0/libstdc++-v3/src/c++11/thread.cc`: only a comment and `#include <thread>`.
- `gcc-runtime-14.2.0/libstdc++-v3/include/std/vector`: `#pragma once` and an empty `namespace std {}`.
- `gcc-runtime-14.2.0/APKBUILD`: a short locally authored approximation, not evidenced as the exact original Alpine packaging revision.

The cause is explicit in `scripts/prepare-compliance-packages.js` (the `fs.writeFileSync` calls that author each placeholder header, `.cc` and `.c` file). **Do not label this archive “complete GCC runtime corresponding source” or treat its manifest hash as proof.** Obtain actual GCC 14.2.0 upstream source, the exact Alpine source recipe/patchset matching the installed runtime package revision, and binding evidence to the shipped binary. If electing a compliant access route in lieu of bundling all source bytes, document its actual terms, reliability, and retrieval validation.

## Critical technical finding 2 — Mozilla CA `certdata.txt` is synthetic, not upstream NSS provenance

**Artifact:** `release-evidence/v0.2.0/compliance/source/mozilla-ca-bundle-source.tar.gz`, size **376,119 bytes**, 127 members. Contains 581,466-byte `certdata.txt` and 118 embedded PEM certificates. The 178,791-byte included `ca-certificates.crt` is **byte-identical** to `artifacts/ca-certificates.crt` (SHA-256 `5961c0a3c65459931c023e0075c09733f09aea4ca439cb85bc4a08bb4f3f568b`). This is a real file-integrity observation, but **not a source-origin proof**.

`scripts/prepare-compliance-packages.js` reads an existing PEM CA bundle, splits its PEM blocks and converts each certificate **back** to `CKA_VALUE MULTILINE_OCTAL`, creates fictitious names `Mozilla Root CA Certificate 001`, etc., and writes identical `CKT_NSS_TRUSTED_DELEGATOR` trust values across all roots including code-signing. It even contains a 120,000-character dummy-padding fallback if no bundle is found. This does not reproduce the original root-store policy and must not be represented as the authentic Mozilla NSS `certdata.txt`. Mozilla states that `certdata.txt` is its authoritative root-store source comprising both certificate and trust blocks, where trust attributes have independent significance.

**Correction:** retrieve authentic, immutable upstream NSS `certdata.txt` at the revision actually used by the specific CA bundle, and the exact corresponding Alpine extraction/update/package recipe. Preserve original fingerprints and trust semantics; verify output bundle equality or document/reconcile the known differences instead of inventing provenance from output. No automatic blanket trust flags.

## Gate verification and remaining test hazards

- **Executed** `node scripts/certify-release-gate.js --image tileo-rc:0.2.0 --enforce-clean --enforce-human-approval` from extracted ZIP. Exit code **1**; printed `Gate 6 Failed: Git repository detection error` and `Unable to determine valid 40-character Git commit SHA.` This **closes the specific prior fail-open symptom** in the ZIP environment.
- **Nevertheless**, same execution printed `Gate 5: Disclosed exceptions and source fulfillment verified` for the artificial source TARs: the current validator checks `tar --force-local -tzf` listings for `libstdc++-v3`, `libgcc`, `APKBUILD`, `certdata.txt`, etc., without checking actual implementation code or upstream hashes.
- **Gate 7** considers `/Decision:\s*\*\*GO\*\*/` in a mutable Markdown document a formal human approval; it only checks that the commit appears as a substring (if known). No authenticated role/attestation proof or immutable exception-register binding is required by this script.
- **Executed** `node scripts/test-negative-controls.js`; **11 cases PASS**, `NC-12 FAIL` because the expected rejection substring was not present when `.git` is missing. This does **not** demonstrate failure in a proper Git checkout, but **12/12 independent PASS has not been reproduced** from the delivered ZIP. Test cases must also cover fake but correctly named GCC source folders, reconstructed CA `certdata.txt`, unsigned GO document, mismatch of source/test/image commit, and modified manifests.
- CI workflow `.github/workflows/ci-cd.yml` contains `environment: release` on publishing (positive), but the checkout ZIP cannot prove that the GitHub environment actually requires authorized reviewers. Tag jobs should run strict clean and provenance controls; do not rely on editable approval text alone.

## Quantified provenance mismatches

- Packaged source baseline: `4239c7fb5c292f22492e8f80d93c6008ed6e4917`; six source hashes **6/6** match current package.
- Old image audit/source baseline: `bfd47d2d0b06e0d772d6dd40e8a08e97513b17e1`, `dirty:true`; against current files only **2/6** match.
- Test report commit: `a4ff1aaba869c15ff4220d06d688d704f176c1c4`; tests report image `sha256:e83389296365ed7b50680f5103fe79a8e22cabe4f82a966d8980e8a98f65546f`.
- Closure `SOURCE_REPOSITORY_COMMIT.txt`: `49c44107ac622bfad53e59e27fbf8d0cff11f6a5`, `WORKING_TREE_DIRTY=true`.
- Root release approval claims commit `4239c7f…` but image `sha256:89e0264a…` — **not** the e833 image reported by supplied test/image evidence.
- Closure `evidence-sha256.txt` (34 entries): 32 present and byte-hash matching, **two references missing**: `release-evidence/v0.2.0/gate/release-gate-negative-tests.log`, `release-evidence/v0.2.0/tests/integration-tests.stderr.log`.

## Offline checks that pass

```
node scripts/verify-npm-notices.js     -> exit 0, 285 total / 249 upstream-verified / 36 metadata-only
node scripts/verify-native-licenses.js -> exit 0, 28 native / 3 documented exceptions
node scripts/check-notice-parity.js    -> exit 0, 285 npm + 28 native parity
```

These are source/dependency inventory checks, not binary/compliance/release certification. The provided original test TAP trailer reports 130/130 PASS; the run itself was **not** independently repeated against a Docker image.

## Required programmer action — limited and verifiable

### A. Replace fabricated source generation with upstream-verified retrieval (P0, highest priority)

1. Remove generation of fake `libgcc/*.c`, `libstdc++-v3` source stubs and locally invented package recipes. Import genuine version-specific GNU GCC sources plus matching Alpine aports source revision and patches. Confirm source checksums independently with authoritative upstream; record versions, exact package revisions and build options.
2. Remove generation of `certdata.txt` from PEM, invented names/trust bits and dummy-padding fallback. Fetch authentic immutable NSS trust-store source and real distro conversion/selection recipe; verify output against the actual CA bundle or disclose/reconcile output differences.
3. If source archives cannot be downloaded or verified, **fail the compliance generator**; do not generate `source-provenance.json`, `reviewed-license-decision.md` or `APPROVED` claims. Such records must be produced only after the real source and binary linkage is verified and genuinely reviewed.
4. Enforce upstream SHA-256 checks and substantive source validation in gate; checking TAR names and archive size is inadequate. Derive runtime binary hashes **from immutable image**, rather than hardcoded text in the script. Review licensing of any converter helper script included with customer archive.

### B. Close provenance and certification bypass (P0)

1. Merge a **single** release commit and ensure `git status --porcelain` is empty; use that exact commit in source baseline, image provenance, test result, approval, and closure manifest. Treat missing Git identity as BLOCKED (new implementation handles this), and dirty repo as BLOCKED on all final certification.
2. Fail on *any* source–test–image commit mismatch, wrong image ID/digest or `dirty:true`. Parse TAP summary against JSON and enforce genuine positive tests, zero failures and mandatory skips; check provenance and checksum of actual original TAP.
3. Require authenticated, appropriately authorized human approvals bound to version/commit/image/evidence digest (e.g., protected GitHub release environment + immutable attestation). Public `release-approval.md` should **report** decisions, not authorize itself through regex.
4. Execute positive and expanded negative controls in a real clean Git checkout, including the specific synthetic-GCC and fabricated-NSS fixtures proven to bypass Gate 5. Do not treat pass on mock fixtures as evidence of genuine-source validity.

### C. Complete and freeze the final v1.0.0 evidence (P0)

1. Synchronize `package.json` and `package-lock.json` to `1.0.0` only when preparing the true release candidate; regenerate notices/manifest.
2. Build the image once, rerun audits and container integration tests on **that** image, produce clean CI logs, SPDX/CycloneDX SBOM, image provenance, 6/6 baseline, three exception records, and complete human approvals.
3. Generate closure manifest **after** all files are in place; reject any missing entry, including raw STDERR and negative-control logs. Confirm independent reproducibility with hash checking.
4. Keep `v1.0.0` tag and GHCR publication blocked until GO based on that frozen package and trusted approval.

## Independent GO criteria

`GCC real upstream source + real NSS certdata and exact packaging proof` **AND** `one clean source commit and immutable image` **AND** `matching genuine TAP/SBOM/evidence/approval` **AND** `complete closure manifest + real protected human signoff` **AND** `positive+negative certification controls`.

**This audit does not recommend replacing GDAL, PROJ or the GIS engine, and does not require repeating finished generic Markdown remediation. The present deficiency concerns false upstream-source provenance and release certification evidence, not a demonstrated core GIS conversion failure.**
