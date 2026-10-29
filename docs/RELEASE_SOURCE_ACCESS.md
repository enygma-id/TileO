# TileO 0.1.0 source-access verification

All release evidence and approvals must refer to one committed candidate,
image export and frozen core digest. Old WSL candidates remain historical;
they must not be relabeled as the candidate built by Actions. The protected
workflow builds the canonical candidate and carries its exact core/image
artifacts through review without rebuilding after approval.

Before freeze, prepare-compliance-packages generates SOURCE-ACCESS.md from
candidate/source provenance, with closure-relative paths, versioned Release
URLs, package versions and source hashes. The source archives and runtime
binary hashes remain subject to verify-source-fulfillment; notices include
the actual CA converter source header and identify musl separately.

Run regression fixtures (never release evidence):

```bash
node scripts/test-source-access.js
```

After final report/provenance and core manifest, stage the required release
assets, including the authorized closure package. Create SHA256SUMS in that
directory, then validate it against the core before uploading:

```bash
node scripts/validate-release-assets.js --evidence-dir "$TILEO_EVIDENCE" --assets-dir /tmp/tileo-release-assets --closure /tmp/tileo-final/TileO-v0.1.0-Release-Closure.tar.gz --output /tmp/tileo-staged-assets.json
```

Only after authentic protected authorization may the publication workflow
create the public release. Once assets exist, before distributing the image:

```bash
node scripts/verify-public-source-access.js --candidate "$TILEO_EVIDENCE/candidate.json" --closure /tmp/tileo-final/TileO-v0.1.0-Release-Closure.tar.gz --out-dir /tmp/tileo-source-access
```

This verifier uses anonymous HTTPS, validates actual downloaded bytes against
the approved core and closure, and rejects unsafe/duplicate checksum entries,
HTML, empty/error responses and invalid source TARs. It requires no registry
image and produces SOURCE_ACCESS_VERIFIED only on success. Failure stops the
workflow before registry push. It cannot be run successfully against planned
URLs before authorized publication; lack of a public release remains pending.

After registry push, run full verification from a user terminal or Actions:

```bash
node scripts/verify-published-release.js --repo enygma-id/TileO --tag v0.1.0 --candidate "$TILEO_EVIDENCE/candidate.json" --closure /tmp/tileo-final/TileO-v0.1.0-Release-Closure.tar.gz --out-dir /tmp/tileo-publication
```

Full verification repeats anonymous source checks, verifies the tag and
registry pull identity. A registry failure after successful source verification
is PARTIALLY_PUBLISHED, never PUBLISHED_VERIFIED. Receipts and downloads are
outside core; use a new output directory for each retry. Actions preserves
attempt receipts even on failure. Do not modify the approved core to insert
postpublication receipts. Do not replace a previous release with --clobber.

Approval roles and protected environment configuration remain genuine human
requirements. Source/policy changes require a new candidate subject. A
publish=false run is for review; this document authorizes no publication.
