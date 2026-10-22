import { readdir, stat, statfs } from 'node:fs/promises';
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
    // POSIX: sum RSS of pid plus all descendants via a single ps snapshot.
    // Falls back to the root RSS when the table cannot be parsed.
    const { stdout } = await execFileAsync('ps', ['-eo', 'pid=,ppid=,rss='], { timeout: 5000, maxBuffer: 1 << 20 });
    const rows = stdout.split('\n').map(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 3) return null;
      const [cpid, ppid, rss] = parts.map(Number);
      if (!Number.isInteger(cpid) || !Number.isInteger(ppid) || !Number.isFinite(rss)) return null;
      return { cpid: cpid!, ppid: ppid!, rss: rss! };
    }).filter((r): r is { cpid: number; ppid: number; rss: number } => r !== null);
    if (rows.length === 0) return null;
    const children = new Map<number, number[]>();
    for (const row of rows) {
      const list = children.get(row.ppid) ?? [];
      list.push(row.cpid);
      children.set(row.ppid, list);
    }
    const rssByPid = new Map(rows.map(r => [r.cpid, r.rss]));
    const seen = new Set<number>([pid]);
    const queue = [pid];
    let totalKb = 0;
    while (queue.length > 0) {
      const current = queue.pop()!;
      const rss = rssByPid.get(current);
      if (rss !== undefined) totalKb += rss;
      else if (current !== pid) continue;
      for (const kid of children.get(current) ?? []) {
        if (!seen.has(kid)) { seen.add(kid); queue.push(kid); }
      }
    }
    // Root vanished and no descendant matched: process is gone.
    if (totalKb === 0 && !rssByPid.has(pid)) return null;
    return totalKb * 1024;
  } catch {
    return null;
  }
}
