#!/usr/bin/env node
import { mkdir, readFile, writeFile, stat, copyFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, promisify } from 'node:util';
import { execFile, execFileSync } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import { Document, NodeIO } from '@gltf-transform/core';
import { validateArtifact, toolDirectory } from './lib/output-validation.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const {values}=parseArgs({options:{'out-dir':{type:'string'}}});
const out=resolve(values['out-dir']||join(root,'artifacts/output-conformance',new Date().toISOString().replace(/[:.]/g,'-')));
await mkdir(out,{recursive:true});
process.env.TILEO_DATA_DIR=join(out,'app-data');
const {config,initializeData}=await import('../dist/config.js');
Object.assign(config,{data:process.env.TILEO_DATA_DIR,token:'',host:'127.0.0.1',origin:'',production:false,outputValidation:'builtin',reserveBytes:0});
initializeData();
const {run}=await import('../dist/process.js');
const {raster}=await import('../dist/raster.js');
const {vector}=await import('../dist/vector.js');
const {inspect}=await import('../dist/inspect.js');
const {validate}=await import('../dist/validate.js');
const {exportPmtiles}=await import('../dist/pmtiles.js');
const {buildElevation,buildScientific}=await import('../dist/elevation.js');
const {build3dTiles}=await import('../dist/model3d.js');
const {readGltfCompanion}=await import('../dist/model3d-package.js');
const {parseOptions}=await import('../dist/types.js');
const work={timeoutMs:90_000,log:join(out,'generation.log')},noop=()=>{};
const cases=[];
const rgb=Buffer.alloc(64*64*3);for(let i=0;i<rgb.length;i++)rgb[i]=i%251;
await writeFile(join(out,'source.ppm'),Buffer.concat([Buffer.from('P6\n64 64\n255\n'),rgb]));
await run('gdal_translate',['-a_srs','EPSG:4326','-a_ullr','119.35','-5.12','119.43','-5.20',join(out,'source.ppm'),join(out,'imagery.tif')],work);
for(const format of ['png','jpeg','webp']) {
 const path=join(out,`imagery-${format}.mbtiles`),options=parseOptions({minZoom:5,maxZoom:6,tileFormat:format});
 await raster(join(out,'imagery.tif'),path,options,work,noop);
 cases.push({name:'mbtiles-'+format,input:path,kind:'raster',options,metadata:validate(path,'raster',options)});
 if(format==='png') { const target=join(out,'raster.pmtiles');await exportPmtiles(path,target);cases.push({name:'pmtiles-raster',input:target,kind:'pmtiles',reference:path}); }
}
const geojson=join(out,'source.geojson');
await writeFile(geojson,JSON.stringify({type:'FeatureCollection',features:[1,2].map(id=>({type:'Feature',properties:{id,label:`parcel-${id}`},geometry:{type:'Polygon',coordinates:[[[119.35+id*.01,-5.14],[119.355+id*.01,-5.14],[119.355+id*.01,-5.145],[119.35+id*.01,-5.14]]]}}))}));
{
 const options=parseOptions({minZoom:5,maxZoom:6,vectorEngine:'gdal',vectorPreset:'density'}),path=join(out,'vector.mbtiles');
 const info=await inspect(geojson,options,work);
 await vector(geojson,path,out,info,options,work,noop);
 cases.push({name:'mbtiles-vector',input:path,kind:'vector',reference:geojson,options,metadata:validate(path,'vector',options)});
 const target=join(out,'vector.pmtiles');await exportPmtiles(path,target);cases.push({name:'pmtiles-vector',input:target,kind:'pmtiles',reference:path});
}
for(const [name,scientific] of [['numeric',false],['scientific',true]]) {
 const ascii=join(out,name+'.asc'),tif=join(out,name+'.tif');
 await writeFile(ascii,'ncols 8\nnrows 8\nxllcorner 119.35\nyllcorner -5.2\ncellsize 0.01\nNODATA_value -9999\n'+Array.from({length:8},(_,y)=>Array.from({length:8},(_,x)=>x===0&&y===0?-9999:scientific?(x-y)/8:100.125).join(' ')).join('\n'));
 await run('gdal_translate',['-a_srs','EPSG:4326','-ot','Float32',ascii,tif],work);
 if(scientific) {
  const options=parseOptions({pipeline:'scientific',rasterPurpose:'scientific'}),path=join(out,'scientific');
  const metadata=await buildScientific(tif,path,options,work,noop);cases.push({name:'scientific-cog',input:path,kind:'scientific',reference:tif,options,metadata});
 } else for(const format of ['cog','terrain-rgb','terrarium']) {
  const options=parseOptions({pipeline:'elevation',elevationOutput:format,elevationKind:'dtm',elevationUnit:'m',heightReference:'orthometric',...(format==='cog'?{}:{terrainNoDataHeight:-100.025,minZoom:5,maxZoom:6,exportPmtiles:true})}),path=join(out,format);
  const metadata=await buildElevation(tif,path,options,work,noop);cases.push({name:format,input:path,kind:'elevation',reference:tif,options,metadata});
 }
}
{
 const doc=new Document(),buffer=doc.createBuffer();
 const position=doc.createAccessor().setType('VEC3').setArray(new Float32Array([0,0,0,1,0,0,0,1,0])).setBuffer(buffer);
 const normal=doc.createAccessor().setType('VEC3').setArray(new Float32Array([0,0,1,0,0,1,0,0,1])).setBuffer(buffer);
 const mesh=doc.createMesh().addPrimitive(doc.createPrimitive().setAttribute('POSITION',position).setAttribute('NORMAL',normal)),scene=doc.createScene();
 for(let i=0;i<9;i++)scene.addChild(doc.createNode().setMesh(mesh).setTranslation([i*10,0,0]));doc.getRoot().setDefaultScene(scene);
 const source=join(out,'original.glb');await new NodeIO().write(source,doc);
 const options=parseOptions({latitude:-5.15,longitude:119.42,height:10,exportB3dm:true},true),path=join(out,'model3d');
 const metadata=await build3dTiles(source,path,options);cases.push({name:'3dtiles-1.1-and-1.0',input:path,kind:'model3d',options,metadata});
 const companion=await readGltfCompanion(source),bytes=await readFile(source);
 await writeFile(join(out,'original.gltf'),companion.json);await writeFile(join(out,'original.bin'),bytes.subarray(companion.binOffset,companion.binOffset+companion.binLength));
 cases.push({name:'original-glb',input:source,kind:'glb'},{name:'gltf-companion',input:join(out,'original.gltf'),kind:'gltf'});
}
const results=[];
for(const item of cases) {
 const result=await validateArtifact({...item,report:join(out,item.name+'.validation.json')});results.push(result);
 if (['terrain-rgb','terrarium'].includes(item.name)) {
  const heights=result.checks.find(check=>check.name==='terrain')?.details?.height_samples||[];
  const tolerance=item.name==='terrain-rgb'?.050001:1/512+.000001;
  const passed=heights.length>0&&heights.every(value=>Math.min(Math.abs(value-100.125),Math.abs(value+100.025))<=tolerance)&&heights.some(value=>Math.abs(value-100.125)<=tolerance)&&heights.some(value=>Math.abs(value+100.025)<=tolerance);
  result.checks.push({name:'terrain-reference-values',status:passed?'passed':'failed',details:{heights,tolerance}});
  if(!passed)result.status='failed';
  await writeFile(join(out,item.name+'.validation.json'),JSON.stringify(result,null,2)+'\n');
 }
 console.log(`${item.name}: ${result.status}`);
}
// Exercise the real API's PNG WMTS binding using a synthetic job, not user data.
const {Jobs}=await import('../dist/jobs.js'),{createApp}=await import('../dist/api.js');
const jobs=new Jobs();jobs.acquire('conformance');const png=cases.find(c=>c.name==='mbtiles-png'),id=randomUUID(),output=id+'.mbtiles';
await copyFile(png.input,join(config.data,'output',output));
jobs.enqueue({id,filename:'conformance.tif',input:'fixture.tif',size:1,sha256:'synthetic',options:png.options});
const claimed=jobs.claim('conformance');jobs.finish(id,claimed.attempt,'conformance',output,png.metadata);jobs.release('conformance');
const app=await createApp(jobs);
try {
 await app.listen({host:'127.0.0.1',port:0});const address=app.server.address();
 const url=`http://127.0.0.1:${address.port}/api/jobs/${id}/wmts?SERVICE=WMTS&REQUEST=GetCapabilities`;
 let wmts;
 try { const {stdout}=await promisify(execFile)(process.env.PYTHON||'python3',[join(root,'scripts/lib/output-wmts.py'),'--capabilities',url,'--tools-dir',toolDirectory(),'--report-dir',join(out,'wmts')],{timeout:240_000,maxBuffer:1024**2});wmts=JSON.parse(stdout); }
 catch(error) { wmts=JSON.parse(await readFile(join(out,'wmts/summary.json')).catch(()=>Buffer.from(JSON.stringify({status:'failed',error:error.message})))); }
 results.push({kind:'wmts',...wmts});
} finally {await app.close();}
const hash=path=>readFile(path).then(bytes=>createHash('sha256').update(bytes).digest('hex'));
const identities=await Promise.all(cases.filter(c=>extnameSafe(c.input)).map(async c=>({name:c.name,sha256:await hash(c.input)})));
function extnameSafe(path){return /\.(?:tif|mbtiles|pmtiles|glb|gltf)$/.test(path);}
const sourceFiles=['dist/model3d.js','dist/elevation.js','dist/api.js','dist/wmts.js','scripts/lib/output-validation.js','scripts/lib/output-raster.py','scripts/lib/output-wmts.py','tools/output-validation/package-lock.json'];
const sourceHashes=Object.fromEntries(await Promise.all(sourceFiles.map(async file=>[file,await hash(join(root,file))])));
const summary={schema:'tileo-output-conformance@1',status:results.every(r=>r.status==='passed')?'passed':'failed',commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),node:process.version,sourceHashes,results,identities};
await writeFile(join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(`Conformance ${summary.status}: ${out}`);if(summary.status!=='passed')process.exitCode=1;
