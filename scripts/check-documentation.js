#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

// Maintain the pages changed with output validation without imposing new rules
// on historical audits or unrelated documentation.
const pages = ['README.md', 'SECURITY.md', 'docs/SECURITY_MAINTENANCE.md', 'docs/RELEASE_PROCESS.md', 'docs/RELEASE_POLICY.md', 'docs/INDEX.md', 'docs/OUTPUT_FORMATS.md', 'docs/OUTPUT_VALIDATION.md', 'docs/TESTING_COVERAGE.md', 'docs/LOCAL_PUBLICATION_PREFLIGHT.md', 'docs/RELEASE_NEXT_STEPS.md', 'docs/history/output-validation-20261104/README.md', 'tools/output-validation/README.md'];
const errors = [];
for (const page of pages) {
  const text = readFileSync(page, 'utf8');
  for (const [, target] of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const file = resolve(dirname(page), target.split('#')[0]);
    if (!existsSync(file)) errors.push(`${page}: missing relative link ${target}`);
    if (target.includes('artifacts/')) errors.push(`${page}: public links must not depend on ignored local artifacts`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Documentation links OK: ${pages.length} maintained English guides.`);
