import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { config, root } from './config.js';
import { run, type RunOptions } from './process.js';
import { JobError } from './types.js';

export type OutputKind = 'raster' | 'vector' | 'elevation' | 'scientific' | 'model3d';
export interface OutputValidation {
  profile: 'builtin' | 'strict'; status: 'passed';
  checks?: { name: string; status: string }[];
}

// Every worker pipeline calls this before publishing. Independent validators
// need separately installed Python/Java tools and are enabled in strict mode.
export async function validatePublication(input: string, kind: OutputKind, scratch: string, execution: RunOptions, runner: typeof run = run): Promise<OutputValidation> {
  if (config.outputValidation === 'builtin') return { profile: 'builtin', status: 'passed' };
  const report = join(scratch, 'output-validation.json');
  await runner(process.execPath, [join(root, 'scripts/validate-output.js'), '--input', input, '--kind', kind, '--tools-dir', config.validatorTools, '--report', report], { ...execution, timeoutMs: 300_000 });
  if ((await stat(report)).size > 1024 ** 2) throw new JobError('INVALID_OUTPUT', 'Output validation report exceeds its size limit.');
  const result = JSON.parse(await readFile(report, 'utf8'));
  if (result?.schema !== 'tileo-output-validation@1' || result.profile !== 'strict' || result.status !== 'passed' || !Array.isArray(result.checks) || !result.checks.length || result.checks.some((check: { name?: string; status?: string }) => typeof check?.name !== 'string' || !check.name || check.status !== 'passed')) throw new JobError('INVALID_OUTPUT', 'Strict output validation did not pass.');
  return { profile: 'strict', status: 'passed', checks: result.checks.map((check: { name: string; status: string }) => ({ name: check.name, status: check.status })) };
}
