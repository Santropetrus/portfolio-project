import { useEffect } from 'react'

/**
 * Pemberitahuan singkat setelah menyimpan/menghapus.
 * Muncul di pojok bawah dan hilang sendiri, tapi tetap bisa ditutup manual.
 */
export default function Notifikasi({ kabar, onTutup }) {
  useEffect(() => {
    if (!kabar) return undefined
    const waktu = setTimeout(onTutup, kabar.jenis === 'galat' ? 7000 : 3500)
    return () => clearTimeout(waktu)
  }, [kabar, onTutup])

  if (!kabar) return null
  const galat = kabar.jenis === 'galat'

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed bottom-5 left-1/2 z-50 w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 rounded-papan border-2 px-4 py-3 shadow-lapak sm:left-auto sm:right-6 sm:translate-x-0',
        galat
          ? 'border-status-habis bg-parchment-light text-status-habis'
          : 'border-indigo-deep bg-indigo text-ivory',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <p className="flex-1 font-body text-[0.88rem] leading-snug">{kabar.teks}</p>
        <button
          type="button"
          onClick={onTutup}
          aria-label="Tutup pemberitahuan"
          className={['text-lg leading-none', galat ? 'text-status-habis' : 'text-ivory/70'].join(' ')}
        >
          &times;
        </button>
      </div>
    </div>
  )
}
