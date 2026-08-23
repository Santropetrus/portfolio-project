import Tombol from '../../components/ui/Tombol'
import Papan from '../../components/ui/Papan'
import Foto from '../../components/ui/Foto'
import SeratKayu from '../../components/ui/SeratKayu'
import KepalaSeksi from '../../components/ui/KepalaSeksi'
import { Memuat, Kosong, Galat } from '../../components/ui/Keadaan'
import UmkmCard from '../../components/UmkmCard'
import ProdukCard from '../../components/ProdukCard'
import { useData } from '../../lib/useData'
import { ambilDaftarUmkm, ambilProdukSorotan } from '../../lib/api'
import { SITE, JUMLAH_SOROTAN } from '../../config/site'

/* --------------------------------- Hero ---------------------------------- */

/** Satu papan foto miring di tumpukan hero */
function PapanFoto({ umkm, rasio, className }) {
  return (
    <Papan className={['absolute', className].join(' ')}>
      <Foto
        src={umkm.foto_profil_url}
        alt={`Foto usaha ${umkm.nama}`}
        nama={umkm.nama}
        id={umkm.id}
        rasio={rasio}
      />
      <p className="truncate px-3 py-2 font-body text-[0.7rem] uppercase tracking-papan text-wood-dark/70">
        {umkm.nama}
      </p>
    </Papan>
  )
}

function Hero({ umkm }) {
  const tumpukan = umkm.slice(0, 3)

  return (
    <section className="relative overflow-hidden border-b border-wood-mid/40">
      {/* pita batik tipis di tepi kanan, bukan gradasi besar di belakang teks */}
      <div
        aria-hidden="true"
        className="tex-batik absolute right-0 top-0 hidden h-full w-16 opacity-25 lg:block"
      />

      <div className="mx-auto grid max-w-los items-center gap-12 px-5 py-14 lg:grid-cols-[7fr_5fr] lg:px-8 lg:py-20">
        <div>
          <p className="tulis text-[1.45rem] leading-none text-indigo">
            {SITE.desa} &middot; {SITE.wilayah}
          </p>

          <h1 className="mt-3 text-[clamp(2.4rem,6.5vw,4.1rem)] text-wood-dark">
            Lapak warga,
            <br />
            dibuka buat siapa saja.
          </h1>

          <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-wood-dark/85">
            {SITE.nama} mengumpulkan usaha warga {SITE.desa} dalam satu katalog: jenang, ukir jati,
            batik, hasil tani, sampai jasa harian. Pilih produknya, pesan langsung ke pemiliknya
            lewat WhatsApp. Tidak ada perantara, tidak ada potongan.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Tombol to="/katalog" besar="lg">
              Telusuri katalog
            </Tombol>
            <Tombol to="/profil-bumdes" variasi="garis" besar="lg">
              Kenali BUMDes
            </Tombol>
          </div>
        </div>

        {/* Tumpukan papan foto — miring sedikit dan saling menindih seperti
            papan nama lapak yang disandarkan, bukan mockup rapi di tengah. */}
        <div className="relative mx-auto hidden aspect-[4/5] w-full max-w-sm lg:block">
          {tumpukan[0] && (
            <PapanFoto umkm={tumpukan[0]} rasio="3 / 4" className="left-0 top-[20%] z-30 w-[56%] -rotate-3" />
          )}
          {tumpukan[1] && (
            <PapanFoto umkm={tumpukan[1]} rasio="1 / 1" className="right-1 top-0 z-10 w-[44%] rotate-2" />
          )}
          {tumpukan[2] && (
            <PapanFoto
              umkm={tumpukan[2]}
              rasio="4 / 3"
              className="bottom-0 right-[4%] z-20 w-[52%] rotate-[-1.5deg]"
            />
          )}

          <p className="tulis absolute -bottom-6 left-2 z-40 max-w-[9rem] text-[1.25rem] leading-tight text-wood-mid">
            lapaknya buka
            <br />
            tiap hari
            <svg
              viewBox="0 0 60 40"
              className="mt-1 h-8 w-14 text-wood-mid"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M2 6 C 24 4, 44 12, 52 30" strokeLinecap="round" />
              <path d="M44 28 L54 33 L47 38" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ Papan angka ------------------------------ */

function PapanAngka({ umkm, produk }) {
  const kategori = new Set(umkm.map((u) => u.kategori_nama).filter(Boolean))
  const angka = [
    { nilai: umkm.length, label: 'unit usaha terdaftar' },
    { nilai: produk.length, label: 'produk siap dipesan' },
    { nilai: kategori.size, label: 'jenis usaha' },
  ]

  return (
    <section className="tex-papan">
      <div className="mx-auto flex max-w-los flex-col divide-y divide-ivory/12 px-5 sm:flex-row sm:divide-x sm:divide-y-0 lg:px-8">
        {angka.map((a) => (
          <div key={a.label} className="flex items-baseline gap-3 py-5 sm:flex-1 sm:px-6 sm:first:pl-0">
            <span className="font-display text-[2rem] leading-none text-ivory">{a.nilai}</span>
            <span className="font-body text-[0.76rem] uppercase leading-tight tracking-papan text-parchment/65">
              {a.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* -------------------------------- Halaman -------------------------------- */

export default function Beranda() {
  const daftarUmkm = useData(() => ambilDaftarUmkm(), [])
  const sorotan = useData(() => ambilProdukSorotan(JUMLAH_SOROTAN.produk), [])

  const umkm = daftarUmkm.data || []
  const produk = sorotan.data || []
  const gagal = daftarUmkm.error || sorotan.error

  return (
    <>
      <Hero umkm={umkm} />
      {umkm.length > 0 && <PapanAngka umkm={umkm} produk={produk} />}

      {/* --- Los UMKM --- */}
      <section className="mx-auto max-w-los px-5 py-16 lg:px-8">
        <KepalaSeksi
          kicker="jalan-jalan dulu"
          judul="Los usaha warga"
          keterangan="Tiap lapak punya cerita dan jam bukanya sendiri. Klik satu untuk melihat daftar produk lengkapnya."
          aksi={
            <Tombol to="/katalog" variasi="garis" besar="sm">
              Semua UMKM
            </Tombol>
          }
        />

        {gagal ? (
          <Galat />
        ) : daftarUmkm.loading ? (
          <Memuat jumlah={6} />
        ) : umkm.length === 0 ? (
          <Kosong pesan="Data UMKM belum diisi oleh admin BUMDes." />
        ) : (
          <div className="los-grid">
            {umkm.slice(0, JUMLAH_SOROTAN.umkm).map((u) => (
              <UmkmCard key={u.id} umkm={u} />
            ))}
          </div>
        )}
      </section>

      {/* --- Deret produk yang bisa digeser --- */}
      <section className="border-y border-wood-mid/35 bg-parchment-deep/45">
        <div className="mx-auto max-w-los px-5 py-16 lg:px-8">
          <KepalaSeksi
            kicker="baru dipajang"
            judul="Produk yang lagi ada"
            keterangan="Geser ke samping untuk melihat lebih banyak."
          />

          {sorotan.loading ? (
            <p className="font-body text-sm text-wood-dark/60">Memuat produk&hellip;</p>
          ) : produk.length === 0 ? (
            <Kosong pesan="Belum ada produk yang ditandai tersedia." />
          ) : (
            <div className="los-geser -mx-5 flex gap-5 overflow-x-auto px-5 pb-4 lg:-mx-8 lg:px-8">
              {produk.map((p) => (
                <div key={p.id} className="w-[16rem] shrink-0 snap-start sm:w-[17.5rem]">
                  <ProdukCard produk={p} tampilkanUmkm />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- Ajakan --- */}
      <section className="mx-auto max-w-los px-5 pt-16 lg:px-8">
        <div className="relative overflow-hidden border border-indigo-deep bg-indigo px-6 py-10 sm:px-10 lg:py-12">
          <div
            aria-hidden="true"
            className="tex-batik absolute -right-6 -top-6 h-40 w-40 rotate-12 opacity-20 invert"
          />
          <div className="relative grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-center">
            <div>
              <p className="tulis text-[1.35rem] leading-none text-parchment/80">buat warga desa</p>
              <h2 className="mt-2 max-w-xl text-[clamp(1.5rem,3.4vw,2.1rem)] text-ivory">
                Punya usaha di {SITE.desa} dan belum masuk katalog?
              </h2>
              <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-parchment/85">
                Bawa foto produk dan nomor WhatsApp aktif ke pengurus {SITE.pengelola} di balai
                desa. Pendaftaran tidak dipungut biaya.
              </p>
            </div>
            <div className="lg:justify-self-end">
              <Tombol to="/profil-bumdes" variasi="terang" besar="lg">
                Lihat profil BUMDes
              </Tombol>
            </div>
          </div>
        </div>
        <SeratKayu className="mt-10 opacity-50" />
      </section>
    </>
  )
}
