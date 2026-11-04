import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { verifyReleaseAttestations } from './lib/release-attestations.js';

function fixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tileo-attestation-'));
  try {
    const directory = path.join(root, 'assets');
    fs.mkdirSync(directory);
    fs.writeFileSync(path.join(directory, 'source.tar.gz'), 'fixture source bytes');
    fs.writeFileSync(path.join(directory, 'SHA256SUMS'), 'fixture checksums');
    const bundle = path.join(root, 'provenance.sigstore.json');
    // Test doubles never stand in for cryptographic verification in production.
    fs.writeFileSync(bundle, '{}');
    run({ root, directory, bundle, candidate: { repository: 'enygma-id/TileO', version: '0.1.0', commit: 'a'.repeat(40) } });
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test('release provenance verifies every asset under exact workflow/commit policy', () => fixture(f => {
  const seen = [];
  const assets = verifyReleaseAttestations(f.directory, f.bundle, f.candidate, (command, args) => {
    assert.equal(command, 'gh');
    const flag = name => args[args.indexOf(name) + 1];
    assert.equal(flag('--repo'), f.candidate.repository);
    assert.equal(flag('--bundle'), f.bundle);
    assert.equal(flag('--signer-workflow'), 'enygma-id/TileO/.github/workflows/release.yml');
    assert.equal(flag('--source-digest'), f.candidate.commit);
    assert.equal(flag('--signer-digest'), f.candidate.commit);
    assert.equal(flag('--source-ref'), 'refs/heads/main');
    assert.ok(args.includes('--deny-self-hosted-runners'));
    seen.push(path.basename(args[2]));
    return '[{"verificationResult":{}}]';
  });
  assert.deepEqual(assets, seen);
  assert.equal(seen.length, 2);
}));

test('missing, rejected and empty signature verification cannot publish', () => fixture(f => {
  assert.throws(() => verifyReleaseAttestations(f.directory, f.bundle, f.candidate, () => { throw Error('signature digest mismatch'); }), /signature digest mismatch/);
  assert.throws(() => verifyReleaseAttestations(f.directory, f.bundle, f.candidate, () => '[]'), /No verified attestation/);
  fs.unlinkSync(f.bundle);
  assert.throws(() => verifyReleaseAttestations(f.directory, f.bundle, f.candidate), /ENOENT/);
}));

test('unsafe subjects and symlink assets are rejected before invoking gh', () => fixture(f => {
  const unexpected = () => { assert.fail('Verifier must not run for unsafe inputs'); };
  assert.throws(() => verifyReleaseAttestations(f.directory, f.bundle, { ...f.candidate, commit: 'HEAD' }, unexpected), /Invalid attestation subject/);
  fs.symlinkSync(f.bundle, path.join(f.directory, 'linked'));
  assert.throws(() => verifyReleaseAttestations(f.directory, f.bundle, f.candidate, unexpected), /regular files/);
}));
