# Independent development validators

This separate npm project pins tools used by TileO's output conformance gate. It is not an application dependency and is excluded by `.dockerignore`.

Run `npm run validators:setup` from the repository root. Do not install this lockfile into the root application or copy its `node_modules` into a shipped runtime. Installation disables lifecycle scripts. An exact Sharp override uses its separately packaged native dependencies so the upstream validator can load without running install scripts. SQLite package formats such as 3DTILES are outside this gate's supported scope.

Cesium's transitive dependency tree includes `sharp`/image-processing components prohibited in TileO's production dependency tree. Keeping independent audit tools separate preserves that boundary; it does not approve those components for distribution. Tool licenses remain their upstream licenses. Downloaded OGC suites and the Protomaps binary are retained as local audit tools, with checksums, outside the application image.

See [Output Validation](../../docs/OUTPUT_VALIDATION.md) for prerequisites, coverage, runtime strict mode, and reports.
