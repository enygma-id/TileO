# Mosaik raster dengan GDAL VRT di TileO

Pengguna memilih beberapa GeoTIFF, memeriksa cakupan gabungan, lalu membuat satu job MBTiles. TileO membuat VRT sementara dari file sumber milik job sehingga pembuatan tile tidak memerlukan GeoTIFF mosaik perantara. VRT tetap bergantung pada file sumber selama job berjalan.

## Tahap 1 · Mosaik citra GeoTIFF lokal

### Inspeksi dan antarmuka

- [ ] Tambahkan mode **Gabungkan beberapa GeoTIFF** pada pemilih dataset. Pertahankan alur satu file untuk job biasa.
- [ ] Tampilkan nama, CRS, resolusi piksel, jumlah band, dan cakupan setiap sumber. Tampilkan cakupan, perkiraan dimensi, dan resolusi mosaik sebelum job dibuat.
- [ ] Terima sumber citra yang memiliki CRS, ukuran piksel, susunan band, dan tipe data yang kompatibel. Tolak ketidakcocokan dengan pesan yang menyebut nama file dan properti yang perlu diperbaiki.
- [ ] Biarkan pengguna mengatur urutan sumber. Jelaskan bahwa sumber terakhir yang memiliki piksel valid mendapat prioritas di area tumpang tindih. Jelaskan perlakuan terhadap NoData dan mask.

### Pemrosesan job

- [ ] Simpan sumber dan urutannya sebagai bagian dari job. Gunakan referensi file yang dibuat server dan pertahankan sumber hingga job, pembatalan, atau retry selesai.
- [ ] Periksa ketersediaan `gdalbuildvrt` pada runtime yang didukung TileO. Tampilkan pesan yang jelas jika alat tidak tersedia.
- [ ] Buat VRT sementara dengan `gdalbuildvrt -strict` dari daftar file job yang telah diperiksa. Tetapkan kebijakan resolusi dan NoData. Perlakukan sumber yang dilewati sebagai kegagalan job.
- [ ] Teruskan VRT ke pipeline `gdalwarp` dan `gdaladdo` yang sudah menghasilkan MBTiles. Pertahankan opsi zoom dan format tile yang relevan serta validasi keluaran.
- [ ] Terapkan batas jumlah file, ukuran total, estimasi dimensi raster, jumlah tile, dan waktu proses. Bersihkan VRT serta hasil sementara setelah selesai, gagal, atau dibatalkan.

### Penanganan input VRT

- [ ] Tinjau jalur inspeksi dan pembuatan job yang sudah menerima `.vrt`, termasuk sumber remote. Tentukan dan terapkan kebijakan input VRT sebelum merilis fitur mosaik.
- [ ] Buat VRT mosaik hanya dari GeoTIFF yang diverifikasi dan tercatat pada job. Pertahankan fungsi piksel Python nonaktif. Batasi akses GDAL ke sumber job yang sah dan nonaktifkan raw raster bands jika versi GDAL mendukungnya.
- [ ] Perlakukan impor VRT buatan pengguna sebagai fitur terpisah. Tetapkan format paket, aturan referensi sumber, dan validasi sebelum membuka dukungan unggahan.

### Kriteria penerimaan

- [ ] Dua GeoTIFF dengan area bertumpuk menghasilkan satu MBTiles yang bisa dibuka di TileO. Menukar urutan sumber mengubah prioritas di area tumpang tindih saja.
- [ ] Periksa resolusi, cakupan, sambungan tile, dan piksel sampel. NoData dari sumber prioritas tidak menutupi piksel sumber lain yang valid. Area tanpa data transparan pada format yang mendukung alpha.
- [ ] Sumber yang hilang, CRS berbeda, atau batas job yang terlampaui menghasilkan pesan yang menjelaskan tindakan pengguna. Pembatalan dan retry tidak menyisakan keluaran parsial atau menghilangkan sumber yang masih diperlukan.
- [ ] Job raster satu file tetap lulus. Bandingkan waktu proses dan penggunaan disk puncak dengan alur GeoTIFF mosaik perantara pada input dan parameter yang sama.

## Tahap 2 · Perluasan setelah MVP

- [ ] **CRS campuran.** Reproyeksi tiap sumber melalui Warped VRT ke CRS, grid, resolusi, dan aturan resampling yang dipilih sebelum mosaik.
- [ ] **DEM dan raster ilmiah.** Verifikasi tipe data, satuan, datum vertikal, dan NoData. Uji nilai numerik keluaran sebelum mendukung COG atau tile elevasi.
- [ ] **COG dari S3.** Gunakan koneksi TileO yang sudah diotorisasi. Ukur jumlah permintaan Range dan volume data yang dibaca dengan serta tanpa overview sumber.
- [ ] **Paket VRT portabel.** Evaluasi ekspor atau impor VRT dengan referensi relatif. Sertakan sumber yang diperlukan dan uji paket setelah dipindah ke direktori lain.

## Referensi

- [Driver GDAL VRT](https://gdal.org/en/stable/drivers/raster/vrt.html)
- [gdalbuildvrt](https://gdal.org/en/stable/programs/gdalbuildvrt.html)
- [Pipeline raster TileO](src/raster.ts)
