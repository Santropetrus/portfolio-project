import { Link } from 'react-router-dom'
import Logo from './ui/Logo'
import { SITE } from '../config/site'
import { sumberData } from '../lib/api'

export default function Footer() {
  const tahun = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t-4 border-wood-mid/70 bg-wood-deep text-parchment/80">
      <div className="tex-batik h-[7px] opacity-30" aria-hidden="true" />

      <div className="mx-auto grid max-w-los gap-10 px-5 py-12 md:grid-cols-[1.6fr_1fr_1.2fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Logo ukuran={30} />
            <span className="font-display text-[1.35rem] text-ivory">{SITE.nama}</span>
          </div>
          <p className="tulis mt-2 text-[1.2rem] text-parchment/70">{SITE.tagline}</p>
          <p className="mt-3 max-w-sm text-[0.85rem] leading-relaxed">
            Etalase daring untuk usaha warga {SITE.desa}. Pemesanan langsung ke pemilik usaha lewat
            WhatsApp — tanpa perantara, tanpa potongan.
          </p>
        </div>

        <div>
          <h2 className="font-body text-[0.72rem] font-semibold uppercase tracking-papan text-ivory/70">
            Halaman
          </h2>
          <ul className="mt-3 space-y-2 text-[0.88rem]">
            {[
              { ke: '/', label: 'Beranda' },
              { ke: '/katalog', label: 'Katalog UMKM' },
              { ke: '/profil-bumdes', label: 'Profil BUMDes' },
            ].map((m) => (
              <li key={m.ke}>
                <Link
                  to={m.ke}
                  className="text-parchment/80 no-underline hover:text-ivory hover:underline"
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-body text-[0.72rem] font-semibold uppercase tracking-papan text-ivory/70">
            Pengelola
          </h2>
          <p className="mt-3 text-[0.88rem] leading-relaxed">
            {SITE.pengelola}
            <br />
            {SITE.desa}, {SITE.wilayah}
          </p>
          <p className="mt-3 text-[0.8rem] text-parchment/55">
            Ingin usaha Anda masuk katalog? Hubungi pengurus BUMDes di balai desa.
          </p>
        </div>
      </div>

      <div className="border-t border-ivory/12">
        <div className="mx-auto flex max-w-los flex-col gap-1 px-5 py-4 text-[0.76rem] text-parchment/55 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>
            &copy; {tahun} {SITE.namaLengkap}
          </span>
          {sumberData === 'dummy' && (
            <span className="font-body uppercase tracking-papan text-parchment/40">
              Mode data contoh — belum tersambung Supabase
            </span>
          )}
        </div>
      </div>
    </footer>
  )
}
