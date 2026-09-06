-- ===========================================================================
-- The Matcha Kyoto Ops — pemeriksaan alur kerja Tahap 2
--
-- Melengkapi rls_checks.sql. Fokusnya pada tiga hal yang ditambahkan Tahap 2:
-- alur persetujuan stok opname, pencatatan stok masuk/keluar, dan pengelolaan
-- anggota tim.
--
-- CARA MENJALANKAN — pakai psql, BUKAN SQL Editor di dashboard:
--   psql "<connection-string>" -f supabase/tests/tahap2_checks.sql
--
-- Baris ERROR pada blok bertanda "harus GAGAL" berarti LULUS.
--
-- PERINGATAN: skrip ini membuat user uji di auth.users. Jangan dijalankan
-- pada proyek produksi yang sudah berisi data nyata.
-- ===========================================================================

begin;

insert into public.organizations (nama, slug)
values ('Organisasi Uji Tahap 2', 'organisasi-uji-tahap2')
on conflict (slug) do nothing;

insert into auth.users (id, email) values
  ('bbbbbbbb-0000-4000-8000-000000000001', 't2-owner@contoh.test'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 't2-admin@contoh.test'),
  ('bbbbbbbb-0000-4000-8000-000000000003', 't2-staff@contoh.test');

insert into auth.users (id, email, raw_user_meta_data) values
  ('bbbbbbbb-0000-4000-8000-000000000004', 't2-luar@contoh.test',
   jsonb_build_object(
     'organization_id',
     (select id::text from public.organizations where slug = 'organisasi-uji-tahap2')
   ));

update public.profiles set role = 'owner' where id = 'bbbbbbbb-0000-4000-8000-000000000001';
update public.profiles set role = 'admin' where id = 'bbbbbbbb-0000-4000-8000-000000000002';
update public.profiles set role = 'owner' where id = 'bbbbbbbb-0000-4000-8000-000000000004';

insert into public.inventory_items
  (organization_id, nama, kategori, satuan, stok_saat_ini, stok_minimum, harga_beli)
values
  ((select id from public.organizations where slug = 'the-matcha-kyoto'),
   'ZZ Bahan Uji Tahap 2', 'matcha_powder', 'gram', 1000, 200, 1500);

commit;

-- --------------------------------------------------------------------------
-- A. Alur persetujuan stok opname
-- --------------------------------------------------------------------------
\echo '=== A1: STAFF mengajukan opname (harus BERHASIL, status draft) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000003';
select status, stok_sistem, stok_fisik, selisih
from public.ajukan_stok_opname(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2'),
  880, 'Hitungan sore staff');
commit;

\echo '-- stok TIDAK boleh berubah oleh draft (harus tetap 1000) --'
select stok_saat_ini from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2';

\echo '-- belum ada transaksi penyesuaian dari draft (harus 0) --'
select count(*) as transaksi_penyesuaian
from public.stock_transactions t
join public.inventory_items i on i.id = t.inventory_item_id
where i.nama = 'ZZ Bahan Uji Tahap 2' and t.tipe = 'penyesuaian';

\echo '=== A2: STAFF mencoba meninjau draftnya sendiri (harus GAGAL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000003';
select status from public.tinjau_stok_opname(
  (select id from public.stock_opnames where status = 'draft' order by created_at desc limit 1),
  true, 'coba-coba');
rollback;

\echo '=== A3: STAFF memaksa insert status disetujui (harus GAGAL: RLS) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000003';
insert into public.stock_opnames
  (organization_id, inventory_item_id, stok_sistem, stok_fisik, created_by, status)
values (
  public.current_profile_org(),
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2'),
  1000, 5, (select auth.uid()), 'disetujui');
rollback;

\echo '=== A4: ADMIN menyetujui draft (harus BERHASIL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000002';
select status, stok_fisik, catatan_peninjau from public.tinjau_stok_opname(
  (select id from public.stock_opnames where status = 'draft' order by created_at desc limit 1),
  true, 'Sudah dicek ulang');
commit;

\echo '-- stok kini harus 880, dan ada transaksi penyesuaian 1000 -> 880 --'
select stok_saat_ini, status_stok from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2';
select t.tipe, t.stok_sebelum, t.stok_sesudah, t.catatan
from public.stock_transactions t
join public.inventory_items i on i.id = t.inventory_item_id
where i.nama = 'ZZ Bahan Uji Tahap 2' order by t.created_at;

\echo '-- audit log persetujuan harus tercatat --'
select action from public.audit_logs where action = 'stock_opname.approve';

\echo '=== A5: meninjau ulang yang sudah ditinjau (harus GAGAL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000001';
select status from public.tinjau_stok_opname(
  (select id from public.stock_opnames where status = 'disetujui' order by created_at desc limit 1),
  false, 'berubah pikiran');
rollback;

\echo '=== A6: STAFF ajukan lalu OWNER tolak (stok harus tetap) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000003';
select status from public.ajukan_stok_opname(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2'), 10, 'Salah hitung');
commit;

begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000001';
select status, catatan_peninjau from public.tinjau_stok_opname(
  (select id from public.stock_opnames where status = 'draft' order by created_at desc limit 1),
  false, 'Angkanya tidak masuk akal');
commit;

\echo '-- stok harus tetap 880 --'
select stok_saat_ini from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2';

\echo '=== A7: MANAJER mengajukan (harus langsung disetujui + stok berubah) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000002';
select status, stok_fisik from public.ajukan_stok_opname(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2'), 900, 'Hitung ulang admin');
commit;
select stok_saat_ini from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2';

-- --------------------------------------------------------------------------
-- B. Pencatatan stok masuk dan keluar
-- --------------------------------------------------------------------------
\echo '=== B1: ADMIN mencatat stok masuk 100 (harus BERHASIL, jadi 1000) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000002';
select tipe, jumlah, stok_sebelum, stok_sesudah from public.catat_pergerakan_stok(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2'),
  'masuk', 100, 'Kiriman supplier', 1600);
commit;

\echo '-- harga beli ikut diperbarui pada penerimaan (harus 1600) --'
select stok_saat_ini, harga_beli from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2';

\echo '=== B2: ADMIN mencatat stok keluar 250 (harus BERHASIL, jadi 750) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000002';
select tipe, jumlah, stok_sebelum, stok_sesudah from public.catat_pergerakan_stok(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2'),
  'keluar', 250, 'Pemakaian harian');
commit;
select stok_saat_ini from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2';

\echo '-- harga beli TIDAK boleh berubah oleh pemakaian (harus tetap 1600) --'
select harga_beli from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2';

\echo '=== B3: stok keluar melebihi persediaan (harus GAGAL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000002';
select * from public.catat_pergerakan_stok(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2'),
  'keluar', 99999, 'kebanyakan');
rollback;

\echo '=== B4: jumlah nol atau negatif (harus GAGAL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000002';
select * from public.catat_pergerakan_stok(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2'), 'masuk', 0, null);
rollback;

\echo '=== B5: STAFF mencatat pergerakan stok (harus GAGAL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000003';
select * from public.catat_pergerakan_stok(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2'),
  'keluar', 1, 'coba-coba');
rollback;

\echo '=== B6: tipe pergerakan asal-asalan (harus GAGAL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000002';
select * from public.catat_pergerakan_stok(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2'), 'hapus', 1, null);
rollback;

\echo '=== B7: organisasi lain menyentuh bahan ini (harus GAGAL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000004';
select * from public.catat_pergerakan_stok(
  (select id from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2'), 'masuk', 5, null);
rollback;

-- --------------------------------------------------------------------------
-- C. Pengelolaan anggota tim
-- --------------------------------------------------------------------------
\echo '=== C1: OWNER menaikkan staff menjadi admin (harus BERHASIL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000001';
with x as (
  update public.profiles set role = 'admin'
  where id = 'bbbbbbbb-0000-4000-8000-000000000003' returning nama, role
) select * from x;
rollback;

\echo '=== C2: OWNER menonaktifkan anggota (harus BERHASIL) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000001';
with x as (
  update public.profiles set is_active = false
  where id = 'bbbbbbbb-0000-4000-8000-000000000003' returning nama, is_active
) select * from x;
rollback;

\echo '=== C3: ADMIN menonaktifkan anggota (harus 0 baris; hanya owner) ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000002';
with x as (
  update public.profiles set is_active = false
  where id = 'bbbbbbbb-0000-4000-8000-000000000003' returning 1
) select count(*) as baris_terubah_oleh_admin from x;
rollback;

\echo '=== C4: OWNER menonaktifkan dirinya sendiri saat ia owner satu-satunya ==='
\echo '--     (harus GAGAL: organisasi harus punya owner aktif) --'
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000001';
update public.profiles set role = 'staff' where id = 'bbbbbbbb-0000-4000-8000-000000000001';
rollback;

\echo '=== C5: ringkasan dashboard memuat jumlah opname menunggu ==='
begin;
set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-0000-4000-8000-000000000001';
select total_bahan, stok_menipis, stok_habis, opname_menunggu from public.ringkasan_inventori();
rollback;

-- --------------------------------------------------------------------------
-- PEMBERSIHAN
-- --------------------------------------------------------------------------
\echo '=== PEMBERSIHAN ==='
begin;
delete from public.inventory_items where nama = 'ZZ Bahan Uji Tahap 2';
delete from auth.users where email like 't2-%@contoh.test';
delete from public.organizations where slug = 'organisasi-uji-tahap2';
commit;
