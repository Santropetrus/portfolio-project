import { Link } from 'react-router-dom'
import Papan from './ui/Papan'
import Foto from './ui/Foto'
import { cacah } from '../lib/useData'

/* Tinggi foto sengaja berbeda-beda antar kartu supaya deretannya terbaca
   seperti lapak yang ukurannya tidak seragam, bukan grid kaku. */
const RASIO = ['4 / 3', '1 / 1', '5 / 4', '3 / 4']

export default function UmkmCard({ umkm }) {
  const rasio = RASIO[cacah(umkm.slug) % RASIO.length]

  return (
    <Papan
      as="article"
      className="group relative transition-[transform,border-color] duration-150 hover:-translate-y-[3px] hover:border-wood-mid"
    >
      <Foto
        src={umkm.foto_profil_url}
        alt={`Foto usaha ${umkm.nama}`}
        nama={umkm.nama}
        id={umkm.id}
        rasio={rasio}
        className="border-b border-wood-mid/45"
      />

      <div className="px-4 pb-4 pt-3">
        {umkm.kategori_nama && (
          <p className="tulis text-[1.05rem] leading-none text-indigo">{umkm.kategori_nama}</p>
        )}

        <h3 className="mt-1.5 text-[1.35rem] leading-[1.12]">
          <Link
            to={`/umkm/${umkm.slug}`}
            className="text-wood-dark no-underline after:absolute after:inset-0 after:content-['']"
          >
            {umkm.nama}
          </Link>
        </h3>

        {umkm.deskripsi && (
          <p className="mt-2 line-clamp-3 text-[0.88rem] leading-relaxed text-wood-dark/80">
            {umkm.deskripsi}
          </p>
        )}

        <div className="mt-3.5 flex items-baseline justify-between border-t border-dashed border-wood-mid/45 pt-2.5">
          <span className="font-body text-[0.72rem] uppercase tracking-papan text-wood-dark/65">
            {umkm.jumlah_produk ?? 0} produk
          </span>
          <span className="font-body text-[0.74rem] font-semibold uppercase tracking-papan text-indigo transition-transform duration-150 group-hover:translate-x-1">
            Lihat lapak &rarr;
          </span>
        </div>
      </div>
    </Papan>
  )
}
