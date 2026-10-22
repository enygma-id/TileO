import { writeFile } from 'node:fs/promises';
import { build3dTiles } from './model3d.js';
import { JobError, type Options } from './types.js';

async function main() {
  const [input, output, rawOptions, rawMemory, resultPath] = process.argv.slice(2);
  if (!input || !output || !rawOptions || !rawMemory || !resultPath) throw new JobError('INVALID_OPTIONS', 'Missing 3D conversion arguments.');
  const options = JSON.parse(rawOptions) as Options;
  const memoryBudget = Number(rawMemory);
  if (!(memoryBudget > 0)) throw new JobError('INVALID_OPTIONS', 'Invalid memory budget.');
  const result = await build3dTiles(input, output, options, undefined, memoryBudget);
  await writeFile(resultPath, JSON.stringify({ result }));
}

main().catch(async error => {
  const code = error instanceof JobError ? error.code : 'TOOL_FAILED';
  const detail = { code, message: error instanceof Error ? error.message : String(error) };
  const resultPath = process.argv[6];
  if (resultPath) await writeFile(resultPath, JSON.stringify({ error: detail })).catch(() => {});
  process.stderr.write(`${detail.code}: ${detail.message}\n`);
  process.exitCode = 1;
});
