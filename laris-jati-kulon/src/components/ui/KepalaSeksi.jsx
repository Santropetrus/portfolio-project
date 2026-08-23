import SeratKayu from './SeratKayu'

/**
 * Judul seksi: kicker tulisan tangan di atas, judul pahat di bawah,
 * rata kiri, dengan aksi opsional di kanan. Sengaja tidak center.
 */
export default function KepalaSeksi({ kicker, judul, keterangan, aksi, garis = true }) {
  return (
    <div className="mb-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {kicker && <p className="tulis text-[1.3rem] leading-none text-indigo">{kicker}</p>}
          <h2 className="mt-1.5 text-[clamp(1.6rem,3.6vw,2.35rem)] text-wood-dark">{judul}</h2>
          {keterangan && (
            <p className="mt-2.5 text-[0.92rem] leading-relaxed text-wood-dark/75">{keterangan}</p>
          )}
        </div>
        {aksi}
      </div>
      {garis && <SeratKayu className="mt-4 opacity-70" tinggi={16} />}
    </div>
  )
}
