#!/usr/bin/env node
// Read-only administrative evidence. Does not configure settings or approve.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {parseArgs,sha256File} from './lib/release-evidence.js';
const o=parseArgs(process.argv.slice(2),{'--out-dir':'required','--write-policy':'boolean'}),out=path.resolve(o['out-dir']);
fs.mkdirSync(out,{recursive:false});
const p=JSON.parse(fs.readFileSync('release-policy/reviewers.json'));
const report={status:'BLOCKED',repository:p.repository,checked_at:new Date().toISOString(),policy_sha256:sha256File('release-policy/reviewers.json'),evidence:[],failures:[]};
try {
 if(!['CONFIGURED','PENDING_LIVE_PROTECTION_VERIFICATION'].includes(p.status))throw Error('Administrator must configure authenticated reviewer/environment IDs first');
 const get=(endpoint,name)=>{
  const raw=execFileSync('gh',['api',`repos/${p.repository}/${endpoint}`],{encoding:'utf8'}),file=path.join(out,name+'.json');
  fs.writeFileSync(file,raw,{flag:'wx'});report.evidence.push({path:path.basename(file),sha256:sha256File(file)});return JSON.parse(raw);
 };
 const branch=get('branches/main/protection','main-protection');
 if(!branch.enforce_admins?.enabled||!branch.required_pull_request_reviews||branch.required_pull_request_reviews.required_approving_review_count<1||branch.allow_force_pushes?.enabled||branch.allow_deletions?.enabled)throw Error('main protection/review/admin enforcement is insufficient');
 const roles=new Map();
 for(const [name,config] of Object.entries(p.environments)) {
  const env=get(`environments/${encodeURIComponent(name)}`,name);
  const rule=env.protection_rules?.find(r=>r.type==='required_reviewers');
  if(String(env.id)!==String(config.environment_id)||env.can_admins_bypass!==false||rule?.prevent_self_review!==true||env.deployment_branch_policy?.protected_branches!==true)throw Error(`${name}: environment protection/ID mismatch`);
  const actual=(rule.reviewers??[]).filter(r=>r.type==='User').map(r=>String(r.reviewer.id)).sort();
  if(!actual.length||JSON.stringify(actual)!==JSON.stringify(config.authorized_reviewers.map(String).sort()))throw Error(`${name}: live user reviewer IDs differ from configured policy`);
  roles.set(config.role,actual);
 }
 if(!roles.has('Engineering')||!roles.has('Legal-IP')||!roles.has('Release-Steward')||!roles.get('Engineering').some(id=>roles.get('Legal-IP').some(other=>other!==id)))throw Error('Configured Engineering and Legal-IP reviewers cannot supply distinct humans');
 report.status='PROTECTIONS_VERIFIED';
}catch(error){report.failures.push(error.message);}
fs.writeFileSync(path.join(out,'protection-check.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
if(report.status==='PROTECTIONS_VERIFIED'&&o['write-policy']) {
 p.status='CONFIGURED';p.configuration_evidence={checked_at:report.checked_at,report_sha256:sha256File(path.join(out,'protection-check.json'))};
 fs.writeFileSync('release-policy/reviewers.json',JSON.stringify(p,null,2)+'\n');
 console.log('Local policy updated from verified live settings; review/commit this source change before any new candidate.');
}
console.log(report.status,report.failures.join('; '));if(report.failures.length)process.exitCode=1;
