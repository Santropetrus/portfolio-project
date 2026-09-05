# The Matcha Kyoto Ops

> Kelola stok, strategi, dan pertumbuhan bisnis dalam satu tempat.

Aplikasi internal untuk **The Matcha Kyoto**: mengelola stok bahan baku, stok
opname, dan jejak perubahan stok dalam satu dashboard.

Dibangun dengan **Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 ·
Supabase (PostgreSQL + Auth + RLS) · React Hook Form + Zod**.

---

## Status: Tahap 1 selesai

Yang sudah berjalan:

| Area | Isi |
| --- | --- |
| Fondasi | Next.js App Router, TypeScript strict, Tailwind v4, sistem desain merek |
| Autentikasi | Login/logout Supabase Auth, proteksi rute, redirect sesuai status login |
| Role | `owner`, `admin`, `staff` — ditegakkan di server **dan** di database |
| Database | 6 tabel, 3 enum, trigger audit, RLS penuh, RPC opname atomik |
| Inventori | Daftar bahan, cari, filter kategori & status, paginasi, CRUD owner/admin |
| Stok opname | Pilih bahan → stok sistem → stok fisik → selisih otomatis → simpan atomik |
| Riwayat stok | Jejak `masuk` / `keluar` / `penyesuaian`, append-only |
| Pengaturan | Profil, info organisasi, daftar anggota, audit log (owner/admin) |
| Seed | Data demo opsional 21 bahan baku |

---

## 1. Arsitektur dan asumsi

### Prinsip utama

**Otorisasi hidup di database, bukan di UI.** Tombol yang disembunyikan hanyalah
kenyamanan. Setiap operasi melewati tiga lapis:

1. **Proxy** (`src/proxy.ts`) — mengalihkan pengunjung sesuai status login.
   Ini lapisan kenyamanan, **bukan** batas keamanan.
2. **Server** (`src/lib/auth/session.ts`) — `wajibSesi()` / `wajibManajer()`
   berjalan di setiap Server Component dan Server Action.
3. **Database** (Row Level Security) — lapisan terakhir. Sekalipun lapisan 1
   dan 2 ditembus, PostgreSQL tetap menolak operasi yang tidak sah.

### Keputusan teknis dan alasannya

| Keputusan | Alasan |
| --- | --- |
| **Tidak ada Supabase client di browser.** Semua query lewat Server Component / Server Action. | Cookie sesi bisa `httpOnly`, jadi access token tidak pernah terbaca JavaScript. Satu bug XSS tidak otomatis berarti sesi tercuri. |
| **Service role key tidak dipakai sama sekali di Tahap 1.** | Kunci itu melewati seluruh RLS. Selama tidak dibutuhkan, tidak perlu ada di runtime aplikasi. |
| **`stock_transactions` dan `audit_logs` append-only.** Tidak ada policy INSERT/UPDATE/DELETE untuk klien; keduanya hanya ditulis trigger `SECURITY DEFINER`. | Riwayat stok dan jejak audit tidak bisa dipalsukan maupun dihapus dari aplikasi, bahkan oleh owner. |
| **`organization_id` selalu diambil dari profil sesi, tidak pernah dari input klien.** | Menutup kemungkinan menulis data ke organisasi lain dengan memanipulasi payload. |
| **User baru SELALU dibuat dengan role `staff`.** Role tidak pernah dibaca dari user metadata. | Metadata bisa dikendalikan saat sign-up — membacanya akan jadi celah privilege escalation. Owner pertama ditetapkan manual (lihat §5). |
| **`status_stok` adalah generated column di database.** | Definisi "aman / menipis / habis" hanya ada di satu tempat, jadi UI, filter, dan laporan tidak mungkin berbeda. |
| **`selisih` pada `stock_opnames` juga generated column.** | Nilainya dihitung database, tidak bisa dikirim dari klien. |
| **Stok opname lewat satu fungsi database (`catat_stok_opname`).** | Kunci baris → catat opname → perbarui stok → tulis riwayat → tulis audit, semuanya dalam satu transaksi. Gagal di tengah = tidak ada perubahan tersisa. |
| **Satu skema Zod dipakai di client dan server.** | Validasi client untuk pengalaman pengguna; server memvalidasi ulang karena payload dari klien tidak pernah dipercaya. |

### Asumsi yang diambil

Tiga hal ini tidak disebutkan eksplisit di kebutuhan, jadi dipilih opsi paling
aman. Semuanya mudah dilonggarkan pada tahap berikutnya:

1. **Staff tidak dapat mencatat stok opname**, hanya melihat hasilnya.
   Kebutuhan menyebut staff "hanya dapat melihat stok". Karena stok opname
   *mengubah* stok, aksesnya dibatasi ke owner/admin. Tahap 2 bisa menambah
   alur "staff mengajukan → manajer menyetujui".
2. **Perubahan role dilakukan lewat SQL Editor**, belum lewat antarmuka.
   Trigger `guard_profile_changes()` sudah menegakkan aturannya (hanya owner,
   dalam organisasi yang sama, tidak boleh mengubah role sendiri, organisasi
   harus punya minimal satu owner aktif). UI-nya masuk Tahap 2.
3. **Pendaftaran mandiri dinonaktifkan.** Akun dibuat owner lewat dashboard
   Supabase. Aplikasi internal tidak butuh halaman daftar publik.

### Alur data satu permintaan

```
Browser
  │  (cookie sesi httpOnly)
  ▼
src/proxy.ts ──── CSP nonce + refresh sesi + redirect rute
  │
  ▼
Server Component / Server Action
  │  wajibSesi() / wajibManajer()   ← cek sesi + role di server
  │  skema Zod .safeParse()          ← validasi ulang payload
  ▼
Supabase client (anon key, cookie sesi)
  │
  ▼
PostgreSQL
     Row Level Security               ← otorisasi final
     Trigger SECURITY DEFINER         ← riwayat stok + audit log otomatis
```

---

## 2. Struktur folder

```
.
├── .env.example                   Contoh environment variable
├── next.config.ts                 Header keamanan statis
├── eslint.config.mjs
├── postcss.config.mjs
├── tsconfig.json
│
├── supabase/
│   ├── migrations/
│   │   ├── 20260101000000_init_schema.sql        Enum, tabel, indeks, updated_at
│   │   ├── 20260101000100_functions_triggers.sql Helper RLS, audit, RPC opname
│   │   └── 20260101000200_rls_policies.sql       RLS + grant tabel
│   ├── seed.sql                   Data demo opsional (21 bahan baku)
│   └── tests/
│       └── rls_checks.sql         10 kelompok uji keamanan database
│
└── src/
    ├── proxy.ts                   CSP nonce, refresh sesi, proteksi rute
    │
    ├── app/
    │   ├── layout.tsx             Font, metadata, penyedia toast
    │   ├── globals.css            Token desain Tailwind v4
    │   ├── page.tsx               Redirect sesuai status login
    │   ├── error.tsx              Kondisi error global
    │   ├── not-found.tsx
    │   ├── masuk/                 Halaman login
    │   └── (dashboard)/
    │       ├── layout.tsx         Penjaga sesi + kerangka aplikasi
    │       ├── loading.tsx        Kondisi memuat
    │       ├── error.tsx          Kondisi error per halaman
    │       ├── dashboard/         Ringkasan, perlu perhatian, aktivitas
    │       ├── inventori/         Tabel, cari, filter, CRUD
    │       ├── stok-opname/       Form opname + riwayat
    │       ├── riwayat-stok/      Jejak perubahan stok
    │       └── pengaturan/        Profil, organisasi, anggota, audit log
    │
    ├── components/
    │   ├── brand/logo.tsx
    │   ├── layout/                Sidebar, kerangka aplikasi, navigasi
    │   ├── ui/                    Button, field, card, badge, dialog, toast, …
    │   ├── dashboard/
    │   ├── inventori/
    │   ├── opname/
    │   └── pengaturan/
    │
    ├── lib/
    │   ├── env.ts                 Validasi environment variable (Zod)
    │   ├── constants.ts           Kategori, label role, status stok
    │   ├── utils.ts               Format rupiah, angka, tanggal
    │   ├── query.ts               Pengamanan pola pencarian & parameter URL
    │   ├── supabase/              Client server & proxy, opsi cookie
    │   ├── auth/                  Sesi, penjaga role, rate limit, hasil aksi
    │   └── validation/            Skema Zod bersama (client + server)
    │
    ├── server/actions/            Server Action: auth, inventori, opname, profil
    └── types/database.ts          Tipe tabel database
```

---

## 3. Membuat proyek Supabase

1. Buka [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Isi nama proyek, kata sandi database (simpan di password manager), dan pilih
   region terdekat — untuk Indonesia biasanya **Southeast Asia (Singapore)**.
3. Tunggu proyek selesai disiapkan (1–2 menit).
4. Masuk ke **Project Settings → API**, catat:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   Kunci `anon` aman diekspos ke browser karena selalu tunduk pada RLS.
   Kunci **service_role** tidak dibutuhkan Tahap 1 — jangan disalin ke mana pun.

5. Masuk ke **Authentication → Providers → Email** dan **matikan
   "Enable sign ups"**. Aplikasi ini internal; akun dibuat oleh owner.

---

## 4. Environment variables

```bash
cp .env.example .env.local
```

Isi `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key dari dashboard>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Sisanya opsional (batas rate limit login). `SUPABASE_SERVICE_ROLE_KEY`
biarkan kosong — Tahap 1 tidak memakainya.

`.env.local` sudah masuk `.gitignore`. Jangan pernah di-commit.

> Aplikasi menolak start bila `NEXT_PUBLIC_SUPABASE_URL` atau
> `NEXT_PUBLIC_SUPABASE_ANON_KEY` kosong/tidak valid — lihat `src/lib/env.ts`.

---

## 5. Menjalankan migration

### Cara A — SQL Editor (paling cepat)

Buka **SQL Editor** di dashboard Supabase, lalu jalankan berkas berikut
**berurutan**, satu per satu:

1. `supabase/migrations/20260101000000_init_schema.sql`
2. `supabase/migrations/20260101000100_functions_triggers.sql`
3. `supabase/migrations/20260101000200_rls_policies.sql`

Urutannya penting: policy pada berkas ke-3 memakai fungsi dari berkas ke-2.

### Cara B — Supabase CLI

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

### Seed data demo (opsional)

Untuk mengisi 21 bahan baku contoh (matcha, susu, sirup, topping, kemasan,
sedotan, bahan pendukung) dengan campuran status aman/menipis/habis:

```
Jalankan supabase/seed.sql di SQL Editor.
```

Aman dijalankan berulang kali. Seed **tidak** membuat user.

---

## 6. Membuat user pertama dan menetapkan role owner

Semua user baru otomatis mendapat role `staff`. Ini disengaja: role tidak
pernah dibaca dari data yang bisa dikendalikan saat pendaftaran. Owner pertama
harus ditetapkan lewat jalur administratif.

**Langkah 1 — buat user.**
Dashboard Supabase → **Authentication → Users → Add user → Create new user**.
Isi email dan kata sandi, centang **Auto Confirm User**.

Trigger `on_auth_user_created` otomatis membuat baris di `public.profiles`
dengan role `staff` dan menautkannya ke organisasi `the-matcha-kyoto`.

**Langkah 2 — naikkan menjadi owner.** Di **SQL Editor**:

```sql
update public.profiles
set role = 'owner'
where id = (select id from auth.users where email = 'email-anda@contoh.com');
```

**Langkah 3 — verifikasi:**

```sql
select u.email, p.nama, p.role, p.is_active, o.nama as organisasi
from public.profiles p
join auth.users u on u.id = p.id
join public.organizations o on o.id = p.organization_id;
```

**Menambah anggota tim.** Ulangi Langkah 1, lalu (sebagai owner) tetapkan
rolenya:

```sql
update public.profiles set role = 'admin'   -- atau tetap 'staff'
where id = (select id from auth.users where email = 'admin@contoh.com');
```

Aturan yang ditegakkan database saat mengubah role:

- Hanya **owner** yang boleh mengubah `role`, `organization_id`, atau `is_active`.
- Owner tidak boleh mengubah role akunnya sendiri (mencegah terkunci sendiri).
- Organisasi harus selalu punya minimal satu owner aktif.
- Setiap perubahan tercatat di `audit_logs` sebagai `profile.update_sensitive`.

**Menonaktifkan anggota** (tanpa menghapus jejaknya):

```sql
update public.profiles set is_active = false where id = '<uuid-user>';
```

User nonaktif langsung kehilangan akses: fungsi helper RLS mengembalikan
`NULL`, sehingga semua policy gagal, dan login ditolak dengan pesan yang jelas.

---

## 7. Menjalankan aplikasi

```bash
npm install
npm run dev          # http://localhost:3000
```

Perintah lain:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # build produksi
npm run start        # menjalankan hasil build
```

> **Catatan saat `npm run build && npm run start` di lokal:** CSP produksi
> memuat `upgrade-insecure-requests`, sehingga browser memaksa semua permintaan
> ke HTTPS. Di `http://localhost` sebagian aset bisa gagal dimuat. Ini normal
> dan tidak terjadi di `npm run dev` maupun pada deployment HTTPS sungguhan.

### Cek cepat setelah pertama kali jalan

1. Buka `http://localhost:3000` → harus dialihkan ke `/masuk`.
2. Login dengan akun owner → harus mendarat di `/dashboard`.
3. Buka `/inventori` → bila seed dijalankan, terlihat 21 bahan dengan badge
   status aman/menipis/habis.

---

## 8. Checklist pengujian fitur

Jalankan sebagai **owner**, lalu ulangi bagian yang relevan sebagai **staff**.

### Autentikasi dan rute

- [ ] `/` tanpa login → dialihkan ke `/masuk`.
- [ ] `/dashboard` tanpa login → dialihkan ke `/masuk?lanjut=/dashboard`.
- [ ] Login berhasil → mendarat di halaman yang tadi dituju.
- [ ] `/masuk` saat sudah login → dialihkan ke `/dashboard`.
- [ ] Email salah **dan** kata sandi salah menghasilkan pesan yang **sama
      persis** ("Email atau kata sandi salah.") — tidak membocorkan apakah
      email terdaftar.
- [ ] Enam kali login gagal berturut-turut → muncul pesan "Terlalu banyak
      percobaan login".
- [ ] Tombol **Keluar** → kembali ke `/masuk`; menekan tombol *back* browser
      tidak mengembalikan akses ke dashboard.
- [ ] `?lanjut=https://situs-lain.com` diabaikan (tetap ke `/dashboard`).

### Dashboard

- [ ] Empat kartu statistik menampilkan angka yang cocok dengan `/inventori`.
- [ ] "Perlu perhatian" hanya berisi bahan menipis/habis.
- [ ] "Aktivitas terbaru" menampilkan perubahan stok paling akhir.
- [ ] Dengan database kosong, tampil kondisi kosong (bukan error).

### Inventori

- [ ] Tabel tampil dengan badge status yang benar (aman / menipis / habis).
- [ ] Pencarian menemukan bahan berdasarkan nama **dan** supplier.
- [ ] Filter kategori dan filter status bekerja, termasuk bila digabung.
- [ ] Filter tersimpan di URL — muat ulang halaman mempertahankan hasil.
- [ ] Tombol **Reset** membersihkan seluruh filter.
- [ ] Paginasi muncul saat data lebih dari 20 baris.
- [ ] **Tambah bahan** → data muncul di tabel dan di riwayat stok sebagai `masuk`.
- [ ] Menambah nama yang sudah ada (beda huruf besar/kecil) → ditolak dengan
      pesan yang jelas.
- [ ] **Ubah bahan**, ubah stoknya → muncul baris baru di riwayat stok.
- [ ] **Hapus bahan** → muncul dialog konfirmasi; **Batal** tidak menghapus.
- [ ] Notifikasi sukses/gagal muncul untuk setiap aksi.
- [ ] Isian tidak valid (stok negatif, nama 1 huruf, tanggal ngawur) ditolak.
- [ ] Layar sempit menampilkan kartu, bukan tabel yang meluber.

### Stok opname

- [ ] Memilih bahan menampilkan stok sistem yang benar.
- [ ] Mengisi stok fisik menghitung selisih secara langsung.
- [ ] Selisih 0 / positif / negatif menampilkan warna dan pesan berbeda.
- [ ] Menyimpan → stok bahan di `/inventori` ikut berubah.
- [ ] Menyimpan → muncul satu baris `penyesuaian` di `/riwayat-stok`.
- [ ] Menyimpan → muncul entri di riwayat opname dengan catatan.

### Peran staff

- [ ] Staff **tidak** melihat tombol Tambah/Ubah/Hapus di `/inventori`.
- [ ] Staff melihat pesan "Akses terbatas" di `/stok-opname`.
- [ ] Staff **tidak** melihat kartu Audit log di `/pengaturan`.
- [ ] Staff tetap bisa membaca dashboard, inventori, dan riwayat stok.

### Keamanan database

- [ ] Jalankan `supabase/tests/rls_checks.sql` lewat psql; setiap blok
      bertanda "harus GAGAL" memang menghasilkan ERROR, dan setiap blok
      "harus 0" memang mengembalikan 0.

### Aksesibilitas dan responsif

- [ ] Seluruh form bisa dioperasikan dengan keyboard saja.
- [ ] Dialog: `Esc` menutup, fokus terkunci di dalam dialog, dan kembali ke
      pemicunya setelah ditutup.
- [ ] Menu mobile terbuka/tertutup dan menutup sendiri saat berpindah halaman.
- [ ] Tampilan wajar di 390px, 768px, 1280px, dan 1920px.

---

## 9. Checklist keamanan sebelum deployment

### Rahasia dan konfigurasi

- [ ] `.env.local` tidak pernah ter-commit (`git log --all -- .env.local` kosong).
- [ ] Tidak ada rahasia berawalan `NEXT_PUBLIC_` selain URL dan anon key.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` kosong, atau — bila kelak dipakai — hanya
      diakses dari modul bertanda `import 'server-only'`.
- [ ] Environment variable produksi diisi di panel hosting, bukan di repo.
- [ ] Kata sandi database Supabase disimpan di password manager.

### Supabase

- [ ] **Enable sign ups** dimatikan di Authentication → Providers → Email.
- [ ] RLS aktif di enam tabel:
      ```sql
      select tablename, rowsecurity from pg_tables where schemaname = 'public';
      ```
      Semuanya harus `true`.
- [ ] Tidak ada policy tak terduga:
      ```sql
      select tablename, policyname, cmd, roles from pg_policies
      where schemaname = 'public' order by tablename, cmd;
      ```
- [ ] `stock_transactions` dan `audit_logs` **hanya** punya policy `SELECT`.
- [ ] Semua fungsi `SECURITY DEFINER` memakai `search_path = ''`:
      ```sql
      select p.proname, p.proconfig from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.prosecdef;
      ```
- [ ] Batas panjang kata sandi Supabase diatur minimal 10 karakter
      (Authentication → Policies).
- [ ] Backup point-in-time diaktifkan bila paketnya mendukung.

### Aplikasi

- [ ] `npm run build`, `npm run typecheck`, dan `npm run lint` bersih.
- [ ] Header keamanan tampil di produksi:
      ```bash
      curl -sI https://domain-anda.com/masuk | grep -iE \
        'content-security-policy|x-frame-options|x-content-type|referrer|permissions|strict-transport'
      ```
- [ ] Console browser bersih dari pelanggaran CSP di seluruh halaman.
- [ ] Situs hanya dilayani lewat HTTPS.
- [ ] `Strict-Transport-Security` aktif dan domain sudah benar-benar HTTPS
      (header ini sulit dibatalkan — pastikan sebelum menyalakan).
- [ ] Ganti rate limit login in-memory dengan penyimpanan bersama (Upstash
      Redis / Vercel KV) bila di-deploy multi-instance — lihat batasan di §10.
- [ ] Uji satu putaran penuh sebagai staff di lingkungan produksi.

---

## 10. Batasan keamanan yang perlu diketahui

Aplikasi ini dibangun dengan pertahanan berlapis, tetapi **tidak ada aplikasi
yang 100% aman**. Berikut batasan yang diketahui dari desain Tahap 1.

**Rate limiting login berbasis memori.**
`src/lib/auth/rate-limit.ts` menyimpan hitungan di memori proses. Pada
deployment serverless atau multi-instance, setiap instance punya hitungan
sendiri, sehingga batas efektifnya lebih longgar daripada angka yang
dikonfigurasi, dan hitungan hilang saat proses restart. Supabase Auth juga
punya rate limit di sisinya, tetapi untuk perlindungan yang sungguh-sungguh
ganti implementasi ini dengan penyimpanan bersama. Antarmukanya sudah
dirancang agar bisa ditukar tanpa mengubah pemanggil.

**IP klien berasal dari header proxy.**
`x-forwarded-for` dan sejenisnya bisa dipalsukan bila aplikasi tidak berada di
belakang reverse proxy yang menormalkannya. Di Vercel/Netlify/Cloudflare nilai
ini tepercaya. Bila self-host, pastikan proxy Anda **menimpa** header tersebut,
bukan sekadar meneruskannya.

**`service_role` melewati seluruh RLS.**
Tahap 1 tidak memakainya. Jika suatu saat dipakai untuk tugas administratif,
kunci itu harus tetap di server dan tidak boleh dipakai untuk melayani
permintaan pengguna biasa.

**CSP memakai `style-src 'unsafe-inline'`.**
Next.js dan Tailwind menyisipkan `<style>` inline saat hidrasi, jadi ini belum
bisa dihapus. `script-src` sudah memakai nonce + `strict-dynamic` tanpa
`unsafe-inline`, sehingga risiko terbesar (injeksi skrip) sudah tertutup.

**Login belum masuk audit log aplikasi.**
`audit_logs` mencatat aksi terhadap data (tambah/ubah/hapus bahan, stok opname,
perubahan role). Peristiwa login/logout ada di log bawaan Supabase Auth
(Dashboard → Logs → Auth). Menyatukan keduanya masuk Tahap 2.

**Belum ada 2FA dan belum ada kebijakan rotasi kata sandi.**
Supabase mendukung MFA; belum diaktifkan di tahap ini.

**Menghapus bahan ikut menghapus riwayat stoknya** (`on delete cascade`).
Entri `audit_logs` untuk penghapusan tetap tersimpan lengkap dengan nama bahan,
kategori, dan stok terakhirnya, jadi jejak siapa-menghapus-apa tidak hilang.
Bila riwayat transaksi harus abadi, Tahap 2 sebaiknya memakai *soft delete*.

**Belum ada uji otomatis di sisi aplikasi.**
Lapisan database punya `supabase/tests/rls_checks.sql`. Unit test dan test
end-to-end untuk UI masuk Tahap 2.

---

## 11. Usulan Tahap 2 (belum diimplementasikan)

Diurutkan berdasarkan manfaat langsung untuk operasional The Matcha Kyoto.

### A. Manajemen pengguna lewat antarmuka
Halaman khusus owner untuk mengundang anggota, mengubah role, dan menonaktifkan
akun — menggantikan langkah SQL manual. Aturan databasenya sudah ada; yang
kurang hanya UI dan alur undangan.

### B. Alur stok opname untuk staff
Staff mencatat hasil hitungan sebagai **draf**, owner/admin meninjau lalu
menyetujui. Stok baru berubah setelah disetujui. Ini membuka partisipasi staff
tanpa memberi mereka kemampuan mengubah stok secara langsung.

### C. Stok masuk dan keluar sebagai modul tersendiri
Saat ini perubahan stok dilakukan lewat form edit inventori. Tahap 2 sebaiknya
punya modul penerimaan barang (dengan nomor faktur dan harga aktual) serta
pemakaian harian, sehingga harga beli rata-rata bisa dihitung.

### D. Laporan dan analitik
- Grafik pemakaian bahan per minggu/bulan
- Estimasi hari sampai stok habis berdasarkan laju pemakaian
- Nilai persediaan dari waktu ke waktu
- Ekspor CSV/Excel untuk pembukuan

### E. Peringatan otomatis
Notifikasi saat stok menyentuh batas minimum atau saat tanggal kedaluwarsa
mendekat, lewat email atau WhatsApp. Bisa dijalankan dengan Supabase Edge
Function + cron.

### F. Modul supplier
Supplier saat ini hanya kolom teks. Jadikan tabel tersendiri dengan kontak,
riwayat harga, lead time, dan perbandingan harga antar supplier.

### G. Modul strategi bisnis
Sesuai visi produk: target penjualan, margin per menu, kalkulator HPP yang
menarik harga bahan langsung dari inventori, dan pencatatan eksperimen menu.

### H. Modul pemasaran
Kalender konten, pencatatan kampanye beserta biayanya, dan hubungannya dengan
lonjakan pemakaian bahan.

### I. Penguatan keamanan
- Rate limiting terdistribusi (Upstash Redis / Vercel KV)
- MFA/2FA lewat Supabase Auth
- Login dan logout masuk ke `audit_logs` aplikasi
- Halaman audit log dengan filter dan ekspor
- Soft delete untuk bahan baku

### J. Kualitas dan operasional
- Unit test untuk skema Zod dan helper
- Test end-to-end (Playwright) untuk alur login, CRUD, dan opname
- CI: typecheck, lint, build, dan `rls_checks.sql` pada database sementara
- Mode offline/PWA untuk stok opname di gudang dengan sinyal lemah
