#!/usr/bin/env python3
"""Operational acceptance of documented Compose API+worker startup. User terminal only."""
import datetime,hashlib,json,os,pathlib,shutil,subprocess,sys,time,urllib.parse,urllib.request
root=pathlib.Path.cwd();ops=root/'scripts'
run=pathlib.Path(os.environ['TILEO_RUN']);evidence=pathlib.Path(os.environ['TILEO_EVIDENCE']);image=os.environ['TILEO_IMAGE_ID'];commit=os.environ['TILEO_COMMIT']
project='tileo-check-'+run.name.lower();out=evidence/'tests/distribution';out.mkdir(parents=True,exist_ok=False)
logs=run/'logs/distribution';override=run/'compose-smoke-override.json'
override.write_text(json.dumps({'services':{'api':{'image':image},'worker':{'image':image}}},indent=2)+'\n')
shutil.copy2(__file__,out/'runner.py');shutil.copy2(override,out/'compose-override.json');shutil.copy2(root/'compose.yaml',out/'compose.yaml')
env={**os.environ,'NODE_ENV':'development','TILEO_PORT':'8092','TILEO_BIND_ADDRESS':'127.0.0.1','TILEO_API_TOKEN':'','TILEO_S3_CONNECTIONS':''}
compose=['docker','compose','--project-name',project,'-f',str(root/'compose.yaml'),'-f',str(override)]
commands=[]
def command(name,args,required=True):
 p=subprocess.run([sys.executable,str(ops/'record-release-command.py'),str(logs),name,*args],env=env)
 record=json.loads((logs/(name+'.json')).read_text());commands.append(record)
 if required and p.returncode:raise RuntimeError(f'{name}: exit {p.returncode}')
 return pathlib.Path(record['stdout']).read_text()
base='http://127.0.0.1:8092';requests=[]
def request(path,method='GET',body=None):
 req=urllib.request.Request(base+path,data=body,method=method,headers={'content-type':'application/octet-stream'} if body is not None else {})
 with urllib.request.urlopen(req,timeout=15) as response:
  data=response.read();requests.append(dict(method=method,path=path,status=response.status,bytes=len(data),sha256=hashlib.sha256(data).hexdigest()))
  return response.status,data
started=datetime.datetime.now(datetime.timezone.utc).isoformat();error=None
try:
 command('01-compose-up',[*compose,'up','-d','--no-build','--pull','never'])
 ids=command('02-compose-ps',[*compose,'ps','--all','--quiet']).split()
 assert len(ids)==2,'Expected separate API and worker containers'
 containers=json.loads(command('03-container-inspect',['docker','inspect',*ids]))
 assert all(c['Config']['Image']==image and c['State']['Running'] for c in containers),'Container subject/running state mismatch'
 assert {tuple(c['Config']['Cmd']) for c in containers}=={('node','dist/api.js'),('node','dist/worker.js')},'Documented API/worker commands differ'
 for attempt in range(60):
  try:
   status,data=request('/healthz')
   if status==200:break
  except (OSError,TimeoutError):pass
  time.sleep(1)
 else:raise RuntimeError('Compose API health timeout')
 status,home=request('/');assert status==200
 assert b'lang="en"' in home
 fixture=json.dumps({'type':'FeatureCollection','features':[{'type':'Feature','properties':{'name':'closure-smoke'},'geometry':{'type':'Point','coordinates':[119.4,-5.15]}}]},separators=(',',':')).encode()
 (out/'fixture.geojson').write_bytes(fixture)
 query=urllib.parse.urlencode({'filename':'closure-smoke.geojson','options':json.dumps({'minZoom':0,'maxZoom':2})})
 status,data=request('/api/jobs?'+query,'POST',fixture);assert status==202
 job=json.loads(data);jobid=job['id'];(out/'submitted-job.json').write_bytes(data)
 for attempt in range(120):
  status,data=request('/api/jobs/'+jobid);job=json.loads(data)
  if job['status']=='SUCCEEDED':break
  if job['status'] in ['FAILED','CANCELLED']:raise RuntimeError('Conversion status '+job['status'])
  time.sleep(1)
 else:raise RuntimeError('Compose worker conversion timeout')
 (out/'completed-job.json').write_bytes(data)
 status,artifact=request('/api/jobs/'+jobid+'/download');assert status==200 and artifact[:16]==b'SQLite format 3\0'
 (out/'result.mbtiles').write_bytes(artifact)
except Exception as exc:
 error=f'{type(exc).__name__}: {exc}'
finally:
 for name,args in [('04-compose-logs',[*compose,'logs','--no-color']),('05-compose-down',[*compose,'down','--timeout','10'])]:
  try:
   command(name,args)
  except Exception as exc:
   error=(error+'; ' if error else '')+str(exc)
 if logs.exists():shutil.copytree(logs,out/'command-logs')
 report=dict(schema='tileo-compose-distribution-smoke@1',status='FAILED' if error else 'VERIFIED',exit_code=1 if error else 0,error=error,commit=commit,image_id=image,project=project,started_at=started,completed_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),scope='Documented Compose with separate API/worker, exact candidate image, isolated project/data volume, local development mode; no build/pull',requests=requests,commands=commands,volume_cleanup='Retained project-specific data volume; no -v or prune used')
 (out/'execution.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['status','exit_code','commit','image_id','error']},indent=2))
sys.exit(report['exit_code'])
