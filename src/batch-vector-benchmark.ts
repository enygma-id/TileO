import { mkdtemp, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeSync } from 'node:fs';
import { inspect } from './inspect.js';
import { vector } from './vector.js';
import { parseOptions } from './types.js';
import { directoryBytes } from './resources.js';
import { validate } from './validate.js';

const input = process.argv[2];
if (!input) throw new Error('Usage: node dist/batch-vector-benchmark.js <GeoJSON> <off|on> <file|stream>');
const mode = process.argv[3] === 'on' ? 'on' : 'off';
const delivery = process.argv[4] === 'stream' ? 'stream' : 'file';
const scratch = await mkdtemp(join(tmpdir(), `tileo-vector-${mode}-${delivery}-`));
const output = join(scratch, 'out.mbtiles');
const options = parseOptions({ minZoom: 0, maxZoom: 5, vectorPreset: 'density', vectorEngine: 'tippecanoe' });
const execution = { batchMode: mode, batchDelivery: delivery, timeoutMs: 120000, deadlineMs: Date.now() + 120000 } as const;
let peakScratchBytes = 0, pending: Promise<void> | undefined;
const sample = () => {
  if (pending) return;
  pending = directoryBytes(scratch).then(bytes => { peakScratchBytes = Math.max(bytes, peakScratchBytes); }).finally(() => { pending = undefined; });
};
const timer = setInterval(sample, 50), started = performance.now();
try {
  const info = await inspect(input, options, execution);
  const inspectedMs = Math.round(performance.now() - started);
  const batch = await vector(input, output, scratch, info, options, execution, () => {});
  await pending; sample(); await pending;
  const result = { mode, delivery, inputBytes: (await stat(input)).size, inspectedMs, totalMs: Math.round(performance.now() - started), peakScratchBytes,
    outputBytes: (await stat(output)).size, sourceFeatures: info.featureCount, batch, output: validate(output, 'vector', options) };
  await writeFile(join(scratch, 'report.json'), JSON.stringify(result, null, 2));
  writeSync(1, JSON.stringify({ ...result, scratch }) + '\n');
} finally { clearInterval(timer); }
