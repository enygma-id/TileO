import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Document } from '@gltf-transform/core';
import { batchStaticMeshes, prepareCoarseNormals, restoreFlatNormals } from '../model3d-batch.js';
import { prune } from '../gltf-ops.js';

test('static batches bake hierarchy, normals and mirrored winding while retaining leaf metadata', async () => {
  const document = new Document(), buffer = document.createBuffer(), material = document.createMaterial();
  const position = document.createAccessor().setBuffer(buffer).setType('VEC3').setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]));
  const normal = document.createAccessor().setBuffer(buffer).setType('VEC3').setArray(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]));
  const primitive = document.createPrimitive().setAttribute('POSITION', position).setAttribute('NORMAL', normal).setMaterial(material);
  const mesh = document.createMesh().addPrimitive(primitive);
  const a = document.createNode('a').setMesh(mesh).setTranslation([10, 0, 0]).setExtras({ id: 1 });
  const b = document.createNode('b').setMesh(mesh).setScale([-2, 3, 1]).setExtras({ id: 2 });
  const parent = document.createNode().setTranslation([0, 20, 0]).addChild(b);
  document.createScene().addChild(a).addChild(parent);
  batchStaticMeshes(document, true); await document.transform(prune());
  const merged = document.getRoot().listMeshes(); assert.equal(merged.length, 1);
  const result = merged[0]!.listPrimitives()[0]!;
  assert.deepEqual(Array.from(result.getIndices()!.getArray()!), [0, 1, 2, 3, 5, 4]);
  assert.deepEqual(Array.from(result.getAttribute('POSITION')!.getArray()!), [10, 0, 0, 11, 0, 0, 10, 1, 0, 0, 20, 0, -2, 20, 0, 0, 23, 0]);
  result.getAttribute('NORMAL')!.getElement(4, [] as number[]).forEach((value, axis) => assert.ok(Math.abs(value - [0, 0, 1][axis]!) < 1e-6));
  const parts = result.getExtras().tileoParts as { extras: { id: number }; firstIndex: number; indexCount: number }[];
  assert.deepEqual(parts.map(p => [p.extras.id, p.firstIndex, p.indexCount]), [[1, 0, 3], [2, 3, 3]]);
  assert.deepEqual(document.getRoot().listNodes()[0]!.getWorldMatrix(), [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  const coarse = prepareCoarseNormals(document); assert.equal(coarse.length, 1);
  restoreFlatNormals(document, coarse[0]!);
  assert.equal(coarse[0]!.getIndices(), null);
  assert.equal(coarse[0]!.getAttribute('POSITION')!.getCount(), 6);
  coarse[0]!.getAttribute('NORMAL')!.getElement(4, [] as number[]).forEach((value, axis) => assert.ok(Math.abs(value - [0, 0, 1][axis]!) < 1e-6));
});

test('material groups stay separate and transparent meshes are retained', async () => {
  const document = new Document(), buffer = document.createBuffer(), scene = document.createScene();
  for (const alpha of ['OPAQUE', 'OPAQUE', 'BLEND'] as const) {
    const material = document.createMaterial().setAlphaMode(alpha);
    for (let n = 0; n < 3; n++) {
      const position = document.createAccessor().setBuffer(buffer).setType('VEC3').setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]));
      scene.addChild(document.createNode().setMesh(document.createMesh().addPrimitive(document.createPrimitive().setAttribute('POSITION', position).setMaterial(material))));
    }
  }
  batchStaticMeshes(document, false); await document.transform(prune());
  assert.equal(document.getRoot().listMeshes().length, 5);
  assert.equal(document.getRoot().listMeshes().filter(m => m.listPrimitives()[0]!.getMaterial()!.getAlphaMode() === 'BLEND').length, 3);
  assert.equal(document.getRoot().listMeshes().find(m => m.listPrimitives()[0]!.getMaterial()!.getAlphaMode() === 'OPAQUE')!.listPrimitives()[0]!.getExtras().tileoParts, undefined);
});

test('batch normals use inverse transpose for nonuniform scale and decode normalized colors', () => {
  const document = new Document(), buffer = document.createBuffer(), scene = document.createScene();
  const position = document.createAccessor().setBuffer(buffer).setType('VEC3').setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]));
  const normal = document.createAccessor().setBuffer(buffer).setType('VEC3').setArray(new Float32Array([1, 1, 0, 1, 1, 0, 1, 1, 0]));
  const color = document.createAccessor().setBuffer(buffer).setType('VEC3').setNormalized(true).setArray(new Uint8Array([255, 0, 0, 255, 0, 0, 255, 0, 0]));
  const primitive = document.createPrimitive().setAttribute('POSITION', position).setAttribute('NORMAL', normal).setAttribute('COLOR_0', color);
  const mesh = document.createMesh().addPrimitive(primitive);
  scene.addChild(document.createNode().setMesh(mesh).setScale([2, 3, 1]));
  scene.addChild(document.createNode().setMesh(mesh));
  batchStaticMeshes(document, false);
  const merged = document.getRoot().listMeshes().find(m => m !== mesh)!.listPrimitives()[0]!;
  const actual = merged.getAttribute('NORMAL')!.getElement(0, [] as number[]);
  const length = Math.hypot(0.5, 1 / 3);
  assert.ok(Math.abs(actual[0]! - 0.5 / length) < 1e-6);
  assert.ok(Math.abs(actual[1]! - (1 / 3) / length) < 1e-6);
  assert.deepEqual(merged.getAttribute('COLOR_0')!.getElement(0, [] as number[]), [1, 0, 0]);
  assert.equal(prepareCoarseNormals(document).length, 0, 'colored geometry retains its attributes');
});
