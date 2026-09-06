# The Matcha Kyoto Ops

> Kelola stok, strategi, dan pertumbuhan bisnis dalam satu tempat.

Aplikasi internal untuk **The Matcha Kyoto**: mengelola stok bahan baku, stok
opname, dan jejak perubahan stok dalam satu dashboard.

Dibangun dengan **Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 ·
Supabase (PostgreSQL + Auth + RLS) · React Hook Form + Zod**.

---

## Status: Tahap 1 dan Tahap 2 selesai

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
| **Anggota tim** *(Tahap 2)* | Owner mengatur role dan menonaktifkan akun lewat antarmuka |
| **Opname bertahap** *(Tahap 2)* | Staff mengajukan draft, owner/admin menyetujui atau menolak |
| **Stok masuk & keluar** *(Tahap 2)* | Penerimaan barang dan pemakaian bahan sebagai modul tersendiri |
| **Desain** *(Tahap 2)* | Antarmuka digarap ulang: tipografi editorial, label mono, garis rambut |

Repo ini juga memuat satu halaman publik terpisah dari aplikasi operasional:
**Fluid Studio** di `/studio` — situs portofolio studio desain fiktif dengan
kubus 3D yang berputar mengikuti gulir. Lihat [§12](#12-halaman-fluid-studio-studio).

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

### Siapa boleh apa

| Aksi | Owner | Admin | Staff |
| --- | :---: | :---: | :---: |
| Melihat inventori, riwayat stok, stok opname | ✓ | ✓ | ✓ |
| Tambah / ubah / hapus bahan baku | ✓ | ✓ | — |
| Catat stok masuk & keluar | ✓ | ✓ | — |
| Mengajukan hasil hitung stok opname | ✓ | ✓ | ✓ (jadi draft) |
| Stok langsung disesuaikan saat mengajukan | ✓ | ✓ | — |
| Menyetujui / menolak draft opname | ✓ | ✓ | — |
| Melihat audit log | ✓ | ✓ | — |
| Mengubah role & status anggota | ✓ | — | — |

Setiap baris di tabel ini ditegakkan oleh policy RLS dan trigger di database,
bukan hanya oleh tombol yang disembunyikan. `supabase/tests/tahap2_checks.sql`
mengujinya satu per satu.

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
├── scripts/
│   └── buat-tekstur.mjs           Pembangkit tekstur SVG halaman Fluid Studio
│
├── public/
│   └── tekstur/                   15 tekstur SVG hasil bangkitan (±15 KB)
│
├── supabase/
│   ├── migrations/
│   │   ├── 20260101000000_init_schema.sql        Enum, tabel, indeks, updated_at
│   │   ├── 20260101000100_functions_triggers.sql Helper RLS, audit, RPC opname
│   │   ├── 20260101000200_rls_policies.sql       RLS + grant tabel
│   │   └── 20260201000000_tahap2_alur_kerja.sql  Alur opname, pergerakan stok
│   ├── seed.sql                   Data demo opsional (21 bahan baku)
│   └── tests/
│       ├── rls_checks.sql         10 kelompok uji keamanan database
│       └── tahap2_checks.sql      Uji alur kerja Tahap 2
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
    │   ├── (dashboard)/
    │   │   ├── layout.tsx         Penjaga sesi + kerangka aplikasi
    │   │   ├── loading.tsx        Kondisi memuat
    │   │   ├── error.tsx          Kondisi error per halaman
    │   │   ├── dashboard/         Ringkasan, perlu perhatian, aktivitas
    │   │   ├── inventori/         Tabel, cari, filter, CRUD
    │   │   ├── pergerakan/        Stok masuk & keluar (owner/admin)
    │   │   ├── stok-opname/       Pengajuan + tinjauan draft
    │   │   ├── riwayat-stok/      Jejak perubahan stok
    │   │   ├── pengguna/          Role & status anggota (owner)
    │   │   └── pengaturan/        Profil, organisasi, audit log
    │   └── studio/                Fluid Studio — halaman publik terpisah (§12)
    │       ├── studio.css         Sistem desainnya sendiri
    │       └── komponen/          Kubus 3D, gulir halus, penggaris, dll.
    │
    ├── components/
    │   ├── brand/logo.tsx
    │   ├── layout/                Sidebar, kerangka aplikasi, navigasi
    │   ├── ui/                    Button, field, card, badge, dialog, toast, …
    │   ├── dashboard/
    │   ├── inventori/
    │   ├── opname/
    │   ├── pergerakan/
    │   ├── pengguna/
    │   ├── pengaturan/
    │   └── setup/                 Halaman "Supabase belum dikonfigurasi"
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

Salin `.env.example` menjadi `.env.local`. Perintahnya berbeda per shell —
pakai yang sesuai dengan terminal Anda:

**Windows — Command Prompt (cmd.exe)**

```bat
copy .env.example .env.local
```

**Windows — PowerShell**

```powershell
Copy-Item .env.example .env.local
```

**macOS, Linux, Git Bash, WSL**

```bash
cp .env.example .env.local
```

> Perhatikan: `cp` **tidak ada** di Command Prompt. Bila Anda menempelkan
> perintah `cp` ke cmd.exe, yang muncul hanya pesan
> `'cp' is not recognized as an internal or external command` — berkasnya
> diam-diam tidak terbuat, dan aplikasi akan menampilkan halaman
> "Supabase belum dikonfigurasi". Pastikan `.env.local` benar-benar ada
> sebelum melanjutkan (`dir .env.local` di cmd, `ls -a` di bash).

Isi `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key dari dashboard>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Sisanya opsional (batas rate limit login). `SUPABASE_SERVICE_ROLE_KEY`
biarkan kosong — Tahap 1 tidak memakainya.

`.env.local` sudah masuk `.gitignore`. Jangan pernah di-commit.

### Restart dev server setelah membuat .env.local

**Next.js membaca berkas `.env` hanya sekali, saat proses dijalankan.** Kalau
`npm run dev` sudah berjalan ketika Anda membuat atau mengubah `.env.local`,
server itu tidak akan melihat perubahannya — Anda akan terus melihat halaman
"Supabase belum dikonfigurasi" walaupun berkasnya sudah benar.

Hentikan dengan `Ctrl+C`, lalu jalankan ulang:

```bash
npm run dev
```

### Kalau konfigurasinya belum ada

Aplikasi tidak akan mati. Route yang membutuhkan database (`/`, `/masuk`,
`/dashboard`, dan seterusnya) menampilkan halaman penjelasan berisi langkah
setup, sedangkan `/studio` tetap terbuka normal karena tidak menyentuh
Supabase sama sekali.

## 5. Menjalankan migration

### Cara A — SQL Editor (paling cepat)

Buka **SQL Editor** di dashboard Supabase, lalu jalankan berkas berikut
**berurutan**, satu per satu:

1. `supabase/migrations/20260101000000_init_schema.sql`
2. `supabase/migrations/20260101000100_functions_triggers.sql`
3. `supabase/migrations/20260101000200_rls_policies.sql`
4. `supabase/migrations/20260201000000_tahap2_alur_kerja.sql`

Urutannya penting: policy pada berkas ke-3 memakai fungsi dari berkas ke-2,
dan berkas ke-4 mengubah policy serta fungsi yang dibuat sebelumnya.

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

Urutan yang aman untuk pertama kali:

1. `npm install`
2. Buat `.env.local` (bagian 4) — **sebelum** menjalankan dev server.
3. Jalankan migration (bagian 5) dan tetapkan owner pertama (bagian 6).
4. `npm run dev`

Kalau dev server terlanjur berjalan sebelum `.env.local` dibuat, hentikan
dengan `Ctrl+C` dan jalankan ulang. Next.js hanya membaca berkas `.env` saat
proses dijalankan.

Ingin langsung melihat sesuatu tanpa Supabase? Jalankan `npm install` lalu
`npm run dev`, dan buka **http://localhost:3000/studio** — halaman itu tidak
menyentuh database sama sekali.

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

1. Buka `http://localhost:3000/studio` → harus tampil normal, bahkan sebelum
   Supabase dikonfigurasi.
2. Buka `http://localhost:3000` → bila `.env.local` belum ada, muncul halaman
   "Supabase belum dikonfigurasi" berisi langkah setup. Bila sudah ada, Anda
   dialihkan ke `/masuk`.
3. Login dengan akun owner → harus mendarat di `/dashboard`.
4. Buka `/inventori` → bila seed dijalankan, terlihat 21 bahan dengan badge
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

### Stok masuk & keluar (Tahap 2)

- [ ] Memilih bahan menampilkan stok sekarang; mengisi jumlah menampilkan
      pratinjau stok setelahnya.
- [ ] Stok masuk menambah stok dan muncul di `/riwayat-stok` sebagai `masuk`.
- [ ] Mengisi harga beli pada stok masuk memperbarui harga bahan di `/inventori`.
- [ ] Stok keluar mengurangi stok dan **tidak** mengubah harga beli.
- [ ] Stok keluar melebihi persediaan ditolak, dan tombol simpan mati saat
      pratinjau menunjukkan angka negatif.

### Alur persetujuan stok opname (Tahap 2)

- [ ] Sebagai **staff**: mengajukan opname menghasilkan draft; stok di
      `/inventori` **tidak** berubah.
- [ ] Sebagai **owner/admin**: draft muncul di "Menunggu tinjauan", dan menu
      Stok Opname di sidebar menampilkan lencana jumlahnya.
- [ ] Menyetujui draft mengubah stok dan menambah baris `penyesuaian` di
      `/riwayat-stok`.
- [ ] Menolak draft **tidak** mengubah stok, dan statusnya jadi Ditolak.
- [ ] Draft yang sudah ditinjau tidak muncul lagi di antrean.
- [ ] Sebagai **owner/admin**: mengajukan opname langsung disetujui dan stok
      berubah saat itu juga.

### Anggota tim (Tahap 2)

- [ ] Menu Anggota Tim hanya terlihat oleh **owner**.
- [ ] Membuka `/pengguna` sebagai admin atau staff dialihkan ke `/dashboard`.
- [ ] Owner dapat mengubah role anggota lain; perubahannya langsung terlihat.
- [ ] Tombol Ubah role dan Nonaktifkan **mati** pada baris owner sendiri.
- [ ] Menonaktifkan anggota membuatnya langsung kehilangan akses saat memuat
      ulang halaman.
- [ ] Perubahan role muncul di Audit log pada `/pengaturan`.

### Peran staff

- [ ] Staff **tidak** melihat tombol Tambah/Ubah/Hapus di `/inventori`.
- [ ] Staff **tidak** melihat menu Stok Masuk & Keluar maupun Anggota Tim.
- [ ] Membuka `/pergerakan` sebagai staff dialihkan ke `/dashboard`.
- [ ] Staff **tidak** melihat kartu Audit log di `/pengaturan`.
- [ ] Staff tetap bisa membaca dashboard, inventori, dan riwayat stok.

### Keamanan database

- [ ] Jalankan `supabase/tests/rls_checks.sql` lewat psql; setiap blok
      bertanda "harus GAGAL" memang menghasilkan ERROR, dan setiap blok
      "harus 0" memang mengembalikan 0.
- [ ] Jalankan `supabase/tests/tahap2_checks.sql` dengan cara yang sama —
      menguji alur persetujuan opname, pergerakan stok, dan pengelolaan
      anggota.

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

**Staff kini punya satu jalur tulis.** Sejak Tahap 2 staff boleh membuat baris
di `stock_opnames`, tetapi hanya berstatus `draft`, hanya atas namanya sendiri,
dan hanya di organisasinya — ketiganya ditegakkan policy RLS. Draft tidak
menyentuh stok sama sekali. Ini pelebaran permukaan tulis yang disengaja dan
dibatasi; sebelumnya staff sepenuhnya baca-saja.

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

## 11. Tahap 2 — tiga modul baru

### A. Anggota tim (`/pengguna`, khusus owner)

Owner mengubah role dan menonaktifkan akun anggota lewat antarmuka,
menggantikan langkah SQL manual di Tahap 1.

Aturan yang ditegakkan database, bukan UI:

- Hanya owner yang boleh mengubah `role`, `organization_id`, atau `is_active`.
- Owner tidak dapat mengubah role akunnya sendiri (mencegah terkunci sendiri).
- Organisasi harus selalu punya minimal satu owner aktif.
- Setiap perubahan tercatat di audit log sebagai `profile.update_sensitive`.

Menonaktifkan akun tidak menghapusnya. Fungsi helper RLS mengembalikan `NULL`
untuk profil nonaktif, sehingga seluruh policy gagal dan akses hilang seketika,
sementara jejak aktivitasnya tetap utuh.

**Menambah anggota baru** masih lewat dashboard Supabase (Authentication →
Users → Add user). Akun baru otomatis berrole staff, lalu rolenya diatur di
halaman ini. Membuat akun dari aplikasi memerlukan service role key, dan kunci
itu sengaja tidak pernah dibawa aplikasi ini agar tidak punya jalur ke browser.

### B. Stok opname bertahap (`/stok-opname`)

Kolom `status` pada `stock_opnames` bernilai `draft`, `disetujui`, atau
`ditolak`.

| Yang mengajukan | Hasil | Stok |
| --- | --- | --- |
| Staff | `draft` | Tidak berubah |
| Owner / admin | `disetujui` | Langsung disesuaikan |

Owner/admin menyetujui atau menolak draft. Menyetujui menyesuaikan stok dan
menulis transaksi `penyesuaian`; menolak tidak mengubah apa pun. Hasil tinjauan
bersifat final — tidak ada policy yang mengizinkan baris non-draft diubah lagi.

Dua detail yang mudah terlewat:

- **Stok "sebelum" dibaca ulang saat persetujuan**, bukan diambil dari angka
  waktu draft dibuat. Stok bisa berubah di antara pengajuan dan persetujuan;
  riwayat harus mencerminkan perubahan yang benar-benar terjadi. Kolom
  `stok_sistem` dibiarkan apa adanya sebagai catatan historis — itulah angka
  yang dilihat penghitung.
- **Persetujuan mengunci barisnya.** Bila dua manajer menekan setujui
  bersamaan, hanya satu yang mendapat baris itu. Tanpa kunci, keduanya lolos
  pemeriksaan status dan penyesuaian stok diterapkan dua kali.

### C. Stok masuk & keluar (`/pergerakan`, owner/admin)

Sebelumnya satu-satunya cara mengubah stok adalah form edit inventori, yang
mencampur dua hal berbeda: memperbaiki data salah ketik, dan mencatat kejadian
nyata. Modul ini memisahkannya.

- **Stok masuk** — penerimaan barang. Bila harga beli diisi, harga bahan ikut
  diperbarui.
- **Stok keluar** — pemakaian, kerusakan, kehilangan. Tidak pernah mengubah
  harga beli, dan ditolak bila melebihi persediaan.

Keduanya berjalan lewat `catat_pergerakan_stok()` yang mengunci baris bahan,
sehingga dua pencatatan bersamaan tidak saling menimpa.

### Tampilan

Antarmukanya digarap ulang mengikuti bahasa visual halaman Fluid Studio: garis
rambut sebagai pemisah alih-alih tumpukan kartu bergradasi, label mono untuk
seluruh metadata dan header kolom, angka besar dengan digit tabular sebagai
konten utama, serta butiran film tipis di atas seluruh halaman. Serif dekoratif
dibuang — di atas tabel inventori ia membuat antarmuka terbaca seperti undangan
alih-alih alat kerja. Tiga aturan yang menjaganya tetap konsisten ada di komentar
kepala `src/app/globals.css`.

---

## 12. Halaman Fluid Studio (`/studio`)

Selain aplikasi operasional, repo ini memuat satu halaman terpisah:
**Fluid Studio** — situs portofolio studio desain fiktif di `/studio`, dibangun
mengikuti sebuah referensi visual.

### Cara melihatnya

```bash
npm run dev
# lalu buka http://localhost:3000/studio
```

Halaman ini **publik** (terdaftar di `RUTE_PUBLIK` pada `src/proxy.ts`) dan
tidak menyentuh database sama sekali, jadi bisa dibuka tanpa Supabase.

### Yang membuatnya bergerak

| Bagian | Cara kerja |
| --- | --- |
| **Kubus 3D** | Enam `<div>` dengan CSS `transform-style: preserve-3d` — bukan WebGL. Seksinya setinggi 320vh dengan panggung `position: sticky`, sehingga jarak gulir berubah menjadi sudut putar. |
| **Gulir halus** | Roda mouse menggeser nilai *target*; posisi nyata mengejarnya sedikit demi sedikit tiap frame. Inilah yang membuat gulir terasa berat dan mulus. |
| **Peredaman** | Semua nilai berbasis gulir (kubus, penggaris, teks berjalan) diredam menuju targetnya, bukan dipetakan langsung — sehingga gerakannya menyusul, tidak patah. |
| **Penggaris kedalaman** | Indikator posisi gulir bergaya instrumen selam di tepi kanan. |
| **Tekstur** | Seluruh citra dibangkitkan `feTurbulence` sebagai SVG (15 berkas, ±15 KB total), bukan foto. Regenerasi: `node scripts/buat-tekstur.mjs`. |

### Catatan teknis yang penting

**Halaman ini wajib dirender dinamis** (`export const dynamic = 'force-dynamic'`).
CSP aplikasi memakai nonce yang dibangkitkan ulang setiap permintaan. Nonce itu
hanya bisa menempel pada tag `<script>` bila halaman dirender saat permintaan
datang. Bila di-prerender saat build, HTML membawa nonce lama sementara header
membawa nonce baru — dan browser memblokir **seluruh** JavaScript halaman.
Halamannya tetap tampil, tetapi mati total. Aturan yang sama berlaku untuk
halaman apa pun yang ditambahkan ke aplikasi ini.

**Gerak yang tidak memaksa.** Gulir halus dinonaktifkan pada perangkat sentuh
dan saat pengguna meminta `prefers-reduced-motion`; Ctrl + roda (zoom) tetap
diteruskan; scrollbar, tombol panah, Page Up/Down, dan tautan jangkar tetap
bekerja karena posisi target disamakan kembali saat terdeteksi selisih.

**Isi halaman berbahasa Inggris**, mengikuti referensinya — berbeda dengan
Matcha Kyoto Ops yang seluruhnya berbahasa Indonesia. Studio, karya, dan
alamat surel di dalamnya fiktif.

### Batasan

- Tekstur prosedural berbeda dari fotografi asli pada referensi. Menggantinya
  dengan foto berarti menambahkan berkas gambar ke `public/` — CSP saat ini
  hanya mengizinkan gambar dari origin sendiri, jadi CDN foto akan diblokir.
- Kubus memakai CSS 3D, bukan WebGL. Cukup untuk satu volume; pemandangan yang
  lebih rumit (banyak objek, pencahayaan, bayangan) akan membutuhkan Three.js.


---

## 13. Usulan Tahap 3 (belum diimplementasikan)

### A. Laporan dan analitik
Grafik pemakaian per minggu, estimasi hari sampai stok habis berdasarkan laju
pemakaian, nilai persediaan dari waktu ke waktu, dan ekspor CSV untuk pembukuan.
Data mentahnya sudah lengkap di `stock_transactions`.

### B. Peringatan otomatis
Notifikasi saat stok menyentuh batas minimum atau tanggal kedaluwarsa mendekat,
lewat email atau WhatsApp. Bisa dijalankan dengan Supabase Edge Function + cron.

### C. Modul supplier
Supplier masih berupa kolom teks. Jadikan tabel tersendiri dengan kontak,
riwayat harga, lead time, dan perbandingan harga antar supplier.

### D. Strategi bisnis
Target penjualan, margin per menu, dan kalkulator HPP yang menarik harga bahan
langsung dari inventori.

### E. Pemasaran
Kalender konten, pencatatan kampanye beserta biayanya, dan hubungannya dengan
lonjakan pemakaian bahan.

### F. Penguatan keamanan
- Rate limiting terdistribusi (Upstash Redis / Vercel KV)
- MFA/2FA lewat Supabase Auth
- Login dan logout masuk ke `audit_logs` aplikasi
- Halaman audit log dengan filter dan ekspor
- Soft delete untuk bahan baku

### G. Kualitas dan operasional
- Unit test untuk skema Zod dan helper
- Test end-to-end (Playwright) untuk alur login, CRUD, opname, dan pergerakan
- CI: typecheck, lint, build, plus kedua skrip uji SQL pada database sementara
- Mode offline/PWA untuk stok opname di gudang dengan sinyal lemah
