import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile, mkdir, stat, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { NodeIO } from '@gltf-transform/core';
import { build3dTiles } from '../model3d.js';
import { parseOptions } from '../types.js';

function zipEntries(zip: Buffer) {
  const entries = new Map<string, Buffer>();
  const footer = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.ok(footer >= 0, 'ZIP central directory is missing');
  let cursor = zip.readUInt32LE(footer + 16);
  for (let i = 0; i < zip.readUInt16LE(footer + 10); i++) {
    assert.equal(zip.readUInt32LE(cursor), 0x02014b50);
    const method = zip.readUInt16LE(cursor + 10), compressed = zip.readUInt32LE(cursor + 20);
    const nameLength = zip.readUInt16LE(cursor + 28), extraLength = zip.readUInt16LE(cursor + 30), commentLength = zip.readUInt16LE(cursor + 32);
    const name = zip.toString('utf8', cursor + 46, cursor + 46 + nameLength);
    const local = zip.readUInt32LE(cursor + 42);
    assert.equal(zip.readUInt32LE(local), 0x04034b50);
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const data = zip.subarray(start, start + compressed);
    entries.set(name, method === 8 ? inflateRawSync(data) : data);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

async function writeGlb(path: string, gltf: Record<string, unknown>) {
  const raw = JSON.stringify(gltf), json = Buffer.from(raw.padEnd(Math.ceil(raw.length / 4) * 4, ' '));
  const bin = Buffer.alloc((gltf.buffers as { byteLength: number }[])[0]!.byteLength);
  if (bin.length >= 36) {
    bin.writeFloatLE(1, 12);
    bin.writeFloatLE(1, 28);
  }
  const header = Buffer.alloc(28);
  header.write('glTF', 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + json.length + bin.length, 8);
  header.writeUInt32LE(json.length, 12); header.write('JSON', 16);
  header.writeUInt32LE(bin.length, 20); header.write('BIN\0', 24);
  await writeFile(path, Buffer.concat([header.subarray(0, 20), json, header.subarray(20), bin]));
}

test('GLB becomes a georeferenced 3D Tiles 1.1 package', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tileo-3d-'));
  try {
    const source = join(dir, 'source.glb'), output = join(dir, 'result');
    const gltf = { asset: { version: '2.0' }, buffers: [{ byteLength: 36 }], bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }], accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] }], meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }], nodes: [{ mesh: 0, translation: [2, 0, 0] }], scenes: [{ nodes: [0] }], scene: 0 };
    await writeGlb(source, gltf);
    const options = parseOptions({ latitude: 0, longitude: 0, height: 0 }, true);
    assert.throws(() => parseOptions({ latitude: 0, longitude: 0 }, true), /height/);
    const metadata = await build3dTiles(source, output, options);
    assert.equal(metadata.kind, 'model3d');
    const tileset = JSON.parse(await readFile(join(output, 'tileset.json'), 'utf8'));
    assert.equal(tileset.asset.version, '1.1');
    assert.equal(metadata.strategy, 'single');
    assert.equal(tileset.root.geometricError, 0);
    assert.equal(tileset.root.content.uri, 'tiles/model.glb');
    assert.deepEqual(tileset.root.boundingVolume.box.slice(0, 3), [2.5, 0, 0.5]);
    assert.equal(tileset.root.transform[12], 6378137);
    const eastFacing = await build3dTiles(source, join(dir, 'east-facing'), parseOptions({ latitude: 0, longitude: 0, height: 0, heading: 90 }, true));
    assert.equal(eastFacing.kind, 'model3d');
    const eastTileset = JSON.parse(await readFile(join(dir, 'east-facing', 'tileset.json'), 'utf8'));
    assert.ok(Math.abs(eastTileset.root.transform[5] - 1) < 1e-12);
    assert.deepEqual(await readFile(join(output, 'tiles/model.glb')), await readFile(source));
    const tiledSource = join(dir, 'tiled.glb'), tiledOutput = join(dir, 'tiled-result');
    await writeGlb(tiledSource, { ...gltf, nodes: Array.from({ length: 9 }, (_, i) => ({ mesh: 0, translation: [i * 10, 0, 0] })), scenes: [{ nodes: Array.from({ length: 9 }, (_, i) => i) }] });
    const tiled = await build3dTiles(tiledSource, tiledOutput, options);
    assert.equal(tiled.strategy, 'spatial-lod');
    assert.equal(tiled.lodLevels, 2);
    assert.ok(tiled.tiles > 2);
    const tiledTileset = JSON.parse(await readFile(join(tiledOutput, 'tileset.json'), 'utf8'));
    assert.equal(tiledTileset.root.refine, 'REPLACE');
    assert.equal(tiledTileset.root.content.uri, 'tiles/lod-0.glb');
    assert.ok(tiledTileset.root.children.length > 1);
    await stat(join(tiledOutput, tiledTileset.root.children[0].content.uri));
    await mkdir(join(dir, 'bad'));
    const bad = join(dir, 'bad.glb'); await writeFile(bad, 'not a glb');
    await assert.rejects(build3dTiles(bad, join(dir, 'bad'), options), /binary glTF/);

    process.env.TILEO_DATA_DIR = join(dir, 'app-data'); process.env.TILEO_DISK_RESERVE_MB = '0';
    const { Jobs } = await import('../jobs.js');
    const { createApp } = await import('../api.js');
    const jobs = new Jobs(); const app = await createApp(jobs);
    try {
      const sourceData = await readFile(source);
      const id = randomUUID(), input = `${id}.glb`;
      await copyFile(source, join(process.env.TILEO_DATA_DIR, 'input', input));
      jobs.enqueue({ id, filename: 'source.glb', input, sha256: 'test', size: sourceData.length, options });
      jobs.acquire('test-worker'); const job = jobs.claim('test-worker')!;
      const artifact = `${id}-${job.attempt}-3dtiles`, artifactPath = join(process.env.TILEO_DATA_DIR, 'output', artifact);
      const built = await build3dTiles(join(process.env.TILEO_DATA_DIR, 'input', job.input), artifactPath, job.options);
      assert.equal(jobs.finish(id, job.attempt, 'test-worker', artifact, built), true);
      const tilesetResponse = await app.inject(`/api/jobs/${id}/3d/tileset.json`);
      assert.equal(tilesetResponse.statusCode, 200);
      const servedTileset = tilesetResponse.json();
      assert.equal(servedTileset.root.content.uri, 'tiles/model.glb');
      assert.equal((await app.inject(`/api/jobs/${id}/3d/${servedTileset.root.content.uri}`)).statusCode, 200);
      const download = await app.inject(`/api/jobs/${id}/download`);
      assert.equal(download.headers['content-type'], 'application/zip');
      const zip = download.rawPayload;
      assert.equal(zip.toString('ascii', 0, 2), 'PK');
      const files = zipEntries(zip);
      for (const name of ['tileset.json', 'tiles/model.glb', 'models/original.glb', 'models/original.gltf', 'models/original.bin', 'manifest.json', 'README.md']) assert.ok(files.has(name), `ZIP missing ${name}`);
      assert.deepEqual(files.get('models/original.glb'), sourceData);
      const gltfJson = JSON.parse(files.get('models/original.gltf')!.toString('utf8'));
      assert.equal(gltfJson.buffers[0].uri, 'original.bin');
      assert.equal(files.get('models/original.bin')!.length, gltfJson.buffers[0].byteLength);
      const binOffset = 28 + sourceData.readUInt32LE(12);
      assert.deepEqual(files.get('models/original.bin'), sourceData.subarray(binOffset, binOffset + gltfJson.buffers[0].byteLength));
      assert.equal(JSON.parse(files.get('manifest.json')!.toString('utf8')).formats.gltf.file, 'models/original.gltf');
      const unpacked = join(dir, 'unpacked'); await mkdir(unpacked);
      await writeFile(join(unpacked, 'original.gltf'), files.get('models/original.gltf')!);
      await writeFile(join(unpacked, 'original.bin'), files.get('models/original.bin')!);
      assert.equal((await new NodeIO().read(join(unpacked, 'original.gltf'))).getRoot().listMeshes().length, 1);
      const glb = await app.inject(`/api/jobs/${id}/download?file=glb`);
      assert.equal(glb.statusCode, 200); assert.deepEqual(glb.rawPayload, sourceData);
      const gltf = await app.inject(`/api/jobs/${id}/download?file=gltf`);
      assert.equal(gltf.statusCode, 200);
      const gltfFiles = zipEntries(gltf.rawPayload);
      assert.deepEqual([...gltfFiles.keys()].sort(), ['original.bin', 'original.gltf']);
      assert.deepEqual(gltfFiles.get('original.bin'), files.get('models/original.bin'));
      assert.equal((await app.inject(`/api/jobs/${id}/download?file=obj`)).statusCode, 404);
      assert.equal((await app.inject(`/api/jobs/${id}/tiles/0/0/0`)).statusCode, 404);
      assert.equal((await app.inject({ method: 'DELETE', url: `/api/jobs/${id}` })).statusCode, 200);
      await assert.rejects(stat(artifactPath));
    } finally { await app.close(); }
  } finally { await rm(dir, { recursive: true, force: true }); }
});
