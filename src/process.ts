import { fork } from 'node:child_process';
import { appendFileSync, statSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import type { Readable, Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { config, toolEnvironment } from './config.js';
import { JobError } from './types.js';

export interface RunOptions {
  signal?: AbortSignal; timeoutMs?: number; deadlineMs?: number; log?: string; capture?: boolean; combined?: boolean; env?: NodeJS.ProcessEnv;
  batchMode?: 'off' | 'auto' | 'on'; batchDelivery?: 'file' | 'stream';
  remoteProbe?: boolean;
  memoryBytes?: number; memoryRootPid?: number; onMemory?: (bytes: number) => void;
  redactions?: string[];
  stdin?: (stream: Writable, signal: AbortSignal) => Promise<unknown>;
  stdout?: Writable;
}
export function run(tool: string, args: string[], options: RunOptions = {}): Promise<string> {
  if (options.signal?.aborted) return Promise.reject(options.signal.reason ?? new JobError('CANCELLED', 'Job cancelled.'));
  const timeoutMs = Math.min(options.timeoutMs ?? 30000, options.deadlineMs === undefined ? Infinity : options.deadlineMs - Date.now());
  if (timeoutMs <= 0) return Promise.reject(new JobError('TIMEOUT', 'The job exceeded its overall time limit.'));
  let environment: NodeJS.ProcessEnv;
  try { environment = options.env ?? toolEnvironment(); } catch (error) { return Promise.reject(error); }
  const executable = process.platform === 'win32' && !tool.endsWith('.exe') ? `${tool}.exe` : tool;
  return new Promise((resolve, reject) => {
    const host = fork(fileURLToPath(new URL('./tool-host.js', import.meta.url)), [], {
      stdio: ['ignore', 'ignore', 'pipe', 'ipc', 'pipe', 'pipe'], execArgv: [], windowsHide: true,
    });
    const channels = host.stdio as Array<Readable | Writable | null | undefined>;
    const input = channels[4] as Writable;
    const output = channels[5] as Readable;
    const controller = new AbortController();
    let stdout = '', tail = '', failure: Error | undefined, exited = false, stopRequested = false;
    let producer: Promise<void> = Promise.resolve();
    let logSize = options.log ? (() => { try { return statSync(options.log!).size; } catch { return 0; } })() : 0;
    const stop = (error: Error) => {
      failure ??= error;
      if (!controller.signal.aborted) controller.abort(error);
      input.destroy();
      if (!stopRequested && !exited && host.connected) {
        stopRequested = true;
        host.send({ type: 'stop' }, () => { /* Guardian may already have exited. */ });
      }
    };
    input.on('error', error => { if (!failure) stop(error); });
    const transfer = options.stdout ? pipeline(output, options.stdout).catch(error => { stop(error); }) : Promise.resolve();
    if (!options.stdout) output.resume();
    const redact = (data: string) => (options.redactions ?? []).reduce((text, secret) => secret ? text.replaceAll(secret, '[REDACTED_URL]') : text, data);
    const log = (data: string) => {
      if (!options.log || logSize >= config.logBytes) return;
      // Concurrent producer/consumer runners append to the same attempt log.
      // Refresh the shared size so each runner does not grant another 8 MiB.
      try { logSize = statSync(options.log).size; } catch { /* New log. */ }
      const text = Buffer.from(redact(data)).subarray(0, Math.max(0, config.logBytes - logSize));
      try { appendFileSync(options.log, text); logSize += text.length; }
      catch { stop(new JobError('LOG_FAILED', 'Could not write the job log. Check free disk space.')); }
    };
    const abort = () => stop(options.signal?.reason instanceof Error ? options.signal.reason : new JobError('CANCELLED', 'Job cancelled.'));
    const timer = setTimeout(() => stop(new JobError('TIMEOUT', `${tool} exceeded its deadline.`)), timeoutMs);
    options.signal?.addEventListener('abort', abort, { once: true });
    log(`\n${new Date().toISOString()} ${JSON.stringify([tool, ...args])}\n`);
    host.stderr?.on('data', data => { tail = (tail + String(data)).slice(-12000); });
    host.on('message', (m: { type: string; data?: string; message?: string; code?: number | null; signal?: string; bytes?: number }) => {
      if (m.type === 'started' && options.stdin) {
        producer = (async () => {
          try {
            controller.signal.throwIfAborted();
            await options.stdin!(input, controller.signal);
            // Extra fork descriptors are duplex pipe handles. Close the
            // writable-only channel after flushing, otherwise the inherited
            // descriptor can keep a native stdin reader waiting for EOF.
            if (!input.destroyed) {
              if (!input.writableEnded) input.end(() => input.destroy());
              else if (input.writableFinished) input.destroy();
              else input.once('finish', () => input.destroy());
            }
          } catch (error) { stop(error as Error); }
        })();
      }
      if (m.type === 'stdout' || m.type === 'stderr') {
        const data = m.data ?? ''; log(data); tail = redact(tail + data).slice(-12000);
        if ((m.type === 'stdout' || options.combined) && options.capture) {
          stdout += data;
          if (Buffer.byteLength(stdout) > 8 * 1024 ** 2) stop(new JobError('METADATA_LIMIT', `${tool} returned too much metadata.`));
        }
      }
      if (m.type === 'error') stop(new JobError('TOOL_MISSING', `Cannot start ${tool}: ${m.message}. Check the tool paths or use Docker Compose.`));
      if (m.type === 'memory' && m.bytes !== undefined) options.onMemory?.(m.bytes);
      if (m.type === 'limit') stop(new JobError('MEMORY_LIMIT', m.message ?? 'Memory budget exceeded.'));
      if (m.type === 'exit') {
        exited = true;
        log(`\nExit: ${m.code}; signal: ${m.signal ?? 'none'}\n`);
        if (m.code !== 0) stop(new JobError('TOOL_FAILED', `${tool}: ${tail.trim() || `exited with ${m.signal ?? m.code}`}`));
        else if (options.stdin && !input.writableEnded) stop(new JobError('TOOL_FAILED', `${tool} closed before its producer finished.`));
      }
    });
    host.on('error', error => stop(error));
    host.on('close', () => {
      clearTimeout(timer); options.signal?.removeEventListener('abort', abort);
      if (!exited) stop(new JobError('TOOL_HOST_FAILED', `The process guardian stopped unexpectedly. ${tail}`));
      void Promise.all([producer, transfer]).then(() => {
        input.destroy();
        if (failure) reject(failure); else resolve(stdout);
      }, reject);
    });
    host.send({ type: 'run', tool: executable, args, env: environment,
      memoryBytes: options.memoryBytes ?? config.memoryBytes, memoryRootPid: options.memoryRootPid,
      streamInput: !!options.stdin, streamOutput: !!options.stdout });
    if (options.signal?.aborted) abort();
  });
}
