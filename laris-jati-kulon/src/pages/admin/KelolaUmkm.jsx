import { useState } from 'react'
import { Link } from 'react-router-dom'
import Tombol from '../../components/ui/Tombol'
import { Galat } from '../../components/ui/Keadaan'
import { LabelStatus } from '../../components/ui/Label'
import Notifikasi from '../../components/admin/Notifikasi'
import Konfirmasi from '../../components/admin/Konfirmasi'
import { Teks } from '../../components/admin/Isian'
import { useData } from '../../lib/useData'
import {
  ambilSemuaUmkm,
  ambilKategoriAdmin,
  ubahStatusUmkm,
  tukarUrutanUmkm,
  simpanKategori,
  hapusKategori,
  pesanGalat,
} from '../../lib/adminApi'

/* ------------------------------ panel kategori --------------------------- */

function PanelKategori({ kategori, umkm, onBerubah, onKabar }) {
  const [buka, setBuka] = useState(false)
  const [namaBaru, setNamaBaru] = useState('')
  const [sunting, setSunting] = useState(null)
  const [akanHapus, setAkanHapus] = useState(null)

  const dipakai = (id) => umkm.filter((u) => u.kategori_id === id).length

  async function tambah(peristiwa) {
    peristiwa.preventDefault()
    const nama = namaBaru.trim()
    if (!nama) return
    try {
      await simpanKategori({ nama, urutan: kategori.length + 1 })
      setNamaBaru('')
      onBerubah()
      onKabar({ jenis: 'baik', teks: `Kategori "${nama}" ditambahkan.` })
    } catch (e) {
      onKabar({ jenis: 'galat', teks: pesanGalat(e) })
    }
  }

  async function simpanSuntingan() {
    try {
      await simpanKategori(sunting)
      setSunting(null)
      onBerubah()
      onKabar({ jenis: 'baik', teks: 'Kategori diperbarui.' })
    } catch (e) {
      onKabar({ jenis: 'galat', teks: pesanGalat(e) })
    }
  }

  async function jalankanHapus() {
    try {
      await hapusKategori(akanHapus.id)
      setAkanHapus(null)
      onBerubah()
      onKabar({ jenis: 'baik', teks: 'Kategori dihapus.' })
    } catch (e) {
      setAkanHapus(null)
      onKabar({ jenis: 'galat', teks: pesanGalat(e) })
    }
  }

  return (
    <section className="mt-10 border-2 border-wood-mid/45 bg-parchment-light/70">
      <button
        type="button"
        onClick={() => setBuka((b) => !b)}
        aria-expanded={buka}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span>
          <span className="block font-body text-[0.95rem] font-semibold text-wood-dark">
            Kategori usaha
          </span>
          <span className="font-body text-[0.78rem] text-wood-dark/60">
            {kategori.length} kategori — dipakai sebagai saringan di halaman katalog
          </span>
        </span>
        <span className="font-body text-[0.74rem] uppercase tracking-papan text-indigo">
          {buka ? 'Tutup' : 'Kelola'}
        </span>
      </button>

      {buka && (
        <div className="border-t border-wood-mid/40 px-4 py-4">
          <ul className="divide-y divide-wood-mid/30">
            {kategori.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center gap-3 py-2.5">
                {sunting?.id === k.id ? (
                  <>
                    <input
                      value={sunting.nama}
                      onChange={(e) => setSunting({ ...sunting, nama: e.target.value })}
                      className="flex-1 rounded-papan border-2 border-wood-mid/55 bg-parchment-light px-2.5 py-1.5 font-body text-[0.88rem]"
                    />
                    <input
                      type="number"
                      value={sunting.urutan}
                      onChange={(e) => setSunting({ ...sunting, urutan: e.target.value })}
                      className="w-20 rounded-papan border-2 border-wood-mid/55 bg-parchment-light px-2.5 py-1.5 font-body text-[0.88rem]"
                      aria-label="Urutan kategori"
                    />
                    <Tombol besar="sm" onClick={simpanSuntingan}>
                      Simpan
                    </Tombol>
                    <Tombol besar="sm" variasi="garis" onClick={() => setSunting(null)}>
                      Batal
                    </Tombol>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-body text-[0.9rem] text-wood-dark">{k.nama}</span>
                    <span className="font-body text-[0.76rem] text-wood-dark/55">
                      {dipakai(k.id)} usaha
                    </span>
                    <Tombol
                      besar="sm"
                      variasi="garis"
                      onClick={() => setSunting({ id: k.id, nama: k.nama, urutan: k.urutan ?? 0 })}
                    >
                      Ubah
                    </Tombol>
                    <button
                      type="button"
                      onClick={() => setAkanHapus(k)}
                      className="rounded-papan border-2 border-status-habis/60 px-3 py-1.5 font-body text-[0.72rem] font-semibold uppercase tracking-papan text-status-habis hover:bg-status-habis/10"
                    >
                      Hapus
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>

          <form onSubmit={tambah} className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[14rem] flex-1">
              <Teks
                id="kategori-baru"
                label="Tambah kategori"
                value={namaBaru}
                onChange={(e) => setNamaBaru(e.target.value)}
                placeholder="misalnya: Warung Makan"
              />
            </div>
            <Tombol type="submit">Tambah</Tombol>
          </form>
        </div>
      )}

      <Konfirmasi
        buka={Boolean(akanHapus)}
        judul={`Hapus kategori ${akanHapus?.nama ?? ''}?`}
        pesan={
          akanHapus && dipakai(akanHapus.id) > 0
            ? `${dipakai(akanHapus.id)} usaha memakai kategori ini. Setelah dihapus, usaha tersebut jadi tanpa kategori dan perlu diatur ulang satu per satu.`
            : 'Kategori ini belum dipakai usaha mana pun, jadi aman dihapus.'
        }
        labelYa="Hapus kategori"
        onYa={jalankanHapus}
        onBatal={() => setAkanHapus(null)}
      />
    </section>
  )
}

/* --------------------------------- halaman ------------------------------- */

export default function KelolaUmkm() {
  const [versi, setVersi] = useState(0)
  const [kabar, setKabar] = useState(null)
  const [sibuk, setSibuk] = useState(null)

  const daftar = useData(() => ambilSemuaUmkm(), [versi])
  const kategori = useData(() => ambilKategoriAdmin(), [versi])

  const umkm = daftar.data || []
  const muat = () => setVersi((v) => v + 1)

  async function gantiStatus(u) {
    setSibuk(u.id)
    try {
      const status = u.status === 'aktif' ? 'nonaktif' : 'aktif'
      await ubahStatusUmkm(u.id, status)
      muat()
      setKabar({
        jenis: 'baik',
        teks:
          status === 'aktif'
            ? `${u.nama} kembali tampil di katalog.`
            : `${u.nama} disembunyikan dari katalog. Datanya tetap tersimpan.`,
      })
    } catch (e) {
      setKabar({ jenis: 'galat', teks: pesanGalat(e) })
    } finally {
      setSibuk(null)
    }
  }

  async function geser(indeks, arah) {
    const a = umkm[indeks]
    const b = umkm[indeks + arah]
    if (!a || !b) return
    setSibuk(a.id)
    try {
      await tukarUrutanUmkm(a, b)
      muat()
    } catch (e) {
      setKabar({ jenis: 'galat', teks: pesanGalat(e) })
    } finally {
      setSibuk(null)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tulis text-[1.3rem] leading-none text-indigo">daftar lapak</p>
          <h1 className="mt-1 text-[clamp(1.7rem,4vw,2.3rem)] text-wood-dark">UMKM &amp; Produk</h1>
          <p className="mt-2 max-w-xl text-[0.92rem] leading-relaxed text-wood-dark/75">
            Urutan di tabel ini menentukan urutan tampil di katalog dan siapa yang muncul di
            beranda. Menonaktifkan usaha hanya menyembunyikannya — datanya tidak dihapus.
          </p>
        </div>
        <Tombol to="/admin/umkm/baru" besar="lg">
          Tambah UMKM
        </Tombol>
      </div>

      {daftar.error ? (
        <div className="mt-8">
          <Galat />
        </div>
      ) : daftar.loading ? (
        <p className="mt-8 font-body text-sm text-wood-dark/60">Memuat daftar&hellip;</p>
      ) : umkm.length === 0 ? (
        <div className="mt-8 border border-dashed border-wood-mid/60 px-5 py-10">
          <h2 className="text-[1.25rem] text-wood-dark">Belum ada UMKM terdaftar</h2>
          <p className="mt-2 max-w-md text-[0.9rem] text-wood-dark/75">
            Tambahkan usaha pertama, lalu isi produknya. Foto boleh menyusul belakangan.
          </p>
          <div className="mt-5">
            <Tombol to="/admin/umkm/baru">Tambah UMKM</Tombol>
          </div>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto border-2 border-wood-mid/45">
          <table className="w-full min-w-[46rem] border-collapse bg-parchment-light/70 text-left">
            <thead>
              <tr className="border-b-2 border-wood-mid/45 bg-parchment-deep/60">
                {['Urutan', 'Nama usaha', 'Kategori', 'Produk', 'Status', ''].map((j) => (
                  <th
                    key={j}
                    className="px-3 py-2.5 font-body text-[0.7rem] font-semibold uppercase tracking-papan text-wood-dark/70"
                  >
                    {j}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {umkm.map((u, i) => (
                <tr key={u.id} className="border-b border-wood-mid/30 last:border-0">
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => geser(i, -1)}
                        disabled={i === 0 || sibuk === u.id}
                        aria-label={`Naikkan urutan ${u.nama}`}
                        className="rounded-papan border border-wood-mid/60 px-1.5 py-0.5 text-[0.7rem] text-wood-dark disabled:opacity-30"
                      >
                        &uarr;
                      </button>
                      <button
                        type="button"
                        onClick={() => geser(i, 1)}
                        disabled={i === umkm.length - 1 || sibuk === u.id}
                        aria-label={`Turunkan urutan ${u.nama}`}
                        className="rounded-papan border border-wood-mid/60 px-1.5 py-0.5 text-[0.7rem] text-wood-dark disabled:opacity-30"
                      >
                        &darr;
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      to={`/admin/umkm/${u.id}`}
                      className="font-body text-[0.92rem] font-semibold text-wood-dark no-underline hover:text-indigo"
                    >
                      {u.nama}
                    </Link>
                    <span className="block font-mono text-[0.72rem] text-wood-dark/50">
                      /umkm/{u.slug}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="tulis text-[1.05rem] text-indigo">
                      {u.kategori_nama || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-body text-[0.85rem] text-wood-dark/75">
                    {u.jumlah_produk ?? 0}
                  </td>
                  <td className="px-3 py-3">
                    <LabelStatus jenis="umkm" status={u.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <Tombol besar="sm" variasi="garis" to={`/admin/umkm/${u.id}`}>
                      Kelola
                    </Tombol>
                    <button
                      type="button"
                      onClick={() => gantiStatus(u)}
                      disabled={sibuk === u.id}
                      className="ml-2 rounded-papan border-2 border-wood-mid/60 px-3 py-1.5 font-body text-[0.72rem] font-semibold uppercase tracking-papan text-wood-dark hover:bg-parchment-deep disabled:opacity-50"
                    >
                      {u.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PanelKategori
        kategori={kategori.data || []}
        umkm={umkm}
        onBerubah={muat}
        onKabar={setKabar}
      />

      <Notifikasi kabar={kabar} onTutup={() => setKabar(null)} />
    </div>
  )
}
