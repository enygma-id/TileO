#!/usr/bin/env node
import { mkdir, readFile, writeFile, rename, mkdtemp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const tools = resolve(process.env.TILEO_VALIDATOR_TOOLS_DIR || join(root, 'artifacts/output-validators'));
if (process.platform !== 'linux' || process.arch !== 'x64') throw new Error('The pinned conformance toolchain currently requires Linux x64 (including WSL).');
await mkdir(tools, { recursive: true });
const downloads = [
  ['ets-geotiff11-1.2-aio.jar', 'https://repo.maven.apache.org/maven2/org/opengis/cite/ets-geotiff11/1.2/ets-geotiff11-1.2-aio.jar', 'c0a5e644fcd35e2e7161d4bab04f390b13329f4c945839e53945204b12548899'],
  ['ets-wmts10-1.11-aio.jar', 'https://repo.maven.apache.org/maven2/org/opengis/cite/ets-wmts10/1.11/ets-wmts10-1.11-aio.jar', 'dc6b483f7bcbc4c7a2b61bd51e6eef4fc76b7b2ecdb26f26ec2699500a4c5081'],
  ['pmtiles.tar.gz', 'https://github.com/protomaps/go-pmtiles/releases/download/v1.31.2/go-pmtiles_1.31.2_Linux_x86_64.tar.gz', '3ed7dbf4ec2e6dfe5e25b6f70d1ffc932729f93c86db353bf514dd71010a312f'],
];
for (const [name, url, expected] of downloads) {
  const path = join(tools, name);
  let bytes = await readFile(path).catch(() => undefined);
  if (!bytes || createHash('sha256').update(bytes).digest('hex') !== expected) {
    const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
    if (!response.ok) throw new Error(`Download failed: ${url}: ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error(`Checksum mismatch: ${name}`);
    const temporary = await mkdtemp(join(tools, '.download-'));
    try {
      const staged = join(temporary, name);
      // codeql[js/http-to-file-access] The bytes are rejected unless their SHA-256 matches the pinned checksum
      // precomputed from the official validator artifact; the write is staged into a private mkdtemp directory
      // with exclusive-create permissions and atomically renamed into place.
      await writeFile(staged, bytes, { flag: 'wx', mode: 0o600 });
      await rename(staged, path);
    } finally { await rm(temporary, { recursive: true, force: true }); }
  }
}
for (const [command, args] of [
  ['tar', ['-xzf', join(tools, 'pmtiles.tar.gz'), '-C', tools, 'pmtiles']],
  [process.env.PYTHON || 'python3', ['-c', 'import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])', join(tools, 'ets-wmts10-1.11-aio.jar'), join(tools, 'wmts-runtime')]],
  ['npm', ['ci', '--prefix', join(root, 'tools/output-validation'), '--ignore-scripts', '--no-audit', '--no-fund']],
]) {
  const result = spawnSync(command, args, { stdio: 'inherit', cwd: root });
  if (result.status !== 0) throw new Error(`${command} failed: ${result.error?.message ?? result.status}`);
}
await writeFile(join(tools, 'toolchain.json'), JSON.stringify({ downloads: downloads.map(([name, url, sha256]) => ({ name, url, sha256 })), nodeValidators: 'tools/output-validation/package-lock.json' }, null, 2) + '\n');
console.log(`Output validators prepared in ${tools}`);
