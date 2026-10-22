import { createReadStream, createWriteStream } from 'node:fs';
import { copyFile, open, writeFile, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { NodeIO, type Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { cloneDocument, prune, simplifyPrimitive, weld } from './gltf-ops.js';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { JobError, type Options } from './types.js';

type Glb = { asset?: { version?: string }; extensionsUsed?: string[]; extensionsRequired?: string[]; buffers?: { uri?: string; byteLength?: number }[]; bufferViews?: { buffer?: number; byteOffset?: number; byteLength?: number; byteStride?: number }[]; images?: { uri?: string }[]; accessors?: { bufferView?: number; byteOffset?: number; componentType?: number; count?: number; type?: string; min?: number[]; max?: number[] }[]; meshes?: { primitives?: { attributes?: { POSITION?: number }; indices?: number; mode?: number; targets?: unknown[] }[] }[]; nodes?: { mesh?: number; children?: number[]; matrix?: number[]; translation?: number[]; rotation?: number[]; scale?: number[]; skin?: number; extensions?: Record<string, unknown> }[]; scenes?: { nodes?: number[] }[]; scene?: number; skins?: unknown[] };
type Part = { node: number; min: number[]; max: number[]; triangles: number };
const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function multiply(a: number[], b: number[]) {
  const out = Array<number>(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) out[c * 4 + r]! += a[k * 4 + r]! * b[c * 4 + k]!;
  return out;
}
function nodeMatrix(node: NonNullable<Glb['nodes']>[number]) {
  if (node.matrix) return node.matrix;
  const [x, y, z, w] = node.rotation ?? [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale ?? [1, 1, 1];
  const [tx, ty, tz] = node.translation ?? [0, 0, 0];
  return [
    (1 - 2 * (y! * y! + z! * z!)) * sx!, (2 * (x! * y! + z! * w!)) * sx!, (2 * (x! * z! - y! * w!)) * sx!, 0,
    (2 * (x! * y! - z! * w!)) * sy!, (1 - 2 * (x! * x! + z! * z!)) * sy!, (2 * (y! * z! + x! * w!)) * sy!, 0,
    (2 * (x! * z! + y! * w!)) * sz!, (2 * (y! * z! - x! * w!)) * sz!, (1 - 2 * (x! * x! + y! * y!)) * sz!, 0,
    tx!, ty!, tz!, 1,
  ];
}
function placementTransform(latitude: number, longitude: number, height: number, heading: number, pitch: number, roll: number, scale: number, anchor: number[]) {
  const lat = latitude * Math.PI / 180, lon = longitude * Math.PI / 180;
  const sl = Math.sin(lat), cl = Math.cos(lat), so = Math.sin(lon), co = Math.cos(lon);
  const east = [-so, co, 0], north = [-sl * co, -sl * so, cl], up = [cl * co, cl * so, sl];
  const a = 6378137, e2 = 6.69437999014e-3, n = a / Math.sqrt(1 - e2 * sl * sl);
  const enu = [
    ...east, 0,
    ...north, 0,
    ...up, 0,
    (n + height) * cl * co, (n + height) * cl * so, (n * (1 - e2) + height) * sl, 1,
  ];
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const [h, p, r] = [-radians(heading), radians(pitch), radians(roll)];
  const rz = [Math.cos(h), Math.sin(h), 0, 0, -Math.sin(h), Math.cos(h), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const rx = [1, 0, 0, 0, 0, Math.cos(p), Math.sin(p), 0, 0, -Math.sin(p), Math.cos(p), 0, 0, 0, 0, 1];
  const ry = [Math.cos(r), 0, -Math.sin(r), 0, 0, 1, 0, 0, Math.sin(r), 0, Math.cos(r), 0, 0, 0, 0, 1];
  const scaled = [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1];
  const offset = [...identity]; offset[12] = -anchor[0]!; offset[13] = -anchor[1]!; offset[14] = -anchor[2]!;
  return multiply(enu, multiply(multiply(multiply(rz, rx), ry), multiply(scaled, offset)));
}

function bounds(parts: Part[]) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const part of parts) for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i]!, part.min[i]!); max[i] = Math.max(max[i]!, part.max[i]!); }
  const center = min.map((v, i) => (v + max[i]!) / 2), half = min.map((v, i) => Math.max((max[i]! - v) / 2, 0.01));
  return { min, max, center, half, box: [center[0], center[1], center[2], half[0], 0, 0, 0, half[1], 0, 0, 0, half[2]] };
}

function split(parts: Part[], depth = 0): Part[][] {
  const triangles = parts.reduce((sum, part) => sum + part.triangles, 0);
  if (depth >= 5 || parts.length <= 8 && triangles <= 100_000) return [parts];
  const extent = [0, 1].map(axis => Math.max(...parts.map(p => p.max[axis]!)) - Math.min(...parts.map(p => p.min[axis]!)));
  const axis = extent[1]! > extent[0]! ? 1 : 0;
  const ordered = [...parts].sort((a, b) => (a.min[axis]! + a.max[axis]!) - (b.min[axis]! + b.max[axis]!));
  const middle = Math.ceil(ordered.length / 2);
  if (middle === ordered.length) return [parts];
  return [...split(ordered.slice(0, middle), depth + 1), ...split(ordered.slice(middle), depth + 1)];
}

async function writeTile(io: NodeIO, source: Document, path: string, selectedNodes?: Set<number>, detail?: { ratio: number; error: number }) {
  const document = cloneDocument(source);
  if (selectedNodes) document.getRoot().listNodes().forEach((node, index) => { if (!selectedNodes.has(index)) node.setMesh(null); });
  await document.transform(prune());
  if (detail) {
    await document.transform(weld());
    for (const mesh of document.getRoot().listMeshes()) for (const primitive of mesh.listPrimitives()) {
      if ((primitive.getMode() === 4 || primitive.getMode() === 5 || primitive.getMode() === 6) && (primitive.getIndices()?.getCount() ?? primitive.getAttribute('POSITION')?.getCount() ?? 0) >= 90) simplifyPrimitive(primitive, { simplifier: MeshoptSimplifier, ...detail });
    }
    await document.transform(prune());
  }
  await io.write(path, document);
}

async function writeTiled(input: string, directory: string, parts: Part[], nodeCount: number, rootBox: ReturnType<typeof bounds>, transform: number[], signal?: AbortSignal) {
  await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
  const source = await io.read(input);
  if (source.getRoot().listNodes().length !== nodeCount) throw new Error('GLB node order could not be preserved for spatial tiling.');
  const tileDirectory = join(directory, 'tiles');
  await mkdir(tileDirectory, { recursive: true });
  signal?.throwIfAborted();

  await writeTile(io, source, join(tileDirectory, 'lod-0.glb'), undefined, { ratio: 0.1, error: 0.05 });
  const groups = split(parts), leaves: { parts: Part[]; tile: any }[] = [];
  for (let index = 0; index < groups.length; index++) {
    signal?.throwIfAborted();
    const group = groups[index]!, uri = `tiles/tile-${index}.glb`;
    await writeTile(io, source, join(directory, uri), new Set(group.map(part => part.node)));
    leaves.push({ parts: group, tile: { boundingVolume: { box: bounds(group).box }, geometricError: 0, content: { uri } } });
  }
  let children: unknown[], tiles = 1 + leaves.length, lodLevels = 2;
  if (leaves.length > 4) {
    children = [];
    for (let index = 0; index < leaves.length; index += 4) {
      signal?.throwIfAborted();
      const branch = leaves.slice(index, index + 4), group = branch.flatMap(leaf => leaf.parts), box = bounds(group), uri = `tiles/lod-1-${index / 4}.glb`;
      await writeTile(io, source, join(directory, uri), new Set(group.map(part => part.node)), { ratio: 0.35, error: 0.02 });
      children.push({ boundingVolume: { box: box.box }, geometricError: Math.max(0.01, Math.hypot(...box.half) * 0.02), content: { uri }, children: branch.map(leaf => leaf.tile) });
      tiles++;
    }
    lodLevels = 3;
  } else children = leaves.map(leaf => leaf.tile);
  const geometricError = Math.max(0.01, Math.hypot(...rootBox.half) * 0.05);
  return {
    tileset: { asset: { version: '1.1' }, geometricError, root: { boundingVolume: { box: rootBox.box }, geometricError, refine: 'REPLACE', transform, content: { uri: 'tiles/lod-0.glb' }, children } },
    tiles, lodLevels, strategy: groups.length > 1 ? 'spatial-lod' : 'lod',
  };
}

async function validateGeometry(input: string, glb: Glb, visited: Set<number>, signal?: AbortSignal) {
  signal?.throwIfAborted();
  await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  let document: Document;
  try { document = await io.read(input); }
  catch (error) { throw new JobError('INVALID_GLB', `Could not decode GLB geometry: ${String(error)}`); }
  const accessors = document.getRoot().listAccessors();
  const checkedPositions = new Set<number>(), checkedIndices = new Set<string>();
  for (const id of visited) {
    const node = glb.nodes![id]!;
    if (node.mesh === undefined) continue;
    for (const primitive of glb.meshes![node.mesh]!.primitives ?? []) {
      signal?.throwIfAborted();
      const positionIndex = primitive.attributes!.POSITION!;
      const position = accessors[positionIndex];
      const values = position?.getArray();
      const declared = glb.accessors![positionIndex]!;
      if (!checkedPositions.has(positionIndex)) {
        if (!values || values.length !== declared.count! * 3) throw new JobError('INVALID_GLB', 'POSITION data does not match its accessor count.');
        const actualMin = [Infinity, Infinity, Infinity], actualMax = [-Infinity, -Infinity, -Infinity];
        for (let i = 0; i < values.length; i++) {
          const value = values[i]!;
          if (!Number.isFinite(value)) throw new JobError('INVALID_GLB', 'POSITION contains a non-finite vertex.');
          const axis = i % 3;
          actualMin[axis] = Math.min(actualMin[axis]!, value);
          actualMax[axis] = Math.max(actualMax[axis]!, value);
        }
        for (let axis = 0; axis < 3; axis++) {
          const tolerance = Math.max(1e-5, Math.abs(actualMin[axis]!) * 1e-6, Math.abs(actualMax[axis]!) * 1e-6);
          if (Math.abs(declared.min![axis]! - actualMin[axis]!) > tolerance || Math.abs(declared.max![axis]! - actualMax[axis]!) > tolerance) throw new JobError('INVALID_GLB', 'POSITION bounds do not match the vertex data.');
        }
        checkedPositions.add(positionIndex);
      }
      if (primitive.indices !== undefined) {
        const key = `${primitive.indices}:${declared.count}`;
        if (!checkedIndices.has(key)) {
          const indices = accessors[primitive.indices]?.getArray();
          if (!indices || indices.length !== glb.accessors![primitive.indices]!.count) throw new JobError('INVALID_GLB', 'Index data does not match its accessor count.');
          for (const index of indices) if (!Number.isInteger(index) || index < 0 || index >= declared.count!) throw new JobError('INVALID_GLB', 'Mesh index exceeds the POSITION vertex count.');
          checkedIndices.add(key);
        }
      }
    }
  }
}

// ponytail: validates TileO's generated subset; use the official validator if external tilesets become accepted inputs.
async function validateGeneratedTileset(directory: string, tileset: any) {
  if (tileset?.asset?.version !== '1.1' || !tileset.root || !Number.isFinite(tileset.geometricError) || tileset.geometricError < 0) throw new JobError('INVALID_3D_TILES', 'Generated tileset metadata is invalid.');
  const visit = async (tile: any, parentError = Infinity) => {
    const box = tile?.boundingVolume?.box;
    if (!Array.isArray(box) || box.length !== 12 || box.some((value: unknown) => typeof value !== 'number' || !Number.isFinite(value)) || !Number.isFinite(tile.geometricError) || tile.geometricError < 0 || tile.geometricError > parentError) throw new JobError('INVALID_3D_TILES', 'Generated tile hierarchy or bounding volume is invalid.');
    if (tile.content?.uri) {
      if (!/^tiles\/[a-z0-9-]+\.glb$/.test(tile.content.uri)) throw new JobError('INVALID_3D_TILES', 'Generated tile contains an invalid content URI.');
      const content = await stat(join(directory, tile.content.uri));
      if (!content.isFile() || content.size < 28) throw new JobError('INVALID_3D_TILES', 'Generated tile content is missing or empty.');
    }
    await Promise.all((tile.children ?? []).map((child: unknown) => visit(child, tile.geometricError)));
  };
  await visit(tileset.root);
}

async function wrapGlbAsB3dm(input: string, output: string, signal?: AbortSignal) {
  const glbSize = (await stat(input)).size;
  const featureJson = Buffer.from('{"BATCH_LENGTH":0}');
  const padding = Buffer.alloc((8 - ((28 + featureJson.length) % 8)) % 8, 0x20);
  const featureTable = Buffer.concat([featureJson, padding]);
  const byteLength = 28 + featureTable.length + glbSize;
  if (byteLength > 0xffffffff) throw new JobError('B3DM_LIMIT', 'A generated GLB tile is too large for the B3DM 32-bit byte-length field. Use 3D Tiles 1.1 output.');
  const header = Buffer.alloc(28);
  header.write('b3dm', 0); header.writeUInt32LE(1, 4); header.writeUInt32LE(byteLength, 8);
  header.writeUInt32LE(featureTable.length, 12);
  const content = async function* () {
    yield header; yield featureTable;
    for await (const chunk of createReadStream(input)) { signal?.throwIfAborted(); yield chunk; }
  };
  await pipeline(Readable.from(content()), createWriteStream(output, { flags: 'wx' }), { signal });
  const generated = await open(output, 'r');
  try {
    const check = Buffer.alloc(32 + featureTable.length);
    if ((await generated.read(check, 0, check.length, 0)).bytesRead !== check.length || check.toString('ascii', 0, 4) !== 'b3dm' || check.readUInt32LE(4) !== 1 || check.readUInt32LE(8) !== byteLength || check.toString('ascii', 28 + featureTable.length, 32 + featureTable.length) !== 'glTF') throw new JobError('INVALID_B3DM', 'Generated B3DM content failed structural validation.');
  } finally { await generated.close(); }
}

async function buildB3dmPackage(directory: string, tileset: any, signal?: AbortSignal) {
  const legacyDirectory = join(directory, 'legacy-b3dm');
  await mkdir(join(legacyDirectory, 'tiles'), { recursive: true });
  const legacyTileset = JSON.parse(JSON.stringify(tileset));
  legacyTileset.asset = { ...legacyTileset.asset, version: '1.0', tilesetVersion: 'tileo-b3dm-1' };
  const convert = async (tile: any) => {
    signal?.throwIfAborted();
    if (tile.content?.uri) {
      const glbUri = String(tile.content.uri);
      const b3dmUri = glbUri.replace(/\.glb$/, '.b3dm');
      await wrapGlbAsB3dm(join(directory, glbUri), join(legacyDirectory, b3dmUri), signal);
      tile.content.url = b3dmUri;
      delete tile.content.uri;
    }
    for (const child of tile.children ?? []) await convert(child);
  };
  await convert(legacyTileset.root);
  await writeFile(join(legacyDirectory, 'tileset.json'), JSON.stringify(legacyTileset));
}

export async function build3dTiles(input: string, directory: string, options: Options, signal?: AbortSignal, memoryBudget = Infinity) {
  signal?.throwIfAborted();
  if (options.latitude === undefined || options.longitude === undefined || options.height === undefined) throw new JobError('MISSING_LOCATION', 'GLB needs latitude, longitude, and ellipsoid height.');
  const handle = await open(input, 'r');
  let glb: Glb, binSize = 0, sourceSize = 0;
  try {
    const header = Buffer.alloc(20);
    if ((await handle.read(header, 0, 20, 0)).bytesRead !== 20 || header.toString('ascii', 0, 4) !== 'glTF' || header.readUInt32LE(4) !== 2) throw new JobError('INVALID_GLB', 'Expected a binary glTF 2.0 file.');
    const size = (await handle.stat()).size, jsonSize = header.readUInt32LE(12); sourceSize = size;
    if (header.readUInt32LE(8) !== size || header.toString('ascii', 16, 20) !== 'JSON' || jsonSize < 2 || jsonSize > 16 * 1024 ** 2 || jsonSize + 20 > size) throw new JobError('INVALID_GLB', 'Invalid GLB header or JSON chunk.');
    const json = Buffer.alloc(jsonSize);
    if ((await handle.read(json, 0, jsonSize, 20)).bytesRead !== jsonSize) throw new JobError('INVALID_GLB', 'Incomplete GLB JSON chunk.');
    const binHeader = Buffer.alloc(8);
    if ((await handle.read(binHeader, 0, 8, 20 + jsonSize)).bytesRead !== 8 || binHeader.toString('ascii', 4, 8) !== 'BIN\0' || 28 + jsonSize + binHeader.readUInt32LE(0) !== size) throw new JobError('INVALID_GLB', 'GLB needs one complete embedded BIN chunk.');
    binSize = binHeader.readUInt32LE(0);
    try { glb = JSON.parse(json.toString('utf8')); } catch { throw new JobError('INVALID_GLB', 'Invalid GLB JSON.'); }
  } finally { await handle.close(); }
  if (glb.asset?.version !== '2.0' || glb.buffers?.length !== 1 || glb.buffers[0]?.uri || !Number.isSafeInteger(glb.buffers[0]?.byteLength) || glb.buffers[0]!.byteLength! <= 0 || glb.buffers[0]!.byteLength! > binSize || binSize - glb.buffers[0]!.byteLength! > 3 || glb.images?.some(i => i.uri && !i.uri.startsWith('data:'))) throw new JobError('INVALID_GLB', 'Use a self-contained GLB 2.0 with embedded geometry and textures.');
  if (glb.extensionsUsed?.includes('KHR_draco_mesh_compression')) throw new JobError('UNSUPPORTED_GLB', 'Draco-compressed GLB is not supported yet. Export with Meshopt compression or uncompressed geometry.');
  if (glb.nodes?.some(node => node.extensions?.EXT_mesh_gpu_instancing)) throw new JobError('UNSUPPORTED_GLB', 'EXT_mesh_gpu_instancing must be expanded to regular mesh nodes before tiling so bounds remain correct.');
  if (glb.bufferViews?.some(v => v.buffer !== 0 || !Number.isSafeInteger(v.byteLength) || v.byteLength! <= 0 || !Number.isSafeInteger(v.byteOffset ?? 0) || (v.byteOffset ?? 0) < 0 || (v.byteOffset ?? 0) + v.byteLength! > glb.buffers![0]!.byteLength!)) throw new JobError('INVALID_GLB', 'A GLB buffer view exceeds the embedded BIN chunk.');
  if (glb.skins?.length || glb.meshes?.some(m => m.primitives?.some(p => p.targets?.length))) throw new JobError('UNSUPPORTED_GLB', 'Animated/skinned or morph-target models need pre-baking before tiling.');
  const nodes = glb.nodes ?? [], roots = glb.scenes?.[glb.scene ?? 0]?.nodes ?? [];
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity], parts: Part[] = [];
  let primitives = 0, triangles = 0;
  const visited = new Set<number>();
  const visit = (id: number, parent: number[], ancestors: Set<number>) => {
    if (!Number.isInteger(id) || id < 0 || id >= nodes.length || ancestors.has(id)) throw new JobError('INVALID_GLB', 'Invalid GLB scene graph.');
    if (visited.has(id)) throw new JobError('INVALID_GLB', 'A GLB node cannot have multiple parents or appear more than once in the active scene.');
    visited.add(id);
    const node = nodes[id]!;
    if (node.skin !== undefined) throw new JobError('UNSUPPORTED_GLB', 'Skinned models need pre-baking before tiling.');
    const matrix = multiply(parent, nodeMatrix(node));
    if (!matrix.every(Number.isFinite)) throw new JobError('INVALID_GLB', 'Invalid model transform.');
    if (node.mesh !== undefined) {
      const mesh = glb.meshes?.[node.mesh];
      if (!mesh) throw new JobError('INVALID_GLB', 'Missing mesh.');
      const partMin = [Infinity, Infinity, Infinity], partMax = [-Infinity, -Infinity, -Infinity];
      let partTriangles = 0;
      for (const primitive of mesh.primitives ?? []) {
        const accessor = glb.accessors?.[primitive.attributes?.POSITION ?? -1];
        const view = glb.bufferViews?.[accessor?.bufferView ?? -1];
        const stride = view?.byteStride ?? 12;
        if (!accessor?.min || !accessor.max || accessor.min.length !== 3 || accessor.max.length !== 3 || [...accessor.min, ...accessor.max].some(v => !Number.isFinite(v)) || accessor.min.some((v, i) => v > accessor.max![i]!) || accessor.componentType !== 5126 || accessor.type !== 'VEC3' || !Number.isSafeInteger(accessor.count) || accessor.count! <= 0 || !view || !Number.isSafeInteger(accessor.byteOffset ?? 0) || (accessor.byteOffset ?? 0) < 0 || stride < 12 || stride % 4 !== 0 || (accessor.byteOffset ?? 0) + stride * (accessor.count! - 1) + 12 > view.byteLength!) throw new JobError('INVALID_GLB', 'Each mesh needs a valid FLOAT VEC3 POSITION accessor with finite bounds.');
        const indexAccessor = primitive.indices === undefined ? undefined : glb.accessors?.[primitive.indices];
        if (primitive.indices !== undefined && (!Number.isSafeInteger(primitive.indices) || !indexAccessor || indexAccessor.type !== 'SCALAR' || ![5121, 5123, 5125].includes(indexAccessor.componentType ?? -1) || !Number.isSafeInteger(indexAccessor.count) || indexAccessor.count! <= 0)) throw new JobError('INVALID_GLB', 'Mesh indices need a valid unsigned integer SCALAR accessor.');
        const indexCount = indexAccessor?.count ?? accessor.count!;
        const mode = primitive.mode ?? 4;
        if (!Number.isInteger(mode) || mode < 0 || mode > 6) throw new JobError('INVALID_GLB', 'Invalid mesh primitive mode.');
        primitives++;
        if (mode === 4) partTriangles += Math.floor(indexCount / 3);
        if (mode === 5 || mode === 6) partTriangles += Math.max(0, indexCount - 2);
        for (const x of [accessor.min[0]!, accessor.max[0]!]) for (const y of [accessor.min[1]!, accessor.max[1]!]) for (const z of [accessor.min[2]!, accessor.max[2]!]) {
          const p = [matrix[0]! * x + matrix[4]! * y + matrix[8]! * z + matrix[12]!, matrix[1]! * x + matrix[5]! * y + matrix[9]! * z + matrix[13]!, matrix[2]! * x + matrix[6]! * y + matrix[10]! * z + matrix[14]!];
          const point = [p[0]!, -p[2]!, p[1]!];
          point.forEach((v, i) => { min[i] = Math.min(min[i]!, v); max[i] = Math.max(max[i]!, v); partMin[i] = Math.min(partMin[i]!, v); partMax[i] = Math.max(partMax[i]!, v); });
        }
      }
      if (partMin.every(Number.isFinite)) { parts.push({ node: id, min: partMin, max: partMax, triangles: partTriangles }); triangles += partTriangles; }
    }
    const path = new Set(ancestors); path.add(id);
    for (const child of node.children ?? []) visit(child, matrix, path);
  };
  for (const root of roots) visit(root, identity, new Set());
  if (!primitives || min.some((v, i) => !Number.isFinite(v) || v > max[i]!)) throw new JobError('EMPTY_DATASET', 'GLB scene has no bounded mesh.');
  await validateGeometry(input, glb, visited, signal);
  signal?.throwIfAborted();
  const rootBox = bounds(parts);
  const anchor = options.anchor === 'origin' ? [0, 0, 0] : options.anchor === 'center' ? rootBox.center : [rootBox.center[0]!, rootBox.center[1]!, rootBox.min[2]!];
  const transform = placementTransform(options.latitude, options.longitude, options.height, options.heading ?? 0, options.pitch ?? 0, options.roll ?? 0, options.scale ?? 1, anchor);
  await mkdir(directory, { recursive: true });
  let result: { tileset: unknown; tiles: number; lodLevels: number; strategy: string };
  const shouldTile = parts.length > 8 || triangles >= 50_000;
  if (shouldTile) {
    if (sourceSize * 3 > memoryBudget) throw new JobError('MEMORY_LIMIT', `This GLB needs about ${(sourceSize * 3 / 1024 ** 2).toFixed(0)} MB to build spatial tiles, exceeding the configured worker memory budget.`);
    result = await writeTiled(input, directory, parts, nodes.length, rootBox, transform, signal);
  } else result = { tileset: { asset: { version: '1.1' }, geometricError: 0, root: { boundingVolume: { box: rootBox.box }, geometricError: 0, refine: 'ADD', transform, content: { uri: 'tiles/model.glb' } } }, tiles: 1, lodLevels: 1, strategy: 'single' };
  if (result.tiles === 1) { await mkdir(join(directory, 'tiles'), { recursive: true }); await copyFile(input, join(directory, 'tiles/model.glb')); }
  signal?.throwIfAborted();
  await validateGeneratedTileset(directory, result.tileset);
  await writeFile(join(directory, 'tileset.json'), JSON.stringify(result.tileset));
  if (options.exportB3dm) await buildB3dmPackage(directory, result.tileset, signal);
  return { kind: 'model3d', format: '3dtiles', formats: ['3dtiles', ...(options.exportB3dm ? ['b3dm'] : []), 'glb', 'gltf'], latitude: options.latitude, longitude: options.longitude, height: options.height, heading: options.heading, pitch: options.pitch, roll: options.roll, anchor: options.anchor, scale: options.scale, primitives, triangles, tiles: result.tiles, lodLevels: result.lodLevels, strategy: result.strategy };
}
