// TEST FIXTURES ONLY, never substituted for scanner output.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {verifyFinalSbom,supersededHashes} from './lib/final-sbom.js';
import {sha256File} from './lib/release-evidence.js';
function fixture(fn){const root=fs.mkdtempSync(path.join(os.tmpdir(),'sbom-TEST-'));try{
 const put=(p,d)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),typeof d==='string'?d:JSON.stringify(d));};
 const c={image_id:'sha256:'+'f'.repeat(64),commit:'a'.repeat(40),repository:'test/fixture',version:'0.1.0'};
 const cdx={bomFormat:'CycloneDX',specVersion:'1.6',components:[{name:'TEST'}],metadata:{component:{version:'f'.repeat(64)},properties:Object.entries({revision:c.commit,version:c.version,source:`https://github.com/${c.repository}`}).map(([k,v])=>({name:'syft:image:labels:org.opencontainers.image.'+k,value:v}))}};
 const inv={schema:'tileo-rootfs-inventory@1',image_id:c.image_id,files:['/usr/lib/libstdc++.so.6.0.33','/usr/lib/libgcc_s.so.1','/etc/ssl/certs/ca-certificates.crt'].map(p=>({path:p,sha256:'1'.repeat(64)}))};
 const s={schema:'tileo-scanner-invocation@1',scanner:'syft',scanner_image:'anchore/syft@sha256:'+'2'.repeat(64),image_id:c.image_id};
 put('candidate.json',c);put('sbom/sbom-image.spdx.json',{spdxVersion:'SPDX-2.3',dataLicense:'CC0-1.0',packages:[{name:'TEST'}]});put('sbom/sbom-image.cdx.json',cdx);put('image/rootfs-files.json',inv);
 put('image/license-decisions.csv','Component,Verdict\nlibstdc++,ALLOW (Disclosed Exception)\nlibgcc,ALLOW (Disclosed Exception)\nca-certificates,ALLOW (Disclosed Exception)\n');
 const seal=()=>{s.outputs={spdx:sha256File(path.join(root,'sbom/sbom-image.spdx.json')),cyclonedx:sha256File(path.join(root,'sbom/sbom-image.cdx.json'))};put('sbom/scanner-invocation.json',s);};seal();fn({root,put,c,cdx,inv,s,seal});
}finally{fs.rmSync(root,{recursive:true});}}
test('final evidence schema/hash/image/commit and required native exceptions pass',()=>fixture(f=>assert.equal(verifyFinalSbom(f.root).image_id,f.c.image_id)));
test('reject altered SBOM despite parseable JSON',()=>fixture(f=>{f.put('sbom/sbom-image.cdx.json',{...f.cdx,serialNumber:'changed'});assert.throws(()=>verifyFinalSbom(f.root),/hashes/);}));
test('reject self-consistent wrong-image metadata',()=>fixture(f=>{f.cdx.metadata.component.version='0'.repeat(64);f.put('sbom/sbom-image.cdx.json',f.cdx);f.seal();assert.throws(()=>verifyFinalSbom(f.root),/labels/);}));
test('reject old baseline payload even when renamed',()=>fixture(f=>{f.inv.files.push({path:'/app/renamed.json',sha256:supersededHashes[0]});f.put('image/rootfs-files.json',f.inv);assert.throws(()=>verifyFinalSbom(f.root),/Superseded/);}));
test('reject missing required exception binary',()=>fixture(f=>{f.inv.files.shift();f.put('image/rootfs-files.json',f.inv);assert.throws(()=>verifyFinalSbom(f.root),/exception payload/);}));
test('reject disclosed exceptions outside approved set',()=>fixture(f=>{f.put('image/license-decisions.csv','Component,Verdict\nother,ALLOW (Disclosed Exception)\n');assert.throws(()=>verifyFinalSbom(f.root),/exceptions differ/);}));
