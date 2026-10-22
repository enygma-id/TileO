# Release and Distribution Policy

## Separation of milestones

1. **Founding documentation commit:** project identity, attribution, governance, licensing, samples scaffold and third-party reference inventory. No runnable application promised.
2. **Official implementation import:** provenance-reviewed PR including source, test fixtures, actual CLI/API contract, lockfile and exact build scripts.
3. **Candidate release:** execute tests and validate output formats, storage/security, reference dataset behavior, CI and platform support.
4. **Distributable artifacts:** generate BOM and notices from the exact container/binary build; resolve native library licensing and attest image digests.
5. **Public release:** tag only after maintainer/steward acceptance, with release notes and supported targets. Enterprise distribution additionally requires contributor rights clearance.

No snapshot test report is automatically a public release certification. A product label, version, README status or passing npm audit cannot override missing native notice compliance, skipped functional integration checks, or unclear authorship.
