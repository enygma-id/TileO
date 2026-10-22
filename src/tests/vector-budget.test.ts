import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tilesAtZoom, suggestMaxZoom } from '../inspect.js';

test('tilesAtZoom matches real tippecanoe max-zoom tile counts', () => {
  // 0.1° box: independently computed reference values.
  assert.equal(tilesAtZoom([119.4, -5.2, 119.5, -5.1], 18), 5476);
  assert.equal(tilesAtZoom([119.4, -5.2, 119.5, -5.1], 22), 1365386);
  // 0.05° experiment grid: tippecanoe really wrote 1369 tiles at z18.
  assert.equal(tilesAtZoom([119.4, -5.2, 119.45, -5.15], 18), 1369);
  // Each zoom level roughly quadruples the count.
  const ratio = tilesAtZoom([119.4, -5.2, 119.5, -5.1], 22) / tilesAtZoom([119.4, -5.2, 119.5, -5.1], 20);
  assert.ok(ratio > 15 && ratio < 17);
});

test('suggestMaxZoom steps down to the fitting level', () => {
  assert.equal(suggestMaxZoom([119.4, -5.2, 119.45, -5.15], 2000000, 22), 22);
  assert.equal(suggestMaxZoom([119.3, -5.3, 119.6, -5.0], 2000000, 22), 20);
  assert.ok(tilesAtZoom([119.3, -5.3, 119.6, -5.0], 20) <= 2000000);
  assert.ok(tilesAtZoom([119.3, -5.3, 119.6, -5.0], 21) > 2000000);
});

