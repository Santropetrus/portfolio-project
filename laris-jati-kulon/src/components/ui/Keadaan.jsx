import Papan from './Papan'

/** Kerangka kartu saat data sedang dimuat */
export function Memuat({ jumlah = 6 }) {
  return (
    <div className="los-grid" aria-busy="true" aria-live="polite">
      {Array.from({ length: jumlah }).map((_, i) => (
        <Papan key={i} className="animate-pulse">
          <div
            className="border-b border-wood-mid/40 bg-parchment-deep"
            style={{ aspectRatio: i % 3 === 0 ? '1 / 1' : '4 / 3' }}
          />
          <div className="space-y-2 px-4 pb-5 pt-4">
            <div className="h-3 w-1/3 bg-wood-mid/25" />
            <div className="h-5 w-3/4 bg-wood-mid/30" />
            <div className="h-3 w-full bg-wood-mid/20" />
            <div className="h-3 w-2/3 bg-wood-mid/20" />
          </div>
        </Papan>
      ))}
    </div>
  )
}

/** Keadaan kosong — pesan lugas, tanpa ilustrasi generik */
export function Kosong({ judul = 'Belum ada yang bisa ditampilkan', pesan, aksi }) {
  return (
    <div className="border border-dashed border-wood-mid/60 bg-parchment-light/60 px-6 py-12">
      <h3 className="text-[1.25rem] text-wood-dark">{judul}</h3>
      {pesan && <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-wood-dark/75">{pesan}</p>}
      {aksi && <div className="mt-5">{aksi}</div>}
    </div>
  )
}

/** Keadaan gagal ambil data */
export function Galat({ pesan = 'Data gagal dimuat. Coba muat ulang halaman.' }) {
  return (
    <div className="border-l-4 border-status-habis bg-status-habis/10 px-5 py-4">
      <p className="font-body text-[0.9rem] text-status-habis">{pesan}</p>
    </div>
  )
}
