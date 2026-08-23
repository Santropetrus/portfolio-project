import { Link } from 'react-router-dom'
import Papan from './ui/Papan'
import Foto from './ui/Foto'
import IkonWa from './ui/IkonWa'
import { Stempel } from './ui/Label'
import { rupiah } from '../lib/format'
import { tautanPesan } from '../lib/whatsapp'
import { cacah } from '../lib/useData'

const RASIO = ['4 / 3', '1 / 1', '5 / 4']

/**
 * Kartu produk. Foto dominan, harga pakai Caveat besar seperti papan harga
 * tulis tangan di lapak. Produk habis: foto diredam + stempel miring, tombol
 * pesan diganti keterangan, tidak dihapus dari katalog.
 */
export default function ProdukCard({ produk, umkm, tampilkanUmkm = false }) {
  const habis = produk.status === 'habis'
  const dataUmkm = umkm || produk.umkm || {}
  const rasio = RASIO[cacah(produk.id + produk.nama) % RASIO.length]

  const linkWa = tautanPesan({
    namaUmkm: dataUmkm.nama,
    namaProduk: produk.nama,
    harga: produk.harga,
    nomorWa: dataUmkm.nomor_wa,
  })

  return (
    <Papan as="article" className="flex flex-col">
      <div className="relative border-b border-wood-mid/45">
        <Foto
          src={produk.foto_url}
          alt={`Foto ${produk.nama}`}
          nama={produk.nama}
          id={produk.id}
          rasio={rasio}
          className={habis ? 'opacity-55 grayscale' : ''}
        />
        {habis && <Stempel />}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        {tampilkanUmkm && dataUmkm.slug && (
          <Link
            to={`/umkm/${dataUmkm.slug}`}
            className="font-body text-[0.7rem] uppercase tracking-papan text-wood-dark/60 no-underline hover:text-indigo"
          >
            {dataUmkm.nama}
          </Link>
        )}

        <h3 className="mt-1 font-body text-[1.02rem] font-semibold leading-snug text-wood-dark">
          {produk.nama}
        </h3>

        {produk.deskripsi && (
          <p className="mt-1.5 line-clamp-2 text-[0.84rem] leading-relaxed text-wood-dark/75">
            {produk.deskripsi}
          </p>
        )}

        <div className="mt-3 flex items-end gap-1.5">
          <span className="tulis text-[1.9rem] leading-none text-indigo">
            {rupiah(produk.harga) || 'Nego'}
          </span>
          {produk.satuan && (
            <span className="pb-0.5 font-body text-[0.74rem] text-wood-dark/65">
              / {produk.satuan}
            </span>
          )}
        </div>

        <div className="mt-3.5 pt-0.5">
          {habis || !linkWa ? (
            <p className="flex items-center gap-2 border-t border-dashed border-wood-mid/45 pt-3 font-body text-[0.76rem] uppercase tracking-papan text-status-habis">
              {habis ? 'Sedang kosong, tanya lagi nanti' : 'Nomor WA belum tersedia'}
            </p>
          ) : (
            <a
              href={linkWa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-papan border-2 border-indigo-deep bg-indigo px-3 py-2 font-body text-[0.76rem] font-semibold uppercase tracking-papan text-ivory no-underline shadow-papan-sm transition-[background-color,transform,box-shadow] duration-100 hover:bg-indigo-soft active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <IkonWa />
              Pesan via WhatsApp
            </a>
          )}
        </div>
      </div>
    </Papan>
  )
}
