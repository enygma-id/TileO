import type { Writable } from 'node:stream';
import { run, type RunOptions } from './process.js';

export type StreamRunOptions = RunOptions;
export interface StreamStats { bytesSent: number; featuresSent: number; peakMemoryBytes: number | null }

export async function runWithStdin(
  tool: string, args: string[],
  producer: (stdin: Writable, stats: StreamStats, signal: AbortSignal) => Promise<unknown>,
  options: StreamRunOptions = {},
): Promise<StreamStats> {
  const stats: StreamStats = { bytesSent: 0, featuresSent: 0, peakMemoryBytes: null };
  await run(tool, args, {
    ...options, memoryRootPid: options.memoryRootPid ?? process.pid,
    onMemory(bytes) {
      stats.peakMemoryBytes = Math.max(stats.peakMemoryBytes ?? 0, bytes);
      options.onMemory?.(bytes);
    },
    stdin: (stdin, signal) => producer(stdin, stats, signal),
  });
  return stats;
}

export async function writeLine(stream: Writable, line: string, stats?: StreamStats): Promise<boolean> {
  if (stream.destroyed || stream.closed || stream.writableEnded) return false;
  const chunk = line.endsWith('\n') ? line : `${line}\n`;
  try {
    if (!stream.write(chunk)) {
      const ready = await new Promise<boolean>(resolve => {
        const cleanup = () => { stream.off('drain', drained); stream.off('close', closed); stream.off('error', closed); };
        const drained = () => { cleanup(); resolve(true); };
        const closed = () => { cleanup(); resolve(false); };
        stream.once('drain', drained); stream.once('close', closed); stream.once('error', closed);
        if (stream.destroyed) closed();
      });
      if (!ready || stream.destroyed) return false;
    }
    if (stats) stats.bytesSent += Buffer.byteLength(chunk);
    return true;
  } catch { return false; }
}
