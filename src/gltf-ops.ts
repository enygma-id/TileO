/**
 * TileO-owned glTF geometry operations.
 *
 * Adapted from glTF Transform v4.5.1 (`@gltf-transform/functions`), which is
 * MIT-licensed: Copyright (c) 2020 Don McCurdy.
 * https://github.com/donmccurdy/glTF-Transform
 *
 * TileO only needs four operations from that package. Keeping this local subset
 * avoids shipping `@gltf-transform/functions` -> `ndarray-pixels` -> `sharp` ->
 * `libvips` (LGPL-3.0-or-later) in the production dependency tree.
 *
 * Deliberate deviation from upstream: `prune()` does not decode texture pixels
 * to collapse single-color textures, because that requires `ndarray-pixels`.
 * Unused textures are still pruned normally.
 */
import {
  Accessor,
  AnimationChannel,
  BufferUtils,
  ComponentTypeToTypedArray,
  Document,
  type Extension,
  ExtensionProperty,
  type GLTF,
  type Graph,
  Material,
  MathUtils,
  type Node,
  Primitive,
  type PrimitiveTarget,
  type Property,
  type PropertyResolver,
  PropertyType,
  Root,
  Scene,
  Texture,
  TextureInfo,
  type Transform,
  type TypedArray,
  type TypedArrayConstructor,
} from '@gltf-transform/core';

const { TEXTURE_INFO, ROOT } = PropertyType;
type PropertyConstructor = new (g: Graph<Property>) => Property;
const NO_TRANSFER_TYPES = new Set<string>([TEXTURE_INFO, ROOT]);

/**********************************************************************************************
 * cloneDocument (adapted from document-utils.ts)
 */

export function cloneDocument(source: Document): Document {
  const target = new Document().setLogger(source.getLogger());
  const resolve = createDefaultPropertyResolver(target, source);
  mergeDocuments(target, source, resolve);
  // Root properties (name, asset, default scene, extras) are not overwritten by
  // mergeDocuments(), and must be copied explicitly.
  target.getRoot().copy(source.getRoot(), resolve as any);
  return target;
}

function mergeDocuments(
  target: Document,
  source: Document,
  resolve?: PropertyResolver<Property>,
): Map<Property, Property> {
  resolve ||= createDefaultPropertyResolver(target, source);
  for (const sourceExtension of source.getRoot().listExtensionsUsed()) {
    const targetExtension = target.createExtension(sourceExtension.constructor as new (doc: Document) => Extension);
    if (sourceExtension.isRequired()) targetExtension.setRequired(true);
  }
  return copyProperties(target, source, listNonRootProperties(source), resolve);
}

function copyProperties(
  target: Document,
  source: Document,
  sourceProperties: Property[],
  resolve?: PropertyResolver<Property>,
): Map<Property, Property> {
  resolve ||= createDefaultPropertyResolver(target, source);
  const propertyMap = new Map<Property, Property>();
  for (const sourceProp of sourceProperties) {
    if (!propertyMap.has(sourceProp) && sourceProp.propertyType !== TEXTURE_INFO) {
      propertyMap.set(sourceProp, resolve(sourceProp));
    }
  }
  for (const [sourceProp, targetProp] of propertyMap.entries()) {
    targetProp.copy(sourceProp, resolve);
  }
  return propertyMap;
}

function createDefaultPropertyResolver(target: Document, source: Document): PropertyResolver<Property> {
  const propertyMap = new Map<Property, Property>([[source.getRoot(), target.getRoot()]]);
  return (sourceProp: Property): Property => {
    if (sourceProp.propertyType === TEXTURE_INFO) return sourceProp;
    let targetProp = propertyMap.get(sourceProp);
    if (!targetProp) {
      const PropertyClass = sourceProp.constructor as PropertyConstructor;
      targetProp = new PropertyClass(target.getGraph());
      propertyMap.set(sourceProp, targetProp);
    }
    return targetProp;
  };
}

function listNonRootProperties(document: Document): Property[] {
  const visited = new Set<Property>();
  for (const edge of document.getGraph().listEdges()) visited.add(edge.getChild());
  return Array.from(visited);
}

/**********************************************************************************************
 * prune (adapted from prune.ts, without pixel-decoding solid texture pruning)
 */

export function prune(): Transform {
  return createTransform('prune', async (document: Document): Promise<void> => {
    const root = document.getRoot();
    const graph = document.getGraph();
    const keepExtras = false;

    for (const mesh of root.listMeshes()) {
      if (mesh.listPrimitives().length > 0) continue;
      mesh.dispose();
    }

    for (const scene of root.listScenes()) nodeTreeShake(graph, scene, keepExtras);
    for (const node of root.listNodes()) treeShake(node, keepExtras);
    for (const skin of root.listSkins()) treeShake(skin, keepExtras);
    for (const mesh of root.listMeshes()) treeShake(mesh, keepExtras);
    for (const camera of root.listCameras()) treeShake(camera, keepExtras);

    indirectTreeShake(graph, PropertyType.PRIMITIVE, keepExtras);
    indirectTreeShake(graph, PropertyType.PRIMITIVE_TARGET, keepExtras);

    const materialPrims = new Map<Material, Set<Primitive>>();
    for (const mesh of root.listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        const material = prim.getMaterial();
        if (!material) continue;
        const required = listRequiredSemantics(document, prim, material);
        const unused = listUnusedSemantics(prim, required);
        pruneAttributes(prim, unused);
        prim.listTargets().forEach((target) => pruneAttributes(target, unused));
        const prims = materialPrims.get(material);
        if (prims) prims.add(prim);
        else materialPrims.set(material, new Set([prim]));
      }
    }
    for (const [material, prims] of materialPrims) shiftTexCoords(material, Array.from(prims));

    for (const anim of root.listAnimations()) {
      for (const channel of anim.listChannels()) {
        if (!channel.getTargetNode()) channel.dispose();
      }
      if (!anim.listChannels().length) {
        const samplers = anim.listSamplers();
        treeShake(anim, keepExtras);
        samplers.forEach((sampler) => treeShake(sampler, keepExtras));
      } else {
        anim.listSamplers().forEach((sampler) => treeShake(sampler, keepExtras));
      }
    }

    root.listMaterials().forEach((material) => treeShake(material, keepExtras));
    root.listTextures().forEach((texture) => treeShake(texture, keepExtras));
    root.listAccessors().forEach((accessor) => treeShake(accessor, keepExtras));
    root.listBuffers().forEach((buffer) => treeShake(buffer, keepExtras));
  });
}

function treeShake(prop: Property, keepExtras: boolean): void {
  const parents = prop.listParents().filter((p) => !(p instanceof Root || p instanceof AnimationChannel));
  const needsExtras = keepExtras && !isEmptyObject(prop.getExtras());
  if (!parents.length && !needsExtras) prop.dispose();
}

function indirectTreeShake(graph: Graph<Property>, propertyType: string, keepExtras: boolean): void {
  for (const edge of graph.listEdges()) {
    const parent = edge.getParent();
    if (parent.propertyType === propertyType) treeShake(parent, keepExtras);
  }
}

function nodeTreeShake(graph: Graph<Property>, prop: Node | Scene, keepExtras: boolean): void {
  prop.listChildren().forEach((child) => nodeTreeShake(graph, child, keepExtras));
  if (prop instanceof Scene) return;
  const isUsed = graph.listParentEdges(prop).some((e) => {
    const ptype = e.getParent().propertyType;
    return ptype !== PropertyType.ROOT && ptype !== PropertyType.SCENE && ptype !== PropertyType.NODE;
  });
  const isEmpty = graph.listChildren(prop).length === 0;
  const needsExtras = keepExtras && !isEmptyObject(prop.getExtras());
  if (isEmpty && !isUsed && !needsExtras) prop.dispose();
}

function pruneAttributes(prim: Primitive | PrimitiveTarget, unused: string[]): void {
  for (const semantic of unused) prim.setAttribute(semantic, null);
}

function listUnusedSemantics(prim: Primitive | PrimitiveTarget, required: Set<string>): string[] {
  const unused: string[] = [];
  for (const semantic of prim.listSemantics()) {
    if (semantic === 'NORMAL' && !required.has(semantic)) unused.push(semantic);
    else if (semantic === 'TANGENT' && !required.has(semantic)) unused.push(semantic);
    else if (semantic.startsWith('TEXCOORD_') && !required.has(semantic)) unused.push(semantic);
    else if (semantic.startsWith('COLOR_') && semantic !== 'COLOR_0') unused.push(semantic);
  }
  return unused;
}

function listRequiredSemantics(
  document: Document,
  prim: Primitive,
  material: Material | ExtensionProperty,
  semantics = new Set<string>(),
): Set<string> {
  const graph = document.getGraph();
  const edges = graph.listChildEdges(material);
  const textureNames = new Set<string>();
  for (const edge of edges) if (edge.getChild() instanceof Texture) textureNames.add(edge.getName());
  for (const edge of edges) {
    const name = edge.getName();
    const child = edge.getChild();
    if (child instanceof TextureInfo && textureNames.has(name.replace(/Info$/, ''))) {
      semantics.add(`TEXCOORD_${child.getTexCoord()}`);
    }
    if (child instanceof Texture && name.match(/normalTexture/i)) semantics.add('TANGENT');
    if (child instanceof ExtensionProperty) listRequiredSemantics(document, prim, child, semantics);
  }
  const isLit = material instanceof Material && !material.getExtension('KHR_materials_unlit');
  const isPoints = prim.getMode() === Primitive.Mode.POINTS;
  if (isLit && !isPoints) semantics.add('NORMAL');
  return semantics;
}

function shiftTexCoords(material: Material, prims: Primitive[]): void {
  const textureInfoList = listTextureInfoByMaterial(material);
  const texCoordSet = new Set(textureInfoList.map((info: TextureInfo) => info.getTexCoord()));
  const texCoordList = Array.from(texCoordSet).sort();
  const texCoordMap = new Map(texCoordList.map((texCoord, index) => [texCoord, index]));
  const semanticMap = new Map(texCoordList.map((texCoord, index) => [`TEXCOORD_${texCoord}`, `TEXCOORD_${index}`]));

  for (const textureInfo of textureInfoList) {
    const texCoord = textureInfo.getTexCoord();
    textureInfo.setTexCoord(texCoordMap.get(texCoord)!);
  }

  for (const prim of prims) {
    const semantics = prim.listSemantics().filter((s) => s.startsWith('TEXCOORD_')).sort();
    updatePrim(prim, semantics, semanticMap);
    prim.listTargets().forEach((target) => updatePrim(target, semantics, semanticMap));
  }
}

function updatePrim(
  prim: Primitive | PrimitiveTarget,
  srcSemantics: string[],
  semanticMap: Map<string, string>,
): void {
  for (const srcSemantic of srcSemantics) {
    const uv = prim.getAttribute(srcSemantic);
    if (!uv) continue;
    const dstSemantic = semanticMap.get(srcSemantic)!;
    if (dstSemantic === srcSemantic) continue;
    prim.setAttribute(dstSemantic, uv);
    prim.setAttribute(srcSemantic, null);
  }
}

function listTextureInfoByMaterial(material: Material): TextureInfo[] {
  const graph = material.getGraph();
  const visited = new Set<Property>();
  const results = new Set<TextureInfo>();
  function traverse(prop: Material | ExtensionProperty) {
    const textureInfoNames = new Set<string>();
    for (const edge of graph.listChildEdges(prop)) {
      if (edge.getChild() instanceof Texture) textureInfoNames.add(`${edge.getName()}Info`);
    }
    for (const edge of graph.listChildEdges(prop)) {
      const child = edge.getChild();
      if (visited.has(child)) continue;
      visited.add(child);
      if (child instanceof TextureInfo && textureInfoNames.has(edge.getName())) results.add(child);
      else if (child instanceof ExtensionProperty) traverse(child);
    }
  }
  traverse(material);
  return Array.from(results);
}

/**********************************************************************************************
 * weld (adapted from weld.ts, hash-table.ts, compact-primitive.ts)
 */

const EMPTY_U32: number = 2 ** 32 - 1;
const { POINTS } = Primitive.Mode;
const TRIANGLES_MODE = Primitive.Mode.TRIANGLES!;
const TRIANGLE_STRIP_MODE = Primitive.Mode.TRIANGLE_STRIP!;
const TRIANGLE_FAN_MODE = Primitive.Mode.TRIANGLE_FAN!;

export function weld(): Transform {
  return createTransform('weld', async (document: Document): Promise<void> => {
    if (document.hasExtension('KHR_mesh_primitive_restart')) {
      throw new Error('weld: Missing support for KHR_mesh_primitive_restart.');
    }
    for (const mesh of document.getRoot().listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        weldPrimitive(prim, true);
        if (getPrimitiveVertexCount(prim, 'render') === 0) deepDisposePrimitive(prim);
      }
      if (mesh.listPrimitives().length === 0) mesh.dispose();
    }
  });
}

function weldPrimitive(prim: Primitive, overwrite: boolean): void {
  if (prim.getIndices() && !overwrite) return;
  if (prim.getMode() === POINTS) return;

  const position = prim.getAttribute('POSITION');
  if (!position) return;
  const srcVertexCount = position.getCount();
  const srcIndices = prim.getIndices();
  const srcIndicesArray = srcIndices?.getArray();
  const srcIndicesCount = srcIndices ? srcIndices.getCount() : srcVertexCount;

  const stream = new VertexStream(prim);
  const tableSize = ceilPowerOfTwo(srcVertexCount + srcVertexCount / 4);
  const table = new Uint32Array(tableSize).fill(EMPTY_U32);
  const writeMap = new Uint32Array(srcVertexCount).fill(EMPTY_U32);

  let dstVertexCount = 0;
  for (let i = 0; i < srcIndicesCount; i++) {
    const srcIndex = srcIndicesArray ? (srcIndicesArray[i] as number) : i;
    if (writeMap[srcIndex] !== EMPTY_U32) continue;
    const hashIndex = hashLookup(table, tableSize, stream, srcIndex);
    const dstIndex = table[hashIndex]!;
    if (dstIndex === EMPTY_U32) {
      table[hashIndex] = srcIndex;
      writeMap[srcIndex] = dstVertexCount++;
    } else {
      writeMap[srcIndex] = writeMap[dstIndex]!;
    }
  }

  compactPrimitive(prim, writeMap, dstVertexCount);
}

class VertexStream {
  private attributes: { u8: Uint8Array; byteStride: number; paddedByteStride: number }[] = [];
  private u8: Uint8Array;
  private u32: Uint32Array;

  constructor(prim: Primitive) {
    let byteStride = 0;
    for (const attribute of deepListAttributes(prim)) byteStride += this.initAttribute(attribute);
    this.u8 = new Uint8Array(byteStride);
    this.u32 = new Uint32Array(this.u8.buffer);
  }

  private initAttribute(attribute: Accessor): number {
    const array = attribute.getArray()!;
    const u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
    const byteStride = attribute.getElementSize() * attribute.getComponentSize();
    const paddedByteStride = BufferUtils.padNumber(byteStride);
    this.attributes.push({ u8, byteStride, paddedByteStride });
    return paddedByteStride;
  }

  hash(index: number): number {
    let byteOffset = 0;
    for (const { u8, byteStride, paddedByteStride } of this.attributes) {
      for (let i = 0; i < paddedByteStride; i++) {
        this.u8[byteOffset + i] = i < byteStride ? u8[index * byteStride + i]! : 0;
      }
      byteOffset += paddedByteStride;
    }
    return murmurHash2(0, this.u32);
  }

  equal(a: number, b: number): boolean {
    for (const { u8, byteStride } of this.attributes) {
      for (let j = 0; j < byteStride; j++) {
        if (u8[a * byteStride + j] !== u8[b * byteStride + j]) return false;
      }
    }
    return true;
  }
}

function murmurHash2(h: number, key: Uint32Array): number {
  const m = 0x5bd1e995;
  const r = 24;
  for (let i = 0, il = key.length; i < il; i++) {
    let k = key[i]!;
    k = Math.imul(k, m) >>> 0;
    k = (k ^ (k >> r)) >>> 0;
    k = Math.imul(k, m) >>> 0;
    h = Math.imul(h, m) >>> 0;
    h = (h ^ k) >>> 0;
  }
  return h;
}

function hashLookup(table: Uint32Array, buckets: number, stream: VertexStream, key: number): number {
  const hashmod = buckets - 1;
  let bucket = stream.hash(key) & hashmod;
  for (let probe = 0; probe <= hashmod; probe++) {
    const item = table[bucket]!;
    if (item === EMPTY_U32 || stream.equal(item, key)) return bucket;
    bucket = (bucket + probe + 1) & hashmod;
  }
  throw new Error('Hash table full.');
}

function compactPrimitive(prim: Primitive, remap?: TypedArray, dstVertexCount?: number): Primitive {
  const document = Document.fromGraph(prim.getGraph())!;
  const plan = remap && dstVertexCount ? null : createCompactPlan(prim);
  const map = (remap ?? plan![0])! as TypedArray;
  const count = dstVertexCount ?? plan![1];

  const srcIndices = prim.getIndices();
  const srcIndicesArray = srcIndices ? srcIndices.getArray() : null;
  const srcIndicesCount = getPrimitiveVertexCount(prim, 'render');
  const dstIndices = document.createAccessor();
  const dstIndicesArray = createIndicesEmpty(srcIndicesCount, count);
  for (let i = 0; i < srcIndicesCount; i++) {
    dstIndicesArray[i] = map[srcIndicesArray ? (srcIndicesArray[i] as number) : i]!;
  }
  prim.setIndices(dstIndices.setArray(dstIndicesArray as TypedArray));

  const srcAttributesPrev = deepListAttributes(prim);
  for (const srcAttribute of prim.listAttributes()) {
    const dstAttribute = shallowCloneAccessor(document, srcAttribute);
    compactAttribute(srcAttribute, srcIndices, map, dstAttribute, count);
    prim.swap(srcAttribute, dstAttribute);
  }
  for (const target of prim.listTargets()) {
    for (const srcAttribute of target.listAttributes()) {
      const dstAttribute = shallowCloneAccessor(document, srcAttribute);
      compactAttribute(srcAttribute, srcIndices, map, dstAttribute, count);
      target.swap(srcAttribute, dstAttribute);
    }
  }

  if (srcIndices && srcIndices.listParents().length === 1) srcIndices.dispose();
  for (const srcAttribute of srcAttributesPrev) {
    if (srcAttribute.listParents().length === 1) srcAttribute.dispose();
  }
  return prim;
}

function compactAttribute(
  srcAttribute: Accessor,
  srcIndices: Accessor | null,
  remap: TypedArray,
  dstAttribute: Accessor,
  dstVertexCount: number,
): Accessor {
  const elementSize = srcAttribute.getElementSize();
  const srcArray = srcAttribute.getArray()!;
  const srcIndicesArray = srcIndices ? srcIndices.getArray() : null;
  const srcIndicesCount = srcIndices ? srcIndices.getCount() : srcAttribute.getCount();
  const dstArray = new (srcArray.constructor as TypedArrayConstructor)(dstVertexCount * elementSize);
  const dstDone = new Uint8Array(dstVertexCount);
  for (let i = 0; i < srcIndicesCount; i++) {
    const srcIndex = srcIndicesArray ? (srcIndicesArray[i] as number) : i;
    const dstIndex = remap[srcIndex]!;
    if (dstDone[dstIndex]) continue;
    for (let j = 0; j < elementSize; j++) dstArray[dstIndex * elementSize + j] = srcArray[srcIndex * elementSize + j]!;
    dstDone[dstIndex] = 1;
  }
  return dstAttribute.setArray(dstArray);
}

function createCompactPlan(prim: Primitive): [Uint32Array, number] {
  const srcVertexCount = getPrimitiveVertexCount(prim, 'upload');
  const indices = prim.getIndices();
  const indicesArray = indices ? indices.getArray() : null;
  if (!indices || !indicesArray) {
    return [createIndices(srcVertexCount, 1_000_000) as Uint32Array<ArrayBuffer>, srcVertexCount];
  }
  const remap = new Uint32Array(srcVertexCount).fill(EMPTY_U32);
  let dstVertexCount = 0;
  for (let i = 0; i < indicesArray.length; i++) {
    const srcIndex = indicesArray[i] as number;
    if (remap[srcIndex] === EMPTY_U32) remap[srcIndex] = dstVertexCount++;
  }
  return [remap, dstVertexCount];
}

/**********************************************************************************************
 * simplifyPrimitive (adapted from simplify.ts, triangles/strip/fan only)
 */

export interface SimplifyOptions {
  simplifier: unknown;
  ratio?: number;
  error?: number;
  lockBorder?: boolean;
}

export function simplifyPrimitive(prim: Primitive, _options: SimplifyOptions): Primitive {
  const options = { ratio: 0, error: 0.0001, lockBorder: false, ..._options };
  const simplifier = options.simplifier as typeof import('meshoptimizer').MeshoptSimplifier;
  const document = Document.fromGraph(prim.getGraph())!;

  if (prim.getMode() === TRIANGLE_STRIP_MODE || prim.getMode() === TRIANGLE_FAN_MODE) {
    convertPrimitiveToTriangles(prim);
  } else if (prim.getMode() !== TRIANGLES_MODE) {
    return prim;
  }

  const srcVertexCount = getPrimitiveVertexCount(prim, 'upload');
  const srcIndexCount = getPrimitiveVertexCount(prim, 'render');
  if (srcIndexCount < srcVertexCount / 2) compactPrimitive(prim);

  const position = prim.getAttribute('POSITION')!;
  const srcIndices = prim.getIndices()!;
  let positionArray = position.getArray()!;
  let indicesArray = srcIndices.getArray()!;

  if (!(positionArray instanceof Float32Array)) {
    positionArray = dequantizeAttributeArray(positionArray, position.getComponentType(), position.getNormalized());
  }
  if (!(indicesArray instanceof Uint32Array)) indicesArray = new Uint32Array(indicesArray);

  const targetCount = Math.floor((options.ratio * srcIndexCount) / 3) * 3;
  const flags = options.lockBorder ? ['LockBorder'] : [];
  const [dstIndicesArray] = simplifier.simplify(
    indicesArray,
    positionArray,
    3,
    targetCount,
    options.error,
    flags as 'LockBorder'[],
  );

  prim.setIndices(shallowCloneAccessor(document, srcIndices).setArray(dstIndicesArray as Uint32Array<ArrayBuffer>));
  if (srcIndices.listParents().length === 1) srcIndices.dispose();
  compactPrimitive(prim);

  const dstVertexCount = getPrimitiveVertexCount(prim, 'upload');
  if (dstVertexCount <= 65534) {
    prim.getIndices()!.setArray(new Uint16Array(prim.getIndices()!.getArray()!));
  }
  return prim;
}

function convertPrimitiveToTriangles(prim: Primitive): void {
  const document = Document.fromGraph(prim.getGraph())!;
  if (!prim.getIndices()) weldPrimitive(prim, true);

  const srcIndices = prim.getIndices()!;
  const srcIndicesArray = srcIndices.getArray()!;
  const dstGLPrimitiveCount = getGLPrimitiveCount(prim);
  const IndicesArray = ComponentTypeToTypedArray[srcIndices.getComponentType()]!;
  const dstIndicesArray = new IndicesArray(dstGLPrimitiveCount * 3);
  const srcMode = prim.getMode()!;

  if (srcMode === TRIANGLE_STRIP_MODE) {
    for (let i = 0, il = srcIndicesArray.length; i < il - 2; i++) {
      if (i % 2) {
        dstIndicesArray[i * 3] = srcIndicesArray[i + 1]!;
        dstIndicesArray[i * 3 + 1] = srcIndicesArray[i]!;
        dstIndicesArray[i * 3 + 2] = srcIndicesArray[i + 2]!;
      } else {
        dstIndicesArray[i * 3] = srcIndicesArray[i]!;
        dstIndicesArray[i * 3 + 1] = srcIndicesArray[i + 1]!;
        dstIndicesArray[i * 3 + 2] = srcIndicesArray[i + 2]!;
      }
    }
  } else if (srcMode === TRIANGLE_FAN_MODE) {
    for (let i = 0; i < dstGLPrimitiveCount; i++) {
      dstIndicesArray[i * 3] = srcIndicesArray[0]!;
      dstIndicesArray[i * 3 + 1] = srcIndicesArray[i + 1]!;
      dstIndicesArray[i * 3 + 2] = srcIndicesArray[i + 2]!;
    }
  } else {
    throw new Error('Only TRIANGLE_STRIP and TRIANGLE_FAN may be converted to TRIANGLES.');
  }

  prim.setMode(TRIANGLES_MODE);
  const root = document.getRoot();
  if (srcIndices.listParents().some((parent) => parent !== root && parent !== prim)) {
    prim.setIndices(shallowCloneAccessor(document, srcIndices).setArray(dstIndicesArray));
  } else {
    srcIndices.setArray(dstIndicesArray);
  }
}

/**********************************************************************************************
 * Shared helpers (adapted from utils.ts, dequantize.ts, get-vertex-count.ts)
 */

function createTransform(name: string, fn: Transform): Transform {
  Object.defineProperty(fn, 'name', { value: name });
  return fn;
}

function isEmptyObject(object: Record<string, unknown>): boolean {
  for (const _key in object) return false;
  return true;
}

function ceilPowerOfTwo(value: number): number {
  return 2 ** Math.ceil(Math.log(value) / Math.LN2);
}

function isUsed(prop: Property): boolean {
  return prop.listParents().some((parent) => parent.propertyType !== PropertyType.ROOT);
}

function deepListAttributes(prim: Primitive): Accessor[] {
  const accessors: Accessor[] = [];
  for (const attribute of prim.listAttributes()) accessors.push(attribute);
  for (const target of prim.listTargets()) {
    for (const attribute of target.listAttributes()) accessors.push(attribute);
  }
  return Array.from(new Set(accessors));
}

function deepDisposePrimitive(prim: Primitive): void {
  const indices = prim.getIndices();
  const attributes = deepListAttributes(prim);
  prim.dispose();
  if (indices && !isUsed(indices)) indices.dispose();
  for (const attribute of attributes) if (!isUsed(attribute)) attribute.dispose();
}

function shallowCloneAccessor(document: Document, accessor: Accessor): Accessor {
  return document
    .createAccessor(accessor.getName())
    .setArray(accessor.getArray())
    .setType(accessor.getType())
    .setBuffer(accessor.getBuffer())
    .setNormalized(accessor.getNormalized())
    .setSparse(accessor.getSparse());
}

function createIndices(count: number, maxIndex: number = count): Uint16Array | Uint32Array {
  const array = createIndicesEmpty(count, maxIndex);
  for (let i = 0; i < array.length; i++) array[i] = i;
  return array;
}

function createIndicesEmpty(count: number, maxIndex: number = count): Uint16Array | Uint32Array {
  return maxIndex <= 65534 ? new Uint16Array(count) : new Uint32Array(count);
}

function dequantizeAttributeArray(
  srcArray: TypedArray,
  componentType: GLTF.AccessorComponentType,
  normalized: boolean,
): Float32Array<ArrayBuffer> {
  const dstArray = new Float32Array(srcArray.length);
  for (let i = 0, il = srcArray.length; i < il; i++) {
    dstArray[i] = normalized ? MathUtils.decodeNormalizedInt(srcArray[i]!, componentType) : srcArray[i]!;
  }
  return dstArray;
}

type VertexCountMethod = 'render' | 'upload';

function getPrimitiveVertexCount(prim: Primitive, method: VertexCountMethod): number {
  const position = prim.getAttribute('POSITION');
  const indices = prim.getIndices();
  if (!position) return 0;
  return method === 'render' ? (indices ? indices.getCount() : position.getCount()) : position.getCount();
}

function getGLPrimitiveCount(prim: Primitive): number {
  const indices = prim.getIndices();
  const position = prim.getAttribute('POSITION')!;
  switch (prim.getMode()) {
    case Primitive.Mode.POINTS:
      return indices ? indices.getCount() : position.getCount();
    case Primitive.Mode.LINES:
      return indices ? indices.getCount() / 2 : position.getCount() / 2;
    case Primitive.Mode.LINE_LOOP:
      return indices ? indices.getCount() : position.getCount();
    case Primitive.Mode.LINE_STRIP:
      return indices ? indices.getCount() - 1 : position.getCount() - 1;
    case Primitive.Mode.TRIANGLES:
      return indices ? indices.getCount() / 3 : position.getCount() / 3;
    case Primitive.Mode.TRIANGLE_STRIP:
    case Primitive.Mode.TRIANGLE_FAN:
      return indices ? indices.getCount() - 2 : position.getCount() - 2;
    default:
      throw new Error(`Unexpected mode: ${prim.getMode()}`);
  }
}

// Keep explicit references to imported types used only in signatures.
