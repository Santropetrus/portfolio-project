/* =========================================================================
   Data dummy untuk tahap pengembangan tampilan.
   Bentuk objeknya SAMA PERSIS dengan tabel Supabase (lihat supabase/schema.sql)
   supaya nanti tinggal ganti sumbernya di src/lib/api.js tanpa ubah komponen.

   CATATAN: semua nomor WhatsApp di bawah ini sengaja nomor palsu
   (62812-0000-00xx) supaya tidak ada orang asli yang tertelepon saat testing.
   ========================================================================= */

export const kategori = [
  { id: 'k1', nama: 'Kuliner', urutan: 1 },
  { id: 'k2', nama: 'Kerajinan Kayu', urutan: 2 },
  { id: 'k3', nama: 'Konveksi & Batik', urutan: 3 },
  { id: 'k4', nama: 'Pertanian & Ternak', urutan: 4 },
  { id: 'k5', nama: 'Jasa', urutan: 5 },
]

export const umkm = [
  {
    id: 'u1',
    nama: 'Jenang Bu Sriatun',
    slug: 'jenang-bu-sriatun',
    kategori_id: 'k1',
    deskripsi:
      'Jenang kudus rumahan yang diaduk manual di wajan tembaga sejak 1998. Santan kelapa diperas hari itu juga, gula aren dari Colo. Melayani pesanan hantaran, oleh-oleh, dan besek hajatan.',
    alamat: 'RT 02 / RW 03, Jati Kulon',
    nomor_wa: '628120000001',
    foto_profil_url: null,
    status: 'aktif',
    urutan: 1,
    created_at: '2026-05-04T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'u2',
    nama: 'Ukir Jati Barokah',
    slug: 'ukir-jati-barokah',
    kategori_id: 'k2',
    deskripsi:
      'Bengkel ukir kayu jati milik Pak Sukardi dan tiga perajin muda desa. Mengerjakan gebyok, kusen motif Kudusan, sampai souvenir kecil. Bisa custom ukuran dan motif.',
    alamat: 'Jl. Raya Jati Kulon No. 14',
    nomor_wa: '628120000002',
    foto_profil_url: null,
    status: 'aktif',
    urutan: 2,
    created_at: '2026-05-04T08:10:00Z',
    updated_at: '2026-08-02T08:00:00Z',
  },
  {
    id: 'u3',
    nama: 'Konveksi Bordir Amanah',
    slug: 'konveksi-bordir-amanah',
    kategori_id: 'k3',
    deskripsi:
      'Menerima jahit seragam sekolah, kaos komunitas, dan bordir logo. Dikerjakan sembilan penjahit ibu-ibu warga Jati Kulon. Minimal order 12 potong.',
    alamat: 'RT 05 / RW 01, Jati Kulon',
    nomor_wa: '628120000003',
    foto_profil_url: null,
    status: 'aktif',
    urutan: 3,
    created_at: '2026-05-06T08:00:00Z',
    updated_at: '2026-08-03T08:00:00Z',
  },
  {
    id: 'u4',
    nama: 'Keripik Tempe Pak Warno',
    slug: 'keripik-tempe-pak-warno',
    kategori_id: 'k1',
    deskripsi:
      'Keripik tempe tipis, digoreng pakai minyak baru tiap batch. Tersedia varian original, pedas daun jeruk, dan balado.',
    alamat: 'RT 01 / RW 02, Jati Kulon',
    nomor_wa: '628120000004',
    foto_profil_url: null,
    status: 'aktif',
    urutan: 4,
    created_at: '2026-05-10T08:00:00Z',
    updated_at: '2026-08-04T08:00:00Z',
  },
  {
    id: 'u5',
    nama: 'Batik Tulis Sekar Muria',
    slug: 'batik-tulis-sekar-muria',
    kategori_id: 'k3',
    deskripsi:
      'Batik tulis dan cap bermotif pesisiran Kudus — parijoto, kapal kandas, tembakau. Pewarna nila alami untuk seri terbatas. Kelompok perajin binaan PKK desa.',
    alamat: 'RT 04 / RW 03, Jati Kulon',
    nomor_wa: '628120000005',
    foto_profil_url: null,
    status: 'aktif',
    urutan: 5,
    created_at: '2026-05-12T08:00:00Z',
    updated_at: '2026-08-05T08:00:00Z',
  },
  {
    id: 'u6',
    nama: 'Tani Jaya Jati Kulon',
    slug: 'tani-jaya-jati-kulon',
    kategori_id: 'k4',
    deskripsi:
      'Kelompok tani yang mengelola sayur hidroponik dan beras hasil panen sawah desa. Panen tiap Selasa dan Jumat, bisa antar ke dalam desa.',
    alamat: 'Bulak Sawah Timur, Jati Kulon',
    nomor_wa: '628120000006',
    foto_profil_url: null,
    status: 'aktif',
    urutan: 6,
    created_at: '2026-05-20T08:00:00Z',
    updated_at: '2026-08-06T08:00:00Z',
  },
  {
    id: 'u7',
    nama: 'Lele Segar Kulon Kali',
    slug: 'lele-segar-kulon-kali',
    kategori_id: 'k4',
    deskripsi:
      'Kolam bioflok lele dan nila. Panen harian, ikan diambil hidup di tempat. Juga menyediakan bibit untuk warga yang mau mulai budidaya.',
    alamat: 'Belakang Balai Desa Jati Kulon',
    nomor_wa: '628120000007',
    foto_profil_url: null,
    status: 'aktif',
    urutan: 7,
    created_at: '2026-06-02T08:00:00Z',
    updated_at: '2026-08-07T08:00:00Z',
  },
  {
    id: 'u8',
    nama: 'Servis Elektronik Mas Topo',
    slug: 'servis-elektronik-mas-topo',
    kategori_id: 'k5',
    deskripsi:
      'Perbaikan kipas angin, magic com, mesin cuci, dan instalasi listrik rumah. Bisa panggilan ke rumah untuk wilayah Kecamatan Jati.',
    alamat: 'Jl. Raya Jati Kulon No. 3',
    nomor_wa: '628120000008',
    foto_profil_url: null,
    status: 'nonaktif',
    urutan: 8,
    created_at: '2026-06-11T08:00:00Z',
    updated_at: '2026-08-08T08:00:00Z',
  },
]

export const produk = [
  // Jenang Bu Sriatun
  { id: 'p1', umkm_id: 'u1', nama: 'Jenang Kudus Wijen', deskripsi: 'Kotak isi 20 bungkus, tekstur legit, tahan 3 minggu tanpa pengawet.', harga: 35000, satuan: 'kotak', foto_url: null, status: 'tersedia', urutan: 1 },
  { id: 'p2', umkm_id: 'u1', nama: 'Jenang Ketan Hitam', deskripsi: 'Varian ketan hitam, manisnya lebih tipis.', harga: 38000, satuan: 'kotak', foto_url: null, status: 'tersedia', urutan: 2 },
  { id: 'p3', umkm_id: 'u1', nama: 'Besek Hantaran Jenang', deskripsi: 'Besek bambu isi campur untuk hajatan, minimal pesan 10 besek, kabari H-3.', harga: 55000, satuan: 'besek', foto_url: null, status: 'tersedia', urutan: 3 },
  { id: 'p4', umkm_id: 'u1', nama: 'Dodol Durian Musiman', deskripsi: 'Hanya ada saat musim durian Colo.', harga: 45000, satuan: 'kotak', foto_url: null, status: 'habis', urutan: 4 },

  // Ukir Jati Barokah
  { id: 'p5', umkm_id: 'u2', nama: 'Gebyok Ukir Motif Kudusan', deskripsi: 'Kayu jati tua, ukuran menyesuaikan pintu rumah. Harga mulai dari, pengerjaan 6–10 minggu.', harga: 18500000, satuan: 'set', foto_url: null, status: 'tersedia', urutan: 1 },
  { id: 'p6', umkm_id: 'u2', nama: 'Talenan Jati Ukir', deskripsi: 'Talenan tebal 3 cm dengan ukiran pinggir.', harga: 95000, satuan: 'pcs', foto_url: null, status: 'tersedia', urutan: 2 },
  { id: 'p7', umkm_id: 'u2', nama: 'Souvenir Miniatur Menara', deskripsi: 'Miniatur Menara Kudus tinggi 20 cm, cocok untuk oleh-oleh kantor.', harga: 120000, satuan: 'pcs', foto_url: null, status: 'tersedia', urutan: 3 },
  { id: 'p8', umkm_id: 'u2', nama: 'Kusen Pintu Jati', deskripsi: null, harga: 2750000, satuan: 'unit', foto_url: null, status: 'tersedia', urutan: 4 },

  // Konveksi Bordir Amanah
  { id: 'p9', umkm_id: 'u3', nama: 'Kaos Komunitas Sablon', deskripsi: 'Cotton combed 30s, sablon plastisol, minimal 12 potong.', harga: 68000, satuan: 'potong', foto_url: null, status: 'tersedia', urutan: 1 },
  { id: 'p10', umkm_id: 'u3', nama: 'Seragam Sekolah SD', deskripsi: 'Satu set atasan dan bawahan, ukuran S sampai XL.', harga: 135000, satuan: 'set', foto_url: null, status: 'tersedia', urutan: 2 },
  { id: 'p11', umkm_id: 'u3', nama: 'Bordir Logo Instansi', deskripsi: 'Bordir komputer, hitungan per titik logo.', harga: 15000, satuan: 'titik', foto_url: null, status: 'tersedia', urutan: 3 },

  // Keripik Tempe Pak Warno
  { id: 'p12', umkm_id: 'u4', nama: 'Keripik Tempe Original', deskripsi: 'Kemasan 250 gram, renyah tanpa tepung berlebih.', harga: 18000, satuan: 'bungkus', foto_url: null, status: 'tersedia', urutan: 1 },
  { id: 'p13', umkm_id: 'u4', nama: 'Keripik Tempe Daun Jeruk', deskripsi: 'Pedasnya sedang, wangi daun jeruk purut.', harga: 20000, satuan: 'bungkus', foto_url: null, status: 'tersedia', urutan: 2 },
  { id: 'p14', umkm_id: 'u4', nama: 'Keripik Tempe Balado', deskripsi: null, harga: 20000, satuan: 'bungkus', foto_url: null, status: 'habis', urutan: 3 },

  // Batik Tulis Sekar Muria
  { id: 'p15', umkm_id: 'u5', nama: 'Kain Batik Tulis Parijoto', deskripsi: 'Kain katun primisima 2,4 meter. Pengerjaan tulis penuh sekitar tiga minggu, motif buah parijoto khas lereng Muria.', harga: 850000, satuan: 'lembar', foto_url: null, status: 'tersedia', urutan: 1 },
  { id: 'p16', umkm_id: 'u5', nama: 'Batik Cap Tembakau', deskripsi: 'Kain cap 2 meter, warna nila alami.', harga: 275000, satuan: 'lembar', foto_url: null, status: 'tersedia', urutan: 2 },
  { id: 'p17', umkm_id: 'u5', nama: 'Selendang Batik Pesisir', deskripsi: null, harga: 165000, satuan: 'pcs', foto_url: null, status: 'tersedia', urutan: 3 },
  { id: 'p18', umkm_id: 'u5', nama: 'Kemeja Batik Pria', deskripsi: 'Ukuran M sampai XXL, jahitan konveksi desa sendiri.', harga: 210000, satuan: 'pcs', foto_url: null, status: 'tersedia', urutan: 4 },

  // Tani Jaya Jati Kulon
  { id: 'p19', umkm_id: 'u6', nama: 'Selada Hidroponik', deskripsi: 'Dipanen pagi hari pesanan diantar sore.', harga: 12000, satuan: 'pack', foto_url: null, status: 'tersedia', urutan: 1 },
  { id: 'p20', umkm_id: 'u6', nama: 'Beras Sawah Jati Kulon', deskripsi: 'Beras pera hasil panen sawah desa, digiling di penggilingan warga.', harga: 68000, satuan: '5 kg', foto_url: null, status: 'tersedia', urutan: 2 },
  { id: 'p21', umkm_id: 'u6', nama: 'Pakcoy Segar', deskripsi: null, harga: 10000, satuan: 'pack', foto_url: null, status: 'tersedia', urutan: 3 },

  // Lele Segar Kulon Kali
  { id: 'p22', umkm_id: 'u7', nama: 'Lele Konsumsi', deskripsi: 'Ukuran 8–10 ekor per kilo, diambil hidup di kolam.', harga: 24000, satuan: 'kg', foto_url: null, status: 'tersedia', urutan: 1 },
  { id: 'p23', umkm_id: 'u7', nama: 'Bibit Lele', deskripsi: 'Ukuran 5–7 cm, tersedia tiap awal bulan.', harga: 350, satuan: 'ekor', foto_url: null, status: 'tersedia', urutan: 2 },
  { id: 'p24', umkm_id: 'u7', nama: 'Nila Merah', deskripsi: null, harga: 32000, satuan: 'kg', foto_url: null, status: 'habis', urutan: 3 },

  // Servis Elektronik Mas Topo (UMKM nonaktif)
  { id: 'p25', umkm_id: 'u8', nama: 'Servis Kipas Angin', deskripsi: 'Termasuk ganti bearing dan kapasitor.', harga: 45000, satuan: 'unit', foto_url: null, status: 'tersedia', urutan: 1 },
]

export const profilBumdes = {
  id: 1,
  nama_bumdes: 'BUMDes Jati Kulon Makmur',
  sambutan:
    'Assalamualaikum warahmatullahi wabarakatuh. Katalog LARIS ini kami susun supaya usaha warga Jati Kulon punya etalase yang bisa dilihat siapa saja, kapan saja. Dulu pembeli harus tahu rumahnya dulu baru bisa pesan; sekarang cukup buka halaman ini, pilih produknya, lalu hubungi langsung pemiliknya lewat WhatsApp. Tidak ada potongan, tidak ada perantara — uangnya utuh sampai ke pelaku usaha. Semoga membawa berkah untuk desa kita.',
  visi: 'Menjadi penggerak ekonomi warga Jati Kulon yang mandiri, guyub, dan berkelanjutan.',
  misi: [
    'Mendata dan mendampingi unit usaha warga agar naik kelas.',
    'Membuka akses pasar lewat kanal digital yang gratis dan mudah dipakai.',
    'Menjaga kualitas produk khas desa: jenang, ukir jati, batik, dan hasil tani.',
    'Mengembalikan hasil usaha desa untuk kegiatan warga.',
  ].join('\n'),
  logo_url: null,
}

/** Ringkasan yang biasa dipakai di dashboard admin (tahap berikutnya) */
export const statistik = {
  totalUmkm: umkm.filter((u) => u.status === 'aktif').length,
  totalProduk: produk.length,
}
