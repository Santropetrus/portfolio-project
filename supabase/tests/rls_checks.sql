-- ===========================================================================
-- The Matcha Kyoto Ops — pemeriksaan Row Level Security
--
-- Skrip ini menyimulasikan tiga role dalam satu organisasi plus satu owner
-- dari organisasi lain, lalu memastikan setiap batasan keamanan benar-benar
-- ditegakkan oleh DATABASE, bukan hanya oleh UI.
--
-- CARA MENJALANKAN — pakai psql, BUKAN SQL Editor di dashboard.
-- Skrip ini memakai meta-command `\echo` dan menghasilkan banyak result set,
-- yang tidak ditampilkan dengan benar oleh SQL Editor.
--
--   1. Jalankan seluruh migration terlebih dahulu.
--   2. Ambil connection string: Supabase Dashboard -> Project Settings ->
--      Database -> Connection string -> psql.
--   3. psql "<connection-string>" -f supabase/tests/rls_checks.sql
--   4. Bandingkan keluarannya dengan komentar "harus ..." di setiap blok.
--      Baris ERROR pada blok yang ditandai "harus GAGAL" berarti LULUS.
--
-- PERINGATAN: skrip ini membuat user uji di auth.users. Jangan dijalankan
-- pada proyek produksi yang sudah berisi data nyata.
-- ===========================================================================

begin;

-- --------------------------------------------------------------------------
-- Persiapan
-- --------------------------------------------------------------------------
insert into public.organizations (nama, slug)
values ('Organisasi Uji Tetangga', 'organisasi-uji-tetangga')
on conflict (slug) do nothing;

insert into auth.users (id, email) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'uji-owner@contoh.test'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'uji-admin@contoh.test'),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'uji-staff@contoh.test');

insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-0000-4000-8000-000000000004', 'uji-owner-lain@contoh.test',
   jsonb_build_object(
     'organization_id',
     (select id::text from public.organizations where slug = 'organisasi-uji-tetangga')
   ));

\echo '=== UJI 1: profil dibuat otomatis dan role SELALU staff ==='
-- Harus: keempat baris ber-role "staff", termasuk yang metadata-nya diatur sendiri.
select u.email, p.role, o.slug
from public.profiles p
join auth.users u on u.id = p.id
join public.organizations o on o.id = p.organization_id
where u.email like 'uji-%'
order by u.email;

-- Bootstrap role lewat service_role / SQL editor (jalur administratif yang sah).
update public.profiles set role = 'owner' where id = 'aaaaaaaa-0000-4000-8000-000000000001';
update public.profiles set role = 'admin' where id = 'aaaaaaaa-0000-4000-8000-000000000002';
update public.profiles set role = 'owner' where id = 'aaaaaaaa-0000-4000-8000-000000000004';

commit;

-- --------------------------------------------------------------------------
-- UJI 2: owner boleh menambah bahan, riwayat & audit tercatat otomatis
-- --------------------------------------------------------------------------
\echo '=== UJI 2: owner menambah bahan (harus BERHASIL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000001';
insert into public.inventory_items
  (organization_id, nama, kategori, satuan, stok_saat_ini, stok_minimum, harga_beli)
values
  (public.current_profile_org(), 'ZZ Bahan Uji RLS', 'matcha_powder', 'gram', 1000, 300, 1500);
commit;

-- Harus: satu baris 'masuk' 0 -> 1000, dan satu audit 'inventory_item.create'.
select t.tipe, t.stok_sebelum, t.stok_sesudah, t.catatan
from public.stock_transactions t
join public.inventory_items i on i.id = t.inventory_item_id
where i.nama = 'ZZ Bahan Uji RLS';

select action from public.audit_logs
where entity_type = 'inventory_item'
order by created_at desc limit 1;

-- --------------------------------------------------------------------------
-- UJI 3: staff hanya boleh MEMBACA inventori
-- --------------------------------------------------------------------------
\echo '=== UJI 3: staff INSERT (harus GAGAL: row-level security policy) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000003';
insert into public.inventory_items (organization_id, nama, kategori, satuan)
values (public.current_profile_org(), 'ZZ Bahan Ilegal', 'topping', 'kg');
rollback;

\echo '=== UJI 4: staff UPDATE/DELETE (harus 0 baris terpengaruh) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000003';
with x as (
  update public.inventory_items set stok_saat_ini = 99999
  where nama = 'ZZ Bahan Uji RLS' returning 1
) select count(*) as baris_terupdate_oleh_staff from x;
with x as (
  delete from public.inventory_items where nama = 'ZZ Bahan Uji RLS' returning 1
) select count(*) as baris_terhapus_oleh_staff from x;
rollback;

-- --------------------------------------------------------------------------
-- UJI 5: audit log tidak terlihat oleh staff
-- --------------------------------------------------------------------------
\echo '=== UJI 5: staff membaca audit_logs (harus 0) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000003';
select count(*) as audit_terlihat_staff from public.audit_logs;
rollback;

-- --------------------------------------------------------------------------
-- UJI 6: isolasi antar organisasi
-- --------------------------------------------------------------------------
\echo '=== UJI 6: owner organisasi lain (harus tidak melihat bahan mana pun) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000004';
select count(*) as bahan_terlihat_org_lain from public.inventory_items;
select * from public.ringkasan_inventori();
rollback;

-- --------------------------------------------------------------------------
-- UJI 7: privilege escalation
-- --------------------------------------------------------------------------
\echo '=== UJI 7a: staff menaikkan role sendiri (harus GAGAL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000003';
update public.profiles set role = 'owner' where id = 'aaaaaaaa-0000-4000-8000-000000000003';
rollback;

\echo '=== UJI 7b: admin mempromosikan orang lain (harus 0 baris; hanya owner) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000002';
with x as (
  update public.profiles set role = 'admin'
  where id = 'aaaaaaaa-0000-4000-8000-000000000003' returning 1
) select count(*) as baris_terupdate_oleh_admin from x;
rollback;

\echo '=== UJI 7c: staff mengganti namanya sendiri (harus BERHASIL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000003';
with x as (
  update public.profiles set nama = 'Nama Baru Staff'
  where id = 'aaaaaaaa-0000-4000-8000-000000000003' returning nama
) select * from x;
rollback;

\echo '=== UJI 7d: owner menurunkan role dirinya sendiri (harus GAGAL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000001';
update public.profiles set role = 'staff' where id = 'aaaaaaaa-0000-4000-8000-000000000001';
rollback;

-- --------------------------------------------------------------------------
-- UJI 8: tabel jejak bersifat append-only
-- --------------------------------------------------------------------------
\echo '=== UJI 8: owner memalsukan/menghapus jejak (semua harus GAGAL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000001';
insert into public.stock_transactions
  (organization_id, inventory_item_id, tipe, jumlah, stok_sebelum, stok_sesudah)
select public.current_profile_org(), id, 'masuk', 1, 0, 1
from public.inventory_items limit 1;
rollback;

begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000001';
delete from public.audit_logs;
rollback;

-- --------------------------------------------------------------------------
-- UJI 9: stok opname
-- --------------------------------------------------------------------------
\echo '=== UJI 9a: admin mencatat opname (harus BERHASIL, selisih -60) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000002';
select stok_sistem, stok_fisik, selisih
from public.catat_stok_opname(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji RLS'),
  940,
  'Uji otomatis'
);
commit;

-- Harus: stok bahan jadi 940 dan ada transaksi 'penyesuaian' 1000 -> 940.
select i.stok_saat_ini, i.status_stok
from public.inventory_items i where i.nama = 'ZZ Bahan Uji RLS';

select t.tipe, t.stok_sebelum, t.stok_sesudah, t.catatan
from public.stock_transactions t
join public.inventory_items i on i.id = t.inventory_item_id
where i.nama = 'ZZ Bahan Uji RLS'
order by t.created_at;

\echo '=== UJI 9b: staff mencatat opname (harus GAGAL: tidak memiliki izin) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000003';
select * from public.catat_stok_opname(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji RLS'), 10, null);
rollback;

\echo '=== UJI 9c: stok fisik negatif (harus GAGAL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000001';
select * from public.catat_stok_opname(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji RLS'), -5, null);
rollback;

\echo '=== UJI 9d: opname pada bahan organisasi lain (harus GAGAL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000004';
select * from public.catat_stok_opname(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji RLS'), 10, null);
rollback;

-- --------------------------------------------------------------------------
-- UJI 10: nama bahan unik per organisasi (case-insensitive)
-- --------------------------------------------------------------------------
\echo '=== UJI 10: nama duplikat (harus GAGAL: unique constraint) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000001';
insert into public.inventory_items (organization_id, nama, kategori, satuan)
values (public.current_profile_org(), '  zz bahan uji rls ', 'matcha_powder', 'gram');
rollback;

-- --------------------------------------------------------------------------
-- PEMBERSIHAN
-- --------------------------------------------------------------------------
\echo '=== PEMBERSIHAN ==='
begin;
delete from public.inventory_items where nama = 'ZZ Bahan Uji RLS';
delete from auth.users where email like 'uji-%@contoh.test';
delete from public.organizations where slug = 'organisasi-uji-tetangga';
commit;
