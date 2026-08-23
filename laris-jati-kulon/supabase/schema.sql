-- =============================================================================
-- LARIS — skema basis data (Supabase / Postgres)
-- Jalankan lewat Supabase Dashboard > SQL Editor > New query, lalu Run.
-- Urutan file: 01) schema.sql  02) rls.sql  03) storage.sql  04) seed.sql (opsional)
-- =============================================================================

-- Kategori UMKM (dikelola admin, bukan hardcoded, biar fleksibel)
create table if not exists kategori (
  id uuid primary key default gen_random_uuid(),
  nama text not null unique,
  urutan int default 0
);

-- UMKM / unit usaha binaan
create table if not exists umkm (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  slug text unique not null,          -- buat URL /umkm/:slug
  kategori_id uuid references kategori(id),
  deskripsi text,
  alamat text,
  nomor_wa text not null,             -- format internasional: 62xxxxxxxxxx
  foto_profil_url text,
  status text not null default 'aktif' check (status in ('aktif','nonaktif')),
  urutan int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Produk milik tiap UMKM
create table if not exists produk (
  id uuid primary key default gen_random_uuid(),
  umkm_id uuid not null references umkm(id) on delete cascade,
  nama text not null,
  deskripsi text,
  harga numeric(12,2),
  satuan text,                        -- pcs/kg/porsi, opsional, boleh kosong
  foto_url text,
  status text not null default 'tersedia' check (status in ('tersedia','habis')),
  urutan int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Profil BUMDes (single row)
create table if not exists profil_bumdes (
  id int primary key default 1,
  nama_bumdes text,
  sambutan text,
  visi text,
  misi text,
  logo_url text,
  constraint single_row check (id = 1)
);

-- -----------------------------------------------------------------------------
-- Tambahan di luar skema dasar (alasan ditulis supaya jelas kenapa ada):
-- 1) Indeks pada kolom yang dipakai halaman publik untuk menyaring/mengurutkan.
-- 2) Trigger updated_at, supaya kolom itu benar-benar terisi saat admin menyunting
--    (kalau tidak, nilainya selamanya sama dengan created_at).
-- -----------------------------------------------------------------------------

create index if not exists umkm_status_urutan_idx on umkm (status, urutan);
create index if not exists umkm_kategori_idx on umkm (kategori_id);
create index if not exists produk_umkm_idx on produk (umkm_id, urutan);
create index if not exists produk_status_idx on produk (status);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists umkm_set_updated_at on umkm;
create trigger umkm_set_updated_at
  before update on umkm
  for each row execute function set_updated_at();

drop trigger if exists produk_set_updated_at on produk;
create trigger produk_set_updated_at
  before update on produk
  for each row execute function set_updated_at();

-- Baris tunggal profil BUMDes disiapkan sejak awal supaya form admin
-- tinggal melakukan update, tidak perlu menangani kasus "baris belum ada".
insert into profil_bumdes (id, nama_bumdes)
values (1, 'BUMDes Jati Kulon')
on conflict (id) do nothing;
