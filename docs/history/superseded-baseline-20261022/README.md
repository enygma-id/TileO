# SUPERSEDED — NOT RELEASE EVIDENCE

These three files are retained verbatim as historical audit material from
22 October 2026. They are excluded from Docker context/runtime and must never
be read as the SBOM or notices of a current image. Git history is retained.
Use the exact candidate evidence root and scanner invocation for final SBOMs.

Reference inventory at remediation: Dockerfile COPY baseline (removed);
src/tests/notices-sbom.test.ts baseline SBOM test (replaced by absence check);
scripts/generate-third-party-notices.js --baseline writer (retired).
.github/workflows/release-gate.yml source-tree SBOM baseline writer (removed;
final SBOM scanning/validation runs after the candidate image build).
Other source_baseline/baseline_image_id variables refer to current commit or
negative-control subjects, not this historic directory. CSS baseline alignment
and operational performance-baseline prose are unrelated.
