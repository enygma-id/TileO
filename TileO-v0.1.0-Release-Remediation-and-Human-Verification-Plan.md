# TileO v0.1.0 — Rencana Perbaikan, Verifikasi Manusia, dan Rilis Pertama

**Tanggal:** 28 Oktober 2026, WIB  
**Repository:** `enygma-id/TileO`  
**Target publik:** `v0.1.0`  
**Status dokumen:** rencana pelaksanaan dan acceptance contract; **bukan sertifikat GO**  
**Pelaksana:** programmer di repository Git dan lingkungan Docker sebenarnya, reviewer Engineering, reviewer Legal/IP, serta penanggung jawab rilis Enygma.

## 0. Keputusan yang sudah disepakati

Pemilik proyek telah mengonfirmasi bahwa `0.2.0` hanya penamaan internal. Rilis publik pertama ditetapkan menjadi **0.1.0**. Perubahan ini tidak menghapus sejarah Git atau mengubah hasil audit historis.

- Kode first-party Community yang tercakup tetap **AGPL-3.0-only**.
- Enterprise menggunakan hak komersial first-party yang benar-benar dimiliki/dikuasai Enygma.
- Third-party mengikuti kebijakan **predominantly permissive with three disclosed exceptions**: libstdc++, libgcc, material trust-store Mozilla CA. Pengecualian tersebut tidak boleh disebut permisif.
- `0.1.0` adalah rilis awal dengan API yang masih dapat berubah. Label ini tidak mengurangi kewajiban lisensi, kelengkapan bukti, pengujian, atau approval.
- Pertahankan GDAL, PROJ, Tippecanoe, arsitektur dan fitur yang sudah bekerja. Perubahan engine hanya dilakukan bila ada kegagalan nyata yang perlu diperbaiki untuk memenuhi acceptance.
- Dokumen ini mengarahkan **perbaikan aktual sampai selesai dan siap dipublikasikan**, tanpa mengarang PASS, source, log atau approval. Publikasi hanya dilakukan setelah gerbang manusia pada bagian 12–14 terpenuhi.

Referensi utama: `TileO-Clean-Reaudit-2026-10-28.md`. Target versi dalam rencana ini menggantikan target 1.0.0 pada handoff/protokol lama untuk pekerjaan rilis pertama. Temuan audit lama tetap dipertahankan sebagai catatan historis.

### Arti selesai

Pekerjaan selesai ketika tag `v0.1.0` menunjuk commit yang disetujui, GitHub Release menyertakan source/notices/evidence yang benar, image yang didistribusikan identik dengan kandidat yang diuji, mekanisme source-access dapat digunakan penerima, dan pemeriksaan pascapublikasi lulus. Sebelum otorisasi manusia, keluaran maksimal adalah **TECHNICALLY_ELIGIBLE_PENDING_APPROVAL**.

## 1. Kondisi awal dan prioritas

| ID kerja | Kondisi hasil audit 28 Oktober | Tindakan penutupan | Bukti penerimaan |
| --- | --- | --- | --- |
| R01 | Source GCC/CA terbaru autentik | Pertahankan source, verifikasi terhadap binary image final | Hash upstream/patch/recipe + hash binary/data hasil ekstraksi image |
| R02 | Closure masih mengandung source sintetis dan PASS lama | Bangun closure baru dari evidence tunggal | Source asli; tidak ada PASS/review palsu; manifest lengkap |
| R03 | SBOM baru di `image/`, lama di `sbom/`, provenance mematok yang lama | Satukan output dan identitas | Schema valid, checksum dan identitas image/source cocok |
| R04 | Gate menerima malformed SPDX dan hash CSV nol pada sub-gate | Perbaiki parser, binding, fail-closed | Negative controls nyata menolak setiap cacat |
| R05 | Baseline terbaru 6/6 cocok tetapi dirty | Freeze clean commit; build kandidat dari commit itu | Git bersih; provenance build, test dan evidence konsisten |
| R06 | Versi internal 0.2.0 dan klaim historis 1.0.0 bercampur | Tetapkan metadata aktif 0.1.0 | Version audit lengkap; bukti lama tidak dipakai ulang |
| R07 | Legal/IP dan Engineering pending | Review manusia terautentikasi atas kandidat final | Dua keputusan terpisah dengan identitas dan ruang lingkup yang sama |
| R08 | Dua log closure hilang | Simpan stdout, stderr, exit status dan negative-test log | Semua path manifest ada; stderr kosong boleh, hilang tidak boleh |

**Urutan kritis:** identifikasi lingkungan → perbaiki generator/gate/workflow → preflight dan regression → freeze source → build kandidat → kumpulkan dan verifikasi bukti → bekukan manifest → review manusia → publish tanpa rebuild → verifikasi hasil publik.

Jangan menjalankan audit berulang pada kandidat lama untuk memperoleh status hijau. Jika source/build berubah, buat kandidat baru dan kumpulkan ulang bukti yang bergantung padanya.

**Jalur paling cepat yang tetap sah:** fokus R02–R05 dan workflow approval terlebih dahulu, gunakan kembali input source upstream autentik yang versinya masih sesuai, pertahankan fitur/engine yang sudah benar, lalu jalankan satu putaran verifikasi lengkap pada kandidat final. Checklist tidak meminta migrasi engine, penyusunan ulang semua MD umum, sertifikasi eksternal, atau full GCC rebuild tanpa alasan. Beberapa fungsi verifikasi baru boleh digabung ke modul yang sama; nama script di bawah adalah kontrak kerja agar tanggung jawabnya jelas, bukan kewajiban membuat banyak framework baru.

## 2. Penanggung jawab dan pemisahan wewenang

Isi nama dan akun sebenarnya dalam `release-policy/reviewers.json` sebelum freeze. Nama file ini adalah **deliverable baru**, belum diasumsikan tersedia.

| Peran | Tanggung jawab | Wewenang |
| --- | --- | --- |
| Programmer pelaksana | Memperbaiki scripts/workflow/docs, menjalankan test, menyusun evidence | Dapat merekomendasikan eligible; tidak mengesahkan legal review sendiri |
| Reviewer Engineering | Meninjau perubahan, bukti image/test/source, negative controls dan deployment | Memberi keputusan Engineering atas commit + image + core evidence digest |
| Reviewer Legal/IP Enygma | Memeriksa tiga pengecualian, source delivery, hak first-party/CLA, notices dan batas Enterprise | Memberi keputusan Legal/IP sesuai mandat Enygma; meminta bantuan ahli bila kewenangan/isu belum jelas |
| Release Steward | Menetapkan scope, menerima kedua review, mengotorisasi publikasi | GO publikasi atas kandidat spesifik; Erick atau delegasi yang ditetapkan secara nyata |
| Operator rilis / workflow | Mempublikasikan artifact yang telah disetujui | Tidak boleh membuat approval atau mengubah kandidat |

Untuk rilis pertama, reviewer Engineering dan Legal/IP harus dua identitas manusia berbeda. Release Steward dapat merangkap salah satu peran bila mandatnya tercatat, tetapi tidak menggantikan dua keputusan tersebut. Jangan mengisi nama/akun penanggung jawab berdasarkan perkiraan.

**Bukti mandat:** catatan internal tertanggal yang menyebut siapa boleh menyetujui apa. Materi kontrak/CLA yang sensitif disimpan terbatas; paket publik cukup memuat hasil pemeriksaan, ID referensi dan penanggung jawab tanpa data pribadi yang tidak perlu.

## 3. Lingkungan eksekusi yang direkomendasikan

### 3.1 Lingkungan acuan

Gunakan **Linux x86_64 + Docker Linux containers**, misalnya GitHub-hosted Ubuntu runner atau WSL2 pada Windows. Dockerfile sekarang menggunakan runtime x86_64; rilis pertama hanya mengklaim `linux/amd64` kecuali platform lain dibangun dan diuji secara terpisah.

Pada Windows, jalankan blok Bash berikut dari WSL2 dan simpan checkout pada filesystem Linux. Jangan mencampur path `D:\...`, Git Bash/MSYS dan tar Linux dalam satu run. Dukungan PowerShell/native Windows dapat ditambahkan, tetapi tidak perlu menghambat jalur Linux yang sudah diverifikasi; klaim dukungan runtime Windows harus mengikuti bukti pengujiannya sendiri.

Prasyarat: Git, Docker daemon + buildx, Node yang memenuhi `engines` project, npm, Python 3, tar dengan xz/bzip2/gzip, curl, make, patch, perl, OpenSSL, GitHub CLI untuk operator/CI, browser Playwright. Pin/rekam versi scanner dan helper image; jangan mengandalkan `latest` untuk bukti final.

### 3.2 Preflight dari repository sebenarnya

Semua perintah repository pada dokumen ini dijalankan dari **root checkout TileO**, bukan folder ekstraksi audit di komputer auditor. Jangan menjalankan `git init` pada ZIP dan menganggapnya provenance canonical.

```bash
git remote -v
git rev-parse --show-toplevel
git rev-parse HEAD
git status --porcelain=v1 --untracked-files=all
node --version
npm --version
python3 --version
docker version
docker buildx version
tar --version
openssl version
```

Verifikasi remote menunjuk repository resmi, akses upstream sumber tersedia, disk cukup untuk image/export/hasil test, dan fixture bisa diakses. Catat command, versi, OS/platform, output dan exit code. Network failure/missing Docker adalah **BLOCKED + kebutuhan spesifik**, bukan alasan mengganti pengujian dengan simulasi PASS.

Buat branch perbaikan melalui kebiasaan tim. Integrasikan hasil lewat PR yang direview; jangan membuat/push tag publik dari helper `prepare-release.js` selama fase perbaikan.

### 3.3 Standar log

Gunakan runner yang menyimpan command sebagai array, waktu mulai/selesai UTC, cwd, image ID, commit, stdout, stderr, exit code, timeout/signal, dan hash log. Kredensial tidak dicetak. Bila menggunakan `tee`, pertahankan exit code proses utama dengan `set -o pipefail`.

Stderr **boleh berukuran nol byte** bila command memang tidak menghasilkan stderr; file dan exit record tetap wajib. Jangan memaksa semua evidence berukuran >0 secara seragam.

## 4. Deliverable implementasi dan antarmuka yang wajib tersedia

Bagian ini membedakan script yang sudah ada dari kontrak tambahan yang harus diimplementasikan programmer. **Perintah script baru di bagian selanjutnya baru dijalankan setelah implementasi dan pengujiannya tersedia.** Nama boleh disesuaikan, tetapi dokumentasi/operator commands harus ikut diperbarui dan fungsinya harus sama.

| Berkas | Kondisi/pekerjaan |
| --- | --- |
| `scripts/audit-image.js` | Ada; collector murni, satu lokasi SBOM, versi scanner dipatok, validasi full inventory |
| `scripts/prepare-compliance-packages.js` | Ada; pertahankan authentic retrieval, tambahkan validasi aport/patch, image binding, output aman |
| `scripts/record-test-results.js` | Ada; perketat TAP, CLI, mandatory skips, mounts dan invalidasi hasil lama |
| `scripts/certify-release-gate.js` | Ada; implementasikan syarat fail-closed dan otorisasi manusia yang benar |
| `scripts/test-negative-controls.js` | Ada; perluas kasus; baseline fixture positif harus valid, tanpa fabrikasi bukti produksi |
| `scripts/build-release-closure-package.js` | Ada; hapus klaim hardcoded, validasi semua file sebelum packaging |
| `scripts/verify-source-fulfillment.js` | **Baru**; verifikasi source/recipe/patch dan hash yang diekstrak langsung dari image |
| `scripts/verify-release-evidence.js` | **Baru**; schema, path, hash, lintas-identitas, test-matrix, manifest, inventory |
| `scripts/create-release-manifest.js` | **Baru**; manifest deterministic dari artifact yang sudah final |
| `scripts/collect-human-approvals.js` | **Baru**; ambil bukti GitHub dan verifikasi keputusan/role/subject, tidak membuat keputusan manusia |
| `scripts/verify-published-release.js` | **Baru**; verifikasi tag/assets/source-access/registry sesudah publish |
| `release-policy/release-policy.json` | **Baru**; versi policy, platform, gate wajib, schema dan status yang diterima |
| `release-policy/reviewers.json` | **Baru**; akun/ID reviewer dan environment yang berwenang, direview pemilik |
| `release-policy/test-scope.json` | **Baru**; kategori wajib, test IDs, fixture hashes, N/A yang disetujui sebelum freeze |
| `.github/workflows/release.yml` atau workflow existing | Alur satu kandidat + review terpisah + publish exact artifact |

Antarmuka minimal yang harus didukung setelah perbaikan:

```text
verify-source-fulfillment.js --image IMAGE_ID --evidence-dir DIR
verify-release-evidence.js --image IMAGE_ID --evidence-dir DIR [--manifest FILE]
create-release-manifest.js --evidence-dir DIR --output FILE
certify-release-gate.js --image IMAGE_ID --evidence-dir DIR --out-dir DIR
certify-release-gate.js ... --manifest FILE --enforce-human-approval --approval-attestation FILE
collect-human-approvals.js --run-id ID --run-attempt N --candidate FILE --output FILE
build-release-closure-package.js --evidence-dir DIR --authorization-dir DIR --out-dir DIR
verify-published-release.js --repo enygma-id/TileO --tag v0.1.0 --candidate FILE --out-dir DIR
```

Semua parser menolak argumen hilang, nilai berupa flag berikutnya, opsi tidak dikenal, path keluar root evidence, serta input image tidak valid. Gunakan `execFile`/array arguments, bukan interpolasi command string dari input. Perintah `--image IMAGE_ID` harus benar-benar memeriksa image lokal/remote yang dimaksud; jangan hanya menyalin string dari text file.

## 5. Fase A — Rapikan versi aktif, sejarah, dan output

**PIC:** programmer; reviewer Engineering memeriksa diff.

1. Ubah versi `package.json`, `package-lock.json` top-level dan `packages[""]` menjadi `0.1.0`, menggunakan mekanisme tanpa membuat tag otomatis. Contoh: `npm version 0.1.0 --no-git-tag-version --ignore-scripts`; baca hasil diff dan regenerasi manifest/notices yang bergantung pada lockfile.
2. Perbarui README, changelog, release process, release approval status, metadata citation bila memuat versi, contoh tag/image, policy dan default output collector yang aktif. Bila menambah tanggal rilis citation, gunakan tanggal publikasi sebenarnya atau isi sebelum freeze; jangan menebak tanggal.
3. Jangan melakukan replace global `0.2.0`/`1.0.0` dalam seluruh repository. Versi dependency, source upstream, audit historis dan log lama tetap asli.
4. Keluarkan closure lama, source sintetis dan PASS lama dari jalur distribusi aktif. Simpan arsip forensik di luar package final atau lokasi historis bertanda **SUPERSEDED — NOT RELEASE EVIDENCE**. Jangan menghapus sejarah Git.
5. Gunakan tepat satu root evidence aktif: `release-evidence/v0.1.0/`. Scanner menulis SBOM final hanya ke `sbom/`; `image/` berisi image inventory/provenance. Jangan fallback diam-diam ke `artifacts/compliance`, versi lain atau folder closure.
6. Helper `prepare-release.js` tidak boleh dapat membuat tag melewati workflow protected. Hapus side effect tagging dari jalur preflight atau wajibkan release authorization yang tervalidasi.
7. Periksa `.gitignore`/`.dockerignore`: build/test/evidence tidak mencemari source checkout; notices/policy/build instructions yang wajib didistribusikan tetap ikut. Hasil generator yang merupakan tracked source harus dibuat dan di-commit **sebelum freeze**.

Perintah peninjauan setelah perubahan:

```bash
node -e 'const p=require("./package.json"); const l=require("./package-lock.json"); if (![p.version,l.version,l.packages[""].version].every(v=>v==="0.1.0")) process.exit(1)'
rg -n '0\.2\.0|1\.0\.0|RELEASE_APPROVED|100% permissive|zero copyleft' README.md CHANGELOG.md docs third-party scripts .github package.json CITATION.cff
git diff --check
git diff --stat
```

`rg` adalah daftar review, bukan perintah menghapus semua kecocokan. Setiap klaim aktif yang tidak didukung harus diperbaiki; referensi historis yang sah dicatat sebagai pengecualian pencarian.

**Acceptance A:** metadata aktif 0.1.0 konsisten, sejarah utuh, source sintetis/PASS lama tidak bisa terpilih sebagai bukti, collectors dan certifier memakai satu root evidence.

## 6. Fase B — Tutup pembuktian source GCC dan Mozilla sampai image

**PIC:** programmer; review Engineering dan Legal/IP.

### 6.1 Pertahankan source autentik yang sudah terverifikasi

Source terbaru telah lolos audit upstream. Gunakan cache terverifikasi tersebut sebagai input bila **paket final masih versi yang sama**; tidak perlu mengunduh ulang source besar hanya untuk mengubah nama rilis.

| Input historis terverifikasi | Identitas |
| --- | --- |
| GCC upstream | `gcc-14.2.0.tar.xz`, SHA-256 `a7b39bc69cbf9e25826c5a60ab26477001f7c08d85cec04bc0e29cabed6f3cc9` |
| Aport GCC | commit `1a03a2a9c9e77f1a07d48b6f6805e72c8c63c03f`, package `14.2.0-r4`, 39 patch |
| CA upstream | `ca-certificates-20261020.tar.bz2`, SHA-256 `1048bc7f50fa42a6621bc2f8816173f89a0c0098f26dff072bc8fe40af714400` |
| Aport CA | commit `660f223b42ca35e7d2a76ce568e15c847b92d33d`, package `20261020-r0` |
| NSS certdata | tag `NSS_3_131_1_RTM`, SHA-256 `3ec2b4d240dc12c747eaf450061db84af757c483bbda302f9e29ceb5d70be510` |
| Bundle CA historis | SHA-256 `5961c0a3c65459931c023e0075c09733f09aea4ca439cb85bc4a08bb4f3f568b` |

Nilai di atas **bukan konstanta wajib untuk semua build mendatang**. Baca versi aktual dari image final. Jika paket berubah, ambil source/recipe/revision yang sesuai dan ulangi verifikasi; jangan memaksa data baru cocok ke angka historis. Hash arsip luar juga dapat berubah karena manifest kandidat berubah.

### 6.2 Verifikasi binary dan packaging aktual

1. Inspeksi image dengan ID immutable; simpan full raw `docker image inspect`, platform, config ID dan build provenance.
2. Ekstrak `apk-packages.txt`, `alpine-image.txt`, binary sebenarnya dari libstdc++/libgcc, dan bundle CA. Resolusi symlink harus jelas; simpan path symlink serta target file.
3. Rekam exact package version/revision/architecture, origin repository dan distro recipe. Jika memungkinkan ambil `.apk` versi tersebut dari repository resmi, validasi melalui index/signature dengan trust key distro yang benar, lalu cocokkan library payload dengan file image. Simpan APK/index digest dan hasil verifikasinya. Bila bukti binary provenance pengganti dipakai, Engineering/Legal menjelaskan mengapa cukup; metadata teks buatan sendiri tidak menjadi bukti tunggal.
4. Verifikasi APKBUILD dari immutable aport revision dan semua input source/patch berdasarkan checksum resmi. Periksa `pkgver`, `pkgrel`, target architecture, applied patch order dan build instructions. Ukuran TAR/nama folder saja tidak cukup.
5. Catat compiler/runtime packages dari seluruh build stages yang relevan, termasuk komponen statis di Node/native addon. Jangan mengasumsikan metadata assemble stage membuktikan semua static runtime dari stage lain.
6. GCC full bit-for-bit rebuild tidak otomatis diwajibkan bila binary distro resmi dan source correspondence sudah dibuktikan. Ketidakpastian source/binary harus diselesaikan dengan bukti, bukan klaim reproducibility yang belum diuji.

Contoh ekstraksi read-only, setelah `TILEO_IMAGE_ID` dan `TILEO_EVIDENCE` ditetapkan:

```bash
TILEO_CONTAINER_ID=$(docker create "$TILEO_IMAGE_ID")
mkdir -p "$TILEO_EVIDENCE/image/extracted-runtime"
docker cp "$TILEO_CONTAINER_ID:/usr/local/share/tileo-build/apk-packages.txt" "$TILEO_EVIDENCE/image/extracted-runtime/apk-packages.txt"
docker cp "$TILEO_CONTAINER_ID:/usr/local/share/tileo-build/alpine-image.txt" "$TILEO_EVIDENCE/image/extracted-runtime/alpine-image.txt"
docker cp -L "$TILEO_CONTAINER_ID:/usr/lib/libstdc++.so.6" "$TILEO_EVIDENCE/image/extracted-runtime/libstdc++.so.6"
docker cp -L "$TILEO_CONTAINER_ID:/usr/lib/libgcc_s.so.1" "$TILEO_EVIDENCE/image/extracted-runtime/libgcc_s.so.1"
docker cp "$TILEO_CONTAINER_ID:/etc/ssl/certs/ca-certificates.crt" "$TILEO_EVIDENCE/image/extracted-runtime/ca-certificates.crt"
docker rm "$TILEO_CONTAINER_ID"
```

Runner produksi menambahkan cleanup `trap` agar container sementara dibersihkan saat gagal, tanpa membersihkan artifact bukti. Library GPL tidak perlu dibundel ulang dalam evidence publik bila menambah kewajiban distribusi yang tidak diperlukan; raw ekstraksi untuk audit dapat disimpan di audit storage terbatas, sementara hash dan source fulfillment dipublikasikan.

### 6.3 Rebuild CA dan jaga trust semantics

Bangun bundle dari NSS certdata asli menggunakan recipe/patch/helper upstream yang tepat pada environment terpatok. Simpan command, versions, input hashes, output hash dan daftar fingerprint. Bandingkan **bytes bundle hasil rebuild dengan bundle yang diekstrak dari image**. Catat waktu evaluasi jika converter menyaring sertifikat berdasarkan expiry/distrust date; jangan mematikan validasi trust untuk memaksa equality.

Jika berbeda, cari perbedaan waktu, patch, filtering, sorting atau versi source. Perbedaan harus diselesaikan/reconciled dan direview; `equal:true` tidak boleh ditulis tanpa pembandingan aktual. Jangan merekonstruksi `certdata.txt` dari PEM, mengarang trust bits atau memakai filler/padding.

### 6.4 Register dan notices

Register harus memiliki tepat tiga exception yang relevan, dengan kolom minimal: exception ID, component, package/version/revision, origin, shipped path/target, license expression, binary/data SHA-256, source archive path/SHA-256, upstream recipe/revision, image ID, technical status, legal decision reference.

Sebelum approval, `legal_decision=LEGAL_APPROVAL_PENDING`. Setelah approval, technical register tetap dibekukan; keputusan manusia ditautkan melalui authorization terpisah agar hash core tidak berubah. Certifier menghitung effective legal status dari register **dan** approval receipt terautentikasi.

Sertakan GPL, GCC Runtime Library Exception, MPL dan copyright/notices spesifik sumber yang relevan. `MIT.txt` dari musl tidak dapat digunakan sebagai pengganti atribusi converter/packaging CA. Source TAR harus mempertahankan notice dan lisensi helper-nya sendiri.

**Acceptance B:** source autentik dan recipe/patch lengkap; tiga file image terikat ke source; hasil CA dapat diverifikasi; register hash konsisten; mekanisme source delivery tersedia untuk kedua edition yang relevan.

## 7. Fase C — Full inventory, SBOM, dan gate yang menolak bukti tidak sah

### 7.1 Collector dan inventory

- Inventaris seluruh filesystem image final: path, type/magic, ukuran, hash regular file, symlink target, component mapping, version, license, evidence reference, dan keputusan. Tangani ELF, PE/Mach-O, JS/WASM, static/embedded payload serta data.
- Tidak semua file harus memiliki review manual terpisah. Mapping otomatis berbasis package/source yang sudah diverifikasi boleh, selama tidak ada executable/payload tak dikenal yang lolos tanpa classification.
- Pastikan `texture-compressor`, PVRTexToolCLI dan binary terlarang lain tidak hadir. Evaluasi isi/lisensi `crunch.js` yang masih ada; nama file saja tidak menetapkan clearance atau pelanggaran.
- Rekonsiliasi 285 npm/28 native sebagai angka historis. Hitung ulang dari lockfile dan final image; pisahkan build-only dan shipped. Review metadata-only yang benar-benar dikirim serta embedded binary notices-nya.
- `FROM scratch`/nol package-manager database bukan berarti nol software distro. Catat versi/provenance shared libraries yang disalin.
- Hasilkan SPDX dan CycloneDX baru langsung dari final image dengan scanner yang versinya direkam. Simpan scan command, image ID dan log. Kolektor tidak menulis `RELEASE_APPROVED`.

### 7.2 Syarat certifier

| Gate | Syarat lulus |
| --- | --- |
| G1 Source | Repository root tepat, Git tersedia, clean commit valid, keenam baseline hash dan source archive cocok |
| G2 Image | Image aktual ada; ID/platform/build provenance cocok dengan candidate, test dan source fulfillment |
| G3 Evidence | Schema valid, path tidak ambigu, semua required files ada, ukuran sesuai jenis artifact, seluruh checksum cocok |
| G4 Inventory/SBOM | Kedua SBOM valid, identitas/mapping sesuai image, daftar paket/berkas direkonsiliasi; unknown/forbidden ditolak |
| G5 Tests | TAP/JSON/exit record/log hashes/matrix konsisten; test wajib >0, tidak gagal/cancel/mandatory skip; browser dan native terikat kandidat |
| G6 Exceptions | Tiga komponen tepat, upstream/patch/recipe terverifikasi, hash CSV/manifest/image sama, source-access & notices lengkap |
| G7 Human | Dua approval manusia sah dan otorisasi publikasi atas candidate/manifest yang sama; role dan event benar |

Persyaratan implementasi:

1. Parse JSON dan validasi schema/version SPDX serta CycloneDX, bukan string scanning saja. Parse CSV dengan parser yang benar; tolak baris duplikat, kolom hilang, hash nol, exception tambahan dan status tidak dikenal.
2. Verifikasi setiap `audit_artifacts` hash terhadap bytes aktual. Hash final menggunakan bytes artifact apa adanya. Jika source dinormalisasi LF, lakukan sebelum freeze dan dokumentasikan; jangan mengubah bytes saat validasi checksum delivery.
3. Rekonsiliasi source/test/image/SBOM/exception register; referensi commit sama tidak cukup bila provenance build atau input source berbeda.
4. Verifikasi TAP plan, actual test points, jumlah summary, skipped/todo/cancelled dan runner exit. `passed:true` atau footer buatan tidak boleh menggantikan test points.
5. `--mount-dist` tidak boleh digunakan untuk bukti final: tests harus menjalankan bytes kandidat. Mount fixture/data uji boleh bila declared/read-only dan hash dicatat; jangan menimpa `dist`, `node_modules`, native library, web atau notices.
6. Report `passed_checks` hanya menambahkan gate bila gate itu benar-benar lulus. Pesan centang sebelum failure bukan verdict.
7. Collectors menulis ke staging; rename/publish hasil atomik hanya setelah sukses. Kegagalan harus menghapus/menandai stale output PASS di **scope kandidat itu**, dan tidak meninggalkan JSON `passed:true` yang dapat dipilih tanpa pemeriksaan exit.
8. Cegah fallback lintas versi/evidence directory dan replay artifact lama. Semua input berasal dari root evidence yang dinyatakan dan manifest tunggal.
9. Core approval digest mencakup semua evidence yang relevan, termasuk binary mapping, source, kedua SBOM, policy dan test scope; tidak hanya subset file lama.
10. Local certification tanpa akses autentik ke approval hanya boleh memberi technical recommendation/pending. Setting environment variable berisi hash pilihan operator, Markdown GO, atau JSON reviewer buatan lokal bukan otorisasi manusia.

**Acceptance C:** uji tambahan auditor—nonempty malformed SPDX dan perubahan hash register ke nol—ditolak oleh gate relevan dengan exit nonzero; tidak ada release PASS, termasuk bila input lainnya valid.

## 8. Fase D — Negative controls yang membuktikan gate bekerja

**PIC:** programmer; reviewer Engineering menyaksikan/meninjau log.

Jalankan program gate sebenarnya pada **salinan evidence terisolasi**. Mulai dari technical baseline yang valid: clean Git checkout nyata, authentic source, image/test/SBOM yang benar, status technical eligible/pending approval. Mutasikan satu kondisi per kasus. Jangan menganggap semua kasus lulus hanya karena semuanya terhalang error `.git` yang sama.

Untuk unit fixtures, mock/synthetic data boleh dipakai dengan label **TEST FIXTURE — NOT RELEASE EVIDENCE** dan trust root test yang terpisah. Mode test tidak boleh diterima workflow publish. Positive authorization integration test harus memakai review manusia nyata pada dry run dengan publikasi dinonaktifkan.

| NC | Cacat yang disuntikkan | Penolakan yang wajib dibuktikan |
| --- | --- | --- |
| 01 | Satu dari enam source hashes berubah | G1 source mismatch |
| 02 | SPDX nonempty ditambah garbage sehingga JSON invalid | G3/G4 schema/parse failure |
| 03 | SPDX diubah menjadi JSON valid tetapi checksum lama | G3 hash mismatch |
| 04 | CycloneDX diganti snapshot lama | G3/G4 provenance/image mismatch |
| 05 | Image ID/digest salah atau tag ditukar | G2 actual image mismatch |
| 06 | TAP nol test atau footer tanpa test points | G5 no genuine positive execution |
| 07 | TAP dipotong, plan/count tidak cocok | G5 truncated/inconsistent TAP |
| 08 | Exit nonzero tetapi JSON `passed:true` | G5 runner failure |
| 09 | Test wajib failed/cancelled/skipped/TODO | G5 mandatory coverage failure |
| 10 | Test commit berbeda dari build baseline | G1/G5 subject mismatch |
| 11 | GCC source hilang atau checksum salah | G6 source failure |
| 12 | GCC stub dengan nama folder lengkap dan padding | G6 authenticity failure |
| 13 | Satu patch GCC hilang/diubah atau pkgrel salah | G6 downstream source mismatch |
| 14 | Mozilla certdata sintetis dengan trust buatan | G6 authenticity failure |
| 15 | Rebuilt CA berbeda dari image tetapi manifest `equal:true` | G6 actual equality failure |
| 16 | CSV binary/source SHA nol, duplikat exception atau component ditukar | G6 register binding failure |
| 17 | MPL/non-permissive component tambahan di luar exception | G4/G6 policy violation |
| 18 | Forbidden executable/unknown binary disisipkan | G4 full inventory/classification failure |
| 19 | Log wajib hilang termasuk stderr/negative log | G3 evidence missing |
| 20 | `.git` hilang, root salah atau tree dirty | G1 repository failure |
| 21 | Markdown `Decision: GO`/attestation lokal palsu | G7 no authenticated authorization |
| 22 | Satu role review hilang/ditolak atau reviewer tidak berwenang | G7 role/decision failure |
| 23 | Approval untuk commit/image/core digest lain | G7 subject mismatch |
| 24 | Approval lama direplay pada run/attempt baru | G7 replay failure |
| 25 | Archive/path traversal atau symlink keluar root | G3 unsafe evidence path |
| 26 | Source/policy/fixture berubah setelah core freeze | G1/G3 manifest mismatch, approval invalid |
| 27 | Image diganti sesudah approval sebelum push | G2/prepublish mismatch |
| 28 | PASS lama tersedia lalu run baru gagal | PASS lama tidak dapat dipakai; publish tetap ditolak |

Setiap kasus menyimpan case ID, baseline digest, mutation, command, observed gate/reason, exit code, dan bukti tidak ada publishable PASS. Kasus dianggap PASS bila **alasan penolakan tepat**, bukan sekadar exit 1 dari prasyarat lain. Periksa baseline sesudah test agar mutasi tidak bocor; jangan menulis melalui hardlink yang mengubah artifact asli.

**Acceptance D:** seluruh controls yang berlaku lulus. NC21–24 diuji hingga jalur CI autentik; bila menunggu manusia, laporkan **PENDING HUMAN DRY RUN**, jangan klaim seluruh integration control selesai. Simpan `gate/release-gate-negative-tests.log` dan structured JSON dengan hasil lengkap.

## 9. Fase E — Pengujian nyata dan scope rilis

### 9.1 Tetapkan cakupan sebelum freeze

`release-policy/test-scope.json` mendefinisikan fitur/platform yang dijanjikan, required tests/suites, fixture source/hash, tools, dan expected status. Angka historis 130 bukan kuota yang boleh di-hardcode. Semua test wajib harus benar-benar berjalan.

| Area | Bukti minimal |
| --- | --- |
| Build dan typecheck | `npm ci`, build, typecheck lulus dengan lockfile final |
| API/auth/storage | Upload, validasi, queue, auth/error path, download dan batas keamanan yang tersedia |
| Worker | Job selesai, cancel/retry/timeout, cleanup dan output atomik |
| Vector | GeoJSON/GeoJSONL → output yang dijanjikan; attribute filtering, IDs/budgets dan validitas tiles |
| Raster | GeoTIFF → COG/tiles; CRS, metadata, NoData dan output terbaca |
| Elevation | DTM/DSM, terrain encoding/decoding, scale/offset dan ketelitian yang didokumentasikan |
| 3D | GLB/tileset conversion/validation dan viewer path sesuai fitur publik |
| Browser | Enam spec saat ini: console, vector-batch, raster, elevation, model3d, quickopen; review hasil aktual per test |
| Distribution | Startup dari petunjuk publik, API + worker berfungsi, notices/source links, immutable image pull |
| Licensing | Source/asset notices, full shipped inventory dan tiga exception |

N/A hanya untuk fitur/platform di luar scope yang dinyatakan **sebelum** pengujian, dengan alasan dan persetujuan Engineering/Steward. Jangan mengubah failed mandatory test menjadi optional/skip setelah melihat hasil. Test optional yang dilewati tetap tercatat; suite mandatory tidak boleh dilewati.

Pada snapshot audit, beberapa browser test memakai `test.skip` ketika fungsi Compare tersembunyi. Tentukan status produk fungsi itu: jika dijanjikan rilis, perbaiki dan uji; jika memang tidak termasuk, dokumentasikan scope dan test ID yang N/A. Jangan meluluskan entire browser suite hanya berdasarkan exit code ketika required test dilewati.

### 9.2 Preflight sebelum freeze

```bash
npm ci
npm run typecheck
npm run build
node scripts/verify-npm-notices.js
node scripts/verify-native-licenses.js
node scripts/check-notice-parity.js
npm test
```

Native integration preflight dapat memerlukan GDAL/Tippecanoe pada host. Jika prasyarat belum ada, siapkan fixture/tool environment yang benar. Hasil preflight host membantu menemukan error tetapi bukan pengganti test dalam final image.

Perhatikan verifier native dapat menulis ulang `third-party/native-components.csv`. Finalkan hasil yang memang tracked dan commit sebelum freeze. Sesudah freeze, jalankan verifier hanya bila ia read-only atau menjamin bytes output identik; `git diff --exit-code` harus tetap lulus.

### 9.3 Node integration dalam image

Gunakan `record-test-results.js --image IMAGE_ID`, tanpa `--mount-dist`. Jangan hanya mendata daftar test pada host lalu menyimpulkan semuanya ada dalam container; cocokkan dengan daftar test kandidat. Simpan TAP, stderr, exit JSON, result JSON, test matrix, command dan fixture hashes.

Collector harus menolak `--image` tanpa nilai, `--image --out-dir`, unknown flags, TAP yang hanya berisi footer, gagal/cancel/mandatory skip, serta total/test-points yang tidak konsisten. Status `passed` ditulis berdasarkan seluruh validasi akhir.

### 9.4 Browser terhadap image yang sama

Browser berjalan di luar image, tetapi server dan worker yang dites berasal dari image kandidat. Playwright config saat ini memakai `TILEO_TEST_URL`; fixture helper browser juga menjalankan `gdal_translate` pada host. Sediakan GDAL host sebagai **alat pembuat fixture**, rekam versi/hash hasil fixture, dan jangan menganggapnya binary GDAL produksi.

Contoh setup pada Linux setelah image final tersedia:

```bash
npx playwright install --with-deps chromium
docker run -d --name tileo-release-browser \
  -p 127.0.0.1:8091:8090 \
  -e TILEO_HOST=0.0.0.0 -e TILEO_LOCAL_PROXY=1 \
  "$TILEO_IMAGE_ID" node dist/start.js
curl --fail --retry 20 --retry-connrefused --retry-delay 1 http://127.0.0.1:8091/healthz
TILEO_TEST_URL=http://127.0.0.1:8091 npx playwright test --reporter=json
docker logs tileo-release-browser
docker rm -f tileo-release-browser
```

Runner aktual menangkap JSON report, stdout/stderr, server log, screenshot/trace yang relevan, exit status dan cleanup lewat trap. Image tidak di-mount dengan source aplikasi host. Binding `127.0.0.1` pada contoh ini sengaja untuk pengujian lokal; deployment publik mengikuti konfigurasi autentikasi yang didokumentasikan.

**Periksa startup yang dipublikasikan:** Dockerfile audit menjalankan `dist/api.js` sebagai default, sedangkan `dist/start.js` meluncurkan API dan worker. Reviewer harus memastikan quick start yang dirilis benar-benar dapat menyelesaikan conversion job. Bila mode default perlu diubah, lakukan sebelum freeze dan uji ulang; bila produk memang memakai dua proses/container, uji dan dokumentasikan keduanya. Jangan menguji override lalu mengklaim default deployment yang berbeda telah lulus.

### 9.5 Samples dan dokumentasi publik

Periksa repository canonical untuk Samples; ketidakhadiran dalam clean-export ZIP saja tidak berarti canonical repository kehilangan data. Untuk sample yang dijanjikan di README, pastikan payload tersedia, bukan sekadar Git LFS pointer; cocokkan manifest SHA, CRS/bands, lisensi dan attribution. Gunakan `python3 scripts/finalize-sample-rgb.py --check` pada checkout berisi payload yang benar. Bila sample didistribusikan terpisah, tautan/hash/license dan petunjuk download harus berfungsi.

Jangan menambahkan sample besar ke image hanya agar test lulus. Fixture deterministik kecil sah bila menguji perilaku yang sama; sumber/hash dan pembuatannya dicatat.

**Acceptance E:** seluruh fitur wajib dalam scope lulus pada kandidat final, raw evidence konsisten, startup publik bekerja, dan tidak ada coverage mandatory yang disembunyikan sebagai skip.

## 10. Fase F — Freeze source, build kandidat, dan evidence final

### 10.1 Hindari perubahan versi sesudah approval

Tetapkan metadata source **0.1.0 sebelum freeze**. Kandidat internal diberi identitas seperti `candidate-<commit>-01` dan Docker tag lokal `tileo-rc:0.1.0-<commit>`. Tidak perlu mengubah `package.json` menjadi rc lalu mengeditnya lagi setelah review. Jika tim ingin menerbitkan prerelease `0.1.0-rc.1` dengan bytes metadata berbeda, ia adalah kandidat terpisah; build dan approval final 0.1.0 tetap harus baru.

### 10.2 Freeze yang dapat dibuktikan

Setelah PR perbaikan direview dan digabung, lakukan checkout commit final, pastikan seluruh file release policy/tools/docs/lockfile yang diperlukan sudah tracked. Catat full 40-character commit SHA dan kondisi tree.

```bash
set -euo pipefail
test -z "$(git status --porcelain=v1 --untracked-files=all)"
export TILEO_RELEASE_VERSION=0.1.0
export TILEO_COMMIT=$(git rev-parse HEAD)
export TILEO_IMAGE_REF="tileo-rc:${TILEO_RELEASE_VERSION}-${TILEO_COMMIT}"
export TILEO_EVIDENCE="$PWD/release-evidence/v${TILEO_RELEASE_VERSION}"
export TILEO_REVIEW_STAGING=$(mktemp -d -t tileo-review-XXXXXXXX)
mkdir -p "$TILEO_EVIDENCE"/{source,image,sbom,tests,gate,compliance,release}
git rev-parse HEAD
git status --porcelain=v1 --untracked-files=all
```

Gunakan candidate sequence/run ID untuk membedakan percobaan pada commit yang sama. Folder pada contoh diasumsikan kosong untuk kandidat baru; jangan overwrite snapshot yang sudah dibekukan/disetujui. Pindahkan run lama ke audit storage atau buat direktori candidate-specific yang dipilih eksplisit. Environment variables di atas hanya convenience; certifier tetap membaca identitas sebenarnya.

Bangun dari clean tracked source, misalnya export `git archive` commit ke build context baru di luar checkout, lalu hash archive/context manifest. Jangan membiarkan ignored/untracked source masuk ke Docker context tanpa provenance. Bila menggunakan Git LFS/submodule, ekspor payload/revision yang benar secara eksplisit dan catat manifest; `git archive` biasa tidak otomatis menjamin payload eksternal lengkap.

Contoh untuk checkout yang sudah dipastikan **tidak memerlukan materialisasi LFS/submodule tambahan**:

```bash
export TILEO_BUILD_CONTEXT="$TILEO_REVIEW_STAGING/build-context"
mkdir -p "$TILEO_BUILD_CONTEXT"
git archive --format=tar --output="$TILEO_REVIEW_STAGING/tracked-source.tar" "$TILEO_COMMIT"
tar -xf "$TILEO_REVIEW_STAGING/tracked-source.tar" -C "$TILEO_BUILD_CONTEXT"
sha256sum "$TILEO_REVIEW_STAGING/tracked-source.tar"
gzip -n -c "$TILEO_REVIEW_STAGING/tracked-source.tar" > "$TILEO_EVIDENCE/source/TileO-0.1.0-source.tar.gz"
```

Verifikasi export berisi seluruh build input. Repo dengan LFS/submodule menggunakan exporter yang mematerialisasi dan menginventaris payload secara benar sebelum langkah ini; jangan meneruskan contoh plain archive bila source/sample wajib berubah menjadi pointer.

### 10.3 Build sekali per kandidat

```bash
docker buildx build --platform linux/amd64 --load \
  --label "org.opencontainers.image.version=0.1.0" \
  --label "org.opencontainers.image.revision=$TILEO_COMMIT" \
  --label "org.opencontainers.image.source=https://github.com/enygma-id/TileO" \
  --tag "$TILEO_IMAGE_REF" "$TILEO_BUILD_CONTEXT"
export TILEO_IMAGE_ID=$(docker image inspect --format '{{.Id}}' "$TILEO_IMAGE_REF")
docker image inspect "$TILEO_IMAGE_ID"
```

`TILEO_BUILD_CONTEXT` harus ditetapkan ke export/context yang telah diverifikasi pada langkah sebelumnya; ini bukan folder audit. Rekam build log, Dockerfile/context hash, base/helper image digests, package versions, tool versions dan build timestamp. Dockerfile sekarang mematok base image tetapi `apk add` dapat mengambil paket yang bergerak; pin atau rekam exact resolved packages dan source mapping. Rebuild setelah approval dilarang meskipun source commit sama.

### 10.4 Urutan collector setelah perbaikan antarmuka

Perintah di bawah memakai script existing yang diperbaiki dan script baru dari bagian 4:

```bash
node scripts/audit-image.js --image "$TILEO_IMAGE_ID" --out-dir "$TILEO_EVIDENCE/image"
node scripts/record-test-results.js --image "$TILEO_IMAGE_ID" --out-dir "$TILEO_EVIDENCE/tests"
node scripts/generate-image-notice-paths.js --image "$TILEO_IMAGE_ID" --out-dir "$TILEO_EVIDENCE/image"
node scripts/prepare-compliance-packages.js --image "$TILEO_IMAGE_ID"
node scripts/verify-source-fulfillment.js --image "$TILEO_IMAGE_ID" --evidence-dir "$TILEO_EVIDENCE"
```

Jalankan browser tests bagian 9 dan simpan hasil ke `tests/browser/`. Jalankan negative controls atas evidence final yang disalin terisolasi; simpan log/JSON ke `gate/`. Finalkan provenance **setelah** scanner/source/test collector selesai, sehingga hash-nya bukan snapshot sebelumnya. Kumpulkan hasil unit/typecheck dan actual logs lewat runner yang sama.

`prepare-compliance-packages.js` existing memakai default versi package untuk output. Programmer harus memastikan ia menulis persis ke root evidence yang dipilih; jika menambah `--out-dir`, dokumentasikan dan gunakan secara eksplisit. Jangan mengasumsikan opsi yang belum diimplementasikan tersedia.

Sesudah semua collector:

```bash
git diff --exit-code
test -z "$(git status --porcelain=v1 --untracked-files=all)"
node scripts/verify-release-evidence.js --image "$TILEO_IMAGE_ID" --evidence-dir "$TILEO_EVIDENCE"
```

### 10.5 Image export dan batas digest

Ekspor image yang sama dengan `docker save` atau OCI export, hitung SHA-256 archive dan simpan artifact immutable untuk approval/publish job. Setelah load pada runner lain, verifikasi image ID sama. Jika image export terlalu besar untuk GitHub artifact, gunakan penyimpanan artifact terkontrol yang dapat diakses reviewer; jangan membangun ulang sebagai jalan pintas.

Bedakan tiga nilai:

- **Image ID/config digest:** identitas config image Docker lokal.
- **Registry manifest/index digest:** identitas OCI manifest yang diperoleh dari registry setelah push; bisa berbeda dari image ID.
- **Export archive SHA-256:** integritas file export, bukan registry digest.

Sebelum push, registry digest boleh **UNPUBLISHED/null**. Jangan membuat RepoDigest semu dengan menyalin config ID. Jika rilis hanya `linux/amd64`, jangan mengklaim multiarchitecture. Bila nanti memakai image index, catat index digest dan child manifest/config per platform.

**Acceptance F:** source bersih, image immutable benar, semua bukti final baru terikat satu kandidat, export dapat di-load tanpa perubahan, tidak ada fallback snapshot lama.

## 11. Fase G — Bekukan paket review tanpa lingkaran hash approval

Gunakan **dua lapis** agar evidence tidak berubah hanya karena approval ditambahkan.

### 11.1 Core evidence yang dibekukan sebelum manusia menyetujui

Struktur minimum; file tambahan yang memang relevan boleh disertakan:

```text
release-evidence/v0.1.0/
  candidate.json
  source/
    source-baseline.json
    source-export-manifest.json
    TileO-0.1.0-source.tar.gz
    build-context-sha256.txt
  image/
    image-inspect.json
    image-export.json
    release-image-digest.txt
    release-provenance.json
    build-provenance.json
    build.stdout.log
    build.stderr.log
    rootfs-files.json
    binary-linkage.csv
    native-package-provenance.json
    image-notice-paths.csv
    license-decisions.csv
    gdal-drivers.txt
    runtime-file-hashes.json
  sbom/
    sbom-image.spdx.json
    sbom-image.cdx.json
    scanner-invocation.json
  tests/
    test-scope.json
    fixture-manifest.json
    preflight-results.json
    integration-tests.tap
    integration-tests.stderr.log
    integration-test-results.json
    exit-status.json
    test-matrix.csv
    browser/
      browser-results.json
      browser.stderr.log
      server.log
      execution.json
  gate/
    negative-controls.json
    release-gate-negative-tests.log
    technical-eligibility.json
  compliance/
    exceptions-register.csv
    source-provenance.json
    source-verification.json
    ca-rebuild-verification.json
    source/
      gcc-runtime-corresponding-source.tar.gz
      mozilla-ca-bundle-source.tar.gz
    notices/
    customer/
      THIRD-PARTY-NOTICES.md
      THIRD-PARTY-EXCEPTIONS.md
      SOURCE-ACCESS.md
      delivery-manifest.json
    rights-review-summary.json
  release/
    release-notes.md
    operator-runbook.md
    policy-snapshot.json
    reviewers-policy-snapshot.json
  core-evidence-manifest.json
```

`candidate.json` memuat version, candidate ID, repository, commit, clean status, source/context hash, image ID/platform, image export hash/location, policy hash, CI run/attempt dan build identity. `release-notes.md` pada core berisi fakta kandidat; hasil registry dan tanggal publikasi aktual ditambahkan sebagai publication receipt terpisah.

Manifest mencatat **semua file core yang memang termasuk paket**, bytes, SHA-256 dan perannya. Required-path contract terpisah memastikan generator tidak menghilangkan file penting lalu menganggap manifest lengkap. Tidak ada path absolute/`..`/symlink escape. Manifest tidak mencakup dirinya sendiri. Tetapkan `core_evidence_sha256 = SHA256(bytes core-evidence-manifest.json)`.

Image export besar boleh menjadi artifact pendamping di luar core archive. Hash/ukuran/artifact ID-nya wajib tercantum dalam core, dan verifikator wajib mengambil serta mencocokkannya. Referensi tanpa bytes yang dapat diakses bukan bukti yang selesai. Dokumen kontrak/CLA rahasia boleh berada pada annex terbatas dengan reference/hash dan keputusan rights review publik yang cukup; jangan memasukkan kontrak atau personal data ke release publik.

Urutan finalisasi:

1. Jalankan technical certifier dengan output staging di luar core; hasil yang diharapkan `TECHNICALLY_ELIGIBLE_PENDING_APPROVAL`.
2. Salin technical report final ke `gate/technical-eligibility.json`, tanpa core digest yang merujuk dirinya sendiri.
3. Finalkan semua core artifacts; buat manifest deterministic, urutan path stabil dan hash bytes aktual.
4. Jalankan verifier read-only atas manifest. Output verifikasi/approval setelah tahap ini disimpan di luar core.
5. Upload core dan image export dengan artifact IDs/checksums yang tetap. Tampilkan version/commit/image/core SHA pada GitHub job summary untuk reviewer.

Contoh setelah script baru tersedia:

```bash
node scripts/certify-release-gate.js --image "$TILEO_IMAGE_ID" \
  --evidence-dir "$TILEO_EVIDENCE" --out-dir "$TILEO_REVIEW_STAGING/technical"
node scripts/create-release-manifest.js --evidence-dir "$TILEO_EVIDENCE" \
  --output "$TILEO_EVIDENCE/core-evidence-manifest.json"
node scripts/verify-release-evidence.js --image "$TILEO_IMAGE_ID" \
  --evidence-dir "$TILEO_EVIDENCE" --manifest "$TILEO_EVIDENCE/core-evidence-manifest.json"
```

`TILEO_REVIEW_STAGING` adalah direktori output terpisah yang disiapkan operator. Jangan menjalankan perintah pertama lagi dengan output ke core sesudah manifest dibekukan. Perubahan satu byte core membatalkan approval sebelumnya.

### 11.2 Authorization dan publication receipts di luar core

```text
authorization/<candidate-id>/
  engineering-review-receipt.json
  legal-review-receipt.json
  release-steward-receipt.json
  github-approval-history.json
  github-run.json
  release-authorization.json
  release-gate-pass.json

publication/<candidate-id>/
  tag-verification.json
  github-assets-verification.json
  registry-verification.json
  source-access-verification.json
  publication-verification.json
```

Manusia menyetujui **core manifest digest**, commit dan image; receipts dibuat setelah event approval asli. Final package dapat berisi core + authorization + delivery manifest baru yang mengikat semuanya. Jangan memasukkan authorization kembali ke core yang sudah disetujui. Publication receipts tidak menulis ulang core atau approval.

Delivery manifest di dalam archive tidak memasukkan hash dirinya sendiri atau hash archive yang menampungnya. Hash archive final berada di `SHA256SUMS` eksternal, sehingga tidak menimbulkan lingkaran hash. Final certifier menerima `--manifest` dan memeriksa exact core digest pada approval; ia tidak memakai rumus subset evidence digest lama yang berbeda.

## 12. Fase H — Verifikasi manusia yang konkret

### 12.1 Review Engineering

Reviewer harus menerima link ke PR/commit, full candidate identity, core manifest, image export, raw logs, hasil controls, serta ringkasan blocker yang sudah ditutup. Reviewer mengunduh artifact berdasarkan ID run kandidat dan memverifikasi hash sebelum menilai.

Checklist yang ditandatangani secara terautentikasi:

- [ ] Source bersih dan identitas commit/image/context/export konsisten.
- [ ] Tidak ada closure sintetis, PASS lama, snapshot SBOM salah atau dua output yang ambigu.
- [ ] Source GCC/patch/recipe sesuai binary distro yang benar-benar dikirim.
- [ ] Source Mozilla asli; CA rebuild dibandingkan dengan file image, bukan hanya file lokal lain.
- [ ] SBOM/schema/full inventory dan exception mapping ditinjau; unknown resolved; `crunch.js` dinilai berdasarkan konten/lisensi.
- [ ] Build/typecheck, native/container, API/worker, vector/raster/elevation/3D/browser wajib lulus; test skips/N/A sesuai scope awal.
- [ ] Negative controls termasuk malformed SBOM, register tamper dan approval replay benar-benar menolak melalui gate sebenarnya.
- [ ] Quick start publik diuji; versi/platform/support limitations akurat; sample links/payload dan hashes sesuai.
- [ ] Workflow publication menggunakan image export yang sama dan revalidasi sebelum side effect.

Reviewer mencatat **APPROVE** atau **REJECT**, alasan, daftar evidence yang diperiksa, identitas GitHub, waktu dan exact subject. Review PR kode saja tidak menggantikan review kandidat hasil build.

### 12.2 Review Legal/IP dan source fulfillment

Reviewer Legal/IP memperoleh paket teknis yang sama dan rights annex yang relevan. Gunakan tabel keputusan per komponen, bukan satu kalimat blanket approval:

| Objek review | Hal yang harus diputuskan manusia | Bukti riil |
| --- | --- | --- |
| libstdc++ | License/exception tepat, binary/source/revision sesuai, metode pemenuhan source cocok distribusi | Source asli + patches + recipe + binary provenance/hash + notices + delivery route |
| libgcc | Pemeriksaan tersendiri atas file/version/source dan exception | Register EXC-002 dan bukti source/binary yang relevan |
| Mozilla CA material | MPL/packaging notices, source/trust provenance, akses source dan hak penerima | Certdata NSS asli + converter/recipe + equality proof + notices/source-access |
| First-party Community | File yang dicakup AGPL, copyright/provenance, source lengkap dan kewajiban distribusi/deployment | LICENSE/NOTICE + source archive + build instructions + review source-access |
| First-party Enterprise | Enygma berhak memberikan grant proprietary atas kode yang dilisensikan | Employment/assignment/CLA atau grant setara yang ditandatangani dan cakupannya sesuai |
| Third-party/npm/assets/samples | Tidak ada hak third-party yang diklaim milik Enygma; attribution dan pembatasan distribusi dipenuhi | Inventory/notices/asset provenance; keputusan atas metadata-only shipped packages |
| Commercial terms | Perjanjian tidak membatasi hak upstream yang harus dipertahankan; grant Enterprise jelas | Template kontrak/EULA dan daftar third-party carve-outs |

`CLA.md` yang ada di repository menyebut dirinya proposed agreement dan bukan signed consent. Keberadaan file itu atau nama contributor tidak membuktikan hak relicensing. Legal/IP harus menginventaris kontribusi yang relevan, hak pegawai/kontraktor dan acceptance record yang nyata; jangan meminta CLA baru bila hak yang diperlukan sudah sah dari dokumen lain. Jika hak Enterprise belum terbukti, **Enterprise clearance tetap BLOCKED** sampai diselesaikan. Perubahan scope ke Community-only memerlukan keputusan pemilik; tidak boleh dilakukan diam-diam oleh programmer.

**Jalur source delivery yang direkomendasikan untuk rilis pertama:** lampirkan source GCC dan CA asli, notices, first-party source dan petunjuk build sebagai assets GitHub Release yang sama; tautkan jelas dari release notes, README/source-access dan lokasi distribusi image. Untuk pengiriman Enterprise offline, sertakan materi pendamping itu dalam delivery bundle. Reviewer menetapkan dasar/metode lisensi yang tepat dan retensi akses; jangan membuat written offer tanpa prosedur dan pemilik kewajibannya.

FAQ GNU menyatakan distribusi runtime library itu sendiri dalam object form tetap memerlukan pemenuhan source melalui metode GPLv3 yang berlaku. Mozilla meminta akses source yang relevan dan pemberitahuan penerima. Legal/IP mencatat metode yang dipilih, lokasi, durasi/retensi, penanggung jawab dan cara menangani permintaan source. [GNU GCC Exception FAQ](https://www.gnu.org/licenses/gcc-exception-3.1-faq.html.en), [GNU source access FAQ](https://www.gnu.org/licenses/gpl-faq.html), [Mozilla MPL FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/).

Untuk Community, periksa juga bagaimana pengguna mendapat corresponding source ketika kewajiban AGPL berlaku, termasuk network interaction pada versi termodifikasi yang tercakup; sediakan link yang sesuai deployment. [GNU AGPLv3](https://www.gnu.org/licenses/agpl-3.0.html).

Checklist Legal/IP:

- [ ] Ketiga exception diputuskan per komponen terhadap exact version/path/hash/image.
- [ ] Source lengkap/relevan, dapat diekstrak, notices asli dipertahankan, hak upstream tidak ditimpa kontrak Enterprise.
- [ ] Source-access Community dapat digunakan tanpa syarat tambahan yang bertentangan; uji download publik setelah publish.
- [ ] Delivery Enterprise memuat materi third-party yang diwajibkan; pihak penerima dan haknya jelas.
- [ ] Hak first-party/relicensing terverifikasi dari bukti autentik, bukan boilerplate CLA.
- [ ] Asset/sample licenses dan attribution sesuai payload yang diterbitkan.
- [ ] Penanggung jawab retensi/source requests ditetapkan dan alamat kontak nyata berfungsi.
- [ ] Keputusan **APPROVE/REJECT**, alasan dan scope diikat ke core digest yang diperiksa.

Keputusan Legal/IP adalah tindakan manusia yang diberi mandat. Tool boleh mengumpulkan evidence dan membuat format receipt dari event asli; tidak boleh menulis APPROVED atas nama reviewer atau menganggap ringkasan lisensi sebagai legal signoff.

### 12.3 Isi minimum keputusan manusia

Template berikut adalah **kolom yang harus diisi dari keputusan sebenarnya**, bukan file GO yang dapat diedit untuk meluluskan gate:

```text
role: Engineering / Legal-IP / Release-Steward
decision: APPROVE atau REJECT
reviewer_login dan reviewer_user_id: identitas terautentikasi
authority_reference: mandat/reviewer policy yang sah
repository: enygma-id/TileO
version: 0.1.0
candidate_id: identitas kandidat
commit: full SHA
image_id: actual config/image ID
platform: linux/amd64
core_evidence_sha256: digest manifest yang diperiksa
image_export_sha256: digest export yang diperiksa
workflow_run_id dan run_attempt: run yang disetujui
review_reference: URL/event ID dan environment ID
reviewed_scope dan limitations: hal yang disetujui
comment: alasan/hasil review
recorded_at: waktu receipt; pisahkan dari waktu event bila API tidak menyediakannya
```

Comment approval GitHub harus menyebut setidaknya `candidate_id` dan `core_evidence_sha256`, sehingga event autentik tidak terlepas dari materi yang dibaca. User ID/role/environment diperoleh dan divalidasi dari GitHub serta policy; jangan dipercaya dari field JSON yang diisi sendiri. Pengumpulan receipt otomatis tidak sama dengan approval otomatis.

## 13. Fase I — GitHub workflow dan kontrol approval

### 13.1 Alur yang ditetapkan

Gunakan workflow rilis dengan `workflow_dispatch` pada commit yang disetujui dari protected main. Job berurutan:

```text
prepare-candidate (clean commit, build sekali, tests, evidence, core freeze)
        ↓
engineering-review (environment: release-engineering)
        ↓
legal-review       (environment: release-legal)
        ↓
publish           (environment: release; otorisasi Release Steward)
        ↓
verify-publication
```

Job review mengunduh artifact IDs dari job kandidat pada run yang sama, memverifikasi digest read-only, dan membuat receipt dari keputusan GitHub setelah manusia menyetujui environment. Publish job memverifikasi ulang dua keputusan dan persetujuan Steward sebelum membuat tag/release/push image. Jangan menggunakan artifact bernama `latest` atau mengambil evidence dari run yang berbeda tanpa binding eksplisit.

Sediakan input `publish=false` untuk dry run yang benar-benar tidak mempunyai jalur side effect publikasi. Dry run ini menguji dua review manusia dan final gate tanpa membuat tag/Release/GHCR production tag. Sesudah flow berubah, jalankan lagi dry run; setelah flow tervalidasi dan source dibekukan, run kandidat produksi tetap memperoleh approval baru atas subject-nya sendiri.

### 13.2 Pengaturan oleh admin repository

Admin mengatur dan menyimpan bukti setting aktual:

1. Proteksi main: PR review dan required checks; cegah bypass biasa; perubahan workflow/policy/reviewer list harus direview pihak berwenang.
2. Buat environment `release-engineering`, `release-legal`, dan `release`, masing-masing reviewer role yang tepat. Aktifkan prevent self-review dan nonaktifkan admin bypass sesuai kemampuan plan.
3. Batasi deployment ke main yang diproteksi untuk jalur dispatch ini. Jangan memakai pilihan protected branches yang ternyata tidak mempunyai branch protection aktif.
4. Batasi pembuatan/perubahan tag `v*` ke jalur/operator rilis yang berwenang; lindungi tag final dari pemindahan/penghapusan. Catat konfigurasi aktual dan siapa yang punya bypass.
5. Token baca/check jobs minimal `contents:read`, `actions:read`, ditambah akses setting yang memang dibutuhkan. Hanya publish job terlindungi yang mendapat `contents:write`/`packages:write`. Jangan memberikan akses write itu pada PR tidak tepercaya.
6. Pin actions/helper/scanner ke revision/digest yang direview dan catat versinya. Jangan mengekspos token/source-access privat dalam log publik.
7. Artifact retention cukup untuk review dan pemulihan—misalnya 30 hari untuk staging, kemudian arsip rilis dipertahankan sesuai kebijakan source delivery. Retention 1 hari pada image kandidat lama berisiko kedaluwarsa saat menunggu manusia.

**Satu environment dengan dua reviewer bukan dua persetujuan wajib:** GitHub mengizinkan satu reviewer dari daftar untuk melanjutkan job. Karena itu dipakai environment Engineering dan Legal terpisah. Required reviewers bergantung pada visibility/plan; verifikasi fitur tersedia sebelum menjalankan flow. [GitHub deployment protection rules](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).

Jika prevent self-review menghalangi reviewer yang juga memulai run, gunakan operator pemicu lain yang berwenang; jangan mematikan kontrol agar ia bisa menyetujui dirinya sendiri. Jika GitHub plan tidak mendukung kontrol yang diperlukan, admin harus menyediakan mekanisme approval terautentikasi setara dan menguji enforcement-nya sebelum GO. Markdown GO bukan fallback.

### 13.3 Cara manusia memberi persetujuan

Pada Actions run kandidat, reviewer membuka ringkasan, mengambil artifact, mengecek checklist sesuai peran, lalu memilih **Review deployments** dan Approve atau Reject pada environment perannya. Sertakan comment identitas kandidat/core digest. Jika Reject, workflow berhenti dan programmer menindaklanjuti alasan. Tidak ada robot yang mengirim approval API atas nama manusia. [GitHub reviewing deployments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments).

### 13.4 Verifikasi event asli oleh workflow

Ambil run metadata dan review history via GitHub API, simpan response dan request metadata tanpa token. Contoh read-only di CI:

```bash
gh api "repos/enygma-id/TileO/actions/runs/$GITHUB_RUN_ID"
gh api "repos/enygma-id/TileO/actions/runs/$GITHUB_RUN_ID/approvals"
```

`collect-human-approvals.js` mencocokkan repo/run/head SHA, candidate ID, artifact IDs, manifest digest di comment, environment IDs, decision, reviewer user IDs dan policy yang disetujui. Jangan menebak field/timestamp yang tidak disediakan API; gunakan event/job record pendamping atau nyatakan batasnya. [GitHub workflow run review-history API](https://docs.github.com/en/rest/actions/workflow-runs#get-the-review-history-for-a-workflow-run).

Untuk rilis pertama, buat workflow run baru bila kandidat atau attempt berubah; jangan reuse persetujuan dari run/attempt lama. Jika API/history tidak cukup mengikat rerun, **tolak rerun untuk publikasi** dan minta run baru dengan review baru. Bukti role berasal dari environment yang dikonfigurasi dan policy; jangan menerima `reviewer_roles` buatan input JSON begitu saja. Akses API gagal berarti authorization belum terverifikasi.

Publish job checkout **exact candidate commit** dan memverifikasi policy/workflow sesuai source yang direview. Menggunakan `main` terbaru setelah review dapat mengubah code tanpa approval. Perubahan rules/reviewer policy selama run membatalkan otorisasi jika memengaruhi trust; validasi ulang setting snapshot sebelum publish.

### 13.5 Uji alur approval sebelum rilis

- Tanpa approval Engineering: job berikutnya tidak berjalan.
- Engineering APPROVE, Legal REJECT: publish tidak berjalan.
- Dua reviewer dicantumkan dalam satu environment: buktikan desain tidak menganggapnya dua role approval.
- Dua approval dengan core digest yang salah/lama: final gate menolak.
- Reviewer tidak terdaftar/approval lokal palsu: menolak.
- Dua role dan Steward menyetujui candidate yang tepat pada dry run: final gate boleh menghasilkan **AUTHORIZED_FOR_PUBLICATION**, tetapi input `publish=false` menjamin tidak ada tag/push/Release.
- Coba image swap setelah approval pada lingkungan uji: pemeriksaan prepublish menolak sebelum side effect.

Simpan screenshot setting, URL run, API responses, hasil cases dan log final gate. Screenshot membantu review, tetapi bukan satu-satunya enforcement.

**Acceptance H/I:** dua keputusan role dan otorisasi Steward sah, subject sama, enforcement terbukti, akses source siap, dan tidak ada blocker P0 aktif. Baru setelah itu status **GO FOR PUBLICATION** diberikan.

## 14. Fase J — Publikasi GitHub dan image yang telah disetujui

**Bagian ini hanya dijalankan setelah final authorization sah.** Pembuatan plan ini tidak berarti approval teknis/legal telah diperoleh. Programmer boleh menyiapkan draft/runbook; orang yang berwenang menyetujui kandidat, kemudian workflow terlindungi melaksanakan publikasi.

### 14.1 Pemeriksaan tepat sebelum side effect

1. Unduh core, authorization dan image export dari artifact IDs yang disetujui. Verifikasi seluruh hash; jangan memakai file lokal sisa run sebelumnya.
2. Load image export, inspeksi actual image ID/platform dan cocokkan dengan candidate; jalankan verifier read-only dan final certifier dengan approvals.
3. Pastikan commit/policy/workflow sesuai subject; tree bersih; GitHub reviewers/settings sesuai policy; tidak ada approval yang ditolak/dibatalkan.
4. Pastikan tag `v0.1.0` belum dipakai. Bila sudah ada, berhenti dan investigasi; jangan force-push, hapus atau memindahkan tag untuk menutup masalah.
5. Pastikan release notes dan assets siap, source access URLs terencana, kontak serta download route benar, dan token publish hanya tersedia setelah protected approval.
6. Gate final mengeluarkan `release-gate-pass.json` baru berstatus **AUTHORIZED_FOR_PUBLICATION**, memuat version/commit/image/platform/core digest/export hash/role receipts/run IDs. Jika mempertahankan enum existing `RELEASE_APPROVED`, semantiknya harus sama ketat dan certificate lama tidak boleh diterima.

Ganti trust model lama yang hanya menerima `TILEO_TRUSTED_APPROVAL_SHA256` dari environment dengan verifikasi event/policy/subject dari bagian 13. Hash yang diketahui operator sendiri bukan bukti kewenangan. Opsi legacy yang dapat meluluskan local GO tanpa autentikasi harus ditolak pada jalur produksi.

### 14.2 Assets GitHub yang disiapkan

| Asset publik | Isi |
| --- | --- |
| `TileO-0.1.0-source.tar.gz` | Source first-party exact commit, license/notices/build instructions dan source dependencies/akses yang diperlukan |
| `TileO-v0.1.0-Release-Closure.tar.gz` | Core evidence + authorization publik tersanitasi + delivery manifest |
| `gcc-runtime-corresponding-source.tar.gz` | Authentic GCC source/patch/recipe yang sesuai image |
| `mozilla-ca-bundle-source.tar.gz` | Authentic CA source/recipe/helpers/notices yang sesuai image |
| `THIRD-PARTY-NOTICES.md` | Notices actual shipped components |
| `THIRD-PARTY-EXCEPTIONS.md` | Tiga exception dengan scope dan kewajiban yang dipertahankan |
| `SOURCE-ACCESS.md` | Nama/path/URL/hash source, cara mengambilnya, terms dan kontak yang telah direview |
| `sbom-image.spdx.json`, `sbom-image.cdx.json` | SBOM final kandidat |
| `SHA256SUMS` | Hash bytes assets final; tidak mencakup dirinya sendiri |

Archive jangan memasukkan credentials, private contracts, fabricated source atau PASS lama. Source unduhan otomatis GitHub saja tidak menjamin GCC/CA source pendamping ikut; lampirkan materi yang diperlukan secara eksplisit. Struktur folder source di `SOURCE-ACCESS.md` harus sesuai asset riil, bukan tautan relatif dari `customer/` yang berakhir 404.

`release-notes.md` minimal menjelaskan: rilis publik pertama 0.1.0, fitur/platform yang diuji, API masih berkembang, quick start yang valid, Community/Enterprise boundaries, tiga exception, source/assets/checksums, known limitations, dan CI evidence link. Tidak menyebut 100% permissive, zero copyleft, full legal certification, atau test count yang belum dibuktikan.

### 14.3 Urutan publikasi yang menjaga source-access

1. **Setelah GO**, buat tag `v0.1.0` pada exact approved commit melalui jalur berwenang, lalu draft GitHub Release dan upload seluruh assets yang telah diverifikasi. Jangan membuat tag dari HEAD yang berubah.
2. Verifikasi draft asset hashes/kelengkapan, lalu publish GitHub Release/source assets. Catat bahwa distribusi image sedang diselesaikan bila belum tersedia; jangan mengklaim registry verification sudah PASS.
3. Pastikan source assets dapat diakses penerima sesuai metode distribusinya, lalu push/tag **image yang sama** ke GHCR production path. Source tidak boleh baru akan disediakan sesudah binary sudah didistribusikan.
4. Ambil registry manifest digest, cocokkan config/platform/layers dengan kandidat, dan lakukan pull immutable ke environment bersih.
5. Jalankan pemeriksaan pascapublikasi. Update informasi publik dengan registry digest dan hasil yang benar bila mekanisme release mengizinkan. Jangan mengubah core/archive/source assets yang sudah disetujui.

Contoh command operator **sesudah GO**, yang disesuaikan ke package path final dan automation policy:

```bash
gh release create v0.1.0 --repo enygma-id/TileO \
  --target "$TILEO_COMMIT" --draft \
  --title "TileO v0.1.0" --notes-file "$TILEO_RELEASE_NOTES"
gh release upload v0.1.0 --repo enygma-id/TileO "$TILEO_ASSET_DIR"/*
# Publish draft melalui protected workflow/operator setelah assets diverifikasi.
docker tag "$TILEO_IMAGE_ID" ghcr.io/enygma-id/tileo:0.1.0
docker push ghcr.io/enygma-id/tileo:0.1.0
```

`TILEO_RELEASE_NOTES` dan `TILEO_ASSET_DIR` harus menunjuk materi final yang sudah diotorisasi. Tidak menggunakan opsi overwrite/clobber. Bila tag harus dibuat sebelum `gh release create` karena ruleset, operator/workflow yang diizinkan membuat tag exact commit lebih dahulu; command create tidak boleh diam-diam menghasilkan tag yang berbeda.

`latest` tidak otomatis diperlukan untuk 0.1.0. Publikasikan tag versi immutable terlebih dahulu; gunakan `latest` hanya bila Steward memilih channel tersebut dan mapping-nya diverifikasi. Nonaktifkan/restruktur trigger rilis lama yang akan membangun image baru ketika tag dibuat—tag event boleh melakukan verifikasi, tetapi tidak mengganti kandidat yang disetujui.

Jika tidak mendistribusikan image pada rilis ini, scope source-only harus diputuskan pemilik dan release notes diperbarui sebelum freeze. Jangan diam-diam menghilangkan deliverable image untuk menutup blocker atau menjanjikan image yang belum tersedia.

### 14.4 Verifikasi sesudah publish

Lakukan dari lingkungan bersih/penerima eksternal, bukan hanya shell yang masih memegang artifact lokal:

- Resolve `v0.1.0` ke full approved commit, termasuk peel annotated tag bila dipakai.
- Download assets publik, hitung ulang `SHA256SUMS`, ekstrak source TAR dan periksa isi/binding-nya.
- Unduh source GCC/CA lewat route yang tertulis pada `SOURCE-ACCESS.md`; pastikan tidak memerlukan akses internal yang tidak dimiliki penerima Community.
- Inspeksi registry manifest/index dari registry, catat immutable digest sebenarnya; verifikasi platform/config/layers yang relevan dengan image lokal. Kesamaan nama tag atau nilai RepoDigest yang diketik sendiri tidak cukup.
- Pull `ghcr.io/enygma-id/tileo@sha256:<manifest-digest-aktual>` dengan akses sesuai audience; pastikan image ID/config sesuai kandidat. Jalankan smoke API + worker conversion dari quick start yang dirilis.
- Pastikan metadata/source labels dan release notes menunjuk versi/repository yang benar.
- Cek tidak ada secret/private contract pada assets/log publik.

Simpan `publication-verification.json` berisi URLs, commit/tag, image/config/manifest digests, asset checksums, waktu dan hasil aktual. Tautkan ke run publik dan arsipkan dengan retensi yang sesuai. Jika fitur immutable release melarang penambahan asset pascapublikasi, gunakan lokasi receipt pendamping yang telah ditetapkan; jangan mengubah asset/core atau menonaktifkan proteksi untuk menggantinya.

Status **PUBLISHED_VERIFIED** baru diberikan setelah seluruh pemeriksaan yang berlaku lulus. Bila GitHub Release berhasil tetapi registry gagal, catat **PARTIALLY_PUBLISHED — IMAGE_PENDING/FAILED**, pertahankan source access dan investigasi. Jangan menyebut seluruh distribusi selesai.

## 15. Kegagalan, pembatalan kandidat, dan perbaikan pascarilis

| Kondisi | Tindakan wajib |
| --- | --- |
| Source/build/lockfile/policy berubah sebelum approval | Freeze commit/kandidat baru; regenerasi evidence yang bergantung pada perubahan |
| Core evidence berubah sesudah review | Batalkan approval kandidat lama; freeze manifest baru dan minta review baru |
| Hanya receipt publikasi ditambahkan | Simpan di luar core; jangan ubah identitas yang sudah disetujui |
| Approval manusia belum ada | Pending; jangan mengarang nama/tanda tangan/GO |
| Tool/network/fixture tidak tersedia | BLOCKED dengan prasyarat dan PIC penyelesaiannya; tidak mengganti dengan simulated PASS |
| Source upstream tak cocok dengan binary | Hentikan source fulfillment; identifikasi paket sebenarnya dan siapkan source yang tepat |
| Wajib test gagal atau skip | Perbaiki sebab atau ubah scope melalui keputusan pemilik sebelum kandidat baru; tidak override gate |
| Artifact kedaluwarsa saat menunggu reviewer | Pulihkan exact bytes dari arsip tepercaya yang hash-nya sama; bila tidak bisa, kandidat/review baru |
| Publish salah artifact/tag | Hentikan distribusi lanjutan, pertahankan bukti dan source; beri catatan koreksi; jangan memindahkan tag diam-diam |
| Bug ditemukan setelah 0.1.0 publik | Perbaiki melalui versi baru, biasanya 0.1.1 untuk koreksi yang sesuai; jalankan gate kandidat baru |

Retain source/notices yang diwajibkan untuk binary yang sudah terdistribusi, termasuk jika rilis ditarik. Penarikan bukan alasan menghilangkan akses source yang masih menjadi kewajiban. Komunikasi eksternal/koreksi dilakukan oleh penanggung jawab yang berwenang.

## 16. Tabel GO/NO-GO yang harus diisi

Gunakan **VERIFIED / OPEN / BLOCKED / PENDING HUMAN REVIEW / N/A APPROVED**. Jangan mengisi VERIFIED hanya karena script baru ditulis. Setiap VERIFIED harus merujuk evidence path/hash dan command/hasil aktual.

| Gate akhir | Status awal plan | Evidence penutupan yang harus diisi |
| --- | --- | --- |
| Metadata aktif 0.1.0 dan scope/limitations akurat | OPEN | Version consistency report + reviewed docs diff |
| Source clean dan build context sesuai commit | OPEN | Git/build provenance + context/source hashes |
| Image immutable dapat diperiksa | OPEN | Raw inspect + export hash + load verification |
| Source GCC/patch/recipe ↔ actual binary | OPEN untuk kandidat final | Source verification + binary package provenance |
| NSS/CA source ↔ actual image bundle | OPEN untuk kandidat final | Official source checks + rebuild/image equality |
| Inventory, SPDX, CycloneDX dan notices konsisten | OPEN | Full inventory + valid fresh SBOM + matching manifest |
| Semua test wajib dan startup publik lulus | OPEN | TAP/JSON/exit/logs/browser + test-scope reconciliation |
| Negative controls dan approval dry run lulus | OPEN | Case-by-case logs, baseline proof dan CI review events |
| Closure baru lengkap, bebas stale/fake PASS | OPEN | Required-path validation + core manifest + package checksums |
| Hak first-party dan Enterprise terbukti | PENDING HUMAN REVIEW | Rights/CLA/assignment review references |
| Legal/IP tiga exceptions + source delivery | PENDING HUMAN REVIEW | Authenticated Legal/IP decision bound to subject |
| Engineering candidate approval | PENDING HUMAN REVIEW | Authenticated Engineering decision bound to subject |
| GitHub protection dan publisher enforcement | OPEN | Settings/API snapshot + successful/negative dry run |
| Otorisasi Release Steward | PENDING HUMAN REVIEW | Protected approval atas exact candidate/core |
| Tag/assets/source-access/registry pascapublish | NOT RUN | Publication receipts dari penerima/clean environment |

**GO FOR PUBLICATION** membutuhkan seluruh gate prapublikasi VERIFIED, mandatory blocker nol, dua review role dan Steward sah. Risk acceptance hanya untuk isu nonblocker yang jelas berada di luar acceptance wajib, dengan alasan/owner; tidak boleh digunakan untuk menerima source palsu, approval palsu, identity mismatch, wajib test gagal, atau hak distribusi yang belum terbukti.

## 17. Paket handoff akhir dari programmer

Serahkan ke pemilik/reviewer:

1. PR/diff implementasi dan commit final, dengan ringkasan perubahan dan alasan.
2. `RELEASE_CLOSURE_REPORT.md` yang memetakan R01–R08 dan G1–G7 ke evidence, hasil aktual dan blocker tersisa.
3. Core evidence, manifest, image export atau aksesnya, notices/source archives yang dapat diverifikasi.
4. Hasil test/negative controls lengkap, termasuk controls tambahan auditor dan acceptance per kasus.
5. Paket review manusia, reviewer/environment mapping dan prosedur klik review.
6. Authorization receipts dan certificate final **hanya setelah** persetujuan nyata.
7. GitHub Release/source assets, registry manifest digest dan publication receipts **hanya setelah** publish sebenarnya.

Format entri closure report:

```text
ID:
Masalah sebelum perbaikan:
Perubahan aktual (file/commit):
Command yang dijalankan:
Environment/image/fixture identity:
Expected:
Observed + exit code:
Evidence path + SHA-256:
Status: VERIFIED / OPEN / BLOCKED / PENDING HUMAN REVIEW
PIC dan next action jika belum selesai:
```

Status summary tidak boleh melampaui bukti paling lemah yang masih wajib. Pada saat dokumen plan ini dibuat, semua status final di atas adalah pekerjaan yang harus diselesaikan; audit source historis yang lulus tidak mengesahkan build baru secara otomatis.

## 18. Brief siap diberikan kepada programmer/agen implementasi

> Kerjakan repository Git TileO canonical mengikuti MD ini dan audit `TileO-Clean-Reaudit-2026-10-28.md`. Target rilis publik pertama adalah 0.1.0; 0.2.0 hanya label internal. Implementasikan perbaikan aktual pada generator, certifier, test collector, closure packager dan workflow. Pertahankan source GCC/Mozilla autentik yang sudah benar, lalu buktikan hubungannya dengan binary/data dalam image final. Tutup stale closure/SBOM, malformed SBOM dan register-tamper acceptance, clean-source provenance, serta authenticated human approvals. Jalankan test nyata dan negative controls pada kandidat yang sama. Siapkan core evidence immutable dan paket review Engineering/Legal/IP/Steward. Jangan mengarang log, source atau approval. Kerjakan semua engineering yang tidak bergantung pada keputusan manusia sampai reviewable; bila review diperlukan, serahkan paket konkret berikut subject digest dan tindakan reviewer. Publikasikan tag/GitHub Release/GHCR hanya melalui flow protected setelah otorisasi manusia atas kandidat tersebut. Selesai berarti release 0.1.0 benar-benar terverifikasi, atau blocker spesifik dilaporkan secara jujur dengan PIC dan kebutuhan penyelesaian.

## 19. Referensi resmi

- [Semantic Versioning — initial development dan version immutability](https://semver.org/).
- [GCC Runtime Library Exception FAQ](https://www.gnu.org/licenses/gcc-exception-3.1-faq.html.en).
- [GNU GPL FAQ — source distribution/access](https://www.gnu.org/licenses/gpl-faq.html).
- [Mozilla MPL 2.0 FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/) dan [teks MPL](https://www.mozilla.org/en-US/MPL/2.0/).
- [GNU AGPLv3](https://www.gnu.org/licenses/agpl-3.0.html).
- [GitHub deployment environments/protection rules](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).
- [GitHub reviewing deployments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments).
- [GitHub workflow run review-history API](https://docs.github.com/en/rest/actions/workflow-runs#get-the-review-history-for-a-workflow-run).

Referensi teknis membantu implementasi; keputusan kepatuhan atas distribusi dan hak Enygma tetap ditetapkan reviewer Legal/IP yang berwenang berdasarkan bukti rilis aktual.
