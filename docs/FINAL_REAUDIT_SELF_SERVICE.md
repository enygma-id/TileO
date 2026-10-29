<<<<<<< Updated upstream
# TileO 0.1.0 — langkah mandiri

**Mulai dari langkah 1.** Saat ini belum GO: proteksi GitHub dan operator masih
perlu disiapkan. Kandidat WSL `968ece0…` tetap historis; kandidat final dibuat
oleh protected Actions dari source/policy terbaru yang sudah direview.

## 1. Admin mengatur GitHub

Di repository **enygma-id/TileO → Settings**:

- **Branches:** classic protection untuk `main`; wajib PR dan minimal satu
  approval, required checks yang relevan, aturan berlaku untuk admin,
  force-push dan deletion dilarang.
- **Environments:** atur tabel berikut. Pada ketiganya aktifkan **Prevent
  self-review**, matikan admin bypass, dan pilih **Protected branches only**.

| Environment | Required reviewer |
=======
# TileO 0.1.0 — petunjuk mandiri

Ikuti urutan ini. Jika gagal, simpan log dan perbaiki sebelum lanjut.
Perintah dijalankan dari root checkout TileO: Mac Erick atau WSL Dony.
Gunakan Git, Node.js dan GitHub CLI. Checker admin tidak membutuhkan Docker.

## 1. Erick (Admin) — konfigurasi GitHub

Di Settings repo `enygma-id/TileO`:

- **Branches:** classic protection untuk `main`; wajib PR dan minimal satu
  approval, enforce admin, larang force-push/deletion. Pertahankan required
  checks yang relevan.
- **Environments:** required reviewer sesuai tabel. Pada ketiganya aktifkan
  **Prevent self-review**, matikan admin bypass, pilih **Protected branches only**.

| Environment | Reviewer |
>>>>>>> Stashed changes
|---|---|
| release-engineering | donyariefianto |
| release-legal | erickkarya |
| release | donyariefianto |
<<<<<<< Updated upstream

## 2. Siapkan operator

Run harus dimulai oleh **akun ketiga atau GitHub App**, bukan Dony/Erick karena
mereka reviewer. Saat ini operator belum tersedia. Admin harus menyiapkannya;
jika belum ada, berhenti di sini. Jangan mematikan self-review.

Panduan App dan tugas reviewer: [Human approval sampai GO](HUMAN_APPROVAL_TO_GO.md).

## 3. Verifikasi proteksi dan commit policy

Jalankan sebagai admin dengan gh CLI yang sudah login:

```bash
cd /mnt/d/kerja/enygma-id/ubuntu/tileo-clean
gh auth login
=======

Login gh sebagai Erick dan jalankan:

```bash
gh auth login
gh api user --jq .login
gh repo view enygma-id/TileO --json viewerPermission --jq .viewerPermission
>>>>>>> Stashed changes
TILEO_ADMIN_DIR="$(mktemp -d /tmp/tileo-admin.XXXXXXXX)"
node scripts/check-release-protections.js --out-dir "$TILEO_ADMIN_DIR/check" --write-policy
```

<<<<<<< Updated upstream
Lanjut hanya jika **exit 0 dan `PROTECTIONS_VERIFIED`**. Simpan folder bukti
tersebut. Jika gagal, perbaiki setting/izin sebenarnya; jangan mengedit status.

```bash
git diff -- release-policy/reviewers.json
git add release-policy/reviewers.json
git commit -m "configure verified protected release reviewers"
```

## 4. Masukkan source melalui PR

Jika masih di main lokal dengan commit remediasi yang belum dipush:

```bash
git switch -c release-010-final-reaudit
git push -u origin release-010-final-reaudit
```

Buat PR branch itu ke `main`, minta review, lalu merge sesuai aturan repository.
Gunakan commit main hasil merge untuk dry run dan produksi. PR approval belum
merupakan approval image. Pastikan checkout untuk pemeriksaan berikut memakai
implementasi/policy hasil merge yang sama; jika main lokal divergen, gunakan
checkout bersih dan pertahankan branch lama.

## 5. Jalankan dry run

Operator membuka **Actions → Protected 0.1.0 Release → Run workflow**:

| Input | Nilai |
|---|---|
| Branch | main |
| publish | false |
| push_latest | false |
| negative_proof_run_id | kosong |

Workflow membuat kandidat baru dan berhenti meminta review. Reviewer mengikuti
[petunjuk approval](HUMAN_APPROVAL_TO_GO.md). Setelah review asli, workflow
menjalankan serangan NC22–NC24 dan menyimpan proof. **Wajib run success dan
attempt 1.** Mulai run baru jika source berubah; Re-run jobs memakai source lama.

## 6. Periksa proof

Dari checkout implementasi/policy yang sama, masukkan ID dry run yang sukses:

```bash
read -rp "Run ID dry run: " TILEO_DRY_RUN_ID
TILEO_REVIEW_DIR="$(mktemp -d /tmp/tileo-review.XXXXXXXX)"
gh run download "$TILEO_DRY_RUN_ID" --repo enygma-id/TileO --name tileo-0.1.0-core-evidence --dir "$TILEO_REVIEW_DIR/core"
node scripts/verify-approval-negative-proof.js --candidate "$TILEO_REVIEW_DIR/core/candidate.json" --run-id "$TILEO_DRY_RUN_ID" --out-dir "$TILEO_REVIEW_DIR/validated-proof"
```

Wajib **exit 0 dan `NEGATIVE_PROOF_VALIDATED_NOT_AUTHORIZATION`**.
Simpan core, ZIP proof, report, raw logs dan URL run. Pending di core tidak diedit.

## 7. Produksi, setelah keputusan publikasi nyata

Operator membuat **run baru** pada commit main yang sama:

- `publish=true`, `push_latest=false`.
- `negative_proof_run_id` = ID dry run sukses; proof maksimal tujuh hari.
- Reviewer memberi **approval baru** atas candidate/core/image run produksi.

**Perhatian: run ini benar-benar dapat membuat tag, Release dan push image
setelah approval serta guard lulus.** Tidak ada rebuild sesudah approval.
Source assets diverifikasi anonim sebelum image push; verifikasi penuh sesudahnya.

## 8. Kapan selesai?

Release selesai hanya jika **`PUBLISHED_VERIFIED`** dan receipts tersedia.
Kirim closure final, image export, manifest/checksum, proof, approval, URL run
dan Release. Jangan kirim ZIP seluruh workspace atau root evidence lama.

Jika gagal: simpan command, exit code, stdout/stderr dan URL run; hentikan tahap
berikutnya. Jangan mengubah hasil menjadi PASS atau menimpa assets diam-diam.

Detail teknis: [kontrak proof](APPROVAL_NEGATIVE_PROOF.md).
Log pekerjaan: `artifacts/final-reaudit-20261029/`.
=======
**Lanjut jika:** akun `erickkarya`, izin Admin/token sesuai, checker
`PROTECTIONS_VERIFIED`, exit 0. Jika 404/403, periksa izin token dan rule.
Jika environment dibuat ulang, ID policy perlu diperbarui melalui review.
Jangan mengubah status CONFIGURED secara manual. Simpan folder bukti checker.

## 2. Erick membuat PR; Dony meninjau — finalkan source

Review perubahan `release-policy/reviewers.json`, commit, lalu masukkan melalui
PR ke main. Setelah merge, gunakan checkout bersih dari main hasil merge.

**Lanjut jika:** semua perbaikan/policy sudah direview dan berada di main,
status Git bersih. PR approval belum menjadi approval image.
Jangan memakai candidate.env WSL lama atau memindahkan approval kandidat lama.

## 3. Erick (Admin) — siapkan App operator

Buat GitHub App, beri **Actions Read/write**, **Metadata Read**, lalu install
hanya pada TileO. Buat private key dan installation token; simpan rahasia.
App memulai run, Dony/Erick memberi review lewat akun pribadi masing-masing.
Tidak perlu akun manusia ketiga.

Petunjuk App dan keputusan reviewer: [HUMAN_APPROVAL_TO_GO.md](HUMAN_APPROVAL_TO_GO.md).

**Lanjut jika:** installation token tersedia dan App terpasang pada TileO.

## 4. Dony melalui App — jalankan dry run

```bash
read -rs -p "Installation token App: " TILEO_APP_TOKEN
echo
GH_TOKEN="$TILEO_APP_TOKEN" gh workflow run release.yml --repo enygma-id/TileO --ref main -f publish=false -f push_latest=false
unset TILEO_APP_TOKEN
gh run list --repo enygma-id/TileO --workflow release.yml --limit 5
```

Catat run ID/URL. Pastikan actor App, commit main benar, attempt 1.
Actions membangun image dan meregenerasi seluruh bukti kandidat.
Jangan memakai Re-run jobs untuk mengganti commit.

## 5. Dony → Erick → Dony — review dry run

Buka run Actions → Review deployments, sesuai permintaan workflow:

| Urutan | Reviewer | Environment |
|---|---|---|
| 1 | Dony: Engineering, termasuk scope Compare | release-engineering |
| 2 | Erick: Legal/IP, source, hak dan tiga exception | release-legal |
| 3 | Dony: Release Steward | release |

Periksa artifact dahulu. Pakai candidate ID/core digest dari Summary dan
[format komentar keputusan](HUMAN_APPROVAL_TO_GO.md). Reject jika tidak menerima.
Sesudah ketiganya diterima, Actions menjalankan actual NC22–NC24.

## 6. Dony (Maintainer) — validasi proof

Gunakan checkout commit/policy yang sama dengan dry run:

```bash
read -r -p "ID dry run: " TILEO_DRY_RUN_ID
gh run watch "$TILEO_DRY_RUN_ID" --repo enygma-id/TileO --exit-status
TILEO_REVIEW_DIR="$(mktemp -d /tmp/tileo-review.XXXXXXXX)"
gh run download "$TILEO_DRY_RUN_ID" --repo enygma-id/TileO --name tileo-0.1.0-core-evidence --dir "$TILEO_REVIEW_DIR/core"
node scripts/verify-approval-negative-proof.js --candidate "$TILEO_REVIEW_DIR/core/candidate.json" --run-id "$TILEO_DRY_RUN_ID" --out-dir "$TILEO_REVIEW_DIR/validated-proof"
```

**Lanjut jika:** run success, validator exit 0 dan
`NEGATIVE_PROOF_VALIDATED_NOT_AUTHORIZATION`. Simpan ZIP proof, core, report,
raw logs dan URL run. FAILED-DIAGNOSTICS bukan proof sah; pending core tidak diedit.

## 7. Dony melalui App — produksi setelah siap publikasi

Buat run baru dengan installation token App, commit main yang sama:

- `publish=true`
- `push_latest=false`
- `negative_proof_run_id` = ID dry run sukses

Proof maksimal tujuh hari. Perubahan source/policy memerlukan proof baru.
**Run ini dapat membuat tag, Release dan push image setelah seluruh gate lulus.**

## 8. Dony → Erick → Dony — review produksi

Ulangi review langkah 5 memakai candidate/core/image produksi yang baru.
Approval dry run tidak diwariskan. Jangan rebuild sesudah approval.

**GO:** seluruh gate teknis G1–G6, approval asli G7 dan proof tepercaya G8 lulus,
authorization serta authorized closure terikat kandidat produksi yang sama.

## 9. Dony dan Erick — periksa hasil akhir

Rilis selesai hanya jika source-access anonim lulus sebelum image push dan
verifikasi penuh sesudah push menghasilkan `PUBLISHED_VERIFIED`.

Simpan closure final, image export, source, SBOM, manifest/checksum, proof,
approval, admin evidence, receipts serta URL PR/Actions/Release.
Gunakan asset set final; kandidat WSL lama dan ZIP seluruh workspace bukan
paket distribusi final.

Jika gagal, catat command, exit code dan raw log. Exit yang tidak diketahui
bukan PASS. Jangan mencampur kandidat, menimpa evidence, atau mengubah status.

Detail kontrol: [APPROVAL_NEGATIVE_PROOF.md](APPROVAL_NEGATIVE_PROOF.md).
>>>>>>> Stashed changes
