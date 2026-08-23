-- =============================================================================
-- LARIS — data contoh (opsional)
-- Isinya sama persis dengan src/data/dummy.js supaya tampilan saat memakai
-- Supabase identik dengan tampilan saat memakai data dummy.
--
-- PERINGATAN: semua nomor WhatsApp di bawah ini PALSU (62812-0000-00xx).
-- Ganti dengan nomor asli sebelum situs dipublikasikan.
-- Untuk mengosongkan lagi: delete from produk; delete from umkm; delete from kategori;
-- =============================================================================

insert into kategori (nama, urutan) values
  ('Kuliner', 1),
  ('Kerajinan Kayu', 2),
  ('Konveksi & Batik', 3),
  ('Pertanian & Ternak', 4),
  ('Jasa', 5)
on conflict (nama) do nothing;

insert into umkm (nama, slug, kategori_id, deskripsi, alamat, nomor_wa, status, urutan)
select 'Jenang Bu Sriatun', 'jenang-bu-sriatun', k.id, 'Jenang kudus rumahan yang diaduk manual di wajan tembaga sejak 1998. Santan kelapa diperas hari itu juga, gula aren dari Colo. Melayani pesanan hantaran, oleh-oleh, dan besek hajatan.', 'RT 02 / RW 03, Jati Kulon', '628120000001', 'aktif', 1
from kategori k where k.nama = 'Kuliner'
on conflict (slug) do nothing;

insert into umkm (nama, slug, kategori_id, deskripsi, alamat, nomor_wa, status, urutan)
select 'Ukir Jati Barokah', 'ukir-jati-barokah', k.id, 'Bengkel ukir kayu jati milik Pak Sukardi dan tiga perajin muda desa. Mengerjakan gebyok, kusen motif Kudusan, sampai souvenir kecil. Bisa custom ukuran dan motif.', 'Jl. Raya Jati Kulon No. 14', '628120000002', 'aktif', 2
from kategori k where k.nama = 'Kerajinan Kayu'
on conflict (slug) do nothing;

insert into umkm (nama, slug, kategori_id, deskripsi, alamat, nomor_wa, status, urutan)
select 'Konveksi Bordir Amanah', 'konveksi-bordir-amanah', k.id, 'Menerima jahit seragam sekolah, kaos komunitas, dan bordir logo. Dikerjakan sembilan penjahit ibu-ibu warga Jati Kulon. Minimal order 12 potong.', 'RT 05 / RW 01, Jati Kulon', '628120000003', 'aktif', 3
from kategori k where k.nama = 'Konveksi & Batik'
on conflict (slug) do nothing;

insert into umkm (nama, slug, kategori_id, deskripsi, alamat, nomor_wa, status, urutan)
select 'Keripik Tempe Pak Warno', 'keripik-tempe-pak-warno', k.id, 'Keripik tempe tipis, digoreng pakai minyak baru tiap batch. Tersedia varian original, pedas daun jeruk, dan balado.', 'RT 01 / RW 02, Jati Kulon', '628120000004', 'aktif', 4
from kategori k where k.nama = 'Kuliner'
on conflict (slug) do nothing;

insert into umkm (nama, slug, kategori_id, deskripsi, alamat, nomor_wa, status, urutan)
select 'Batik Tulis Sekar Muria', 'batik-tulis-sekar-muria', k.id, 'Batik tulis dan cap bermotif pesisiran Kudus — parijoto, kapal kandas, tembakau. Pewarna nila alami untuk seri terbatas. Kelompok perajin binaan PKK desa.', 'RT 04 / RW 03, Jati Kulon', '628120000005', 'aktif', 5
from kategori k where k.nama = 'Konveksi & Batik'
on conflict (slug) do nothing;

insert into umkm (nama, slug, kategori_id, deskripsi, alamat, nomor_wa, status, urutan)
select 'Tani Jaya Jati Kulon', 'tani-jaya-jati-kulon', k.id, 'Kelompok tani yang mengelola sayur hidroponik dan beras hasil panen sawah desa. Panen tiap Selasa dan Jumat, bisa antar ke dalam desa.', 'Bulak Sawah Timur, Jati Kulon', '628120000006', 'aktif', 6
from kategori k where k.nama = 'Pertanian & Ternak'
on conflict (slug) do nothing;

insert into umkm (nama, slug, kategori_id, deskripsi, alamat, nomor_wa, status, urutan)
select 'Lele Segar Kulon Kali', 'lele-segar-kulon-kali', k.id, 'Kolam bioflok lele dan nila. Panen harian, ikan diambil hidup di tempat. Juga menyediakan bibit untuk warga yang mau mulai budidaya.', 'Belakang Balai Desa Jati Kulon', '628120000007', 'aktif', 7
from kategori k where k.nama = 'Pertanian & Ternak'
on conflict (slug) do nothing;

insert into umkm (nama, slug, kategori_id, deskripsi, alamat, nomor_wa, status, urutan)
select 'Servis Elektronik Mas Topo', 'servis-elektronik-mas-topo', k.id, 'Perbaikan kipas angin, magic com, mesin cuci, dan instalasi listrik rumah. Bisa panggilan ke rumah untuk wilayah Kecamatan Jati.', 'Jl. Raya Jati Kulon No. 3', '628120000008', 'nonaktif', 8
from kategori k where k.nama = 'Jasa'
on conflict (slug) do nothing;

-- produk
insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Jenang Kudus Wijen', 'Kotak isi 20 bungkus, tekstur legit, tahan 3 minggu tanpa pengawet.', 35000, 'kotak', 'tersedia', 1
from umkm u where u.slug = 'jenang-bu-sriatun';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Jenang Ketan Hitam', 'Varian ketan hitam, manisnya lebih tipis.', 38000, 'kotak', 'tersedia', 2
from umkm u where u.slug = 'jenang-bu-sriatun';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Besek Hantaran Jenang', 'Besek bambu isi campur untuk hajatan, minimal pesan 10 besek, kabari H-3.', 55000, 'besek', 'tersedia', 3
from umkm u where u.slug = 'jenang-bu-sriatun';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Dodol Durian Musiman', 'Hanya ada saat musim durian Colo.', 45000, 'kotak', 'habis', 4
from umkm u where u.slug = 'jenang-bu-sriatun';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Gebyok Ukir Motif Kudusan', 'Kayu jati tua, ukuran menyesuaikan pintu rumah. Harga mulai dari, pengerjaan 6–10 minggu.', 18500000, 'set', 'tersedia', 1
from umkm u where u.slug = 'ukir-jati-barokah';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Talenan Jati Ukir', 'Talenan tebal 3 cm dengan ukiran pinggir.', 95000, 'pcs', 'tersedia', 2
from umkm u where u.slug = 'ukir-jati-barokah';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Souvenir Miniatur Menara', 'Miniatur Menara Kudus tinggi 20 cm, cocok untuk oleh-oleh kantor.', 120000, 'pcs', 'tersedia', 3
from umkm u where u.slug = 'ukir-jati-barokah';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Kusen Pintu Jati', null, 2750000, 'unit', 'tersedia', 4
from umkm u where u.slug = 'ukir-jati-barokah';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Kaos Komunitas Sablon', 'Cotton combed 30s, sablon plastisol, minimal 12 potong.', 68000, 'potong', 'tersedia', 1
from umkm u where u.slug = 'konveksi-bordir-amanah';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Seragam Sekolah SD', 'Satu set atasan dan bawahan, ukuran S sampai XL.', 135000, 'set', 'tersedia', 2
from umkm u where u.slug = 'konveksi-bordir-amanah';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Bordir Logo Instansi', 'Bordir komputer, hitungan per titik logo.', 15000, 'titik', 'tersedia', 3
from umkm u where u.slug = 'konveksi-bordir-amanah';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Keripik Tempe Original', 'Kemasan 250 gram, renyah tanpa tepung berlebih.', 18000, 'bungkus', 'tersedia', 1
from umkm u where u.slug = 'keripik-tempe-pak-warno';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Keripik Tempe Daun Jeruk', 'Pedasnya sedang, wangi daun jeruk purut.', 20000, 'bungkus', 'tersedia', 2
from umkm u where u.slug = 'keripik-tempe-pak-warno';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Keripik Tempe Balado', null, 20000, 'bungkus', 'habis', 3
from umkm u where u.slug = 'keripik-tempe-pak-warno';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Kain Batik Tulis Parijoto', 'Kain katun primisima 2,4 meter. Pengerjaan tulis penuh sekitar tiga minggu, motif buah parijoto khas lereng Muria.', 850000, 'lembar', 'tersedia', 1
from umkm u where u.slug = 'batik-tulis-sekar-muria';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Batik Cap Tembakau', 'Kain cap 2 meter, warna nila alami.', 275000, 'lembar', 'tersedia', 2
from umkm u where u.slug = 'batik-tulis-sekar-muria';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Selendang Batik Pesisir', null, 165000, 'pcs', 'tersedia', 3
from umkm u where u.slug = 'batik-tulis-sekar-muria';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Kemeja Batik Pria', 'Ukuran M sampai XXL, jahitan konveksi desa sendiri.', 210000, 'pcs', 'tersedia', 4
from umkm u where u.slug = 'batik-tulis-sekar-muria';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Selada Hidroponik', 'Dipanen pagi hari pesanan diantar sore.', 12000, 'pack', 'tersedia', 1
from umkm u where u.slug = 'tani-jaya-jati-kulon';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Beras Sawah Jati Kulon', 'Beras pera hasil panen sawah desa, digiling di penggilingan warga.', 68000, '5 kg', 'tersedia', 2
from umkm u where u.slug = 'tani-jaya-jati-kulon';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Pakcoy Segar', null, 10000, 'pack', 'tersedia', 3
from umkm u where u.slug = 'tani-jaya-jati-kulon';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Lele Konsumsi', 'Ukuran 8–10 ekor per kilo, diambil hidup di kolam.', 24000, 'kg', 'tersedia', 1
from umkm u where u.slug = 'lele-segar-kulon-kali';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Bibit Lele', 'Ukuran 5–7 cm, tersedia tiap awal bulan.', 350, 'ekor', 'tersedia', 2
from umkm u where u.slug = 'lele-segar-kulon-kali';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Nila Merah', null, 32000, 'kg', 'habis', 3
from umkm u where u.slug = 'lele-segar-kulon-kali';

insert into produk (umkm_id, nama, deskripsi, harga, satuan, status, urutan)
select u.id, 'Servis Kipas Angin', 'Termasuk ganti bearing dan kapasitor.', 45000, 'unit', 'tersedia', 1
from umkm u where u.slug = 'servis-elektronik-mas-topo';

-- profil BUMDes (baris tunggal)
insert into profil_bumdes (id, nama_bumdes, sambutan, visi, misi)
values (1, 'BUMDes Jati Kulon Makmur', 'Assalamualaikum warahmatullahi wabarakatuh. Katalog LARIS ini kami susun supaya usaha warga Jati Kulon punya etalase yang bisa dilihat siapa saja, kapan saja. Dulu pembeli harus tahu rumahnya dulu baru bisa pesan; sekarang cukup buka halaman ini, pilih produknya, lalu hubungi langsung pemiliknya lewat WhatsApp. Tidak ada potongan, tidak ada perantara — uangnya utuh sampai ke pelaku usaha. Semoga membawa berkah untuk desa kita.', 'Menjadi penggerak ekonomi warga Jati Kulon yang mandiri, guyub, dan berkelanjutan.', 'Mendata dan mendampingi unit usaha warga agar naik kelas.
Membuka akses pasar lewat kanal digital yang gratis dan mudah dipakai.
Menjaga kualitas produk khas desa: jenang, ukir jati, batik, dan hasil tani.
Mengembalikan hasil usaha desa untuk kegiatan warga.')
on conflict (id) do update set
  nama_bumdes = excluded.nama_bumdes,
  sambutan = excluded.sambutan,
  visi = excluded.visi,
  misi = excluded.misi;
