import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../api.js';
import { Jobs } from '../jobs.js';
import { config } from '../config.js';

test('batch API: inspect JSONL, reuse input, reject broken JSON, clean pending files', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tileo-batch-api-'));
  const previous = { data: config.data, vectorBatchMode: config.vectorBatchMode, token: config.token, production: config.production, reserveBytes: config.reserveBytes };
  Object.assign(config, { data: directory, vectorBatchMode: 'on', token: '', production: false, reserveBytes: 0 });
  const jobs = new Jobs(), app = await createApp(jobs);
  // light-my-request provides a readable request, without a network socket.
  app.addHook('onRequest', (request, _reply, done) => {
    if (typeof request.raw.setTimeout !== 'function') request.raw.setTimeout = () => request.raw;
    done();
  });
  const feature = { type: 'Feature', properties: { code: '00123' }, geometry: { type: 'Point', coordinates: [106.8, -6.2] } };
  try {
    const inspected = await app.inject({ method: 'POST', url: '/api/inspect?filename=points.geojsonl',
      headers: { 'content-type': 'application/octet-stream' }, payload: JSON.stringify(feature) + '\n' });
    assert.equal(inspected.statusCode, 200, inspected.body);
    const result = inspected.json();
    assert.equal(result.inspection.featureCount, 1);
    const created = await app.inject({ method: 'POST', url: `/api/jobs?inspectionId=${result.inspectionId}&options=${encodeURIComponent(JSON.stringify({ minZoom: 0, maxZoom: 1 }))}` });
    assert.equal(created.statusCode, 202, created.body); assert.equal(jobs.list().length, 1);
    const broken = await app.inject({ method: 'POST', url: '/api/inspect?filename=bad.geojson',
      headers: { 'content-type': 'application/octet-stream' }, payload: `{"type":"FeatureCollection","features":[${JSON.stringify(feature)}]} trailing` });
    assert.equal(broken.statusCode, 400, broken.body); assert.match(broken.json().error.message, /MALFORMED_JSON/);
    const kml = await app.inject({ method: 'POST', url: '/api/inspect?filename=source.kml',
      headers: { 'content-type': 'application/octet-stream' }, payload: '<kml/>' });
    assert.equal(kml.statusCode, 400); assert.match(kml.json().error.message, /KML/);
  } finally { await app.close(); Object.assign(config, previous); await rm(directory, { recursive: true, force: true }); }
});
