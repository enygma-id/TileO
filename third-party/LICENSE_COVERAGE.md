# Third-Party License Evidence and Coverage

## Current repository inventory

- Source of npm dependency versions: committed [`package-lock.json`](../package-lock.json).
- Non-root npm package entries in the recorded inventory: **284**, including direct, transitive, development and optional-platform packages.
- Recorded entries have a corresponding path and SHA-256 in [`MANIFEST.json`](MANIFEST.json). The per-package archive under `licenses/npm/` contains **284 indexed notice files**.
- **36** entries used generic license-text fallback material during notice collection; they still require upstream version-specific LICENSE, NOTICE and copyright checks before redistributing affected artifacts.

Package listings are not proof that every listed package is included in a particular runtime image. Conversely, npm inventories do not describe the complete native binary and operating-system dependency closure.

## Coverage table

| Material | Current evidence | Remaining obligation |
| --- | --- | --- |
| Npm version inventory | 284 entries in the lockfile and manifest | Regenerate on dependency changes |
| Collected npm notices | 284 archived files, indexed by SHA-256 | Verify exact upstream notices for 36 fallback entries and other upstream notices not captured |
| Lucide / Feather | Local [asset notice](licenses/assets/lucide-icons/LICENSE-ISC-and-Feather-MIT.txt) | Check asset provenance/version and applicable attributions |
| Tippecanoe | Native [notice directory](licenses/native/tippecanoe-2.79.0/) | Verify all components of distributed binary |
| GDAL / PROJ and linked libraries | Component inventory in [NATIVE_COMPONENTS.md](NATIVE_COMPONENTS.md) | Obtain exact corresponding upstream licenses and notices for released binaries |
| Container/OS packages | Distribution-specific audit not complete | Verify actual final image, certificates, dynamic/static library closure and image digest |
| Dataset files | [CC BY 4.0 dataset notice](../samples/TileO-Samples-01/LICENSE-CC-BY-4.0.md) | Continue provenance, accuracy and attribution reviews |

## Evidence limitations

A standard MIT/BSD/Apache license template without the copyright holder's upstream notice does not by itself demonstrate compliance. A valid SBOM helps inventory components but does not prove all license obligations have been met. The project does not claim that a built image is *100% permissive-only verified* merely because the npm lockfile contains permissive license alternatives.

See the [upstream verification process](UPSTREAM_VERIFICATION.md), [native component inventory](NATIVE_COMPONENTS.md) and [release gate](RELEASE_GATE.md).
