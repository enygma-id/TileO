#!/usr/bin/env node
// Read-only validation of trusted Actions proof; never grants authorization.
import fs from 'node:fs';
import path from 'node:path';
import {parseArgs} from './lib/release-evidence.js';
import {fetchTrustedProof} from './lib/approval-negative-proof.js';
const o=parseArgs(process.argv.slice(2),{'--candidate':'required','--run-id':'required','--out-dir':'required'});
const evidence=path.dirname(path.resolve(o.candidate)),out=path.resolve(o['out-dir']);
if(out===evidence||out.startsWith(evidence+path.sep))throw Error('Proof receipt must remain outside frozen core');
fs.mkdirSync(out,{recursive:false});
let result;
try {
 const proof=fetchTrustedProof(process.cwd(),JSON.parse(fs.readFileSync(o.candidate)),o['run-id'],process.env.GITHUB_RUN_ID??'local-read-only',undefined,out);
 result={status:'NEGATIVE_PROOF_VALIDATED_NOT_AUTHORIZATION',proof};
}catch(error){result={status:'BLOCKED',reason:error.message};process.exitCode=1;}
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result,null,2));
