import { useParams, Link } from 'react-router-dom'
import PitaJudul from '../../components/PitaJudul'
import Papan from '../../components/ui/Papan'
import Foto from '../../components/ui/Foto'
import Tombol from '../../components/ui/Tombol'
import IkonWa from '../../components/ui/IkonWa'
import KepalaSeksi from '../../components/ui/KepalaSeksi'
import ProdukCard from '../../components/ProdukCard'
import { Memuat, Kosong, Galat } from '../../components/ui/Keadaan'
import { useData } from '../../lib/useData'
import { ambilUmkmBySlug } from '../../lib/api'
import { tautanTanya } from '../../lib/whatsapp'

function BarisInfo({ label, children }) {
  return (
    <div className="flex gap-3 border-b border-dashed border-wood-mid/40 py-2.5 last:border-0">
      <span className="w-24 shrink-0 font-body text-[0.72rem] uppercase tracking-papan text-wood-dark/55">
        {label}
      </span>
      <span className="text-[0.88rem] leading-relaxed text-wood-dark">{children}</span>
    </div>
  )
}

export default function DetailUmkm() {
  const { slug } = useParams()
  const { data: umkm, loading, error } = useData(() => ambilUmkmBySlug(slug), [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-los px-5 py-16 lg:px-8">
        <Memuat jumlah={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-los px-5 py-16 lg:px-8">
        <Galat />
      </div>
    )
  }

  if (!umkm) {
    return (
      <div className="mx-auto max-w-los px-5 py-16 lg:px-8">
        <Kosong
          judul="Lapak tidak ditemukan"
          pesan="Usaha yang Anda cari mungkin sudah dinonaktifkan sementara oleh pengelola, atau alamatnya keliru."
          aksi={<Tombol to="/katalog">Kembali ke katalog</Tombol>}
        />
      </div>
    )
  }

  const produk = umkm.produk || []
  const tersedia = produk.filter((p) => p.status === 'tersedia')
  const linkTanya = tautanTanya({ namaUmkm: umkm.nama, nomorWa: umkm.nomor_wa })

  return (
    <>
      <PitaJudul
        jejak={[
          { label: 'Beranda', ke: '/' },
          { label: 'Katalog', ke: '/katalog' },
          { label: umkm.nama },
        ]}
        kicker={umkm.kategori_nama || 'unit usaha'}
        judul={umkm.nama}
        kanan={
          linkTanya && (
            <Tombol href={linkTanya} variasi="terang" besar="lg">
              <IkonWa />
              Tanya penjual
            </Tombol>
          )
        }
      />

      <div className="mx-auto grid max-w-los gap-10 px-5 py-12 lg:grid-cols-[20rem_1fr] lg:px-8">
        {/* Kartu identitas usaha */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Papan>
            <Foto
              src={umkm.foto_profil_url}
              alt={`Foto usaha ${umkm.nama}`}
              nama={umkm.nama}
              id={umkm.id}
              rasio="4 / 3"
              className="border-b border-wood-mid/45"
            />
            <div className="px-4 pb-4 pt-3">
              <BarisInfo label="Alamat">{umkm.alamat || 'Belum dicantumkan'}</BarisInfo>
              <BarisInfo label="Jenis">{umkm.kategori_nama || 'Lainnya'}</BarisInfo>
              <BarisInfo label="Produk">
                {produk.length} terdaftar &middot; {tersedia.length} siap dipesan
              </BarisInfo>
            </div>
          </Papan>

          <p className="tulis mt-4 px-1 text-[1.15rem] leading-tight text-wood-mid">
            pesanan langsung ke pemilik lapak, tanpa lewat BUMDes
          </p>
        </aside>

        {/* Cerita usaha + daftar produk */}
        <div>
          {umkm.deskripsi && (
            <section className="mb-12">
              <h2 className="sr-only">Tentang {umkm.nama}</h2>
              <p className="max-w-2xl text-[1.02rem] leading-relaxed text-wood-dark/85">
                {umkm.deskripsi}
              </p>
            </section>
          )}

          <section>
            <KepalaSeksi
              kicker="dagangan hari ini"
              judul="Daftar produk"
              keterangan={
                produk.length > 0
                  ? 'Tekan tombol pesan untuk membuka WhatsApp dengan pesan yang sudah terisi.'
                  : undefined
              }
            />

            {produk.length === 0 ? (
              <Kosong
                judul="Belum ada produk yang dipajang"
                pesan={`Hubungi ${umkm.nama} lewat tombol di atas untuk menanyakan dagangan yang tersedia.`}
              />
            ) : (
              <div className="los-grid">
                {produk.map((p) => (
                  <ProdukCard key={p.id} produk={p} umkm={umkm} />
                ))}
              </div>
            )}
          </section>

          <p className="mt-12 border-t border-wood-mid/35 pt-6 text-[0.85rem] text-wood-dark/65">
            Kembali ke{' '}
            <Link to="/katalog" className="tautan">
              daftar seluruh UMKM
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  )
}
