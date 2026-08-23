/* =========================================================================
   Penyimpanan sementara di memori untuk MODE CONTOH (saat .env belum diisi).

   Tujuannya supaya panel admin tetap bisa diklik-klik dan dinilai tampilannya
   tanpa perlu Supabase. Perubahan hanya hidup selama halaman belum dimuat
   ulang — ini disengaja, dan selalu diberi tahu lewat pita peringatan di layar.
   ========================================================================= */

import * as awal from '../data/dummy'
import { buatSlug } from './format'

const salin = (v) => JSON.parse(JSON.stringify(v))

const toko = {
  kategori: salin(awal.kategori),
  umkm: salin(awal.umkm),
  produk: salin(awal.produk),
  profil: salin(awal.profilBumdes),
}

let urut = 100
const idBaru = (awalan) => `${awalan}${(urut += 1)}`
const sekarang = () => new Date().toISOString()

/* ------------------------------- kategori ------------------------------- */

export const kategoriSemua = () => salin(toko.kategori).sort((a, b) => a.urutan - b.urutan)

export function kategoriSimpan(data) {
  if (data.id) {
    const k = toko.kategori.find((x) => x.id === data.id)
    Object.assign(k, { nama: data.nama, urutan: Number(data.urutan) || 0 })
    return salin(k)
  }
  const baru = { id: idBaru('k'), nama: data.nama, urutan: Number(data.urutan) || 0 }
  toko.kategori.push(baru)
  return salin(baru)
}

export function kategoriHapus(id) {
  toko.kategori = toko.kategori.filter((k) => k.id !== id)
  toko.umkm.forEach((u) => {
    if (u.kategori_id === id) u.kategori_id = null
  })
}

/* --------------------------------- umkm --------------------------------- */

export function umkmSemua() {
  return salin(toko.umkm)
    .sort((a, b) => a.urutan - b.urutan)
    .map((u) => ({
      ...u,
      kategori_nama: toko.kategori.find((k) => k.id === u.kategori_id)?.nama ?? null,
      jumlah_produk: toko.produk.filter((p) => p.umkm_id === u.id).length,
    }))
}

export function umkmSatu(id) {
  const u = toko.umkm.find((x) => x.id === id)
  if (!u) return null
  return {
    ...salin(u),
    kategori_nama: toko.kategori.find((k) => k.id === u.kategori_id)?.nama ?? null,
  }
}

export function umkmSimpan(data) {
  const slug = data.slug || buatSlug(data.nama)
  const bentrok = toko.umkm.find((u) => u.slug === slug && u.id !== data.id)
  if (bentrok) {
    const e = new Error('Slug sudah dipakai usaha lain')
    e.code = '23505'
    throw e
  }
  if (data.id) {
    const u = toko.umkm.find((x) => x.id === data.id)
    Object.assign(u, data, { slug, updated_at: sekarang() })
    return salin(u)
  }
  const baru = {
    ...data,
    id: idBaru('u'),
    slug,
    created_at: sekarang(),
    updated_at: sekarang(),
  }
  toko.umkm.push(baru)
  return salin(baru)
}

export function umkmUbahStatus(id, status) {
  const u = toko.umkm.find((x) => x.id === id)
  u.status = status
  u.updated_at = sekarang()
  return salin(u)
}

export function umkmTukarUrutan(idA, idB) {
  const a = toko.umkm.find((x) => x.id === idA)
  const b = toko.umkm.find((x) => x.id === idB)
  const t = a.urutan
  a.urutan = b.urutan
  b.urutan = t
}

/* -------------------------------- produk -------------------------------- */

export const produkMilik = (umkmId) =>
  salin(toko.produk.filter((p) => p.umkm_id === umkmId)).sort((a, b) => a.urutan - b.urutan)

export function produkSimpan(data) {
  if (data.id) {
    const p = toko.produk.find((x) => x.id === data.id)
    Object.assign(p, data, { updated_at: sekarang() })
    return salin(p)
  }
  const baru = { ...data, id: idBaru('p'), created_at: sekarang(), updated_at: sekarang() }
  toko.produk.push(baru)
  return salin(baru)
}

export function produkUbahStatus(id, status) {
  const p = toko.produk.find((x) => x.id === id)
  p.status = status
  return salin(p)
}

export function produkHapus(id) {
  toko.produk = toko.produk.filter((p) => p.id !== id)
}

/* ---------------------------- profil & angka ---------------------------- */

export const profilAmbil = () => salin(toko.profil)

export function profilSimpan(data) {
  Object.assign(toko.profil, data)
  return salin(toko.profil)
}

export function ringkasan() {
  return {
    umkmAktif: toko.umkm.filter((u) => u.status === 'aktif').length,
    umkmNonaktif: toko.umkm.filter((u) => u.status === 'nonaktif').length,
    produkTersedia: toko.produk.filter((p) => p.status === 'tersedia').length,
    produkHabis: toko.produk.filter((p) => p.status === 'habis').length,
    terbaru: salin(toko.umkm)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .slice(0, 5)
      .map((u) => ({
        ...u,
        kategori_nama: toko.kategori.find((k) => k.id === u.kategori_id)?.nama ?? null,
      })),
  }
}
