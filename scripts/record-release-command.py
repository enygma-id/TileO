#!/usr/bin/env python3
"""Operational command logger; never manufactures release verdicts."""
import datetime, hashlib, json, os, pathlib, subprocess, sys
root = pathlib.Path(sys.argv[1]); name = sys.argv[2]; command = sys.argv[3:]
root.mkdir(parents=True, exist_ok=True)
record = root / (name + '.json')
if record.exists():
    raise SystemExit('Refusing to overwrite command record: ' + str(record))
stdout = root / (name + '.stdout.log'); stderr = root / (name + '.stderr.log')
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
print('RUN ' + json.dumps(command), flush=True)
with stdout.open('xb') as out, stderr.open('xb') as err:
    try:
        result = subprocess.run(command, stdout=out, stderr=err)
        code = result.returncode
    except OSError as error:
        err.write(str(error).encode()); code = 127
def hashfile(p):
    with p.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()
data = dict(command=command, cwd=os.getcwd(), started_at=started,
    completed_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    exit_code=code if code >= 0 else 128-code, signal=-code if code < 0 else None,
    commit=os.environ.get('TILEO_COMMIT'), image_id=os.environ.get('TILEO_IMAGE_ID'),
    stdout=str(stdout), stderr=str(stderr), stdout_sha256=hashfile(stdout), stderr_sha256=hashfile(stderr))
record.write_text(json.dumps(data, indent=2)+'\n')
print('EXIT ' + str(data['exit_code']) + ' ' + str(record), flush=True)
if code:
    print(stderr.read_text(errors='replace')[-12000:], file=sys.stderr)
sys.exit(data['exit_code'])
