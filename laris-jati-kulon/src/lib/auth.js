import { useEffect, useState } from 'react'
import { supabase, supabaseSiap } from './supabase'

/**
 * Status login admin.
 *
 * Saat Supabase belum dikonfigurasi (.env kosong), aplikasi berjalan dalam
 * MODE CONTOH: tidak ada data asli yang bisa diubah, jadi panel admin dibuka
 * tanpa login supaya tampilannya tetap bisa diperiksa. Begitu .env terisi,
 * login Supabase langsung berlaku dan mode ini mati sendiri.
 */
export function useSesi() {
  const [sesi, setSesi] = useState(null)
  const [memuat, setMemuat] = useState(supabaseSiap)

  useEffect(() => {
    if (!supabaseSiap) return undefined

    let hidup = true
    supabase.auth.getSession().then(({ data }) => {
      if (!hidup) return
      setSesi(data.session)
      setMemuat(false)
    })

    const { data: langganan } = supabase.auth.onAuthStateChange((_peristiwa, sesiBaru) => {
      setSesi(sesiBaru)
      setMemuat(false)
    })

    return () => {
      hidup = false
      langganan.subscription.unsubscribe()
    }
  }, [])

  return {
    sesi,
    memuat,
    // dalam mode contoh dianggap sudah masuk, tapi ditandai jelas di layar
    masuk: supabaseSiap ? Boolean(sesi) : true,
    modeContoh: !supabaseSiap,
    email: sesi?.user?.email ?? null,
  }
}

export async function masukDenganSandi(email, sandi) {
  if (!supabaseSiap) {
    throw new Error('Supabase belum dikonfigurasi. Isi .env terlebih dahulu.')
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: sandi })
  if (error) throw error
  return data
}

export async function keluar() {
  if (!supabaseSiap) return
  await supabase.auth.signOut()
}

/** Pesan Supabase diterjemahkan supaya admin desa paham */
export function pesanGalatMasuk(error) {
  const teks = String(error?.message || '')
  if (/invalid login credentials/i.test(teks)) return 'Email atau kata sandi salah.'
  if (/email not confirmed/i.test(teks)) return 'Email ini belum dikonfirmasi di Supabase.'
  if (/rate limit|too many/i.test(teks)) return 'Terlalu sering mencoba. Tunggu sebentar, lalu ulangi.'
  if (/fetch|network/i.test(teks)) return 'Tidak bisa menghubungi server. Periksa koneksi internet.'
  return teks || 'Gagal masuk. Coba lagi.'
}
