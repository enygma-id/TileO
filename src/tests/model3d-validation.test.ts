import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, open, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build3dTiles } from '../model3d.js';
import { run } from '../process.js';
import { JobError, parseOptions } from '../types.js';
import { GLB_MAX_JSON_BYTES, glbJsonSizeError } from '../glb-limits.js';
import { readGltfCompanion } from '../model3d-package.js';

const options = parseOptions({ latitude: 0, longitude: 0, height: 0 }, true);

async function fixture(path: string, change?: (gltf: any, bin: Buffer) => void, jsonBytes = 0) {
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
  const json = Buffer.from(raw.padEnd(Math.max(jsonBytes, Math.ceil(raw.length / 4) * 4), ' '));
  const header = Buffer.alloc(28);
  header.write('glTF', 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + json.length + bin.length, 8);
  header.writeUInt32LE(json.length, 12); header.write('JSON', 16);
  header.writeUInt32LE(bin.length, 20); header.write('BIN\0', 24);
  await writeFile(path, Buffer.concat([header.subarray(0, 20), json, header.subarray(20), bin]));
}

test('GLB JSON size limit accepts 64 MiB and reports actual oversized metadata', async () => {
  assert.equal(glbJsonSizeError(GLB_MAX_JSON_BYTES), undefined);
  assert.match(glbJsonSizeError(GLB_MAX_JSON_BYTES + 4)!, /64.00 MiB; the maximum is 64 MiB/);
  const dir = await mkdtemp(join(tmpdir(), 'tileo-glb-json-limit-'));
  try {
    for (const bytes of [17 * 1024 ** 2, GLB_MAX_JSON_BYTES]) {
      const input = join(dir, `valid-${bytes}.glb`);
      await fixture(input, undefined, bytes);
      const companion = await readGltfCompanion(input);
      assert.equal(JSON.parse(companion.json.toString()).buffers[0].uri, 'original.bin');
      assert.equal(companion.binLength, 44);
      assert.equal((await build3dTiles(input, join(dir, `out-${bytes}`), options)).triangles, 2);
    }
    const input = join(dir, 'too-large.glb');
    const handle = await open(input, 'w');
    try {
      const jsonSize = GLB_MAX_JSON_BYTES + 4, size = 28 + jsonSize + 4;
      const header = Buffer.alloc(20);
      header.write('glTF'); header.writeUInt32LE(2, 4); header.writeUInt32LE(size, 8);
      header.writeUInt32LE(jsonSize, 12); header.write('JSON', 16);
      await handle.write(header); await handle.truncate(size);
    } finally { await handle.close(); }
    // Deliberately unreadable JSON: the size error must win before parsing.
    await assert.rejects(readGltfCompanion(input), /the maximum is 64 MiB/);
    await assert.rejects(build3dTiles(input, join(dir, 'oversized'), options),
      error => error instanceof JobError && error.code === 'INVALID_GLB' && /the maximum is 64 MiB/.test(error.message));
    const broken = join(dir, 'broken.glb');
    await fixture(broken);
    const valid = await readFile(broken);
    await writeFile(broken, valid.subarray(0, valid.length - 4));
    await assert.rejects(build3dTiles(broken, join(dir, 'broken'), options), /Invalid GLB header/);
    valid[20] = 0;
    await writeFile(broken, valid);
    await assert.rejects(build3dTiles(broken, join(dir, 'bad-json'), options), /Invalid GLB JSON/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

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

test('B3DM uses content.uri and aligns both tile and embedded GLB without trailing bytes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-b3dm-alignment-'));
  try {
    for (const label of ['a', 'longer']) {
      const source = join(dir, `${label}.glb`), output = join(dir, label);
      await fixture(source, gltf => { gltf.asset.generator = label; });
      await build3dTiles(source, output, { ...options, exportB3dm: true });
      const tileset = JSON.parse(await readFile(join(output, 'legacy-b3dm/tileset.json'), 'utf8'));
      assert.equal(tileset.root.content.uri, 'tiles/model.b3dm');
      assert.equal(tileset.root.content.url, undefined);
      const bytes = await readFile(join(output, 'legacy-b3dm', tileset.root.content.uri));
      assert.equal(bytes.length % 8, 0);
      assert.equal(bytes.readUInt32LE(8), bytes.length);
      const offset = 28 + bytes.readUInt32LE(12) + bytes.readUInt32LE(16) + bytes.readUInt32LE(20) + bytes.readUInt32LE(24);
      assert.equal(bytes.toString('ascii', offset, offset + 4), 'glTF');
      assert.equal(bytes.readUInt32LE(offset + 8), bytes.length - offset);
      const jsonLength = bytes.readUInt32LE(offset + 12);
      const model = JSON.parse(bytes.toString('utf8', offset + 20, offset + 20 + jsonLength));
      assert.equal(model.asset.generator, label);
      assert.equal(bytes.toString('ascii', offset + 24 + jsonLength, offset + 28 + jsonLength), 'BIN\0');
    }
  } finally { await rm(dir, { recursive: true, force: true }); }
});
