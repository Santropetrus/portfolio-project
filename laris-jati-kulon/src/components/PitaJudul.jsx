import { Link } from 'react-router-dom'

/**
 * Pita judul halaman: papan kayu gelap dengan remah jejak di atasnya.
 * Rata kiri, dengan keterangan opsional di sisi kanan.
 */
export default function PitaJudul({ kicker, judul, keterangan, jejak, kanan }) {
  return (
    <div className="tex-papan border-b border-wood-deep">
      <div className="mx-auto max-w-los px-5 py-10 lg:px-8 lg:py-12">
        {jejak && (
          <nav aria-label="Jejak halaman" className="mb-3 font-body text-[0.74rem] uppercase tracking-papan text-parchment/55">
            {jejak.map((j, i) => (
              <span key={j.label}>
                {i > 0 && <span className="px-2 text-parchment/35">/</span>}
                {j.ke ? (
                  <Link to={j.ke} className="text-parchment/70 no-underline hover:text-ivory">
                    {j.label}
                  </Link>
                ) : (
                  <span className="text-parchment/45">{j.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            {kicker && <p className="tulis text-[1.35rem] leading-none text-parchment/75">{kicker}</p>}
            <h1 className="mt-1.5 text-[clamp(1.9rem,5vw,3rem)] text-ivory">{judul}</h1>
            {keterangan && (
              <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-parchment/80">
                {keterangan}
              </p>
            )}
          </div>
          {kanan}
        </div>
      </div>
    </div>
  )
}
