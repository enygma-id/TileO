# Checklist implementasi numeric raster tiles TileO

Acuan pekerjaan adalah [spesifikasi RG-Encoded dan R-Encoded](Fix%20terms%20-%20TileO%20RG-Encoded.md). Centang tahap implementasi setelah kriteria pada butir tersebut lulus.

## Revisi spesifikasi

- [x] Definisikan tiga profil, urutan komponen atau byte, satuan, rentang dan langkah kuantisasi.
- [x] Selaraskan contoh job dengan alur inspeksi sumber dan bedakan opsi usulan dari keluaran COG saat ini.
- [x] Tetapkan mask bersama, urutan resampling dan packing, metadata decoder serta perilaku cache.

## Implementasi dan kriteria penerimaan

Untuk membuat job dari UI, pilih COG pada form **Create tile job**, lalu pilih **RG-Encoded / R-Encoded tiles**. Form menampilkan preset sesuai satuan dan parameter yang terdeteksi, serta memilih band bila nama band cocok secara unik. Jika metadata ambigu, pilih band sumber secara manual. Untuk profil vektor, pilih U ke timur dan V ke utara. Job yang selesai bisa dibuka lewat **Open preview**.

Legenda preview memakai palet sesuai parameter, dengan penanda NoData dan nilai acuan dalam satuan yang sama dengan peta. Warna vektor menunjukkan besar kecepatan. Panel pembacaan menampilkan besar kecepatan serta U dan V.

**Status jalur statis.** API menerima COG lokal yang sudah diinspeksi dan COG remote. Pada `POST /api/jobs/from-source`, gunakan `preflightOnly: true` untuk melihat opsi, band, konversi satuan, dan estimasi tile. Hilangkan opsi tersebut untuk membuat job. Worker menerbitkan PNG XYZ dan TileJSON, serta PMTiles bila diminta. [Contoh API](docs/API.md) · [Worker raster](src/encoded-raster.ts)

**Urutan pengerjaan.** Selesaikan jalur statis dari API hingga decoder terlebih dahulu. [Rencana GDAL VRT](TileO-GDAL-VRT-Plan.md) bisa membantu pemilihan band dan reproyeksi. Encoder tetap harus membaca sampel fisik dan mask validitas untuk setiap zoom sebelum menyusun byte PNG. Mosaik beberapa GeoTIFF bersifat opsional untuk input COG tunggal.

- [x] **API dan preflight** — Tambahkan opsi encoded tiles pada parser, inspeksi dan pembuatan job. Uji COG multiband dengan U/V pada band selain 1 dan 2, band di luar indeks, jumlah band salah, unit ambigu, preset konflik, serta job COG lama.
- [x] **Normalisasi dan mask** — Terapkan scale, offset, konversi satuan dan mask sebelum reproyeksi. Uji suhu dalam kelvin dan piksel dengan hanya U atau hanya V valid. Kedua kasus vektor parsial harus menghasilkan alpha nol pada grid uji yang sejajar.
- [x] **Encoder** — Bangun tile per zoom dari sampel numerik. Uji ketiga profil pada minimum, maksimum, nilai di luar rentang dan NoData. Pastikan minimum valid menghasilkan alpha 255. Untuk sampel dalam rentang, galat round-trip maksimal setengah langkah kuantisasi ditambah toleransi floating point.
- [x] **Zoom dan pengemasan** — Uji batas kode 255/256 pada zoom bawah terhadap referensi numerik sebelum packing. Buka PMTiles dan cocokkan payload PNG dengan tile XYZ pada koordinat yang sama.
- [x] **Metadata dan klien** — Preview browser membaca profil, satuan, rentang, dan urutan byte dari TileJSON. Chromium memverifikasi nilai suhu dan U/V dari worker, interpolasi numerik pada batas 255/256, serta perbedaan 0% yang valid dan NoData transparan. Peta menampilkan warna hasil decode per piksel, sementara pembacaan kursor menginterpolasi nilai fisik dari tetangga yang valid. [Tes browser](src/browser/encoded-preview.spec.ts)
- [ ] **Arsip dinamis** — Implementasikan pembacaan range, TTL satu jam, ETag dan cache per revisi sumber. Bandingkan hasil decode statis dan dinamis untuk sumber, opsi dan XYZ identik. Uji revisi baru pada koordinat yang sudah tersimpan dalam cache.

### Contoh pembuktian pada grid uji

| Kasus | Hasil yang harus dapat diperiksa |
| --- | --- |
| Profil vektor, rentang −50 hingga 50 m/s, U = −50 dan V = 50 | PNG menyimpan RGBA `(0,255,0,255)`. Bila salah satu komponen NoData, hasilnya `(0,0,0,0)`. |
| Profil skalar 16-bit, rentang uji 0 hingga 65535, nilai 255 dan 256 | Pasangan byte R/G berturut-turut `(0,255)` dan `(1,0)`. Pada titik tengah dengan bobot sama, nilai fisik 255,5 dibulatkan menjadi kode 256. |
| Profil skalar 8-bit, rentang 0 hingga 100%, nilai valid 0% dan NoData | Kedua piksel memiliki RGB nol. Alpha berturut-turut 255 dan 0, sehingga decoder dapat membedakannya. |

Catat band sumber, koordinat XYZ, posisi piksel, nilai fisik acuan, byte PNG, dan hasil decoder pada fixture yang sama. Gunakan koordinat tersebut juga saat memeriksa PMTiles dan keluaran dinamis.

Fixture integrasi menguji API dan worker dengan GDAL 3.12.2. COG EPSG:3857 mencakup U/V band 3 dan 4, suhu 26,85 °C setelah konversi, serta batas kode 255/256 pada zoom 0 dan 1. COG EPSG:4326 mencakup reproyeksi, kelembapan valid 0%, dan mask dataset. [Fixture dan asersi](src/tests/encoded-raster.test.ts)
