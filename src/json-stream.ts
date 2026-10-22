import { createReadStream } from 'node:fs';
import type { Readable } from 'node:stream';
import { JobError } from './types.js';

export function malformed(message: string): never { throw new JobError('INVALID_INPUT', `MALFORMED_JSON: ${message}`); }
const whitespace = (c: number) => c === 32 || c === 9 || c === 10 || c === 13;

// Keeps one chunk plus the current bounded value. Slices are retained per
// chunk, rather than allocating one Buffer object for each input byte.
class Cursor {
  private iterator: AsyncIterator<Buffer>;
  buffer = Buffer.alloc(0);
  offset = 0;
  constructor(source: AsyncIterable<Buffer>, private signal?: AbortSignal) { this.iterator = source[Symbol.asyncIterator](); }
  async fill(): Promise<boolean> {
    this.signal?.throwIfAborted();
    if (this.offset < this.buffer.length) return true;
    const next = await this.iterator.next();
    if (next.done) return false;
    this.buffer = Buffer.from(next.value); this.offset = 0;
    return true;
  }
  async peek(): Promise<number> {
    while (await this.fill()) {
      while (this.offset < this.buffer.length && whitespace(this.buffer[this.offset]!)) this.offset++;
      if (this.offset < this.buffer.length) return this.buffer[this.offset]!;
    }
    return -1;
  }
  async take(expected: number) {
    if (await this.peek() !== expected) malformed(`Expected ${String.fromCharCode(expected)}`);
    this.offset++;
  }
  async value(limit: number, feature = false): Promise<string> {
    const first = await this.peek();
    if (first === -1) malformed('Unexpected end of document');
    const parts: Buffer[] = [];
    let size = 0, depth = 0, quoted = false, escaped = false, started = false, complete = false;
    const compound = first === 123 || first === 91;
    const string = first === 34;
    while (!complete && await this.fill()) {
      const start = this.offset;
      for (; this.offset < this.buffer.length; this.offset++) {
        const c = this.buffer[this.offset]!;
        if (started && !compound && !string && (whitespace(c) || c === 44 || c === 125 || c === 93)) { complete = true; break; }
        if (++size > limit) throw new JobError(feature ? 'FEATURE_TOO_LARGE' : 'METADATA_LIMIT', `${feature ? 'FEATURE_TOO_LARGE' : 'Metadata'} exceeds ${limit} bytes.`);
        started = true;
        if (quoted) {
          if (escaped) escaped = false;
          else if (c === 92) escaped = true;
          else if (c === 34) { quoted = false; if (string && depth === 0) complete = true; }
        } else if (c === 34) quoted = true;
        else if (c === 123 || c === 91) {
          if (++depth > 64) throw new JobError('INVALID_INPUT', 'JSON_DEPTH_LIMIT: Maximum nesting depth is 64.');
        } else if (c === 125 || c === 93) { if (--depth === 0) complete = true; }
        if (complete) { this.offset++; break; }
      }
      if (this.offset > start) parts.push(this.buffer.subarray(start, this.offset));
    }
    const raw = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(parts));
    try { JSON.parse(raw); } catch { malformed('Invalid JSON value'); }
    return raw;
  }
}

export async function* collectionFeatures(path: string, maxBytes: number, signal?: AbortSignal,
  onMeta?: (meta: { name?: string; crs?: unknown }) => void): AsyncGenerator<{raw: string; index: number}> {
  const source = createReadStream(path, { highWaterMark: 64 * 1024, signal });
  const cursor = new Cursor(source, signal);
  let type: unknown, found = false, index = 0;
  let metadataBytes = 0;
  const keys = new Set<string>();
  try {
    await cursor.take(123);
    if (await cursor.peek() !== 125) while (true) {
      const key = JSON.parse(await cursor.value(64 * 1024));
      if (typeof key !== 'string' || keys.has(key)) malformed('Invalid or duplicate root key');
      metadataBytes += Buffer.byteLength(key);
      if (metadataBytes > 1024 ** 2) throw new JobError('METADATA_LIMIT', 'Root metadata exceeds 1 MiB.');
      keys.add(key);
      await cursor.take(58);
      if (key === 'features') {
        found = true;
        await cursor.take(91);
        if (await cursor.peek() !== 93) while (true) {
          const raw = await cursor.value(maxBytes, true);
          validateFeature(raw, index);
          yield { raw, index: index++ };
          if (await cursor.peek() !== 44) break;
          await cursor.take(44);
        }
        await cursor.take(93);
      } else {
        const raw = await cursor.value(1024 * 1024);
        metadataBytes += Buffer.byteLength(raw);
        if (metadataBytes > 1024 ** 2) throw new JobError('METADATA_LIMIT', 'Root metadata exceeds 1 MiB.');
        const value = JSON.parse(raw);
        if (key === 'type') type = value;
        if (key === 'name' && typeof value === 'string') onMeta?.({ name: value });
        if (key === 'crs') onMeta?.({ crs: value });
      }
      if (await cursor.peek() !== 44) break;
      await cursor.take(44);
    }
    await cursor.take(125);
    if (await cursor.peek() !== -1) malformed('Trailing data after root');
    if (type !== 'FeatureCollection' || !found) malformed('Expected GeoJSON FeatureCollection');
  } finally { source.destroy(); }
}

export function validateFeature(raw: string, index: number) {
  let feature: any;
  try { feature = JSON.parse(raw); } catch { malformed(`Invalid feature at index ${index}`); }
  if (!feature || feature.type !== 'Feature' || !('geometry' in feature) || !('properties' in feature)
    || (feature.properties !== null && (typeof feature.properties !== 'object' || Array.isArray(feature.properties)))) malformed(`Invalid Feature at index ${index}`);
  if (feature.geometry !== null && (!feature.geometry || typeof feature.geometry !== 'object'
    || !['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'].includes(feature.geometry.type))) malformed(`Invalid geometry at index ${index}`);
}

// Bounded line decoding also applies to GDAL stdout: readline would allocate
// an arbitrarily large line before a single-feature size check could run.
export async function* sequenceFeatures(source: Readable, maxBytes: number, signal?: AbortSignal): AsyncGenerator<{raw: string; index: number}> {
  let parts: Buffer[] = [], size = 0, index = 0;
  const decode = () => {
    const raw = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(parts)).trim().replace(/^\x1e/, '').trim();
    parts = []; size = 0;
    return raw;
  };
  try {
    for await (const data of source) {
      signal?.throwIfAborted();
      const chunk = Buffer.from(data);
      let start = 0;
      while (start < chunk.length) {
        const end = chunk.indexOf(10, start);
        const stop = end === -1 ? chunk.length : end;
        size += stop - start;
        if (size > maxBytes) throw new JobError('FEATURE_TOO_LARGE', `FEATURE_TOO_LARGE: Feature ${index} exceeds ${maxBytes} bytes.`);
        if (stop > start) parts.push(chunk.subarray(start, stop));
        if (end === -1) break;
        const raw = decode();
        if (raw) { assertDepth(raw); validateFeature(raw, index); yield { raw, index: index++ }; }
        start = end + 1;
      }
    }
    if (size) { const raw = decode(); if (raw) { assertDepth(raw); validateFeature(raw, index); yield { raw, index }; } }
  } finally { source.destroy(); }
}

function valueEnd(raw: string, start: number): number {
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i < raw.length; i++) {
    const c = raw[i];
    if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; }
    else if (c === '"') quoted = true;
    else if (c === '{' || c === '[') depth++;
    else if ((c === '}' || c === ']') && depth > 0) depth--;
    else if (depth === 0 && (c === ',' || c === '}')) return i;
  }
  return raw.length;
}
export function rawMembers(raw: string): Array<[string, string]> {
  const members: Array<[string, string]> = [];
  let i = raw.indexOf('{') + 1;
  while (i < raw.length) {
    while (/\s/.test(raw[i] ?? '')) i++;
    if (raw[i] === '}') break;
    const start = i++;
    let escaped = false;
    for (; i < raw.length; i++) { if (!escaped && raw[i] === '"') break; if (!escaped && raw[i] === '\\') escaped = true; else escaped = false; }
    const key = JSON.parse(raw.slice(start, ++i));
    while (raw[i] !== ':') i++;
    const valueStart = ++i;
    i = valueEnd(raw, valueStart);
    members.push([key, raw.slice(valueStart, i).trim()]);
    if (raw[i] === ',') i++;
  }
  return members;
}
export function compactJson(raw: string): string {
  let quoted = false, escaped = false, result = '';
  // Chunk runs instead of constructing an array entry for every character.
  let start = 0;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]!;
    if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; }
    else if (c === '"') quoted = true;
    else if (/\s/.test(c)) { result += raw.slice(start, i); start = i + 1; }
  }
  return result + raw.slice(start);
}
export function assertDepth(raw: string) {
  let depth = 0, quoted = false, escaped = false;
  for (const c of raw) {
    if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; }
    else if (c === '"') quoted = true;
    else if (c === '{' || c === '[') { if (++depth > 64) throw new JobError('INVALID_INPUT', 'JSON_DEPTH_LIMIT: Maximum nesting depth is 64.'); }
    else if (c === '}' || c === ']') depth--;
  }
}
export function filterFeature(raw: string, wanted: string[] | null | undefined, geometry?: string): string {
  const members = rawMembers(raw).map(([key, value]): [string, string] => {
    if (key === 'geometry' && geometry !== undefined) return [key, geometry];
    if (key === 'properties' && value !== 'null' && wanted != null) {
      const allowed = new Set(wanted);
      return [key, `{${rawMembers(value).filter(([name]) => allowed.has(name)).map(([name, v]) => `${JSON.stringify(name)}:${v}`).join(',')}}`];
    }
    return [key, value];
  });
  return compactJson(`{${members.map(([key, value]) => `${JSON.stringify(key)}:${value}`).join(',')}}`);
}
