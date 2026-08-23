# LARIS — Katalog UMKM Jati Kulon

Web katalog UMKM binaan **BUMDes Desa Jati Kulon**, Kec. Jati, Kab. Kudus.
Pemesanan tidak lewat checkout: tiap produk punya tombol yang membuka WhatsApp
ke nomor pemilik usaha dengan pesan yang sudah terisi.

> Tagline: *Guyub UMKM, laris berkah*

---

## Status pengerjaan

| Tahap | Isi | Status |
|---|---|---|
| 1 | Scaffold React + Vite + Tailwind dengan token warna & font kustom | selesai |
| 2 | Skema Supabase (tabel, RLS, storage, data contoh) | selesai — SQL siap dijalankan |
| 3 | Halaman publik: Beranda, Katalog, Detail UMKM, Profil BUMDes | selesai (jalan dengan data dummy) |
| 4 | Panel admin (login, dashboard, CRUD UMKM & produk, profil BUMDes) | selesai |

Selama `.env` belum diisi, aplikasi otomatis memakai data contoh di
`src/data/dummy.js`, jadi tampilan tetap bisa dicek tanpa backend. Penanda
"mode data contoh" muncul di footer saat itu terjadi.

Panel admin pun ikut aturan yang sama: tanpa `.env`, panel terbuka **tanpa
login** dalam mode contoh (ada pita peringatan merah di atas layar) dan setiap
perubahan hanya hidup di memori sampai halaman dimuat ulang. Begitu `.env`
terisi, login Supabase langsung berlaku dan mode itu mati sendiri.

---

## Menjalankan di komputer sendiri

Butuh Node.js 18 atau lebih baru.

```bash
npm install
npm run dev          # buka http://localhost:5173
```

Perintah lain:

```bash
npm run build        # hasil produksi masuk ke folder dist/
npm run preview      # mencoba hasil build secara lokal
```

### Menyambungkan ke Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan berurutan isi folder `supabase/`:
   `schema.sql` → `rls.sql` → `storage.sql` → (opsional) `seed.sql` untuk data contoh.
3. Salin `.env.example` menjadi `.env`, lalu isi dari **Project Settings → API**:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

4. Jalankan ulang `npm run dev`. Aplikasi otomatis pindah dari data dummy ke Supabase.

`.env` tidak pernah ikut ter-commit dan tidak ikut di dalam zip — isi ulang tiap
kali menerima kiriman project baru.

---

### Membuat akun admin

Panel admin dipakai satu akun saja (pengurus BUMDes). Akunnya dibuat manual di
dasbor Supabase, bukan lewat halaman pendaftaran:

1. Buka **Authentication → Users → Add user**, isi email dan kata sandi,
   centang *Auto Confirm User*.
2. Buka **Authentication → Sign In / Providers → Email**, lalu **matikan**
   opsi pendaftaran mandiri (*Allow new users to sign up*).

Langkah kedua itu bukan hiasan. Kebijakan RLS di proyek ini memberi akses tulis
penuh kepada siapa pun yang berstatus `authenticated` — sesuai spesifikasi,
karena hanya ada satu akun. Kalau pendaftaran mandiri dibiarkan menyala, orang
asing bisa membuat akun sendiri lalu ikut punya izin mengubah data katalog.

Lupa kata sandi diselesaikan lewat menu Users yang sama (**Reset password**).

---

## Alur kerja admin sehari-hari

| Tugas | Tempatnya |
|---|---|
| Menambah usaha baru | UMKM & Produk → Tambah UMKM |
| Menyembunyikan usaha sementara | UMKM & Produk → Nonaktifkan (data tidak dihapus) |
| Menyorot usaha di beranda | UMKM & Produk → tombol panah ↑ pada barisnya |
| Menambah/menyunting produk | UMKM & Produk → Kelola → bagian Produk |
| Menandai produk kosong | tombol Tandai habis (bukan Hapus) |
| Menambah kategori | UMKM & Produk → panel Kategori usaha |
| Mengubah sambutan/visi/misi | Profil BUMDes |

Beranda menampilkan 6 UMKM dan 8 produk teratas berdasarkan kolom `urutan` —
tidak ada penanda "unggulan" terpisah, jadi cukup satu konsep yang perlu
diingat admin.

Foto yang diunggah dikompresi dulu di peramban (maksimal sisi terpanjang
1400 px, target ±400 KB) sebelum dikirim ke Supabase Storage. Ukuran sebelum
dan sesudah ditampilkan supaya admin tahu prosesnya berjalan.

---

## Struktur folder

```
laris-jati-kulon/
├── src/
│   ├── components/
│   │   ├── ui/            komponen dasar sistem desain (Tombol, Papan, Foto, Label, ...)
│   │   ├── ProdukCard.jsx
│   │   ├── UmkmCard.jsx
│   │   ├── KategoriChip.jsx
│   │   ├── Header.jsx / Footer.jsx / TataLetak.jsx / PitaJudul.jsx
│   │   └── admin/         TataLetakAdmin, RuteAdmin, Isian, UnggahFoto, Notifikasi, Konfirmasi
│   ├── pages/public/      Beranda, Katalog, DetailUmkm, ProfilBumdes, TidakDitemukan
│   ├── pages/admin/       Login, Dashboard, KelolaUmkm, EditUmkm, KelolaProfilBumdes
│   ├── lib/               supabase.js, api.js, adminApi.js, auth.js, whatsapp.js, format.js
│   ├── data/dummy.js      data contoh (bentuknya sama dengan tabel Supabase)
│   ├── config/site.js     nama aplikasi, tagline, template pesan WA
│   └── styles/tokens.css  seluruh token warna, font, dan tekstur
├── supabase/              schema.sql, rls.sql, storage.sql, seed.sql
├── netlify.toml
└── .env.example
```

Aturan penting: **komponen tidak memanggil Supabase langsung.** Pembacaan data
lewat `src/lib/api.js`, penulisan lewat `src/lib/adminApi.js` — perpindahan
sumber data cukup diubah di dua berkas itu.

Kode panel admin dimuat terpisah (lazy loading), jadi pengunjung katalog tidak
ikut mengunduh berkas admin beserta pustaka kompresi gambarnya.

---

## Sistem desain

Token warna dan font ada di `src/styles/tokens.css` dan dipetakan ke Tailwind
lewat `tailwind.config.js`. Palet bawaan Tailwind sengaja **dihapus** (bukan
di-extend), jadi kelas seperti `bg-blue-500` tidak akan berfungsi — ini
mencegah warna di luar palet masuk tanpa sengaja.

| Token | Hex | Pemakaian |
|---|---|---|
| `wood-dark` | `#3E2A1E` | teks utama, header, latar gelap |
| `wood-mid` | `#8B5E34` | border, elemen sekunder |
| `parchment` | `#EDE2CF` | latar terang utama |
| `indigo` | `#2E4057` | aksen tunggal: tombol, tautan, harga |
| `indigo-soft` | `#4A5D75` | hover, tombol sekunder |
| `ivory` | `#F7F2E7` | teks di atas latar gelap |
| `status-ok` | `#4F7942` | status "tersedia" |
| `status-habis` | `#A34A28` | status "habis" |

Token turunan (`wood-deep`, `parchment-deep`, `parchment-light`, `indigo-deep`,
`wood-soft`) hanya versi lebih gelap/terang dari warna yang sama — tidak ada
hue baru yang bersaing dengan aksen indigo.

Font: **Ultra** (judul, dipakai terbatas), **Work Sans** (teks), **Caveat**
(label harga/kategori, meniru papan harga tulis tangan).

---

## Aset yang perlu disiapkan sendiri

Folder aset sengaja kosong. Siapkan di tempat terpisah supaya gampang ditaruh
ulang tiap kali menerima project baru:

- Logo BUMDes
- Foto tiap UMKM dan produknya
- Nomor WhatsApp asli tiap UMKM (format `62...`, tanpa `+` dan tanpa `0` depan)
- Teks sambutan, visi, dan misi BUMDes

Selama foto belum ada, kartu menampilkan bidang bermotif kawung dengan inisial
usaha, bukan gambar rusak.

---

## Deployment (Netlify)

`netlify.toml` sudah menyetel `base = "laris-jati-kulon"` karena project ini
berada di subfolder repositori. Isi `VITE_SUPABASE_URL` dan
`VITE_SUPABASE_ANON_KEY` di **Site settings → Environment variables**, dan pakai
nama site custom (mis. `laris-jati-kulon`) sejak awal.
