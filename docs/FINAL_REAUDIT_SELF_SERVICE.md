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
|---|---|
| release-engineering | donyariefianto |
| release-legal | erickkarya |
| release | donyariefianto |

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
TILEO_ADMIN_DIR="$(mktemp -d /tmp/tileo-admin.XXXXXXXX)"
node scripts/check-release-protections.js --out-dir "$TILEO_ADMIN_DIR/check" --write-policy
```

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
