import Database from 'better-sqlite3';
import { join } from 'node:path';
import { config, initializeData } from './config.js';
import { JobError, type InputSource, type Job, type Options } from './types.js';

export class Jobs {
  db: Database.Database;
  constructor(path?: string) {
    if (!path) initializeData();
    this.db = new Database(path ?? join(config.data, 'jobs.sqlite'));
    this.db.pragma('journal_mode = WAL'); this.db.pragma('synchronous = FULL'); this.db.pragma('busy_timeout = 5000');
    this.db.exec(`CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY, filename TEXT NOT NULL, input TEXT NOT NULL, sha256 TEXT NOT NULL,
      size INTEGER NOT NULL, options TEXT NOT NULL, status TEXT NOT NULL, stage TEXT NOT NULL DEFAULT 'Queued',
      progress INTEGER NOT NULL DEFAULT 0, cancel INTEGER NOT NULL DEFAULT 0, attempt INTEGER NOT NULL DEFAULT 0,
      created TEXT NOT NULL, updated TEXT NOT NULL, error TEXT, code TEXT, output TEXT, metadata TEXT
    ); CREATE INDEX IF NOT EXISTS jobs_status ON jobs(status, created);
    CREATE TABLE IF NOT EXISTS runtime (id INTEGER PRIMARY KEY CHECK(id=1), owner TEXT NOT NULL, heartbeat INTEGER NOT NULL, tools TEXT);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL, auth_fingerprint TEXT NOT NULL DEFAULT '');`);
    // Migrate databases created before progress timing existed.
    const columns = this.db.prepare('PRAGMA table_info(jobs)').all() as { name: string }[];
    if (!columns.some(c => c.name === 'started')) this.db.exec('ALTER TABLE jobs ADD COLUMN started TEXT');
    if (!columns.some(c => c.name === 'source')) this.db.exec('ALTER TABLE jobs ADD COLUMN source TEXT');
    const sessionColumns = this.db.prepare('PRAGMA table_info(sessions)').all() as { name: string }[];
    if (!sessionColumns.some(c => c.name === 'auth_fingerprint')) this.db.exec("ALTER TABLE sessions ADD COLUMN auth_fingerprint TEXT NOT NULL DEFAULT ''");
    this.db.exec(`CREATE TABLE IF NOT EXISTS progress_samples (
      job TEXT NOT NULL, attempt INTEGER NOT NULL, progress INTEGER NOT NULL, at INTEGER NOT NULL
    ); CREATE INDEX IF NOT EXISTS progress_samples_job ON progress_samples(job, attempt, at);`);
    // BYOC storage credentials: scope columns are plaintext metadata, secrets
    // live only in the sealed blob (AES-256-GCM, see storage-auth.ts).
    this.db.exec(`CREATE TABLE IF NOT EXISTS storage_credentials (
      id TEXT PRIMARY KEY, connection_id TEXT NOT NULL DEFAULT '', endpoint TEXT NOT NULL DEFAULT '',
      region TEXT NOT NULL DEFAULT '', bucket TEXT NOT NULL DEFAULT '', prefix TEXT NOT NULL DEFAULT '',
      iv TEXT NOT NULL, tag TEXT NOT NULL, data TEXT NOT NULL,
      owner TEXT NOT NULL DEFAULT '', expires INTEGER NOT NULL, created INTEGER NOT NULL
    ); CREATE INDEX IF NOT EXISTS storage_credentials_owner ON storage_credentials(owner, expires);`);
  }
  private clearSamples(id: string) { this.db.prepare('DELETE FROM progress_samples WHERE job=?').run(id); }
  private decode(row: unknown): Job | undefined {
    if (!row) return undefined;
    const j = row as Job & { options: string; metadata: string | null; source?: string | null };
    const source = j.source ? JSON.parse(j.source) as InputSource : { kind: 'local' as const, input: j.input, filename: j.filename, size: j.size, sha256: j.sha256 };
    return { ...j, options: JSON.parse(j.options), metadata: j.metadata ? JSON.parse(j.metadata) : null, source };
  }
  get(id: string) { return this.decode(this.db.prepare('SELECT * FROM jobs WHERE id=?').get(id)); }
  list() { return this.db.prepare('SELECT * FROM jobs ORDER BY created DESC LIMIT 100').all().map(row => this.decode(row)!); }
  enqueue(j: { id: string; filename: string; input: string; sha256: string; size: number; options: Options; source?: InputSource }) {
    this.db.transaction(() => {
      const count = this.db.prepare("SELECT count(*) AS n FROM jobs WHERE status IN ('QUEUED','RUNNING')").get() as { n: number };
      if (count.n >= config.queueLimit) throw new JobError('QUEUE_FULL', 'The queue is full. Please try again later.');
      const source = j.source ?? { kind: 'local', input: j.input, filename: j.filename, size: j.size, sha256: j.sha256 };
      this.db.prepare("INSERT INTO jobs(id,filename,input,sha256,size,options,source,status,created,updated) VALUES(?,?,?,?,?,?,?,'QUEUED',?,?)")
        .run(j.id, j.filename, j.input, j.sha256, j.size, JSON.stringify(j.options), JSON.stringify(source), new Date().toISOString(), new Date().toISOString());
    }).immediate();
    return this.get(j.id)!;
  }
  acquire(owner: string) {
    this.db.transaction(() => {
      const lease = this.runtime();
      if (lease && Date.now() - lease.heartbeat < 30000) throw new Error('Another worker is already active for this data directory.');
      this.db.prepare("UPDATE jobs SET status=CASE WHEN cancel=1 THEN 'CANCELLED' ELSE 'FAILED' END, code='WORKER_INTERRUPTED', error='The worker stopped before completion. Retry this job to start a new attempt.', stage='Interrupted', updated=? WHERE status='RUNNING'").run(new Date().toISOString());
      this.db.prepare("DELETE FROM progress_samples WHERE job IN (SELECT id FROM jobs WHERE status IN ('FAILED','CANCELLED'))").run();
      this.db.prepare('INSERT OR REPLACE INTO runtime(id,owner,heartbeat) VALUES(1,?,?)').run(owner, Date.now());
    }).immediate();
  }
  runtime() { return this.db.prepare('SELECT owner,heartbeat,tools FROM runtime WHERE id=1').get() as { owner: string; heartbeat: number; tools: string | null } | undefined; }
  heartbeat(owner: string, tools?: unknown) {
    const result = this.db.prepare('UPDATE runtime SET heartbeat=?, tools=COALESCE(?,tools) WHERE id=1 AND owner=?').run(Date.now(), tools ? JSON.stringify(tools) : null, owner);
    if (!result.changes) throw new JobError('WORKER_LEASE_LOST', 'Worker ownership was lost.');
  }
  release(owner: string) { this.db.prepare('DELETE FROM runtime WHERE owner=?').run(owner); }
  // -- BYOC storage credentials (sealed blobs; the server never logs them) --
  saveStorageCredential(row: { id: string; connectionId: string; endpoint: string; region: string; bucket: string; prefix: string; iv: string; tag: string; data: string; owner: string; expires: number }) {
    this.db.prepare(`INSERT OR REPLACE INTO storage_credentials(id, connection_id, endpoint, region, bucket, prefix, iv, tag, data, owner, expires, created)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run(row.id, row.connectionId, row.endpoint, row.region, row.bucket, row.prefix, row.iv, row.tag, row.data, row.owner, row.expires, Date.now());
  }
  getStorageCredential(id: string) {
    return this.db.prepare('SELECT id, connection_id AS connectionId, endpoint, region, bucket, prefix, iv, tag, data, owner AS ownerHash, expires AS expiresAt FROM storage_credentials WHERE id=?').get(id) as {
      id: string; connectionId: string; endpoint: string; region: string; bucket: string; prefix: string;
      iv: string; tag: string; data: string; ownerHash: string; expiresAt: number;
    } | undefined;
  }
  listStorageCredentials(owner: string) {
    this.pruneStorageCredentials();
    return this.db.prepare('SELECT id, connection_id AS connectionId, endpoint, region, bucket, expires AS expiresAt, created AS createdAt FROM storage_credentials WHERE owner=? ORDER BY created DESC LIMIT 50').all(owner) as {
      id: string; connectionId: string; endpoint: string; region: string; bucket: string; expiresAt: number; createdAt: number;
    }[];
  }
  deleteStorageCredential(id: string, owner: string) {
    const result = this.db.prepare('DELETE FROM storage_credentials WHERE id=? AND owner=?').run(id, owner);
    if (!result.changes) throw new JobError('NOT_FOUND', 'Storage credentials not found.');
  }
  pruneStorageCredentials() {
    this.db.prepare('DELETE FROM storage_credentials WHERE expires<=?').run(Date.now());
  }
  claim(owner: string) {
    return this.db.transaction(() => {
      if (this.runtime()?.owner !== owner) throw new JobError('WORKER_LEASE_LOST', 'Worker ownership was lost.');
      const row = this.db.prepare("SELECT id FROM jobs WHERE status='QUEUED' ORDER BY created LIMIT 1").get() as { id: string } | undefined;
      if (!row) return undefined;
      const now = new Date().toISOString();
      this.db.prepare("UPDATE jobs SET status='RUNNING', attempt=attempt+1, stage='Inspecting', started=?, updated=? WHERE id=?").run(now, now, row.id);
      this.clearSamples(row.id);
      return this.get(row.id);
    }).immediate();
  }
  update(id: string, stage: string, progress: number) {
    this.db.transaction(() => {
      this.db.prepare("UPDATE jobs SET stage=?, progress=max(progress,?), updated=? WHERE id=? AND status='RUNNING'").run(stage, Math.min(99, progress), new Date().toISOString(), id);
      const row = this.db.prepare('SELECT progress, attempt, status FROM jobs WHERE id=?').get(id) as { progress: number; attempt: number; status: string } | undefined;
      if (!row || row.status !== 'RUNNING') return;
      const last = this.db.prepare('SELECT progress FROM progress_samples WHERE job=? AND attempt=? ORDER BY at DESC LIMIT 1').get(id, row.attempt) as { progress: number } | undefined;
      if (!last || row.progress > last.progress) {
        this.db.prepare('INSERT INTO progress_samples(job, attempt, progress, at) VALUES(?,?,?,?)').run(id, row.attempt, row.progress, Date.now());
        this.db.prepare('DELETE FROM progress_samples WHERE job=? AND attempt=? AND rowid NOT IN (SELECT rowid FROM progress_samples WHERE job=? AND attempt=? ORDER BY at DESC LIMIT 50)').run(id, row.attempt, id, row.attempt);
      }
    }).immediate();
  }
  // Estimate completion from the job's own measured rate (progress points per ms
  // over the last 2 minutes), so the number tracks slow and fast phases instead
  // of guessing from a static average. Returns null while there is no movement
  // to measure yet rather than inventing a misleading number.
  estimate(id: string): { elapsedMs: number; remainingMs: number | null } | undefined {
    const job = this.db.prepare('SELECT status, progress, attempt, started FROM jobs WHERE id=?').get(id) as { status: string; progress: number; attempt: number; started: string | null } | undefined;
    if (!job || job.status !== 'RUNNING') return undefined;
    const now = Date.now();
    const startedMs = job.started ? Date.parse(job.started) : NaN;
    const elapsedMs = Number.isFinite(startedMs) ? Math.max(0, now - startedMs) : 0;
    const samples = this.db.prepare('SELECT progress, at FROM progress_samples WHERE job=? AND attempt=? ORDER BY at ASC').all(id, job.attempt) as { progress: number; at: number }[];
    const recent = samples.filter(s => s.at >= now - 120000);
    const base = recent.length >= 2 ? recent : samples;
    let remainingMs: number | null = null;
    if (base.length >= 2) {
      const first = base[0]!, last = base[base.length - 1]!;
      const gained = last.progress - first.progress, spent = last.at - first.at;
      if (gained > 0 && spent > 0) remainingMs = Math.max(0, Math.round((100 - job.progress) / (gained / spent)));
    } else if (base.length === 1 && base[0]!.progress > 0 && Number.isFinite(startedMs)) {
      const spent = base[0]!.at - startedMs;
      if (spent > 0) remainingMs = Math.max(0, Math.round((100 - job.progress) / (base[0]!.progress / spent)));
    }
    return { elapsedMs, remainingMs };
  }
  cancel(id: string) {
    this.db.prepare("UPDATE jobs SET cancel=1, status=CASE WHEN status='QUEUED' THEN 'CANCELLED' ELSE status END, updated=? WHERE id=? AND status IN ('QUEUED','RUNNING')").run(new Date().toISOString(), id);
  }
  retry(id: string) {
    this.db.transaction(() => {
      const count = this.db.prepare("SELECT count(*) AS n FROM jobs WHERE status IN ('QUEUED','RUNNING')").get() as { n: number };
      if (count.n >= config.queueLimit) throw new JobError('QUEUE_FULL', 'The queue is full. Please retry later.');
      const result = this.db.prepare("UPDATE jobs SET status='QUEUED', stage='Queued', progress=0, cancel=0, error=NULL, code=NULL, output=NULL, metadata=NULL, started=NULL, updated=? WHERE id=? AND status IN ('FAILED','CANCELLED')").run(new Date().toISOString(), id);
      if (!result.changes) throw new JobError('INVALID_STATE', 'Only failed or cancelled jobs can be retried.');
      this.clearSamples(id);
    }).immediate();
  }
  remove(id: string) {
    const result = this.db.prepare("DELETE FROM jobs WHERE id=? AND status IN ('SUCCEEDED','FAILED','CANCELLED')").run(id);
    if (!result.changes) throw new JobError('INVALID_STATE', 'Only completed, failed, or cancelled jobs can be deleted.');
    this.clearSamples(id);
  }
  finish(id: string, attempt: number, owner: string, output: string, metadata: unknown) {
    const result = this.db.prepare("UPDATE jobs SET status='SUCCEEDED', stage='Complete', progress=100, output=?, metadata=?, updated=? WHERE id=? AND attempt=? AND status='RUNNING' AND cancel=0 AND EXISTS(SELECT 1 FROM runtime WHERE owner=?)")
      .run(output, JSON.stringify(metadata), new Date().toISOString(), id, attempt, owner).changes > 0;
    if (result) this.clearSamples(id);
    return result;
  }
  fail(id: string, attempt: number, error: unknown) {
    const e = error instanceof JobError ? error : new JobError('INTERNAL_ERROR', error instanceof Error ? error.message : String(error));
    this.db.prepare("UPDATE jobs SET status=CASE WHEN cancel=1 OR ?='CANCELLED' THEN 'CANCELLED' ELSE 'FAILED' END, stage='Stopped', code=?, error=?, updated=? WHERE id=? AND attempt=? AND status='RUNNING'")
      .run(e.code, e.code, e.message.slice(0,8000), new Date().toISOString(), id, attempt);
    this.clearSamples(id);
  }
  close() { this.db.close(); }
}
