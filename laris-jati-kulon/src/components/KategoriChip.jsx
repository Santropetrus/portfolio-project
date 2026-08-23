/**
 * Chip kategori berbentuk papan gantung kecil: dua paku di atas,
 * bingkai kayu tipis, bayangan halus. Bukan pill rounded-full.
 */
export default function KategoriChip({ nama, jumlah, aktif = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktif}
      className={[
        'group relative shrink-0 rounded-papan border px-4 pb-2 pt-3 text-left',
        'font-body text-[0.82rem] font-medium shadow-gantung',
        'transition-transform duration-150 hover:-rotate-1',
        aktif
          ? 'border-indigo-deep bg-indigo text-ivory'
          : 'border-wood-mid/70 bg-parchment-light text-wood-dark hover:bg-parchment-deep',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'absolute left-2 top-1 h-1 w-1 rounded-stempel',
          aktif ? 'bg-ivory/60' : 'bg-wood-mid/70',
        ].join(' ')}
      />
      <span
        aria-hidden="true"
        className={[
          'absolute right-2 top-1 h-1 w-1 rounded-stempel',
          aktif ? 'bg-ivory/60' : 'bg-wood-mid/70',
        ].join(' ')}
      />
      {nama}
      {typeof jumlah === 'number' && (
        <span className={['ml-2 tulis text-base', aktif ? 'text-ivory/85' : 'text-indigo'].join(' ')}>
          {jumlah}
        </span>
      )}
    </button>
  )
}
