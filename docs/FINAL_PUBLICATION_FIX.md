# Tutup audit publikasi sebelum dry run baru

Perbaikan ini menutup temuan source yang sebelumnya belum tersimpan:
- Assembly sembilan assets dan SHA256SUMS memakai satu CLI, diuji saat candidate.
- Assets final divalidasi sebelum push tag.
- Verifikasi manifest/pull GHCR memakai konfigurasi Docker kosong (anonim).
- Config digest registry dicocokkan langsung dengan image kandidat.
- Diagnostik candidate disimpan juga untuk kegagalan tahap akhir.
- Identitas tag bot diperiksa sebelum build panjang.

## Langkah berikut

1. Erick review PR ini dan merge setelah checks wajib lulus.
2. Dony melalui App menjalankan publish=false dari main hasil merge.
3. Dony Engineering → Erick Legal/IP → Dony Steward memberi review asli.
4. Dony memvalidasi proof dari checkout commit dry run tersebut.
5. Setelah siap publikasi, App memulai publish=true pada commit yang sama,
   push_latest=false, negative_proof_run_id=ID_PROOF_BARU.
6. Ketiga peran memberi approval baru untuk kandidat produksi baru.
7. Pastikan receipt akhir PUBLISHED_VERIFIED; simpan raw evidence/checksum.

Package test lama sudah dihapus. Package baru dapat default private: Erick
harus siap mengatur visibility Public setelah push yang sah. Jika verifikasi
anonim sudah gagal, simpan partial receipt; periksa keadaan publik dan lakukan
verifikasi terpisah terhadap kandidat yang sama. Jangan langsung rebuild atau
menghapus tag/Release. Pemeriksaan anonim tidak boleh dilonggarkan.

## Pemeriksaan lokal

SA01–SA06 dan dua regresi CLI staging: 8 pass. CA, final-SBOM dan validator
proof: exit 0. YAML/Bash dan urutan staging → tag → Release → source anonim →
image push diperiksa. Sintaks CLI staging/verifier lulus.
Log lokal: /tmp/tileo-final-publication-audit-results, beserta checksums.json.
Percobaan sandbox awal ditolak EPERM untuk tar; percobaan host lulus.

Tidak menjalankan Docker atau publikasi dalam audit ini. Tes menggunakan
fixture terlabel; bukan bukti release kandidat. Kandidat/image, approval nyata,
izin publish, jaringan publik dan anonymous pull aktual tetap wajib diuji.
