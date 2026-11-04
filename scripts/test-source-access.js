#!/usr/bin/env node
// TEST FIXTURES ONLY — NOT RELEASE EVIDENCE.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { assetPaths, sourceAccess, validateAssets, publicationStatus } from './lib/release-assets.js';
import { sha256File, sha256 } from './lib/release-evidence.js';
import { publicDownload } from './lib/public-download.js';
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-SA-test-'));
  const core = path.join(root, 'core'), stage = path.join(root, 'stage');
  fs.mkdirSync(core); fs.mkdirSync(stage);
  const c = { version: '0.1.0', repository: 'test/fixture', commit: 'test-only', image_id: 'test-image', platform: 'linux/amd64' };
  const p = { target_image: { id: c.image_id }, archives: { 'source/gcc-runtime-corresponding-source.tar.gz': 'a'.repeat(64), 'source/mozilla-ca-bundle-source.tar.gz': 'b'.repeat(64) } };
  for (const name of Object.keys(p.archives)) p.archives[name] = sha256(`TEST FIXTURE ${path.basename(name)}`);
  const files = [];
  for (const [name, relative] of Object.entries(assetPaths(c.version))) {
    const file = path.join(core, relative); fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, name === 'SOURCE-ACCESS.md' ? sourceAccess(c, p) : `TEST FIXTURE ${name}`);
    fs.copyFileSync(file, path.join(stage, name)); files.push({ path: relative, bytes: fs.statSync(file).size, sha256: sha256File(file) });
  }
  fs.writeFileSync(path.join(core, 'candidate.json'), JSON.stringify(c));
  fs.writeFileSync(path.join(core, 'core-evidence-manifest.json'), JSON.stringify({ ...c, files }));
  fs.writeFileSync(path.join(core, 'compliance/source-provenance.json'), JSON.stringify(p));
  const closure = path.join(root, 'closure.tar.gz');
  const closureRoot = 'TileO-v0.1.0-Release-Closure';
  fs.mkdirSync(path.join(root, closureRoot));
  fs.writeFileSync(path.join(root, closureRoot, 'delivery-manifest.json'), JSON.stringify({ ...c, core_evidence_sha256: sha256File(path.join(core, 'core-evidence-manifest.json')) }));
  execFileSync('tar', ['-czf', closure, '-C', root, closureRoot]);
  fs.copyFileSync(closure, path.join(stage, 'TileO-v0.1.0-Release-Closure.tar.gz'));
  const sums = () => fs.writeFileSync(path.join(stage, 'SHA256SUMS'), fs.readdirSync(stage).filter(n => n !== 'SHA256SUMS').map(n => `${sha256File(path.join(stage, n))}  ${n}`).join('\n') + '\n');
  sums(); return { root, core, stage, closure, sums };
}
function check(id, action) { test(id, () => { const f = fixture(); try { validateAssets(f.core, f.stage, f.closure); action(f); } finally { fs.rmSync(f.root, { recursive: true }); } }); }
check('SA01 missing source asset rejects staging', f => { fs.unlinkSync(path.join(f.stage, 'gcc-runtime-corresponding-source.tar.gz')); assert.throws(() => validateAssets(f.core, f.stage, f.closure)); });
check('SA02 internal-only or wrong repo/tag document rejects', f => { fs.writeFileSync(path.join(f.stage, 'SOURCE-ACCESS.md'), '../source/old.tar.gz https://github.com/wrong/repo/releases/download/latest/old.tar.gz'); f.sums(); assert.throws(() => validateAssets(f.core, f.stage, f.closure), /SOURCE-ACCESS/); });
check('SA03 old source with self-consistent checksums rejects', f => { fs.writeFileSync(path.join(f.stage, 'gcc-runtime-corresponding-source.tar.gz'), 'OLD CANDIDATE'); f.sums(); assert.throws(() => validateAssets(f.core, f.stage, f.closure), /frozen core/); });
test('SA04 anonymous HTTP login/HTML and auth-only routes reject', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-SA04-'));
  try { for (const status of [200, 401, 403]) await assert.rejects(publicDownload('https://test.invalid/source', path.join(dir, String(status)), async (url, options) => {
    assert.equal(options.credentials, 'omit'); assert.equal(options.headers.Authorization, undefined);
    return new Response('<html>login</html>', { status, headers: { 'content-type': 'text/html' } });
  })); } finally { fs.rmSync(dir, { recursive: true }); }
});
check('SA05 post-freeze source-access mutation rejects', f => { fs.appendFileSync(path.join(f.core, 'compliance/customer/SOURCE-ACCESS.md'), 'changed'); assert.throws(() => validateAssets(f.core, f.stage, f.closure), /Frozen core changed/); });
test('SA06 registry failure after source success remains partial', () => {
  assert.equal(publicationStatus(true, ['registry failed']), 'PARTIALLY_PUBLISHED');
  const workflow = fs.readFileSync(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
  assert.ok(workflow.indexOf('node scripts/verify-public-source-access.js') < workflow.indexOf('docker push'));
});

check('actual staging CLI assembles exact assets and preserves previous attempts', f => {
  const directory=path.join(f.root,'actual-stage');
  const cli=new URL('./stage-release-assets.js',import.meta.url).pathname;
  const args=[cli,'--evidence-dir',f.core,'--closure',f.closure,'--out-dir',directory];
  const output=JSON.parse(execFileSync(process.execPath,args,{encoding:'utf8'}));
  assert.equal(output.status,'STAGED_ASSETS_VERIFIED_NOT_AUTHORIZATION');
  assert.equal(Object.keys(output.assets).length,9);
  validateAssets(f.core,directory,f.closure);
  const before=sha256File(path.join(directory,'SHA256SUMS'));
  assert.throws(()=>execFileSync(process.execPath,args,{stdio:'pipe'}));
  assert.equal(sha256File(path.join(directory,'SHA256SUMS')),before);
});
check('actual staging CLI rejects corrupt frozen source', f => {
  fs.appendFileSync(path.join(f.core,'source/TileO-0.1.0-source.tar.gz'),'CORRUPT');
  assert.throws(()=>execFileSync(process.execPath,[new URL('./stage-release-assets.js',import.meta.url).pathname,'--evidence-dir',f.core,'--closure',f.closure,'--out-dir',path.join(f.root,'bad-stage')],{stdio:'pipe'}),/Frozen core changed/);
});
