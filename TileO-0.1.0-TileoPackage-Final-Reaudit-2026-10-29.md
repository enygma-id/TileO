# Audit akhir TileoPackage.zip — kesiapan rilis publik 0.1.0

Tanggal: 29 Oktober 2026. Bahasa keputusan: Indonesia. Target: rilis publik pertama **0.1.0**.

## 1. Keputusan auditor

**BELUM GO untuk publikasi 0.1.0.** Paket sudah jauh lebih lengkap: bukti teknis kandidat konsisten, source GCC/Mozilla autentik, tiga file runtime cocok, manifest/provenance benar, NC28 selesai, dan perbaikan source-access sudah diimplementasikan serta diuji. Klaim tim `TECHNICALLY_ELIGIBLE_PENDING_APPROVAL` didukung bukti yang diperiksa, tetapi tidak setara dengan otorisasi rilis.

Masih ada dua pekerjaan teknis yang perlu dituntaskan sebelum kandidat terakhir disetujui:

1. **F01 — kontrak penutupan NC22–NC24:** final certifier belum mewajibkan bukti pelaksanaan tiga negative controls approval; harness selalu menuliskannya pending. Menekan approve pada tiga environment saja tidak membuktikan ketiga skenario penolakan itu sudah diuji.
2. **F02 — residu baseline historis:** dua SBOM 22 Oktober dan notices baseline lama masih masuk image melalui `COPY baseline`. SBOM resmi kandidat sudah benar; temuan ini menyangkut materi historis yang masih ikut terdistribusi dan tes yang mengandalkan materi itu.

Selain itu, **F03 — kandidat GitHub dan otorisasi manusia** belum selesai: main publik masih commit lama, protected release terakhir gagal pada commit lama, reviewer policy paket masih pending, dan tidak ada authorization final di closure. **F04 — pembuktian publikasi** merupakan acceptance saat publikasi: source assets harus benar-benar dapat diunduh anonim sebelum image didistribusikan, kemudian registry dan tag diverifikasi. Tidak perlu memublikasikan sekarang hanya untuk membuat pemeriksaan prarilis tampak lulus.

Status yang tepat saat ini: **bukti teknis kandidat terverifikasi; perbaikan akhir terbatas dan protected human closure masih wajib; final release NO-GO.** Ini bukan temuan bahwa source GCC/Mozilla sintetis atau bahwa seluruh pekerjaan perlu diulang dari nol.

Laporan ini memperbarui penilaian kandidat dari laporan revisi 1.1 tanggal 28–29 Oktober. Temuan lama yang sudah tertutup tetap tertutup. File dan hasil lama tidak ditulis ulang.

## 2. Identitas objek audit

| Objek | Identitas |
|---|---|
| ZIP yang diterima | `TileoPackage.zip`, 2.648.555.954 bytes |
| ZIP SHA-256 | `3bf0d2b89624d51456392b93823c5d2e2d9c8c2986ad557e5e1e4456973c952c` |
| Candidate | `candidate-968ece02581d-01` |
| Commit kandidat | `968ece02581dcefb1f56cbcae9682aabee0672d8` |
| Platform | `linux/amd64` |
| Image OCI manifest digest | `sha256:d3e9c158604ec6c42511c9c21ff5b53ec4f000142c978bedab8bef6bb54c7464` |
| Image config digest | `sha256:121af3a963ccd5d2273b18a3b4b85b6e583a61d75ace091e0748df756d97bb2f` |
| Image export | `TileoPackage/tileo-0.1.0-image.tar.gz`, 161.800.889 bytes |
| Export SHA-256 | `7a36ccfe080cc0099cffab9d974ebf8d0abcb1fd545c45452ee9580e3225c7eb` |
| Review closure | `TileoPackage/TileO-v0.1.0-Release-Closure.tar.gz`, 117.703.931 bytes |
| Closure SHA-256 | `eb9b53713054c49ca04acae6cf86bf7fd081edd38a370e8d8cfc17d3ac035c9d` |
| Core manifest SHA-256 | `aa52772fb286c138fae81737b785e77d03b3bec848f0ab754ed895bb70fbf853` |
| First-party source archive SHA-256 | `61e9f2331f7a5910461dfdfcaf9a1b5dd3cd95c2264d45d833041f87e7548782` |

Manifest dan config merupakan objek OCI berbeda; perbedaan dua digest itu bukan kesalahan. Pada export ini identitas image yang dicatat tim cocok dengan OCI manifest. Kandidat Actions nanti harus menggunakan identitas aktual runner-nya secara konsisten.

ZIP adalah **workspace/handoff teknik**, bukan paket publik final: selain dua deliverables di atas, terdapat repository lengkap, banyak percobaan historis, dan root `tileo/release-evidence/v0.1.0/candidate.json` masih menunjuk `candidate-53f57d0edd1b-01`. Audit kandidat ini memakai closure top-level yang disebut `ENGINEERING_HANDOFF.md`, bukan root evidence lama tersebut.

Jangan mengunggah seluruh `TileoPackage.zip` sebagai release final. Distribusikan asset set yang dipilih dari kandidat final. Workspace lama boleh disimpan untuk forensik dengan label superseded; jangan menjadikannya fallback input atau bukti release aktif.

## 3. Pemeriksaan yang dilakukan auditor

Hasil pemeriksaan independen disimpan dalam folder `audit-final-package-results-2026-10-29/` di project audit ini.

| Pemeriksaan | Hasil dan batas bukti |
|---|---|
| Integritas core | 105/105 file cocok ukuran dan SHA-256; tidak ada file core ekstra yang tidak tercatat |
| Integritas closure | 108/108 entri `SHA256SUMS` cocok |
| Final provenance | 103/103 referensi artifact cocok dengan bytes final |
| Source/context | 584 file pada build-context manifest cocok dengan source archive yang disertakan |
| Image export | Ukuran/hash cocok dengan candidate; seluruh blobs SHA-256 valid; labels commit/version/source dan platform cocok |
| Inventaris seluruh image | 18.763 file/symlink pada layers cocok dengan inventaris; tidak ada file layer yang tidak terdaftar |
| Metadata container | Lima entri inventaris hanya ada pada hasil inspeksi container: `.dockerenv`, hostname, hosts, resolv.conf, dan mtab → `/proc/mounts`; tidak diperlakukan sebagai payload layer atau ketidakcocokan program |
| Payload terlarang/PASS | Nama PVRTexToolCLI, texture-compressor, astcenc dan release-gate-pass tidak ditemukan pada payload image; ZIP juga tidak memiliki file `release-gate-pass.json` |
| Tes aplikasi yang diserahkan | TAP asli 130 titik, plan 130, JSON 130 PASS, matrix 130 PASS, exit 0; tidak ada mandatory skip/todo |
| Preflight yang diserahkan | 7 commands exit 0; seluruh hash stdout/stderr yang dirujuk cocok |
| Browser yang diserahkan | 7 passed, 0 failed/flaky, 1 skip Compare yang sudah dideklarasikan; scope approval masih pending |
| Compose yang diserahkan | API/worker memakai candidate image yang sama; job `SUCCEEDED`; artifact MBTiles dan log disertakan |
| Negative controls yang diserahkan | 25 PASS, 0 FAIL, NC22–NC24 pending; NC28 exit 1 dengan alasan penolakan stale PASS yang benar |
| SA01–SA06 | Dijalankan ulang oleh auditor: 6 PASS, 0 FAIL, 0 skip, exit 0 |
| Review asset staging | Dijalankan ulang oleh auditor pada asset set aktual dari ZIP: `STAGED_ASSETS_VERIFIED` |
| GitHub publik | Metadata repo/main, releases, Actions dan jobs diambil ulang melalui API publik |

**Batas pelaksanaan:** komputer audit ini tidak menyediakan executable Docker. Auditor tidak mengklaim menjalankan ulang image, build, 130 tes container, browser, atau Compose. Bukti runtime tersebut diperiksa dari raw records yang diserahkan, konsistensi subject/hash, dan pemeriksaan image offline. SA04 adalah fixture respons HTTP, bukan akses GitHub publik nyata; SA06 menguji partial-status dan urutan workflow, bukan kegagalan registry nyata.

Bukti lokal utama:

- `independent-integrity.json`: core, closure, OCI blobs, labels dan tiga payload runtime.
- `independent-deep-check.py` / `independent-deep-check.json`: pemeriksaan source/context, semua file layer vs inventory, source internals, notices CA, TAP dan preflight logs.
- `independent-staging-verification.json`: validasi ulang asset set terhadap frozen core.
- `source-access-rerun.tap` / `source-access-rerun.stderr.log`: tes regresi yang dijalankan auditor.
- `github-main.json`, `github-releases.json`, `github-actions-runs.json`, `github-protected-jobs.json`: snapshot publik saat audit.

## 4. GCC, libstdc++, libgcc, dan Mozilla CA

**VERIFIED secara teknis untuk kandidat pada bagian 2.** Source asli tidak perlu diganti lagi selama runtime/version tetap sama; setiap build kandidat baru tetap harus mengikat ulang hasilnya ke image final.

### 4.1 GCC

`gcc-runtime-corresponding-source.tar.gz` SHA-256:
`c77f913c4ecc7a7c0b9bd2f59dfa6706014285075eb5b76594bf757e62078e7f`.

Arsip benar-benar berisi GCC 14.2.0 upstream 92.306.460 bytes, APKBUILD, 39 patches dan file recipe pendukung Alpine revision `1a03a2a9c9e77f1a07d48b6f6805e72c8c63c03f`. Sebanyak 41 file recipe/pendukung cocok dengan manifest; materi recipe GCC juga cocok dengan salinan upstream resmi yang telah diverifikasi pada audit sebelumnya.

GCC upstream SHA-256:
`a7b39bc69cbf9e25826c5a60ab26477001f7c08d85cec04bc0e29cabed6f3cc9`.

Hash payload image yang dihitung langsung dari layer:

| File runtime | Bytes | SHA-256 |
|---|---:|---|
| `/usr/lib/libstdc++.so.6.0.33` | 2.771.336 | `08d5c7eb7c1e210d0fb56a33af0b97ab86339f2d321ceb31fcd53c563f8803c9` |
| `/usr/lib/libgcc_s.so.1` | 173.920 | `2298274ad3316109d6e895083398e220f16fbdd12957c4afcc9af8849e734151` |

`libstdc++.so.6` menunjuk ke `libstdc++.so.6.0.33`. Kedua payload identik dengan package resmi Alpine 14.2.0-r4 yang dibandingkan pada audit sebelumnya. Pembuktian ini memakai recipe/source distro dan kecocokan payload package; auditor tidak mengklaim membangun ulang GCC secara bit-for-bit atau melakukan verifikasi signature APK baru dalam sesi ini.

### 4.2 Mozilla/CA

`mozilla-ca-bundle-source.tar.gz` SHA-256:
`06965955667cfb5871f44c2af0b5b1646772960bb73ed9c30972dc99815043e5`.

Arsip berisi upstream `ca-certificates-20261020.tar.bz2`, APKBUILD dan file recipe Alpine revision `660f223b42ca35e7d2a76ce568e15c847b92d33d`; bukan stub atau data sertifikat sintetis. Upstream SHA-256:
`1048bc7f50fa42a6621bc2f8816173f89a0c0098f26dff072bc8fe40af714400`.

`certdata.txt` SHA-256:
`3ec2b4d240dc12c747eaf450061db84af757c483bbda302f9e29ceb5d70be510`.

Bytes certdata cocok dengan file resmi Mozilla NSS yang telah diunduh dan diverifikasi sebelumnya. Materi notice `CA-converter-mk-ca-bundle.pl.txt` juga identik dengan converter di source archive aktual.

CA bundle image `/etc/ssl/certs/ca-certificates.crt`: 178.791 bytes, SHA-256
`5961c0a3c65459931c023e0075c09733f09aea4ca439cb85bc4a08bb4f3f568b`.

Hash ini cocok dengan hasil CA rebuild dalam evidence dan hasil rebuild independen audit sebelumnya, untuk source dan bytes runtime yang identik. Source/binary exception register sekarang terikat ke kandidat `968ece0…`.

Register tetap menulis `LEGAL_APPROVAL_PENDING`. Itu status jujur dan bukan kegagalan autentisitas source. Audit teknis ini tidak menggantikan keputusan Legal/IP tentang cara distribusi, exception, serta hak first-party Enterprise.

### 4.3 Source-access dan SBOM resmi

PUB-01 **implemented/verified secara lokal**: generator membuat path closure dan URL GitHub Release `v0.1.0`, mencantumkan hashes source, platform, commit serta image.

PUB-02 **staging verified**: 9 assets plus `SHA256SUMS` memiliki coverage tepat dan cocok dengan core. Source lama bersama checksum yang konsisten sendiri ditolak oleh validasi terhadap frozen core.

PUB-03 **implemented; live publication pending**: downloader tidak membawa Authorization/cookie, mensyaratkan HTTPS, menolak HTML/status gagal/empty bytes, lalu memeriksa hashes dan membuka source tar. Workflow menjalankannya setelah assets publik tersedia dan sebelum `docker push`; verifikasi lengkap dijalankan sesudahnya. Receipt disimpan di luar core. Ini menutup kekurangan implementasi sebelumnya, tetapi belum merupakan bukti URL publik sudah tersedia.

SBOM resmi candidate:

- SPDX SHA-256 `b153c0da20e80cc2ccc84d81c323bdd6708a251bab405813e0b9169d83488118`.
- CycloneDX SHA-256 `8224163c4cf2f21d0508a2437f45e809c98642b1fb75f5279c87251e83fdcbf6`.

Keduanya dihasilkan 29 Oktober, cocok dengan scanner invocation/provenance, dan metadata CycloneDX mengikat image serta labels kandidat. Ini tidak memberikan klaim “tanpa kerentanan”; pemeriksaan ini menilai integritas dan pengikatan SBOM, bukan vulnerability scan baru.

## 5. Temuan yang masih harus ditutup

### F01 — P1: final authorization belum memerlukan bukti NC22–NC24

**Bukti kode kandidat:**

- `scripts/test-negative-controls.js` baris 134–136 selalu menambahkan NC22, NC23 dan NC24 sebagai pending; tidak menjalankan tiga kasus tersebut.
- `scripts/verify-release-evidence.js` baris 81–85 mensyaratkan daftar pending tepat tiga ID itu. Mengganti status di core menjadi PASS secara manual akan merusak kontrak ini dan frozen manifest.
- `scripts/certify-release-gate.js` jalur G7 memverifikasi approval aktual dan subject, tetapi belum memerlukan receipt pelaksanaan ketiga negative controls tersebut sebelum menulis `release-gate-pass.json`.
- Workflow protected release tidak memiliki langkah pelaksanaan/validasi receipt NC22–NC24. `publish=false` menjalankan alur authorization normal; dispatch dry run saja belum melaksanakan tiga kasus negatif.

**Implikasi:** validasi approval sebenarnya sudah ada, tetapi kelengkapan acceptance negative tests belum dipaksakan oleh final gate. Ini bukan bukti approval bisa dipalsukan atau bahwa bypass telah dieksploitasi.

**Perbaikan programmer yang dapat dikerjakan:**

1. Pertahankan pending di core prareview bila itu desain immutable core. Tambahkan kontrak receipt eksternal untuk NC22–NC24 dan validator yang wajib dipanggil pada final certification/publish guard. Jangan mengubah core sesudah approval.
2. Sediakan harness operasional dalam protected `publish=false` flow untuk menjalankan actual collector/certifier dengan input negatif terisolasi: role/decision tidak sah atau hilang; subject salah; replay run/attempt salah. Catat command, exit nonzero, alasan penolakan yang relevan, dan bahwa output PASS produksi tidak dibuat. Jangan cukup memakai kegagalan awal karena Docker/file/dependency hilang.
3. Gunakan metadata run/history dan lingkungan GitHub aktual sebagai konteks pembuktian manusia. Salinan receipt yang dimutasi boleh dipakai sebagai **input serangan yang diberi label negative test**, terpisah dari receipt asli; tidak boleh disajikan sebagai approval asli atau dipakai untuk publikasi.
4. Receipt mencatat repo, source commit/policy atau script hashes, workflow run/attempt, candidate ID, image, core digest yang diuji, kontrol ID, timestamps, raw-log hashes, expected/actual exit/reason, dan output-PASS absence. Simpan raw evidence melalui artifact/run tepercaya; jangan mempercayai JSON PASS buatan caller saja.
5. Bila dry run adalah run terpisah, kaitkan receipt dengan implementasi/policy yang sama dan subjek dry run-nya sendiri. Kandidat produksi tetap membutuhkan core/image identity dan approval baru untuk run produksinya. Tentukan aturan reuse bukti regression yang eksplisit; jangan mengklaim receipt dry run menyetujui image produksi lain.
6. Final authorization harus menolak receipt hilang, failed/pending, hash/log salah, subject/policy tidak sesuai aturan, atau replay yang tidak sah. Tambahkan regression tests untuk kondisi itu dan jalur receipt sah. Positive production authorization tetap memerlukan tiga review asli.

**Acceptance:** tiga kasus benar-benar menghasilkan penolakan sesuai tujuan; bukti tersimpan dan diverifikasi; final certifier tidak dapat mengeluarkan authorization ketika mandatory dry-run proof belum selesai. Tidak perlu mengubah pending historis di frozen core lama.

### F02 — P2: SBOM/notices baseline lama masih ikut image

**Bukti:** `Dockerfile` baris 210 menyalin seluruh `baseline` ke `/app/baseline`. Pemeriksaan source archive dan image layers menemukan:

| File | Identitas historis |
|---|---|
| `baseline/sbom.spdx.json` | Created `2026-10-22T10:45:00Z`; SHA-256 `569ef878f97c9c35e6c3c262b33e3e354178d5a78dfcb60f4007f89c0a247eed` |
| `baseline/sbom.cyclonedx.json` | Timestamp `2026-10-22T17:45:02+07:00`; SHA-256 `756bab2168ad96fff09ce15cb548743c047afdde07980a35fbcdd9e54335b6a3` |
| `baseline/THIRD-PARTY-NOTICES.md` | SHA-256 `ce7063d1f89dc0d556897099fc39de59a40400f72840083e539b89c632e7aa25`; berbeda dari notices aktif |

`src/tests/notices-sbom.test.ts` masih meluluskan tes SBOM berdasarkan keberadaan, format JSON dan jumlah >100 pada baseline tersebut. Tes itu tidak membuktikan SBOM final image yang sedang dirilis.

Ini **berbeda** dari pasangan SBOM 27 Oktober yang menjadi temuan lama dan sudah ditutup. SBOM resmi candidate saat ini tidak salah hash. Namun, pernyataan “semua SBOM lama sudah tidak ikut distribusi” belum benar.

**Perbaikan programmer:**

1. Keluarkan baseline audit historis dari runtime image. Jangan menghapus required upstream copyright/license texts atau fixtures aplikasi yang sah. Verifikasi terlebih dahulu seluruh referensi `baseline` agar perubahan tidak mematahkan tes build/runtime.
2. Jika tetap perlu menyimpan sejarah di source, pindahkan/labeli sebagai `SUPERSEDED — NOT RELEASE EVIDENCE`, dengan tujuan yang jelas, dan exclude dari runtime build. Tidak perlu mengubah Git history.
3. Ganti tes shallow baseline dengan pemeriksaan bermakna untuk evidence final: schema, image/commit binding, scanner outputs hashes dan required native exceptions. Jalankan setelah SBOM final tersedia di CI/closure stage; jangan membuat loop yang mewajibkan SBOM image sudah ada di dalam image sebelum scan.
4. Bedakan fixture test dari release evidence. Jangan mengganti baseline lama dengan JSON sintetis lalu menyebutnya hasil scanner final.
5. Regenerasi image, inventory, SBOM, runtime/source binding, tests, controls, provenance, report, core manifest dan closure untuk commit hasil perbaikan. Image berubah berarti approval/hash candidate sebelumnya tidak berlaku sebagai approval final.

**Acceptance:** image final tidak mengandung dua SBOM baseline dan notices baseline yang superseded; source history yang dipertahankan diberi label; tes evidence menggunakan hasil final kandidat. SBOM resmi dan notices/source release assets tetap tersedia.

### F03 — blocker operasional: kandidat belum masuk protected closure GitHub

Snapshot API publik saat audit:

- Main masih `adfeb5cfc9075d0e34c1162de764238315822820`, bukan `968ece0…` pada ZIP.
- [Protected release run 40678456586](https://github.com/enygma-id/TileO/actions/runs/40678456586), dibuat 28 Oktober: `completed/failure`; job candidate gagal pada **Build and verify corresponding source against image bytes**. Engineering, legal, authorize skipped.
- Run CI dan dependency gate yang hijau pada main lama tidak membuktikan protected release kandidat ZIP ini telah selesai.
- [Daftar public releases](https://github.com/enygma-id/TileO/releases) masih kosong.

Kegagalan run lama tidak dibebankan sebagai hasil tes kandidat baru. Namun belum ada bukti protected run yang sukses untuk kandidat baru. Tim perlu menjalankan dan memeriksa run baru; jangan sekadar me-rerun source lama atau memindahkan artefak WSL ke run berbeda.

Dalam closure ZIP:

- `release/reviewers-policy-snapshot.json`: `PENDING_HUMAN_CONFIGURATION`, environment IDs null dan authorized reviewer lists kosong.
- `compliance/rights-review-summary.json`: `PENDING_HUMAN_REVIEW`; Enterprise rights belum diverifikasi oleh engineering.
- `delivery-manifest.json`: `PENDING_HUMAN_APPROVAL`; hanya technical eligibility yang dilampirkan.
- Tidak ada authorization, approval history final, atau publishable PASS.

**PIC administrator + programmer + reviewers:** selesaikan F01/F02 dan konfigurasi policy/identitas reviewers, push melalui proses review, lalu pilih satu kandidat dari clean commit di protected Actions. Bila live environments sebenarnya sudah dikonfigurasi, buktikan dari akses administrator terautentikasi; audit publik ini tidak menginspeksi setting privat dan tidak menganggap snapshot lokal sebagai bukti setting live.

Engineering dan Legal/IP harus merupakan manusia berbeda sesuai policy. Masing-masing keputusan dan keputusan Release Steward harus mengikat candidate ID dan **core digest milik run yang benar-benar disetujui**. Satu browser skip Compare harus diterima eksplisit dalam scope review atau diuji/diperbaiki sebelum freeze. Keputusan hak first-party/Enterprise harus nyata; keberadaan proposed CLA saja bukan acceptance record.

**Acceptance:** protected dry run dengan bukti NC22–NC24, reviewer policy valid, raw run/history tersimpan, positive authorization sah dan final closure yang terikat ke kandidat produksi. Setiap perubahan byte core atau build kandidat membatalkan approval sebelumnya. Tidak perlu menghapus status pending pada core lama untuk menciptakan kesan selesai.

### F04 — acceptance publikasi: akses source publik dan registry belum terbukti

Kode dan staging sudah siap diuji pada fase ini; status live masih pending karena belum ada public release/receipt.

Setelah otorisasi final yang sah:

1. Stage assets yang tepat dari approved core dan final authorized closure; validasi asset names, sizes, SHA256SUMS coverage dan binding terhadap core sebelum upload.
2. Buat tag/release melalui workflow yang disetujui. Publikasikan source assets terlebih dahulu.
3. Jalankan `verify-public-source-access.js` tanpa kredensial untuk actual bytes Release assets, termasuk source GCC/CA; harus `SOURCE_ACCESS_VERIFIED` sebelum image push.
4. Push exact saved/loaded image kandidat; jangan build ulang. Jalankan `verify-published-release.js` untuk tag/commit, assets dan registry image/platform. Status sukses akhir `PUBLISHED_VERIFIED`.
5. Bila source berhasil tetapi registry/push gagal, simpan partial receipt dan hentikan klaim release selesai. Tangani pemulihan secara eksplisit, tanpa overwrite diam-diam terhadap assets yang sudah disetujui.

Asset set publik yang diharapkan:

```text
GitHub Release v0.1.0
  TileO-0.1.0-source.tar.gz
  gcc-runtime-corresponding-source.tar.gz
  mozilla-ca-bundle-source.tar.gz
  THIRD-PARTY-NOTICES.md
  THIRD-PARTY-EXCEPTIONS.md
  SOURCE-ACCESS.md
  sbom-image.spdx.json
  sbom-image.cdx.json
  TileO-v0.1.0-Release-Closure.tar.gz
  SHA256SUMS
```

Arsip source besar tidak perlu masuk Git history untuk memenuhi desain distribusi ini. License texts dan exception register lengkap berada dalam closure; source assets terpisah harus identik dengan file core yang disetujui. Community dan Enterprise yang mendistribusikan payload pihak ketiga identik menggunakan materi source/notice yang cocok dengan payload itu; Legal/IP tetap memutuskan clearance final.

## 6. Jalur tersingkat yang sah menuju GO

| Urutan | PIC | Output yang harus ada |
|---|---|---|
| 1 | Programmer | Commit F01/F02, meaningful regression tests, diff dan actual exit/logs |
| 2 | Administrator + reviewer policy owner | Konfigurasi environment/reviewer/proteksi valid, policy commit disetujui |
| 3 | Programmer/CI | Satu clean candidate baru dengan semua evidence/image/source/SBOM terikat; core frozen dan staging valid |
| 4 | Operator + Engineering | Actual NC22–NC24 protected dry-run records dan validator receipt lulus |
| 5 | Engineering + Legal/IP + Release Steward | Review scope/hak/exception dan approval autentik atas candidate/core pada run produksi; final authorization dan closure |
| 6 | Protected publisher | Source assets publik → anonymous verification lulus → exact image push → full publication verification lulus |

Langkah 4 dapat memakai kandidat dry run terpisah sesuai kontrak F01. Approval produksi tetap fresh. Jangan menggunakan angka hash WSL dari laporan ini sebagai konstanta untuk kandidat Actions yang berbeda.

**GO untuk memulai publikasi** baru boleh dicatat setelah F01–F03 selesai dan final authorization sah. **Rilis selesai/terverifikasi** baru boleh dicatat sesudah F04 lulus. Final report harus membedakan kedua titik ini.

## 7. Bukti minimum untuk pemeriksaan penutupan berikutnya

Serahkan satu handoff yang menunjuk kandidat final, bukan ZIP seluruh workspace tanpa pilihan artefak:

- URL commit/PR dan protected workflow run/attempt yang relevan.
- Core manifest beserta exact core, image export hash/bytes dan akses artifact-nya.
- Hasil F01/F02, regression logs, inventaris final tanpa baseline historis dalam image.
- NC22–NC24 receipts + raw run/log references dan hasil validasi; approvals positive asli terpisah.
- Authorization final dan closure delivery manifest; keputusan scope skip serta Legal/IP/rights review yang dapat ditelusuri.
- Bila publikasi sudah dilakukan: Release URL, source-access receipt dan full publication receipt yang cocok dengan kandidat itu.

Auditor tidak meminta pembenahan engine atau pergantian source autentik GCC/Mozilla yang sudah terbukti. Pekerjaan tersisa harus difokuskan pada temuan spesifik di atas, lalu penutupan protected release dengan bukti aktual.
