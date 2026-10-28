#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { atomicWrite, gitIdentity, inspectImage, listFiles, parseArgs, relativeSafe, sha256, sha256File, TAR_EXECUTABLE } from './lib/release-evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
let options;
try { options = parseArgs(process.argv.slice(2), { '--image': 'required', '--evidence-dir': 'required', '--image-export': 'required', '--build-stdout': 'required', '--build-stderr': 'required' }); }
catch (error) { console.error(error.message); process.exit(2); }
const evidence = path.resolve(options['evidence-dir']);
if (path.basename(evidence) !== `v${version}`) throw new Error(`Evidence root must end in v${version}`);
const git = gitIdentity(ROOT);
if (!git.clean) throw new Error(`Candidate source must be clean:\n${git.status}`);
const image = inspectImage(options.image);
const exportPath = path.resolve(options['image-export']);
if (!fs.existsSync(exportPath) || fs.statSync(exportPath).size === 0) throw new Error('Image export is missing or empty');
for (const log of [options['build-stdout'], options['build-stderr']]) if (!fs.existsSync(path.resolve(log))) throw new Error(`Build log missing: ${log}`);
for (const subdir of ['source', 'image', 'tests', 'gate', 'compliance', 'release', 'sbom']) fs.mkdirSync(path.join(evidence, subdir), { recursive: true });

const tempTar = path.join(os.tmpdir(), `tileo-source-${process.pid}.tar`);
const tempSource = fs.mkdtempSync(path.join(os.tmpdir(), `tileo-source-tree-${process.pid}-`));
try {
  execFileSync('git', ['archive', '--format=tar', '--output', tempTar, git.commit], { cwd: ROOT });
  execFileSync(TAR_EXECUTABLE, ['-xf', tempTar, '-C', tempSource], { stdio: 'pipe' });
  atomicWrite(path.join(evidence, 'source/TileO-0.1.0-source.tar.gz'), zlib.gzipSync(fs.readFileSync(tempTar), { level: 9, mtime: 0 }));
} finally { fs.rmSync(tempTar, { force: true }); }
const tracked = listFiles(tempSource).map((file) => ({ path: relativeSafe(tempSource, file), bytes: fs.statSync(file).size, sha256: sha256File(file) }));
fs.rmSync(tempSource, { recursive: true, force: true });
atomicWrite(path.join(evidence, 'source/source-export-manifest.json'), JSON.stringify({ schema: 'tileo-source-export@1', commit: git.commit, files: tracked }, null, 2) + '\n');
const sourceArchive = path.join(evidence, 'source/TileO-0.1.0-source.tar.gz');
atomicWrite(path.join(evidence, 'source/build-context-sha256.txt'), `${sha256File(sourceArchive)}  TileO-0.1.0-source.tar.gz\n`);

fs.copyFileSync(path.resolve(options['build-stdout']), path.join(evidence, 'image/build.stdout.log'));
fs.copyFileSync(path.resolve(options['build-stderr']), path.join(evidence, 'image/build.stderr.log'));
const imageExport = { path: path.basename(exportPath), bytes: fs.statSync(exportPath).size, sha256: sha256File(exportPath), storage: 'review artifact; not embedded in core evidence' };
atomicWrite(path.join(evidence, 'image/image-export.json'), JSON.stringify({ schema: 'tileo-image-export@1', image_id: image.id, platform: image.platform, export: imageExport }, null, 2) + '\n');
const committedDockerfile = execFileSync('git', ['show', `${git.commit}:Dockerfile`], { cwd: ROOT });
atomicWrite(path.join(evidence, 'image/build-provenance.json'), JSON.stringify({ schema: 'tileo-build-provenance@1', commit: git.commit, clean: true, source_archive_sha256: sha256File(sourceArchive), dockerfile_sha256: sha256(committedDockerfile), image_id: image.id, platform: image.platform, base_image: committedDockerfile.toString('utf8').match(/ARG ALPINE_IMAGE=(\S+)/)?.[1] ?? null }, null, 2) + '\n');
const candidate = { schema: 'tileo-release-candidate@1', version, candidate_id: `candidate-${git.commit.slice(0, 12)}-01`, repository: 'enygma-id/TileO', commit: git.commit, clean: true, source_archive_sha256: sha256File(sourceArchive), image_id: image.id, platform: image.platform, image_export_sha256: imageExport.sha256, image_export_bytes: imageExport.bytes, policy_sha256: sha256File(path.join(ROOT, 'release-policy/release-policy.json')), test_scope_sha256: sha256File(path.join(ROOT, 'release-policy/test-scope.json')), human_approval: 'PENDING' };
atomicWrite(path.join(evidence, 'candidate.json'), JSON.stringify(candidate, null, 2) + '\n');
fs.copyFileSync(path.join(ROOT, 'release-policy/test-scope.json'), path.join(evidence, 'tests/test-scope.json'));
fs.copyFileSync(path.join(ROOT, 'release-policy/release-policy.json'), path.join(evidence, 'release/policy-snapshot.json'));
fs.copyFileSync(path.join(ROOT, 'release-policy/reviewers.json'), path.join(evidence, 'release/reviewers-policy-snapshot.json'));
atomicWrite(path.join(evidence, 'tests/fixture-manifest.json'), JSON.stringify({ schema: 'tileo-fixture-manifest@1', policy: 'deterministic fixtures are generated by committed tests; no host application bytes are mounted into the candidate', external_tools: ['GDAL host tool for browser fixture generation; version recorded in browser execution'] }, null, 2) + '\n');
atomicWrite(path.join(evidence, 'compliance/rights-review-summary.json'), JSON.stringify({ schema: 'tileo-rights-review-summary@1', status: 'PENDING_HUMAN_REVIEW', first_party_enterprise_rights: 'UNVERIFIED_BY_ENGINEERING', cla_note: 'CLA.md is a proposed agreement and is not treated as signed consent', required_reviewer: 'Legal-IP' }, null, 2) + '\n');
atomicWrite(path.join(evidence, 'release/release-notes.md'), `# TileO 0.1.0 release candidate\n\nTileO 0.1.0 is the first intended public release. Its API may change. The reviewed platform is linux/amd64. Community first-party code is AGPL-3.0-only; Enterprise rights require a valid Enygma agreement and verified first-party rights. Runtime distribution includes three disclosed, non-permissive exceptions: libstdc++, libgcc and Mozilla-derived CA trust-store material.\n\nPublication, final URLs and registry digests remain pending authenticated Engineering, Legal/IP and Release Steward approval. Compare-source browser functionality is outside the proposed 0.1.0 scope pending reviewer confirmation.\n`);
atomicWrite(path.join(evidence, 'release/operator-runbook.md'), `# Protected release operator runbook\n\n1. Review candidate ${candidate.candidate_id}, commit ${git.commit}, image ${image.id}, and frozen core manifest digest.\n2. Engineering approves only in the release-engineering environment.\n3. Legal/IP independently approves only in release-legal.\n4. Release Steward authorizes publication only in release.\n5. The protected workflow revalidates live GitHub events and publishes the exact saved image; no rebuild is allowed.\n6. Run publication verification from a clean recipient environment.\n`);
console.log(`Candidate metadata prepared for ${candidate.candidate_id}`);
