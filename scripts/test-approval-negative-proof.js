// TEST FIXTURES — no actual approval or protected-run PASS is asserted.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { attacks, validateProof, fetchTrustedProof, implementationHashes, requireTrustedProof } from './lib/approval-negative-proof.js';
import { sha256File, listFiles } from './lib/release-evidence.js';
import { decisionCommentValid, assertEnvironmentProtection } from './lib/approval-decisions.js';
function fixture() {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'approval-proof-TEST-'));
 const put=(p,value)=>{fs.mkdirSync(path.dirname(path.join(dir,p)),{recursive:true});fs.writeFileSync(path.join(dir,p),typeof value==='string'?value:JSON.stringify(value));};
 const context={repository:'test/fixture',commit:'1'.repeat(40),run_id:12,now:Date.now(),implementation_hashes:implementationHashes(process.cwd())};
 context.reviewers=JSON.parse(fs.readFileSync('release-policy/reviewers.json'));
 for(const [name,config] of Object.entries(context.reviewers.environments))put(`context/environment-${name}.json`,{id:config.environment_id,can_admins_bypass:false,deployment_branch_policy:{protected_branches:true},protection_rules:[{type:'required_reviewers',prevent_self_review:true,reviewers:config.authorized_reviewers.map(id=>({type:'User',reviewer:{id}}))}]});
 const c={candidate_id:'TEST-CANDIDATE',commit:context.commit,image_id:'sha256:'+'2'.repeat(64)};
 put('context/candidate.json',c);put('context/core-evidence-manifest.json',{...c,TEST_FIXTURE:true});
 put('context/run.json',{id:12,head_sha:context.commit,run_attempt:1,repository:{full_name:context.repository}});
 put('baseline/eligibility-report.json',{...c,status:'BLOCKED',passed_checks:['G1_SOURCE','G2_IMAGE','G3_EVIDENCE','G4_INVENTORY_SBOM','G5_TESTS','G6_EXCEPTIONS','G7_HUMAN'],failures:['G8_NEGATIVE_PROOF: mandatory trusted proof required']});
 put('logs/collector.command.json',{exit_code:0,command:['node','scripts/collect-human-approvals.js']});
 put('logs/baseline.command.json',{exit_code:1,command:['node','scripts/certify-release-gate.js']});
 const controls=attacks.map(([name,id,reason])=>{
  put(`${name}/eligibility-report.json`,{...c,status:'BLOCKED',failures:[`G7_HUMAN: ${reason}`,'G8_NEGATIVE_PROOF: mandatory trusted proof required']});
  put(`logs/${name}.stdout.log`,'TEST FIXTURE\n');put(`logs/${name}.stderr.log`,`FAIL G7_HUMAN: ${reason}`);
  put(`logs/${name}.command.json`,{exit_code:1,signal:null,command:['node','scripts/certify-release-gate.js','--enforce-human-approval']});
  return {name,id,status:'PASS',exit_code:1,expected_reason:reason,production_pass_present:false,stdout:`logs/${name}.stdout.log`,stderr:`logs/${name}.stderr.log`};
 });
 const r={schema:'tileo-approval-negative-proof@1',status:'VERIFIED',publish:false,repository:context.repository,commit:context.commit,workflow_run_id:12,run_attempt:1,completed_at:new Date(context.now).toISOString(),implementation_hashes:context.implementation_hashes,...c,core_evidence_sha256:sha256File(path.join(dir,'context/core-evidence-manifest.json')),controls};
 function seal(){r.files=listFiles(dir).filter(p=>p!==path.join(dir,'receipt.json')).map(p=>({path:path.relative(dir,p).replaceAll('\\','/'),bytes:fs.statSync(p).size,sha256:sha256File(p)}));put('receipt.json',r);}
 seal();return {dir,r,context,put,seal};
}
function check(name,fn){test(name,()=>{const f=fixture();try{fn(f);}finally{fs.rmSync(f.dir,{recursive:true});}});}
test('live environment protection drift rejects authorization',()=>{
 const config={environment_id:1,authorized_reviewers:[2]};
 const env={id:1,can_admins_bypass:false,deployment_branch_policy:{protected_branches:true},protection_rules:[{type:'required_reviewers',prevent_self_review:true,reviewers:[{type:'User',reviewer:{id:2}}]}]};
 assert.doesNotThrow(()=>assertEnvironmentProtection(config,env));
 assert.throws(()=>assertEnvironmentProtection(config,{...env,can_admins_bypass:true}),/protections/);
 assert.throws(()=>assertEnvironmentProtection(config,{...env,protection_rules:[]}),/protections/);
});
test('authenticated review also requires explicit Compare and rights/exception decisions',()=>{
 assert.equal(decisionCommentValid('Engineering','candidate core APPROVE'),false);
 assert.equal(decisionCommentValid('Engineering','candidate core COMPARE_SCOPE=ACCEPT_EXCLUSION'),true);
 assert.equal(decisionCommentValid('Legal-IP','RIGHTS=APPROVE'),false);
 assert.equal(decisionCommentValid('Legal-IP','RIGHTS=APPROVE EXCEPTIONS=EXC-001,EXC-002,EXC-003'),true);
 assert.equal(decisionCommentValid('Release-Steward','REVIEW=ACCEPT'),true);
});
test('production proof guard rejects missing proof and local/dry-run authorization',()=>{
 const env={GITHUB_ACTIONS:'true',TILEO_PUBLISH:'true',GITHUB_RUN_ID:'56'};
 assert.throws(()=>requireTrustedProof('.',{},null,env),/mandatory/);
 assert.throws(()=>requireTrustedProof('.',{},'12',{...env,TILEO_PUBLISH:'false'}),/publish=true/);
 assert.throws(()=>requireTrustedProof('.',{},'12',{...env,GITHUB_ACTIONS:'false'}),/protected/);
 const verified={TEST_ONLY:true};assert.equal(requireTrustedProof('.',{},'12',env,()=>verified),verified);
});
check('valid external receipt covers all rejection variants and raw records',f=>assert.equal(validateProof(f.dir,f.context).status,'VERIFIED'));
for(const status of ['FAILED','PENDING'])check(`reject ${status} receipt`,f=>{f.r.status=status;f.seal();assert.throws(()=>validateProof(f.dir,f.context));});
check('reject missing receipt',f=>{fs.unlinkSync(path.join(f.dir,'receipt.json'));assert.throws(()=>validateProof(f.dir,f.context));});
check('reject old policy/implementation',f=>{f.r.implementation_hashes={wrong:'0'.repeat(64)};f.seal();assert.throws(()=>validateProof(f.dir,f.context),/policy/);});
check('reject stale proof',f=>{f.r.completed_at='2000-01-01T00:00:00Z';f.seal();assert.throws(()=>validateProof(f.dir,f.context),/stale/);});
check('reject wrong candidate/core subject',f=>{f.r.core_evidence_sha256='0'.repeat(64);f.seal();assert.throws(()=>validateProof(f.dir,f.context),/core\/candidate/);});
check('reject replayed attempt',f=>{f.r.run_attempt=2;f.seal();assert.throws(()=>validateProof(f.dir,f.context),/attempt/);});
check('reject altered raw log',f=>{f.put('logs/NC22-missing.stderr.log','altered');assert.throws(()=>validateProof(f.dir,f.context),/hash/);});
check('reject unrelated dependency failure even if caller labels PASS',f=>{f.put('logs/NC22-missing.stderr.log','Docker unavailable');f.seal();assert.throws(()=>validateProof(f.dir,f.context),/wrong rejection/);});
check('reject production PASS anywhere in external proof',f=>{f.put('NC22-missing/release-gate-pass.json',{status:'FORGED'});f.seal();assert.throws(()=>validateProof(f.dir,f.context),/PASS output/);});
check('reject positive G7 baseline not actually reached',f=>{const p=JSON.parse(fs.readFileSync(path.join(f.dir,'baseline/eligibility-report.json')));p.passed_checks=[];p.failures=['Docker missing'];f.put('baseline/eligibility-report.json',p);f.seal();assert.throws(()=>validateProof(f.dir,f.context),/genuine positive G7/);});
check('trusted artifact API path validates ZIP digest and run provenance',f=>{
 const zip=path.join(os.tmpdir(),`proof-TEST-${process.pid}.zip`);
 try {
  execFileSync('python3',['-c','import zipfile,pathlib,sys\nr=pathlib.Path(sys.argv[1])\nwith zipfile.ZipFile(sys.argv[2],"w") as z:\n for p in r.rglob("*"):\n  if p.is_file(): z.write(p,p.relative_to(r))',f.dir,zip]);
  const run={id:12,head_sha:f.context.commit,repository:{full_name:'test/fixture'},head_branch:'main',path:'.github/workflows/release.yml',event:'workflow_dispatch',run_attempt:1,status:'completed',conclusion:'success'};
  const artifact={id:34,name:'tileo-approval-negative-proof',expired:false,digest:`sha256:${sha256File(zip)}`,workflow_run:{id:12,head_sha:f.context.commit}};
  const api=endpoint=>endpoint.endsWith('/zip')?fs.readFileSync(zip):Buffer.from(JSON.stringify(endpoint.includes('/artifacts?')?{total_count:1,artifacts:[artifact]}:run));
  const c={repository:'test/fixture',commit:f.context.commit};
  assert.equal(fetchTrustedProof(process.cwd(),c,12,56,api).artifact_id,34);
  artifact.digest='sha256:'+'0'.repeat(64);assert.throws(()=>fetchTrustedProof(process.cwd(),c,12,56,api),/digest mismatch/);
  run.conclusion='failure';assert.throws(()=>fetchTrustedProof(process.cwd(),c,12,56,api),/Untrusted/);
  assert.throws(()=>fetchTrustedProof(process.cwd(),c,12,12,api),/prior completed/);
 }finally{fs.rmSync(zip,{force:true});}
});
