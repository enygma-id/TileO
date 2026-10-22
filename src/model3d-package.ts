import { createReadStream } from 'node:fs';
import { open } from 'node:fs/promises';
import { ZipFile } from 'yazl';
import { JobError, type Job } from './types.js';

export async function readGltfCompanion(input: string) {
  const file = await open(input, 'r');
  try {
    const header = Buffer.alloc(20);
    if ((await file.read(header, 0, 20, 0)).bytesRead !== 20 || header.toString('ascii', 0, 4) !== 'glTF' || header.readUInt32LE(4) !== 2 || header.toString('ascii', 16, 20) !== 'JSON') throw new JobError('INVALID_GLB', 'The source model is not a GLB 2.0 file.');
    const jsonLength = header.readUInt32LE(12);
    if (jsonLength < 2 || jsonLength > 16 * 1024 ** 2) throw new JobError('INVALID_GLB', 'The source GLB JSON chunk is invalid.');
    const jsonBytes = Buffer.alloc(jsonLength);
    if ((await file.read(jsonBytes, 0, jsonLength, 20)).bytesRead !== jsonLength) throw new JobError('INVALID_GLB', 'The source GLB JSON chunk is incomplete.');
    const binHeader = Buffer.alloc(8);
    if ((await file.read(binHeader, 0, 8, 20 + jsonLength)).bytesRead !== 8 || binHeader.toString('ascii', 4, 8) !== 'BIN\0') throw new JobError('INVALID_GLB', 'The source GLB binary chunk is missing.');
    const binOffset = 28 + jsonLength, binLength = binHeader.readUInt32LE(0);
    if (header.readUInt32LE(8) !== (await file.stat()).size || binOffset + binLength !== header.readUInt32LE(8)) throw new JobError('INVALID_GLB', 'The source GLB length is invalid.');
    let gltf: { buffers?: { byteLength?: number; uri?: string }[] };
    try { gltf = JSON.parse(jsonBytes.toString('utf8')); }
    catch { throw new JobError('INVALID_GLB', 'The source GLB JSON is invalid.'); }
    if (!gltf || typeof gltf !== 'object') throw new JobError('INVALID_GLB', 'The source GLB JSON is invalid.');
    const length = gltf.buffers?.[0]?.byteLength;
    if (gltf.buffers?.length !== 1 || gltf.buffers[0]!.uri || !Number.isSafeInteger(length) || !length || length > binLength || binLength - length > 3) throw new JobError('INVALID_GLB', 'The source GLB buffer is invalid.');
    gltf.buffers[0]!.uri = 'original.bin';
    return { json: Buffer.from(`${JSON.stringify(gltf, null, 2)}\n`), binOffset, binLength: length };
  } finally { await file.close(); }
}

export function addGltfCompanion(zip: ZipFile, input: string, companion: Awaited<ReturnType<typeof readGltfCompanion>>, prefix = '') {
  zip.addBuffer(companion.json, `${prefix}original.gltf`);
  zip.addReadStream(createReadStream(input, { start: companion.binOffset, end: companion.binOffset + companion.binLength - 1 }), `${prefix}original.bin`, { size: companion.binLength, compress: false });
}

export function model3dPackageInfo(job: Job) {
  const formats: Record<string, unknown> = { '3dtiles': { entrypoint: 'tileset.json', version: '1.1' }, glb: { file: 'models/original.glb' }, gltf: { file: 'models/original.gltf', resources: ['models/original.bin'] } };
  const available = job.metadata?.formats;
  if (Array.isArray(available) && available.includes('b3dm')) formats.b3dm = { download: '?file=b3dm', version: '1.0', compatibility: true };
  return {
    version: 1,
    entrypoint: 'tileset.json',
    formats,
    placement: { latitude: job.options.latitude, longitude: job.options.longitude, ellipsoidHeightMeters: job.options.height, heading: job.options.heading ?? 0, pitch: job.options.pitch ?? 0, roll: job.options.roll ?? 0, anchor: job.options.anchor ?? 'base', scale: job.options.scale ?? 1 },
    note: '3D Tiles applies placement through the root transform. GLB and glTF are the original local-coordinate model; use the placement values or tileset transform when importing them separately.',
  };
}

export const model3dPackageReadme = '# TileO 3D package\n\nOpen `tileset.json` in a 3D Tiles 1.1 viewer. The `tiles/` directory contains the generated levels of detail. When `b3dm` is listed in `manifest.json`, a separate 3D Tiles 1.0 compatibility ZIP is available from the B3DM download action.\n\n`models/original.glb` is the untouched source model. `models/original.gltf` and `models/original.bin` are the same source model split into glTF 2.0 files; keep them together. These model files use local coordinates. See `manifest.json` for placement; the geographic transform is applied by `tileset.json`.\n';
