import fs from 'node:fs';
import path from 'node:path';
import { sha256File, parseCsv } from './release-evidence.js';
export const supersededHashes = ['569ef878f97c9c35e6c3c262b33e3e354178d5a78dfcb60f4007f89c0a247eed','756bab2168ad96fff09ce15cb548743c047afdde07980a35fbcdd9e54335b6a3','ce7063d1f89dc0d556897099fc39de59a40400f72840083e539b89c632e7aa25'];
export function verifyFinalSbom(evidence) {
  const read=p=>JSON.parse(fs.readFileSync(path.join(evidence,p)));
  const c=read('candidate.json'), s=read('sbom/scanner-invocation.json'), spdx=read('sbom/sbom-image.spdx.json'), cdx=read('sbom/sbom-image.cdx.json'), inv=read('image/rootfs-files.json');
  if(s.schema!=='tileo-scanner-invocation@1'||s.scanner!=='syft'||!/^anchore\/syft@sha256:[0-9a-f]{64}$/.test(s.scanner_image)||s.image_id!==c.image_id)throw Error('Final SBOM scanner/image binding invalid');
  if(s.outputs.spdx!==sha256File(path.join(evidence,'sbom/sbom-image.spdx.json'))||s.outputs.cyclonedx!==sha256File(path.join(evidence,'sbom/sbom-image.cdx.json')))throw Error('Final SBOM scanner output hashes differ');
  if(spdx.spdxVersion!=='SPDX-2.3'||spdx.dataLicense!=='CC0-1.0'||!spdx.packages?.length||cdx.bomFormat!=='CycloneDX'||!/^1\.[5-9]$/.test(cdx.specVersion)||!cdx.components?.length)throw Error('Final SBOM schema/content invalid');
  const props=new Map((cdx.metadata?.properties??[]).map(p=>[p.name,p.value]));
  if(props.get('syft:image:labels:org.opencontainers.image.revision')!==c.commit||props.get('syft:image:labels:org.opencontainers.image.version')!==c.version||props.get('syft:image:labels:org.opencontainers.image.source')!==`https://github.com/${c.repository}`||cdx.metadata?.component?.version!==c.image_id.replace(/^sha256:/,''))throw Error('Final SBOM commit/image labels mismatch');
  if(inv.schema!=='tileo-rootfs-inventory@1'||inv.image_id!==c.image_id||!inv.files?.length)throw Error('Final inventory subject invalid');
  if(inv.files.some(f=>/^\/app\/(baseline|docs\/history)(\/|$)/.test(f.path)||supersededHashes.includes(f.sha256)))throw Error('Superseded baseline evidence found in runtime inventory');
  for(const pattern of [/\/libstdc\+\+\.so\.6\./,/\/libgcc_s\.so\.1$/,/\/etc\/ssl\/certs\/ca-certificates\.crt$/])if(!inv.files.some(f=>pattern.test(f.path)&&/^[0-9a-f]{64}$/.test(f.sha256??'')))throw Error('Required native exception payload absent from inventory');
  const decisions=parseCsv(fs.readFileSync(path.join(evidence,'image/license-decisions.csv'),'utf8')).filter(r=>r.Verdict==='ALLOW (Disclosed Exception)');
  if(decisions.length!==3||decisions.map(r=>r.Component).sort().join(',')!=='ca-certificates,libgcc,libstdc++')throw Error('Required native exceptions differ');
  return {status:'FINAL_CANDIDATE_SBOM_VERIFIED',commit:c.commit,image_id:c.image_id,scanner:s.scanner_image,outputs:s.outputs};
}
