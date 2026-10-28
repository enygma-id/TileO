#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { gitIdentity, parseArgs } from './lib/release-evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let options;
try { options = parseArgs(process.argv.slice(2), { '--version': 'required' }); }
catch (error) { console.error(error.message); process.exit(2); }
const current = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
if (options.version !== current) throw new Error(`Requested ${options.version}, but package.json is ${current}`);
if (current !== '0.1.0') throw new Error('The protected first-public-release flow is locked to 0.1.0');
const git = gitIdentity(ROOT);
if (!git.clean) throw new Error(`Candidate preparation requires a clean tree:\n${git.status}`);
for (const [command, args] of [
  [process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'typecheck']],
  [process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build']],
  [process.execPath, ['scripts/verify-npm-notices.js']],
  [process.execPath, ['scripts/verify-native-licenses.js']],
  [process.execPath, ['scripts/check-notice-parity.js']]
]) execFileSync(command, args, { cwd: ROOT, stdio: 'inherit' });
console.log(`Candidate source ${git.commit} is ready for the protected 0.1.0 workflow.`);
console.log('No version bump, commit, tag, release, registry push, or approval was created.');
