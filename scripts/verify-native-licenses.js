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
const manifestArgIdx = process.argv.indexOf('--manifest');
const COMPONENTS_FILE = manifestArgIdx !== -1 && manifestArgIdx + 1 < process.argv.length
  ? path.resolve(process.argv[manifestArgIdx + 1])
  : path.join(ROOT, 'third-party', 'native', 'components.json');
const CORPUS_DIR = path.join(ROOT, 'third-party', 'licenses', 'native');
const CSV_FILE = path.join(ROOT, 'third-party', 'native-components.csv');
const CACHE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-native-licenses-'));
const VERIFIER = 'scripts/verify-native-licenses.js@1';
const today = new Date().toISOString().slice(0, 10);
const LICENSE_SOURCE_HOSTS = new Set([
  'git.musl-libc.org',
  'github.com',
  'raw.githubusercontent.com',
  'release-assets.githubusercontent.com',
  'objects.githubusercontent.com',
  'sqlite.org',
  'www.sqlite.org',
  'www.mozilla.org',
]);

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

function trustedLicenseSource(value) {
  switch (value) {
    case "https://git.musl-libc.org/cgit/musl/snapshot/musl-1.2.5.tar.gz": return "https://git.musl-libc.org/cgit/musl/snapshot/musl-1.2.5.tar.gz";
    case "https://github.com/libexpat/libexpat/releases/download/R_2_6_4/expat-2.6.4.tar.gz": return "https://github.com/libexpat/libexpat/releases/download/R_2_6_4/expat-2.6.4.tar.gz";
    case "https://raw.githubusercontent.com/AngusJohnson/Clipper2/main/LICENSE": return "https://raw.githubusercontent.com/AngusJohnson/Clipper2/main/LICENSE";
    case "https://raw.githubusercontent.com/OSGeo/PROJ/9.6.2/COPYING": return "https://raw.githubusercontent.com/OSGeo/PROJ/9.6.2/COPYING";
    case "https://raw.githubusercontent.com/OSGeo/gdal/v3.11.4/LICENSE.TXT": return "https://raw.githubusercontent.com/OSGeo/gdal/v3.11.4/LICENSE.TXT";
    case "https://raw.githubusercontent.com/OSGeo/libgeotiff/1.7.4/libgeotiff/LICENSE": return "https://raw.githubusercontent.com/OSGeo/libgeotiff/1.7.4/libgeotiff/LICENSE";
    case "https://raw.githubusercontent.com/curl/curl/curl-8_14_1/COPYING": return "https://raw.githubusercontent.com/curl/curl/curl-8_14_1/COPYING";
    case "https://raw.githubusercontent.com/ebiggers/libdeflate/v1.23/COPYING": return "https://raw.githubusercontent.com/ebiggers/libdeflate/v1.23/COPYING";
    case "https://raw.githubusercontent.com/felt/tippecanoe/2.79.0/LICENSE.md": return "https://raw.githubusercontent.com/felt/tippecanoe/2.79.0/LICENSE.md";
    case "https://raw.githubusercontent.com/gcc-mirror/gcc/releases/gcc-14.2.0/COPYING.RUNTIME": return "https://raw.githubusercontent.com/gcc-mirror/gcc/releases/gcc-14.2.0/COPYING.RUNTIME";
    case "https://raw.githubusercontent.com/gcc-mirror/gcc/releases/gcc-14.2.0/COPYING3": return "https://raw.githubusercontent.com/gcc-mirror/gcc/releases/gcc-14.2.0/COPYING3";
    case "https://raw.githubusercontent.com/google/flatbuffers/v25.2.10/LICENSE": return "https://raw.githubusercontent.com/google/flatbuffers/v25.2.10/LICENSE";
    case "https://raw.githubusercontent.com/libjpeg-turbo/libjpeg-turbo/3.1.0/LICENSE.md": return "https://raw.githubusercontent.com/libjpeg-turbo/libjpeg-turbo/3.1.0/LICENSE.md";
    case "https://raw.githubusercontent.com/libsdl-org/libtiff/v4.7.0/LICENSE.md": return "https://raw.githubusercontent.com/libsdl-org/libtiff/v4.7.0/LICENSE.md";
    case "https://raw.githubusercontent.com/madler/zlib/v1.3.1/LICENSE": return "https://raw.githubusercontent.com/madler/zlib/v1.3.1/LICENSE";
    case "https://raw.githubusercontent.com/mapbox/geometry.hpp/master/LICENSE": return "https://raw.githubusercontent.com/mapbox/geometry.hpp/master/LICENSE";
    case "https://raw.githubusercontent.com/mapbox/protozero/master/LICENSE.md": return "https://raw.githubusercontent.com/mapbox/protozero/master/LICENSE.md";
    case "https://raw.githubusercontent.com/mapbox/variant/master/LICENSE": return "https://raw.githubusercontent.com/mapbox/variant/master/LICENSE";
    case "https://raw.githubusercontent.com/nghttp2/nghttp2/v1.64.0/COPYING": return "https://raw.githubusercontent.com/nghttp2/nghttp2/v1.64.0/COPYING";
    case "https://raw.githubusercontent.com/nodejs/node/v24.13.1/LICENSE": return "https://raw.githubusercontent.com/nodejs/node/v24.13.1/LICENSE";
    case "https://raw.githubusercontent.com/openssl/openssl/openssl-3.5.1/LICENSE.txt": return "https://raw.githubusercontent.com/openssl/openssl/openssl-3.5.1/LICENSE.txt";
    case "https://raw.githubusercontent.com/pnggroup/libpng/v1.6.47/LICENSE": return "https://raw.githubusercontent.com/pnggroup/libpng/v1.6.47/LICENSE";
    case "https://raw.githubusercontent.com/tukaani-project/xz/v5.8.1/COPYING": return "https://raw.githubusercontent.com/tukaani-project/xz/v5.8.1/COPYING";
    case "https://raw.githubusercontent.com/uclouvain/openjpeg/v2.5.3/LICENSE": return "https://raw.githubusercontent.com/uclouvain/openjpeg/v2.5.3/LICENSE";
    case "https://raw.githubusercontent.com/unicode-org/icu/release-77-1/LICENSE": return "https://raw.githubusercontent.com/unicode-org/icu/release-77-1/LICENSE";
    case "https://raw.githubusercontent.com/webmproject/libwebp/v1.5.0/COPYING": return "https://raw.githubusercontent.com/webmproject/libwebp/v1.5.0/COPYING";
    case "https://sqlite.org/copyright.html": return "https://sqlite.org/copyright.html";
    case "https://www.mozilla.org/media/MPL/2.0/index.txt": return "https://www.mozilla.org/media/MPL/2.0/index.txt";
    default: throw new Error('Native license source URL is not in the pinned source list.');
  }
}

function trustedLicenseRedirect(value) {
  const target = new URL(value);
  if (target.protocol !== 'https:' || target.username || target.password || !LICENSE_SOURCE_HOSTS.has(target.hostname)) {
    throw new Error(`Untrusted native license redirect: ${target.origin}`);
  }
  return target.href;
}
async function download(url, redirects = 0) {
  const target = new URL(redirects === 0 ? url : trustedLicenseRedirect(url));
  const key = sha256(Buffer.from(target.href)).slice(0, 24);
  const cacheFile = path.join(CACHE_DIR, key);
  try { return fs.readFileSync(cacheFile); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const buffer = await new Promise((resolve, reject) => {
    const request = https.get(target, {
      family: 4,
      headers: { 'user-agent': 'TileO-license-verifier/1 (+https://github.com/enygma-id/TileO)' },
    }, (response) => {
      const status = response.statusCode ?? 0;
      if ([301, 302, 303, 307, 308].includes(status) && response.headers.location) {
        response.resume();
        if (redirects >= 5) {
          reject(new Error(`too many redirects for ${target.href}`));
          return;
        }
        resolve(download(new URL(response.headers.location, target).href, redirects + 1));
        return;
      }
      if (status !== 200) {
        response.resume();
        reject(new Error(`HTTP ${status} for ${target.href}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
    request.on('error', reject);
  });
  fs.writeFileSync(cacheFile, buffer, { flag: 'wx', mode: 0o600 });
  return buffer;
}

async function fetchLicense(file, sourceUrl) {
  const buffer = await download(sourceUrl);
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
    const evaluation = evaluateExpression(component.license_expression, component.id);
    const isException = evaluation.exceptions.length > 0;
    if (isException) exceptions += 1;
    if (!evaluation.allowed) problems.push(`${component.id}: license expression ${component.license_expression} is not allowed`);
    if (isException && !component.review) problems.push(`${component.id}: exception ${evaluation.exceptions.join(', ')} has no review classification`);

    for (const file of component.license_files) {
      const target = path.join(dir, file.file);
      let sourceUrl;
      try {
        sourceUrl = trustedLicenseSource(file.url);
      } catch (error) {
        problems.push(`${component.id}/${file.file}: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
      if (update) {
        try {
          const data = await fetchLicense(file, sourceUrl);
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
  if (manifestArgIdx === -1) {
    fs.writeFileSync(CSV_FILE, `${csv}\n`);
  }

  console.log(`${update ? 'Updated' : 'Checked'} ${rows.length} native components (${exceptions} documented exceptions).`);
  if (problems.length > 0) {
    for (const problem of problems) console.error(`FAIL ${problem}`);
    process.exitCode = 1;
  }
}

await main();
