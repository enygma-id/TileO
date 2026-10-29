# TileO 0.1.0 Remediated — Audit Fokus Cleanup dan GCC/Mozilla

**Tanggal:** 28 Oktober 2026, WIB  
**Pembaruan laporan:** 29 Oktober 2026, WIB — revisi 1.1; tambahan engineering source-access dan publikasi pada bagian 8–9  
**Objek:** `TileO-0.1.0-Remediated.zip`  
**Ukuran:** 1.254.739.656 byte  
**SHA-256:** `386df717bdd42e06aa61bf189536d7a370532aed90b22923c14aa7039d5a37c8`

## Kesimpulan

**Pembuktian teknis libstdc++, libgcc, dan CA Mozilla LULUS untuk image export kandidat `52b167c27e9b…` yang ada dalam ZIP.** Source autentik, patch/recipe benar, binary GCC cocok dengan paket resmi Alpine, dan bundle CA dapat dibangun ulang identik dengan bytes dalam image. Ini menutup kekurangan audit sebelumnya yang belum bisa membaca binary image secara independen.

**PASS lama, closure 0.2.0, source sintetis lama dan SBOM 27 Oktober yang menjadi temuan sebelumnya tidak ditemukan lagi sebagai artifact aktif/arsip source biasa dalam ZIP.** Riwayat Git dan MD audit lama tetap ada; itu bukan bukti rilis yang dipakai ulang dan tidak perlu dihapus.

**Namun ZIP ini belum merupakan satu paket closure final yang konsisten.** Evidence utama masih milik kandidat `53f57d0…`, sedangkan image export dan evidence paling baru berada di folder kandidat `52b167c…`. Manifest core final belum ada. Hasil negative controls resmi kandidat terakhir masih berbeda dari hasil perbaikan dalam diagnostics. Jadi pembenahan komponen benar, sementara penyatuan/freeze bukti masih OPEN.

**Tambahan 29 Oktober:** pemeriksaan repository GitHub publik menemukan bahwa workflow sudah menyiapkan upload source pendamping, tetapi generator `SOURCE-ACCESS.md` masih menghasilkan petunjuk internal/URL pending dan verifier pascapublikasi belum menguji tautan source-access publik tersebut. Perbaikan otomatisasi ini merupakan pekerjaan programmer dan termasuk acceptance rilis, bukan pekerjaan administratif terpisah. Rincian implementasi dan prompt ada pada bagian 8–9. Temuan tambahan ini tidak membatalkan pembuktian GCC/Mozilla yang telah VERIFIED.

Sesuai arahan pemilik, audit ini **tidak mengaudit ulang approval manusia/Actions yang sedang berjalan**, tidak menganggap approval PENDING dalam snapshot sebagai bukti proses GitHub gagal, dan tidak menuntut signoff dilakukan lagi melalui MD lokal. Hasil Actions yang lebih baru dari ZIP harus dinilai berdasarkan subject commit/image/core digest-nya sendiri.

## Metode dan batas

Diperiksa langsung: inventaris ZIP, source TAR bertingkat, manifest/checksum, register exception, APKBUILD/patch, SPDX/CycloneDX/provenance, image exports OCI, metadata Git HEAD yang disertakan, serta report/negative controls yang dikirim.

Dijalankan secara independen:

- Verifikasi hash descriptor OCI dan compressed layer blobs.
- Pembacaan library dan CA langsung dari layer image, tanpa menjalankan image.
- Download paket resmi Alpine libstdc++/libgcc melalui HTTPS dan pembandingan payload byte demi byte.
- Pencocokan source/patch/recipe terhadap input upstream resmi yang telah diverifikasi dalam audit sebelumnya pada hari yang sama.
- Rebuild CA dari source yang dikirim dengan `make certdata.stamp`; exit 0, lalu pembandingan hasil terhadap image.
- Rekonsiliasi hash register, source archive, SBOM dan provenance.

Tidak dijalankan: Docker runtime/integration/browser suite, full rebuild GCC/image, verifikasi tanda tangan APK secara kriptografis, atau inspeksi live GitHub Actions. Paket resmi APK diambil dari server Alpine; metadata `.PKGINFO` dan payload-nya diperiksa. Tidak ada approval manusia yang dibuat atau disimpulkan otomatis.

ZIP asli tidak diubah. Ekstraksi aktif: `audit-remediated-work/`. Bukti independen: `audit-remediated-results-2026-10-28/`.

## 1. Cleanup temuan lama

| Item dari audit sebelumnya | Hasil pemeriksaan ZIP baru | Status |
| --- | --- | --- |
| `TileO-v0.2.0-Release-Closure/` dengan source sintetis/PASS lama | Tidak ada path tersebut | FIXED |
| `release-evidence/v0.2.0/`, `release-evidence/v1.0.0/`, `artifacts/compliance/` lama | Tidak ada evidence tree tersebut | FIXED |
| File `release-gate-pass.json` lama | Tidak ada file PASS tersebut di seluruh daftar ZIP | FIXED |
| GCC stub TAR SHA `c695cf22…` | Tidak ditemukan pada semua GCC source TAR yang disertakan | FIXED |
| Mozilla sintetis TAR SHA `b0683c40…` | Tidak ditemukan pada semua Mozilla source TAR yang disertakan | FIXED |
| SPDX lama SHA `6ecbf1e7…` dan CDX lama SHA `4372446e…` | Tidak ditemukan pada semua SBOM image yang disertakan | FIXED |
| Metadata root package dan lockfile | Aktif menggunakan 0.1.0 | FIXED |

Saya memeriksa **8 source archives**: pasangan GCC/CA di evidence utama, dua kandidat WSL, dan salinan diagnostics. Seluruhnya berisi source upstream autentik dan aport/patch yang sesuai. Tidak hanya mengandalkan ukuran archive atau nama direktori.

Masih terdapat `.git/refs/tags/v0.2.0`, MD audit/protokol historis, dan dependency yang memang versinya 0.2.0. Ini bukan alasan untuk menghapus history atau mengganti versi dependency. Temuan yang masih terbuka adalah **evidence antarpercobaan 0.1.0**, dibahas di bagian 5.

## 2. Identitas image yang benar-benar diperiksa

Image terbaru yang tersedia dalam ZIP:

```text
Candidate: candidate-52b167c27e9b-01
Commit: 52b167c27e9b6c6c1f86058e6d460430703a9f89
OCI image manifest descriptor:
sha256:0dad1284220dbf4cbeab414a4f2ccfecb3f3309abe5f8641dc6acb441bac91c1
Config digest:
sha256:e4f4fff38a4f445cf81acf5a5e5ca497af147578959bed5dc5350f0ac6b91f78
Platform: linux/amd64
Export archive SHA-256:
bf70dd6ed3e79e9d6305a397afd9ab80654765a649b38bc73fc89425d605a0a3
Export size: 161791882 bytes
```

Lokasi export:

`artifacts/wsl-closure-candidates/52b167c27e9b-20261028T094241Z/export/tileo-0.1.0-image.tar.gz`

Index menunjuk manifest OCI yang hash-nya benar. Manifest menunjuk config dan dua layer; digest kedua layer cocok dengan bytes aktual. Layer terakhir kosong, sehingga tidak menghapus/mengganti tiga runtime files yang diperiksa. Label revision/source/version dalam config cocok dengan kandidat 52b dan 0.1.0. Nilai descriptor/config/export di atas memang berbeda; perbedaan itu sendiri bukan cacat.

Export kandidat `77032647c07f…` juga disertakan dan diperiksa; ketiga runtime files memiliki bytes yang sama. Kandidat 52b adalah export paling baru dalam ZIP ini, bukan klaim bahwa ia pasti kandidat Actions terbaru.

## 3. libstdc++ dan libgcc — VERIFIED

| Komponen | File sebenarnya dalam image | Ukuran | SHA-256 |
| --- | --- | ---: | --- |
| libstdc++ | `/usr/lib/libstdc++.so.6.0.33` | 2.771.336 | `08d5c7eb7c1e210d0fb56a33af0b97ab86339f2d321ceb31fcd53c563f8803c9` |
| libgcc | `/usr/lib/libgcc_s.so.1` | 173.920 | `2298274ad3316109d6e895083398e220f16fbdd12957c4afcc9af8849e734151` |

Symlink `/usr/lib/libstdc++.so.6` dalam layer benar-benar menunjuk `libstdc++.so.6.0.33`.

Saya mengunduh dan membuka paket resmi:

- [Alpine libstdc++ 14.2.0-r4](https://dl-cdn.alpinelinux.org/alpine/v3.21/main/x86_64/libstdc++-14.2.0-r4.apk).
- [Alpine libgcc 14.2.0-r4](https://dl-cdn.alpinelinux.org/alpine/v3.21/main/x86_64/libgcc-14.2.0-r4.apk).

**Payload kedua library identik byte demi byte dengan image export.** `.PKGINFO` menyatakan package version `14.2.0-r4`, architecture `x86_64`, origin `gcc`, dan aport commit:

`1a03a2a9c9e77f1a07d48b6f6805e72c8c63c03f`

Commit tersebut sama dengan recipe yang disertakan dalam corresponding-source package. Source upstream GCC memiliki SHA-256:

`a7b39bc69cbf9e25826c5a60ab26477001f7c08d85cec04bc0e29cabed6f3cc9`

Pemeriksaan source:

- Bytes upstream cocok dengan hash resmi pada APKBUILD yang sudah diambil independen.
- APKBUILD dan seluruh file aport cocok byte demi byte dengan aport resmi yang telah diverifikasi.
- Seluruh **39 patch** hadir dan benar.
- Manifest internal dan file hashes-nya konsisten.
- Source archive kandidat 52b memiliki SHA-256 `e80de3084cf8e5bfdc5a6f1c834a5873eb2e07f785e2882ae008d79399befda9`.
- EXC-001 dan EXC-002 mencatat image, binary hash dan source archive hash yang cocok dengan hasil pembacaan independen.

**Rantai pembuktiannya sekarang konkret:** official Alpine package payload = binary dalam image; package metadata menunjuk aport revision yang sama; corresponding-source archive berisi upstream GCC, recipe dan patch yang benar. Tidak ditemukan stub atau source tiruan dalam archive yang diperiksa.

Ini penilaian source/binary correspondence untuk kedua library; bukan klaim bahwa semua static component dalam seluruh software image sudah diaudit ulang atau bahwa lisensinya berubah menjadi permisif.

## 4. Mozilla CA — VERIFIED

File `/etc/ssl/certs/ca-certificates.crt` di layer image:

```text
Bytes: 178791
SHA-256: 5961c0a3c65459931c023e0075c09733f09aea4ca439cb85bc4a08bb4f3f568b
```

Source package memuat:

- `ca-certificates-20261020.tar.bz2`, SHA-256 `1048bc7f50fa42a6621bc2f8816173f89a0c0098f26dff072bc8fe40af714400`.
- Recipe Alpine commit `660f223b42ca35e7d2a76ce568e15c847b92d33d`, package `20261020-r0`.
- NSS tag `NSS_3_131_1_RTM` dan `certdata.txt` SHA-256 `3ec2b4d240dc12c747eaf450061db84af757c483bbda302f9e29ceb5d70be510`.

Certdata identik dengan source NSS resmi yang diambil langsung pada audit sebelumnya. Recipe/files aport juga identik dengan input resmi yang sudah diperiksa. Source archive kandidat 52b memiliki SHA-256:

`a40b9297de8223f560bc033693ec4d705104a2f64fb033decbb5a129fed5a307`

Saya menjalankan ulang `make certdata.stamp` dari source yang dikirim: **exit 0; 118 CA diproses, 51 dilewati**. Setelah digabung sesuai recipe, bundle hasil independen berukuran 178.791 byte dan hash-nya sama dengan di atas; **bytes hasil rebuild identik dengan bytes dalam image export**.

EXC-003, source manifest, source-provenance, ca-rebuild report dan runtime-file-hashes kandidat 52b konsisten dengan hasil itu. Jadi klaim equality di JSON kini telah saya buktikan sendiri, bukan hanya membaca `equal:true`.

### Catatan notice yang masih perlu dirapikan

`compliance/notices/MIT.txt` tetap disalin dari notice musl. Itu bukan notice spesifik converter/packaging CA. Helper `mk-ca-bundle.pl` sendiri mencantumkan copyright dan SPDX `curl`; corpus third-party juga memuat notices curl.

Ini tidak membatalkan hasil authenticity/equality source dan bundle. Untuk materi customer final, susun notices menurut komponen sebenarnya—pertahankan MPL certdata, atribusi/lisensi helper/packaging yang relevan, dan beri label musl sesuai perannya. Jangan menjadikan file bernama MIT generik sebagai satu-satunya bukti notice CA. Pemeriksaan Legal/IP yang sedang berjalan dapat menggunakan daftar komponen/notice aktual tersebut.

## 5. Yang belum selesai: evidence lama antarpercobaan 0.1.0

### 5.1 Root evidence masih kandidat sebelumnya

| Identitas | `release-evidence/v0.1.0/` utama | Kandidat export terbaru dalam ZIP |
| --- | --- | --- |
| Commit | `53f57d0edd1b…` | `52b167c27e9b…` |
| Image/descriptor ID | `sha256:9d06592c23fe…` | `sha256:0dad1284220d…` |
| Export SHA | `08073719afb8…` | `bf70dd6ed3e7…` |
| Image export tersedia | Tidak ditemukan export dengan hash yang diminta | Ada dan telah dibuka independen |
| Enam baseline hashes vs source ZIP saat ini | 5/6 cocok; Dockerfile berbeda | 6/6 cocok |
| Browser evidence | Exit 1; 6 failed | Exit 0; 7 expected pass, 1 skipped |

SBOM root dibuat 28 Oktober 07:11 UTC untuk commit 53f; SBOM kandidat 52b dibuat 10:01 UTC dan menyebut revision 52b. Keduanya **baru dibanding SBOM 27 Oktober**, valid JSON dan cocok dengan hash provenance masing-masing. Masalahnya adalah root utama masih menunjuk percobaan yang tidak lagi sama dengan source/HEAD yang disertakan.

Metadata `.git/refs/heads/main` dalam ZIP menyebut 52b. Ini pembacaan metadata kiriman, bukan verifikasi live repository GitHub.

Dengan demikian, temuan lama SBOM yang salah-hash sudah diperbaiki dalam masing-masing snapshot, tetapi **pemilihan satu snapshot final belum selesai**. Jangan hanya memindahkan SBOM baru ke root yang masih memiliki candidate/test/source manifest lama; seluruh evidence tree harus satu kandidat.

### 5.2 Hasil negative controls belum disatukan

Evidence kandidat 52b mencatat:

```text
status: FAILED
passed: 24
failed: 1 (NC28)
pending: 3 (NC22, NC23, NC24 — human dry run)
```

Di `diagnostics/control-fixes-QRhMNTL9/evidence/v0.1.0/`, terdapat hasil:

```text
status: TECHNICAL_CONTROLS_PASSED_HUMAN_DRY_RUN_PENDING
passed: 25
failed: 0
pending: 3
```

Nuansa penting: pada NC28 yang tercatat FAIL, verifier **benar-benar menolak stale PASS dengan exit 1 dan alasan yang tepat**. Test harness menandai gagal karena seeded PASS masih dianggap `publishable_pass_present:true`; pada diagnostics indikator itu menjadi false. Ini bukan pembuktian bahwa certifier mengesahkan PASS lama. Namun hasil diagnostics belum menjadi evidence canonical yang dibekukan, sehingga belum boleh mengklaim seluruh controls final sudah lulus dari folder utama.

Tiga controls manusia yang pending tidak dijadikan blocker baru dalam audit fokus ini; prosesnya menurut pemilik sedang berlangsung di Actions.

### 5.3 Manifest/closure belum final

- Tidak ada `core-evidence-manifest.json` dalam daftar ZIP.
- Tidak ada technical-eligibility final untuk kandidat terbaru.
- Report kandidat terbaru secara jujur berjudul **preliminary engineering summary** dan berstatus `PENDING_TECHNICAL_CERTIFICATION`.
- `release-provenance.json` belum memuat finalized artifact manifest.
- Root evidence utama kehilangan 10 required paths, termasuk build logs, notice-path inventory, stderr/browser logs, negative controls, technical eligibility dan closure report. Pada kandidat 52b, hampir semuanya tersedia; required path yang masih hilang adalah technical eligibility. Final core manifest tetap harus dibuat terpisah sesudah kelengkapan diverifikasi.

ZIP ini merupakan snapshot workspace/proses remediasi dengan beberapa kandidat, diagnostics, `.git`, data dan output kerja. Gunakan closure packager yang memilih exact evidence root untuk distribusi; jangan mengunggah seluruh ZIP workspace ini sebagai release asset final.

## 6. Tindakan penutupan terbatas untuk programmer

1. **Pertahankan source dan binary GCC/CA yang sudah benar.** Tidak ada alasan dari audit fokus ini untuk mengganti libstdc++, libgcc, Mozilla CA atau engine GIS.
2. **Tentukan satu kandidat final yang sama dengan Actions.** Kandidat 52b hanyalah yang terbaru tersedia dalam ZIP ini. Jika Actions membangun commit/image lebih baru, pakai seluruh evidence dan export dari kandidat baru itu; jangan melabeli ulang artifact 52b atau 53f.
3. **Jadikan evidence kandidat terpilih satu root canonical.** Keluarkan root 53f dan percobaan lama dari paket aktif. Riwayat/diagnostics boleh disimpan terpisah dan tidak dipilih oleh certifier/packager.
4. **Finalkan controls dan status teknis.** Terapkan hasil perbaikan NC28 dengan command/log/provenance yang benar; jangan mengedit angka status secara manual. Jalankan verifier/certifier nyata terhadap root yang dipilih. Tidak perlu mengulang pembuktian komponen pada candidate yang bytes-nya sama tanpa alasan; bila source/build/policy yang relevan berubah, ikuti aturan kandidat baru dalam plan.
5. **Finalkan provenance → technical report → core manifest → verifikasi manifest → closure.** Lengkapi file wajib, termasuk stderr kosong yang memang dihasilkan, dan rapikan notice CA. Semua references/hash/subject harus cocok. Jangan membuat PASS untuk mengisi kekosongan.
6. **Hubungkan hasil review Actions ke core digest final yang sama.** Audit ini tidak meminta review manusia lokal ulang. Pastikan persetujuan yang sedang berjalan benar-benar mengacu pada artifact final tersebut dan publikasi menggunakan image export yang telah disetujui.
7. **Tutup engineering source-access/publication pada bagian 8.** Perbaiki generator dokumen, kelengkapan Release assets dan pemeriksaan download publik berdasarkan manifest kandidat. Jalankan fase verifikasi source-access sesudah source assets publik tersedia dan sebelum image publik didistribusikan; simpan hasil sesudah publikasi di luar core yang sudah dibekukan.

**Verdict sesuai scope:**

- Cleanup PASS/source sintetis/SBOM lama 27 Oktober: **FIXED pada artifact yang diperiksa**.
- Authentic GCC source/patch/recipe + libstdc++/libgcc image correspondence: **VERIFIED untuk export kandidat 52b**.
- Authentic Mozilla source + independent CA rebuild/image equality: **VERIFIED untuk export kandidat 52b**.
- Paket evidence tunggal/final closure: **OPEN — konsolidasi dan freeze belum dibuktikan dalam ZIP**.
- Otomatisasi source-access/tautan publik dan pemeriksaan distribusi: **OPEN pada snapshot GitHub 29 Oktober; perlu implementasi/verifikasi bagian 8**.
- Human approval/Actions yang sedang berjalan: **DI LUAR SCOPE pemeriksaan ini**.

## 7. Bukti independen yang disimpan

Di `audit-remediated-results-2026-10-28/`:

- `source-archives-independent-checks.json`: delapan source archives, upstream hashes, seluruh aport/patch dan deteksi hash source sintetis lama.
- `official-apk-byte-comparison.json`, `libstdc++-PKGINFO.txt`, `libgcc-PKGINFO.txt`: payload resmi vs actual image libraries dan asal package revision.
- `offline-image-runtime-checks.json`: actual OCI manifest/layers/runtime files dan hash-nya.
- `export-image-configs.json`: config/labels/platform yang dibaca dari image exports.
- `independent-ca-rebuild.log`, `independent-ca-rebuild.json`, `independently-rebuilt-ca-certificates.crt`: eksekusi rebuild dan byte equality.
- `latest-exception-register-checks.json`: ketiga row exception cocok dengan actual image/source archive.
- `package-snapshot-reconciliation.json`: cleanup legacy, perbandingan root/candidate terbaru, SBOM/provenance dan kelengkapan.
- `active-evidence-checks.json`, `candidate-snapshots.json`: identitas evidence utama dan kandidat lain.

Tidak ada temuan source tiruan baru atau keharusan mengulang desain engine. Sisa pekerjaan utama adalah menutup ambiguity paket dan memastikan bukti final yang dipublikasikan merupakan bukti kandidat yang sama dengan yang disetujui di GitHub.

## 8. Tambahan engineering — source-access dan Release assets

### 8.1 Dasar pemeriksaan publik 29 Oktober 2026

Snapshot repository yang diperiksa:

```text
Repository: enygma-id/TileO
Branch: main
Commit: adfeb5cfc9075d0e34c1162de764238315822820
Tree: 7813257e3bbca81ff5886dfe7c790a4657bbd5bd
Public Releases yang terlihat melalui API tanpa autentikasi: 0
```

Tree API lengkap, tidak terpotong. Ini pemeriksaan source/workflow pada snapshot tersebut, bukan pernyataan bahwa commit/image 52b otomatis sama dengan kandidat Actions saat ini. Draft privat dan approval live tidak diperiksa. Tidak adanya Release publik sebelum approval bukan kegagalan tersendiri; laporan ini mengarahkan persiapan dan pengujian jalur publikasinya.

Bukti pemeriksaan disimpan di `github-live-check-2026-10-29/`: `repository.json`, `main-commit.json`, `tree.json`, `releases.json`, `release.yml`, `SOURCE_ACCESS.md`, `gitignore.txt`, dan `summary.json`. Git blob hash generator/packager/verifier yang digunakan untuk analisis juga cocok dengan source pada snapshot publik.

### 8.2 Yang sudah diimplementasikan dan perlu dipertahankan

- [`third-party/SOURCE_ACCESS.md`](https://github.com/enygma-id/TileO/blob/adfeb5cfc9075d0e34c1162de764238315822820/third-party/SOURCE_ACCESS.md): kebijakan source-access, masih menyatakan distribusi publik 0.1.0 belum tersedia.
- [`THIRD-PARTY-NOTICES.md`](https://github.com/enygma-id/TileO/blob/adfeb5cfc9075d0e34c1162de764238315822820/THIRD-PARTY-NOTICES.md) dan `third-party/ENTERPRISE_EXCEPTIONS.md`: notices dan pengungkapan komponen tersedia.
- [`scripts/prepare-compliance-packages.js`](https://github.com/enygma-id/TileO/blob/adfeb5cfc9075d0e34c1162de764238315822820/scripts/prepare-compliance-packages.js): menghasilkan corresponding-source archives dan dokumen customer dari image kandidat.
- [`.github/workflows/release.yml` bagian publikasi](https://github.com/enygma-id/TileO/blob/adfeb5cfc9075d0e34c1162de764238315822820/.github/workflows/release.yml#L181-L208): sudah menyalin source GCC/CA, source aplikasi, closure, notices, exceptions, SOURCE-ACCESS, dua SBOM, membuat SHA256SUMS dan mengunggahnya ke GitHub Release sebelum push image GHCR.
- `release-evidence/` dan `artifacts/` di-ignore oleh Git. Source TAR besar tidak perlu ditambahkan ke history Git hanya agar dapat diunduh publik; GitHub Release assets adalah lokasi distribusi yang dipilih.

Jangan membuat framework atau struktur baru dari nol. Lengkapi implementasi yang sudah ada berikut ini.

### 8.3 PUB-01 — Generator SOURCE-ACCESS belum siap menjadi asset publik final

**Observed:** generator menulis `compliance/customer/SOURCE-ACCESS.md` dengan nama file dalam bentuk code text `../source/...` dan kalimat bahwa URL publik serta legal approval masih pending. Path relatif tersebut menjelaskan posisi source di dalam closure, tetapi tidak menyediakan tautan download publik saat dokumennya didistribusikan sebagai asset terpisah. Dokumen publik seharusnya menjelaskan source dan cara mengambilnya; keputusan approval berasal dari authorization receipt, bukan kalimat otomatis di file ini.

**Perbaikan programmer:**

1. Ambil repo, version/tag, exact image identity, archive names dan checksums dari candidate/source-provenance/manifest yang telah diverifikasi. Jangan hardcode kandidat lama, versi lain atau branch `main` sebagai source target.
2. Hasilkan dokumen dengan dua rute yang diberi label jelas: **path dalam closure** dan **tautan GitHub Release assets**. Boleh memakai satu dokumen untuk keduanya selama semua path/tautan benar dalam konteks masing-masing.
3. Bentuk URL tujuan menggunakan exact release tag. Contoh URL yang direncanakan untuk 0.1.0:

```text
https://github.com/enygma-id/TileO/releases/download/v0.1.0/gcc-runtime-corresponding-source.tar.gz
https://github.com/enygma-id/TileO/releases/download/v0.1.0/mozilla-ca-bundle-source.tar.gz
```

URL contoh tersebut adalah **target publikasi**, bukan klaim bahwa assets sudah tersedia ketika laporan ini dibuat.

4. Sertakan package/version, image/platform, SHA-256 archives, lokasi notices, metode source access dan kontak/penanggung jawab nyata sesuai policy yang disetujui. Pertahankan copyright/lisensi yang relevan.
5. Hilangkan boilerplate pending yang akan menjadi keterangan salah pada asset final. Generator tidak boleh menggantinya dengan APPROVED. Pisahkan informasi source yang deterministic dari status review/distribusi aktual pada authorization/publication receipts.
6. Finalkan konten dan URL tujuan **sebelum** provenance/core manifest dibekukan. Periksa kebenaran pembentukan URL secara offline pada tahap ini; jangan menuntut HTTP 200 sebelum Release diterbitkan dan jangan menerbitkan Release lebih awal hanya untuk meluluskan test.

**Acceptance:** dokumen dalam core berisi informasi kandidat yang benar, path closure yang benar, tautan download ber-versi yang benar dan checksum yang sesuai. Tidak ada placeholder, label approval buatan, `main/latest` yang bergerak, atau URL internal sebagai satu-satunya akses source.

### 8.4 PUB-02 — Release assets harus lengkap dan terikat ke core yang disetujui

Pertahankan layout berikut. `SOURCE_ACCESS.md` underscore pada repository adalah kebijakan; `SOURCE-ACCESS.md` hyphen pada generated customer/Release adalah petunjuk versi spesifik. Jangan membuat dua kebijakan baru yang bersaing.

```text
Repository tracked source
├── THIRD-PARTY-NOTICES.md
├── third-party/
│   ├── SOURCE_ACCESS.md
│   └── ENTERPRISE_EXCEPTIONS.md
├── scripts/prepare-compliance-packages.js
├── scripts/verify-published-release.js
└── .github/workflows/release.yml

Generated candidate evidence — tidak wajib di-commit ke Git
release-evidence/v0.1.0/compliance/
├── source/
│   ├── gcc-runtime-corresponding-source.tar.gz
│   └── mozilla-ca-bundle-source.tar.gz
├── notices/
└── customer/
    ├── SOURCE-ACCESS.md
    ├── THIRD-PARTY-NOTICES.md
    ├── THIRD-PARTY-EXCEPTIONS.md
    └── delivery-manifest.json

GitHub Release v0.1.0 — Assets
├── TileO-0.1.0-source.tar.gz
├── gcc-runtime-corresponding-source.tar.gz
├── mozilla-ca-bundle-source.tar.gz
├── THIRD-PARTY-NOTICES.md
├── THIRD-PARTY-EXCEPTIONS.md
├── SOURCE-ACCESS.md
├── sbom-image.spdx.json
├── sbom-image.cdx.json
├── SHA256SUMS
└── TileO-v0.1.0-Release-Closure.tar.gz
```

Workflow sudah menyiapkan layout assets tersebut. Tambahkan validasi prepublish atas staging directory: semua required assets hadir, nama unik, bytes/hash sesuai approved core atau delivery record yang relevan, dan SHA256SUMS mencakup setiap required asset selain dirinya sendiri. Tidak cukup membuat checksum baru atas files apa pun yang kebetulan ada di staging.

Source GCC/CA, notices dan SBOM yang menjadi assets terpisah harus identik dengan materi yang disetujui dalam core. Hash closure archive final dicatat di checksum/delivery record eksternal untuk menghindari lingkaran hash. Tidak menggunakan archive dari cache kandidat lain dan tidak melakukan clobber/replacement rilis lama secara diam-diam.

Kebijakan tracked `third-party/SOURCE_ACCESS.md` dan petunjuk rilis/README harus mengarahkan pengguna ke Release/tag atau halaman akses yang tepat. Sebelum publikasi boleh menyatakan rencana akses secara jujur; jangan mengklaim source sudah tersedia. Pembaruan dokumentasi setelah publikasi tidak boleh memindahkan tag atau mengubah core yang sudah disetujui.

**Acceptance:** asset set dan checksum tervalidasi sebelum upload, kemudian hasil upload diperiksa. Artifacts Actions ber-retensi sementara tetap untuk review; jangan menjadikannya satu-satunya route source-access bagi penerima image publik.

### 8.5 PUB-03 — Verifier belum menguji route source-access tanpa kredensial

**Observed:** `scripts/verify-published-release.js` sudah memeriksa nama assets, mengunduh dengan `gh release download`, memeriksa SHA256SUMS, dan memeriksa image registry. Namun ia belum membaca/menguji URL dari SOURCE-ACCESS, belum membuktikan akses penerima publik tanpa token, dan checksum hasil unduhan belum cukup diikat ke expected source archive hashes dari frozen core. Satu paket lama dengan checksum barunya sendiri tidak boleh dianggap source kandidat yang benar.

**Perbaikan programmer:**

- Parse/validasi source-access route yang benar-benar diterbitkan; uji kedua URL archive tersebut melalui HTTP tanpa kredensial internal, mengikuti redirect HTTPS yang sah.
- Download body sebenarnya. Tolak HTTP error, login/HTML response, body kosong, archive tidak valid dan hash yang berbeda dari approved core/source-provenance. Respons 200 saja tidak cukup.
- Periksa expected asset set dan exact checksum coverage; tolak entri duplikat, path tidak aman, missing asset, salah repo/tag dan file dari kandidat lain walaupun cocok dengan SHA256SUMS yang ikut diganti.
- Catat repo/tag/release URL, candidate/commit/image, core digest, requested URL/final URL, hasil HTTP, ukuran/hash yang diunduh dan hasil source-access verification.
- Simpan hasil di publication storage terpisah. Jangan menyunting core manifest, source-access document atau legal status pada core setelah disetujui hanya untuk menambahkan timestamp PASS.

Pisahkan verifikasi menjadi dua fase agar urutannya dapat dijalankan:

1. **Setelah authorized GitHub Release/source assets publik tersedia, sebelum push/distribusi image publik:** jalankan pemeriksaan source-access/assets. Jika gagal, hentikan distribusi image dan catat status parsial; jangan mencetak PUBLISHED_VERIFIED.
2. **Sesudah image dipublikasikan:** jalankan verifikasi lengkap source/assets + registry/pull identity, lalu tulis publication receipt final.

Programmer dapat menambah opsi `--phase source-access` dan `--phase full` pada verifier existing, atau memisahkan helper setara. Opsi tersebut adalah kontrak implementasi baru, **belum tersedia pada snapshot yang diaudit**. Jalur source-access tidak boleh memerlukan image sudah ada di registry; jalur full tidak boleh dilewati untuk mengklaim semua publikasi selesai.

**Acceptance:** source tersedia pada route yang diumumkan kepada penerima dan bytes-nya sesuai core/image yang disetujui sebelum distribusi image; hasil lengkap setelah push sesuai kenyataan. Tidak membuat source sintetis atau mengganti binary demi meluluskan HTTP test.

### 8.6 Pengujian regresi dan bukti penutupan

Tambahkan pengujian relevan melalui generator/verifier/workflow nyata, tanpa harus membuat tag produksi untuk kasus negatif:

| Case | Input/kondisi | Expected |
| --- | --- | --- |
| SA01 | Salah satu source asset hilang | Prepublish/source-access check exit nonzero; image push tidak berjalan |
| SA02 | SOURCE-ACCESS hanya berisi path internal atau URL salah repo/tag | Validasi dokumen menolak; tidak menganggap rute publik selesai |
| SA03 | Source archive kandidat lama bersama checksum lama/baru yang konsisten sendiri | Ditolak karena hash/subject berbeda dari approved core |
| SA04 | HTTP 200 berisi halaman login/HTML atau source hanya dapat diakses token internal | Pemeriksaan penerima publik menolak |
| SA05 | Dokumen source-access/core diubah sesudah approval | Manifest/authorization binding menolak; approval lama tidak dipakai |
| SA06 | Source-access berhasil, push/registry check gagal | Status PARTIALLY_PUBLISHED/FAILED yang spesifik; tidak ada klaim publikasi lengkap |

Unit/integration test boleh memakai HTTP fixtures lokal yang jelas berlabel test. Dry run tidak boleh mempublikasikan source/image produksi hanya untuk membuat URL hidup. Setelah publikasi yang memang diotorisasi, lakukan satu pemeriksaan nyata dari route publik dan simpan hasilnya.

Deliverables penutupan: diff generator/verifier/workflow/docs, hasil regresi + exit codes, staged asset manifest/checksums, frozen core digest, source-access receipt dan full publication receipt ketika publikasi sudah dilakukan. Tambahkan PUB-01 sampai PUB-03 ke closure report dengan status aktual.

Jika perbaikan ini mengubah source/build/core yang telah direview, freeze kandidat baru dan gunakan approval atas subject baru itu. Ini bukan permintaan untuk mengulang review lokal atas kandidat yang sama; ini larangan menerapkan approval lama pada bytes yang berubah. Source upstream yang tetap sama dapat memakai cache autentik yang telah diverifikasi, dengan binding ulang ke kandidat yang benar.

**Status tambahan per snapshot 29 Oktober:** PUB-01 generator public route **OPEN**; PUB-02 upload layout **SUDAH ADA, runtime publication NOT VERIFIED**; PUB-03 recipient-side source-access check **OPEN**. Status authentic source/binary GCC dan CA tetap VERIFIED untuk image yang disebut pada bagian 2–4.

## 9. Prompt agen yang diperbarui

Gunakan prompt berikut bersama laporan ini dan akses repository Git/artifacts terbaru. Plan rilis 0.1.0 sebelumnya tetap menjadi acceptance contract; tidak perlu membuat plan baru untuk menggantikan eksekusi.

> Baca dan laksanakan laporan TileO-0.1.0-Remediated-Focused-Reaudit-2026-10-28.md revisi 1.1, termasuk tambahan 29 Oktober pada bagian 8. Target rilis publik pertama 0.1.0. Tutup temuan OPEN dengan perubahan kode dan pengujian nyata: satukan evidence pada kandidat yang sama dengan Actions, finalkan NC28, provenance, technical eligibility, core manifest dan closure. Pertahankan source/binary GCC serta Mozilla CA yang sudah terverifikasi dan cocokkan kembali bila kandidat berubah. Kerjakan PUB-01–PUB-03: generator SOURCE-ACCESS untuk path closure dan URL Release ber-versi, validasi assets/checksum terhadap frozen core, serta verifikasi download source publik tanpa kredensial. Verifikasi source-access sesudah assets publik tersedia sebelum distribusi image; verifikasi lengkap sesudah push. Finalkan dokumen sebelum core freeze dan simpan receipt pascapublikasi terpisah. Jangan mengarang PASS/approval, mencampur snapshot atau mengubah status secara manual. Pertahankan engine dan kebijakan lisensi. Gunakan review manusia di protected Actions yang terikat kandidat/core digest yang sama; publikasi hanya sesudah otorisasi sah. Serahkan diff/commit, hasil test dan regresi SA01–SA06, evidence beserta checksum, closure report dan blocker tersisa. Jangan berhenti pada analisis atau membuat plan baru.
