#!/usr/bin/env node
/**
 * TileO - npm upstream notice verification.
 *
 * Downloads the exact tarball recorded in package-lock.json for every locked
 * package, extracts its LICENSE/COPYING/NOTICE files, and stores them under
 * third-party/licenses/npm/<name>/<version>/ together with SHA-256 evidence.
 *
 * The default mode is an offline check: it verifies the committed corpus and
 * manifest against the lockfile without network access. `--update` performs
 * the network fetch and rewrites the corpus and MANIFEST.json.
 *
 * Usage:
 *   node scripts/verify-npm-notices.js                 # offline check
 *   node scripts/verify-npm-notices.js --update        # fetch + rewrite
 *   node scripts/verify-npm-notices.js --update --filter deck.gl
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const lockArgIdx = args.indexOf('--lockfile');
const LOCK_FILE = lockArgIdx !== -1 && lockArgIdx + 1 < args.length
  ? path.resolve(args[lockArgIdx + 1])
  : path.join(ROOT, 'package-lock.json');
const MANIFEST_FILE = path.join(ROOT, 'third-party', 'MANIFEST.json');
const CORPUS_DIR = path.join(ROOT, 'third-party', 'licenses', 'npm');
const CSV_FILE = path.join(ROOT, 'third-party', 'npm-upstream-verification.csv');
const CACHE_DIR = path.join(os.tmpdir(), 'tileo-npm-tarballs');
const VERIFIER = 'scripts/verify-npm-notices.js@1';

const update = args.includes('--update');
const filterIndex = args.indexOf('--filter');
const filter = filterIndex >= 0 ? args[filterIndex + 1] : null;
const concurrencyIndex = args.indexOf('--concurrency');
const requestedConcurrency = concurrencyIndex >= 0 ? Number(args[concurrencyIndex + 1]) : 8;
const concurrency = Number.isFinite(requestedConcurrency) && requestedConcurrency > 0 ? requestedConcurrency : 8;
const today = new Date().toISOString().slice(0, 10);

const LICENSE_FILE = /^(licen[cs]e|copying|copyright|notice)([-._].*)?$/i;
const MAX_NOTICE_BYTES = 2 * 1024 * 1024;
const MAX_FILES_PER_PACKAGE = 10;

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function sha512(buffer) {
  return crypto.createHash('sha512').update(buffer).digest('hex');
}

function integrityDigest(integrity) {
  if (!integrity || !integrity.startsWith('sha512-')) return null;
  return Buffer.from(integrity.slice('sha512-'.length), 'base64').toString('hex');
}

/** Minimal ustar reader. npm tarballs use short relative paths for license files. */
function readTar(buffer) {
  const entries = [];
  let offset = 0;
  let longName = null;
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const field = (start, length) => header.subarray(start, start + length).toString('utf8').replace(/\0.*$/, '');
    const name = longName ?? (field(345, 155) ? `${field(345, 155)}/${field(0, 100)}` : field(0, 100));
    const size = Number.parseInt(field(124, 12).trim() || '0', 8);
    const type = String.fromCharCode(header[156]) || '0';
    const dataStart = offset + 512;
    const data = buffer.subarray(dataStart, dataStart + size);
    if (type === 'L') longName = data.toString('utf8').replace(/\0.*$/, '');
    else if (type === 'x') longName = null; // pax path records: license paths are short
    else {
      longName = null;
      if (type === '0' || type === '\0' || type === '7') entries.push({ name, data });
    }
    offset = dataStart + Math.ceil(size / 512) * 512;
  }
  return entries;
}

function noticeEntries(tarEntries) {
  const found = [];
  const allowedExtension = /(^$|\.(txt|md|markdown|mkd|rst|html?|mit|bsd|apache\d*)$)/i;
  for (const entry of tarEntries) {
    const base = path.basename(entry.name);
    if (!LICENSE_FILE.test(base)) continue;
    if (!allowedExtension.test(path.extname(base))) continue;
    if (entry.data.length > MAX_NOTICE_BYTES) continue;
    found.push({ name: entry.name, base, data: entry.data });
  }
  found.sort((a, b) => {
    const depth = a.name.split('/').length - b.name.split('/').length;
    return depth !== 0 ? depth : a.name.localeCompare(b.name);
  });
  const seen = new Set();
  return found.filter((entry) => {
    const digest = sha256(entry.data);
    if (seen.has(digest)) return false;
    seen.add(digest);
    return true;
  }).slice(0, MAX_FILES_PER_PACKAGE);
}

async function fetchTarball(meta, cacheKey) {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.tgz`);
  if (fs.existsSync(cacheFile)) return fs.readFileSync(cacheFile);
  const response = await fetch(meta.resolved);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${meta.resolved}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const expected = integrityDigest(meta.integrity);
  if (expected && sha512(buffer) !== expected) {
    throw new Error(`integrity mismatch for ${meta.resolved}`);
  }
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile, buffer);
  return buffer;
}

function storedNames(files) {
  const used = new Set();
  return files.map((file, index) => {
    let candidate = index === 0 ? 'LICENSE.txt' : path.basename(file.name).replace(/[^A-Za-z0-9._-]/g, '_');
    if (!/\.(txt|md|markdown|rst|html?)$/i.test(candidate)) candidate = `${candidate}.txt`;
    let name = candidate;
    let suffix = 2;
    while (used.has(name.toLowerCase())) {
      name = candidate.replace(/(\.[^.]+)$/, `-${suffix}$1`);
      suffix += 1;
    }
    used.add(name.toLowerCase());
    return name;
  });
}

function readCorpus(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => fs.statSync(path.join(dir, name)).isFile())
    .sort()
    .map((name) => {
      const data = fs.readFileSync(path.join(dir, name));
      return { stored: name, sha256: sha256(data), bytes: data.length };
    });
}

function writeCorpus(dir, files, packageJson) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const written = [];
  const names = storedNames(files);
  files.forEach((file, index) => {
    const stored = names[index];
    fs.writeFileSync(path.join(dir, stored), file.data);
    written.push({ upstream: file.name, stored, sha256: sha256(file.data), bytes: file.data.length });
  });
  if (packageJson) {
    const data = Buffer.from(`${JSON.stringify(packageJson, null, 2)}\n`);
    fs.writeFileSync(path.join(dir, 'package.json'), data);
    written.push({ upstream: 'package/package.json', stored: 'package.json', sha256: sha256(data), bytes: data.length });
  }
  return written;
}

function verifyStored(dir, files) {
  const stored = readCorpus(dir);
  const names = storedNames(files);
  const expected = files.map((file, index) => ({
    stored: names[index],
    sha256: sha256(file.data),
    bytes: file.data.length,
  }));
  const actualByName = new Map(stored.map((entry) => [entry.stored, entry]));
  const problems = [];
  for (const want of expected) {
    const actual = actualByName.get(want.stored);
    if (!actual) problems.push(`missing ${want.stored}`);
    else if (actual.sha256 !== want.sha256) problems.push(`sha256 mismatch for ${want.stored}`);
  }
  return { stored, expected, problems };
}

function packageDir(name, version) {
  return path.join(CORPUS_DIR, name, version);
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    for (;;) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function main() {
  const lockRaw = fs.readFileSync(LOCK_FILE, 'utf8');
  const lock = JSON.parse(lockRaw);
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  const lockSha = sha256(Buffer.from(lockRaw.replace(/\r\n/g, '\n'), 'utf8'));
  const entries = Object.entries(lock.packages || {}).filter(([key]) => key !== '');
  if (filter) {
    const selected = entries.filter(([key, meta]) => key.includes(filter) || meta.name?.includes(filter));
    if (selected.length === 0) throw new Error(`--filter ${filter} matched no lockfile entries`);
    entries.length = 0;
    entries.push(...selected);
  }

  // The manifest is the authoritative per-package record; rebuild it from the
  // lockfile so new dependencies cannot silently miss the inventory.
  const previous = new Map((manifest.packages || []).map((entry) => [entry.package_path, entry]));
  const selectedPaths = new Set(entries.map(([lockPath]) => lockPath));
  if (update) {
    manifest.packages = filter
      ? (manifest.packages || []).filter((entry) => !selectedPaths.has(entry.package_path))
      : [];
  }
  const rows = [];
  const results = await mapLimit(entries, Math.max(1, concurrency), async ([lockPath, meta]) => {
    const name = lockPath.replace(/^node_modules\//, '');
    const version = meta.version || '0.0.0';
    const dir = packageDir(name, version);
    const cacheKey = `${lockPath.replaceAll('/', '_')}@${version}`;
    const declared = meta.license || 'UNKNOWN';
    const scope = meta.dev ? 'development' : meta.optional ? 'runtime-optional' : 'runtime';
    const base = {
      package_path: lockPath,
      name,
      version,
      declared_license: declared,
      dev: !!meta.dev,
      optional: !!meta.optional,
      scope,
      integrity: meta.integrity,
      resolved: meta.resolved,
    };

    if (!update) {
      const stored = readCorpus(dir);
      const prior = previous.get(lockPath)?.upstream_verification;
      const problems = [];
      if (!prior) problems.push('manifest entry has no upstream_verification record');
      if (stored.length === 0) problems.push('no stored notice files');
      if (prior?.files) {
        const actual = new Set(stored.map((entry) => `${entry.stored}:${entry.sha256}`));
        for (const file of prior.files) {
          if (!actual.has(`${file.stored}:${file.sha256}`)) problems.push(`mismatch for ${file.stored}`);
        }
      }
      return {
        ...base,
        status: prior?.status ?? 'unverified',
        files: stored.map((entry) => ({ stored: entry.stored, sha256: entry.sha256, bytes: entry.bytes })),
        problems,
        tarball_sha256: prior?.tarball_sha256 ?? null,
        package_json_license: prior?.package_json_license ?? null,
      };
    }

    try {
      const tarball = await fetchTarball(meta, cacheKey);
      const tar = readTar(gunzipSync(tarball));
      const files = noticeEntries(tar);
      const packageJsonEntry = tar.find((entry) => entry.name === 'package/package.json');
      const packageJson = packageJsonEntry ? JSON.parse(packageJsonEntry.data.toString('utf8')) : null;
      if (files.length > 0) {
        const { problems } = verifyStored(dir, files);
        const written = writeCorpus(dir, files, null);
        return {
          ...base,
          status: 'verified_upstream_tarball',
          files: written,
          problems: [],
          tarball_sha256: sha256(tarball),
          package_json_license: packageJson?.license ?? null,
          note: problems.length > 0 ? `corpus updated (${problems.length} mismatch)` : 'corpus matches upstream tarball',
        };
      }
      const written = writeCorpus(dir, [], packageJson);
      return {
        ...base,
        status: 'metadata_only_no_license_file',
        files: written,
        problems: [],
        tarball_sha256: sha256(tarball),
        package_json_license: packageJson?.license ?? null,
        note: 'tarball has no LICENSE/COPYING/NOTICE file; package.json metadata retained',
      };
    } catch (error) {
      return {
        ...base,
        status: 'verification_failed',
        files: readCorpus(dir).map((entry) => ({ stored: entry.stored, sha256: entry.sha256, bytes: entry.bytes })),
        problems: [error instanceof Error ? error.message : String(error)],
        tarball_sha256: null,
        package_json_license: null,
      };
    }
  });

  for (const result of results.sort((a, b) => a.package_path.localeCompare(b.package_path))) {
    const prior = previous.get(result.package_path) ?? {};
    const record = {
      ...prior,
      package_path: result.package_path,
      name: result.name,
      version: result.version,
      declared_license: result.declared_license,
      dev: result.dev,
      optional: result.optional,
      scope: result.scope,
      integrity: result.integrity,
      resolved: result.resolved,
      upstream_verification: {
        status: result.status,
        verifier: VERIFIER,
        verified_at: update ? today : prior.upstream_verification?.verified_at ?? null,
        tarball_sha256: result.tarball_sha256 ?? prior.upstream_verification?.tarball_sha256 ?? null,
        package_json_license: result.package_json_license ?? prior.upstream_verification?.package_json_license ?? null,
        files: result.files,
        note: result.problems.length > 0 ? result.problems.join('; ') : result.note ?? prior.upstream_verification?.note ?? null,
      },
    };
    if (update) {
      record.notice_license = result.declared_license;
      record.notice_file = result.files[0]
        ? path.relative(ROOT, path.join(packageDir(result.name, result.version), result.files[0].stored)).replaceAll('\\', '/')
        : null;
      record.notice_sha256 = result.files[0]?.sha256 ?? null;
      record.notice_source = result.files[0]?.upstream ?? null;
    }
    manifest.packages.push(record);
    rows.push({
      package: result.name,
      version: result.version,
      scope: result.scope,
      declared_license: result.declared_license,
      status: result.status,
      tarball_sha256: result.tarball_sha256 ?? '',
      notice_files: result.files.map((file) => `${file.stored}:${file.sha256}`).join(';'),
      package_json_license: result.package_json_license ?? '',
      note: result.problems.length ? result.problems.join('; ') : result.note ?? '',
    });
  }

  const verified = results.filter((item) => item.status === 'verified_upstream_tarball').length;
  const metadataOnly = results.filter((item) => item.status === 'metadata_only_no_license_file').length;
  const failed = results.filter((item) => item.status === 'verification_failed').length;
  const checkedProblems = results.filter((item) => item.problems?.length > 0);

  if (update) {
    manifest.project = manifest.project ?? 'TileO';
    manifest.reference_lockfile = 'package-lock.json';
    manifest.reference_lockfile_sha256 = lockSha;
    manifest.package_count = results.length;
    manifest.notice_source = 'THIRD-PARTY-NOTICES.md';
    manifest.generated_from = 'Committed package-lock.json and exact-version upstream npm tarballs';
    manifest.meaning = 'Full declared npm inventory with upstream notice evidence. metadata_only_no_license_file entries are explicitly identified and are not represented as verified upstream license files.';
    manifest.npm_verification = {
      verifier: VERIFIER,
      verified_at: today,
      method: 'Exact tarball from package-lock resolved URL; sha512 integrity checked; LICENSE/COPYING/NOTICE extracted and hashed.',
      package_count: results.length,
      verified_upstream_tarball: verified,
      metadata_only_no_license_file: metadataOnly,
      verification_failed: failed,
      output: 'third-party/npm-upstream-verification.csv',
      offline_check: 'Run `node scripts/verify-npm-notices.js` (no network) to compare the committed corpus with MANIFEST.json.',
    };
    fs.writeFileSync(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  const header = ['package', 'version', 'scope', 'declared_license', 'status', 'tarball_sha256', 'notice_files', 'package_json_license', 'note'];
  // Rewrite rows for the selected filter while preserving rows outside it.
  let allRows = rows;
  if (filter) {
    const priorCsv = fs.existsSync(CSV_FILE) ? fs.readFileSync(CSV_FILE, 'utf8').trim() : '';
    const lines = priorCsv ? priorCsv.split(/\r?\n/).slice(1) : [];
    const selected = new Set(rows.map((row) => `${row.package}@${row.version}`));
    allRows = [...lines.map((line) => {
      const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g) ?? [];
      const values = cells.map((cell) => cell.replace(/,$/, '').replace(/^"|"$/g, '').replaceAll('""', '"'));
      return {
        package: values[0], version: values[1], scope: values[2], declared_license: values[3],
        status: values[4], tarball_sha256: values[5], notice_files: values[6], package_json_license: values[7], note: values[8],
      };
    }).filter((row) => !selected.has(`${row.package}@${row.version}`)), ...rows];
    allRows.sort((a, b) => a.package.localeCompare(b.package));
  }
  const csv = [header.join(','), ...allRows.map((row) => header.map((key) => csvEscape(row[key])).join(','))].join('\n');
  fs.writeFileSync(CSV_FILE, `${csv}\n`);

  console.log(`${update ? 'Updated' : 'Checked'} ${results.length} packages: ${verified} verified, ${metadataOnly} metadata-only, ${failed} failed.`);
  if (!update && checkedProblems.length > 0) {
    for (const item of checkedProblems.slice(0, 25)) {
      console.error(`FAIL ${item.package_path}: ${item.problems.join('; ')}`);
    }
    process.exitCode = 1;
  }
  if (failed > 0) process.exitCode = 1;
}

await main();
