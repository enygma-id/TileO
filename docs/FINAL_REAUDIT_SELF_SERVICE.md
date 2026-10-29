# TileO 0.1.0 — petunjuk mandiri F01–F04

Baca bersama [Human approval sampai GO](HUMAN_APPROVAL_TO_GO.md) dan
[kontrak proof NC22–NC24](APPROVAL_NEGATIVE_PROOF.md).
Ini petunjuk pelaksanaan, bukan approval atau claim release selesai.

## Titik lanjut yang benar

Kandidat WSL `968ece0…` tetap paket teknis historis yang konsisten dan pending
approval. F01/F02 mengubah source/image: kandidat tersebut tidak menjadi final
GO dan approval/hash-nya tidak dipindahkan. Root 53f dan seluruh workspace ZIP
tidak dipilih sebagai release asset.

Implementasi baru mengeluarkan baseline historis dari image, memeriksa final
SBOM setelah scanner, serta mewajibkan G8 proof eksternal sebelum PASS produksi.
Dry run sekarang benar-benar menjalankan actual collector/certifier dengan
attestation serangan terisolasi; pending di core tetap utuh. Perbaikan CA runner
root ownership dan PUB-01–PUB-03 dipertahankan.

## 1. Periksa checkout dan hasil kerja

```bash
cd /mnt/d/kerja/enygma-id/ubuntu/tileo-clean
git log -3 --oneline
git status --porcelain=v1 --untracked-files=all
git diff --check
```

Commit implementasi harus tersedia. Jangan membangun kandidat bila status masih
dirty atau konfigurasi policy belum selesai. Jangan memakai candidate.env lama
untuk mengklaim proof kandidat baru. Agent menyimpan log non-Docker di
`artifacts/final-reaudit-20261029/` jika sudah disalin; sumber awal log adalah
`/tmp/tileo-final-reaudit-20261029/` dan metadata publik
`/tmp/tileo-final-reaudit-public-context/`. Tes memakai fixture, bukan approval.

## 2. Administrator memasang proteksi nyata

Gunakan akun admin di repository enygma-id/TileO. Agent tidak memiliki akses
admin dan gh CLI pada shell agen. Di terminal admin, siapkan gh CLI dan login:

```bash
gh auth login
gh repo view enygma-id/TileO --json viewerPermission --jq .viewerPermission
```

Hasil perlu `ADMIN` untuk pekerjaan konfigurasi berikut. Jangan mengubah policy
menjadi CONFIGURED secara manual untuk melewati error collector.

Di GitHub Settings → Branches, pasang **classic branch protection** untuk main:
require pull request, set minimal satu approval independen, pertahankan required
checks yang relevan, enforce aturan untuk administrators, larang force-push dan
deletion. Checker saat ini membaca endpoint classic branch protection; jangan
menganggap ruleset lain otomatis telah lolos checker. Pertahankan aturan lebih
ketat yang sudah ada. Gunakan nama checks aktual, jangan menebak:

```bash
gh api repos/enygma-id/TileO/commits/main/check-runs --jq '.check_runs[].name'
```

Di Settings → Environments, atur tiga environment ini:

| Environment | Required user reviewer | User ID | Environment ID teramati |
|---|---|---:|---:|
| release-engineering | donyariefianto | 56543110 | 25648334569 |
| release-legal | erickkarya | 58256885 | 25648385174 |
| release | donyariefianto | 56543110 | 25436365187 |

Untuk masing-masing: aktifkan required reviewer, **Prevent self-review**,
nonaktifkan administrator bypass, dan izinkan deployment hanya dari protected
branches. ID di atas berasal dari GET API publik, bukan placeholder. Jika
environment dihapus/dibuat ulang, ambil ID baru dan review perubahan policy.
Pemetaan role dikonfirmasi pemilik; ini bukan approval image.

Snapshot yang dibaca agen menunjukkan environment belum protected. Jangan
menganggap job yang melewati environment tanpa required reviewers sebagai
approval manusia.

## 3. Sediakan operator yang dapat memulai run

**Blocker yang masih ada:** pemilik menyatakan belum ada operator ketiga/App.
Dony adalah reviewer Engineering/Steward; Erick reviewer Legal. Keduanya tidak
dapat memulai workflow lalu menyetujui role sendiri dengan prevent-self-review.

Admin harus menunjuk operator terpercaya di luar kedua reviewer dengan akses
dispatch yang diperlukan, atau memasang GitHub App operasional dengan izin
dispatch yang disetujui admin. Service actor hanya memulai run; tidak memberikan
approval manusia. Jangan menonaktifkan self-review atau menciptakan approval
palsu. Bila operator belum tersedia, F03 tetap BLOCKED dan berhenti sebelum
dispatch. Dokumentasi GitHub:
https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments

Jika memilih App, admin membuat GitHub App milik organisasi, memberi repository
permissions **Actions: Read and write** dan **Metadata: Read**, memasangnya hanya
pada TileO, lalu memperoleh installation access token melalui prosedur resmi.
Simpan private key/token dalam penyimpanan admin; App tidak dimasukkan ke daftar
human reviewers. Petunjuk autentikasi resmi:
https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app

Token installation App dapat dipakai lokal untuk satu dispatch publish=false:

```bash
read -rs -p "GitHub App installation token: " TILEO_APP_TOKEN
GH_TOKEN="$TILEO_APP_TOKEN" gh workflow run release.yml --repo enygma-id/TileO --ref main -f publish=false -f push_latest=false
unset TILEO_APP_TOKEN
```

Pastikan run actor benar-benar App tersebut, bukan reviewer, melalui halaman
run atau `gh run view ACTUAL_RUN_ID --repo enygma-id/TileO --json event,headSha,url`.
Untuk melihat actor secara langsung:
`gh api repos/enygma-id/TileO/actions/runs/ACTUAL_RUN_ID --jq '.actor.login'`.
Jangan melanjutkan bila identitas/izin App belum dapat diverifikasi admin.

## 4. Verifikasi setting lalu finalkan policy source

Sesudah admin benar-benar mengatur seluruh proteksi, jalankan dari checkout:

```bash
TILEO_ADMIN_BASE="$(mktemp -d /tmp/tileo-protection-check.XXXXXXXX)"
TILEO_ADMIN_CHECK="$TILEO_ADMIN_BASE/check"
node scripts/check-release-protections.js --out-dir "$TILEO_ADMIN_CHECK" --write-policy
```

Script membuat direktori baru sendiri. Lanjut hanya jika exit 0 dan
`PROTECTIONS_VERIFIED`. Script membaca setting asli via gh dan menyimpan raw
JSON + SHA-256; `--write-policy` hanya mengubah local reviewers.json menjadi
CONFIGURED setelah semua pemeriksaan lulus. Itu belum approval image/core.
Simpan direktori bukti ini ke penyimpanan review bersama; jangan hanya di /tmp.

Jika HTTP 401/403: admin perlu autentikasi/izin membaca administration settings.
Jika mismatch: perbaiki setting/ID sebenarnya dan jalankan checker ke direktori
baru. Jangan mengedit hasil report. Lalu review diff policy:

```bash
git diff -- release-policy/reviewers.json
git add release-policy/reviewers.json
git commit -m "configure verified protected release reviewers"
```

## 5. Source masuk GitHub melalui review

Push source ke branch remediasi dan buat PR ke main sesuai aturan repository.
Jika checkout masih berada di main lokal dengan commit remediasi yang belum
dipush, contoh:

```bash
git switch -c release-010-final-reaudit
git push -u origin release-010-final-reaudit
gh pr create --base main --head release-010-final-reaudit --title "Close 0.1.0 approval-proof and runtime baseline findings" --body "Implement F01/F02 and verified reviewer policy. Protected candidate/image reviews and publication authorization remain separate."
```

Review/merge PR oleh orang berwenang. PR approval tidak menyetujui image yang
belum dibangun. Setelah merge, gunakan commit main hasil merge untuk semua run:

```bash
git switch main
git pull --ff-only
git rev-parse HEAD
git status --porcelain=v1 --untracked-files=all
```

Jika main lokal divergen karena merge strategy, jangan force/reset. Gunakan
checkout/worktree bersih dari origin/main dan pertahankan branch lokal lama.

## 6. Protected publish=false — proof nyata

Operator ketiga/App memulai workflow **Protected 0.1.0 Release** pada main,
publish=false, push_latest=false, negative_proof_run_id kosong. Melalui gh CLI
yang login sebagai operator yang tepat:

```bash
gh workflow run release.yml --repo enygma-id/TileO --ref main -f publish=false -f push_latest=false
gh run list --repo enygma-id/TileO --workflow release.yml --limit 5
```

Catat run ID/URL dan commit. Jangan memakai Re-run jobs pada commit lama;
attempt harus 1. Pantau run ID aktual (ganti ACTUAL_RUN_ID):

```bash
gh run watch ACTUAL_RUN_ID --repo enygma-id/TileO --exit-status
gh run view ACTUAL_RUN_ID --repo enygma-id/TileO --json url,headSha,attempt,status,conclusion
```

Workflow membuat satu image dari Git archive, source/runtime bindings, inventory,
SBOM final, integration/browser/Compose, controls, provenance, eligibility,
report, manifest dan review package. Scanner memeriksa image tanpa baseline
historis. GCC/CA yang autentik tetap diverifikasi terhadap image baru.

Saat menunggu review, ikuti dokumen HUMAN_APPROVAL_TO_GO.md. Sesudah review asli,
harness memanggil collector/certifier nyata untuk tujuh variasi NC22–NC24,
merekam exit/reason/log hashes serta PASS absence. G8 tetap memblokir baseline
dry run dari membuat production PASS. Artifact proof sukses hanya diunggah jika
validator lulus. Artifact FAILED-DIAGNOSTICS tidak diterima untuk otorisasi.

## 7. Periksa proof dan artifact dry run

Download exact core dan proof untuk review (direktori baru):

```bash
TILEO_REVIEW_DIR="$(mktemp -d /tmp/tileo-dry-review.XXXXXXXX)"
gh run download ACTUAL_RUN_ID --repo enygma-id/TileO --name tileo-0.1.0-core-evidence --dir "$TILEO_REVIEW_DIR/core"
gh run download ACTUAL_RUN_ID --repo enygma-id/TileO --name tileo-approval-negative-proof --dir "$TILEO_REVIEW_DIR/proof"
node scripts/verify-approval-negative-proof.js --candidate "$TILEO_REVIEW_DIR/core/candidate.json" --run-id ACTUAL_RUN_ID --out-dir "$TILEO_REVIEW_DIR/validated-proof"
```

Lanjut hanya jika service run completed/success, attempt 1, exact commit/policy,
dan `NEGATIVE_PROOF_VALIDATED_NOT_AUTHORIZATION` exit 0. Validator mengambil ZIP
artifact asli via API dan mencocokkan service digest; JSON PASS lokal saja tidak
diterima. Simpan ZIP, receipt, raw logs, URL, core dan report terverifikasi.

## 8. Production authorization dan publikasi

Ini tahap baru yang membutuhkan persetujuan publikasi nyata. Setelah prasyarat
GO di dokumen manusia terpenuhi, operator menjalankan **run baru** pada exact
main commit yang sama, publish=true, push_latest=false, dan
negative_proof_run_id=ACTUAL_DRY_RUN_ID. Batas reuse proof tujuh hari, exact
implementation/policy/commit. Perubahan source/policy memerlukan proof baru.

Production membangun kandidatnya satu kali dan memperoleh **review baru** atas
candidate/core/image milik run produksi. Proof dry run tidak mengesahkan image
produksi. Jangan mengisi publish=true untuk sekadar membuat audit lulus: sesudah
approval asli dan G7/G8, workflow ini memang dapat membuat tag/release/push.

G8 menolak proof hilang/failed/pending/stale/salah subject/policy/digest atau run
tak tepercaya. Final package dan publish guard memvalidasi ulang. Tidak ada
rebuild sesudah review. Assets/source publik diunggah lebih dulu, unduhan anonim
harus lulus sebelum image push. Verifikasi penuh sesudah push wajib lulus.

## 9. Jika gagal dan paket untuk auditor

Simpan command, run URL/attempt/commit, exit code, raw stdout/stderr, receipt dan
SHA-256. Jika command hilang karena runner mati, exit unknown, bukan PASS.
Retry memakai folder/run baru; jangan clobber assets, edit pending core, atau
mengambil source/SBOM dari kandidat lain. Source/policy berubah berarti subject
baru dan approval lama tidak dipakai.

Kirim closure terpilih, image export, core manifest dan checksum, source/proof
receipts, admin evidence dan URL protected runs/PR. Setelah publikasi sah,
sertakan Release URL, source-access dan full publication receipts. Jangan kirim
ZIP seluruh workspace sebagai distribusi final. Status sebelum itu belum GO.
