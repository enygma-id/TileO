import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { sha256File } from './release-evidence.js';
import { assertEnvironmentProtection } from './approval-decisions.js';

export const proofScripts = ['.github/workflows/release.yml', 'release-policy/release-policy.json', 'release-policy/reviewers.json', 'release-policy/test-scope.json', 'scripts/certify-release-gate.js', 'scripts/collect-human-approvals.js', 'scripts/run-approval-negative-controls.js', 'scripts/lib/approval-negative-proof.js', 'scripts/lib/release-evidence.js', 'scripts/verify-release-evidence.js', 'scripts/lib/final-sbom.js', 'scripts/lib/approval-decisions.js'];
export const attacks = [
  ['NC22-missing', 'NC22', 'missing authenticated Engineering receipt'],
  ['NC22-rejected', 'NC22', 'receipt decision is not APPROVE'],
  ['NC22-unauthorized', 'NC22', 'receipt reviewer/environment is not authorized'],
  ['NC23-candidate', 'NC23', 'authorization subject/core digest mismatch'],
  ['NC23-core', 'NC23', 'authorization subject/core digest mismatch'],
  ['NC24-run', 'NC24', 'authorization is not bound to this GitHub Actions run/attempt/repository'],
  ['NC24-attempt', 'NC24', 'authorization is not bound to this GitHub Actions run/attempt/repository'],
];
export const implementationHashes = root => Object.fromEntries(proofScripts.map(p => [p, sha256File(path.join(root, p))]));
export function requireTrustedProof(root,candidate,proofRun,environment,fetcher=fetchTrustedProof,storage) {
  if(!proofRun)throw Error('mandatory trusted NC22–NC24 proof run is required');
  if(environment.GITHUB_ACTIONS!=='true'||environment.TILEO_PUBLISH!=='true')throw Error('production authorization requires protected publish=true context');
  return fetcher(root,candidate,proofRun,environment.GITHUB_RUN_ID,undefined,storage);
}
export function validateProof(directory, context) {
  const r = JSON.parse(fs.readFileSync(path.join(directory, 'receipt.json')));
  const fail = message => { throw Error(`NC22–NC24 proof: ${message}`); };
  if (r.schema !== 'tileo-approval-negative-proof@1' || r.status !== 'VERIFIED' || r.publish !== false) fail('missing, failed or pending receipt');
  if (r.repository !== context.repository || r.commit !== context.commit || String(r.workflow_run_id) !== String(context.run_id) || r.run_attempt !== 1) fail('subject/run/attempt mismatch');
  const age = context.now - Date.parse(r.completed_at);
  if (!Number.isFinite(age) || age < 0 || age > 7 * 86400000) fail('stale/future receipt (maximum age seven days)');
  if (JSON.stringify(r.implementation_hashes) !== JSON.stringify(context.implementation_hashes)) fail('implementation/policy mismatch');
  const actual = [];
  function walk(dir) { for (const entry of fs.readdirSync(dir)) { const p = path.join(dir, entry), s = fs.lstatSync(p); if (s.isSymbolicLink()) fail('symlink in proof'); if (s.isDirectory()) walk(p); else if (s.isFile()) actual.push(path.relative(directory,p).replaceAll('\\','/')); else fail('non-file proof member'); } }
  walk(directory);
  if (actual.some(p => path.basename(p) === 'release-gate-pass.json')) fail('production PASS output present');
  const expected = new Set(['receipt.json']);
  for (const f of r.files ?? []) {
    if (!f.path || f.path.startsWith('/') || f.path.includes('\\') || f.path.split('/').includes('..') || expected.has(f.path)) fail('unsafe/duplicate path');
    expected.add(f.path);
    const p = path.join(directory, f.path);
    if (fs.statSync(p).size !== f.bytes || sha256File(p) !== f.sha256) fail('raw evidence hash mismatch');
  }
  if (actual.length !== expected.size || actual.some(p => !expected.has(p))) fail('file coverage mismatch');
  const c = JSON.parse(fs.readFileSync(path.join(directory, 'context/candidate.json')));
  if (c.candidate_id !== r.candidate_id || c.commit !== r.commit || c.image_id !== r.image_id || sha256File(path.join(directory,'context/core-evidence-manifest.json')) !== r.core_evidence_sha256) fail('dry-run core/candidate mismatch');
  const manifest=JSON.parse(fs.readFileSync(path.join(directory,'context/core-evidence-manifest.json')));
  if(manifest.commit!==r.commit||manifest.image_id!==r.image_id||manifest.candidate_id!==r.candidate_id)fail('manifest subject mismatch');
  const run = JSON.parse(fs.readFileSync(path.join(directory,'context/run.json')));
  if (String(run.id) !== String(context.run_id) || run.head_sha !== r.commit || run.run_attempt !== 1 || run.repository?.full_name !== r.repository) fail('recorded GitHub context mismatch');
  for(const [name,config] of Object.entries(context.reviewers.environments))assertEnvironmentProtection(config,JSON.parse(fs.readFileSync(path.join(directory,`context/environment-${name}.json`))));
  const baseline = JSON.parse(fs.readFileSync(path.join(directory,'baseline/eligibility-report.json')));
  const subjectMatches=report=>report.candidate_id===r.candidate_id&&report.commit===r.commit&&report.image_id===r.image_id;
  if(baseline.status!=='BLOCKED'||!subjectMatches(baseline))fail('baseline subject/status mismatch');
  const collectorCommand = JSON.parse(fs.readFileSync(path.join(directory,'logs/collector.command.json')));
  const baselineCommand = JSON.parse(fs.readFileSync(path.join(directory,'logs/baseline.command.json')));
  if(collectorCommand.exit_code!==0||!collectorCommand.command.includes('scripts/collect-human-approvals.js')||baselineCommand.exit_code!==1||!baselineCommand.command.includes('scripts/certify-release-gate.js'))fail('actual collector/certifier baseline missing');
  if (baseline.passed_checks.join(',') !== ['G1_SOURCE','G2_IMAGE','G3_EVIDENCE','G4_INVENTORY_SBOM','G5_TESTS','G6_EXCEPTIONS','G7_HUMAN'].join(',') || baseline.failures.length !== 1 || !baseline.failures[0].startsWith('G8_NEGATIVE_PROOF:')) fail('baseline did not reach genuine positive G7');
  if (r.controls?.length !== attacks.length) fail('incomplete controls');
  for (let i=0;i<attacks.length;i++) {
    const [name,id,reason] = attacks[i], x = r.controls[i];
    if (x.name !== name || x.id !== id || x.status !== 'PASS' || x.exit_code !== 1 || x.expected_reason !== reason || x.production_pass_present !== false) fail('failed/pending/invalid control');
    if(x.stdout!==`logs/${name}.stdout.log`||x.stderr!==`logs/${name}.stderr.log`)fail('invalid raw log reference');
    const command=JSON.parse(fs.readFileSync(path.join(directory,`logs/${name}.command.json`)));
    if(command.exit_code!==1||command.signal!==null||!command.command.includes('scripts/certify-release-gate.js')||!command.command.includes('--enforce-human-approval'))fail('actual rejection command missing');
    const report = JSON.parse(fs.readFileSync(path.join(directory,`${name}/eligibility-report.json`)));
    if(report.status!=='BLOCKED'||!subjectMatches(report))fail('rejection subject/status mismatch');
    const logs = fs.readFileSync(path.join(directory,x.stdout),'utf8') + fs.readFileSync(path.join(directory,x.stderr),'utf8');
    if (!logs.includes(`FAIL G7_HUMAN: ${reason}`) || report.failures.length !== 2 || !report.failures.some(f=>f.startsWith(`G7_HUMAN: ${reason}`)) || !report.failures.some(f=>f.startsWith('G8_NEGATIVE_PROOF:'))) fail('wrong rejection or precondition failure');
  }
  return r;
}

export function fetchTrustedProof(root, candidate, proofRun, currentRun, api = endpoint => execFileSync('gh',['api',endpoint],{maxBuffer:64*1024*1024}), storage) {
  if (!/^\d+$/.test(String(proofRun)) || String(proofRun) === String(currentRun)) throw Error('A prior completed publish=false proof run is required');
  const json = endpoint => JSON.parse(api(endpoint).toString());
  const prefix = `repos/${candidate.repository}`;
  const run = json(`${prefix}/actions/runs/${proofRun}`);
  if (run.head_sha !== candidate.commit || run.repository?.full_name !== candidate.repository || run.head_branch !== 'main' || run.path !== '.github/workflows/release.yml' || run.event !== 'workflow_dispatch' || run.run_attempt !== 1 || run.status !== 'completed' || run.conclusion !== 'success') throw Error('Untrusted or unsuccessful proof workflow/commit/attempt');
  const list = json(`${prefix}/actions/runs/${proofRun}/artifacts?per_page=100`);
  const matches = list.artifacts?.filter(a=>a.name==='tileo-approval-negative-proof' && !a.expired) ?? [];
  if (matches.length !== 1 || list.total_count > 100) throw Error('Missing/ambiguous trusted proof artifact');
  const artifact = matches[0];
  if (!/^sha256:[0-9a-f]{64}$/.test(artifact.digest ?? '') || String(artifact.workflow_run?.id) !== String(proofRun) || artifact.workflow_run?.head_sha !== candidate.commit) throw Error('Missing trusted artifact digest/subject');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(),'tileo-trusted-proof-'));
  try {
    const zip = path.join(temp,'proof.zip'), directory = path.join(temp,'proof');
    fs.writeFileSync(zip,api(`${prefix}/actions/artifacts/${artifact.id}/zip`));
    if (`sha256:${sha256File(zip)}` !== artifact.digest) throw Error('GitHub artifact digest mismatch');
    execFileSync('python3',['-c',`import zipfile,pathlib,sys,stat
z=zipfile.ZipFile(sys.argv[1]); out=pathlib.Path(sys.argv[2]); seen=set(); total=0
for i in z.infolist():
 p=pathlib.PurePosixPath(i.filename); total+=i.file_size
 assert not p.is_absolute() and '..' not in p.parts and '\\\\' not in i.filename
 assert i.filename not in seen and not stat.S_ISLNK(i.external_attr >> 16)
 assert total < 128*1024*1024
 seen.add(i.filename)
z.extractall(out)`,zip,directory]);
    const receipt = validateProof(directory,{repository:candidate.repository,commit:candidate.commit,run_id:proofRun,now:Date.now(),implementation_hashes:implementationHashes(root),reviewers:JSON.parse(fs.readFileSync(path.join(root,'release-policy/reviewers.json')))});
    if(storage)fs.copyFileSync(zip,path.join(storage,`negative-proof-${proofRun}.zip`),fs.constants.COPYFILE_EXCL);
    return { run_id:Number(proofRun), artifact_id:artifact.id, artifact_digest:artifact.digest, dry_run_subject:{candidate_id:receipt.candidate_id,image_id:receipt.image_id,core_evidence_sha256:receipt.core_evidence_sha256} };
  } finally { fs.rmSync(temp,{recursive:true,force:true}); }
}
