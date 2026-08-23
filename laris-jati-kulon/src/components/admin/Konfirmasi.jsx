import Tombol from '../ui/Tombol'

/** Dialog konfirmasi untuk tindakan yang tidak bisa dibatalkan */
export default function Konfirmasi({ buka, judul, pesan, labelYa = 'Ya, lanjutkan', onYa, onBatal }) {
  if (!buka) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-wood-deep/60 px-5"
      role="dialog"
      aria-modal="true"
      aria-label={judul}
    >
      <div className="w-full max-w-md border-2 border-wood-dark bg-parchment-light p-6 shadow-lapak">
        <h2 className="text-[1.35rem] text-wood-dark">{judul}</h2>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-wood-dark/80">{pesan}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Tombol variasi="garis" onClick={onBatal}>
            Batal
          </Tombol>
          <Tombol onClick={onYa}>{labelYa}</Tombol>
        </div>
      </div>
    </div>
  )
}
