import { useEffect, useState } from 'react'

/**
 * Pembungkus sederhana untuk pemanggilan async.
 * Dipakai semua halaman publik supaya penanganan loading/error seragam.
 */
export function useData(pengambil, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  useEffect(() => {
    let hidup = true
    setState((s) => ({ ...s, loading: true }))
    Promise.resolve()
      .then(pengambil)
      .then((data) => hidup && setState({ data, loading: false, error: null }))
      .catch((error) => {
        console.error('[LARIS] gagal mengambil data:', error)
        if (hidup) setState({ data: null, loading: false, error })
      })
    return () => {
      hidup = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

/** Angka acak stabil dari sebuah teks — untuk variasi visual yang konsisten */
export function cacah(teks = '') {
  let n = 0
  for (let i = 0; i < teks.length; i += 1) n = (n * 31 + teks.charCodeAt(i)) % 9973
  return n
}
