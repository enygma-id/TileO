# Kerjakan sendiri: proof NC22–NC24 sampai GO

Jalankan setiap langkah terpisah. **Jika gagal, berhenti dan simpan log.**
Saat panduan dibuat, policy masih `PENDING_LIVE_PROTECTION_VERIFICATION`.
Mulai dari langkah 1; jangan langsung dispatch workflow.

## 1. Luluskan proteksi repository

Admin terlebih dahulu mengatur main dan tiga environment sesuai
[langkah 1 runbook](FINAL_REAUDIT_SELF_SERVICE.md).
Lalu di terminal WSL dengan gh CLI yang login sebagai admin:

```bash
cd /mnt/d/kerja/enygma-id/ubuntu/tileo-clean
TILEO_CHECK_BASE="$(mktemp -d /tmp/tileo-settings.XXXXXXXX)"
node scripts/check-release-protections.js --out-dir "$TILEO_CHECK_BASE/check" --write-policy
```

Wajib **exit 0 dan `PROTECTIONS_VERIFIED`**. Simpan direktori bukti.
Jika 401/403 atau mismatch, perbaiki akses/setting, lalu coba di direktori baru.
Jangan mengganti status policy sendiri.

Review/commit policy yang dihasilkan, lalu merge source melalui PR ke main.
Jika menambahkan panduan ini ke commit, stage file ini secara spesifik.
`tmp/` lokal saat pemeriksaan masih untracked: jangan ikutkan sebagai source
tanpa meninjau isinya. Tidak ada file tmp yang dipindahkan/dihapus oleh panduan.
Setelah merge, gunakan checkout bersih dari main hasil merge. Jangan mengubah
source/policy di antara dry run dan produksi; keduanya harus exact commit sama.

## 2. Mulai dry run sebagai GitHub App

Admin harus sudah membuat/memasang App dan memperoleh **installation token**.
Panduan: [operator/App](HUMAN_APPROVAL_TO_GO.md). App memulai run; Dony dan
Erick tetap melakukan review pribadi. Token pribadi reviewer tidak digunakan
untuk dispatch karena prevent-self-review.

```bash
read -rs -p "App installation token: " TILEO_APP_TOKEN
GH_TOKEN="$TILEO_APP_TOKEN" gh workflow run release.yml --repo enygma-id/TileO --ref main -f publish=false -f push_latest=false
unset TILEO_APP_TOKEN
gh run list --repo enygma-id/TileO --workflow release.yml --limit 5
read -rp "ID dry run yang baru: " TILEO_DRY_RUN_ID
gh api "repos/enygma-id/TileO/actions/runs/$TILEO_DRY_RUN_ID" --jq '{actor:.actor.login,commit:.head_sha,attempt:.run_attempt,url:.html_url}'
```

Pastikan actor adalah App, commit adalah main yang benar, attempt **1**.
Jangan memakai Re-run jobs dari run lama.

## 3. Beri tiga review asli

Workflow akan meminta review bertahap. Buka Actions → run tadi → **Review
deployments**. Ambil candidate ID dan core SHA-256 aktual dari summary run.

Sesudah memeriksa artifact/image/core dan menerima hasilnya, gunakan comment:

| Reviewer / environment | Comment (ganti dua placeholder) |
|---|---|
| Dony / release-engineering | `CANDIDATE_ID CORE_SHA256 COMPARE_SCOPE=ACCEPT_EXCLUSION` |
| Erick / release-legal | `CANDIDATE_ID CORE_SHA256 RIGHTS=APPROVE EXCEPTIONS=EXC-001,EXC-002,EXC-003` |
| Dony / release | `CANDIDATE_ID CORE_SHA256 REVIEW=ACCEPT` |

Engineering memutuskan Compare skip; Legal memutuskan hak/exception/source;
Steward menerima keseluruhan review. Jika tidak setuju, **Reject** dan perbaiki
penyebabnya. Jangan menyalin comment hanya untuk meluluskan gate.

## 4. Pastikan proof benar-benar selesai

Setelah review, job authorize menjalankan **Actual NC22–NC24 rejection tests**.
Ini otomatis menguji tujuh variasi missing/rejected/unauthorized role, wrong
candidate/core, dan replay run/attempt dengan collector/certifier asli.

```bash
gh run watch "$TILEO_DRY_RUN_ID" --repo enygma-id/TileO --exit-status
TILEO_PROOF_DIR="$(mktemp -d /tmp/tileo-proof-review.XXXXXXXX)"
gh run download "$TILEO_DRY_RUN_ID" --repo enygma-id/TileO --name tileo-0.1.0-core-evidence --dir "$TILEO_PROOF_DIR/core"
gh run download "$TILEO_DRY_RUN_ID" --repo enygma-id/TileO --name tileo-approval-negative-proof --dir "$TILEO_PROOF_DIR/raw-proof"
node scripts/verify-approval-negative-proof.js --candidate "$TILEO_PROOF_DIR/core/candidate.json" --run-id "$TILEO_DRY_RUN_ID" --out-dir "$TILEO_PROOF_DIR/validated"
```

Lulus hanya jika run **success**, validator **exit 0**, dan status
**`NEGATIVE_PROOF_VALIDATED_NOT_AUTHORIZATION`**. Simpan seluruh direktori ini.
Validator memeriksa service digest ZIP, run/commit/policy, raw logs, alasan
penolakan dan tidak adanya production PASS.

Dalam raw proof, tujuh variasi harus PASS; masing-masing actual certifier
**exit 1 karena serangan ditolak**. Baseline harus G1–G7 PASS dan G8 BLOCKED
karena belum ada production proof. Itu hasil yang diharapkan. Kegagalan Docker,
file hilang atau dependency tidak dianggap rejection yang sah.
`FAILED-DIAGNOSTICS` bukan proof sukses. Pending di frozen core tidak diedit.

## 5. Mulai produksi hanya setelah keputusan publikasi nyata

Prasyarat: proteksi valid, proof sukses ≤7 hari, source/policy tidak berubah,
reviewer siap meninjau kandidat produksi. **Perintah ini dapat menyebabkan
tag, Release dan push image setelah approval dan guard lulus.**

```bash
read -rs -p "App installation token: " TILEO_APP_TOKEN
GH_TOKEN="$TILEO_APP_TOKEN" gh workflow run release.yml --repo enygma-id/TileO --ref main -f publish=true -f push_latest=false -f negative_proof_run_id="$TILEO_DRY_RUN_ID"
unset TILEO_APP_TOKEN
```

Production membangun kandidatnya sekali. Ulangi tiga review langkah 3 memakai
candidate/core/image **run produksi**, bukan nilai dry run. Approval dry run
tidak diwariskan. Jangan rebuild sesudah approval.

## 6. Bedakan GO dan release selesai

**GO memulai publikasi** hanya jika semuanya terpenuhi:

- G1–G6 lulus pada kandidat produksi yang sama, termasuk final SBOM tanpa
  baseline historis serta source/runtime GCC/CA, tests, controls dan manifest.
- G7 menerima tiga review manusia asli, termasuk Compare dan hak/exception.
- G8 menerima proof tepercaya dari dry run yang sesuai commit/policy.
- Actual `authorization-report.json` dan authorized closure dihasilkan,
  berstatus `AUTHORIZED_FOR_PUBLICATION` dan subject-nya cocok.

**Release selesai** hanya jika source-access anonim lulus sebelum image push,
lalu full publication receipt berstatus **`PUBLISHED_VERIFIED`** sesudah push.
Download artifacts `tileo-0.1.0-authorized-closure` dan
`tileo-0.1.0-publication-verification` dari run produksi; simpan bersama URL
Release, image/core identity, proof ZIP, raw logs dan checksum.

Jika run produksi gagal, ambil artifact `tileo-0.1.0-publication-attempt` jika
tersedia. Status partial/failed tetap dicatat; jangan overwrite assets atau
menyatakan GO/release selesai dengan edit JSON.
