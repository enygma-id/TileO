# TileO 0.1.0 — approval sampai GO

**Status sekarang: belum GO.** Test lulus dan checksum cocok belum merupakan
approval. Ikuti [langkah mandiri](FINAL_REAUDIT_SELF_SERVICE.md) untuk commands.

## Siapa mengerjakan apa?

| PIC | Tugas |
|---|---|
| Admin repository | Pasang proteksi main/environment, verifikasi setting, review/commit policy |
| Operator ketiga / GitHub App | Memulai workflow; tidak memberikan approval manusia |
| donyariefianto — Engineering | Review image/core/tests dan putuskan scope Compare |
| erickkarya — Legal/IP | Review hak first-party/Enterprise, tiga exception, source dan notices |
| donyariefianto — Release Steward | Terima atau tolak release setelah review/proof lengkap |

**Blocker saat ini:** operator ketiga/App belum ada dan proteksi belum
terverifikasi. Dony/Erick tidak dapat memulai run lalu menyetujui role sendiri
karena `Prevent self-review`. Jangan melemahkan aturan itu.

Jika memakai App, admin membuat dan memasangnya hanya pada TileO dengan
**Actions: Read and write**, **Metadata: Read**, lalu memakai installation token
untuk dispatch. App tidak dimasukkan sebagai human reviewer. Ikuti
[panduan token resmi](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app).
Periksa actor run benar-benar operator/App yang dipilih sebelum review.

## Apa yang harus ditinjau?

Ambil candidate ID, commit, image identity dan **core SHA-256 dari run yang
sedang menunggu**, lalu periksa artifact core/image beserta checksumnya.
Gunakan subject yang sama untuk ketiga review.

- **Engineering:** inventory tanpa baseline historis, SBOM final, GCC/CA binding,
  tests/browser/Compose, controls dan manifest. Terima atau tolak Compare skip
  secara eksplisit. Jika ditolak, perbaiki scope/fitur dan buat kandidat baru.
- **Legal/IP:** putuskan clearance hak dan EXC-001/002/003, termasuk source
  delivery dan notices. Proposed CLA bukan bukti persetujuan penulis.
- **Steward:** pastikan review utama dari dua manusia berbeda, subject cocok,
  proof valid dan distribusi memang diizinkan.

**Jika belum menerima hasil review, pilih Reject atau jangan approve.** Review
PR tidak menggantikan review image. Approval run lama tidak dipakai ulang.

## Cara memberi approval

Actions → run aktual → **Review deployments** → pilih environment role sendiri.
Sesudah review nyata, pilih Approve dengan comment berikut. Ganti `CANDIDATE_ID`
dan `CORE_SHA256` dengan nilai aktual dari run itu:

| Role / environment | Comment |
|---|---|
| Engineering / release-engineering | `CANDIDATE_ID CORE_SHA256 COMPARE_SCOPE=ACCEPT_EXCLUSION` |
| Legal/IP / release-legal | `CANDIDATE_ID CORE_SHA256 RIGHTS=APPROVE EXCEPTIONS=EXC-001,EXC-002,EXC-003` |
| Steward / release | `CANDIDATE_ID CORE_SHA256 REVIEW=ACCEPT` |

Comment adalah rekaman keputusan asli, bukan teks untuk sekadar melewati gate.
Collector memeriksa user/environment IDs, proteksi live, event GitHub, subject
dan run/attempt. File approval lokal buatan sendiri tidak diterima.

## Urutan dry run dan produksi

1. Operator memulai **publish=false** pada main yang sudah direview.
2. Tiga reviewer meninjau kandidat dry run dan memberi keputusan asli.
3. Harness menjalankan actual NC22–NC24; run harus success, attempt 1, dan proof
   tervalidasi. Dry run tidak menghasilkan production PASS.
4. Setelah keputusan publikasi nyata, operator memulai **run produksi baru**
   pada commit yang sama, memakai proof run ID tersebut (maksimal tujuh hari).
5. Reviewer memberi **review dan approval baru** atas candidate/core/image
   produksi. Tidak ada rebuild setelah approval.

## Checklist GO

- [ ] Proteksi dan reviewer policy terverifikasi; operator tersedia.
- [ ] Source/policy masuk main melalui review; satu kandidat produksi dengan
  seluruh evidence cocok dan baseline historis tidak ada dalam image.
- [ ] Actual NC22–NC24 proof + raw logs lolos validator G8; bukan unit fixture.
- [ ] Scope Compare dan hak/exception diterima reviewer asli.
- [ ] G7 menerima tiga approval asli untuk candidate/core/run produksi yang sama.
- [ ] Final authorization dan authorized closure benar-benar dihasilkan.

Jika semua terpenuhi: **GO memulai publikasi**. Run `publish=true` dapat langsung
melanjutkan tag/Release/push setelah guard lulus; reviewer harus memahami ini.

- [ ] Source assets publik lolos anonymous verification sebelum image push.
- [ ] Exact image dipush tanpa rebuild dan full verification `PUBLISHED_VERIFIED`.
- [ ] Release URL dan receipts disimpan di luar frozen core untuk handoff.

Sesudah tiga item terakhir: **release selesai**. Jika publikasi hanya berhasil
sebagian, catat status parsial dan blocker. Jangan mengedit pending/PASS atau
mengganti assets diam-diam untuk membuat status tampak selesai.
