-- ===========================================================================
-- The Matcha Kyoto Ops — Tahap 1
-- Migration 03: Row Level Security + grant tabel
--
-- Prinsip:
--  1. Semua tabel bisnis memakai RLS. Tidak ada pengecualian.
--  2. Isolasi tenant memakai organization_id = public.current_profile_org().
--  3. Otorisasi role diperiksa di database (bukan hanya di UI/server).
--  4. Tabel jejak (stock_transactions, audit_logs) bersifat append-only dan
--     hanya ditulis oleh trigger SECURITY DEFINER — tidak ada policy tulis
--     untuk peran `authenticated`.
--
-- Catatan: `force row level security` sengaja TIDAK dipakai, karena trigger
-- SECURITY DEFINER dijalankan sebagai pemilik tabel dan perlu menulis jejak
-- audit. Peran `service_role` memang melewati RLS — karena itu kunci
-- service role tidak boleh pernah sampai ke browser.
-- ===========================================================================

alter table public.organizations      enable row level security;
alter table public.profiles           enable row level security;
alter table public.inventory_items    enable row level security;
alter table public.stock_transactions enable row level security;
alter table public.stock_opnames      enable row level security;
alter table public.audit_logs         enable row level security;

-- ---------------------------------------------------------------------------
-- Hak tabel dasar. Supabase memberi grant longgar secara default; kita cabut
-- lalu berikan seminimal mungkin. RLS tetap lapisan utama, ini lapisan kedua.
-- ---------------------------------------------------------------------------
revoke all on public.organizations      from anon, authenticated;
revoke all on public.profiles           from anon, authenticated;
revoke all on public.inventory_items    from anon, authenticated;
revoke all on public.stock_transactions from anon, authenticated;
revoke all on public.stock_opnames      from anon, authenticated;
revoke all on public.audit_logs         from anon, authenticated;

grant select                         on public.organizations      to authenticated;
grant select, update                 on public.profiles           to authenticated;
grant select, insert, update, delete on public.inventory_items    to authenticated;
grant select                         on public.stock_transactions to authenticated;
grant select, insert                 on public.stock_opnames      to authenticated;
grant select                         on public.audit_logs         to authenticated;

-- Peran `anon` (belum login) tidak mendapat akses apa pun ke data bisnis.

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
drop policy if exists "organizations_select_own" on public.organizations;
create policy "organizations_select_own"
  on public.organizations
  for select
  to authenticated
  using (id = public.current_profile_org());

-- Tidak ada policy INSERT/UPDATE/DELETE: pembuatan organisasi baru adalah
-- tugas administratif (SQL editor / service role), bukan aksi dari aplikasi.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_same_org" on public.profiles;
create policy "profiles_select_same_org"
  on public.profiles
  for select
  to authenticated
  using (organization_id = public.current_profile_org());

-- Setiap user boleh memperbarui barisnya sendiri (mis. mengganti nama).
-- Kolom sensitif tetap dijaga oleh trigger public.guard_profile_changes().
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Owner boleh mengelola profil anggota di organisasinya (mis. mengubah role).
drop policy if exists "profiles_update_by_owner" on public.profiles;
create policy "profiles_update_by_owner"
  on public.profiles
  for update
  to authenticated
  using (organization_id = public.current_profile_org() and public.is_owner())
  with check (organization_id = public.current_profile_org() and public.is_owner());

-- Tidak ada policy INSERT (profil dibuat trigger on_auth_user_created)
-- dan tidak ada policy DELETE (profil ikut terhapus bersama auth.users).

-- ---------------------------------------------------------------------------
-- inventory_items
-- Owner/admin: baca + tulis. Staff: baca saja.
-- ---------------------------------------------------------------------------
drop policy if exists "inventory_select_org" on public.inventory_items;
create policy "inventory_select_org"
  on public.inventory_items
  for select
  to authenticated
  using (organization_id = public.current_profile_org());

drop policy if exists "inventory_insert_manager" on public.inventory_items;
create policy "inventory_insert_manager"
  on public.inventory_items
  for insert
  to authenticated
  with check (organization_id = public.current_profile_org() and public.is_manager());

drop policy if exists "inventory_update_manager" on public.inventory_items;
create policy "inventory_update_manager"
  on public.inventory_items
  for update
  to authenticated
  using (organization_id = public.current_profile_org() and public.is_manager())
  with check (organization_id = public.current_profile_org() and public.is_manager());

drop policy if exists "inventory_delete_manager" on public.inventory_items;
create policy "inventory_delete_manager"
  on public.inventory_items
  for delete
  to authenticated
  using (organization_id = public.current_profile_org() and public.is_manager());

-- ---------------------------------------------------------------------------
-- stock_transactions — append-only, hanya bisa dibaca satu organisasi.
-- ---------------------------------------------------------------------------
drop policy if exists "stock_transactions_select_org" on public.stock_transactions;
create policy "stock_transactions_select_org"
  on public.stock_transactions
  for select
  to authenticated
  using (organization_id = public.current_profile_org());

-- Sengaja tanpa policy INSERT/UPDATE/DELETE: baris hanya lahir dari trigger
-- public.log_inventory_item_changes(). Riwayat stok tidak bisa dipalsukan
-- ataupun dihapus dari sisi klien.

-- ---------------------------------------------------------------------------
-- stock_opnames
-- ---------------------------------------------------------------------------
drop policy if exists "stock_opnames_select_org" on public.stock_opnames;
create policy "stock_opnames_select_org"
  on public.stock_opnames
  for select
  to authenticated
  using (organization_id = public.current_profile_org());

-- Tahap 1: hanya owner/admin yang boleh mencatat opname (asumsi paling aman).
drop policy if exists "stock_opnames_insert_manager" on public.stock_opnames;
create policy "stock_opnames_insert_manager"
  on public.stock_opnames
  for insert
  to authenticated
  with check (organization_id = public.current_profile_org() and public.is_manager());

-- Tanpa policy UPDATE/DELETE: hasil opname bersifat final (append-only).

-- ---------------------------------------------------------------------------
-- audit_logs — hanya owner/admin yang boleh membaca, tidak ada yang menulis
-- lewat klien.
-- ---------------------------------------------------------------------------
drop policy if exists "audit_logs_select_manager" on public.audit_logs;
create policy "audit_logs_select_manager"
  on public.audit_logs
  for select
  to authenticated
  using (organization_id = public.current_profile_org() and public.is_manager());
