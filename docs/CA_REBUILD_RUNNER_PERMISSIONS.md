# CA rebuild runner permissions

The reported protected workflow attempt exited 1 in prepare-compliance-packages
at fs.rmSync(/tmp/tileo-ca-build-...). Root in the rebuild container had written
directories/files through the host bind mount. A nonroot GitHub runner could
not remove them. The cleanup exception could also mask an earlier rebuild or
hash-equality exception; the printed certificate processing summary alone is
not proof of equality or source-verification PASS.

The rebuild now mounts inputs read-only at /input and extracts/builds in the
container's disposable /tmp filesystem. Certificate bytes are captured from
stdout, and the host process writes the output. Patch diagnostics go to stderr;
the same sorted certificate concatenation and expected-image hash check remain.
Source archive hashes, aport revisions, binary selection and license policy
are unchanged. No sudo cleanup, permissive chmod or ignored cleanup exception
is used to conceal failure.

Non-Docker unit regression tests cover read-only input arguments, host output
ownership/bytes, failed-build propagation and invalid archive name rejection.
The actual container rebuild/equality must pass in a new Actions attempt built
from the corrected commit. Previous WSL core/package bytes stay frozen and
their approvals cannot be transferred to the changed source subject.

Push the reviewed fix through normal repository protections, then dispatch a
new Protected 0.1.0 Release run on the resulting main with publish=false and
push_latest=false. Do not rerun the old workflow SHA expecting new code. Retain
the failed run for diagnostics; review the new candidate ID/image/core digest.
No publication or source-verification PASS is established by these unit tests.
