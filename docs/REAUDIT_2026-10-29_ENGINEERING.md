# Reaudit revision 1.1 implementation record

Scope: PUB-01–PUB-03 and closure sequencing for the first public 0.1.0 release.
This is an implementation record, not final candidate closure or authorization.

Implemented:

- Deterministic SOURCE-ACCESS generation from candidate/source provenance,
  with versioned Release routes, closure paths, package versions, platform,
  binary subject, source archive hashes and notice references.
- Frozen-core staging validation: exact asset/checksum coverage, safe unique
  checksum entries, core file sizes/hashes and subject, source-provenance hashes,
  and closure delivery record bound to that core digest. A self-consistent old
  source/checksum pair cannot override approved core hashes.
- Anonymous HTTPS source/assets download before image push; actual downloaded
  bytes are checked against core, source archives opened with tar, receipts
  stored outside core. Full publication verification repeats source checks and
  verifies registry identity; registry failure retains partial status.
- Actions runs the Compose API/worker smoke and truthful preliminary report
  before controls, then finalizes provenance again after final closure report.
  The image/core built in that run remain the canonical subject through protected
  review; previous WSL evidence is not selected or relabeled.
- CA converter copyright/license material is copied from the actual verified
  source archive, and musl's MIT notice is labeled separately.

Executed host checks on modified source:

- Typecheck exit 0.
- npm test with TILEO_INTEGRATION=1: exit 0, 130 application tests passed,
  zero failed/skipped; six source-access regression cases also passed.
- Final SA01–SA06 rerun after closure binding added: exit 0, six passed.
- Workflow YAML, JS/Python syntax and diff whitespace checks passed.

Logs and checksums: artifacts/wsl-reaudit-20261029/source-access-host-tests/.
These logs are explicitly dirty-source host diagnostics, not candidate evidence.
Earlier exit 2 build attempt was blocked by sandbox EROFS writing dist; the
successful host retry had write access. A later tar-based SA attempt was blocked
by sandbox EPERM; its permitted retry passed. Both attempts remain preserved.
SA04 uses labeled HTTP Response fixtures and verifies absent credentials; SA06
tests partial-status logic and workflow ordering. No live source/publication
verification or authenticated protected review was claimed from these tests.

Still required before final closure:

1. Freeze the implementation in a clean commit and regenerate one candidate,
   image export, source/binary bindings, inventories, SBOM, integration/browser,
   Compose smoke, controls, provenance, eligibility, core manifest and package.
   Preserve authentic cached GCC/CA inputs; reverify against the actual image.
2. Select the exact Actions candidate/core for protected reviews. Configure
   real reviewer identities/environments through reviewed policy; never apply
   old approvals to this changed source/core.
3. Obtain authentic approvals and protected publish=false dry-run evidence.
   NC22–NC24 remain pending until genuine run evidence exists.
4. Only after lawful authorization and public assets availability execute live
   anonymous source-access verification before image distribution, then full
   verification after push. Their receipts remain outside frozen core.

No tag, GitHub Release or registry publication was performed by this work.
Engineering, Legal/IP and Release Steward remain pending.
