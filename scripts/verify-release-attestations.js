#!/usr/bin/env node
import path from 'node:path';
import { parseArgs, readJson } from './lib/release-evidence.js';
import { verifyReleaseAttestations } from './lib/release-attestations.js';

const options = parseArgs(process.argv.slice(2), { '--assets-dir': 'required', '--bundle': 'required', '--candidate': 'required' });
const verified = verifyReleaseAttestations(path.resolve(options['assets-dir']), path.resolve(options.bundle), readJson(path.resolve(options.candidate), 'tileo-release-candidate@1'));
console.log(`Cryptographically verified provenance for ${verified.length} release assets.`);
