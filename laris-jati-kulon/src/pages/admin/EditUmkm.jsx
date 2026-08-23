import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Tombol from '../../components/ui/Tombol'
import Papan from '../../components/ui/Papan'
import Foto from '../../components/ui/Foto'
import { Galat } from '../../components/ui/Keadaan'
import { LabelStatus } from '../../components/ui/Label'
import { Teks, Paragraf, Pilihan } from '../../components/admin/Isian'
import UnggahFoto from '../../components/admin/UnggahFoto'
import Notifikasi from '../../components/admin/Notifikasi'
import Konfirmasi from '../../components/admin/Konfirmasi'
import { useData } from '../../lib/useData'
import { buatSlug, hargaLengkap } from '../../lib/format'
import { nomorWaValid, normalkanNomorWa } from '../../lib/whatsapp'
import {
  ambilUmkm,
  ambilKategoriAdmin,
  ambilProduk,
  simpanUmkm,
  simpanProduk,
  ubahStatusProduk,
  hapusProduk,
  hapusFoto,
  pesanGalat,
  BUCKET_UMKM,
  BUCKET_PRODUK,
} from '../../lib/adminApi'

/* ------------------------------ formulir produk -------------------------- */

function FormProduk({ umkmId, produk, jumlahProduk, onSelesai, onBatal, onKabar }) {
  const [fotoUrl, setFotoUrl] = useState(produk?.foto_url || null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nama: produk?.nama || '',
      deskripsi: produk?.deskripsi || '',
      harga: produk?.harga ?? '',
      satuan: produk?.satuan || '',
      status: produk?.status || 'tersedia',
      urutan: produk?.urutan ?? jumlahProduk + 1,
    },
  })

  async function kirim(isian) {
    try {
      if (produk?.foto_url && fotoUrl !== produk.foto_url) {
        await hapusFoto(produk.foto_url, BUCKET_PRODUK)
      }
      await simpanProduk({ ...isian, id: produk?.id, umkm_id: umkmId, foto_url: fotoUrl })
      onKabar({ jenis: 'baik', teks: produk ? 'Produk diperbarui.' : 'Produk ditambahkan.' })
      onSelesai()
    } catch (e) {
      onKabar({ jenis: 'galat', teks: pesanGalat(e) })
    }
  }

  return (
    <form
      onSubmit={handleSubmit(kirim)}
      className="border-2 border-indigo/60 bg-parchment-light px-4 py-5"
      noValidate
    >
      <h3 className="text-[1.2rem] text-wood-dark">
        {produk ? `Ubah produk: ${produk.nama}` : 'Produk baru'}
      </h3>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Teks
          id="produk-nama"
          label="Nama produk"
          wajib
          galat={errors.nama?.message}
          {...register('nama', { required: 'Nama produk wajib diisi' })}
        />
        <Teks
          id="produk-satuan"
          label="Satuan"
          petunjuk="Boleh dikosongkan. Contoh: pcs, kg, porsi, kotak."
          {...register('satuan')}
        />
        <Teks
          id="produk-harga"
          label="Harga (Rp)"
          type="number"
          min="0"
          step="500"
          petunjuk="Kosongkan kalau harganya nego atau tergantung pesanan."
          galat={errors.harga?.message}
          {...register('harga', {
            validate: (v) =>
              v === '' || Number(v) >= 0 || 'Harga tidak boleh minus',
          })}
        />
        <Pilihan
          id="produk-status"
          label="Status"
          petunjuk="Produk habis tetap tampil, tapi ditandai dan tombol pesannya nonaktif."
          pilihan={[
            { nilai: 'tersedia', label: 'Tersedia' },
            { nilai: 'habis', label: 'Sedang habis' },
          ]}
          {...register('status')}
        />
        <div className="md:col-span-2">
          <Paragraf
            id="produk-deskripsi"
            label="Deskripsi"
            baris={3}
            petunjuk="Dua sampai tiga kalimat sudah cukup: isi kemasan, rasa, atau ketentuan pesanan."
            {...register('deskripsi')}
          />
        </div>
        <Teks
          id="produk-urutan"
          label="Urutan"
          type="number"
          petunjuk="Angka kecil tampil lebih dulu."
          {...register('urutan')}
        />
      </div>

      <div className="mt-5">
        <UnggahFoto
          label="Foto produk"
          nilai={fotoUrl}
          onGanti={setFotoUrl}
          bucket={BUCKET_PRODUK}
          awalan="produk"
          nama={produk?.nama || 'Produk'}
          petunjuk="Foto dari HP otomatis dikecilkan sebelum diunggah."
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Tombol type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan…' : 'Simpan produk'}
        </Tombol>
        <Tombol variasi="garis" onClick={onBatal}>
          Batal
        </Tombol>
      </div>
    </form>
  )
}

/* ----------------------------- daftar produk ----------------------------- */

function DaftarProduk({ umkmId, namaUmkm, onKabar }) {
  const [versi, setVersi] = useState(0)
  const [form, setForm] = useState(null) // null | { produk } | {}
  const [akanHapus, setAkanHapus] = useState(null)

  const { data, loading, error } = useData(() => ambilProduk(umkmId), [umkmId, versi])
  const produk = data || []
  const muat = () => setVersi((v) => v + 1)

  async function gantiStatus(p) {
    try {
      await ubahStatusProduk(p.id, p.status === 'tersedia' ? 'habis' : 'tersedia')
      muat()
    } catch (e) {
      onKabar({ jenis: 'galat', teks: pesanGalat(e) })
    }
  }

  async function jalankanHapus() {
    try {
      if (akanHapus.foto_url) await hapusFoto(akanHapus.foto_url, BUCKET_PRODUK)
      await hapusProduk(akanHapus.id)
      setAkanHapus(null)
      muat()
      onKabar({ jenis: 'baik', teks: 'Produk dihapus.' })
    } catch (e) {
      setAkanHapus(null)
      onKabar({ jenis: 'galat', teks: pesanGalat(e) })
    }
  }

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-wood-mid/45 pb-2">
        <div>
          <h2 className="text-[1.5rem] text-wood-dark">Produk {namaUmkm}</h2>
          <p className="mt-1 text-[0.85rem] text-wood-dark/65">
            {produk.length} produk terdaftar
          </p>
        </div>
        {!form && <Tombol onClick={() => setForm({})}>Tambah produk</Tombol>}
      </div>

      {form && (
        <div className="mt-5">
          <FormProduk
            umkmId={umkmId}
            produk={form.produk}
            jumlahProduk={produk.length}
            onSelesai={() => {
              setForm(null)
              muat()
            }}
            onBatal={() => setForm(null)}
            onKabar={onKabar}
          />
        </div>
      )}

      {error ? (
        <div className="mt-5">
          <Galat />
        </div>
      ) : loading ? (
        <p className="mt-5 font-body text-sm text-wood-dark/60">Memuat produk&hellip;</p>
      ) : produk.length === 0 ? (
        <p className="mt-5 border border-dashed border-wood-mid/60 px-4 py-6 text-[0.9rem] text-wood-dark/70">
          Belum ada produk. Tambahkan minimal satu supaya lapak ini punya isi di katalog.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {produk.map((p) => (
            <li key={p.id}>
              <Papan className="flex flex-wrap items-center gap-4 px-3 py-3">
                <div className="w-20 shrink-0 border border-wood-mid/45">
                  <Foto
                    src={p.foto_url}
                    alt={p.nama}
                    nama={p.nama}
                    id={p.id}
                    rasio="1 / 1"
                  />
                </div>

                <div className="min-w-[10rem] flex-1">
                  <p className="font-body text-[0.95rem] font-semibold text-wood-dark">{p.nama}</p>
                  <p className="tulis text-[1.2rem] leading-tight text-indigo">
                    {hargaLengkap(p.harga, p.satuan)}
                  </p>
                </div>

                <LabelStatus status={p.status} />

                <div className="flex flex-wrap gap-2">
                  <Tombol besar="sm" variasi="garis" onClick={() => setForm({ produk: p })}>
                    Ubah
                  </Tombol>
                  <button
                    type="button"
                    onClick={() => gantiStatus(p)}
                    className="rounded-papan border-2 border-wood-mid/60 px-3 py-1.5 font-body text-[0.72rem] font-semibold uppercase tracking-papan text-wood-dark hover:bg-parchment-deep"
                  >
                    {p.status === 'tersedia' ? 'Tandai habis' : 'Tandai tersedia'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAkanHapus(p)}
                    className="rounded-papan border-2 border-status-habis/60 px-3 py-1.5 font-body text-[0.72rem] font-semibold uppercase tracking-papan text-status-habis hover:bg-status-habis/10"
                  >
                    Hapus
                  </button>
                </div>
              </Papan>
            </li>
          ))}
        </ul>
      )}

      <Konfirmasi
        buka={Boolean(akanHapus)}
        judul={`Hapus produk ${akanHapus?.nama ?? ''}?`}
        pesan="Produk beserta fotonya dihapus permanen. Kalau cuma sedang kosong, pakai tombol Tandai habis supaya datanya tidak hilang."
        labelYa="Hapus permanen"
        onYa={jalankanHapus}
        onBatal={() => setAkanHapus(null)}
      />
    </section>
  )
}

/* --------------------------------- halaman ------------------------------- */

export default function EditUmkm() {
  const { id } = useParams()
  const baru = id === 'baru'
  const arahkan = useNavigate()

  const [kabar, setKabar] = useState(null)
  const [fotoUrl, setFotoUrl] = useState(null)
  const [fotoAwal, setFotoAwal] = useState(null)

  const umkm = useData(() => (baru ? Promise.resolve(null) : ambilUmkm(id)), [id])
  const kategori = useData(() => ambilKategoriAdmin(), [])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    defaultValues: {
      nama: '',
      slug: '',
      kategori_id: '',
      deskripsi: '',
      alamat: '',
      nomor_wa: '',
      status: 'aktif',
      urutan: 0,
    },
  })

  useEffect(() => {
    if (umkm.data) {
      reset({
        nama: umkm.data.nama || '',
        slug: umkm.data.slug || '',
        kategori_id: umkm.data.kategori_id || '',
        deskripsi: umkm.data.deskripsi || '',
        alamat: umkm.data.alamat || '',
        nomor_wa: umkm.data.nomor_wa || '',
        status: umkm.data.status || 'aktif',
        urutan: umkm.data.urutan ?? 0,
      })
      setFotoUrl(umkm.data.foto_profil_url || null)
      setFotoAwal(umkm.data.foto_profil_url || null)
    }
  }, [umkm.data, reset])

  // Saat menambah usaha baru, slug diisikan otomatis dari nama selama admin
  // belum mengetiknya sendiri — supaya tidak perlu paham soal slug.
  const nama = watch('nama')
  useEffect(() => {
    if (baru && !dirtyFields.slug) setValue('slug', buatSlug(nama || ''))
  }, [nama, baru, dirtyFields.slug, setValue])

  async function kirim(isian) {
    try {
      if (fotoAwal && fotoUrl !== fotoAwal) await hapusFoto(fotoAwal, BUCKET_UMKM)

      const tersimpan = await simpanUmkm({
        ...isian,
        id: baru ? undefined : id,
        nomor_wa: normalkanNomorWa(isian.nomor_wa),
        foto_profil_url: fotoUrl,
      })

      setFotoAwal(fotoUrl)
      setKabar({ jenis: 'baik', teks: 'Data usaha tersimpan.' })

      if (baru && tersimpan?.id) {
        arahkan(`/admin/umkm/${tersimpan.id}`, { replace: true })
      }
    } catch (e) {
      setKabar({ jenis: 'galat', teks: pesanGalat(e) })
    }
  }

  if (umkm.error) {
    return <Galat />
  }

  if (!baru && umkm.loading) {
    return <p className="font-body text-sm text-wood-dark/60">Memuat data usaha&hellip;</p>
  }

  if (!baru && !umkm.data) {
    return (
      <div className="border border-dashed border-wood-mid/60 px-5 py-10">
        <h1 className="text-[1.4rem] text-wood-dark">Data usaha tidak ditemukan</h1>
        <p className="mt-2 text-[0.9rem] text-wood-dark/75">
          Mungkin sudah dihapus dari basis data.
        </p>
        <div className="mt-5">
          <Tombol to="/admin/umkm">Kembali ke daftar</Tombol>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <nav className="font-body text-[0.74rem] uppercase tracking-papan text-wood-dark/55">
        <Link to="/admin/umkm" className="text-wood-dark/70 no-underline hover:text-indigo">
          UMKM &amp; Produk
        </Link>
        <span className="px-2">/</span>
        <span>{baru ? 'Tambah baru' : umkm.data.nama}</span>
      </nav>

      <h1 className="mt-2 text-[clamp(1.7rem,4vw,2.3rem)] text-wood-dark">
        {baru ? 'Tambah UMKM' : umkm.data.nama}
      </h1>
      {!baru && (
        <p className="mt-1.5 font-body text-[0.85rem] text-wood-dark/65">
          Halaman publiknya:{' '}
          <Link to={`/umkm/${umkm.data.slug}`} className="tautan font-mono text-[0.82rem]">
            /umkm/{umkm.data.slug}
          </Link>
        </p>
      )}

      <form onSubmit={handleSubmit(kirim)} className="mt-7" noValidate>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Teks
              id="nama"
              label="Nama usaha"
              wajib
              galat={errors.nama?.message}
              {...register('nama', { required: 'Nama usaha wajib diisi' })}
            />
          </div>

          <Teks
            id="slug"
            label="Alamat halaman (slug)"
            wajib
            petunjuk="Huruf kecil dan tanda hubung. Mengubahnya membuat tautan lama tidak berlaku."
            galat={errors.slug?.message}
            {...register('slug', {
              required: 'Slug wajib diisi',
              pattern: {
                value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: 'Hanya huruf kecil, angka, dan tanda hubung',
              },
            })}
          />

          <Pilihan
            id="kategori_id"
            label="Kategori"
            kosong="— tanpa kategori —"
            petunjuk="Kategori baru ditambahkan lewat panel di halaman daftar UMKM."
            pilihan={(kategori.data || []).map((k) => ({ nilai: k.id, label: k.nama }))}
            {...register('kategori_id')}
          />

          <Teks
            id="nomor_wa"
            label="Nomor WhatsApp"
            wajib
            inputMode="numeric"
            placeholder="6281234567890"
            petunjuk="Format internasional tanpa + dan tanpa 0 di depan. Nomor 0812… ditulis 62812…"
            galat={errors.nomor_wa?.message}
            {...register('nomor_wa', {
              required: 'Nomor WhatsApp wajib diisi',
              validate: (v) =>
                nomorWaValid(v) || 'Nomor belum benar. Contoh yang benar: 6281234567890',
            })}
          />

          <Teks id="alamat" label="Alamat" placeholder="RT / RW, dusun" {...register('alamat')} />

          <div className="md:col-span-2">
            <Paragraf
              id="deskripsi"
              label="Deskripsi usaha"
              baris={4}
              petunjuk="Ceritakan singkat: sejak kapan, apa yang dikerjakan, ada ketentuan pesanan atau tidak."
              {...register('deskripsi')}
            />
          </div>

          <Pilihan
            id="status"
            label="Status"
            petunjuk="Nonaktif berarti disembunyikan dari katalog, bukan dihapus."
            pilihan={[
              { nilai: 'aktif', label: 'Aktif — tampil di katalog' },
              { nilai: 'nonaktif', label: 'Nonaktif — disembunyikan' },
            ]}
            {...register('status')}
          />

          <Teks
            id="urutan"
            label="Urutan"
            type="number"
            petunjuk="Angka kecil tampil lebih dulu di katalog dan beranda."
            {...register('urutan')}
          />
        </div>

        <div className="mt-7">
          <UnggahFoto
            label="Foto usaha"
            nilai={fotoUrl}
            onGanti={setFotoUrl}
            bucket={BUCKET_UMKM}
            awalan="umkm"
            nama={nama || 'Usaha'}
            petunjuk="Sebaiknya foto lapak, etalase, atau produk andalan. Otomatis dikecilkan sebelum diunggah."
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-wood-mid/40 pt-6">
          <Tombol type="submit" besar="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan…' : 'Simpan data usaha'}
          </Tombol>
          <Tombol variasi="garis" besar="lg" to="/admin/umkm">
            Kembali
          </Tombol>
        </div>
      </form>

      {baru ? (
        <p className="mt-12 border-l-4 border-indigo bg-parchment-deep/45 px-5 py-4 text-[0.88rem] leading-relaxed text-wood-dark/80">
          Daftar produk bisa diisi setelah data usaha ini disimpan.
        </p>
      ) : (
        <DaftarProduk umkmId={id} namaUmkm={umkm.data.nama} onKabar={setKabar} />
      )}

      <Notifikasi kabar={kabar} onTutup={() => setKabar(null)} />
    </div>
  )
}
