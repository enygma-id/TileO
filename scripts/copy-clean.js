#!/usr/bin/env node
// Clean export: copies this project to a target folder without local state,
// secrets, build output, logs, or vendored tool binaries.
//
// Usage: npm run copy:clean -- <target-folder> [--force] [--with-git] [--with-samples] [--dry-run]
import { cp, lstat, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const USAGE = `Usage: npm run copy:clean -- <target-folder> [options]

Creates a clean copy of the project at <target-folder>. Source, docs,
scripts, and configs are kept; local state is skipped: node_modules,
dist, data, test results, .env secrets, logs, session notes, vendored
tool binaries, samples, and .git.

Options:
  --force         merge into an existing non-empty folder (extra files stay)
  --with-git      include .git (repository history)
  --with-samples  include samples/ (large payloads)
  --dry-run       show what would be copied without writing anything

On Windows use forward slashes in the target path:
  npm run copy:clean -- D:/Kerja/TileO-export`;

class Stop extends Error {}

function fail(message) {
  console.error(`copy:clean - ${message}`);
  process.exitCode = 1;
  throw new Stop(message);
}

function usage(message) {
  console.error(`copy:clean - ${message}\n`);
  console.error(USAGE);
  process.exitCode = 1;
  throw new Stop(message);
}

const KNOWN_FLAGS = new Set(['--force', '--with-git', '--with-samples', '--dry-run']);
const relative = (value) => path.relative(root, value).split(path.sep).join('/');

function size(bytes) {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function list(values, cap = 8) {
  const items = [...values].sort();
  if (items.length === 0) return 'none';
  const head = items.slice(0, cap).join(', ');
  return items.length > cap ? `${head}, +${items.length - cap} more` : head;
}

async function main() {
  const flags = new Set();
  const positional = [];
  for (const value of process.argv.slice(2)) {
    if (value.startsWith('--')) flags.add(value);
    else positional.push(value);
  }
  for (const flag of flags) if (!KNOWN_FLAGS.has(flag)) usage(`Unknown option ${flag}`);
  if (positional.length === 0) usage('Missing target folder.');
  if (positional.length > 1) usage(`Unexpected extra argument: ${positional.slice(1).join(', ')}`);

  const target = path.resolve(process.cwd(), positional[0]);
  const dryRun = flags.has('--dry-run');

  if (target === root) fail('The target is the project folder itself.');
  const inside = path.relative(root, target);
  if (inside !== '' && !inside.startsWith('..') && !path.isAbsolute(inside)) fail('The target must be outside the project folder.');

  const skipTopDirs = new Set(['node_modules', 'dist', 'data', 'test-results', 'playwright-report', 'tippecanoe']);
  if (!flags.has('--with-samples')) skipTopDirs.add('samples');
  if (!flags.has('--with-git')) skipTopDirs.add('.git');
  const skipPaths = new Set(['tools/gdal', 'tools/bin', 'tools/tippecanoe_musl']);

  const skipFile = (name) =>
    ((name === '.env' || name.startsWith('.env.')) && name !== '.env.example') ||
    name.endsWith('.log') ||
    name === 'session_.md' ||
    name === 'session.md' ||
    name.endsWith('.tsbuildinfo') ||
    name === '.DS_Store' ||
    name === 'Thumbs.db' ||
    name === 'nul';

  const excluded = (rel) => {
    if (rel === '') return false;
    const segments = rel.split('/');
    for (let index = 0; index < segments.length; index++) {
      const prefix = segments.slice(0, index + 1).join('/');
      if (index === 0 && skipTopDirs.has(prefix)) return true;
      if (skipPaths.has(prefix)) return true;
      if (skipFile(segments[index])) return true;
    }
    return false;
  };

  let targetItems = [];
  try {
    targetItems = await readdir(target);
  } catch (error) {
    if (error.code === 'ENOTDIR') fail('The target exists but is a file.');
    if (error.code !== 'ENOENT') throw error;
  }
  if (targetItems.length > 0 && !flags.has('--force')) {
    fail(`The target is not empty: ${target}\nUse --force to merge into it (extra files are left in place), or choose a new folder.`);
  }

  const summary = { files: 0, bytes: 0, dirs: new Set(), skippedFiles: new Set() };
  const walk = async (current) => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const rel = relative(full);
      if (excluded(rel)) {
        if (entry.isDirectory()) summary.dirs.add(rel);
        else summary.skippedFiles.add(rel);
        continue;
      }
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) { summary.files += 1; summary.bytes += (await stat(full)).size; }
      else if (entry.isSymbolicLink()) { summary.files += 1; summary.bytes += (await lstat(full)).size; }
    }
  };
  await walk(root);

  console.log(`Clean export${dryRun ? ' (dry run - nothing is written)' : ''}`);
  console.log(`  source   ${root}`);
  console.log(`  target   ${target}`);
  console.log(`  files    ${summary.files} (${size(summary.bytes)})`);
  console.log(`  skipped  ${summary.dirs.size} directories: ${list(summary.dirs)}`);
  if (summary.skippedFiles.size > 0) console.log(`           ${summary.skippedFiles.size} files: ${list(summary.skippedFiles)}`);

  if (dryRun) return;

  try {
    await cp(root, target, { recursive: true, preserveTimestamps: true, filter: (source) => !excluded(relative(source)) });
  } catch (error) {
    fail(`Copy failed: ${error.message}`);
  }
  console.log('Clean export complete.');
  if (!flags.has('--with-git')) {
    console.log(`  copied   ${summary.files} files (${size(summary.bytes)}) -> ${target}`);
    console.log(`  next     cd "${target}" && git init -b main && git add -A && git commit -m "Initial commit"`);
  } else {
    console.log(`  copied   ${summary.files} files (${size(summary.bytes)}) -> ${target}`);
  }
}

try {
  await main();
} catch (error) {
  if (!(error instanceof Stop)) {
    console.error(`copy:clean - unexpected failure: ${error?.stack ?? error}`);
    process.exitCode = 1;
  }
}
