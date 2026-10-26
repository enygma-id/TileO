#!/usr/bin/env node
/**
 * TileO - native component license corpus verification.
 *
 * `--update` downloads the exact upstream URL recorded in
 * third-party/native/components.json (raw license file or release archive),
 * writes third-party/licenses/native/<component>/<file>, and records SHA-256.
 * The default mode is offline: it verifies files and hashes without network.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { evaluateExpression } from './lib/license-policy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const COMPONENTS_FILE = path.join(ROOT, 'third-party', 'native', 'components.json');
const CORPUS_DIR = path.join(ROOT, 'third-party', 'licenses', 'native');
const CSV_FILE = path.join(ROOT, 'third-party', 'native-components.csv');
const CACHE_DIR = path.join(os.tmpdir(), 'tileo-native-licenses');
const VERIFIER = 'scripts/verify-native-licenses.js@1';
const today = new Date().toISOString().slice(0, 10);

const update = process.argv.includes('--update');

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function readTar(buffer) {
  const entries = [];
  let offset = 0;
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const field = (start, length) => header.subarray(start, start + length).toString('utf8').replace(/\0.*$/, '');
    const name = field(345, 155) ? `${field(345, 155)}/${field(0, 100)}` : field(0, 100);
    const size = Number.parseInt(field(124, 12).trim() || '0', 8);
    const type = String.fromCharCode(header[156]) || '0';
    const dataStart = offset + 512;
    if (type === '0' || type === '\0' || type === '7') {
      entries.push({ name, data: buffer.subarray(dataStart, dataStart + size) });
    }
    offset = dataStart + Math.ceil(size / 512) * 512;
  }
  return entries;
}

async function download(url, redirects = 0) {
  const key = sha256(Buffer.from(url)).slice(0, 24);
  const cacheFile = path.join(CACHE_DIR, key);
  if (fs.existsSync(cacheFile)) return fs.readFileSync(cacheFile);
  const buffer = await new Promise((resolve, reject) => {
    const request = https.get(url, {
      family: 4,
      headers: { 'user-agent': 'TileO-license-verifier/1 (+https://github.com/enygma-id/TileO)' },
    }, (response) => {
      const status = response.statusCode ?? 0;
      if ([301, 302, 303, 307, 308].includes(status) && response.headers.location) {
        response.resume();
        if (redirects >= 5) {
          reject(new Error(`too many redirects for ${url}`));
          return;
        }
        resolve(download(new URL(response.headers.location, url).href, redirects + 1));
        return;
      }
      if (status !== 200) {
        response.resume();
        reject(new Error(`HTTP ${status} for ${url}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
    request.on('error', reject);
  });
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile, buffer);
  return buffer;
}

async function fetchLicense(file) {
  const buffer = await download(file.url);
  if (!file.archive_path) return buffer;
  if (!file.url.endsWith('.gz') && !file.url.endsWith('.tgz')) {
    throw new Error(`archive_path requires a .tar.gz URL: ${file.url}`);
  }
  const entry = readTar(gunzipSync(buffer)).find((candidate) => candidate.name === file.archive_path);
  if (!entry) throw new Error(`${file.archive_path} not found in ${file.url}`);
  return Buffer.from(entry.data);
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(COMPONENTS_FILE, 'utf8'));
  const problems = [];
  const rows = [];
  let exceptions = 0;

  for (const component of manifest.components) {
    const dir = path.join(CORPUS_DIR, component.id);
    const evaluation = evaluateExpression(component.license_expression);
    const isException = evaluation.exceptions.length > 0;
    if (isException) exceptions += 1;
    if (!evaluation.allowed) problems.push(`${component.id}: license expression ${component.license_expression} is not allowed`);
    if (isException && !component.review) problems.push(`${component.id}: exception ${evaluation.exceptions.join(', ')} has no review classification`);

    for (const file of component.license_files) {
      const target = path.join(dir, file.file);
      if (update) {
        try {
          const data = await fetchLicense(file);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(target, data);
          file.sha256 = sha256(data);
          file.bytes = data.length;
          file.verified_at = today;
          file.verifier = VERIFIER;
        } catch (error) {
          const detail = error instanceof Error ? `${error.message}${error.cause instanceof Error ? ` (${error.cause.message})` : ''}` : String(error);
          console.error(error instanceof Error ? error.stack : error);
          problems.push(`${component.id}: ${detail}`);
        }
      } else {
        if (!fs.existsSync(target)) {
          problems.push(`${component.id}: missing ${path.relative(ROOT, target)}`);
        } else {
          const data = fs.readFileSync(target);
          const digest = sha256(data);
          if (!file.sha256) problems.push(`${component.id}/${file.file}: no recorded sha256`);
          else if (file.sha256 !== digest) problems.push(`${component.id}/${file.file}: sha256 mismatch`);
          if (file.bytes && file.bytes !== data.length) problems.push(`${component.id}/${file.file}: byte length mismatch`);
        }
      }
    }
    rows.push({
      id: component.id,
      name: component.name,
      version: component.version,
      license_expression: component.license_expression,
      scope: component.scope,
      linkage: component.linkage,
      exception: isException ? evaluation.exceptions.join('; ') : '',
      review: component.review ?? '',
      files: component.license_files.map((file) => `${file.file}:${file.sha256}`).join(';'),
      status: isException ? 'LEGAL_EXCEPTION_RECORDED' : evaluation.allowed ? 'PERMISSIVE_VERIFIED' : 'NON_PERMISSIVE',
    });
  }

  if (update && problems.length === 0) {
    manifest.verified_at = today;
    manifest.verifier = VERIFIER;
    fs.writeFileSync(COMPONENTS_FILE, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  const header = ['id', 'name', 'version', 'license_expression', 'scope', 'linkage', 'exception', 'review', 'files', 'status'];
  const csv = [header.join(','), ...rows.map((row) => header.map((key) => `"${String(row[key] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
  fs.writeFileSync(CSV_FILE, `${csv}\n`);

  console.log(`${update ? 'Updated' : 'Checked'} ${rows.length} native components (${exceptions} documented exceptions).`);
  if (problems.length > 0) {
    for (const problem of problems) console.error(`FAIL ${problem}`);
    process.exitCode = 1;
  }
}

await main();
