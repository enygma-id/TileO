# Release and Distribution Policy

TileO development, tagged releases and distributable images are separate milestones. Source code in the repository does not automatically imply that every documented capability or platform has been certified for production.

## Release stages

1. **Development and review:** changes land through authorized review with clear provenance, suitable tests and updated documentation.
2. **Release candidate:** freeze the candidate source, lockfile and build configuration; run relevant API, unit, geospatial-tool and platform-specific integration checks.
3. **Artifact verification:** identify binary outputs and container image digests, verify sample data integrity, validate output formats and assess operational/security limitations.
4. **Third-party compliance:** reconcile complete shipped npm/native/embedded content against the exact artifact. Default to permissive licenses; verify and separately authorize the three candidate GCC/CA exceptions, applicable source access and original notices.
5. **Authorization and publication:** only after independent technical checks and authorized human GO, tag the approved clean commit, publish the same audited artifact, verify registry digest and provide applicable third-party notices/source access.

A prior test report is useful evidence but is **not** an automatic certification of later software builds or different machines. Passing one automated license scan also does not establish complete rights clearance.

## License boundaries

TileO Community source is published under **AGPL-3.0-only**, except for clearly marked third-party code and other materials with their own licenses. Enterprise distribution requires a separate agreement and rights clearance. Samples use their [file-specific data licenses](../samples/TileO-Samples-01/LICENSE-CC-BY-4.0.md).

Three candidate exceptions are described in [Third-Party Exceptions](../third-party/ENTERPRISE_EXCEPTIONS.md). Their approval is release-specific, and distributing Community binaries triggers the same applicable upstream license obligations.

See the [release process](RELEASE_PROCESS.md), [verification guidance](VERIFICATION.md), [dependency policy](DEPENDENCY_POLICY.md), and [third-party release gate](../third-party/RELEASE_GATE.md).
