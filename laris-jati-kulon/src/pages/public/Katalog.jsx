import { useSearchParams } from 'react-router-dom'
import PitaJudul from '../../components/PitaJudul'
import KategoriChip from '../../components/KategoriChip'
import UmkmCard from '../../components/UmkmCard'
import Tombol from '../../components/ui/Tombol'
import { Memuat, Kosong, Galat } from '../../components/ui/Keadaan'
import { useData } from '../../lib/useData'
import { ambilDaftarUmkm, ambilKategori } from '../../lib/api'

export default function Katalog() {
  const [param, setParam] = useSearchParams()
  const kategoriAktif = param.get('kategori')

  const daftarKategori = useData(() => ambilKategori(), [])
  // Semua UMKM aktif diambil sekali, penyaringan dilakukan di sisi klien
  // supaya pindah kategori tidak memicu permintaan baru ke server.
  const daftarUmkm = useData(() => ambilDaftarUmkm(), [])

  const semua = daftarUmkm.data || []
  const kategori = daftarKategori.data || []
  const tampil = kategoriAktif ? semua.filter((u) => u.kategori_id === kategoriAktif) : semua

  const hitung = (id) => semua.filter((u) => u.kategori_id === id).length
  const namaKategoriAktif = kategori.find((k) => k.id === kategoriAktif)?.nama

  function pilih(id) {
    if (!id) setParam({}, { replace: true })
    else setParam({ kategori: id }, { replace: true })
  }

  return (
    <>
      <PitaJudul
        jejak={[{ label: 'Beranda', ke: '/' }, { label: 'Katalog' }]}
        kicker="daftar lapak"
        judul="Katalog UMKM Jati Kulon"
        keterangan="Semua unit usaha binaan BUMDes yang sedang aktif. Saring berdasarkan jenis usaha, lalu buka lapaknya untuk melihat produk dan menghubungi pemiliknya."
      />

      <div className="mx-auto max-w-los px-5 py-10 lg:px-8">
        {/* Deretan papan kategori */}
        <div className="mb-9">
          <h2 className="sr-only">Saring berdasarkan kategori</h2>
          <div className="los-geser flex flex-wrap gap-3">
            <KategoriChip
              nama="Semua"
              jumlah={semua.length}
              aktif={!kategoriAktif}
              onClick={() => pilih(null)}
            />
            {/* kategori yang belum punya UMKM aktif tidak ditampilkan —
                datanya tetap ada, hanya tidak jadi saringan kosong */}
            {kategori
              .filter((k) => hitung(k.id) > 0 || kategoriAktif === k.id)
              .map((k) => (
                <KategoriChip
                  key={k.id}
                  nama={k.nama}
                  jumlah={hitung(k.id)}
                  aktif={kategoriAktif === k.id}
                  onClick={() => pilih(k.id)}
                />
              ))}
          </div>
        </div>

        {/* Hasil */}
        {daftarUmkm.error ? (
          <Galat />
        ) : daftarUmkm.loading ? (
          <Memuat jumlah={6} />
        ) : tampil.length === 0 ? (
          <Kosong
            judul={
              kategoriAktif
                ? `Belum ada usaha di kategori ${namaKategoriAktif || 'ini'}`
                : 'Katalog masih kosong'
            }
            pesan="Coba pilih kategori lain, atau lihat seluruh daftar usaha yang tersedia."
            aksi={
              kategoriAktif ? (
                <Tombol variasi="garis" onClick={() => pilih(null)}>
                  Tampilkan semua
                </Tombol>
              ) : null
            }
          />
        ) : (
          <>
            <p className="mb-5 font-body text-[0.78rem] uppercase tracking-papan text-wood-dark/60">
              {tampil.length} usaha
              {namaKategoriAktif ? ` di kategori ${namaKategoriAktif}` : ' terdaftar'}
            </p>
            <div className="los-grid">
              {tampil.map((u) => (
                <UmkmCard key={u.id} umkm={u} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
