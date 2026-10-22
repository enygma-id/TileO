import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, propertiesHtml } from '../web/popup.js';

test('Attribute keys and values are HTML-escaped', () => {
  assert.equal(escapeHtml('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  assert.equal(escapeHtml('a&b"c\'d'), 'a&amp;b&quot;c&#39;d');
  const html = propertiesHtml({ '<b>NIB</b>': '<script>alert(1)</script>', KECAMATAN: 'Biringkanaya' }, 'features');
  assert.ok(!html.includes('<script>') && !html.includes('<b>'));
  assert.ok(html.includes('&lt;script&gt;') && html.includes('Biringkanaya') && html.includes('features'));
});

test('Empty, nullish and long values degrade gracefully', () => {
  assert.ok(propertiesHtml(null).includes('No attributes'));
  assert.ok(propertiesHtml({}).includes('No attributes'));
  assert.ok(propertiesHtml({ a: null, b: undefined, c: '' }).includes('—'));
  assert.ok(propertiesHtml({ n: 200.0001930229561 }).includes('200.0001930229561'));
  assert.ok(propertiesHtml({ ok: true, no: false }).includes('true'));
  const big = propertiesHtml({ geom: { type: 'Polygon', coordinates: [1, 2, 3] } });
  assert.ok(big.includes('Polygon'));
  const capped = propertiesHtml(Object.fromEntries(Array.from({ length: 150 }, (_, i) => [`k${i}`, i])), undefined, 100);
  assert.ok(capped.includes('+50 more'));
});
