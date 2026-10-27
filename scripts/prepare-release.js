#!/usr/bin/env node
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// ponytail: single-file release pipeline; add changelog generation when requested.
const bumpType = process.argv[2];
if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('Usage: node scripts/prepare-release.js <patch|minor|major>');
  process.exit(1);
}

const run = (cmd) => {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

// 1. Guard against dirty working tree
const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
if (status) {
  console.error('Error: Working tree is dirty. Commit or stash changes before releasing:');
  console.error(status);
  process.exit(1);
}

// 2. Bump version in package.json and package-lock.json
run(`npm version ${bumpType} --no-git-tag-version`);
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version;
const tag = `v${version}`;

// 3. Sync reference lockfile SHA-256 into third-party/MANIFEST.json
const lockContent = fs.readFileSync('package-lock.json', 'utf8').replace(/\r\n/g, '\n');
const lockSha = crypto.createHash('sha256').update(lockContent, 'utf8').digest('hex');
const manifestPath = path.resolve('third-party/MANIFEST.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.reference_lockfile_sha256 = lockSha;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

// 4. Update dependencies inventory and notices documentation
run('node scripts/generate-dependency-inventory.js');
run('npm run notices');

// 5. Build and verify release gates locally
run('npm run build');
run('node scripts/release-gate.js');
run('node scripts/test-negative-controls.js');

// 6. Enforce human approval signoff in release-approval.md before creating git tag
const approvalDoc = fs.readFileSync('release-approval.md', 'utf8');
const hasPending = /\bPENDING\b/i.test(approvalDoc) || /\[\s*\]/i.test(approvalDoc);
const hasApprovedSignoff = /Decision:\s*\*\*GO\*\*/i.test(approvalDoc);
if (hasPending || !hasApprovedSignoff) {
  console.error('\nERROR: Cannot create release tag. release-approval.md has PENDING reviewer signatures or unchecked items.');
  console.error('Explicit human legal/engineering approval signoff is required before creating a release tag.\n');
  process.exit(1);
}

// 7. Commit and create annotated git tag
run('git add package.json package-lock.json third-party/ THIRD-PARTY-NOTICES.md artifacts/');
run(`git commit -m "chore(release): ${tag}"`);
run(`git tag -a ${tag} -m "Release ${tag}"`);

console.log(`\n✓ Release ${tag} prepared and tagged locally.`);
console.log('To publish and trigger CI/CD:');
console.log('  git push origin main --tags\n');
