import { exec, fork, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const children = new Set<ChildProcess>();
let stopping = false;
let browserOpened = false;

export function getBrowserCommand(url: string, platform = process.platform): string {
  // ponytail: platform command runner ceiling; upgrade to open npm package if custom browser selection needed
  if (platform === 'win32') return `start "" "${url}"`;
  if (platform === 'darwin') return `open "${url}"`;
  return `xdg-open "${url}"`;
}

function openBrowser(url: string) {
  if (process.env.CI || process.env.TILEO_NO_BROWSER === '1' || process.env.NODE_ENV === 'test') return;
  if (process.platform === 'linux' && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) return;
  try {
    exec(getBrowserCommand(url), () => {});
  } catch {
    // non-fatal
  }
}

function launch(name: string) {
  if (stopping) return;
  const child = fork(fileURLToPath(new URL(`./${name}.js`, import.meta.url)), [], { stdio: 'inherit', execArgv: [], windowsHide: true });
  children.add(child);
  if (name === 'api') {
    child.on('message', (msg: any) => {
      if (msg?.type === 'ready' && !browserOpened) {
        browserOpened = true;
        const host = msg.host === '0.0.0.0' || msg.host === '::' ? 'localhost' : msg.host;
        const url = msg.origin || `http://${host}:${msg.port}`;
        console.log(`TileO Console listening at ${url}`);
        openBrowser(url);
      }
    });
  }
  child.on('exit', () => { children.delete(child); if (!stopping) setTimeout(() => launch(name), 5000); });
}

for (const name of ['api', 'worker']) launch(name);
function stop() { stopping = true; for (const child of children) child.kill('SIGTERM'); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);

