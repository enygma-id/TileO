import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// gh performs cryptographic Sigstore verification. Local metadata alone must
// never be accepted as a signature or as evidence of a successful publication.
export function verifyReleaseAttestations(directory, bundle, candidate, execute = execFileSync) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(candidate.repository)
    || !/^[a-f0-9]{40}$/.test(candidate.commit) || candidate.version !== '0.1.0') throw Error('Invalid attestation subject');
  if (!fs.lstatSync(bundle).isFile() || !fs.statSync(bundle).size) throw Error('Attestation bundle must be a nonempty regular file');
  const members = fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  if (!members.length || members.some(member => !member.isFile())) throw Error('Attested assets must be nonempty and contain only regular files');
  for (const member of members) {
    const result = JSON.parse(execute('gh', ['attestation', 'verify', path.join(directory, member.name),
      '--bundle', bundle, '--repo', candidate.repository,
      '--signer-workflow', `${candidate.repository}/.github/workflows/release.yml`,
      '--signer-digest', candidate.commit, '--source-digest', candidate.commit,
      '--source-ref', 'refs/heads/main', '--deny-self-hosted-runners', '--format', 'json'],
    { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
    if (!Array.isArray(result) || !result.length) throw Error(`No verified attestation for ${member.name}`);
  }
  return members.map(member => member.name);
}
