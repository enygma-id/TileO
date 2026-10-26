# TileO v1.0 — Independent Permissive-Only Readiness Audit

**Tanggal audit:** 26 Oktober 2026  
**Input:** `TileO-main(4).zip` dan `BATCH_SYSTEM_AUDIT_CHECKLIST.md`  
**Metode:** Inspeksi statis source, Dockerfile, workflows, npm lockfile, manifest, notice archive, dan konsistensi berkas; **tanpa** membangun image, menjalankan Docker, menjalankan suite Node 24, atau memverifikasi linked ELF final.  
**Kebijakan target:** Seluruh **komponen software pihak ketiga dalam artefak distribusi** harus terbukti permisif. Kode TileO sendiri merupakan pengecualian yang disengaja: Community `AGPL-3.0-only`, dengan lisensi komersial terpisah sepanjang haknya dikuasai Enygma.

## Putusan

**NO-GO untuk sertifikasi strict permissive-only atau publikasi image Enterprise v1.0 saat ini.** Bukti yang diserahkan belum mencakup SBOM dan inventaris lisensi dari image final, dan automated release pipeline belum memberlakukan pemeriksaan itu sebelum `push` ke GHCR. Ini adalah keputusan **kesiapan bukti** dan konfigurasi rilis, bukan vonis bahwa source inti GDAL atau PROJ berlisensi copyleft.

Laporan batching **tidak dapat menggantikan audit lisensi**. Dokumen tersebut sendiri menegaskan keterpisahan lingkupnya (baris 7); hasil yang dilaporkan termasuk **106 pass, 12 fail, 0 skip** dalam pengujian integrasi Docker (`BATCH_SYSTEM_AUDIT_CHECKLIST.md`, baris 29–32).

## Matriks temuan terverifikasi

| Prioritas | Area | Apa yang dibuktikan dari ZIP | Status | Tindakan dan keluaran yang wajib diserahkan |
|---|---|---|---|---|
| **P0** | Final runtime image | `Dockerfile:92–97` menggunakan `node:24.13.1-trixie-slim` ditambah pustaka Debian (`libcurl4t64`, `procps`, dll.). Tidak ditemukan SBOM image final dalam ZIP. | **Belum lulus strict-only** | Build dan simpan digest, OS package list, native libraries/linkage, per-file licenses dan SBOM image. Jika ditemukan non-permisif dan target zero-copyleft mencakup seluruh image, gunakan runtime hasil komposisi ulang dan audit kembali. **Output:** `release-image-digest.txt`, `sbom-image.spdx.json`, `sbom-image.cdx.json`, `os-packages.csv`, `binary-linkage.csv`, `license-decisions.csv`. |
| **P0** | Native GDAL / PROJ / libcurl | `Dockerfile:8–78` mem-build PROJ 9.6.2 dan GDAL 3.11.4 dari source. PROJ CURL dimatikan (`ENABLE_CURL=OFF`) tetapi GDAL CURL diaktifkan (`GDAL_USE_CURL=ON`). Lisensi inti GDAL/PROJ permisif, closure biner belum diketahui. | **Belum diverifikasi** | Audit ELF/native closure dari final image dan setiap driver, simpan LICENSE/COPYING upstream versi tepat; identifikasi `libpsl`, `libidn2`, `libunistring` hanya bila memang hadir. **Output:** `native-components.csv`, `gdal-drivers.txt`, `licenses/native/`, `native-license-review.md`. |
| **P0** | CI/CD publish gate | `.github/workflows/ci-cd.yml:55–131` melakukan build smoke-test lalu build ulang ketika publish, tanpa native-license gate atau persetujuan digest final. | **Belum aman sebagai permissive release gate** | Audit dan publish **image digest yang sama**; blok tag/push untuk lisensi unresolved, integrasi gagal, atau SBOM tidak lengkap. Simpan log uji negatif dan positif. **Output:** PR workflow, `release-gate-pass.json`, `release-gate-negative-tests.log`, digest. |
| **P0** | False-positive certification in generator | `scripts/generate-third-party-notices.js:148,182–200` menyatakan semua komponen sudah permisif dan mengacu `tileo:min-musl`, meskipun Dockerfile aktif Debian. Klaim serupa hadir di `THIRD-PARTY-NOTICES.md`. | **Tidak akurat** | Perbaiki generator, **bukan hanya MD hasil generate**, agar daftar native dibangun dari bukti actual image atau ditandai unverified. **Output:** PR source generator, notice yang diregenerasi, pemeriksaan anti-stale references. |
| **P1** | npm lockfile & notice presence | `package-lock.json`: 284 non-root entri. `third-party/MANIFEST.json`: 284 entri; SHA lock cocok; 284/284 notice fisik ditemukan dan SHA-256 cocok. Tidak ada `sharp`, `libvips`, Font Awesome, atau `@gltf-transform/functions` dalam lockfile. | **Lulus secara struktural** | Pertahankan gate regresi dependensi; jangan menyamakan metadata permisif dengan sertifikasi artefak binary. **Output:** `npm-inventory.json`, `notice-sha-check.json`. |
| **P1** | Original upstream npm notices | `verification_status`: 248 `named_license_notice_collected_unverified` + 36 `generated_notice_only`. Ke-36 mencakup 26 paket `@esbuild/*` dev/opsional dan 10 paket runtime (7 wajib, 3 opsional). | **Verifikasi upstream belum final** | Ambil `LICENSE`, `NOTICE`, holder copyright dari **tarball versi persis**, utamakan 10 runtime dan binary yang benar-benar dikirim; perbaiki archives dan manifest hash/status hanya setelah pemeriksaan. **Output:** `npm-upstream-verification.csv`, dokumen asli, `MANIFEST.json` konsisten. |
| **P1** | Notice redistribution in image | `Dockerfile` hanya meng-copy notice Tippecanoe ke `/usr/local/share/tippecanoe-notices/`. Tidak terlihat `COPY` corpus third-party notice atau arsip GDAL/PROJ ke image final. | **Perlu verifikasi distribusi** | Periksa LICENSE yang masih berada dalam `node_modules`; tambahkan lokasi notice yang dapat diakses penerima image sesuai kewajiban tiap komponen. **Output:** `image-notice-paths.csv`, contoh inspeksi image. |
| **P0** | Functional regression | Checklist batching melaporkan integrasi Docker **106 pass, 12 fail**; 1 masalah LIBKML, 8 driver raster NetPBM/AAIGRID, 1 jalur MBTiles, 2 SBOM/notices. E2E batching dinyatakan lulus, tetapi 12 fail belum ditutup. | **Tidak lulus penuh** | Pilih perbaikan driver/test berdasarkan kontrak fitur yang sungguh didukung; uji ulang dalam **image kandidat release yang sama**, jangan sekadar menjalankan host test. **Output:** hasil `npm test`, `TILEO_INTEGRATION=1`, browser E2E, log dan matriks 0 fail. |
| **P1** | Evidence parity | Checklist menyebut Docker Linux **bookworm-slim**, tetapi Dockerfile dalam ZIP saat ini memakai **trixie-slim**. Checklist memberikan commit `0a79ba9c...` dan ID image tetapi image maupun raw audit binary tidak dilampirkan. | **Identitas artefak belum dapat direkonsiliasi** | Cocokkan source commit, git tree, image digest, `/etc/os-release`, hasil runtime, dan SBOM dari kandidat yang sama. **Output:** `release-provenance.json`. |
| **P1** | Version readiness | `package.json` masih `0.1.1`, belum `1.0.0`. | **Belum ditag** | Sesuaikan versi dan changelog **setelah** lulus QA/compliance, kemudian terapkan publication gate. |

## Rekap angka (terverifikasi statis)

- `package-lock.json`: **284** entri paket non-root.
- `third-party/MANIFEST.json`: **284** paket; lockfile SHA-256 sesuai, semua 284 file notice ditemukan dengan SHA-256 sesuai.
- Status notice: **248** collected but not independently upstream-verified; **36** generated-only.
- Dari 36: **26** `@esbuild/*` development/optional-platform, **7** non-optional runtime, **3** optional runtime.
- Arsip native lokal: **4** notice untuk Tippecanoe 2.79.0, **belum ada** folder teks lisensi GDAL/PROJ versi spesifik.
- Sampel dan dokumentasi administratif bukan blocker utama pemeriksaan permisif ini.
- **Tidak ada bukti SBOM image final atau compliance certification yang dapat diuji ulang dalam lampiran.**

## Rangkaian bukti minimal sebelum audit berikutnya

1. **`source-baseline.json`**: git SHA, dirty status, tanggal, Dockerfile/lockfile SHA-256, versi source.
2. **`release-image-digest.txt`** dan image tar atau akses digest registry: image **identik** untuk build, test, audit, publish.
3. **`sbom-image.spdx.json`** / **`sbom-image.cdx.json`**, beserta `os-packages.csv`, `binary-linkage.csv`, inventaris library yang statis/dinamis dan hash.
4. **`license-decisions.csv`**: setiap komponen, license expression, file LICENSE/NOTICE versi cocok, chain source, verdict `ALLOW/BLOCK/UNKNOWN`, alasan; jangan menyamakan GPL/LGPL dalam OS dengan copyleft terhadap aplikasi secara otomatis.
5. **`npm-upstream-verification.csv`** + bukti 36 tarball/versi dan status yang diperbarui.
6. **`integration-test-results.json`** dan log lengkap; semua 12 kegagalan sebelumnya harus ditutup atau dipisahkan dengan justifikasi acceptance yang disetujui manusia.
7. **`release-gate-negative-tests.log`** membuktikan CI menolak artefak non-permisif dan tanpa SBOM; **`release-approval.md`** ditandatangani reviewer manusia.

**Keputusan akhir:** **NO-GO** untuk klaim/sertifikasi *entire distributed image 100% permissive* dan image/tag Enterprise v1.0 pada bukti saat ini. Pembuatan source repository dan pengembangan biasa dapat diteruskan. Klaim “GDAL/PROJ inti permisif” tetap konsisten dengan referensi resmi, tetapi tidak menutup audit build dependencies.
