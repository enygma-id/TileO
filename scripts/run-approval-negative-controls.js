#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { parseArgs, sha256File, listFiles } from './lib/release-evidence.js';
import { attacks, implementationHashes, validateProof } from './lib/approval-negative-proof.js';
const o = parseArgs(process.argv.slice(2),{'--image':'required','--evidence-dir':'required','--out-dir':'required'});
if (process.env.GITHUB_ACTIONS !== 'true' || process.env.TILEO_PUBLISH !== 'false' || process.env.GITHUB_RUN_ATTEMPT !== '1') throw Error('Actual protected publish=false first attempt required');
const root = process.cwd(), evidence = path.resolve(o['evidence-dir']), out = path.resolve(o['out-dir']);
if (out===evidence || out.startsWith(evidence+path.sep)) throw Error('Proof must be external to immutable core');
fs.mkdirSync(out,{recursive:false});
const c=JSON.parse(fs.readFileSync(path.join(evidence,'candidate.json')));
const manifest=path.join(evidence,'core-evidence-manifest.json'), coreHash=sha256File(manifest);
fs.mkdirSync(path.join(out,'context')); fs.mkdirSync(path.join(out,'logs'));
fs.writeFileSync(path.join(out,'NEGATIVE-TEST-INPUTS.txt'),'ISOLATED ATTACK INPUTS — NOT PRODUCTION APPROVALS. Core remains immutable.\n');
for(const name of ['candidate.json','core-evidence-manifest.json']) fs.copyFileSync(path.join(evidence,name),path.join(out,'context',name));
for(const [name,endpoint] of [['run',`actions/runs/${process.env.GITHUB_RUN_ID}`],['history',`actions/runs/${process.env.GITHUB_RUN_ID}/approvals`]]) fs.writeFileSync(path.join(out,`context/${name}.json`),execFileSync('gh',['api',`repos/${c.repository}/${endpoint}`]));
const reviewers=JSON.parse(fs.readFileSync('release-policy/reviewers.json'));
for(const name of Object.keys(reviewers.environments))fs.writeFileSync(path.join(out,`context/environment-${name}.json`),execFileSync('gh',['api',`repos/${c.repository}/environments/${encodeURIComponent(name)}`]));
function command(name,args) {
 const started=new Date().toISOString();
 const result=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:32*1024*1024});
 fs.writeFileSync(path.join(out,`logs/${name}.stdout.log`),result.stdout??'');
 fs.writeFileSync(path.join(out,`logs/${name}.stderr.log`),result.stderr??String(result.error??''));
 fs.writeFileSync(path.join(out,`logs/${name}.command.json`),JSON.stringify({command:[process.execPath,...args],started_at:started,completed_at:new Date().toISOString(),exit_code:result.status,signal:result.signal},null,2)+'\n');
 return result;
}
const original=path.join(out,'context/original-authorization.json');
const collected=command('collector',['scripts/collect-human-approvals.js','--run-id',process.env.GITHUB_RUN_ID,'--run-attempt','1','--candidate',path.join(evidence,'candidate.json'),'--output',original]);
if(collected.status!==0) throw Error('Actual collector failed; no valid approval context for negative tests');
const auth=JSON.parse(fs.readFileSync(original));
const args=(authorization,destination)=>['scripts/certify-release-gate.js','--image',o.image,'--evidence-dir',evidence,'--out-dir',destination,'--manifest',manifest,'--enforce-human-approval','--approval-attestation',authorization];
const baseline=command('baseline',args(original,path.join(out,'baseline')));
if(baseline.status!==1) throw Error('Expected positive G1–G7 with mandatory proof guard still blocking');
const controls=[];
for(const [name,id,reason] of attacks) {
 const attack=structuredClone(auth);attack.negative_test_input='ISOLATED ATTACK — NOT AN APPROVAL';
 if(name==='NC22-missing')attack.receipts=attack.receipts.filter(x=>x.role!=='Engineering');
 if(name==='NC22-rejected')attack.receipts[0].decision='REJECT';
 if(name==='NC22-unauthorized')attack.receipts[0].reviewer_user_id=0;
 if(name==='NC23-candidate')attack.candidate_id='NEGATIVE-TEST-WRONG-CANDIDATE';
 if(name==='NC23-core')attack.core_evidence_sha256='0'.repeat(64);
 if(name==='NC24-run')attack.workflow_run_id=0;
 if(name==='NC24-attempt')attack.run_attempt=2;
 const input=path.join(out,`context/${name}-attack.json`);fs.writeFileSync(input,JSON.stringify(attack,null,2)+'\n');
 const result=command(name,args(input,path.join(out,name)));
 const exists=listFiles(out).some(file=>path.basename(file)==='release-gate-pass.json');
 const log=(result.stdout??'')+(result.stderr??'');
 controls.push({name,id,status:result.status===1&&log.includes(`FAIL G7_HUMAN: ${reason}`)&&!exists?'PASS':'FAIL',expected_reason:reason,exit_code:result.status,production_pass_present:exists,stdout:`logs/${name}.stdout.log`,stderr:`logs/${name}.stderr.log`});
}
if(sha256File(manifest)!==coreHash)throw Error('Core changed during negative tests');
const receipt={schema:'tileo-approval-negative-proof@1',status:controls.every(x=>x.status==='PASS')?'VERIFIED':'FAILED',publish:false,repository:c.repository,commit:c.commit,candidate_id:c.candidate_id,image_id:c.image_id,core_evidence_sha256:coreHash,workflow_run_id:Number(process.env.GITHUB_RUN_ID),run_attempt:1,completed_at:new Date().toISOString(),implementation_hashes:implementationHashes(root),controls,files:listFiles(out).map(file=>({path:path.relative(out,file).replaceAll('\\','/'),bytes:fs.statSync(file).size,sha256:sha256File(file)}))};
fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
validateProof(out,{repository:c.repository,commit:c.commit,run_id:process.env.GITHUB_RUN_ID,now:Date.now(),implementation_hashes:implementationHashes(root),reviewers});
console.log('NC22–NC24 protected rejection proof recorded; not production authorization');
