# Impor paket 3D Tiles di TileO

Fixture awal adalah `3dtiles-1.1.zip`. Manifest `3dtiles-1.1/tileset.json` merujuk 175 GLB pada tiga tingkat LOD. Alur lokalnya adalah pilih ZIP, inspeksi, buat job, lalu buka **Open preview** saat job berstatus **SUCCEEDED**.

## Tahap 1 — Impor dan tayangkan

- [x] Kenali ZIP 3D Tiles sebelum inspeksi GDAL. Arahkan pengguna yang mengunggah manifest lepas ke ZIP lengkap. ZIP Shapefile uji tetap terdeteksi sebagai vektor.
- [x] Validasi ZIP dengan satu entry point, manifest 1.0/1.1 atau 0.0 lama, serta hierarki eksplisit dengan GLB, B3DM dan manifest eksternal di dalam paket. Periksa batas jumlah entri dan ukuran hasil ekstraksi, jenis entri, integritas dan keberadaan konten. Uji penolakan referensi yang hilang.
- [x] Sajikan manifest serta konten melalui rute job 3D. Pertahankan transform, bounding volume, geometric error dan struktur LOD. Sediakan unduhan ZIP asli.
- [x] Uji fixture B3DM 1.0 dari upload hingga viewer dan cocokkan byte tile serta arsip unduhan dengan sumber.
- [x] Uji ZIP contoh GLB 1.1 dari upload hingga viewer. Chromium memuat ketiga LOD dan merender geometri LOD 2 saat preview dibuka dan diperbesar.
- [x] Koreksi transform ECEF absolut pada tile anak saat preview jika posisi asal cocok dengan region dan hasil komposisi induk jauh di luar region. Buka preview pada area detail. Koreksi permanen dan ekspor ulang masuk Tahap 2.
- [x] Uji `alun-alun_b3dm.zip` di browser. Impor menyelesaikan validasi 81 manifest dan 1.572 B3DM. Viewer meminta manifest utama, empat manifest blok, dan tile B3DM.
- [x] Sebutkan path entry point yang saling independen saat ZIP ambigu. Tampilkan path manifest utama, jumlah manifest dan versi lama pada ringkasan inspeksi.
- [ ] Uji dukungan I3DM, PNTS dan CMPT di viewer dengan fixture terpisah sebelum memperluas format. Implicit tiling dan beberapa konten per tile juga memerlukan pengujian terpisah.

## Tahap 2 — Koreksi dan kemas ulang

- [ ] Tambahkan mode terpisah untuk meninjau dan menerapkan koreksi penempatan. Periksa transform relatif dan absolut, termasuk RTC_CENTER untuk B3DM bila ada.
- [ ] Kemas hasil ke arsip baru. Simpan arsip sumber dan catat perubahan transform serta konversi format per tile.
- [ ] Validasi lokasi, cakupan, LOD dan penayangan hasil ekspor pada fixture GLB dan B3DM sebelum memperluas format.

## Konversi model 3D sumber

- [x] Tambahkan perintah lokal `npm run model3d:convert` untuk glTF, OBJ, FBX dan STL. Konverter memakai Blender 4.5+, membaca aset pendamping dari direktori sumber, menghasilkan GLB mandiri dan mendukung skala serta orientasi sumber.
- [x] Uji semua format dengan mesh 12 segitiga dan dimensi sumber yang berbeda pada tiga sumbu. Pipeline 3D menerima keempat GLB dan menghasilkan dimensi yang sesuai dengan skala 0,5. Verifikasi PNG tertanam di GLB dari glTF, OBJ dan FBX. Fixture STL memuat geometri.
- [ ] Uji material khusus dan model dengan aset atau orientasi tidak lazim sebelum memperluas cakupan. Konverter tahap ini mencakup model statis.
