import { open, rm } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import Database from 'better-sqlite3';
import { zxyToTileId, PMTiles, type Entry } from 'pmtiles';
import { JobError } from './types.js';
import { checkDisk } from './resources.js';

function directory(entries: Entry[]) {
  const bytes: number[] = [];
  const varint = (value: number) => { while (value >= 128) { bytes.push(value % 128 + 128); value = Math.floor(value / 128); } bytes.push(value); };
  varint(entries.length);
  let previous = 0;
  for (const entry of entries) { varint(entry.tileId - previous); previous = entry.tileId; }
  for (const entry of entries) varint(entry.runLength);
  for (const entry of entries) varint(entry.length);
  entries.forEach((entry, i) => varint(i && entry.offset === entries[i - 1]!.offset + entries[i - 1]!.length ? 0 : entry.offset + 1));
  return gzipSync(Buffer.from(bytes));
}

// Keep payloads on disk and sort only tile coordinates, never all tile blobs in memory.
export async function exportPmtiles(input: string, output: string, signal?: AbortSignal) {
  const source = new Database(input, { readonly: true, fileMustExist: true });
  const indexPath = `${output}.index`, index = new Database(indexPath);
  const file = await open(output, 'wx+');
  try {
    const meta = Object.fromEntries((source.prepare('SELECT name,value FROM metadata').all() as { name: string; value: string }[]).map(row => [row.name, row.value]));
    const type = ({ pbf: 1, png: 2, jpg: 3, jpeg: 3, webp: 4 } as Record<string, number>)[meta.format!];
    if (!type) throw new JobError('INVALID_PMTILES', 'Unsupported PMTiles tile format.');
    const metadata = gzipSync(Buffer.from(JSON.stringify({ ...meta, ...JSON.parse(meta.json || '{}') })));
    if (type === 1 && !JSON.parse(meta.json || '{}').vector_layers) throw new JobError('INVALID_PMTILES', 'Vector PMTiles requires vector_layers metadata.');
    index.exec('CREATE TABLE coords(id INTEGER PRIMARY KEY,z INTEGER,x INTEGER,y INTEGER); BEGIN');
    const insert = index.prepare('INSERT INTO coords VALUES(?,?,?,?)');
    let count = 0, minZoom = 22, maxZoom = 0;
    for (const row of source.prepare('SELECT zoom_level z,tile_column x,tile_row y FROM tiles').iterate() as Iterable<{ z: number; x: number; y: number }>) {
      signal?.throwIfAborted();
      insert.run(zxyToTileId(row.z, row.x, 2 ** row.z - 1 - row.y), row.z, row.x, row.y);
      minZoom = Math.min(minZoom, row.z); maxZoom = Math.max(maxZoom, row.z); count++;
      if (count % 4096 === 0) { index.exec('COMMIT; BEGIN'); await checkDisk(); }
    }
    index.exec('COMMIT');
    if (!count) throw new JobError('INVALID_PMTILES', 'Cannot export an empty archive.');
    await file.write(metadata, 0, metadata.length, 16384);
    const dataOffset = 16384 + metadata.length, leaves: { tileId: number; bytes: Buffer }[] = [];
    let entries: Entry[] = [], dataLength = 0;
    const tile = source.prepare('SELECT tile_data data FROM tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?');
    const samples: { z: number; x: number; y: number; data: Buffer }[] = [];
    const seenZooms = new Set<number>();
    for (const row of index.prepare('SELECT * FROM coords ORDER BY id').iterate() as Iterable<{ id: number; z: number; x: number; y: number }>) {
      signal?.throwIfAborted();
      let data = (tile.get(row.z, row.x, row.y) as { data: Buffer }).data;
      if (type === 1 && !(data[0] === 31 && data[1] === 139)) data = gzipSync(data);
      await file.write(data, 0, data.length, dataOffset + dataLength);
      entries.push({ tileId: row.id, offset: dataLength, length: data.length, runLength: 1 }); dataLength += data.length;
      if (!seenZooms.has(row.z)) { seenZooms.add(row.z); samples.push({ z: row.z, x: row.x, y: 2 ** row.z - 1 - row.y, data }); }
      if (entries.length === 4096) { leaves.push({ tileId: entries[0]!.tileId, bytes: directory(entries) }); entries = []; await checkDisk(); }
    }
    if (entries.length) leaves.push({ tileId: entries[0]!.tileId, bytes: directory(entries) });
    const leafOffset = dataOffset + dataLength, root: Entry[] = [];
    let leafLength = 0;
    for (const leaf of leaves) {
      root.push({ tileId: leaf.tileId, offset: leafLength, length: leaf.bytes.length, runLength: 0 });
      await file.write(leaf.bytes, 0, leaf.bytes.length, leafOffset + leafLength); leafLength += leaf.bytes.length;
    }
    const rootBytes = directory(root);
    if (rootBytes.length > 16384 - 127) throw new JobError('INVALID_PMTILES', 'PMTiles root directory exceeds its specification limit.');
    const header = Buffer.alloc(127); header.write('PMTiles', 0); header[7] = 3;
    [127, rootBytes.length, 16384, metadata.length, leafOffset, leafLength, dataOffset, dataLength, count, count, count].forEach((value, i) => header.writeBigUInt64LE(BigInt(value), 8 + i * 8));
    header[96] = 1; header[97] = 2; header[98] = type === 1 ? 2 : 1; header[99] = type; header[100] = minZoom; header[101] = maxZoom;
    const bounds = (meta.bounds || '-180,-85.05112878,180,85.05112878').split(',').map(Number);
    if (bounds.length !== 4 || !bounds.every(Number.isFinite)) throw new JobError('INVALID_PMTILES', 'Invalid archive bounds.');
    bounds.forEach((value, i) => header.writeInt32LE(Math.round(value * 1e7), 102 + i * 4));
    header[118] = minZoom; header.writeInt32LE(Math.round((bounds[0]! + bounds[2]!) / 2 * 1e7), 119); header.writeInt32LE(Math.round((bounds[1]! + bounds[3]!) / 2 * 1e7), 123);
    await file.write(rootBytes, 0, rootBytes.length, 127); await file.write(header, 0, header.length, 0); await file.sync();
    const archive = new PMTiles({ getKey: () => output, async getBytes(offset, length) {
      const bytes = Buffer.alloc(length), result = await file.read(bytes, 0, length, offset);
      return { data: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + result.bytesRead) as ArrayBuffer };
    } });
    if ((await archive.getHeader()).numAddressedTiles !== count) throw new JobError('INVALID_PMTILES', 'PMTiles tile count validation failed.');
    await archive.getMetadata();
    for (const sample of samples) {
      const actual = await archive.getZxy(sample.z, sample.x, sample.y);
      const expected = type === 1 ? (await import('node:zlib')).gunzipSync(sample.data) : sample.data;
      if (!actual || !Buffer.from(actual.data).equals(expected)) throw new JobError('INVALID_PMTILES', 'PMTiles payload validation failed.');
    }
  } finally { source.close(); index.close(); await file.close(); await rm(indexPath, { force: true }); }
}
