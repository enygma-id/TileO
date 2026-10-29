#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {parseArgs} from './lib/release-evidence.js';
import {verifyFinalSbom} from './lib/final-sbom.js';
const o=parseArgs(process.argv.slice(2),{'--evidence-dir':'required'});
const result=verifyFinalSbom(o['evidence-dir']);
fs.writeFileSync(path.join(o['evidence-dir'],'sbom/final-verification.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result,null,2));
