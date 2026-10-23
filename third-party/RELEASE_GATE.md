# Third-Party License Release Gate

Before publishing any Docker image, binary, npm package or Enterprise product, review the exact artifact and complete the applicable gates below. Having source code or documentation in GitHub is not proof that a distributed build has passed these gates.

- [ ] Confirm committed code, versioned lockfile, container build recipe and dependency digests exactly match the release candidate.
- [ ] Identify every distributed npm package, direct/transitive/optional package included in the artifact, including its full upstream notice and actual license expression.
- [ ] Preserve all copyright notices, modified-file indications, patent and attribution conditions, NOTICE material and `OR` license elections.
- [ ] List native binaries and **all transitive linked ELF/shared libraries**, including Node runtime, GDAL/PROJ drivers, libcurl/libpsl/libidn2/libunistring and their relevant versions.
- [ ] Resolve residual LGPL/GPL/MPL presence according to the declared release policy; if kept, comply with actual requirements rather than claiming strict permissive-only.
- [ ] Reconcile `musl`, `libcurl`, SQLite and other native version strings to the real binary package inventory; avoid carrying forward historical version tables.
- [ ] Document certificates, fonts, icons, geospatial datasets, OSM attribution and any unrelated asset licenses separately.
- [ ] Generate SBOM (SPDX/CycloneDX) from the final image, confirm missing/unresolved native components are inventoried and include exact image digest.
- [ ] Run build, tests including native integration, security review and license policies in the correct **Node 24** environment.
- [ ] Verify the release pipeline builds and distributes the **same Dockerfile/image digest actually approved**.
- [ ] Verify Enterprise rights (contractor contributions, license grant/CLA, source provenance) independently of third-party permissive status.
- [ ] Record reviewer/date/results and publish complete notices with every required redistribution artifact.

The npm dependency inventory records permissive options and mixed expressions, but a strict permissive-only *container* classification requires binary-level verification and resolution of all applicable native and transitive obligations. See [NATIVE_COMPONENTS.md](NATIVE_COMPONENTS.md).
