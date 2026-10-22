> **Reference implementation snapshot (supplied October 2026).** This technical document is preserved from the provided TileO code archive for historical/engineering continuity. Paths, endpoints, tests and commands apply to that snapshot and must be checked against the official code import before being represented as supported release behavior.

# Audit tahap 0–3 dan hasil tahap 4

Tanggal: 15 Oktober 2026. Lingkungan: Linux x64, Node v24.21.0, GDAL 3.12.2, Tippecanoe 2.79.0.

Tahap 4 sudah diimplementasikan untuk GPKG, FlatGeobuf, dan ZIP Shapefile yang dikenali GDAL sebagai `ESRI Shapefile`. KML diuji dan sengaja tidak dikualifikasikan untuk batching: pembacaan sumbernya memperlihatkan kenaikan memori seiring ukuran dataset. Mode `on` menolak KML sebelum membuka sumber; `auto` memakai jalur lama dan mencatat alasan fallback.

Audit tahap 0–3 menemukan masalah implementasi yang tidak tertangkap oleh checklist sebelumnya. Perbaikan dan bukti pengujian dicatat di bawah. Checklist lama bukan bukti bahwa seluruh kriteria produksi sudah terpenuhi.

## Temuan dan perbaikan

| Prioritas | Temuan sebelum audit | Perbaikan dan verifikasi |
| --- | --- | --- |
| Tinggi | Parser memeriksa penutupan kurung tetapi belum memvalidasi grammar root, separator feature, root type, duplicate root key, dan trailing data | Parser bounded di `json-stream.ts` (reference path: `src/json-stream.ts`); fixture invalid JSON lengkap di `batch-audit.test.ts` (reference path: `src/tests/batch-audit.test.ts`) |
| Tinggi | Satu buffer slice dibuat untuk setiap byte feature; metadata root tidak memiliki budget total | Satu slice per chunk, batas byte sebelum parse, batas nesting 64, metadata root/schema masing-masing 1 MiB |
| Tinggi | `readline` memeriksa ukuran record setelah seluruh baris dialokasikan | Decoder GeoJSONL dan stdout OGR membatasi byte saat menerima chunk, sebelum membentuk baris penuh |
| Tinggi | Filter atribut dan pemulihan `id` melalui `JSON.parse`/`JSON.stringify` dapat membulatkan integer di atas `Number.MAX_SAFE_INTEGER` | Rewrite berdasarkan raw member JSON, mempertahankan token angka dan nilai string |
| Tinggi | Normalisasi per batch menimpa feature ID dengan nomor global baru, menghilangkan ID sumber; schema GDAL bisa berbeda antarbatch | Pada GeoJSON reproyeksi, hanya geometry hasil OGR yang digunakan; properti dan ID diambil dari raw source feature. Jumlah output harus sama dengan input batch |
| Tinggi | CRS dapat ditebak dari angka koordinat atau substring `4326`; metadata CRS sumber hilang saat menulis batch sementara | CRS legacy dicocokkan secara eksplisit; GeoJSON tanpa legacy CRS mengikuti semantik WGS84 format. CRS yang tidak dikenali tidak ditebak dari bbox; reproyeksi selalu menerima source CRS efektif |
| Tinggi | Preflight dilakukan di API/worker sendiri, tanpa batas memori proses inspeksi API | Preflight dipindah ke `vector-preflight-cli.ts` (reference path: `src/vector-preflight-cli.ts`), dijalankan lewat guardian dengan budget maksimal 256 MiB dan V8 heap lebih kecil. Probe tool lain juga dibatasi 256 MiB |
| Tinggi | Runner streaming melakukan spawn langsung, tidak mempunyai perlindungan IPC guardian yang sama dengan runner file | Semua jalur memakai `process.ts` (reference path: `src/process.ts`) dan `tool-host.ts` (reference path: `src/tool-host.ts`), dengan pipe data terpisah dari log/IPC |
| Tinggi | Memori Tippecanoe dan GDAL yang merupakan sibling process tidak terhitung sebagai satu pipeline | Guardian streaming mengambil snapshot tree worker, termasuk parser, guardian, dan kedua tool. Windows diperbaiki agar traversal mencakup semua generasi; runtime Windows belum diuji |
| Tinggi | Producer error, consumer mati, dan SIGTERM yang diabaikan bisa menunggu exit tanpa eskalasi atau menggantung di `drain` | Abort signal consumer diteruskan ke producer/GDAL; penghentian guardian diikuti SIGKILL setelah 3 detik; close/error membatalkan drain dengan cleanup listener |
| Sedang | Timeout tool dapat dimulai ulang per batch, khususnya saat inspeksi sebelum enqueue | `deadlineMs` absolut dipakai worker, inspeksi API, dan runner; sisa waktu dihitung setiap tool dimulai |
| Sedang | Error create/write intermediate dapat menjadi unhandled stream error | `finished()` dipasang sejak file dibuka, error ditangkap, partial intermediate dihapus |
| Sedang | Validasi nama atribut/native collision hanya memakai 100 field tampilan | Inspeksi mempertahankan `allFields`; planner dan validasi worker memakai schema lengkap |
| Sedang | `tileMs` memasukkan durasi normalisasi pada delivery file; streaming melaporkan `normalizeMs=0` | Timing file dipisahkan; timing producer stream diisi. Pada streaming, normalize/consumer memang overlap dan tidak boleh dijumlahkan sebagai wall time |
| Sedang | Fallback `TOOL_MISSING` dapat salah menganggap producer GDAL yang hilang sebagai Tippecanoe yang hilang | Fallback engine dibatasi ke error startup `Cannot start tippecanoe:` pada Density |
| Rendah | API menerima `.geojsonl`, tetapi file picker utama belum menerimanya | Allowlist file picker disamakan dengan API |
| Sedang | Dua integration assertion meminta presisi yang berbeda dari konfigurasi output aktual | Uji normalisasi memakai toleransi 9 desimal; uji geometri memakai decode integer tile dan toleransi satu unit grid, menghindari pembulatan output geografis decoder |

`src/spike-parser.ts` sekarang mengarah ke parser produksi, sehingga pengujian spike tidak lagi memvalidasi implementasi lama yang berbeda.

## Perilaku adapter tahap 4

| Input/driver aktual | Mode `on` | Mode `auto` | Pembacaan normalisasi |
| --- | --- | --- | --- |
| GeoJSON / GeoJSONL | Batch | Batch | Preflight, kemudian batch direct/reproyeksi |
| `.gpkg` / `GPKG` | Batch | Batch | Satu `ogr2ogr` sequential |
| `.fgb` / `FlatGeobuf` | Batch | Batch | Satu `ogr2ogr` sequential |
| `/vsizip/...zip` / `ESRI Shapefile` | Batch | Batch | Satu `ogr2ogr` sequential |
| KML / LIBKML | Ditolak | Legacy dengan alasan fallback | Reader belum memenuhi target memori |
| Ekstensi sesuai tetapi driver berbeda/tidak memenuhi syarat | Ditolak | Legacy dengan alasan fallback | Tidak menganggap ekstensi sebagai bukti driver |

Adapter baru berada di `vector-adapter.ts` (reference path: `src/vector-adapter.ts`). Pemilihan layer tetap mengikuti hasil inspeksi; GPKG multilayer memerlukan pilihan layer. ZIP harus dapat dibuka GDAL sebagai dataset Shapefile; arsip dengan struktur direktori yang tidak dapat dikenali tidak diperbaiki/diekstrak otomatis.

Pada delivery `stream`, OGR menulis GeoJSONSeq ke kanal stdout khusus; record dibaca dengan batas ukuran dan dikirim dengan backpressure ke stdin satu Tippecanoe. Pada delivery `file`, record yang sama ditulis ke intermediate sebelum satu Tippecanoe dijalankan. Batch output tidak memicu pembacaan ulang OGR atau pagination `OFFSET`.

Integration test memaksa ukuran batch 3 pada dataset 12 feature untuk memastikan empat batch tetap memakai satu invokasi OGR dan satu Tippecanoe. Hasil file/stream dibandingkan melalui decode, termasuk atribut `id`, kode string dengan nol di depan, reproyeksi, dan pemilihan layer. Native field ID tidak dinomori ulang oleh TileO. Format seperti DBF/Shapefile tetap memiliki keterbatasan atributnya sendiri sebelum data masuk pipeline.

## Benchmark pembacaan driver

Reproduksi: `npm run build`, lalu `node dist/batch-adapter-benchmark.js` di Linux yang menyediakan `/usr/bin/time`. Script membuat direktori privat sementara dan mempertahankan `report.json` serta fixture untuk diperiksa; ia tidak mengubah data aplikasi.

Dataset sintetis point, atribut string 128 karakter, ukuran 5.000 dan 50.000 feature. Angka peak RSS berasal dari `/usr/bin/time` pada tool, bukan total RAM seluruh aplikasi. GDAL membuka driver bawaan lingkungan di atas. Ini bukti terbatas pada fixture/versi yang diuji, bukan jaminan semua sumber driver tersebut menggunakan memori konstan.

| Driver | Inspeksi 5k / 50k (MiB) | Normalisasi 5k / 50k (MiB) | Normalisasi 50k (detik) |
| --- | --- | --- | --- |
| GPKG | 60,92 / 60,98 | 64,19 / 64,65 | 0,16 |
| FlatGeobuf | 58,79 / 58,70 | 62,13 / 61,70 | 0,16 |
| ZIP Shapefile | 60,47 / 60,94 | 63,91 / 64,21 | 0,19 |
| LIBKML | 72,44 / 237,49 | 76,04 / 237,89 | 0,54 |

Perubahan 10 kali jumlah feature menunjukkan baseline reader GPKG/FGB/Shapefile relatif stabil pada fixture ini, sedangkan LIBKML menahan state yang tumbuh bersama dataset. Karena itu KML tidak diaktifkan sebagai adapter batch. LIBKML adalah driver KML yang benar-benar terpasang dan diuji; driver `KML` alternatif belum dikualifikasikan terpisah. Dokumentasi driver tersedia pada [GDAL LIBKML](https://gdal.org/en/stable/drivers/vector/libkml.html) dan [GDAL FlatGeobuf](https://gdal.org/en/stable/drivers/vector/flatgeobuf.html).

## Benchmark GeoJSON besar dan kesetaraan output

Input single-line sintetis: **541.610.931 byte (516,52 MiB), 250.000 point**, atribut payload 2.048 karakter. Preflight terpisah memakai heap maksimum 153 MiB: **2,97 detik, peak RSS 81,34 MiB**.

Perbandingan end-to-end memakai input yang sama, Density z0–5, dua thread, dan tmpfs Linux yang sama. Waktu mencakup inspeksi, normalisasi, tiling, dan validasi dasar. `/usr/bin/time` melaporkan maksimum RSS proses yang diamati, bukan jumlah RSS semua proses yang hidup bersamaan.

| Mode | Inspeksi | Total pipeline | Maksimum RSS `/usr/bin/time` | Intermediate penuh |
| --- | --- | --- | --- | --- |
| `off` / file | 0,77 dtk | 8,97 dtk | 708,82 MiB | Ada |
| `on` / file | 3,06 dtk | 13,06 dtk | 708,70 MiB | Ada |
| `on` / stream | 3,03 dtk | 12,81 dtk | 709,05 MiB | Tidak ada |

Kedua mode batch mengirim **250.000 feature dalam 33 batch**, sebanyak **541.610.890 byte** setelah serialisasi record. Peak total tree yang sempat disampling guardian stream adalah sekitar **676,42 MiB**; sampling tidak selalu menangkap puncak sesaat. Memori tiling Tippecanoe masih mendominasi: batching tidak terbukti menurunkan peak RAM keseluruhan pada fixture ini, dan menambah sekitar 4 detik waktu total.

Ketiga hasil berukuran **356.352 byte**, memiliki **6 tile**, zoom 0–5, serta source count 250.000. SHA-256 gabungan koordinat tile dan seluruh payload tile, diurutkan `(z,x,y)`, identik:

```text
f5c1364485567c869e0aed4fb38b389d0e1e3035db099b2d9ffc1bf91e84d580
```

Hash file MBTiles berbeda karena metadata/commandline berbeda; perbandingan di atas memeriksa seluruh payload tile. Kesetaraan ini berlaku untuk fixture tersebut; Density/clustering secara umum tidak menjanjikan seluruh feature sumber tampil pada setiap zoom.

Reproduksi pipeline: `node dist/batch-vector-benchmark.js <input.geojson> off file`, lalu `on file` dan `on stream`. Fixture besar dibuat script benchmark adapter. Script pipeline mempertahankan output dan report dalam direktori privat baru.

**Batas pengukuran scratch:** sampling direktori melihat sekitar 522 MiB pada legacy, 517 MiB pada batch/file, dan kurang dari 1 MiB pada batch/stream. Angka stream itu hanya file yang terlihat; temporary file Tippecanoe yang sudah di-unlink tetapi masih terbuka tidak terhitung. Angka tersebut tidak boleh diklaim sebagai peak disk aktual. Free-space reserve tetap dipantau worker, tetapi accounting scratch ini masih best effort.

## Evaluasi checkpoint normalisasi

Keputusan tahap 4: **belum mengaktifkan resume/checkpoint persisten**. Satu pemindaian sequential OGR dan batching bounded sudah dapat dijalankan tanpa mengubah kontrak retry. Retry tetap attempt baru yang membaca input asli; scratch attempt dibersihkan oleh worker.

Checkpoint layak dikerjakan sebagai fitur lanjutan setelah ada kebutuhan pengulangan normalisasi yang terukur. Kontrak minimal yang dibutuhkan:

1. Manifest atomik berisi hash input, layer, schema, CRS efektif, pilihan atribut, parameter normalisasi, versi parser/GDAL, serta ukuran/hash setiap chunk.
2. Hanya chunk yang sudah ditutup dan diverifikasi boleh dianggap selesai; chunk parsial tidak digunakan ulang.
3. Pemilik checkpoint terpisah dari direktori attempt yang sekarang selalu dibersihkan; kebijakan kuota, retensi, lease, delete job, dan orphan cleanup harus ditetapkan.
4. Checkpoint hanya melanjutkan hasil normalisasi. Satu proses Tippecanoe tetap harus dimulai ulang dan menerima seluruh feature setelah crash; stdin yang sudah dikirim tidak dapat dipulihkan begitu saja.
5. Cache dibatalkan jika hash input, opsi, layer/schema, atau versi normalisasi berubah. Jangan memakai nomor batch saja sebagai identitas.

Tidak ada perubahan lifecycle/retensi untuk checkpoint pada implementasi ini. Evaluasi dan keputusan tersebut memenuhi butir evaluasi checkpoint tahap 4; implementasi resume merupakan pekerjaan berikutnya.

## Hasil verifikasi dan gate yang tersisa

- `npm run typecheck` dan `npm run build`: lulus.
- Seluruh **25 file pengujian** dijalankan dalam proses terpisah dengan `TILEO_INTEGRATION=1` dan `--test-isolation=none` di setiap file agar detail assertion terlihat pada lingkungan ini: **88 test lulus, 1 gagal, 0 skip**.
- Satu kegagalan adalah `src/tests/api.test.ts`: sandbox menolak `listen(127.0.0.1)` dengan `EPERM`. Kegagalan yang sama sudah ada pada baseline sebelum perubahan. `batch-api.test.ts` (reference path: `src/tests/batch-api.test.ts`) menguji inspeksi, JSONL, reuse inspection, dan penolakan input melalui Fastify injection tanpa membuka port.
- Pengujian guardian mencakup backpressure, stdout/stderr besar, error producer/consumer, consumer mati, timeout, SIGTERM yang diabaikan, dan worker yang dibunuh paksa. Tidak ada orphan native tool pada uji worker death.
- Integration tool nyata mencakup adapter baru, selected layer GPKG, reproyeksi GeoJSON per batch, integer besar, atribut dengan tipe campuran, ID sumber, polygon holes, geometry grid, serta pipeline raster/elevation yang sudah ada.

Gate produksi yang **belum** terpenuhi: browser E2E dengan API hidup, Docker runtime, Windows/macOS, dan dataset polygon/line kompleks yang representatif pada ukuran besar. Dataset besar pada audit ini adalah point sintetis. OS/container hard limit tetap diperlukan; sampling memori/disk bukan quota kernel. Default batch tetap `off`; operator dapat memilih `on`/`auto` secara eksplisit untuk deployment yang sudah diuji.

Catatan observabilitas: `peakMemoryBytes` nullable jika job lebih pendek dari interval sampling; peak directory scratch belum menghitung open-unlinked files; summary final disimpan untuk job yang berhasil. Job gagal mengandalkan log/code/stage dan belum menyimpan ringkasan batch parsial lengkap.

Catatan audit tahap 0: versi GDAL dalam Docker tidak dipin ke versi runtime persis karena image memasang paket `gdal-bin` dari apt. Daftar versi Dockerfile bukan bukti binary container yang sudah diverifikasi. Simpan digest image dan hasil doctor container pada deployment.


---

**Snapshot note:** This founding documentation describes the TileO Clean 4 implementation baseline. Actual commands, integrations, drivers, versions, test results and release images must be verified when code is imported. See [Technical baseline](TECHNICAL_BASELINE.md) and [Release policy](RELEASE_POLICY.md).
