# Third-Party License Evidence and Coverage

## Current repository inventory

- Source of npm dependency versions: committed [`package-lock.json`](../package-lock.json).
- Non-root npm package entries in the recorded inventory: **291**, including direct, transitive, development and optional-platform packages.
- **252** entries have license text extracted from the exact upstream tarball, with tarball SHA-512 integrity checked and stored-file SHA-256 recorded in [`MANIFEST.json`](MANIFEST.json).
- **39** entries have no LICENSE/COPYING/NOTICE file in their exact tarball. Their `package.json` license metadata is retained and they are marked **`metadata_only_no_license_file`**; 13 are runtime/optional and 26 are development-only. These entries are not represented as verified upstream license files.
- Native runtime evidence is pinned in [`native/components.json`](native/components.json): **28 components**, **3 documented exceptions** (GCC runtime libraries under the GCC Runtime Library Exception, and the CA bundle as MPL-2.0 data).

Package listings are not proof that every listed package is included in a particular runtime image. Conversely, npm inventories do not describe the complete native binary and operating-system dependency closure.

## Coverage table

| Material | Current evidence | Remaining obligation |
| --- | --- | --- |
| Npm version inventory | 291 entries in the lockfile and manifest | Regenerate on dependency changes |
| Collected npm notices | 252 verified upstream files + 39 metadata-only records, indexed by SHA-256 | Review the 13 runtime/optional metadata-only entries before a strict release claim |
| Native runtime components | 28 pinned components with license corpus and hashes | Confirm exact final-image versions and ELF closure |
| Lucide / Feather | Local [asset notice](licenses/assets/lucide-icons/LICENSE-ISC-and-Feather-MIT.txt) | Check asset provenance/version and applicable attributions |
| Tippecanoe | Native corpus under [licenses/native/tippecanoe/](licenses/native/tippecanoe/) plus bundled-component notices | Verify all components of the distributed binary |
| GDAL / PROJ and linked libraries | Pinned corpus and [NATIVE_COMPONENTS.md](NATIVE_COMPONENTS.md) | Reconcile against the actual release image |
| Container/OS packages | Dockerfile currently Debian-based; scratch/musl migration is a separate release task | Produce final-image SBOM, `ldd`/`readelf` closure and image digest |
| Dataset files | [CC BY 4.0 dataset notice](../samples/TileO-Samples-01/LICENSE-CC-BY-4.0.md) | Continue provenance, accuracy and attribution reviews |

## Evidence limitations

A standard MIT/BSD/Apache license template without the copyright holder's upstream notice does not by itself demonstrate compliance. A valid SBOM helps inventory components but does not prove all license obligations have been met. The project does not claim that a built image is *100% permissive-only verified* merely because the npm lockfile contains permissive license alternatives.

See the [upstream verification process](UPSTREAM_VERIFICATION.md), [native component inventory](NATIVE_COMPONENTS.md) and [release gate](RELEASE_GATE.md).
