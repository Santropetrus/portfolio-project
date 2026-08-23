/* =========================================================================
   Operasi tulis untuk panel admin.
   Sama seperti api.js: komponen tidak pernah memanggil Supabase langsung.
   Bila .env belum diisi, semua operasi dialihkan ke penyimpanan memori
   (src/lib/tokoDummy.js) supaya panel tetap bisa dicoba.
   ========================================================================= */

import imageCompression from 'browser-image-compression'
import { supabase, supabaseSiap } from './supabase'
import * as toko from './tokoDummy'

const lempar = ({ data, error }) => {
  if (error) throw error
  return data
}

/* ------------------------------- ringkasan ------------------------------ */

export async function ambilRingkasan() {
  if (!supabaseSiap) return toko.ringkasan()

  const [umkm, produk, terbaru] = await Promise.all([
    supabase.from('umkm').select('status'),
    supabase.from('produk').select('status'),
    supabase
      .from('umkm')
      .select('id, nama, slug, status, created_at, kategori(nama)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const daftarUmkm = lempar(umkm) || []
  const daftarProduk = lempar(produk) || []

  return {
    umkmAktif: daftarUmkm.filter((u) => u.status === 'aktif').length,
    umkmNonaktif: daftarUmkm.filter((u) => u.status === 'nonaktif').length,
    produkTersedia: daftarProduk.filter((p) => p.status === 'tersedia').length,
    produkHabis: daftarProduk.filter((p) => p.status === 'habis').length,
    terbaru: (lempar(terbaru) || []).map((u) => ({
      ...u,
      kategori_nama: u.kategori?.nama ?? null,
    })),
  }
}

/* --------------------------------- umkm --------------------------------- */

/** Semua UMKM termasuk yang nonaktif — khusus panel admin */
export async function ambilSemuaUmkm() {
  if (!supabaseSiap) return toko.umkmSemua()

  const data = lempar(
    await supabase
      .from('umkm')
      .select('*, kategori(nama), produk(count)')
      .order('urutan', { ascending: true }),
  )
  return (data || []).map((u) => ({
    ...u,
    kategori_nama: u.kategori?.nama ?? null,
    jumlah_produk: u.produk?.[0]?.count ?? 0,
  }))
}

export async function ambilUmkm(id) {
  if (!supabaseSiap) return toko.umkmSatu(id)

  const data = lempar(
    await supabase.from('umkm').select('*, kategori(nama)').eq('id', id).maybeSingle(),
  )
  return data ? { ...data, kategori_nama: data.kategori?.nama ?? null } : null
}

export async function simpanUmkm(isian) {
  const baris = {
    nama: isian.nama,
    slug: isian.slug,
    kategori_id: isian.kategori_id || null,
    deskripsi: isian.deskripsi || null,
    alamat: isian.alamat || null,
    nomor_wa: isian.nomor_wa,
    foto_profil_url: isian.foto_profil_url || null,
    status: isian.status,
    urutan: Number(isian.urutan) || 0,
  }

  if (!supabaseSiap) return toko.umkmSimpan({ ...baris, id: isian.id })

  if (isian.id) {
    return lempar(await supabase.from('umkm').update(baris).eq('id', isian.id).select().single())
  }
  return lempar(await supabase.from('umkm').insert(baris).select().single())
}

export async function ubahStatusUmkm(id, status) {
  if (!supabaseSiap) return toko.umkmUbahStatus(id, status)
  return lempar(await supabase.from('umkm').update({ status }).eq('id', id).select().single())
}

/** Tukar nilai `urutan` dua UMKM — dipakai tombol naik/turun di tabel admin */
export async function tukarUrutanUmkm(a, b) {
  if (!supabaseSiap) return toko.umkmTukarUrutan(a.id, b.id)
  const hasil = await Promise.all([
    supabase.from('umkm').update({ urutan: b.urutan }).eq('id', a.id),
    supabase.from('umkm').update({ urutan: a.urutan }).eq('id', b.id),
  ])
  hasil.forEach(lempar)
  return true
}

/* -------------------------------- produk -------------------------------- */

export async function ambilProduk(umkmId) {
  if (!supabaseSiap) return toko.produkMilik(umkmId)
  return (
    lempar(
      await supabase
        .from('produk')
        .select('*')
        .eq('umkm_id', umkmId)
        .order('urutan', { ascending: true }),
    ) || []
  )
}

export async function simpanProduk(isian) {
  const baris = {
    umkm_id: isian.umkm_id,
    nama: isian.nama,
    deskripsi: isian.deskripsi || null,
    harga: isian.harga === '' || isian.harga === null ? null : Number(isian.harga),
    satuan: isian.satuan || null,
    foto_url: isian.foto_url || null,
    status: isian.status,
    urutan: Number(isian.urutan) || 0,
  }

  if (!supabaseSiap) return toko.produkSimpan({ ...baris, id: isian.id })

  if (isian.id) {
    return lempar(await supabase.from('produk').update(baris).eq('id', isian.id).select().single())
  }
  return lempar(await supabase.from('produk').insert(baris).select().single())
}

export async function ubahStatusProduk(id, status) {
  if (!supabaseSiap) return toko.produkUbahStatus(id, status)
  return lempar(await supabase.from('produk').update({ status }).eq('id', id).select().single())
}

export async function hapusProduk(id) {
  if (!supabaseSiap) return toko.produkHapus(id)
  return lempar(await supabase.from('produk').delete().eq('id', id))
}

/* ------------------------------- kategori ------------------------------- */

export async function ambilKategoriAdmin() {
  if (!supabaseSiap) return toko.kategoriSemua()
  return (
    lempar(await supabase.from('kategori').select('*').order('urutan', { ascending: true })) || []
  )
}

export async function simpanKategori(isian) {
  const baris = { nama: isian.nama, urutan: Number(isian.urutan) || 0 }
  if (!supabaseSiap) return toko.kategoriSimpan({ ...baris, id: isian.id })

  if (isian.id) {
    return lempar(await supabase.from('kategori').update(baris).eq('id', isian.id).select().single())
  }
  return lempar(await supabase.from('kategori').insert(baris).select().single())
}

export async function hapusKategori(id) {
  if (!supabaseSiap) return toko.kategoriHapus(id)
  return lempar(await supabase.from('kategori').delete().eq('id', id))
}

/* --------------------------- profil bumdes ------------------------------ */

export async function ambilProfilAdmin() {
  if (!supabaseSiap) return toko.profilAmbil()
  return lempar(await supabase.from('profil_bumdes').select('*').eq('id', 1).maybeSingle())
}

export async function simpanProfil(isian) {
  const baris = {
    id: 1,
    nama_bumdes: isian.nama_bumdes || null,
    sambutan: isian.sambutan || null,
    visi: isian.visi || null,
    misi: isian.misi || null,
    logo_url: isian.logo_url || null,
  }
  if (!supabaseSiap) return toko.profilSimpan(baris)
  return lempar(await supabase.from('profil_bumdes').upsert(baris).select().single())
}

/* --------------------------------- foto --------------------------------- */

export const BUCKET_UMKM = 'umkm-foto'
export const BUCKET_PRODUK = 'produk-foto'

/**
 * Kompresi di sisi klien sebelum unggah. Foto dari kamera HP biasanya 3–8 MB;
 * setelah dikecilkan jadi ratusan KB, kuota Supabase gratis jauh lebih awet
 * dan halaman tetap ringan dibuka pakai data seluler.
 */
async function kecilkan(berkas) {
  if (!berkas.type.startsWith('image/')) {
    throw new Error('Berkas yang dipilih bukan gambar.')
  }
  return imageCompression(berkas, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1400,
    useWebWorker: true,
    initialQuality: 0.8,
  })
}

function namaBerkas(berkas, awalan) {
  const ekstensi = (berkas.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const acak = Math.random().toString(36).slice(2, 8)
  return `${awalan}-${Date.now()}-${acak}.${ekstensi}`
}

export async function unggahFoto({ berkas, bucket, awalan = 'foto' }) {
  const kecil = await kecilkan(berkas)

  if (!supabaseSiap) {
    // mode contoh: tampilkan pratinjau lokal, tidak ada yang dikirim ke mana pun
    return new Promise((selesai, gagal) => {
      const pembaca = new FileReader()
      pembaca.onload = () => selesai({ url: pembaca.result, path: null, ukuran: kecil.size })
      pembaca.onerror = () => gagal(new Error('Gagal membaca berkas gambar.'))
      pembaca.readAsDataURL(kecil)
    })
  }

  const path = namaBerkas(berkas, awalan)
  const { error } = await supabase.storage.from(bucket).upload(path, kecil, {
    cacheControl: '3600',
    upsert: false,
    contentType: kecil.type || berkas.type,
  })
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl, path, ukuran: kecil.size }
}

/** Hapus foto lama setelah diganti — dilakukan sebisanya, kegagalan diabaikan */
export async function hapusFoto(url, bucket) {
  if (!supabaseSiap || !url) return
  const penanda = `/object/public/${bucket}/`
  const posisi = url.indexOf(penanda)
  if (posisi === -1) return
  const path = url.slice(posisi + penanda.length).split('?')[0]
  try {
    await supabase.storage.from(bucket).remove([decodeURIComponent(path)])
  } catch {
    /* foto lama gagal dihapus bukan alasan menggagalkan penyimpanan data */
  }
}

/** Pesan galat Supabase yang sering muncul, diterjemahkan seperlunya */
export function pesanGalat(error) {
  const teks = String(error?.message || error || '')
  if (error?.code === '23505' || /duplicate key/i.test(teks)) {
    return 'Slug atau nama itu sudah dipakai. Ganti dengan yang lain.'
  }
  if (/row-level security|permission denied/i.test(teks)) {
    return 'Tidak punya izin menyimpan. Pastikan masih dalam keadaan login.'
  }
  if (/jwt|token .*expired/i.test(teks)) return 'Sesi login berakhir. Masuk ulang, lalu coba lagi.'
  if (/fetch|network/i.test(teks)) return 'Gagal menghubungi server. Periksa koneksi internet.'
  return teks || 'Terjadi kesalahan yang tidak dikenali.'
}
