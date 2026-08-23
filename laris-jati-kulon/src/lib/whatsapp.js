import { TEMPLATE_PESAN_WA } from '../config/site'
import { rupiah } from './format'

/**
 * Nomor WA disimpan format internasional tanpa "+" dan tanpa "0" di depan.
 * Fungsi ini merapikan input yang terlanjur berbeda (spasi, "+62", "08...").
 */
export function normalkanNomorWa(input = '') {
  let n = String(input).replace(/[^\d]/g, '')
  if (n.startsWith('0')) n = '62' + n.slice(1)
  if (n.startsWith('620')) n = '62' + n.slice(3)
  return n
}

/** Validasi dipakai juga oleh form admin: 62 + 9–13 digit */
export function nomorWaValid(input = '') {
  return /^62\d{9,13}$/.test(normalkanNomorWa(input))
}

/** Link wa.me lengkap dengan pesan template ter-encode */
export function tautanPesan({ namaUmkm, namaProduk, harga, nomorWa }) {
  const nomor = normalkanNomorWa(nomorWa)
  if (!nomor) return null
  const pesan = TEMPLATE_PESAN_WA.replace('{nama_umkm}', namaUmkm || 'Bapak/Ibu')
    .replace('{nama_produk}', namaProduk || 'produk')
    .replace('{harga}', rupiah(harga) || 'harga belum tercantum')
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`
}

/** Link WA umum ke sebuah UMKM (tanpa produk tertentu) */
export function tautanTanya({ namaUmkm, nomorWa }) {
  const nomor = normalkanNomorWa(nomorWa)
  if (!nomor) return null
  const pesan = `Halo ${namaUmkm || 'Bapak/Ibu'}, saya lihat profil usaha Anda di katalog LARIS Jati Kulon. Boleh tanya-tanya dulu?`
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`
}
