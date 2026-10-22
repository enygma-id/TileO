import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build3dTiles } from '../model3d.js';
import { run } from '../process.js';
import { JobError, parseOptions } from '../types.js';

const options = parseOptions({ latitude: 0, longitude: 0, height: 0 }, true);

async function fixture(path: string, change?: (gltf: any, bin: Buffer) => void) {
  const bin = Buffer.alloc(44);
  bin.writeFloatLE(1, 12);
  bin.writeFloatLE(1, 28);
  [0, 1, 2, 0].forEach((value, i) => bin.writeUInt16LE(value, 36 + i * 2));
  const gltf = {
    asset: { version: '2.0' }, buffers: [{ byteLength: bin.length }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }, { buffer: 0, byteOffset: 36, byteLength: 8 }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] },
      { bufferView: 1, componentType: 5123, count: 4, type: 'SCALAR' },
    ],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1, mode: 5 }] }],
    nodes: [{ mesh: 0 }], scenes: [{ nodes: [0] }], scene: 0,
  };
  change?.(gltf, bin);
  const raw = JSON.stringify(gltf);
  const json = Buffer.from(raw.padEnd(Math.ceil(raw.length / 4) * 4, ' '));
  const header = Buffer.alloc(28);
  header.write('glTF', 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + json.length + bin.length, 8);
  header.writeUInt32LE(json.length, 12); header.write('JSON', 16);
  header.writeUInt32LE(bin.length, 20); header.write('BIN\0', 24);
  await writeFile(path, Buffer.concat([header.subarray(0, 20), json, header.subarray(20), bin]));
}

test('3D validation checks vertex bounds and indices and counts strip/fan triangles', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-3d-validation-'));
  try {
    const source = join(dir, 'valid.glb');
    await fixture(source);
    const result = await build3dTiles(source, join(dir, 'valid'), options);
    assert.equal(result.triangles, 2);
    assert.deepEqual(JSON.parse(await readFile(join(dir, 'valid', 'tileset.json'), 'utf8')).root.boundingVolume.box.slice(0, 3), [0.5, 0, 0.5]);

    const wrongBounds = join(dir, 'wrong-bounds.glb');
    await fixture(wrongBounds, gltf => { gltf.accessors[0].max = [100, 1, 0]; });
    await assert.rejects(build3dTiles(wrongBounds, join(dir, 'wrong-bounds'), options), /bounds do not match/);

    const badVertex = join(dir, 'nan.glb');
    await fixture(badVertex, (_gltf, bin) => { bin.writeFloatLE(NaN, 0); });
    await assert.rejects(build3dTiles(badVertex, join(dir, 'nan'), options), /non-finite vertex/);

    const badIndex = join(dir, 'bad-index.glb');
    await fixture(badIndex, (_gltf, bin) => { bin.writeUInt16LE(3, 40); });
    await assert.rejects(build3dTiles(badIndex, join(dir, 'bad-index'), options), /index exceeds/);

    const missingIndex = join(dir, 'missing-index.glb');
    await fixture(missingIndex, gltf => { gltf.meshes[0].primitives[0].indices = 8; });
    await assert.rejects(build3dTiles(missingIndex, join(dir, 'missing-index'), options), /indices need/);

    const fan = join(dir, 'fan.glb');
    await fixture(fan, gltf => { gltf.meshes[0].primitives[0].mode = 6; });
    assert.equal((await build3dTiles(fan, join(dir, 'fan'), options)).triangles, 2);

    const controller = new AbortController(); controller.abort(new Error('stopped'));
    await assert.rejects(build3dTiles(source, join(dir, 'aborted'), options, controller.signal), /stopped/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('isolated 3D converter writes result and structured error files', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-3d-process-'));
  try {
    const source = join(dir, 'valid.glb'), result = join(dir, 'result.json');
    await fixture(source);
    const cli = fileURLToPath(new URL('../model3d-cli.js', import.meta.url));
    const args = [cli, source, join(dir, 'output'), JSON.stringify(options), String(1024 ** 3), result];
    await run(process.execPath, args, { timeoutMs: 30_000 });
    assert.equal(JSON.parse(await readFile(result, 'utf8')).result.triangles, 2);
    const invalid = join(dir, 'invalid.glb'), errorFile = join(dir, 'error.json');
    await writeFile(invalid, 'invalid');
    await assert.rejects(run(process.execPath, [cli, invalid, join(dir, 'bad-output'), JSON.stringify(options), String(1024 ** 3), errorFile], { timeoutMs: 30_000 }), error => error instanceof JobError && error.code === 'TOOL_FAILED');
    assert.equal(JSON.parse(await readFile(errorFile, 'utf8')).error.code, 'INVALID_GLB');
    const controller = new AbortController(); controller.abort(new Error('cancelled before launch'));
    await assert.rejects(run(process.execPath, args, { signal: controller.signal }), /cancelled before launch/);
    const running = new AbortController();
    const delayed = run(process.execPath, ['-e', 'setTimeout(() => {}, 30000)'], { signal: running.signal, timeoutMs: 30_000 });
    setTimeout(() => running.abort(new JobError('CANCELLED', 'cancelled while running')), 100);
    await assert.rejects(delayed, error => error instanceof JobError && error.code === 'CANCELLED');
  } finally { await rm(dir, { recursive: true, force: true }); }
});
