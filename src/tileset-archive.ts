import { createWriteStream } from 'node:fs';
import { mkdir, open, readFile } from 'node:fs/promises';
import { dirname, extname, join, posix } from 'node:path';
import { addAbortSignal, Transform } from 'node:stream';
import { buffer } from 'node:stream/consumers';
import { pipeline } from 'node:stream/promises';
import { crc32 } from 'node:zlib';
import { openPromise, type Entry } from 'yauzl';
import { config } from './config.js';
import { glbJsonSizeError } from './glb-limits.js';
import { checkDisk } from './resources.js';
import { JobError } from './types.js';

const maxEntries = 50_000;
const maxManifestBytes = 8 * 1024 ** 2;
const contentTypes = new Map([
  ['.glb', 'model/gltf-binary'],
  ['.b3dm', 'application/octet-stream'],
]);

function isTilesetManifestName(filename: string) {
  return filename.toLowerCase() === 'tileset.json';
}

export async function rejectLooseTileset(input: string, filename: string, size: number) {
  if (!isTilesetManifestName(filename) || size > maxManifestBytes) return;
  const text = await readFile(input, 'utf8');
  let manifest: Record<string, unknown> | undefined;
  try { manifest = object(JSON.parse(text.replace(/^\uFEFF/, ''))); } catch { return; }
  if (object(manifest?.asset) && object(manifest?.root)) {
    throw new JobError('INVALID_INPUT', 'Upload a ZIP containing tileset.json and its GLB or B3DM files.');
  }
}

export function tilesetArchiveMime(path: string) {
  if (!safePath(path)) return undefined;
  const extension = extname(path).toLowerCase();
  return extension === '.json' ? 'application/json' : contentTypes.get(extension);
}

function invalid(message: string): never {
  throw new JobError('INVALID_TILESET_ARCHIVE', message);
}

function safePath(path: string) {
  return path.length <= 1024 && path.split('/').every(part =>
    /^[\p{L}\p{N}_ .()\-]{1,200}$/u.test(part) &&
    !part.startsWith('.') && !part.endsWith('.') && part.trim() === part &&
    !/^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(part));
}

function resolveContent(uri: unknown) {
  if (typeof uri !== 'string' || uri.includes('?') || uri.includes('#') || /%2f|%5c/i.test(uri)) {
    invalid('Tile content must use a relative path inside the archive.');
  }
  let path: string;
  try { path = decodeURIComponent(uri.replace(/^\.\//, '')); }
  catch { return invalid('A tile has an invalid URI.'); }
  if (!safePath(path)) invalid('Tile content must use a relative path inside the archive.');
  if (extname(path).toLowerCase() !== '.json' && !contentTypes.has(extname(path).toLowerCase())) {
    invalid(`Unsupported tile content ${path}. Use GLB, B3DM or a referenced tileset JSON.`);
  }
  return path;
}

function object(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function numbers(value: unknown, size: number): value is number[] {
  return Array.isArray(value) && value.length === size && value.every(Number.isFinite);
}

function geometricError(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function parseManifest(bytes: Buffer) {
  let manifest: Record<string, unknown> | undefined;
  try { manifest = object(JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''))); }
  catch { invalid('The tileset manifest is not valid JSON.'); }
  const version = object(manifest?.asset)?.version;
  if (version !== '0.0' && version !== '1.0' && version !== '1.1') invalid('Expected tileset asset.version 0.0 (legacy), 1.0 or 1.1.');
  const root = object(manifest?.root);
  if (!root || !geometricError(manifest?.geometricError)) invalid('The tileset requires a root tile and geometricError.');
  if (manifest?.schemaUri !== undefined) invalid('Use a tileset with embedded metadata schema.');
  const paths = new Map<string, number>();
  let tileCount = 0;
  let lodLevels = 0;
  const stack = [{ value: root as unknown, level: 1 }];
  while (stack.length) {
    const { value, level } = stack.pop()!;
    const tile = object(value);
    const volume = object(tile?.boundingVolume);
    if (!tile || !geometricError(tile.geometricError) || !volume ||
      !(numbers(volume.region, 6) || numbers(volume.box, 12) || numbers(volume.sphere, 4))) {
      invalid('Every tile requires geometricError and a finite region, box or sphere.');
    }
    if (tile.transform !== undefined && !numbers(tile.transform, 16)) invalid('Each transform must have 16 finite values.');
    if (tile.implicitTiling !== undefined || object(tile.extensions)?.['3DTILES_implicit_tiling'] !== undefined) {
      invalid('This tileset uses implicit tiling. Export an explicit tile hierarchy before importing it.');
    }
    if (tile.contents !== undefined || object(tile.extensions)?.['3DTILES_multiple_contents'] !== undefined) {
      invalid('This tileset uses multiple content files per tile. Export one GLB or B3DM per tile before importing it.');
    }
    if (++tileCount > Math.min(maxEntries, config.maxTiles) || level > 128) invalid('The tile hierarchy exceeds the import limit.');
    lodLevels = Math.max(lodLevels, level);
    if (tile.content !== undefined) {
      const content = object(tile.content);
      if (!content || (content.uri !== undefined && content.url !== undefined && content.uri !== content.url)) {
        invalid('A tile has ambiguous content.');
      }
      const path = resolveContent(content.uri ?? content.url);
      paths.set(path, Math.max(paths.get(path) ?? 0, level));
    }
    if (tile.children !== undefined && !Array.isArray(tile.children)) invalid('Tile children must be an array.');
    if (Array.isArray(tile.children)) for (const child of tile.children) stack.push({ value: child, level: level + 1 });
  }

  const region = object(root.boundingVolume)?.region;
  let bounds: [number, number, number, number] | undefined;
  if (numbers(region, 6)) {
    const [west, south, east, north] = region.map(value => value * 180 / Math.PI) as [number, number, number, number];
    if (Math.abs(west) <= 180 && Math.abs(east) <= 180 && south >= -90 && north <= 90 && south <= north) {
      bounds = [west, south, east < west ? east + 360 : east, north];
    }
  }
  return { version, tiles: tileCount, lodLevels, paths, bounds };
}

function checkedContents(source: NodeJS.ReadableStream, entry: Entry) {
  let checksum = 0;
  const check = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      checksum = crc32(chunk, checksum);
      callback(null, chunk);
    },
    flush(callback) {
      callback(checksum === entry.crc32 ? undefined : new JobError('INVALID_TILESET_ARCHIVE', 'A ZIP entry failed its integrity check.'));
    },
  });
  // Use pipeline at the call site to propagate input and output failures.
  return [source, check] as const;
}

async function validateTileFile(path: string, size: number) {
  const file = await open(path, 'r');
  try {
    const header = Buffer.alloc(28);
    let offset = 0;
    if (extname(path).toLowerCase() === '.b3dm') {
      if ((await file.read(header, 0, 28, 0)).bytesRead !== 28 ||
        header.toString('ascii', 0, 4) !== 'b3dm' || header.readUInt32LE(4) !== 1 || header.readUInt32LE(8) !== size) {
        invalid('A B3DM tile has an invalid header.');
      }
      offset = 28 + header.readUInt32LE(12) + header.readUInt32LE(16) + header.readUInt32LE(20) + header.readUInt32LE(24);
    }
    if (offset + 20 > size || (await file.read(header, 0, 20, offset)).bytesRead !== 20 ||
      header.toString('ascii', 0, 4) !== 'glTF' || header.readUInt32LE(4) !== 2 ||
      header.readUInt32LE(8) > size - offset || header.toString('ascii', 16, 20) !== 'JSON') {
      invalid('Tile content must contain a valid GLB 2.0 header.');
    }
    const length = header.readUInt32LE(12);
    const glbLength = header.readUInt32LE(8);
    const trailingBytes = size - offset - glbLength;
    if (trailingBytes > (offset ? 7 : 0) || length < 2 || length + 20 > glbLength || glbJsonSizeError(length)) {
      invalid('A tile has an invalid GLB length or JSON chunk.');
    }
    const bytes = Buffer.alloc(length);
    if ((await file.read(bytes, 0, length, offset + 20)).bytesRead !== length) invalid('A tile has truncated GLB JSON.');
    let gltf: Record<string, unknown> | undefined;
    try { gltf = object(JSON.parse(bytes.toString('utf8'))); }
    catch { invalid('A tile has invalid GLB JSON.'); }
    if (object(gltf?.asset)?.version !== '2.0') invalid('Tile content must contain a GLB 2.0 model.');
    // GLB resources must be embedded so preview cannot follow external asset URLs.
    const stack: unknown[] = [gltf];
    while (stack.length) {
      const value = stack.pop();
      if (Array.isArray(value)) {
        for (const item of value) stack.push(item);
      } else {
        for (const [key, item] of Object.entries(object(value) ?? {})) {
          if ((key === 'uri' || key === 'url') && (typeof item !== 'string' || !item.startsWith('data:'))) {
            invalid('Tile GLB buffers and textures must be embedded.');
          }
          if (key !== 'extras') stack.push(item);
        }
      }
    }
  } finally { await file.close(); }
}

export async function inspectTilesetArchive(input: string, signal: AbortSignal, destination?: string) {
  const zip = await openPromise(input, { lazyEntries: true, autoClose: false, strictFileNames: true })
    .catch(() => invalid('The ZIP central directory could not be read.'));
  try {
    const entries = new Map<string, Entry>();
    const manifests: Entry[] = [];
    let unsafe: Entry | undefined;
    let totalBytes = 0;
    if (zip.entryCount > maxEntries) invalid('The ZIP exceeds the 50,000 entry limit.');
    for await (const entry of zip.eachEntry()) {
      signal.throwIfAborted();
      const path = entry.fileName;
      const kind = (entry.externalFileAttributes >>> 16) & 0o170000;
      if (kind !== 0 && kind !== 0o100000 && kind !== 0o040000) unsafe ??= entry;
      if (path.split('/').some(part => part === '__MACOSX' || part === '.DS_Store' || part.startsWith('._'))) continue;
      if (path.endsWith('/')) continue;
      if (entries.has(path)) unsafe ??= entry;
      entries.set(path, entry);
      totalBytes += entry.uncompressedSize;
      if (isTilesetManifestName(path.split('/').at(-1)!)) manifests.push(entry);
    }
    if (!manifests.length) return undefined;
    if (unsafe) invalid('The ZIP contains a duplicate entry or a special file such as a symlink.');
    if (totalBytes > config.scratchBytes) invalid('The ZIP exceeds the configured uncompressed size limit.');
    // The root is the unique outermost tileset.json. Any other tileset.json
    // must be reachable through the root, so independent packages stay explicit.
    manifests.sort((a, b) => a.fileName.split('/').length - b.fileName.split('/').length);
    const manifest = manifests[0]!;
    const depth = manifest.fileName.split('/').length;
    const ambiguous = (names: Entry[]) => invalid(
      `The ZIP has independent 3D Tiles entry points: ${names.slice(0, 4).map(entry => entry.fileName).join(', ')}. Upload one package per ZIP with its root tileset.json and all referenced files.`);
    if (manifests[1]?.fileName.split('/').length === depth) ambiguous(manifests.filter(entry => entry.fileName.split('/').length === depth));
    const base = manifest.fileName.slice(0, manifest.fileName.lastIndexOf('/') + 1);
    const files = new Map<string, Entry>();
    const portable = new Set<string>();
    const parsed = new Map<string, ReturnType<typeof parseManifest>>();
    const visiting = new Set<string>();
    const levels = new Map<string, number>();
    let tiles = 0;
    let manifestBytes = 0;
    const formats = new Set<string>();

    const visit = async (name: string, entry: Entry, nesting: number): Promise<number> => {
      signal.throwIfAborted();
      if (nesting > 64 || visiting.has(name)) invalid(`External tileset nesting is too deep or cyclic at ${entry.fileName}.`);
      const prior = levels.get(name);
      if (prior !== undefined) return prior;
      if (!safePath(entry.fileName) || entry.uncompressedSize > maxManifestBytes || !entry.canDecodeFileData()) {
        invalid(`The manifest exceeds the path or size limits: ${entry.fileName}.`);
      }
      manifestBytes += entry.uncompressedSize;
      if (manifestBytes > 64 * 1024 ** 2) invalid('Referenced tileset manifests exceed the 64 MiB total limit.');
      visiting.add(name);
      const bytes = await buffer(addAbortSignal(signal, await zip.openReadStreamPromise(entry)));
      if (crc32(bytes) !== entry.crc32) invalid(`The tileset manifest failed its ZIP integrity check: ${entry.fileName}.`);
      let data: ReturnType<typeof parseManifest>;
      try { data = parseManifest(bytes); }
      catch (error) {
        if (error instanceof JobError) invalid(`${entry.fileName}: ${error.message}`);
        throw error;
      }
      parsed.set(name, data);
      tiles += data.tiles;
      if (tiles > Math.min(maxEntries, config.maxTiles)) invalid('The combined tile hierarchy exceeds the import limit.');
      let lod = data.lodLevels;
      for (const [uri, depth] of data.paths) {
        const path = posix.join(posix.dirname(name), uri);
        const target = entries.get(base + path);
        if (!target || !target.uncompressedSize) invalid(`${entry.fileName} references a missing or empty file: ${uri}.`);
        if (!safePath(path) || !target.canDecodeFileData() || (!files.has(path) && portable.has(path.toLowerCase()))) {
          invalid(`Unsupported or conflicting tile entry: ${path}.`);
        }
        portable.add(path.toLowerCase());
        files.set(path, target);
        const extension = extname(path).toLowerCase();
        if (extension === '.json') lod = Math.max(lod, depth + await visit(path, target, nesting + 1));
        else formats.add(extension.slice(1));
      }
      visiting.delete(name);
      levels.set(name, lod);
      return lod;
    };

    const rootName = posix.basename(manifest.fileName);
    portable.add(rootName.toLowerCase());
    const lodLevels = await visit(rootName, manifest, 1);
    const disconnected = manifests.filter(entry => !parsed.has(entry.fileName.slice(base.length)) || !entry.fileName.startsWith(base));
    if (disconnected.length) ambiguous([manifest, ...disconnected]);
    if (!formats.size) invalid('The tileset does not reference any GLB or B3DM files.');
    const { version, bounds } = parsed.get(rootName)!;
    if (destination) {
      await checkDisk(totalBytes);
      await mkdir(destination, { recursive: true });
      for (const [name, entry] of [['tileset.json', manifest] as const, ...files]) {
        signal.throwIfAborted();
        const path = join(destination, name);
        await mkdir(dirname(path), { recursive: true });
        await pipeline(...checkedContents(await zip.openReadStreamPromise(entry), entry), createWriteStream(path, { flags: 'wx' }), { signal });
        if (extname(name).toLowerCase() !== '.json') await validateTileFile(path, entry.uncompressedSize);
      }
    }
    return { kind: 'model3d' as const, crs: null, format: '3dtiles', version, tiles, lodLevels, bounds, entrypoint: manifest.fileName, contentFiles: files.size - parsed.size + 1, manifests: parsed.size, contentFormats: [...formats] };
  } catch (error) {
    if (signal.aborted) signal.throwIfAborted();
    if (error instanceof JobError || ['ENOSPC', 'EIO', 'EACCES'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
    throw new JobError('INVALID_TILESET_ARCHIVE', 'The ZIP is unreadable or contains conflicting paths.');
  } finally { zip.close(); }
}
