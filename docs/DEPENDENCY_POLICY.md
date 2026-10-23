# Third-Party Dependency Policy

## Principle

TileO Community source is **AGPL-3.0-only**. TileO applies a **permissive-first** dependency policy. Selected releases may pursue a strict permissive-only third-party artifact profile, but that designation requires verification of the actual distributed artifacts. Copyleft dependencies are not automatically prohibited by AGPL and are not automatically incompatible with commercial licensing. Obligations are evaluated for the actual component, linking and distribution.

| License family | General review treatment |
|---|---|
| MIT, BSD-2/3, ISC, Apache-2.0, 0BSD, Zlib | Normally acceptable with copyright, disclaimer, patent/notice obligations preserved |
| `OR` multi-license offering a permissive option | Record explicit selected option and applicable texts |
| Combined `AND` licenses | Preserve and satisfy all applicable terms |
| LGPL, MPL, EPL, CDDL or similar | Require documented compliance; strict permissive-only release should exclude unless scoped exception is declared |
| GPL/AGPL third-party | Escalate for architectural and licensing review; incompatible with strict permissive-only classification |
| Unknown/custom/proprietary/data/media licenses | Block until provenance and rights confirmed |

No tool shall classify an image as 100% permissive based only on `package-lock.json`. Native ELF libraries, dynamically linked dependencies, base image packages, included certificates and bundled assets must be inventoried at the final image digest. An SBOM is evidence of identified components, not proof of legal compliance.

Follow [third-party inventory](../third-party/DEPENDENCIES.md), [native components](../third-party/NATIVE_COMPONENTS.md), [licensing coverage](../third-party/LICENSE_COVERAGE.md), and [release gate](../third-party/RELEASE_GATE.md).
