# TileO 0.1.0 — human approval sampai GO

Dokumen ini menjelaskan pekerjaan manusia yang tidak dapat digantikan test atau
perubahan JSON. Status sekarang **BELUM GO**. WSL 968ece0 memiliki bukti teknis
konsisten, tetapi source baru F01/F02 membutuhkan kandidat protected Actions
baru. Lihat [petunjuk mandiri](FINAL_REAUDIT_SELF_SERVICE.md) untuk commands.

## Pemilik tugas dan blocker saat dokumen disiapkan

| Tugas | PIC yang dikonfirmasi | Bukti/hasil yang diperlukan |
|---|---|---|
| Engineering | donyariefianto, ID 56543110 | Review image/core/tests dan keputusan Compare eksplisit |
| Legal/IP | erickkarya, ID 58256885 | Clearance rights first-party/Enterprise dan EXC-001/002/003 |
| Release Steward | donyariefianto, ID 56543110 | Keputusan release setelah kedua review dan proof valid |
| Setting repository | Administrator dengan akses administration | Raw environment/branch settings + checker exit 0 |
| Dispatch workflow | Operator ketiga atau GitHub App yang sah | Run actor di luar dua reviewer, akses dispatch |

Pemilik menyatakan operator ketiga/App **belum ada**. Environment IDs diketahui,
tetapi snapshot live masih tanpa required-reviewer rules dan bypass aktif.
Proteksi main belum terbukti (GET publik mendapat HTTP 401). Ini blocker F03
yang harus diselesaikan admin. Agent tidak memiliki kredensial admin/gh CLI.

Jangan mengubah policy menjadi CONFIGURED secara manual. Jalankan checker live
sesudah pengaturan benar, review/commit policy yang dihasilkan, lalu merge source.
Jangan mematikan prevent-self-review agar kedua akun dapat melewati blocker.
GitHub melarang initiator menyetujui deployment sendiri ketika proteksi tersebut
aktif. Operator/App hanya memulai run; approval tetap dua manusia asli.

## Yang diperiksa sebelum menekan Approve

Setiap reviewer mengambil candidate ID, commit, image identity dan **core manifest
SHA-256 dari summary/artifact run yang sedang menunggu**, bukan angka dari WSL
atau run lain. Download core/image/closure dari run itu dan periksa checksum.
Jangan menganggap hijau CI/PR sebagai approval image. Jangan approve jika ada
hash berbeda, temuan wajib terbuka atau materi yang tidak dapat ditinjau.

Engineering memeriksa final-image inventory tanpa baseline historis, SBOM final,
GCC/CA binding, 130 integration tests atau jumlah aktual yang diwajibkan source,
browser/Compose, controls, provenance dan manifest. Compare skip harus diputuskan:
jika pengecualian diterima untuk 0.1.0, nyatakan eksplisit; jika ditolak, jangan
approve—perbaiki/uji fitur atau scope policy sebelum freeze kandidat pengganti.

Legal/IP memeriksa source/notice/exception register, cara delivery GCC/Mozilla,
serta hak first-party/Enterprise. Proposed CLA bukan bukti persetujuan penulis.
Jika rights/exception belum clear, jangan approve. Technical source VERIFIED
tidak otomatis memberi clearance Legal/IP.

Steward memeriksa kedua review berasal dari manusia berbeda, subject sama,
source-access routes benar, proof NC22–NC24 tepercaya dan keputusan distribusi.
Keputusan dry run bukan izin menggunakan approval itu pada produksi.

## Cara memberi keputusan yang dapat diverifikasi

Di Actions → run aktual → Review deployments, pilih environment role sendiri.
Hanya pilih Approve setelah benar-benar menerima hasil review. Comment wajib
berisi candidate ID dan core digest aktual, serta statement role berikut.
Contoh format (ganti dua placeholder dengan nilai run saat ini):

Engineering, environment release-engineering:

```text
ACTUAL_CANDIDATE_ID ACTUAL_CORE_SHA256 COMPARE_SCOPE=ACCEPT_EXCLUSION
```

Legal/IP, environment release-legal:

```text
ACTUAL_CANDIDATE_ID ACTUAL_CORE_SHA256 RIGHTS=APPROVE EXCEPTIONS=EXC-001,EXC-002,EXC-003
```

Release Steward, environment release:

```text
ACTUAL_CANDIDATE_ID ACTUAL_CORE_SHA256 REVIEW=ACCEPT
```

Statement ini adalah rekaman keputusan manusia asli, bukan kata sandi untuk
melewati gate. Jika menolak, gunakan Reject dan tulis alasan. Approval collector
memeriksa event asli GitHub, user/environment IDs, comment, run/attempt dan
proteksi live. File lokal, review PR, atau copy approval run lain tidak cukup.

## Dry run dahulu, produksi dengan review baru

1. Operator memulai publish=false, attempt 1, dari main hasil review.
2. Reviewer memberi keputusan asli atas candidate/core dry run. Bila gagal,
   hentikan; jangan menciptakan approval pengganti.
3. Harness actual collector/certifier menguji missing/rejected/unauthorized role,
   wrong candidate/core, serta replay run/attempt. Logs harus exit 1 dengan alasan
   tepat, baseline G1–G7 lulus, dan tidak ada production PASS.
4. Run selesai success dan proof artifact divalidasi terhadap GitHub API digest,
   source/policy hashes, raw logs dan subject dry run. NC22–NC24 di frozen core
   tetap pending; proof eksternal adalah bukti tambahan, bukan edit core.
5. Setelah keputusan publikasi nyata, operator memulai run produksi baru pada
   commit yang sama dengan proof run ID itu. Proof maksimal tujuh hari. Run
   produksi membangun satu candidate lalu meminta **approval baru** atas
   image/core/run produksinya. Jangan rebuild setelah approval.

## Kapan boleh menyebut GO dan selesai

- [ ] F01: actual protected negative-proof artifact + raw logs tervalidasi;
  bukan hanya unit fixture atau JSON status PASS buatan caller.
- [ ] F02: image final tidak mengandung SBOM/notices baseline; post-scanner
  verifier dan seluruh dependent evidence lulus untuk kandidat baru yang sama.
- [ ] F03: proteksi/reviewer policy valid, source masuk main melalui review,
  operator tersedia, keputusan Compare dan rights/exception asli tersedia.
- [ ] G7: approval Engineering, Legal/IP, Steward asli, lengkap, subject-bound,
  fresh untuk run/attempt produksi dan dua manusia review utama berbeda.
- [ ] G8: prior dry-run proof dari exact commit/implementation/policy, age ≤7
  hari, run success/attempt 1, artifact digest/raw records valid. Proof regresi
  tidak menggantikan approval production image.
- [ ] Final authorization dan authorized closure benar-benar dihasilkan oleh
  protected flow; PASS menunjuk candidate/core/image/run yang tepat.

**GO memulai publikasi** baru boleh dicatat jika semua item di atas selesai.
Tidak ada command yang sah untuk mengubah NO-GO menjadi GO dengan edit status.
Jika publish=true sudah dipilih dan reviewer menyetujui, workflow akan melanjutkan
publikasi setelah guard lulus; review final harus mempertimbangkan konsekuensi ini.

- [ ] F04: exact source assets publik tersedia dan anonymous source-access check
  berhasil sebelum image push.
- [ ] Exact saved image dipush tanpa rebuild, lalu tag/assets/registry identity
  diverifikasi penuh dengan status PUBLISHED_VERIFIED.
- [ ] Release URL, source-access/full receipts, raw logs dan checksum tersimpan
  di luar frozen core dan disertakan pada handoff.

**Release selesai** baru boleh dicatat sesudah F04 lulus. Jika source berhasil
tetapi push/registry gagal, status parsial harus dipertahankan; jangan menyatakan
rilis selesai atau mengganti assets diam-diam. Semua blocker menyebut owner,
command/exit/reason dan tindakan nyata yang masih diperlukan.
