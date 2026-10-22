import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { config } from '../config.js';
import { createApp } from '../api.js';
import { Jobs } from '../jobs.js';

test('local module scripts and fonts load with a different configured public origin', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tileo-assets-'));
  const previous = { data: config.data, origin: config.origin, token: config.token };
  Object.assign(config, { data: directory, origin: 'http://localhost:8090', token: '' });
  const app = await createApp(new Jobs());
  const headers = { host: 'localhost:8092', origin: 'http://localhost:8092' };
  try {
    for (const url of ['/', '/landing', '/landing-map.js', '/style.css', '/app.js', '/landing-sample.js', '/cog.js', '/icons.js', '/docs', '/docs.css', '/docs-playground.js', '/api-guide', '/openapi.yaml']) {
      const response = await app.inject({ url, headers });
      assert.equal(response.statusCode, 200, `${url}: ${response.body.slice(0, 200)}`);
      assert.ok(response.rawPayload.length > 0, url);
    }
    const consolePage = (await app.inject({ url: '/', headers })).body;
    for (const control of ['btn-landing-sample', 'landing-dialog', 'landing-properties', 'landing-code', 'landing-snippet', 'copy-landing-url', 'copy-landing-sample', 'close-landing-dialog']) {
      assert.match(consolePage, new RegExp(`id=["']${control}["']`), `${control} missing from console`);
    }
    const landingPage = (await app.inject({ url: '/landing', headers })).body;
    assert.match(landingPage, /id=["']statement-vector["']/, 'statement vector backdrop missing from landing page');
    assert.match(landingPage, /class=["']statement-band["']/, 'statement band missing from landing page');
    const landingScript = (await app.inject({ url: '/landing-map.js', headers })).body;
    assert.equal((landingScript.match(/interactive: false/g) || []).length, 2, 'both landing maps must be non-interactive');
    assert.match(landingScript, /type: 'vector'/, 'landing vector sample missing');
    const specification = (await app.inject({ url: '/openapi.yaml', headers })).body;
    const docs = (await app.inject({ url: '/docs', headers })).body;
    const playground = (await app.inject({ url: '/docs-playground.js', headers })).body;
    for (const control of ['endpoint-search', 'reset-request', 'format-json', 'cancel-request', 'response-meta']) {
      assert.match(docs, new RegExp(`id=["']${control}["']`), `${control} missing from API playground`);
    }
    assert.match(playground, /new AbortController\(\)/, 'API playground request cancellation missing');
    assert.match(playground, /function filterEndpoints\(\)/, 'API playground endpoint search missing');
    let operationPath = '';
    const operations: string[] = [];
    for (const line of specification.split(/\r?\n/)) {
      const path = line.match(/^  (\/[^:]+):$/); if (path) operationPath = path[1]!;
      const method = line.match(/^    (get|post|delete|put|patch):$/); if (method) operations.push(`${method[1]!.toUpperCase()} ${operationPath}`);
    }
    assert.equal(operations.length, 38);
    for (const operation of operations) {
      const separator = operation.indexOf(' ');
      assert.ok(playground.includes(`'${operation.slice(0, separator)}', '${operation.slice(separator + 1)}'`), `${operation} missing from playground`);
    }
    assert.equal((await app.inject({ url: '/api/status', headers })).statusCode, 200);
    assert.equal((await app.inject({ method: 'POST', url: '/api/session', headers: { ...headers, origin: 'https://attacker.invalid' } })).statusCode, 403);
    assert.equal((await app.inject({ url: '/app.js', headers: { host: 'attacker.invalid', origin: 'http://attacker.invalid' } })).statusCode, 403);
    assert.equal((await app.inject({ url: '/fontawesome.css', headers })).statusCode, 404);
    assert.equal((await app.inject({ url: '/webfonts/fa-solid-900.woff2', headers })).statusCode, 404);
  } finally {
    await app.close();
    Object.assign(config, previous);
    await rm(directory, { recursive: true, force: true });
  }
});
