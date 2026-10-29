#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { parseArgs } from './lib/release-evidence.js';
import { validateAssets } from './lib/release-assets.js';
const o = parseArgs(process.argv.slice(2), { '--evidence-dir': 'required', '--assets-dir': 'required', '--closure': 'required', '--output': 'required' });
const result = validateAssets(path.resolve(o['evidence-dir']), path.resolve(o['assets-dir']), path.resolve(o.closure));
fs.writeFileSync(o.output, JSON.stringify({ status: 'STAGED_ASSETS_VERIFIED', ...result }, null, 2) + '\n', { flag: 'wx' });
console.log('STAGED_ASSETS_VERIFIED');
