import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const TAR_EXECUTABLE = process.platform === 'win32' ? 'C:\\Windows\\System32\\tar.exe' : 'tar';

export function parseArgs(argv, specification) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (!flag.startsWith('--') || !(flag in specification)) throw new Error(`Unknown argument: ${flag}`);
    if (specification[flag] === 'boolean') {
      result[flag.slice(2)] = true;
      continue;
    }
    const value = argv[++i];
    if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
    result[flag.slice(2)] = value;
  }
  for (const [flag, type] of Object.entries(specification)) {
    if (type === 'required' && !result[flag.slice(2)]) throw new Error(`${flag} is required`);
  }
  return result;
}

export function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function readJson(file, schema) {
  let value;
  try { value = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { throw new Error(`${path.basename(file)} is not valid JSON: ${error.message}`); }
  if (schema && value.schema !== schema) throw new Error(`${path.basename(file)} schema must be ${schema}`);
  return value;
}

export function resolveInside(root, requested, label = 'path') {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(requested);
  if (resolved !== resolvedRoot && !resolved.startsWith(resolvedRoot + path.sep)) throw new Error(`${label} escapes evidence root`);
  return resolved;
}

export function relativeSafe(root, file) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (!relative || relative.startsWith('../') || path.isAbsolute(relative)) throw new Error(`Unsafe evidence path: ${relative}`);
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink()) throw new Error(`Symlinks are not allowed in release evidence: ${relative}`);
  return relative;
}

export function listFiles(root, ignored = new Set()) {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name);
      const relative = path.relative(root, full).replaceAll('\\', '/');
      if (ignored.has(relative)) continue;
      if (entry.isSymbolicLink()) throw new Error(`Symlinks are not allowed in release evidence: ${relative}`);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push(full);
      else throw new Error(`Unsupported evidence entry: ${relative}`);
    }
  }
  walk(root);
  return files;
}

export function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i <= text.length; i++) {
    const char = text[i] ?? '\n';
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') { row.push(cell.replace(/\r$/, '')); cell = ''; if (row.some((v) => v !== '')) rows.push(row); row = []; }
    else cell += char;
  }
  if (quoted) throw new Error('CSV has an unterminated quoted field');
  if (!rows.length) throw new Error('CSV is empty');
  const header = rows[0];
  if (new Set(header).size !== header.length) throw new Error('CSV contains duplicate columns');
  return rows.slice(1).map((values, index) => {
    if (values.length !== header.length) throw new Error(`CSV row ${index + 2} has ${values.length} columns; expected ${header.length}`);
    return Object.fromEntries(header.map((name, column) => [name, values[column]]));
  });
}

export function inspectImage(image) {
  let raw;
  try { raw = execFileSync('docker', ['image', 'inspect', image], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }); }
  catch (error) { throw new Error(`Cannot inspect Docker image ${image}: ${error.message}`); }
  const records = JSON.parse(raw);
  if (records.length !== 1 || !/^sha256:[0-9a-f]{64}$/.test(records[0].Id)) throw new Error(`Docker image ${image} did not resolve to one immutable image ID`);
  return { raw, record: records[0], id: records[0].Id, platform: `${records[0].Os}/${records[0].Architecture}` };
}

export function gitIdentity(root) {
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const status = execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], { cwd: root, encoding: 'utf8' }).trim();
  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error('Git HEAD is not a full commit SHA');
  return { commit, clean: status === '', status };
}

export function atomicWrite(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const staging = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(staging, content);
  fs.renameSync(staging, file);
}

export const CORE_REQUIRED_PATHS = [
  'candidate.json',
  'source/source-baseline.json',
  'source/source-export-manifest.json',
  'source/TileO-0.1.0-source.tar.gz',
  'source/build-context-sha256.txt',
  'image/image-inspect.json',
  'image/image-export.json',
  'image/release-image-digest.txt',
  'image/release-provenance.json',
  'image/build-provenance.json',
  'image/build.stdout.log',
  'image/build.stderr.log',
  'image/rootfs-files.json',
  'image/binary-linkage.csv',
  'image/native-package-provenance.json',
  'image/image-notice-paths.csv',
  'image/license-decisions.csv',
  'image/gdal-drivers.txt',
  'image/runtime-file-hashes.json',
  'sbom/sbom-image.spdx.json',
  'sbom/sbom-image.cdx.json',
  'sbom/scanner-invocation.json',
  'tests/test-scope.json',
  'tests/fixture-manifest.json',
  'tests/preflight-results.json',
  'tests/integration-tests.tap',
  'tests/integration-tests.stderr.log',
  'tests/integration-test-results.json',
  'tests/exit-status.json',
  'tests/test-matrix.csv',
  'tests/browser/browser-results.json',
  'tests/browser/browser.stderr.log',
  'tests/browser/server.log',
  'tests/browser/execution.json',
  'gate/negative-controls.json',
  'gate/release-gate-negative-tests.log',
  'gate/technical-eligibility.json',
  'compliance/exceptions-register.csv',
  'compliance/source-provenance.json',
  'compliance/source-verification.json',
  'compliance/ca-rebuild-verification.json',
  'compliance/source/gcc-runtime-corresponding-source.tar.gz',
  'compliance/source/mozilla-ca-bundle-source.tar.gz',
  'compliance/customer/THIRD-PARTY-NOTICES.md',
  'compliance/customer/THIRD-PARTY-EXCEPTIONS.md',
  'compliance/customer/SOURCE-ACCESS.md',
  'compliance/customer/delivery-manifest.json',
  'compliance/rights-review-summary.json',
  'release/release-notes.md',
  'release/operator-runbook.md',
  'release/RELEASE_CLOSURE_REPORT.md',
  'release/policy-snapshot.json',
  'release/reviewers-policy-snapshot.json'
];
