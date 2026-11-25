import { lstat, link, mkdtemp, readFile, rm } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { root } from './config.js';
import { readGltfCompanion } from './model3d-package.js';
import { run } from './process.js';

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { scale: { type: 'string', default: '1' }, 'up-axis': { type: 'string' }, blender: { type: 'string', default: 'blender' } },
  });
  const [sourceName, outputName] = positionals;
  if (positionals.length !== 2 || !sourceName || !outputName) {
    throw new Error('Usage: npm run model3d:convert -- input.gltf output.glb [--scale meters-per-unit] [--up-axis Y|Z] [--blender path]');
  }
  const source = resolve(sourceName), output = resolve(outputName);
  const format = extname(source).toLowerCase();
  if (!['.gltf', '.obj', '.fbx', '.stl'].includes(format) || extname(output).toLowerCase() !== '.glb') {
    throw new Error('Choose a .gltf, .obj, .fbx or .stl input and a .glb output.');
  }
  if (!(await lstat(source)).isFile()) throw new Error('Choose a local model file.');
  const scale = Number(values.scale);
  if (!Number.isFinite(scale) || scale <= 0) throw new Error('--scale must be a positive number of meters per imported unit.');
  const axis = values['up-axis']?.toUpperCase();
  if (axis && (!['Y', 'Z'].includes(axis) || !['.obj', '.stl'].includes(format))) {
    throw new Error('--up-axis accepts Y or Z for OBJ and STL. glTF and FBX use the axes specified by their format or metadata.');
  }
  const directory = await mkdtemp(join(dirname(output), '.tileo-convert-'));
  try {
    const glb = join(directory, 'converted.glb');
    const log = join(directory, 'blender.log');
    try {
      await run(values.blender, [
        '--background', '--factory-startup', '--disable-autoexec', '--python-exit-code', '1',
        '--python', join(root, 'scripts', 'convert-model3d.py'), '--',
        source, glb, String(scale), axis ?? (format === '.stl' ? 'Z' : 'Y'),
      ], { log, timeoutMs: 20 * 60 * 1000 });
    } catch (error) {
      const details = (await readFile(log, 'utf8').catch(() => '')).trim().split('\n').slice(-10).join('\n');
      throw new Error(`Use Blender 4.5 or newer and check the model and its companion files. ${error instanceof Error ? error.message : String(error)}${details ? '\n' + details : ''}`);
    }
    await readGltfCompanion(glb);
    await link(glb, output);
    console.log(output);
  } finally { await rm(directory, { recursive: true, force: true }); }
}

main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
