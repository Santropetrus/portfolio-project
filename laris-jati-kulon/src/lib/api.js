/* =========================================================================
   Satu-satunya lapisan pengambil data. Komponen TIDAK boleh memanggil
   Supabase langsung — semua lewat sini, supaya perpindahan
   dummy -> Supabase cukup di file ini.

   Kalau .env sudah diisi, otomatis pakai Supabase. Kalau belum, jatuh ke
   data dummy sehingga tampilan tetap bisa dicek tanpa backend.
   ========================================================================= */

import { supabase, supabaseSiap } from './supabase'
import * as dummy from '../data/dummy'

const jeda = (ms = 120) => new Promise((r) => setTimeout(r, ms))

/** Info sumber data aktif — dipakai untuk pita penanda di layar saat dev */
export const sumberData = supabaseSiap ? 'supabase' : 'dummy'

/* ------------------------------- kategori ------------------------------- */

export async function ambilKategori() {
  if (!supabaseSiap) {
    await jeda()
    return [...dummy.kategori].sort((a, b) => a.urutan - b.urutan)
  }
  const { data, error } = await supabase
    .from('kategori')
    .select('id, nama, urutan')
    .order('urutan', { ascending: true })
  if (error) throw error
  return data
}

/* --------------------------------- umkm --------------------------------- */

function lengkapiUmkm(u) {
  const kat = dummy.kategori.find((k) => k.id === u.kategori_id)
  const daftar = dummy.produk.filter((p) => p.umkm_id === u.id)
  return {
    ...u,
    kategori_nama: kat ? kat.nama : null,
    jumlah_produk: daftar.length,
  }
}

export async function ambilDaftarUmkm({ kategoriId = null } = {}) {
  if (!supabaseSiap) {
    await jeda()
    return dummy.umkm
      .filter((u) => u.status === 'aktif')
      .filter((u) => !kategoriId || u.kategori_id === kategoriId)
      .sort((a, b) => a.urutan - b.urutan)
      .map(lengkapiUmkm)
  }
  let q = supabase
    .from('umkm')
    .select('*, kategori(nama), produk(count)')
    .eq('status', 'aktif')
    .order('urutan', { ascending: true })
  if (kategoriId) q = q.eq('kategori_id', kategoriId)
  const { data, error } = await q
  if (error) throw error
  return (data || []).map((u) => ({
    ...u,
    kategori_nama: u.kategori?.nama ?? null,
    jumlah_produk: u.produk?.[0]?.count ?? 0,
  }))
}

export async function ambilUmkmBySlug(slug) {
  if (!supabaseSiap) {
    await jeda()
    const u = dummy.umkm.find((x) => x.slug === slug && x.status === 'aktif')
    if (!u) return null
    return {
      ...lengkapiUmkm(u),
      produk: dummy.produk
        .filter((p) => p.umkm_id === u.id)
        .sort((a, b) => a.urutan - b.urutan),
    }
  }
  const { data, error } = await supabase
    .from('umkm')
    .select('*, kategori(nama), produk(*)')
    .eq('slug', slug)
    .eq('status', 'aktif')
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const produk = [...(data.produk || [])].sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
  return {
    ...data,
    kategori_nama: data.kategori?.nama ?? null,
    jumlah_produk: produk.length,
    produk,
  }
}

/* -------------------------------- produk -------------------------------- */

/**
 * Produk sorotan untuk beranda.
 * Urutan pakai kolom `urutan` milik produk lalu urutan UMKM-nya —
 * jadi admin bisa mengatur apa yang tampil duluan tanpa fitur tambahan.
 */
export async function ambilProdukSorotan(batas = 8) {
  if (!supabaseSiap) {
    await jeda()
    const aktif = new Map(
      dummy.umkm.filter((u) => u.status === 'aktif').map((u) => [u.id, u]),
    )
    return dummy.produk
      .filter((p) => aktif.has(p.umkm_id) && p.status === 'tersedia')
      .sort((a, b) => {
        const ua = aktif.get(a.umkm_id).urutan
        const ub = aktif.get(b.umkm_id).urutan
        return a.urutan - b.urutan || ua - ub
      })
      .slice(0, batas)
      .map((p) => {
        const u = aktif.get(p.umkm_id)
        return { ...p, umkm: { nama: u.nama, slug: u.slug, nomor_wa: u.nomor_wa } }
      })
  }
  const { data, error } = await supabase
    .from('produk')
    .select('*, umkm!inner(nama, slug, nomor_wa, status, urutan)')
    .eq('status', 'tersedia')
    .eq('umkm.status', 'aktif')
    .order('urutan', { ascending: true })
    .limit(batas)
  if (error) throw error
  return data || []
}

/* ---------------------------- profil bumdes ----------------------------- */

export async function ambilProfilBumdes() {
  if (!supabaseSiap) {
    await jeda()
    return dummy.profilBumdes
  }
  const { data, error } = await supabase
    .from('profil_bumdes')
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  if (error) throw error
  return data
}
