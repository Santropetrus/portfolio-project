import { Link } from 'react-router-dom'
import Tombol from '../../components/ui/Tombol'
import Papan from '../../components/ui/Papan'
import { Galat } from '../../components/ui/Keadaan'
import { useData } from '../../lib/useData'
import { ambilRingkasan } from '../../lib/adminApi'
import { tanggalSingkat } from '../../lib/format'
import { JUMLAH_SOROTAN } from '../../config/site'

function Angka({ nilai, label, keterangan }) {
  return (
    <Papan className="px-4 py-4">
      <p className="font-display text-[2.1rem] leading-none text-wood-dark">{nilai}</p>
      <p className="mt-1.5 font-body text-[0.74rem] uppercase tracking-papan text-wood-dark/65">
        {label}
      </p>
      {keterangan && <p className="mt-1 text-[0.78rem] text-wood-dark/55">{keterangan}</p>}
    </Papan>
  )
}

export default function Dashboard() {
  const { data, loading, error } = useData(() => ambilRingkasan(), [])

  return (
    <div className="max-w-4xl">
      <p className="tulis text-[1.3rem] leading-none text-indigo">selamat datang</p>
      <h1 className="mt-1 text-[clamp(1.7rem,4vw,2.3rem)] text-wood-dark">Ringkasan katalog</h1>
      <p className="mt-2 max-w-xl text-[0.92rem] leading-relaxed text-wood-dark/75">
        Halaman ini cuma tampilan sekilas. Semua penyuntingan dilakukan lewat menu UMKM &amp;
        Produk dan Profil BUMDes.
      </p>

      {error ? (
        <div className="mt-8">
          <Galat />
        </div>
      ) : loading ? (
        <p className="mt-8 font-body text-sm text-wood-dark/60">Memuat angka&hellip;</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Angka
              nilai={data.umkmAktif}
              label="UMKM aktif"
              keterangan={data.umkmNonaktif ? `${data.umkmNonaktif} nonaktif` : 'semua tampil'}
            />
            <Angka
              nilai={data.produkTersedia}
              label="Produk tersedia"
              keterangan={data.produkHabis ? `${data.produkHabis} ditandai habis` : null}
            />
            <Angka nilai={data.umkmAktif + data.umkmNonaktif} label="Total UMKM terdaftar" />
            <Angka
              nilai={data.produkTersedia + data.produkHabis}
              label="Total produk terdaftar"
            />
          </div>

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-wood-mid/45 pb-2">
              <h2 className="text-[1.4rem] text-wood-dark">Paling baru ditambahkan</h2>
              <Tombol to="/admin/umkm" variasi="garis" besar="sm">
                Kelola semua
              </Tombol>
            </div>

            {data.terbaru.length === 0 ? (
              <p className="mt-4 text-[0.9rem] text-wood-dark/65">
                Belum ada UMKM. Mulai dari menu UMKM &amp; Produk.
              </p>
            ) : (
              <ul className="mt-1">
                {data.terbaru.map((u) => (
                  <li
                    key={u.id}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-wood-mid/35 py-3"
                  >
                    <Link
                      to={`/admin/umkm/${u.id}`}
                      className="font-body text-[0.95rem] font-semibold text-wood-dark no-underline hover:text-indigo"
                    >
                      {u.nama}
                    </Link>
                    {u.kategori_nama && (
                      <span className="tulis text-[1.05rem] text-indigo">{u.kategori_nama}</span>
                    )}
                    {u.status === 'nonaktif' && (
                      <span className="font-body text-[0.7rem] uppercase tracking-papan text-status-habis">
                        nonaktif
                      </span>
                    )}
                    <span className="ml-auto font-body text-[0.76rem] text-wood-dark/55">
                      {tanggalSingkat(u.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10 border-l-4 border-indigo bg-parchment-deep/45 px-5 py-4">
            <h2 className="font-body text-[0.78rem] font-semibold uppercase tracking-papan text-wood-dark/70">
              Cara kerja urutan tampilan
            </h2>
            <p className="mt-2 max-w-2xl text-[0.88rem] leading-relaxed text-wood-dark/80">
              Beranda menampilkan {JUMLAH_SOROTAN.umkm} UMKM teratas dan{' '}
              {JUMLAH_SOROTAN.produk} produk teratas berdasarkan kolom urutan. Untuk menyorot satu
              usaha, naikkan posisinya lewat tombol panah di tabel UMKM — tidak ada tombol
              "unggulan" terpisah yang perlu diingat.
            </p>
          </section>
        </>
      )}
    </div>
  )
}
