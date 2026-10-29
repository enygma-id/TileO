import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export function rebuildCa(work, sourceName, image, run = execFileSync) {
  if (!/^ca-certificates-[0-9]+\.tar\.bz2$/.test(sourceName)) throw Error('Invalid CA source archive name');
  const command = [
    'set -eu',
    'apk add --no-cache perl patch make >/dev/null',
    'mkdir /tmp/ca-rebuild',
    `tar -xjf /input/${sourceName} -C /tmp/ca-rebuild`,
    'src=$(find /tmp/ca-rebuild -mindepth 1 -maxdepth 1 -type d -name "ca-certificates-*" | head -n1)',
    'for p in /input/aport/*.patch; do [ -e "$p" ] || continue; patch -d "$src" -p1 < "$p" >&2; done',
    'make -C "$src" certdata.stamp >/dev/null',
    'cd "$src"',
    'find -- *.crt | sort | while read -r i; do cat "$i"; printf "\\n"; done',
  ].join('; ');
  // Container root writes only inside its disposable filesystem. The runner
  // owns the input directory and creates the captured output itself.
  const output = run('docker', ['run', '--rm', '--mount', `type=bind,source=${work},target=/input,readonly`, image, 'sh', '-lc', command], { stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 16 * 1024 * 1024 });
  fs.writeFileSync(path.join(work, 'generated-ca-certificates.crt'), output, { flag: 'wx' });
}
