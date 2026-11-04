import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import fc from 'fast-check';
import { compactJson, filterFeature, rawMembers, sequenceFeatures } from '../dist/json-stream.js';
import { isLocalOrigin } from '../dist/network.js';

const numRuns = Number(process.env.FC_NUM_RUNS ?? 1000);
const seed = process.env.FC_SEED === undefined ? undefined : Number(process.env.FC_SEED);
if (!Number.isInteger(numRuns) || numRuns < 1 || numRuns > 100000) throw new Error('FC_NUM_RUNS must be an integer from 1 to 100000');
if (seed !== undefined && (!Number.isInteger(seed) || seed < -2147483648 || seed > 2147483647)) throw new Error('FC_SEED must be a signed 32-bit integer');
const parameters = { numRuns, ...(seed === undefined ? {} : { seed }) };
const json = fc.jsonValue({ maxDepth: 3, stringUnit: 'binary' });
// Disk JSON has ordinary object prototypes, including when a generator starts
// with a null-prototype dictionary. Compare the serialized data model.
const properties = fc.dictionary(fc.string({ unit: 'binary', maxLength: 16 }), json, { maxKeys: 8 })
  .map(value => JSON.parse(JSON.stringify(value)));

test('fuzz: JSON compaction and member extraction preserve parsed values', () => {
  fc.assert(fc.property(properties, fc.constantFrom(' ', '    ', '\t'), (value, indent) => {
    const raw = JSON.stringify(value, null, indent);
    assert.deepEqual(JSON.parse(compactJson(raw)), value);
    assert.deepEqual(Object.fromEntries(rawMembers(raw).map(([key, item]) => [key, JSON.parse(item)])), value);
  }), parameters);
});

test('fuzz: property filtering preserves selected values and geometry', () => {
  fc.assert(fc.property(properties, fc.nat(), (value, offset) => {
    const wanted = Object.keys(value).filter((_, index) => (index + offset) % 2 === 0);
    const feature = { type: 'Feature', id: 'fuzz', geometry: { type: 'Point', coordinates: [1, 2] }, properties: value };
    const actual = JSON.parse(filterFeature(JSON.stringify(feature, null, 2), wanted));
    assert.deepEqual(actual, { ...feature, properties: Object.fromEntries(Object.entries(value).filter(([key]) => wanted.includes(key))) });
  }), parameters);
});

test('fuzz: GeoJSON sequence decoding survives arbitrary UTF-8 chunk boundaries', async () => {
  await fc.assert(fc.asyncProperty(fc.array(properties, { maxLength: 5 }), fc.integer({ min: 1, max: 127 }), async (values, width) => {
    const expected = values.map(value => ({ type: 'Feature', geometry: null, properties: value }));
    const bytes = Buffer.from(expected.map(value => `\x1e${JSON.stringify(value)}\n`).join(''));
    const chunks = function* () { for (let i = 0; i < bytes.length; i += width) yield bytes.subarray(i, i + width); };
    const actual = [];
    for await (const item of sequenceFeatures(Readable.from(chunks()), 1024 * 1024)) {
      assert.equal(item.index, actual.length);
      actual.push(JSON.parse(item.raw));
    }
    assert.deepEqual(actual, expected);
  }), parameters);
});

test('fuzz: oversized sequence features always reject before publication', async () => {
  await fc.assert(fc.asyncProperty(fc.string({ minLength: 32, maxLength: 512 }), fc.integer({ min: 1, max: 31 }), async (value, limit) => {
    const bytes = Buffer.from(JSON.stringify({ type: 'Feature', geometry: null, properties: { value } }));
    await assert.rejects(async () => {
      for await (const _ of sequenceFeatures(Readable.from([bytes]), limit)) { /* Drain to trigger validation. */ }
    }, { code: 'FEATURE_TOO_LARGE' });
  }), parameters);
});

test('fuzz: public origins, credentials and paths cannot impersonate local origins', () => {
  fc.assert(fc.property(fc.webUrl(), url => {
    assert.equal(typeof isLocalOrigin(url), 'boolean');
    const parsed = new URL(url);
    // Canonical origin equality must reject userinfo, paths, fragments and queries.
    if (parsed.origin !== url) assert.equal(isLocalOrigin(url), false);
  }), parameters);
  fc.assert(fc.property(fc.string({ unit: 'grapheme', maxLength: 80 }), suffix => {
    assert.equal(isLocalOrigin(`https://localhost.attacker.invalid/${encodeURIComponent(suffix)}`), false);
    assert.equal(isLocalOrigin(`https://localhost/${encodeURIComponent(suffix)}`), false);
    assert.equal(isLocalOrigin(`https://localhost@attacker.invalid#${encodeURIComponent(suffix)}`), false);
  }), parameters);
});
