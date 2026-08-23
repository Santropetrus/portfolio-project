import { Link } from 'react-router-dom'
import PitaJudul from '../../components/PitaJudul'
import Papan from '../../components/ui/Papan'
import Foto from '../../components/ui/Foto'
import SeratKayu from '../../components/ui/SeratKayu'
import KepalaSeksi from '../../components/ui/KepalaSeksi'
import Tombol from '../../components/ui/Tombol'
import { Galat, Kosong } from '../../components/ui/Keadaan'
import { useData } from '../../lib/useData'
import { ambilProfilBumdes, ambilDaftarUmkm } from '../../lib/api'
import { baris } from '../../lib/format'
import { SITE } from '../../config/site'

/** Penanda poin misi: belah ketupat kecil, bukan bullet bulat standar */
function Ketupat() {
  return (
    <svg viewBox="0 0 12 12" className="mt-1.5 h-2.5 w-2.5 shrink-0" aria-hidden="true">
      <path d="M6 0.5 11.5 6 6 11.5 0.5 6Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export default function ProfilBumdes() {
  const profil = useData(() => ambilProfilBumdes(), [])
  const daftar = useData(() => ambilDaftarUmkm(), [])

  const p = profil.data
  const umkm = daftar.data || []
  const misi = baris(p?.misi)

  if (profil.error) {
    return (
      <div className="mx-auto max-w-los px-5 py-16 lg:px-8">
        <Galat />
      </div>
    )
  }

  return (
    <>
      <PitaJudul
        jejak={[{ label: 'Beranda', ke: '/' }, { label: 'Profil BUMDes' }]}
        kicker="pengelola katalog"
        judul={p?.nama_bumdes || SITE.pengelola}
        keterangan={`Badan Usaha Milik Desa yang mendampingi unit usaha warga ${SITE.desa}, ${SITE.wilayah}.`}
      />

      {/* --- Sambutan --- */}
      <section className="mx-auto max-w-los px-5 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <div>
            <Papan className="max-w-[16rem]">
              <Foto
                src={p?.logo_url}
                alt={`Logo ${p?.nama_bumdes || SITE.pengelola}`}
                nama={p?.nama_bumdes || 'BUMDes Jati Kulon'}
                id="bumdes"
                rasio="1 / 1"
              />
              <p className="px-3 py-2.5 font-body text-[0.72rem] uppercase tracking-papan text-wood-dark/70">
                {p?.nama_bumdes || SITE.pengelola}
              </p>
            </Papan>
            <p className="tulis mt-3 px-1 text-[1.15rem] leading-tight text-wood-mid">
              kantor: balai desa, jam kerja
            </p>
          </div>

          <div className="max-w-2xl">
            <p className="tulis text-[1.35rem] leading-none text-indigo">salam dari pengurus</p>
            <h2 className="mt-1.5 text-[clamp(1.5rem,3.2vw,2.1rem)]">Sambutan</h2>
            {p?.sambutan ? (
              <div className="mt-5 space-y-4 text-[1.02rem] leading-relaxed text-wood-dark/85">
                {p.sambutan.split('\n\n').map((par, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? 'first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[3.2rem] first-letter:leading-[0.85] first-letter:text-indigo'
                        : undefined
                    }
                  >
                    {par}
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-[0.95rem] text-wood-dark/60">
                Teks sambutan belum diisi oleh admin.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* --- Visi --- */}
      {p?.visi && (
        <section className="border-y border-indigo-deep bg-indigo">
          <div className="mx-auto max-w-los px-5 py-12 lg:px-8">
            <p className="font-body text-[0.72rem] uppercase tracking-papan text-parchment/60">Visi</p>
            <blockquote className="mt-3 max-w-4xl font-display text-[clamp(1.4rem,3.6vw,2.3rem)] leading-[1.15] text-ivory">
              &ldquo;{p.visi}&rdquo;
            </blockquote>
          </div>
        </section>
      )}

      {/* --- Misi --- */}
      {misi.length > 0 && (
        <section className="mx-auto max-w-los px-5 py-14 lg:px-8">
          <KepalaSeksi kicker="yang kami kerjakan" judul="Misi" />
          <ul className="grid gap-x-10 gap-y-5 md:grid-cols-2">
            {misi.map((m, i) => (
              <li key={i} className="flex gap-3 text-[0.98rem] leading-relaxed text-wood-dark/85">
                <span className="text-indigo">
                  <Ketupat />
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --- Unit usaha binaan --- */}
      <section className="mx-auto max-w-los px-5 pb-16 lg:px-8">
        <KepalaSeksi
          kicker="yang kami dampingi"
          judul="Unit usaha binaan"
          keterangan="Daftar usaha warga yang saat ini tercatat aktif dan tampil di katalog."
          aksi={
            <Tombol to="/katalog" variasi="garis" besar="sm">
              Buka katalog
            </Tombol>
          }
        />

        {daftar.loading ? (
          <p className="font-body text-sm text-wood-dark/60">Memuat daftar&hellip;</p>
        ) : umkm.length === 0 ? (
          <Kosong pesan="Belum ada unit usaha yang didaftarkan." />
        ) : (
          <ul className="border-t border-wood-mid/40">
            {umkm.map((u) => (
              <li key={u.id} className="border-b border-wood-mid/40">
                <Link
                  to={`/umkm/${u.slug}`}
                  className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 px-1 py-3.5 no-underline transition-colors hover:bg-parchment-deep/50"
                >
                  <span className="font-body text-[1rem] font-semibold text-wood-dark">
                    {u.nama}
                  </span>
                  <span className="tulis text-[1.1rem] text-indigo">{u.kategori_nama}</span>
                  <span className="ml-auto font-body text-[0.74rem] uppercase tracking-papan text-wood-dark/55">
                    {u.jumlah_produk} produk
                    <span className="ml-3 inline-block text-indigo transition-transform duration-150 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <SeratKayu className="mt-12 opacity-50" />
      </section>
    </>
  )
}
