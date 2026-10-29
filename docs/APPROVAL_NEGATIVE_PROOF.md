# NC22–NC24 external proof contract (F01)

Core negative-controls.json keeps NC22–NC24 pending forever as a record of its
pre-review state. No manual status edits are allowed after freeze. G8 is a
mandatory authorization gate in addition to G7's fresh human approvals.

First configure and independently review the real reviewers/environment policy.
Run `node scripts/check-release-protections.js --out-dir /tmp/tileo-protection-check-UNIQUE`
with an administrator's authenticated gh CLI. This is a read-only check; retain
its raw responses and hashes. It rejects missing reviewer IDs, self-review,
admin bypass, unprotected main and reviewer sets unable to supply distinct
Engineering/Legal humans. Actual approval identities must be distinct.
The checker does not install protections or grant approval.

Dispatch Protected 0.1.0 Release on the reviewed main with publish=false and
push_latest=false. After the three genuine environment reviews, the harness:

1. Collects actual GitHub run/history metadata and authenticated approvals using
   the actual collector. The original attestation is separate from test inputs.
2. Runs the actual certifier baseline: G1–G7 must pass, with G8 deliberately
   blocking because no production proof is supplied. No production PASS exists.
3. Mutates copies of the attestation, explicitly labelled as attack inputs:
   missing Engineering role, rejected decision, unauthorized reviewer, wrong
   candidate, wrong core digest, wrong workflow run and replayed attempt.
4. Requires exit 1 and the relevant G7 rejection, with no unrelated failure or
   production PASS. Records commands, timestamps, exit/reasons, raw stdout/stderr,
   isolated reports, original metadata, implementation/policy hashes and the
   dry-run candidate/image/core identity. Core bytes remain immutable.
5. Uploads `tileo-approval-negative-proof` only after validator success. Failed
   attempts are uploaded with a different diagnostic name and cannot authorize.

Each authenticated approval comment must contain the actual candidate ID and
core digest shown by that run, plus explicit review statements (separated by
spaces or newlines): Engineering `COMPARE_SCOPE=ACCEPT_EXCLUSION`; Legal/IP
`RIGHTS=APPROVE EXCEPTIONS=EXC-001,EXC-002,EXC-003`; Release Steward
`REVIEW=ACCEPT`. These statements must follow real review, not be copied merely
to pass a check. If scope/rights are rejected, do not approve; resolve the issue
and regenerate/review the changed candidate. PR approval alone is insufficient.

The successful dry run emits regression proof, not production authorization.
An operator with authenticated gh CLI can independently validate and retain it:

```bash
node scripts/verify-approval-negative-proof.js --candidate /path/to/exact/dry-run/core/candidate.json --run-id ACTUAL_DRY_RUN_ID --out-dir /tmp/tileo-proof-check-UNIQUE
```

This command performs no Docker or publication and emits no authorization PASS.
Use the exact checked-out implementation/policy of that run; mismatches reject.

The production run uses a fresh candidate and fresh environment reviews. Its
negative_proof_run_id input must point to the completed successful prior dry run.
No publication is authorized by this document or by unit fixtures.

G8 fetches the proof by authenticated GitHub API, not by accepting a caller's
local JSON. It checks repository, main branch, exact workflow path, dispatch
event, commit, attempt 1, successful completion, unique nonexpired v4 artifact,
and the service's SHA-256 digest of downloaded ZIP bytes. ZIP extraction rejects
unsafe paths, duplicates/symlinks and excessive size. Raw proof/log hashes,
positive G7 baseline, complete rejection variants and PASS absence are checked.

Explicit reuse rule: at most seven days, exact same commit and implementation/
policy hashes. The proof records its own dry-run image/core; it is regression
proof only and does not approve a different production image/core. Production
G7 must independently match its own candidate/core/run/attempt and actual live
approval history. Reruns require a fresh workflow dispatch and fresh reviews.
Missing, failed/pending, stale, wrong-subject/policy, corrupted or untrusted proof
prevents PASS. Final packaging and prepublication guard revalidate proof.

The verified original ZIP is retained in external authorization storage and
included in authorized closure; raw evidence remains available after Actions
retention expires. No proof or post-review receipt is inserted into frozen core.

Unit tests use labelled artificial metadata and ZIP fixtures. They test the
validator and trust boundary, not real protected execution or human approval.
Actual execution acceptance remains pending until authentic Actions proof and
reviews are available.
