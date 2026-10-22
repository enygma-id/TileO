// Reproducible adapter read benchmark. Creates only a private temporary
// directory and preserves the report/fixtures for inspection by the caller.
import { createWriteStream } from 'node:fs';
import { mkdtemp, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { once } from 'node:events';
import { Writable } from 'node:stream';
import { pipeline, finished } from 'node:stream/promises';
import { ZipFile } from 'yazl';
import { run } from './process.js';
import { parseOptions } from './types.js';
import { fileURLToPath } from 'node:url';

const dir = await mkdtemp(join(tmpdir(), 'tileo-adapter-benchmark-'));
console.log(`Artifacts: ${dir}`);
const rows: Record<string, unknown>[] = [];
async function measure(format: string, count: number, phase: string, command: string, args: string[]) {
  const time = join(dir, `${format.replaceAll(' ', '_')}-${count}-${phase}.time`);
  let outputBytes = 0;
  const sink = new Writable({ write(data, _encoding, callback) { outputBytes += data.length; callback(); } });
  await run('/usr/bin/time', ['-f', '%e %M', '-o', time, command, ...args], { timeoutMs: 120000, stdout: sink });
  const [seconds, peakKiB] = (await readFile(time, 'utf8')).trim().split(/\s+/).map(Number);
  const row = { format, count, phase, seconds, peakMiB: Number((peakKiB! / 1024).toFixed(2)), outputBytes };
  rows.push(row); console.log(JSON.stringify(row));
}
for (const count of [5000, 50000]) {
  const source = join(dir, `points-${count}.geojson`);
  const sink = createWriteStream(source);
  sink.write('{"type":"FeatureCollection","features":[');
  for (let i = 0; i < count; i++) {
    const raw = JSON.stringify({ type: 'Feature', properties: { code: `p${i}`, value: i, text: 'x'.repeat(128) }, geometry: { type: 'Point', coordinates: [106 + i % 1000 / 1000, -6 + Math.floor(i / 1000) / 1000] } });
    if (!sink.write((i ? ',' : '') + raw)) await once(sink, 'drain');
  }
  sink.end(']}'); await finished(sink);
  for (const [format, extension] of [['GPKG', 'gpkg'], ['FlatGeobuf', 'fgb'], ['ESRI Shapefile', 'shapes'], ['LIBKML', 'kml']]) {
    let input = join(dir, `points-${count}.${extension}`);
    await run('ogr2ogr', ['-f', format!, '-nln', 'points', input, source], { timeoutMs: 120000 });
    if (extension === 'shapes') {
      const zipPath = join(dir, `points-${count}.zip`), zip = new ZipFile();
      for (const name of await readdir(input)) zip.addFile(join(input, name), name);
      zip.end(); await pipeline(zip.outputStream, createWriteStream(zipPath)); input = `/vsizip/${zipPath}`;
    }
    await measure(format!, count, 'inspect', 'ogrinfo', ['-json', '-so', '-al', input]);
    await measure(format!, count, 'normalize', 'ogr2ogr', ['-f', 'GeoJSONSeq', '-t_srs', 'EPSG:4326', '-dim', '2', '/vsistdout/', input, 'points']);
  }
}
// A large single-line fixture tests the bounded preflight separately from
// tiling, so a small MBTiles result is not mistaken for a memory benchmark.
const large = join(dir, 'large.geojson'), sink = createWriteStream(large);
sink.write('{"type":"FeatureCollection","features":[');
const count = 250000;
for (let i = 0; i < count; i++) {
  const raw = JSON.stringify({ type: 'Feature', properties: { code: `p${i}`, payload: 'x'.repeat(2048) }, geometry: { type: 'Point', coordinates: [106 + i % 1000 / 1000, -6] } });
  if (!sink.write((i ? ',' : '') + raw)) await once(sink, 'drain');
}
sink.end(']}'); await finished(sink);
await measure('GeoJSON', count, 'preflight', process.execPath, ['--max-old-space-size=153', fileURLToPath(new URL('./vector-preflight-cli.js', import.meta.url)), large, JSON.stringify(parseOptions({}))]);
const report = { node: process.version, platform: `${process.platform}/${process.arch}`, largeInputBytes: (await stat(large)).size, rows };
await writeFile(join(dir, 'report.json'), JSON.stringify(report, null, 2));
console.log(`Report: ${join(dir, 'report.json')}`);
