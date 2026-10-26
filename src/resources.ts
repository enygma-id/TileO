import { readdir, readFile, stat, statfs } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { config } from './config.js';
import { JobError } from './types.js';
export async function freeDisk() {
  const stats = await statfs(config.data);
  return stats.bavail * stats.bsize;
}
export async function checkDisk(required = 0) {
  if (await freeDisk() < config.reserveBytes + required) throw new JobError('DISK_FULL', 'Not enough free disk space to preserve the configured disk reserve.');
}
export async function directoryBytes(directory: string): Promise<number> {
  let bytes = 0;
  for (const file of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, file.name);
    if (file.isDirectory()) bytes += await directoryBytes(path);
    else if (file.isFile()) { try { bytes += (await stat(path)).size; } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; } }
  }
  return bytes;
}

const execFileAsync = promisify(execFile);

// Kills a process and its descendants. POSIX uses the process group created
// with detached:true (kill(-pid)); Windows uses taskkill /T so child GDAL or
// Tippecanoe processes spawned by the tool do not linger as orphans.
export async function killProcessTree(pid: number | undefined, signal: NodeJS.Signals = 'SIGTERM'): Promise<void> {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      await execFileAsync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { windowsHide: true, timeout: 5000 }).catch(() => undefined);
    } else {
      try { process.kill(-pid, signal); }
      catch { try { process.kill(pid, signal); } catch { /* already exited */ } }
    }
  } catch { /* best-effort cleanup; exit handler reports the real error */ }
}

// Best-effort aggregate RSS of a process tree in bytes. Native sampling is
// advisory only; the container hard limit remains the production boundary.
// Returns null when the process is gone or sampling fails.
export interface ProcessRow { pid: number; ppid: number; rssBytes: number }

// Parses the two fields TileO needs from /proc/<pid>/status. VmRSS is in kB and
// is page-size independent, unlike statm's resident page count.
export function parseProcStatus(text: string): { ppid: number; rssBytes: number } | null {
  const ppid = /^PPid:\s+(\d+)/m.exec(text);
  if (!ppid) return null;
  const rss = /^VmRSS:\s+(\d+)\s+kB/m.exec(text);
  return { ppid: Number(ppid[1]), rssBytes: rss ? Number(rss[1]) * 1024 : 0 };
}

export function sumProcessTree(rows: readonly ProcessRow[], pid: number): number | null {
  const byPid = new Map(rows.map(row => [row.pid, row]));
  if (!byPid.has(pid)) return null;
  const children = new Map<number, number[]>();
  for (const row of rows) {
    const list = children.get(row.ppid) ?? [];
    list.push(row.pid);
    children.set(row.ppid, list);
  }
  const seen = new Set<number>([pid]);
  const queue = [pid];
  let total = 0;
  while (queue.length > 0) {
    const current = queue.pop()!;
    total += byPid.get(current)?.rssBytes ?? 0;
    for (const child of children.get(current) ?? []) {
      if (!seen.has(child)) { seen.add(child); queue.push(child); }
    }
  }
  return total;
}

export async function processTreeMemoryBytes(pid: number | undefined): Promise<number | null> {
  if (!pid) return null;
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execFileAsync('powershell.exe',
        ['-NoProfile', '-NonInteractive', '-Command',
          `$taskRoot=${pid}; $rows=@(Get-CimInstance Win32_Process -ErrorAction Stop); $ids=[System.Collections.Generic.HashSet[int]]::new(); [void]$ids.Add($taskRoot); do { $added=$false; foreach ($row in $rows) { if ($ids.Contains([int]$row.ParentProcessId) -and $ids.Add([int]$row.ProcessId)) { $added=$true } } } while ($added); $sum=0; foreach ($taskId in $ids) { try { $sum+=(Get-Process -Id $taskId -ErrorAction Stop).PrivateMemorySize64 } catch {} }; Write-Output $sum`],
        { timeout: 5000, maxBuffer: 32768, windowsHide: true });
      const bytes = Number(stdout.trim());
      return Number.isFinite(bytes) && bytes > 0 ? bytes : null;
    }
    // Linux: read one /proc snapshot. This replaces `ps` and removes procps
    // from the runtime artifact. Other POSIX platforms are out of scope.
    if (process.platform !== 'linux') return null;
    const entries = await readdir('/proc', { withFileTypes: true });
    const rows = (await Promise.all(entries.filter(entry => entry.isDirectory() && /^\d+$/.test(entry.name)).map(async entry => {
      try {
        const status = parseProcStatus(await readFile(`/proc/${entry.name}/status`, 'utf8'));
        return status ? { pid: Number(entry.name), ppid: status.ppid, rssBytes: status.rssBytes } : null;
      } catch { return null; }
    }))).filter((row): row is ProcessRow => row !== null);
    return sumProcessTree(rows, pid);
  } catch {
    return null;
  }
}
