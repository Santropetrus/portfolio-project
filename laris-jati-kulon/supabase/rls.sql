-- =============================================================================
-- LARIS — Row Level Security
-- Jalankan setelah schema.sql.
-- Catatan: dalam ruang lingkup ini hanya ada SATU akun admin, jadi siapa pun
-- yang berhasil login (authenticated) dianggap admin.
-- =============================================================================

alter table umkm enable row level security;
alter table produk enable row level security;
alter table kategori enable row level security;
alter table profil_bumdes enable row level security;

-- publik cuma boleh baca
drop policy if exists "publik baca umkm aktif" on umkm;
create policy "publik baca umkm aktif" on umkm for select using (status = 'aktif');

drop policy if exists "publik baca produk" on produk;
create policy "publik baca produk" on produk for select using (true);

drop policy if exists "publik baca kategori" on kategori;
create policy "publik baca kategori" on kategori for select using (true);

drop policy if exists "publik baca profil" on profil_bumdes;
create policy "publik baca profil" on profil_bumdes for select using (true);

-- admin (siapa pun yang authenticated) boleh full akses
drop policy if exists "admin kelola umkm" on umkm;
create policy "admin kelola umkm" on umkm for all using (auth.role() = 'authenticated');

drop policy if exists "admin kelola produk" on produk;
create policy "admin kelola produk" on produk for all using (auth.role() = 'authenticated');

drop policy if exists "admin kelola kategori" on kategori;
create policy "admin kelola kategori" on kategori for all using (auth.role() = 'authenticated');

drop policy if exists "admin kelola profil" on profil_bumdes;
create policy "admin kelola profil" on profil_bumdes for all using (auth.role() = 'authenticated');

-- PENTING — matikan pendaftaran mandiri di Supabase.
-- Kebijakan di bawah memberi akses tulis penuh kepada siapa pun yang berstatus
-- 'authenticated'. Itu aman selama akun hanya dibuat manual oleh pengelola.
-- Buka Authentication > Sign In / Providers > Email, lalu matikan
-- "Allow new users to sign up". Kalau dibiarkan menyala, orang asing bisa
-- mendaftar sendiri dan otomatis punya izin mengubah data katalog.

-- CATATAN untuk didiskusikan sebelum data asli masuk:
-- Kebijakan "publik baca produk" bernilai true, artinya produk milik UMKM
-- berstatus 'nonaktif' pun masih bisa dibaca lewat API. Halaman publik tidak
-- pernah menampilkannya (query selalu lewat UMKM aktif), tapi kalau ingin
-- ditutup rapat di tingkat basis data, ganti kebijakan itu dengan:
--
--   create policy "publik baca produk umkm aktif" on produk for select
--     using (exists (select 1 from umkm u where u.id = produk.umkm_id and u.status = 'aktif'));
