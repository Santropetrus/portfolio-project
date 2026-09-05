-- ===========================================================================
-- The Matcha Kyoto Ops — Tahap 1
-- Migration 01: extensions, enum, tabel inti, indeks, trigger updated_at
-- ===========================================================================

-- gen_random_uuid() sudah tersedia di core PostgreSQL 13+, tidak perlu extension tambahan.

-- ---------------------------------------------------------------------------
-- ENUM
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where t.typname = 'user_role' and n.nspname = 'public') then
    create type public.user_role as enum ('owner', 'admin', 'staff');
  end if;

  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where t.typname = 'inventory_category' and n.nspname = 'public') then
    create type public.inventory_category as enum (
      'matcha_powder',
      'susu',
      'gula_sirup',
      'topping',
      'cup_kemasan',
      'sedotan',
      'bahan_pendukung'
    );
  end if;

  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where t.typname = 'stock_transaction_type' and n.nspname = 'public') then
    create type public.stock_transaction_type as enum ('masuk', 'keluar', 'penyesuaian');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Helper: updated_at otomatis
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- organizations
-- Struktur multi-tenant sudah disiapkan sejak Tahap 1 walaupun baru dipakai
-- oleh satu usaha. Seluruh tabel bisnis membawa organization_id.
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null check (char_length(btrim(nama)) between 2 and 120),
  slug        text not null unique check (slug ~ '^[a-z0-9]([a-z0-9-]{0,58}[a-z0-9])?$'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- Organisasi default. Dibuat di migration (bukan seed) karena profiles
-- membutuhkan organization_id NOT NULL saat user pertama mendaftar.
insert into public.organizations (nama, slug)
values ('The Matcha Kyoto', 'the-matcha-kyoto')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- profiles
-- Satu baris per user auth. Role disimpan di sini dan menjadi sumber
-- kebenaran otorisasi, baik untuk RLS maupun untuk server action.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete restrict,
  nama            text not null check (char_length(btrim(nama)) between 2 and 120),
  role            public.user_role not null default 'staff',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists profiles_organization_id_idx
  on public.profiles (organization_id);
create index if not exists profiles_organization_role_idx
  on public.profiles (organization_id, role);

-- ---------------------------------------------------------------------------
-- inventory_items
-- ---------------------------------------------------------------------------
create table if not exists public.inventory_items (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references public.organizations (id) on delete cascade,
  nama                text not null check (char_length(btrim(nama)) between 2 and 120),
  kategori            public.inventory_category not null,
  satuan              text not null check (char_length(btrim(satuan)) between 1 and 24),
  stok_saat_ini       numeric(12, 2) not null default 0
                        check (stok_saat_ini >= 0 and stok_saat_ini <= 9999999999),
  stok_minimum        numeric(12, 2) not null default 0
                        check (stok_minimum >= 0 and stok_minimum <= 9999999999),
  harga_beli          numeric(14, 2) not null default 0
                        check (harga_beli >= 0 and harga_beli <= 999999999999),
  supplier            text check (char_length(btrim(supplier)) <= 120),
  tanggal_kedaluwarsa date,
  catatan             text check (char_length(catatan) <= 1000),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references auth.users (id) on delete set null,

  -- Status stok dihitung di database supaya UI, filter, dan laporan
  -- selalu memakai definisi yang sama persis.
  status_stok         text generated always as (
                        case
                          when stok_saat_ini <= 0 then 'habis'
                          when stok_saat_ini <= stok_minimum then 'menipis'
                          else 'aman'
                        end
                      ) stored
);

-- Nama bahan unik per organisasi (case-insensitive) agar tidak ada duplikat.
create unique index if not exists inventory_items_org_nama_key
  on public.inventory_items (organization_id, lower(btrim(nama)));
create index if not exists inventory_items_org_kategori_idx
  on public.inventory_items (organization_id, kategori);
create index if not exists inventory_items_org_status_idx
  on public.inventory_items (organization_id, status_stok);
create index if not exists inventory_items_org_updated_at_idx
  on public.inventory_items (organization_id, updated_at desc);

drop trigger if exists inventory_items_set_updated_at on public.inventory_items;
create trigger inventory_items_set_updated_at
  before update on public.inventory_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- stock_transactions (riwayat perubahan stok, append-only)
-- Baris di tabel ini HANYA ditulis oleh trigger SECURITY DEFINER.
-- Tidak ada policy INSERT/UPDATE/DELETE untuk klien.
-- ---------------------------------------------------------------------------
create table if not exists public.stock_transactions (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations (id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items (id) on delete cascade,
  tipe              public.stock_transaction_type not null,
  jumlah            numeric(12, 2) not null check (jumlah > 0),
  stok_sebelum      numeric(12, 2) not null check (stok_sebelum >= 0),
  stok_sesudah      numeric(12, 2) not null check (stok_sesudah >= 0),
  catatan           text check (char_length(catatan) <= 1000),
  created_by        uuid references auth.users (id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists stock_transactions_org_created_at_idx
  on public.stock_transactions (organization_id, created_at desc);
create index if not exists stock_transactions_item_created_at_idx
  on public.stock_transactions (inventory_item_id, created_at desc);

-- ---------------------------------------------------------------------------
-- stock_opnames
-- `selisih` adalah generated column supaya tidak bisa dimanipulasi klien.
-- ---------------------------------------------------------------------------
create table if not exists public.stock_opnames (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations (id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items (id) on delete cascade,
  stok_sistem       numeric(12, 2) not null check (stok_sistem >= 0),
  stok_fisik        numeric(12, 2) not null check (stok_fisik >= 0 and stok_fisik <= 9999999999),
  selisih           numeric(12, 2) generated always as (stok_fisik - stok_sistem) stored,
  catatan           text check (char_length(catatan) <= 1000),
  created_by        uuid references auth.users (id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists stock_opnames_org_created_at_idx
  on public.stock_opnames (organization_id, created_at desc);
create index if not exists stock_opnames_item_created_at_idx
  on public.stock_opnames (inventory_item_id, created_at desc);

-- ---------------------------------------------------------------------------
-- audit_logs (append-only)
-- Ditulis eksklusif oleh trigger SECURITY DEFINER; klien hanya boleh membaca.
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  user_id         uuid references auth.users (id) on delete set null,
  action          text not null check (char_length(action) between 1 and 80),
  entity_type     text not null check (char_length(entity_type) between 1 and 60),
  entity_id       uuid,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists audit_logs_org_created_at_idx
  on public.audit_logs (organization_id, created_at desc);
create index if not exists audit_logs_entity_idx
  on public.audit_logs (entity_type, entity_id);
create index if not exists audit_logs_user_idx
  on public.audit_logs (user_id, created_at desc);
