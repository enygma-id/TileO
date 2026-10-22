# TileO Foundation v5.4 — Staging Package QA

**Basis:** v5.3 foundation archive with ATAP source dataset trio, Clean 4 documentation and two official logos.  
**Intended publication:** four-file sample collection, with RGB binary supplied by the repository publisher before the public commit/release. This foundation ZIP is a **staging package**, not itself a claim that all four binaries are present inside it.

## Source dataset integrity

- `footprints.geojson` (37 features), `dsm.tif`, `dtm.tif`: preserved byte-for-byte from the ATAP sample ZIP, with the original [MANIFEST.sha256](samples/TileO-Samples-01/MANIFEST.sha256) unchanged.
- RGB `samples/TileO-Samples-01/data/rgb-tif.tif`: **not embedded in this ZIP**. The maintainer must put its real TIFF bytes in the existing `data/` folder before committing the complete sample. The public README and licensing documents describe the final intended repository state.
- Do not create an empty TIFF placeholder or a fake checksum. Run `python3 scripts/finalize-sample-rgb.py` **after** placing the actual TIFF to compute the real file size and SHA-256, then verify it with `--check`.
- Verify Git LFS is installed, that `rgb-tif.tif` is staged as LFS content, and that the remote LFS object is accessible after publishing.

## Licensing, AI, and provenance

- ATAP trio: original CC BY 4.0 data notice plus source README, attribution and SHA-256 manifest retained.
- TileO RGB: explicitly CC BY 4.0 under the collection notice, subject to Enygma's rights statement and inspection of the actual file prior to publication.
- ATAP project GitHub credit is separate from TileO/ATAP AGPL software licensing.
- [AI Acknowledgement](AI_ACKNOWLEDGEMENT.md) documents AI-assisted workflows without attributing authorship or ownership to a model.
- Third-party npm and native/container license gate remains a separate release obligation; no blanket permissive-only certification is made.

## Final commit gate

Only publish the root README as a **four-file included** catalogue **after** `rgb-tif.tif` has been placed in `data/` and its integrity/rights have been verified. Review the final repository tree and make sure the required runtime application source is imported before representing Quick Start as executable.
