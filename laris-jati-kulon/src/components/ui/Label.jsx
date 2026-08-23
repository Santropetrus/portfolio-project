/**
 * Label status & penanda kecil.
 * - status "tersedia"/"habis" pakai warna semantik terpisah dari aksen indigo
 * - varian "tulis" meniru coretan papan harga warung (font Caveat)
 */
export function LabelStatus({ status, className = '' }) {
  const habis = status === 'habis'
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-papan border px-2 py-0.5',
        'font-body text-[0.68rem] font-semibold uppercase tracking-papan',
        habis
          ? 'border-status-habis/60 bg-status-habis/10 text-status-habis'
          : 'border-status-ok/60 bg-status-ok/10 text-status-ok',
        className,
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={['h-1.5 w-1.5', habis ? 'bg-status-habis' : 'bg-status-ok'].join(' ')}
      />
      {habis ? 'Habis' : 'Tersedia'}
    </span>
  )
}

export function LabelTulis({ children, className = '' }) {
  return (
    <span className={['tulis text-[1.15rem] text-indigo', className].join(' ')}>{children}</span>
  )
}

/** Stempel "HABIS" yang ditempel miring di atas foto produk */
export function Stempel({ teks = 'Habis' }) {
  return (
    <span className="stempel absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 text-lg uppercase">
      {teks}
    </span>
  )
}
