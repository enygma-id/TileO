import type { Document, Node, Primitive } from '@gltf-transform/core';

// Bake static triangle meshes into material batches. Leaf batches keep source
// node metadata and index ranges; coarse LODs need only display geometry.
export function batchStaticMeshes(document: Document, keepMetadata: boolean): void {
  const root = document.getRoot();
  if (root.listAnimations().length || root.listScenes().length !== 1) return;
  const scene = root.listScenes()[0]!;
  const groups = new Map<string, { node: Node; primitive: Primitive; matrix: number[]; determinant: number }[]>();
  const materials = root.listMaterials();
  scene.traverse(node => {
    const mesh = node.getMesh();
    if (!mesh || node.getSkin() || node.listExtensions().length) return;
    const matrix = Array.from(node.getWorldMatrix());
    const [a, b, c, d, e, f, g, h, i] = [matrix[0]!, matrix[4]!, matrix[8]!, matrix[1]!, matrix[5]!, matrix[9]!, matrix[2]!, matrix[6]!, matrix[10]!];
    const determinant = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-12) return;
    for (const primitive of mesh.listPrimitives()) {
      const semantics = primitive.listSemantics().sort();
      if (primitive.getMode() !== 4 || primitive.listTargets().length || primitive.listExtensions().length
        || primitive.getMaterial()?.getAlphaMode() === 'BLEND'
        || semantics.some(s => !['POSITION', 'NORMAL', 'COLOR_0', 'TEXCOORD_0', 'TEXCOORD_1'].includes(s))) continue;
      const position = primitive.getAttribute('POSITION');
      if (!position || semantics.some(s => primitive.getAttribute(s)!.getCount() !== position.getCount())) continue;
      const key = `${materials.indexOf(primitive.getMaterial()!)}:${semantics.map(s => `${s}/${primitive.getAttribute(s)!.getType()}`).join(',')}`;
      const group = groups.get(key) ?? [];
      group.push({ node, primitive, matrix, determinant }); groups.set(key, group);
    }
  });
  const removed = new Map<Node, Set<Primitive>>();
  const buffer = root.listBuffers()[0] ?? document.createBuffer();
  for (const entries of groups.values()) {
    if (entries.length < 2) continue;
    const semantics = entries[0]!.primitive.listSemantics().sort();
    const count = entries.reduce((n, entry) => n + entry.primitive.getAttribute('POSITION')!.getCount(), 0);
    const indexCount = entries.reduce((n, entry) => n + (entry.primitive.getIndices()?.getCount() ?? entry.primitive.getAttribute('POSITION')!.getCount()), 0);
    const attributes = new Map(semantics.map(s => [s, new Float32Array(count * entries[0]!.primitive.getAttribute(s)!.getElementSize())]));
    const indices = new Uint32Array(indexCount);
    const parts: Record<string, unknown>[] = [];
    let vertexOffset = 0, indexOffset = 0;
    for (const { node, primitive, matrix: m, determinant } of entries) {
      const vertices = primitive.getAttribute('POSITION')!.getCount();
      for (const semantic of semantics) {
        const accessor = primitive.getAttribute(semantic)!, size = accessor.getElementSize(), target = attributes.get(semantic)!;
        for (let v = 0; v < vertices; v++) {
          const value = accessor.getElement(v, [] as number[]);
          const x = value[0]!, y = value[1]!, z = value[2]!;
          if (semantic === 'POSITION') {
            value[0] = m[0]! * x + m[4]! * y + m[8]! * z + m[12]!;
            value[1] = m[1]! * x + m[5]! * y + m[9]! * z + m[13]!;
            value[2] = m[2]! * x + m[6]! * y + m[10]! * z + m[14]!;
          } else if (semantic === 'NORMAL') {
            const nx = ((m[5]! * m[10]! - m[9]! * m[6]!) * x + (m[9]! * m[2]! - m[1]! * m[10]!) * y + (m[1]! * m[6]! - m[5]! * m[2]!) * z) / determinant;
            const ny = ((m[8]! * m[6]! - m[4]! * m[10]!) * x + (m[0]! * m[10]! - m[8]! * m[2]!) * y + (m[4]! * m[2]! - m[0]! * m[6]!) * z) / determinant;
            const nz = ((m[4]! * m[9]! - m[8]! * m[5]!) * x + (m[8]! * m[1]! - m[0]! * m[9]!) * y + (m[0]! * m[5]! - m[4]! * m[1]!) * z) / determinant;
            const length = Math.hypot(nx, ny, nz) || 1;
            value[0] = nx / length; value[1] = ny / length; value[2] = nz / length;
          }
          target.set(value, (vertexOffset + v) * size);
        }
      }
      const sourceIndices = primitive.getIndices(), length = sourceIndices?.getCount() ?? vertices;
      for (let k = 0; k < length; k++) indices[indexOffset + k] = vertexOffset + (sourceIndices ? sourceIndices.getScalar(k) : k);
      if (determinant < 0) for (let k = 0; k + 2 < length; k += 3) {
        const first = indices[indexOffset + k + 1]!;
        indices[indexOffset + k + 1] = indices[indexOffset + k + 2]!; indices[indexOffset + k + 2] = first;
      }
      if (keepMetadata) parts.push({ name: node.getName(), extras: node.getExtras(), meshExtras: node.getMesh()!.getExtras(), primitiveExtras: primitive.getExtras(), firstIndex: indexOffset, indexCount: length });
      vertexOffset += vertices; indexOffset += length;
      const set = removed.get(node) ?? new Set(); set.add(primitive); removed.set(node, set);
    }
    const merged = document.createPrimitive().setMaterial(entries[0]!.primitive.getMaterial());
    for (const semantic of semantics) merged.setAttribute(semantic, document.createAccessor().setBuffer(buffer)
      .setType(entries[0]!.primitive.getAttribute(semantic)!.getType()).setArray(attributes.get(semantic)!));
    merged.setIndices(document.createAccessor().setBuffer(buffer).setType('SCALAR').setArray(indices));
    if (keepMetadata) merged.setExtras({ tileoParts: parts });
    scene.addChild(document.createNode('TileO material batch').setMesh(document.createMesh().addPrimitive(merged)));
  }
  // Shared source meshes must be detached per instance, never modified in place.
  for (const [node, primitives] of removed) {
    const source = node.getMesh()!, remaining = source.listPrimitives().filter(p => !primitives.has(p));
    if (!remaining.length) node.setMesh(null);
    else { const mesh = document.createMesh().setExtras(source.getExtras()); for (const primitive of remaining) mesh.addPrimitive(primitive); node.setMesh(mesh); }
  }
}

// Hard-edge normals split otherwise shared vertices and prevent simplification
// of small building meshes. Coarse, untextured PN geometry may weld by position;
// flat face normals are rebuilt afterwards. Full-detail leaves never use this.
export function prepareCoarseNormals(document: Document): Primitive[] {
  const result: Primitive[] = [];
  for (const mesh of document.getRoot().listMeshes()) for (const primitive of mesh.listPrimitives()) {
    const material = primitive.getMaterial();
    if (primitive.getMode() !== 4 || primitive.listExtensions().length || primitive.listTargets().length
      || !primitive.getAttribute('NORMAL') || primitive.listSemantics().some(s => !['POSITION', 'NORMAL'].includes(s))
      || material?.getAlphaMode() === 'BLEND'
      || material && [material.getBaseColorTexture(), material.getNormalTexture(), material.getMetallicRoughnessTexture(), material.getOcclusionTexture(), material.getEmissiveTexture()].some(Boolean)) continue;
    primitive.setAttribute('NORMAL', null); result.push(primitive);
  }
  return result;
}

export function restoreFlatNormals(document: Document, primitive: Primitive): void {
  const position = primitive.getAttribute('POSITION')!, indices = primitive.getIndices();
  const count = indices?.getCount() ?? position.getCount();
  const positions = new Float32Array(count * 3), normals = new Float32Array(count * 3);
  for (let v = 0; v < count; v++) positions.set(position.getElement(indices ? indices.getScalar(v) : v, [] as number[]), v * 3);
  for (let v = 0; v + 2 < count; v += 3) {
    const offset = v * 3;
    const ax = positions[offset + 3]! - positions[offset]!, ay = positions[offset + 4]! - positions[offset + 1]!, az = positions[offset + 5]! - positions[offset + 2]!;
    const bx = positions[offset + 6]! - positions[offset]!, by = positions[offset + 7]! - positions[offset + 1]!, bz = positions[offset + 8]! - positions[offset + 2]!;
    const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx, length = Math.hypot(nx, ny, nz) || 1;
    for (let k = 0; k < 3; k++) normals.set([nx / length, ny / length, nz / length], offset + k * 3);
  }
  const buffer = document.getRoot().listBuffers()[0]!;
  primitive.setIndices(null).setAttribute('POSITION', document.createAccessor().setBuffer(buffer).setType('VEC3').setArray(positions))
    .setAttribute('NORMAL', document.createAccessor().setBuffer(buffer).setType('VEC3').setArray(normals));
}
