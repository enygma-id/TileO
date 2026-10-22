import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config } from '../config.js';
import { createApp } from '../api.js';
import { Jobs } from '../jobs.js';

test('sessions are revocable, token-bound, secure on HTTPS, and login is rate limited', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tileo-auth-'));
  const previous = { data: config.data, token: config.token, origin: config.origin, allowLan: config.allowLan, corsOrigins: config.corsOrigins, secureCookies: config.secureCookies };
  const firstToken = 'first-random-token-with-at-least-24-characters';
  const secondToken = 'second-random-token-with-at-least-24-characters';
  Object.assign(config, { data: directory, token: firstToken, origin: 'https://tiles.example.test', allowLan: false, corsOrigins: [], secureCookies: false });
  const app = await createApp(new Jobs());
  try {
    assert.equal((await app.inject('/api/status')).statusCode, 401);
    const authorizedStatus = await app.inject({ url: '/api/status', headers: { authorization: `bEaReR ${firstToken}` } });
    assert.equal(authorizedStatus.statusCode, 200);
    assert.equal(authorizedStatus.json().authenticationRequired, true);
    assert.equal((await app.inject('/api/session-future-route')).statusCode, 401);

    const login = await app.inject({ method: 'POST', url: '/api/session', payload: { token: firstToken } });
    assert.equal(login.statusCode, 200);
    const setCookie = String(login.headers['set-cookie']);
    assert.match(setCookie, /HttpOnly/); assert.match(setCookie, /SameSite=Strict/); assert.match(setCookie, /Secure/);
    const cookie = setCookie.split(';')[0]!;
    assert.equal((await app.inject({ url: '/api/status', headers: { cookie } })).statusCode, 200);

    config.token = secondToken;
    assert.equal((await app.inject({ url: '/api/status', headers: { cookie } })).statusCode, 401);
    const secondLogin = await app.inject({ method: 'POST', url: '/api/session', payload: { token: secondToken } });
    const secondCookie = String(secondLogin.headers['set-cookie']).split(';')[0]!;
    assert.equal((await app.inject({ method: 'POST', url: '/api/session/logout', headers: { cookie: secondCookie } })).statusCode, 200);
    assert.equal((await app.inject({ url: '/api/status', headers: { cookie: secondCookie } })).statusCode, 401);

    const parallel = await Promise.all(Array.from({ length: 8 }, () => app.inject({ method: 'POST', url: '/api/session', payload: { token: 'wrong' } })));
    assert.ok(parallel.some(response => response.statusCode === 429));
    assert.ok(parallel.filter(response => response.statusCode === 401).length <= 4);
  } finally {
    await app.close(); Object.assign(config, previous);
    await rm(directory, { recursive: true, force: true });
  }
});

test('authentication-disabled mode does not mint reusable sessions', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tileo-auth-off-'));
  const previous = { data: config.data, token: config.token, origin: config.origin, secureCookies: config.secureCookies };
  Object.assign(config, { data: directory, token: '', origin: '', secureCookies: false });
  const app = await createApp(new Jobs());
  try {
    const response = await app.inject({ method: 'POST', url: '/api/session', payload: {} });
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['set-cookie'], undefined);
    assert.deepEqual(response.json(), { ok: true, authentication: false });
    assert.equal((await app.inject('/api/status')).json().authenticationRequired, false);
  } finally {
    await app.close(); Object.assign(config, previous);
    await rm(directory, { recursive: true, force: true });
  }
});
