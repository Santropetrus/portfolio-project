/**
 * Identitas aplikasi — SATU-SATUNYA tempat nama & tagline ditulis.
 * Ganti di sini kalau nama aplikasi berubah; jangan hardcode di komponen.
 */
export const SITE = {
  nama: 'LARIS',
  namaLengkap: 'LARIS — UMKM Jati Kulon',
  tagline: 'Guyub UMKM, laris berkah',
  desa: 'Desa Jati Kulon',
  wilayah: 'Kec. Jati, Kab. Kudus',
  pengelola: 'BUMDes Desa Jati Kulon',
}

/** Template pesan WhatsApp (dipakai di lib/whatsapp.js) */
export const TEMPLATE_PESAN_WA =
  'Halo {nama_umkm}, saya mau pesan {nama_produk} ({harga}) yang saya lihat di katalog LARIS Jati Kulon. Apakah masih tersedia?'

/** Jumlah item sorotan di beranda */
export const JUMLAH_SOROTAN = { umkm: 6, produk: 8 }
