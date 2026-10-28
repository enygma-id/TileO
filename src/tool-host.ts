// Owns native process groups independently of the worker. IPC loss terminates
// the tool; geometry uses inherited descriptors, never IPC strings.
import { spawn, type ChildProcess } from 'node:child_process';
import { killProcessTree, processTreeMemoryBytes } from './resources.js';
let child: ChildProcess | undefined;
let stopping = false;
let finished = false;
let hardStop: NodeJS.Timeout | undefined;
let memoryCheck: NodeJS.Timeout | undefined;
function send(message: unknown) { if (process.connected) process.send?.(message); }
function stop() {
  if (stopping || finished) return;
  stopping = true;
  if (!child?.pid) return;
  // On Windows, terminate the direct process immediately as well as asking
  // taskkill to clean its descendants. Relying only on the asynchronous
  // taskkill helper can leave the guardian waiting forever when taskkill is
  // unavailable or delayed under a restricted service account.
  if (process.platform === 'win32') {
    try { child.kill('SIGKILL'); } catch { /* already exited */ }
  }
  void killProcessTree(child.pid);
  hardStop = setTimeout(() => { void killProcessTree(child?.pid, 'SIGKILL'); }, 3000);
}
process.on('disconnect', stop);
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
process.on('message', (message: {
  type: string; tool?: string; args?: string[]; env?: NodeJS.ProcessEnv;
  memoryBytes?: number; memoryRootPid?: number; streamInput?: boolean; streamOutput?: boolean;
}) => {
  if (message.type === 'stop') { stop(); return; }
  if (child || message.type !== 'run' || !message.tool) return;
  child = spawn(message.tool, message.args ?? [], {
    env: message.env, windowsHide: true, detached: process.platform !== 'win32',
    stdio: [message.streamInput ? 4 : 'ignore', message.streamOutput ? 5 : 'pipe', 'pipe'],
  });
  child.on('spawn', () => send({ type: 'started' }));
  child.stdout?.setEncoding('utf8'); child.stderr?.setEncoding('utf8');
  child.stdout?.on('data', (data: string) => send({ type: 'stdout', data }));
  child.stderr?.on('data', (data: string) => send({ type: 'stderr', data }));
  child.on('error', error => send({ type: 'error', message: error.message }));
  let checking = false;
  memoryCheck = setInterval(async () => {
    if (!child?.pid || checking || stopping) return;
    checking = true;
    try {
      // Sibling GDAL and Tippecanoe tools share the worker's memory budget.
      const bytes = await processTreeMemoryBytes(message.memoryRootPid ?? child.pid);
      if (bytes !== null) {
        send({ type: 'memory', bytes });
        if (bytes > (message.memoryBytes ?? Infinity)) {
          send({ type: 'limit', message: 'Pipeline exceeded its shared memory budget.' }); stop();
        }
      }
    } finally { checking = false; }
  }, 1000);
  child.on('close', (code, signal) => {
    finished = true;
    if (stopping) void killProcessTree(child?.pid, 'SIGKILL');
    clearInterval(memoryCheck); clearTimeout(hardStop);
    // Flush queued stdout/stderr before disconnecting short-lived tools.
    if (process.connected) process.send?.({ type: 'exit', code, signal }, () => process.disconnect());
  });
});
