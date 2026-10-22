import { fork, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const children = new Set<ChildProcess>();
let stopping = false;
function launch(name: string) {
  if (stopping) return;
  const child = fork(fileURLToPath(new URL(`./${name}.js`, import.meta.url)), [], { stdio: 'inherit', execArgv: [], windowsHide: true });
  children.add(child);
  child.on('exit', () => { children.delete(child); if (!stopping) setTimeout(() => launch(name), 5000); });
}
for (const name of ['api', 'worker']) launch(name);
function stop() { stopping = true; for (const child of children) child.kill('SIGTERM'); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
