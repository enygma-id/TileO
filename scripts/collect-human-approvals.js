#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { atomicWrite, parseArgs, readJson, sha256, sha256File } from './lib/release-evidence.js';
import { decisionCommentValid, assertEnvironmentProtection } from './lib/approval-decisions.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let options;
try { options = parseArgs(process.argv.slice(2), { '--run-id': 'required', '--run-attempt': 'required', '--candidate': 'required', '--output': 'required' }); }
catch (error) { console.error(error.message); process.exit(2); }
if (!/^\d+$/.test(options['run-id']) || !/^\d+$/.test(options['run-attempt'])) throw new Error('Run ID and attempt must be positive integers');
if (options['run-attempt'] !== '1') throw new Error('Publication authorization rejects reruns; dispatch a new workflow run and obtain fresh reviews');
const candidatePath = path.resolve(options.candidate);
const candidate = readJson(candidatePath, 'tileo-release-candidate@1');
const evidence = path.dirname(candidatePath);
const manifestPath = path.join(evidence, 'core-evidence-manifest.json');
if (!fs.existsSync(manifestPath)) throw new Error('core-evidence-manifest.json is required before collecting approvals');
const coreDigest = sha256File(manifestPath);
const policy = readJson(path.join(ROOT, 'release-policy/release-policy.json'), 'tileo-release-policy@1');
const reviewers = readJson(path.join(ROOT, 'release-policy/reviewers.json'), 'tileo-reviewers-policy@1');
if (reviewers.status !== 'CONFIGURED') throw new Error('Reviewer policy is not configured by repository administrators');
for (const environment of policy.required_approval_environments) {
  const configured = reviewers.environments?.[environment];
  if (!configured?.environment_id || !Array.isArray(configured.authorized_reviewers) || configured.authorized_reviewers.length === 0) throw new Error(`${environment} has no authenticated environment/reviewer IDs`);
}

function gh(endpoint) {
  return JSON.parse(execFileSync('gh', ['api', endpoint], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
}
for(const [name,config] of Object.entries(reviewers.environments)) assertEnvironmentProtection(config,gh(`repos/${policy.repository}/environments/${encodeURIComponent(name)}`));
const run = gh(`repos/${policy.repository}/actions/runs/${options['run-id']}`);
if (String(run.run_attempt) !== options['run-attempt'] || run.head_sha !== candidate.commit || run.repository?.full_name !== policy.repository) throw new Error('GitHub run repository, commit or attempt does not match candidate');
const history = gh(`repos/${policy.repository}/actions/runs/${options['run-id']}/approvals`);
if (!Array.isArray(history)) throw new Error('GitHub approval history response is not an array');
const eventFingerprint = (event) => sha256(JSON.stringify({ state: String(event.state ?? '').toLowerCase(), environment_ids: (event.environments ?? []).map((environment) => String(environment.id)).sort(), reviewer_user_id: String(event.user?.id ?? event.reviewer?.id ?? ''), reviewer_login: event.user?.login ?? event.reviewer?.login ?? null, comment: String(event.comment ?? '') }));
const receipts = [];
for (const [environmentName, configured] of Object.entries(reviewers.environments)) {
  const match = history.find((event) => {
    const environmentIds = (event.environments ?? []).map((environment) => String(environment.id));
    const userId = String(event.user?.id ?? event.reviewer?.id ?? '');
    const comment = String(event.comment ?? '');
    return String(event.state).toLowerCase() === 'approved' && environmentIds.includes(String(configured.environment_id)) && configured.authorized_reviewers.map(String).includes(userId) && comment.includes(candidate.candidate_id) && comment.includes(coreDigest) && decisionCommentValid(configured.role,comment);
  });
  if (!match) throw new Error(`No authenticated ${configured.role} approval binds ${candidate.candidate_id} and ${coreDigest}`);
  receipts.push({ role: configured.role, environment: environmentName, environment_id: configured.environment_id, reviewer_login: match.user?.login ?? match.reviewer?.login, reviewer_user_id: match.user?.id ?? match.reviewer?.id, decision: 'APPROVE', comment: match.comment, event_sha256: eventFingerprint(match) });
}
const engineering = receipts.find((receipt) => receipt.role === 'Engineering');
const legal = receipts.find((receipt) => receipt.role === 'Legal-IP');
if (!engineering || !legal || String(engineering.reviewer_user_id) === String(legal.reviewer_user_id)) throw new Error('Engineering and Legal-IP approvals must be from distinct authenticated humans');
const authorization = { schema: 'tileo-release-authorization@1', status: 'AUTHORIZED_FOR_PUBLICATION', repository: policy.repository, version: candidate.version, candidate_id: candidate.candidate_id, commit: candidate.commit, image_id: candidate.image_id, platform: candidate.platform, core_evidence_sha256: coreDigest, image_export_sha256: candidate.image_export_sha256, workflow_run_id: Number(options['run-id']), run_attempt: Number(options['run-attempt']), receipts, collected_at: new Date().toISOString() };
atomicWrite(path.resolve(options.output), JSON.stringify(authorization, null, 2) + '\n');
console.log(`Authenticated authorization collected for ${candidate.candidate_id}`);
