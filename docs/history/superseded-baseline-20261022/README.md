# SUPERSEDED — NOT RELEASE EVIDENCE

The two SBOMs and notices are retained verbatim as historical audit material from
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

## Historical vulnerability inventory

The SPDX SBOM still records fast-uri 3.1.8/4.2.2, Fastify 5.12.5, fflate 0.7.4,
and image-size 0.7.5. OSV Scanner 2.5.1 reproduced all seven advisories reported
by Scorecard on 5 November 2026 from this file alone. Neither current lockfile
reported affected packages in the same scan. This is a historical record of
vulnerable versions, not an inventory of current application dependencies.

[osv-scanner.toml](osv-scanner.toml) contains vulnerability-only overrides for
those five exact package versions. OSV applies this configuration only to files
in this directory; it does not propagate to child directories or affect the
root or independent-validator lockfiles. License checks remain enabled. Keep
new manifests, current SBOMs, and executable dependencies outside this archive.
See [OSV's configuration rules](https://github.com/google/osv-scanner/blob/v2.5.1/docs/configuration.md).

To inspect the original historical findings, use an empty configuration file
to override the directory-local configuration:

```sh
empty_config=$(mktemp)
osv-scanner scan source --config "$empty_config" \
  --lockfile docs/history/superseded-baseline-20261022/sbom.spdx.json
```

An exit status of 1 means vulnerabilities were found. The overrides do not make
this old baseline safe to deploy and do not replace final-image SBOM scanning.
