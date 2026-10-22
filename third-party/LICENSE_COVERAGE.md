# Third-party license evidence and completeness

## Snapshot basis

- Source: user-provided TileO Clean 4 implementation archive.
- Reference npm lockfile SHA-256: `70a37f180438e667479f0b8e29fbe282a020930397afc8dd964b403599897a61`.
- Npm package lockfile entries excluding root: **284**.
- Collected per-package license/notice texts: **284**, all checked against `MANIFEST.json` and each checksum.
- Upstream license-file reference from generated notice metadata: **248** entries identified a named upstream license-file field; **36** used canonical fallback text because a package-specific license file was not present to the generator.

The generated notice archive is comprehensive **for available Clean 4 notice entries**. The following cannot be certified solely from it: exact upstream file provenance, additional NOTICE/COPYRIGHT files, linked native drivers and libraries, binary distribution composition, data provenance and Enterprise contribution rights.

## Distinguish the three inventories

| Inventory | Coverage | Status |
| --- | --- | --- |
| Npm dependency metadata | 284 pinned entries | Complete for Clean 4 package-lock reference |
| Npm archived notice texts | One file for each pinned entry | Included; **36 fallback forms require upstream verification** |
| Native container/runtime closure | Node, glibc/musl, GDAL/PROJ, Tippecanoe, libcurl and other linked packages | Documented as a release gate; **not certified** by foundation documentation |

## Why fallback texts are not enough

Standard license permissions (MIT/BSD/Apache etc.) often require preservation of **the specific copyright and attribution notices**. A generic license template missing the upstream holder's copyright line cannot establish notice completeness even when the SPDX expression is known. License files must ultimately be taken from the precise installed/upstream version and checked in the shipped artifact.

## Outcome for first GitHub commit

This is a complete reference index with candid limitations and is suitable for **documentation-first repository initialization**. Do not label a runnable image "100% permissive-only verified" or "Enterprise rights cleared" without the independent release checks in [`RELEASE_GATE.md`](RELEASE_GATE.md).
