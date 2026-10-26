# Meowmory — Next.js + TypeScript

Starter project baru yang siap dipasang dependency dan dijalankan.

## Fitur yang sudah dibuat
- `/`: peta Leaflet, tab All / My Cat, card kucing, pilih card untuk fokus peta, klik marker untuk memilih kucing, tombol lokasi perangkat, tombol Take cat photo.
- `/cats/new`: kamera perangkat (jika didukung browser), upload foto, preview/hapus foto, nama kucing opsional, GPS otomatis dan read-only, simpan catatan.
- Penyimpanan sementara di IndexedDB browser.
- Data demo ditampilkan di peta agar tampilan tidak kosong.

## Yang belum terintegrasi
Supabase, Prisma, Gemini API, Google login, dan magic link sengaja belum dibuat. Login masih placeholder, sehingga `My Cat` menganggap semua catatan yang dibuat di browser ini sebagai milik pengguna lokal.

## Cara menjalankan
1. Ekstrak ZIP.
2. Buka folder `meowmory-project` di VS Code.
3. Buka terminal di folder itu.
4. Jalankan `npm install`.
5. Jalankan `npm run dev`.
6. Buka `http://localhost:3000`.

## Kamera dan GPS
Browser meminta izin kamera/lokasi. Fitur tersebut biasanya berjalan di HTTPS atau `localhost`. Tombol kamera memakai input file `capture="environment"`, jadi perilakunya bergantung pada browser dan perangkat. Tombol Upload selalu tersedia sebagai alternatif.

## Data lokal
Foto dan catatan disimpan di IndexedDB pada browser/perangkat yang sama. Membersihkan data browser bisa menghapus data tersebut. Ini bukan database online dan tidak menyinkronkan data antarpengguna.

## Catatan teknis
- Peta memakai OpenStreetMap; perhatikan kebijakan tile server saat deployment.
- Koordinat yang disimpan adalah koordinat GPS saat halaman form mengambil lokasi, bukan metadata EXIF dari file foto.
- Jika GPS ditolak/tidak tersedia, aplikasi tidak menyimpan lokasi palsu.
"# MeowMory" 
"# MeowMory" 
"# MeowMory" 
# MeowMory
# MeowMory
# MeowMory
