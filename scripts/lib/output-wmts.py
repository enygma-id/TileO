"""Run the released OGC WMTS ETS and interpret EARL, not Java's exit code."""
import argparse,json,os,pathlib,subprocess,xml.etree.ElementTree as ET
p=argparse.ArgumentParser()
p.add_argument('--capabilities',required=True)
p.add_argument('--tools-dir',required=True)
p.add_argument('--report-dir',required=True)
args=p.parse_args()
tools=pathlib.Path(args.tools_dir).resolve();out=pathlib.Path(args.report_dir).resolve();out.mkdir(parents=True,exist_ok=True)
props=out/'properties.xml';tree=ET.Element('properties')
for k,v in [('capabilities-url',args.capabilities),('acceptMediaType','application/xml')]:ET.SubElement(tree,'entry',key=k).text=v
ET.ElementTree(tree).write(props,encoding='utf-8')
cmd=[os.environ.get('JAVA','java'),'-Duser.home='+str(out),'-Djava.io.tmpdir='+str(out),'-DTE_BASE='+str(tools/'wmts-runtime'),'-cp',str(tools/'wmts-runtime'),'org.opengis.cite.wmts10.CtlController',str(props)]
result={'status':'failed','command':cmd}
try:
 with (out/'wmts.log').open('w') as log:run=subprocess.run(cmd,stdout=log,stderr=subprocess.STDOUT,timeout=180)
 reports=sorted(out.rglob('earl-results.rdf'),key=lambda f:f.stat().st_mtime)
 if run.returncode or not reports:raise RuntimeError('WMTS ETS did not produce EARL results')
 ns={'earl':'http://www.w3.org/ns/earl#','cite':'http://cite.opengeospatial.org/'}
 subject=ET.parse(reports[-1]).getroot().find('.//earl:TestSubject',ns)
 counts={e.tag.split('}')[-1]:int(e.text) for e in subject if e.tag.startswith('{'+ns['cite']+'}')}
 result['counts']=counts
 if counts.get('testsPassed',0)>0 and counts.get('testsFailed',1)==0 and counts.get('testsInheritedFailure',1)==0:result['status']='passed'
except Exception as error:result['error']=str(error)
(out/'summary.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
raise SystemExit(0 if result['status']=='passed' else 1)
