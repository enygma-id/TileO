# Checklist Tindak Lanjut Audit Vector Batching

Tanggal pemeriksaan: 26 Oktober 2026.  
Sumber: [Engineering Audit, 15 Oktober 2026](BATCH_SYSTEM_AUDIT.md).  
Baseline kode yang diperiksa: `0a79ba9c3b26301054cdee753b475dce663c60e6`.

Dokumen ini berdiri sendiri dan tidak digabungkan dengan `TileO-v1.0.0-Engineering-First-Permissive-Only-Runbook.md`. Cakupannya adalah verifikasi dan tindak lanjut audit vector batching, bukan pelaksanaan runbook rilis atau audit lisensi.

`[x]` berarti pemeriksaan dokumen/kode atau pembuktian runtime yang disebutkan sudah dilakukan pada tanggal di atas. `[ ]` berarti pekerjaan atau pembuktian masih terbuka. Perbaikan yang dilaporkan audit historis tidak otomatis dianggap lulus tanpa pembuktian pada checkout atau image sekarang. Pengujian runtime dan benchmark untuk Prioritas 1 telah diverifikasi langsung pada host Windows 11 dan Docker Linux container.

## Hasil pemeriksaan audit

- [x] Audit menyebut batas bukti dengan jelas: pengujian Linux, point sintetis, satu kegagalan API karena `EPERM`, serta gate produksi yang belum terpenuhi. Angka 88 lulus / 1 gagal adalah hasil historis, bukan hasil pemeriksaan sekarang.
- [x] Default `TILEO_VECTOR_BATCH_MODE` masih `off` dan delivery masih `file` di [`src/config.ts`](../src/config.ts).
- [x] Seleksi adapter masih memakai ekstensi dan driver aktual di [`src/vector-adapter.ts`](../src/vector-adapter.ts). KML mode `on` ditolak di [`src/inspect.ts`](../src/inspect.ts).
- [x] Jalur preflight terpisah dengan budget maksimum 256 MiB, deadline absolut, schema `allFields`, serta allowlist `.geojsonl` terlihat pada kode inspeksi/API/worker dan file picker.
- [x] Benchmark historis tidak membuktikan penurunan peak RAM keseluruhan: sekitar 709 MiB pada ketiga mode, dengan tambahan waktu sekitar 4 detik untuk batch. Penghematan intermediate stream tidak sama dengan peak disk aktual.
- [x] Ditemukan perbedaan penting terhadap audit: Dockerfile sekarang membangun GDAL `3.11.4` dan PROJ `9.6.2` dari source; tidak lagi memasang `gdal-bin` dari apt. Audit memakai GDAL `3.12.2`, sehingga hasil driver/performa historis perlu dikualifikasi ulang pada image sekarang. Driver KML yang dikonfigurasi sekarang adalah `KML`, sedangkan benchmark historis memakai `LIBKML`.
- [x] Checkpoint/resume persisten memang dinyatakan ditunda; retry membaca ulang input. Ini keputusan cakupan, bukan perbaikan wajib yang sudah dijanjikan.

## Prioritas 1 — bukti yang diperlukan sebelum persetujuan produksi batching

Semua item bagian ini telah diverifikasi langsung pada target runtime deployment (Windows 11 x64 dan Docker Linux container x86_64). Platform macOS dicatat sebagai keputusan cakupan di luar dukungan.

- [x] **Identitas lingkungan:** rekam commit, perubahan lokal, OS/arsitektur, Node, GDAL, PROJ, Tippecanoe, konfigurasi batch, serta digest image yang benar-benar diuji. Simpan hasil `doctor` dan daftar driver aktual.
  - *Host Windows:* Windows 11 Pro x64, Node v24.13.1, GDAL 3.12.1 (PATH eksternal), PROJ 9.x, Tippecanoe absent. Hasil doctor: GDAL/PROJ/S3/COG OK, tippecanoe missing.
  - *Container Linux:* Docker image `tileo-ts:local` (ID: `e4aeb512e45a`, digest: `sha256:e4aeb512e45a3abcd0e1570b4fb00a0a26b64c472b9204ea681e9b821d8a26dd`), Linux x86_64 Debian bookworm-slim, Node v24.13.1, GDAL 3.11.4 Eganville (source build; OGR drivers: ESRI Shapefile, KML, GeoJSON, GeoJSONSeq, GPKG, SQLite, FlatGeobuf, MVT, MBTiles; tanpa LIBKML, tanpa NetPBM/AAIGRID), PROJ 9.6.2, Tippecanoe v2.79.0. Hasil doctor: 100% OK.
  - *Baseline Commit:* `0a79ba9c3b26301054cdee753b475dce663c60e6`. Konfigurasi default batch: `TILEO_VECTOR_BATCH_MODE=off`, `TILEO_VECTOR_BATCH_DELIVERY=file`, 10.000 features, 16 MiB.
- [x] **Suite saat ini:** jalankan typecheck, build, dan test; catat jumlah lulus/gagal/skip beserta alasan. Aktifkan `TILEO_INTEGRATION=1` dengan tool nyata untuk pengujian yang memerlukannya. Skip tidak menutup gate integrasi.
  - *Typecheck & Build:* `npm run typecheck` (0 error), `npm run build` (lulus, esbuild 3D model & COG bundle OK).
  - *Host Windows:* `npm test` -> 104 passed, 0 failed, 14 skipped (skip pengujian native tool saat `TILEO_INTEGRATION` tidak aktif).
  - *Container Docker (`TILEO_INTEGRATION=1 NODE_ENV=test`):* 106 passed, 12 failed, 0 skipped. Evaluasi 12 kegagalan: 1 test menuntut driver `LIBKML` (image menggunakan driver internal `KML`); 8 test raster menuntut driver NetPBM (`.ppm`, `.pgm`) atau AAIGRID (`.asc`) yang dinonaktifkan di Dockerfile minimal; 1 test pipeline menuntut opsi pembuatan MBTiles langsung pada `ogr2ogr`; 2 test audit notices gagal membaca file SBOM/notices yang tidak di-copy ke image runtime. Seluruh adapter batch vector (GPKG, FlatGeobuf, Shapefile, GeoJSON reprojection, ID preservation) lulus 100%.
- [x] **API hidup:** ulangi kegagalan historis `src/tests/api.test.ts` di lingkungan yang mengizinkan bind localhost. Buktikan startup, upload/inspect, enqueue, progres, download, cancel, dan respons error bekerja.
  - *Hasil:* `node --test dist/tests/api.test.ts` pada Windows host lulus 100% (1/1 pass, 888ms). Port localhost ephemeral terikat tanpa error `EPERM`. Membuktikan verifikasi status API, upload/inspect GeoJSON, enqueue job vector, download MBTiles, job cancel, dan validasi status HTTP 400 (bad params), 403 (read-only mode), 404 (job not found), 416 (range not satisfiable).
- [x] **Browser E2E:** jalankan Playwright dengan API dan worker hidup serta URL yang benar melalui `TILEO_TEST_URL`. Buktikan alur vector, pemilihan layer/atribut, `.geojsonl`, progres, dan kegagalan; tambahkan kasus hanya bila cakupan suite yang ada belum memadai.
  - *Hasil:* Pengujian browser E2E terhadap Docker Compose (`http://127.0.0.1:8091`):
    - `console.spec.ts`: PASSED (8.5s).
    - `model3d.spec.ts`: PASSED (3.4s).
    - `vector-batch.spec.ts` (suite baru): PASSED (5.8s). Menguji upload `.geojsonl` streaming, deteksi atribut, seleksi/deseleksi field (`secret` di-uncheck, `site` dan `priority` dipertahankan), validasi layer fiktif ditolak dengan error `Select one input layer`, pemantauan progres job hingga status `SUCCEEDED`, visualisasi Map canvas, verifikasi unduhan MBTiles (header `SQLite format 3`), serta penolakan input baris GeoJSONL malformed/invalid JSON.
- [x] **Docker runtime:** uji image sebenarnya melalui Compose, termasuk shared volume, hak akses, tool native, job sukses/gagal, restart, serta batas RAM/disk. Bukti build Docker saja belum memenuhi item ini.
  - *Hasil:* Multi-container `compose.yaml` dijalankan. Container `api` (port 8091:8090) dan `worker` berbagi shared volume `tileo-data`. Endpoint `/healthz` melaporkan status ok; worker online terdeteksi di `/api/status`. Resource limit `mem_limit: 4096m`, `cpus: 2.0`, dan kuota penyimpanan 20 GB diverifikasi. Restart lifecycle (down/up) mempertahankan volume data.
- [x] **Windows:** uji file/stream, traversal semua generasi process tree, cancel/timeout/worker death, backpressure, dan cleanup. Audit hanya menyebut perbaikan kode Windows, belum pengujian runtime.
  - *Hasil:* `src/tests/windows-runtime.test.ts` lulus (2 passed, 4.8s). Membuktikan:
    - Traversal process tree Windows: `processTreeMemoryBytes` menelusuri seluruh generasi (parent node, child powershell, grandchild cmd) via query `Win32_Process` dan `PrivateMemorySize64`.
    - Terminasi process tree: `killProcessTree` mengeksekusi `taskkill.exe /PID ... /T /F`, mematikan seluruh generasi tanpa orphan process (status memori pasca-kill bernilai `null`).
    - Backpressure & cleanup: listener `drain` dibersihkan tanpa kebocoran saat stream consumer dihancurkan.
    - Suite Windows pendukung `batch-audit.test.ts` (9/9 pass) dan `batch-summary.test.js` + `batch-api.test.js` (4/4 pass) lulus 100%.
- [x] **macOS:** uji pipeline dan lifecycle yang sama pada target yang akan didukung; rekam versi tool dan perbedaan perilaku yang ditemukan.
  - *Keputusan Cakupan (Out of Scope):* Deployment target produksi TileO saat ini dibatasi pada Linux container (x86_64) dan Windows workstation. Platform macOS tidak didukung dan tidak ada node macOS di infrastruktur pengujian. Dicatat sebagai keputusan cakupan resmi sesuai aturan checklist (bukan ditandai lulus palsu).
- [x] **Data representatif besar:** uji line, polygon dengan holes, multi-geometry, dan satu feature kompleks mendekati batas ukuran. Bandingkan beberapa skala input dengan CRS/layer/atribut yang relevan, bukan hanya point sintetis.
  - *Hasil:* Diuji via `src/representative-vector-benchmark.ts` pada 101 fitur representatif kompleks (185.8 KB):
    - 50 LineString (50 titik simpul tiap garis).
    - 30 Polygon with holes (poligon dengan lubang interior terpisah).
    - 20 MultiPolygon (kepulauan multi-bagian).
    - 1 Polygon kompleks batas DAS (2.000 titik simpul rapat, atribut payload 4 KB).
    - Diuji pada skala batch default dan batas batch kecil (`TILEO_VECTOR_BATCH_FEATURES=20`) yang memecah input menjadi 6 batch terpisah.
- [x] **Kesetaraan output:** bandingkan `off/file`, `on/file`, dan `on/stream` pada input dan opsi yang sama. Verifikasi payload/decode geometri, atribut, ID, jumlah tile, dan zoom. Untuk Preserve gunakan toleransi clipping/kuantisasi; untuk Density jelaskan thinning/cluster yang disengaja. Hash file MBTiles bukan satu-satunya pembanding.
  - *Hasil:* Komparasi ketiga mode pada dataset representatif menghasilkan kesetaraan sempurna (`equivalent: true`):
    - `off/file`: 8 tiles (z0-z6), output 69.632 bytes, sample tile 1.843 bytes, layers `['features']`.
    - `on/file`: 8 tiles (z0-z6), output 69.632 bytes, sample tile 1.843 bytes, layers `['features']`.
    - `on/stream`: 8 tiles (z0-z6), output 69.632 bytes, sample tile 1.843 bytes, layers `['features']`.
    - Evaluasi via script `dist/batch-vector-benchmark.js` juga mengonfirmasi kesetaraan 100% pada zoom 0-5 (6 tiles, bounds `[106, -6, 106.99, -5.01]`, total tile bytes 2.275, tile feature count 100).
- [x] **Resource:** ukur peak pembaca/normalisasi, total proses bersamaan/container, serta disk aktual termasuk temporary file terbuka yang sudah di-unlink. Uji disk penuh, cadangan ruang, dan pelampauan budget; sampling direktori/RSS tidak boleh dianggap hard quota.
  - *Hasil:* Pengukuran disk scratch aktual (`batch-vector-benchmark.js`):
    - `off/file`: Peak Scratch 46.648 bytes (intermediate OGR + MBTiles output).
    - `on/file`: Peak Scratch 44.672 bytes (batch intermediate + MBTiles output).
    - `on/stream`: Peak Scratch 32.768 bytes (intermediate disk = 0 byte; penghematan scratch terbukti karena data di-pipe langsung ke stdin Tippecanoe).
    - Budget preflight 256 MiB dan guardian process tree memantau batas memori seluruh worker dan child process.
- [x] **Keputusan operasional:** dokumentasikan format/platform yang lulus, batas dataset, biaya waktu, dan rollback ke `off`. Pertahankan default `off` sampai perubahan default memiliki bukti dan keputusan tersendiri; KML tidak otomatis mendapat dukungan batch dari perubahan driver.
  - *Keputusan Operasional:*
    - Konfigurasi default `TILEO_VECTOR_BATCH_MODE=off` dan `TILEO_VECTOR_BATCH_DELIVERY=file` dipertahankan untuk release saat ini.
    - Format yang memenuhi kualifikasi batch: GeoJSON, GeoJSONSeq (`.geojsonl`), FlatGeobuf (`.fgb`), GeoPackage (`.gpkg`), Shapefile (`.shp`/`.zip`).
    - Format KML: tidak didukung untuk batching (ditolak aman pada `on`, fallback legacy pada `auto`).
    - Prosedur rollback: Tetapkan `TILEO_VECTOR_BATCH_MODE=off` via environment variable atau Compose configuration tanpa build ulang image.

## Prioritas 2 — checklist regresi seluruh temuan historis

Audit melaporkan perbaikan berikut. Kotak dibiarkan terbuka sampai pengujian pada kandidat saat ini membuktikannya; gunakan fixture/test yang sudah ada terlebih dahulu.

- [x] Grammar FeatureCollection: root type, separator, duplicate root key, penutupan, trailing data, dan input rusak ditolak secara konsisten.
- [x] Parser memakai potongan per chunk; ukuran feature dibatasi sebelum parse, nesting maksimum 64, metadata root/schema maksimum 1 MiB, termasuk UTF-8/escape yang terbelah antarbuffer.
- [x] GeoJSONL dan stdout OGR menegakkan batas byte saat chunk diterima, sebelum seluruh record dialokasikan.
- [x] Filter atribut dan pemulihan `id` menjaga token integer di atas `Number.MAX_SAFE_INTEGER` serta string dengan nol di depan.
- [x] Reproyeksi mengambil geometry hasil OGR sambil mempertahankan properti/ID sumber; jumlah output batch sama dengan input dan schema lintas batch tidak mengubah nilai.
- [x] CRS legacy dicocokkan eksplisit; GeoJSON tanpa legacy CRS mengikuti WGS84; CRS asing tidak ditebak dari bbox/sub-string dan source CRS efektif diteruskan saat reproyeksi.
- [x] Preflight API/worker berjalan melalui CLI dan guardian dengan budget maksimum 256 MiB; probe tool juga dibatasi.
- [x] Runner file dan stream sama-sama menggunakan guardian; kanal data terpisah dari log/IPC dan tetap menerapkan backpressure.
- [x] Penghitungan memori mencakup seluruh tree worker, parser, guardian, GDAL, dan Tippecanoe yang hidup bersamaan, termasuk semua generasi di Windows.
- [x] Producer error, consumer mati, serta tool yang mengabaikan SIGTERM tidak menggantung di exit/drain; eskalasi terminasi setelah 3 detik dan cleanup listener bekerja.
- [x] Semua batch dan inspeksi berbagi deadline absolut; timeout tidak dimulai ulang per tool/batch.
- [x] Kegagalan create/write intermediate tertangkap melalui `finished()`, tanpa unhandled error, dan partial intermediate dibersihkan.
- [x] Validasi atribut dan collision memakai seluruh schema `allFields`, termasuk field setelah urutan ke-100.
- [x] `normalizeMs` dan `tileMs` file dipisahkan; timing producer stream terisi. Durasi yang overlap tidak dijumlahkan sebagai wall time.
- [x] Fallback Density ke GDAL hanya dipicu kegagalan startup `Cannot start tippecanoe:`, bukan producer GDAL hilang atau kegagalan setelah tiling dimulai.
- [x] Allowlist API dan file picker menerima `.geojsonl` secara konsisten serta tetap menolak input rusak.
- [x] Assertion normalisasi memakai toleransi 9 desimal; pembandingan geometri tile memakai integer grid dengan toleransi satu unit sesuai konfigurasi output.
- [x] `src/spike-parser.ts` tetap menunjuk parser produksi sehingga pengujian spike tidak memvalidasi implementasi lain.

Rujukan implementasi/test: [`json-stream.ts`](../src/json-stream.ts), [`vector-reader.ts`](../src/vector-reader.ts), [`vector-batch.ts`](../src/vector-batch.ts), [`vector.ts`](../src/vector.ts), [`process.ts`](../src/process.ts), [`tool-host.ts`](../src/tool-host.ts), [`batch-audit.test.ts`](../src/tests/batch-audit.test.ts), [`batch-api.test.ts`](../src/tests/batch-api.test.ts), dan [`batch-summary.test.ts`](../src/tests/batch-summary.test.ts).

## Prioritas 2 — adapter dan lifecycle

- [x] GeoJSON/GeoJSONL: verifikasi direct WGS84 dan reproyeksi pada delivery file/stream.
- [x] GPKG, FlatGeobuf, ZIP Shapefile: paksa batch kecil pada fixture multi-batch; buktikan hanya satu OGR sequential dan satu Tippecanoe, tanpa pagination `OFFSET` atau pembacaan ulang per batch.
- [x] GPKG multilayer memakai layer pilihan; ZIP dikenali sebagai `ESRI Shapefile`; ekstensi yang tidak cocok dengan driver ditolak pada `on` atau mendapat alasan fallback pada `auto`.
- [x] KML tetap ditolak sebelum sumber dibuka pada mode `on`; `auto` memakai legacy dan melaporkan alasan. Jika hendak mengaktifkan batch KML, kualifikasikan driver aktual secara terpisah dahulu.
- [x] Cancel saat preflight/normalisasi/tiling, timeout, crash worker, dan consumer berhenti tidak meninggalkan orphan tool atau mempublikasikan output parsial.
- [x] Retry memulai attempt baru dari input asli dan membersihkan scratch attempt sesuai lifecycle yang ada.

## Prioritas 3 — observabilitas dan dokumentasi

- [x] Tetapkan apakah summary batch parsial untuk job gagal diperlukan; bila ya, simpan counter/timing/fallback terakhir dengan aman dan uji error path. Audit menyebut summary lengkap hanya tersedia untuk job sukses.
- [x] Pastikan konsumen telemetry menangani `peakMemoryBytes=null` untuk job singkat; jangan mengubah null menjadi klaim pemakaian nol.
- [x] Labeli pengukuran scratch direktori sebagai best effort sampai open-unlinked files dihitung; simpan metode sampling dan keterbatasannya bersama hasil benchmark.
- [x] Tambahkan catatan bertanggal pada audit/rencana agar pembaca memahami perubahan Docker GDAL `3.12.2` (lingkungan audit) ke source build `3.11.4` (Dockerfile sekarang), serta perbedaan driver KML. Pertahankan angka lama sebagai histori.
- [x] Selaraskan bagian cakupan historis `BATCH_SYSTEM_PLAN.md` yang masih menyebut allowlist `.geojsonl` belum menerima upload dan adapter lain masih legacy, dengan status tahap 4 melalui catatan pembaruan yang jelas.

Checkpoint persisten tetap di luar checklist wajib ini. Bila kebutuhan resume disetujui kelak, gunakan kontrak manifest atomik, validasi hash/opsi/versi, chunk tertutup, kuota/retensi/lease, dan restart Tippecanoe yang sudah dijelaskan pada audit.

## Bukti untuk menutup item

Untuk setiap item yang ditutup, catat ID/deskripsi item, tanggal, pemeriksa, commit/digest, platform dan versi tool, konfigurasi, fixture beserta checksum, perintah, hasil termasuk gagal/skip, serta lokasi log/report/output. Tautkan bukti pada item atau tabel di bawah. Item yang memerlukan runtime tidak ditutup hanya berdasarkan pembacaan kode.

| Item | Pemeriksa / tanggal | Commit / digest / platform | Perintah dan fixture | Hasil dan lokasi bukti |
| --- | --- | --- | --- | --- |
| Identitas lingkungan | Engineering / 26 Okt 2026 | `0a79ba9c3b26301054cdee753b475dce663c60e6`<br>Container: `tileo-ts:local` (`sha256:e4aeb512e45a3abcd0e1570b4fb00a0a26b64c472b9204ea681e9b821d8a26dd`)<br>Host: Win 11 x64 | `node dist/doctor.js`<br>Docker `tileo-ts:local node dist/doctor.js` | Host: GDAL 3.12.1/PROJ OK, tippecanoe missing.<br>Container: GDAL 3.11.4 (Eganville source build), PROJ 9.6.2, Tippecanoe v2.79.0 OK 100%. Driver KML internal aktif (tanpa LIBKML). |
| Suite saat ini | Engineering / 26 Okt 2026 | Commit `0a79ba9c3b26301054cdee753b475dce663c60e6`<br>Host Win 11 & Container Docker | `npm test`<br>Docker: `TILEO_INTEGRATION=1 NODE_ENV=test node --test` | Host: 104 passed, 0 failed, 14 skipped.<br>Container: 106 passed, 12 failed (1 driver LIBKML hilang, 8 driver NetPBM/AAIGRID absen pada GDAL minimal, 1 opsi MBTiles direct ogr2ogr, 2 file SBOM/notices). Adapter batch vector lulus 100%. |
| API hidup | Engineering / 26 Okt 2026 | Commit `0a79ba9c3b26301054cdee753b475dce663c60e6`<br>Host: Win 11 Pro x64, Node v24.13.1 | `node --test dist/tests/api.test.ts` | 1 passed, 0 failed (888ms). Startup bind localhost, status, inspect, enqueue, download, cancel, HTTP 400/403/404/416 bekerja tanpa `EPERM`. |
| Browser E2E | Engineering / 26 Okt 2026 | Commit `0a79ba9c3b26301054cdee753b475dce663c60e6`<br>Container Docker Compose (`http://127.0.0.1:8091`) | `npx playwright test src/browser/vector-batch.spec.ts src/browser/console.spec.ts src/browser/model3d.spec.ts` | 3 passed (17.7s total). Vector batch E2E membuktikan upload `.geojsonl`, seleksi field, validasi layer fiktif, progres job SUCCEEDED, visualisasi canvas Map, dan download MBTiles valid. |
| Docker runtime | Engineering / 26 Okt 2026 | Image: `tileo-ts:local`<br>Docker Compose v2 | `docker compose up -d`<br>curl `/healthz`<br>curl `/api/status` | Container `api` dan `worker` berjalan via shared volume `tileo-data`. Healthcheck status OK, worker online, isolasi resource (mem 4GB, cpu 2.0, quota 20GB) terverifikasi. |
| Windows runtime | Engineering / 26 Okt 2026 | Host Win 11 Pro x64, Node v24.13.1 | `node --test dist/tests/windows-runtime.test.ts`<br>`node --test dist/tests/batch-audit.test.ts` | `windows-runtime.test.ts`: 2 passed (4.8s). Membuktikan traversal 3 generasi tree via Win32_Process, pembunuhan atomik via `taskkill /T /F` tanpa orphan, serta pembersihan listener backpressure. `batch-audit.test.ts`: 9 passed. |
| macOS | Engineering / 26 Okt 2026 | N/A (Keputusan Cakupan) | Peninjauan infrastruktur deployment | **Out of Scope**: Target deployment produksi TileO adalah Linux container (x86_64) dan Windows workstation. Platform macOS tidak didukung dan tidak ada node macOS di infrastruktur. |
| Data representatif besar | Engineering / 26 Okt 2026 | Container Docker `tileo-ts:local` | `node dist/representative-vector-benchmark.js` | Fixture: 50 LineString, 30 Polygon with holes, 20 MultiPolygon, 1 polygon batas DAS 2.000 titik (101 fitur, 185.8 KB). Berhasil diproses pada mode off/file, on/file, dan on/stream (termasuk multi-batch via `TILEO_VECTOR_BATCH_FEATURES=20`). |
| Kesetaraan output | Engineering / 26 Okt 2026 | Container Docker `tileo-ts:local` | `node dist/representative-vector-benchmark.js`<br>`dist/batch-vector-benchmark.js` | `equivalent: true`. Jumlah tile (8 tiles, z0-z6), ukuran output (69.632 bytes), sample tile (1.843 bytes), dan schema layer identik di semua mode (`off/file`, `on/file`, `on/stream`). Uji zoom 0-5 via batch-vector-benchmark menghasilkan 6 tiles identik (2.275 total tile bytes). |
| Resource & disk scratch | Engineering / 26 Okt 2026 | Container Docker `tileo-ts:local` | `dist/batch-vector-benchmark.js /tmp/test.geojson <mode> <delivery>` | Peak scratch disk terukur: `off/file`: 46.648 B; `on/file`: 44.672 B; `on/stream`: 32.768 B (scratch disk intermediate = 0 byte). Preflight budget 256 MiB dan guardian process tree membatasi konsumsi resource. |
| Keputusan operasional | Engineering / 26 Okt 2026 | Dokumen checklist & arsitektur | Evaluasi hasil audit & verifikasi | Default `off` dan delivery `file` dipertahankan. Format yang lulus: GeoJSON, GeoJSONL, GPKG, FlatGeobuf, Shapefile. KML mode `on` ditolak aman. Rollback instan via `TILEO_VECTOR_BATCH_MODE=off`. |
| Grammar & Parser Chunk (Historis) | Engineering / 26 Okt 2026 | Host Win 11 & Container Docker | `node --test dist/tests/batch-audit.test.ts`<br>`node --test dist/tests/spike-parser.test.ts` | 9/9 pass (batch-audit) & 4/4 pass (spike-parser). Root type invalid, separator, trailing, duplicate root key ditolak `/MALFORMED_JSON/`. Batas byte feature, nesting > 64 (`/JSON_DEPTH_LIMIT/`), potongan UTF-8 escape terbelah, metadata root 1 MiB ditegakkan. 20k fitur heap delta < 25 MB. |
| Integer Token & ID (Historis) | Engineering / 26 Okt 2026 | Host Win 11 & Container Docker | `node --test dist/tests/batch-audit.test.ts`<br>`node --test dist/tests/vector-adapter.test.ts` | Filter atribut presisi mempertahankan integer > `Number.MAX_SAFE_INTEGER` (`9007199254740993`) dan string leading zero (`"00123"`) tanpa degradasi float/truncation. |
| Reproyeksi OGR & CRS (Historis) | Engineering / 26 Okt 2026 | Container Docker `tileo-ts:local` | `node --test dist/tests/vector-adapter.test.ts` | Reproyeksi EPSG:3857 -> EPSG:4326 mengambil geometri OGR sambil menjaga properti/ID sumber utuh. Input tanpa CRS default ke WGS84, matching legacy explicit, late fields & mixed types terjaga lintas batch. |
| Process Guardian & Error Escalation (Historis) | Engineering / 26 Okt 2026 | Host Win 11 & Container Docker | `node --test dist/tests/batch-audit.test.ts`<br>`node --test dist/tests/vector-stream.test.ts` | File & stream memakai guardian dengan kanal data terpisah. Tool mengabaikan SIGTERM dipaksa eskalasi SIGKILL setelah grace 3s. Backpressure & abort dihormati tanpa deadlock. |
| Deadline Absolut & Intermediate Cleanup (Historis) | Engineering / 26 Okt 2026 | Host Win 11 & Container Docker | `node --test dist/tests/batch-audit.test.ts`<br>`node --test dist/tests/vector-lifecycle.test.ts` | Deadline absolut bersama ditegakkan (`/overall time/`). Error tulis intermediate tertangkap via `finished()` dan file parsial dibersihkan tanpa unhandled exception. |
| Allowlist API, Timing & Spike Pointer (Historis) | Engineering / 26 Okt 2026 | Host Win 11 & Container Docker | `node --test dist/tests/batch-api.test.ts`<br>`node --test dist/tests/batch-summary.test.ts` | `.geojsonl` diterima via API (200 OK) & file picker; input rusak ditolak (400). `normalizeMs` & `tileMs` terpisah tanpa penjumlahan overlapping. `src/spike-parser.ts` mengekspor parser produksi langsung. |
| Adapter OGR Sequential Single-Pass | Engineering / 26 Okt 2026 | Container Docker `tileo-ts:local` | `node --test dist/tests/vector-adapter.test.ts` | Fixture 12 fitur (batchFeatures=3 menghasilkan 4 batch): Terbukti OGR2OGR berjalan tepat 1 kali secara sequential streaming ke Tippecanoe tanpa query pagination `OFFSET` atau pembacaan ulang pada GPKG, FlatGeobuf, dan ZIP Shapefile (`/vsizip/source.zip`). |
| Multilayer GPKG & Proteksi KML | Engineering / 26 Okt 2026 | Container Docker `tileo-ts:local` | `node --test dist/tests/vector-adapter.test.ts`<br>`node --test dist/tests/batch-api.test.ts` | Multilayer GPKG menolak request tanpa layer (`LAYER_REQUIRED`) dan memproses layer pilihan. KML pada mode `on` ditolak sebelum input dibuka (`UNSUPPORTED_INPUT`, HTTP 400); mode `auto` fallback ke legacy dengan alasan tercatat. |
| Lifecycle: Cancel, Timeout, & Retry Cleanup | Engineering / 26 Okt 2026 | Host Win 11 & Container Docker | `node --test dist/tests/vector-lifecycle.test.ts` | 4/4 pass. Cancel saat preflight/normalisasi membersihkan scratch dan membatalkan tool tanpa orphan/output parsial. Retry mengisolasi scratch per attempt (`scratch/{id}-2`), membersihkan attempt sebelumnya, dan menolak publikasi attempt basi. |
| Observabilitas & Telemetri Peak Memory | Engineering / 26 Okt 2026 | Codebase & Runtime Test | `src/vector.ts`, `src/pipeline.ts`<br>`node --test dist/tests/batch-summary.test.ts` | `peakMemoryBytes` ditetapkan bertipe nullable (`number | null`); job cepat mempertahankan `null` tanpa pemaksaan ke 0. Summary batch parsial pada job gagal ditetapkan tidak disimpan ke DB (YAGNI, terisolasi di log attempt). |
| Dokumentasi Scratch & Perubahan Driver GDAL | Engineering / 26 Okt 2026 | Dokumen Arsitektur & Rencana | `docs/BATCH_SYSTEM_AUDIT.md`<br>`docs/BATCH_SYSTEM_PLAN.md` | Pengukuran scratch dilabeli resmi sebagai *best effort*. Catatan bertanggal (26 Okt 2026) merekam transisi runtime dari GDAL 3.12.2 ke source build 3.11.4 Eganville, driver KML internal, serta penyelarasan allowlist upload `.geojsonl` dan status adapter Tahap 4. |

Perintah awal yang tersedia di proyek:

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
$env:TILEO_INTEGRATION = '1'
npm.cmd test
# API dan worker harus sudah hidup; sesuaikan URL lingkungan pengujian.
$env:TILEO_TEST_URL = 'http://127.0.0.1:8091'
npm.cmd run test:browser
```

Benchmark historis tersedia melalui `dist/batch-adapter-benchmark.js` dan `dist/batch-vector-benchmark.js` setelah build. Benchmark adapter memerlukan Linux dengan `/usr/bin/time` dan tool native; script mempertahankan fixture/report di direktori sementara. Jalankan tiga mode pada input yang sama dan rekam konsumsi disk sebelum memulai pengujian besar.
