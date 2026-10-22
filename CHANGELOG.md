# Changelog

## Unreleased — foundation documentation v5.4 (2026-10-22)

- Aligned the final public sample catalogue to the intended four-dataset `TileO-Samples-01` layout: three original ATAP inputs and the TileO RGB GeoTIFF, all identified under CC BY 4.0.
- Preserved the three ATAP source binaries, original ATAP data license and original checksum manifest without modification; retained the ATAP project attribution and GIS/CRS cautions.
- Added a collection-level RGB integrity helper and documented the required pre-publication verification separately from the public dataset catalogue. The TIFF binary itself is supplied by the repository publisher, not synthesized in the foundation archive.
- Added project [AI Acknowledgement](AI_ACKNOWLEDGEMENT.md) and human-accountability guidance for AI-assisted contributions.
- Kept Clean 4 Quick Start, dual-theme logos, founding record, Community/Enterprise licensing and third-party notices from v5.3.

---

## v5.3 — ATAP sample payload integration (2026-10-22)

- Imported ATAP Sample Area 01 original `data/footprints.geojson` (37 buildings), `data/dsm.tif`, and `data/dtm.tif` from the source ZIP supplied by Enygma. Verified all three original SHA-256 hashes without modifying the data files.
- Preserved the original ATAP `LICENSE-DATA.md` and `MANIFEST.sha256`; saved the original ATAP README without edits as `ATAP_SOURCE_README.md`.
- Added the ATAP project link, corrected all sample cards and data manifests to refer to **real** included inputs, and recorded CRS differences and geographic non-anonymity.
- At that stage, reserved `samples/TileO-Samples-01/data/rgb-tif.tif` for subsequent publication under CC BY 4.0; no placeholder TIFF was fabricated.
- Corrected `.gitignore` and `.gitattributes` so sample data is committed while only the large RGB TIFF is LFS-tracked.

TileO's public changelog tracks actual repository changes. Do not backdate Git commits or invent released binary versions.

## Unreleased — founding documentation

- Established project documentation, governance, founding credits, AGPL-3.0-only Community license and separate Enterprise licensing policy.
- Added the two user-supplied, unmodified TileO logos with automatic light/dark theme switching in the GitHub README.
- Retained the technical README style selected by the founding team and added a **source-accurate Docker/native Quick Start** from TileO Clean 4 (for use after code import).
- Updated technical references to the Clean 4 TypeScript snapshot, including API, tooling, operations, clean export, TypeScript architecture and implementation README reference.
- Included `samples/TileO-Samples-01/` as the sole reserved sample directory without dataset payloads.
- Refreshed all 284 versioned npm notice files and license manifest from the Clean 4 generated notices. Documented upstream fallback notices and outstanding release-image native compliance separately.
- No runnable application source or public software release is implied by this documentation commit.

## Historical origin

Erick Karya, Hanafi and Dony are recorded in [FOUNDING_TEAM.md](FOUNDING_TEAM.md). Their historical roles do not imply synthetic Git commit attribution or determine individual source ownership.

## Foundation documentation v5.2 — Samples catalogue alignment

- Expanded the main README with a dedicated `Samples` section, dataset inventory, ATAP origin citation, licensing boundary and payload availability.
- Added dedicated ATAP GeoJSON and RGB GeoTIFF dataset cards to `samples/TileO-Samples-01/`.
- Preserved CC BY 4.0 dataset-level designation and all existing project/third-party licensing documentation.
- Prepared Git LFS attributes for later upload of the large raster; actual sample data were **not** invented or included in the documentation ZIP.
- Kept the Clean 4 Quick Start, Enygma governance, permanent founding recognition and both light/dark logos unchanged.
