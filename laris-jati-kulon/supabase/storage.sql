-- =============================================================================
-- LARIS — Storage: dua bucket publik untuk foto
-- Jalankan setelah rls.sql. Bucket bisa juga dibuat manual lewat menu Storage.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('umkm-foto', 'umkm-foto', true), ('produk-foto', 'produk-foto', true)
on conflict (id) do nothing;

-- baca publik
drop policy if exists "publik baca foto umkm" on storage.objects;
create policy "publik baca foto umkm" on storage.objects
  for select using (bucket_id = 'umkm-foto');

drop policy if exists "publik baca foto produk" on storage.objects;
create policy "publik baca foto produk" on storage.objects
  for select using (bucket_id = 'produk-foto');

-- tulis/ubah/hapus hanya untuk yang sudah login (admin BUMDes)
drop policy if exists "admin kelola foto umkm" on storage.objects;
create policy "admin kelola foto umkm" on storage.objects
  for all
  using (bucket_id = 'umkm-foto' and auth.role() = 'authenticated')
  with check (bucket_id = 'umkm-foto' and auth.role() = 'authenticated');

drop policy if exists "admin kelola foto produk" on storage.objects;
create policy "admin kelola foto produk" on storage.objects
  for all
  using (bucket_id = 'produk-foto' and auth.role() = 'authenticated')
  with check (bucket_id = 'produk-foto' and auth.role() = 'authenticated');
