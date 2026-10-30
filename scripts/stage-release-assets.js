#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {parseArgs,sha256File} from './lib/release-evidence.js';
import {assetPaths,validateAssets} from './lib/release-assets.js';
const o=parseArgs(process.argv.slice(2),{'--evidence-dir':'required','--closure':'required','--out-dir':'required'});
const evidence=path.resolve(o['evidence-dir']),out=path.resolve(o['out-dir']),closure=path.resolve(o.closure);
if(out===evidence||out.startsWith(evidence+path.sep))throw Error('Staging must remain outside frozen core');
const c=JSON.parse(fs.readFileSync(path.join(evidence,'candidate.json')));
fs.mkdirSync(out,{recursive:false});
for(const [name,relative] of Object.entries(assetPaths(c.version)))fs.copyFileSync(path.join(evidence,relative),path.join(out,name),fs.constants.COPYFILE_EXCL);
fs.copyFileSync(closure,path.join(out,`TileO-v${c.version}-Release-Closure.tar.gz`),fs.constants.COPYFILE_EXCL);
fs.writeFileSync(path.join(out,'SHA256SUMS'),fs.readdirSync(out).sort().map(name=>`${sha256File(path.join(out,name))}  ${name}`).join('\n')+'\n',{flag:'wx'});
const result=validateAssets(evidence,out,closure);
console.log(JSON.stringify({status:'STAGED_ASSETS_VERIFIED_NOT_AUTHORIZATION',core_evidence_sha256:result.core_evidence_sha256,assets:result.assets},null,2));
