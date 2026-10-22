import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config } from '../config.js';
import { isLocalHost, isLocalOrigin } from '../network.js';
import { createApp } from '../api.js';
import { Jobs } from '../jobs.js';

test('LAN host and origin validation excludes public addresses and malformed origins', () => {
  for (const host of ['localhost', '[::1]', '192.168.1.10', '10.0.0.1', '172.16.0.1', '172.31.255.255', '100.64.0.1', '100.127.0.1', 'tileo.local']) assert.ok(isLocalHost(host), host);
  for (const host of ['192.168.1.999', '172.32.0.1', '100.63.0.1', '100.128.0.1', '8.8.8.8', 'attacker.invalid', 'localhost.attacker.invalid']) assert.equal(isLocalHost(host), false, host);
  for (const origin of ['null', 'file://localhost', 'http://localhost/', 'http://user@localhost', 'http://192.168.1.1/path']) assert.equal(isLocalOrigin(origin), false, origin);
  assert.ok(isLocalOrigin('http://192.168.1.10:5173'));
});

test('LAN CORS supports uploads, range requests and preflight while retaining authentication', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tileo-cors-'));
  const previous = { data: config.data, allowLan: config.allowLan, token: config.token, origin: config.origin, corsOrigins: config.corsOrigins };
  Object.assign(config, { data: directory, allowLan: true, token: '', origin: 'http://localhost:8090', corsOrigins: [] });
  const app = await createApp(new Jobs());
  const headers = { host: '192.168.1.10:8092', origin: 'http://192.168.1.20:5173' };
  try {
    const response = await app.inject({ url: '/api/status', headers });
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['access-control-allow-origin'], headers.origin);
    assert.match(String(response.headers['access-control-expose-headers']), /Content-Range/);
    for (const method of ['POST', 'DELETE', 'GET']) {
      const preflight = await app.inject({ method: 'OPTIONS', url: '/api/jobs', headers: { ...headers, 'access-control-request-method': method, 'access-control-request-headers': 'Authorization, Content-Type, Range' } });
      assert.equal(preflight.statusCode, 204, preflight.body);
      assert.match(String(preflight.headers['access-control-allow-headers']), /authorization/);
    }
    const blocked = await app.inject({ url: '/api/status', headers: { ...headers, origin: 'https://attacker.invalid' } });
    assert.equal(blocked.statusCode, 403);
    assert.equal(blocked.headers['access-control-allow-origin'], undefined);
    assert.equal((await app.inject({ method: 'OPTIONS', url: '/api/jobs', headers: { ...headers, 'access-control-request-method': 'PATCH' } })).statusCode, 403);
    config.token = 'test-token-with-at-least-24-characters';
    const unauthorized = await app.inject({ url: '/api/status', headers });
    assert.equal(unauthorized.statusCode, 401);
    assert.equal(unauthorized.headers['access-control-allow-origin'], headers.origin);
    assert.equal((await app.inject({ method: 'OPTIONS', url: '/api/jobs', headers: { ...headers, 'access-control-request-method': 'POST' } })).statusCode, 204);
    assert.equal((await app.inject({ url: '/api/status', headers: { ...headers, authorization: `Bearer ${config.token}` } })).statusCode, 200);
    config.token = ''; config.allowLan = false;
    assert.equal((await app.inject({ url: '/api/status', headers })).statusCode, 403);
    config.corsOrigins = ['http://frontend.example:5173'];
    assert.equal((await app.inject({ url: '/api/status', headers: { host: 'localhost:8092', origin: config.corsOrigins[0] } })).statusCode, 200);
    const docs = await app.inject('/docs');
    assert.equal(docs.statusCode, 200); assert.match(docs.body, /Convert a dataset/); assert.ok(!docs.body.includes('unpkg.com'));
    assert.equal((await app.inject('/docs.css')).statusCode, 200);
    const playground = await app.inject('/docs-playground.js');
    assert.equal(playground.statusCode, 200);
    assert.doesNotMatch(playground.body, /https?:\/\//);
    const spec = await app.inject('/openapi.yaml');
    assert.match(spec.body, /url: \/\n/);
    assert.ok(!spec.body.includes('url: http://localhost:8090'));
    assert.equal((spec.body.match(/^    (get|post|delete):/gm) ?? []).length, (spec.body.match(/^      tags:/gm) ?? []).length);
  } finally {
    await app.close(); Object.assign(config, previous);
    await rm(directory, { recursive: true, force: true });
  }
});
