#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { validateArtifact, toolDirectory } from './lib/output-validation.js';

const { values } = parseArgs({ options: Object.fromEntries(['input', 'kind', 'report', 'tools-dir', 'reference'].map(name => [name, { type: 'string' }])) });
if (!values.input || !values.kind || !values.report) throw new Error('Usage: node scripts/validate-output.js --input PATH --kind raster|vector|pmtiles|elevation|scientific|model3d|glb|gltf --report REPORT.json');
const result = await validateArtifact({ input: values.input, kind: values.kind, report: values.report, tools: values['tools-dir'] || toolDirectory(), reference: values.reference });
console.log(`${result.artifact}: ${result.status}`);
if (result.status !== 'passed') { for (const check of result.checks.filter(c => c.status !== 'passed')) console.error(`${check.name}: ${check.error}`); process.exitCode = 1; }
