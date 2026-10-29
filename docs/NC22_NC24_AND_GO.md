<<<<<<< Updated upstream
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
=======
# TileO 0.1.0 — urutan NC22–NC24 sampai GO

Kerjakan berurutan. Jika gagal, simpan log dan perbaiki sebelum lanjut.
Mac Erick dan WSL Dony sama-sama bisa dipakai; jalankan perintah dari folder
checkout TileO. Checker proteksi tidak membutuhkan Docker.

## 1. Erick (Admin) — atur dan periksa proteksi

Login sebagai `erickkarya`. Atur classic protection `main` dan environment
sesuai [petunjuk konfigurasi](FINAL_REAUDIT_SELF_SERVICE.md).
Pertahankan Prevent self-review. Jalankan:

```bash
gh api user --jq .login
gh repo view enygma-id/TileO --json viewerPermission --jq .viewerPermission
TILEO_ADMIN_DIR="$(mktemp -d /tmp/tileo-admin.XXXXXXXX)"
node scripts/check-release-protections.js --out-dir "$TILEO_ADMIN_DIR/check" --write-policy
```

**Lanjut jika:** akun benar, akses Admin/token sesuai, hasil
`PROTECTIONS_VERIFIED` dan exit 0. Jika 404, periksa rule serta izin token.
Jangan mengedit status policy menjadi CONFIGURED sendiri.

## 2. Erick dan Dony — masukkan policy melalui PR

Erick membuat PR perubahan `release-policy/reviewers.json`; Dony meninjau.
Merge setelah aturan PR terpenuhi. Gunakan checkout bersih dari commit main
hasil merge untuk langkah berikutnya. Approval PR belum menjadi approval image.

**Lanjut jika:** policy terverifikasi sudah ada di main.

## 3. Erick (Admin) — siapkan GitHub App

Pasang App untuk repo TileO dengan Actions Read/write dan Metadata Read.
Siapkan installation token sesuai [petunjuk App](HUMAN_APPROVAL_TO_GO.md).
Simpan token/private key secara rahasia. App hanya memicu run.
Erick melakukan langkah berikut:

1. Login GitHub sebagai erickkarya.
2. Buka foto profil → Settings → Developer settings → GitHub Apps → New GitHub App.
3. Isi:
   - App name: nama unik, misalnya TileO Release Operator.
   - Homepage URL: https://github.com/enygma-id/TileO.
   - Webhook → Active: hilangkan centang karena App ini hanya dipakai untuk memicu workflow.
   - Repository permissions → Actions: Read and write.
   - Metadata: Read-only.
   - Izin lain biarkan tanpa akses.
4. Klik Create GitHub App. App boleh dimiliki akun pribadi Erick; kepemilikan organisasi memerlukan hak yang sesuai. Panduan pendaftaran GitHub App (https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app)
5. Pada halaman App, pilih Install App, pilih organisasi enygma-id, lalu Only select repositories → TileO → Install. Jika organisasi meminta persetujuan pemilik, pemilik organisasi perlu menyetujuinya.
6. Kembali ke pengaturan App:
   - Catat App ID.
   - Klik Generate a private key dan simpan file .pem secara rahasia.
   - Catat Installation ID dari URL halaman instalasinya.

File .pem belum merupakan installation token. File itu digunakan untuk membuat JWT, lalu meminta installation token melalui API GitHub. Installation token inilah yang dimasukkan pada perintah read -rs; token tersebut berlaku satu jam. Panduan token instalasi (https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app)


**Lanjut jika:** installation token App tersedia.

## 4. Dony (melalui App) — mulai dry run

```bash
read -rs -p "Installation token App: " TILEO_APP_TOKEN
echo
GH_TOKEN="$TILEO_APP_TOKEN" gh workflow run release.yml --repo enygma-id/TileO --ref main -f publish=false -f push_latest=false
unset TILEO_APP_TOKEN
gh run list --repo enygma-id/TileO --workflow release.yml --limit 5
```

Catat ID run baru. Pastikan actor adalah App, commit main benar, attempt 1.
Actions membangun dan menguji kandidat; tunggu permintaan review.

## 5. Dony → Erick → Dony — review dry run

Buka Actions → run baru → Review deployments. Tinjau bukti dahulu, lalu
gunakan candidate ID/core digest aktual dengan
[format komentar approval](HUMAN_APPROVAL_TO_GO.md).

| Urutan | Siapa | Environment / keputusan |
|---|---|---|
| 1 | Dony | release-engineering: Engineering dan scope Compare |
| 2 | Erick | release-legal: hak, source dan tiga exception |
| 3 | Dony | release: keputusan Release Steward |

Jika review ditolak, perbaiki penyebabnya. Sesudah ketiganya diterima, Actions
otomatis menjalankan actual NC22–NC24 dan mengunggah proof.

## 6. Dony (Maintainer) — validasi proof

Gunakan checkout commit/policy yang sama dengan dry run:

```bash
read -r -p "ID dry run: " TILEO_DRY_RUN_ID
gh run watch "$TILEO_DRY_RUN_ID" --repo enygma-id/TileO --exit-status
TILEO_PROOF_DIR="$(mktemp -d /tmp/tileo-proof.XXXXXXXX)"
gh run download "$TILEO_DRY_RUN_ID" --repo enygma-id/TileO --name tileo-0.1.0-core-evidence --dir "$TILEO_PROOF_DIR/core"
node scripts/verify-approval-negative-proof.js --candidate "$TILEO_PROOF_DIR/core/candidate.json" --run-id "$TILEO_DRY_RUN_ID" --out-dir "$TILEO_PROOF_DIR/validated"
```

**Lanjut jika:** run sukses, validator exit 0 dan
`NEGATIVE_PROOF_VALIDATED_NOT_AUTHORIZATION`. Simpan bukti dan URL run.
Proof maksimal tujuh hari; perubahan source/policy memerlukan proof baru.

## 7. Dony (melalui App) — mulai produksi setelah siap publikasi

Buat run baru pada commit main yang sama:
`publish=true`, `push_latest=false`, `negative_proof_run_id=ID_DRY_RUN`.
Gunakan installation token App seperti langkah 4.

**Run ini dapat membuat tag, Release dan push image setelah seluruh gate lulus.**

## 8. Dony → Erick → Dony — review kandidat produksi

Ulangi urutan langkah 5 menggunakan candidate/core/image produksi yang baru.
Approval dry run tidak diwariskan. Jangan rebuild setelah approval.

**GO:** Actions harus menerima seluruh gate teknis G1–G6, approval asli G7,
proof tepercaya G8, dan menghasilkan authorization serta authorized closure
untuk kandidat produksi yang sama. Pending/gagal berarti belum GO.

## 9. Dony dan Erick — periksa hasil publikasi

Actions memverifikasi source publik anonim sebelum image push dan verifikasi
penuh sesudah push. Rilis selesai hanya jika receipt `PUBLISHED_VERIFIED`.

Simpan authorized closure, proof, approvals, receipts, checksum, identitas
commit/core/image, URL Actions dan Release. Jika gagal, catat command, exit
code dan log; jangan mengganti hasil secara manual.
>>>>>>> Stashed changes
