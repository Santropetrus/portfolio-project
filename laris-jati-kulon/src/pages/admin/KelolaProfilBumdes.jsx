import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Tombol from '../../components/ui/Tombol'
import { Galat } from '../../components/ui/Keadaan'
import { Teks, Paragraf } from '../../components/admin/Isian'
import UnggahFoto from '../../components/admin/UnggahFoto'
import Notifikasi from '../../components/admin/Notifikasi'
import { useData } from '../../lib/useData'
import { baris } from '../../lib/format'
import { ambilProfilAdmin, simpanProfil, hapusFoto, pesanGalat, BUCKET_UMKM } from '../../lib/adminApi'
import { SITE } from '../../config/site'

export default function KelolaProfilBumdes() {
  const profil = useData(() => ambilProfilAdmin(), [])
  const [kabar, setKabar] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [logoAwal, setLogoAwal] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { nama_bumdes: '', sambutan: '', visi: '', misi: '' },
  })

  useEffect(() => {
    if (profil.data) {
      reset({
        nama_bumdes: profil.data.nama_bumdes || '',
        sambutan: profil.data.sambutan || '',
        visi: profil.data.visi || '',
        misi: profil.data.misi || '',
      })
      setLogoUrl(profil.data.logo_url || null)
      setLogoAwal(profil.data.logo_url || null)
    }
  }, [profil.data, reset])

  const poinMisi = baris(watch('misi'))

  async function kirim(isian) {
    try {
      if (logoAwal && logoUrl !== logoAwal) await hapusFoto(logoAwal, BUCKET_UMKM)
      await simpanProfil({ ...isian, logo_url: logoUrl })
      setLogoAwal(logoUrl)
      setKabar({ jenis: 'baik', teks: 'Profil BUMDes tersimpan.' })
    } catch (e) {
      setKabar({ jenis: 'galat', teks: pesanGalat(e) })
    }
  }

  if (profil.error) return <Galat />
  if (profil.loading) {
    return <p className="font-body text-sm text-wood-dark/60">Memuat profil&hellip;</p>
  }

  return (
    <div className="max-w-3xl">
      <p className="tulis text-[1.3rem] leading-none text-indigo">isi halaman profil</p>
      <h1 className="mt-1 text-[clamp(1.7rem,4vw,2.3rem)] text-wood-dark">Profil BUMDes</h1>
      <p className="mt-2 max-w-xl text-[0.92rem] leading-relaxed text-wood-dark/75">
        Isian di halaman ini langsung tampil di halaman publik Profil BUMDes.
      </p>

      <form onSubmit={handleSubmit(kirim)} className="mt-7 space-y-6" noValidate>
        <Teks
          id="nama_bumdes"
          label="Nama BUMDes"
          placeholder={SITE.pengelola}
          {...register('nama_bumdes')}
        />

        <Paragraf
          id="sambutan"
          label="Sambutan"
          baris={7}
          petunjuk="Pisahkan antar-paragraf dengan satu baris kosong."
          {...register('sambutan')}
        />

        <Paragraf
          id="visi"
          label="Visi"
          baris={3}
          petunjuk="Satu kalimat. Ditampilkan besar sebagai kutipan di halaman profil."
          {...register('visi')}
        />

        <div>
          <Paragraf
            id="misi"
            label="Misi"
            baris={6}
            petunjuk="Satu baris untuk satu poin. Tidak perlu menulis tanda hubung atau nomor."
            {...register('misi')}
          />

          {poinMisi.length > 0 && (
            <div className="mt-3 border-l-4 border-indigo bg-parchment-deep/45 px-4 py-3">
              <p className="font-body text-[0.72rem] font-semibold uppercase tracking-papan text-wood-dark/65">
                Pratinjau {poinMisi.length} poin
              </p>
              <ul className="mt-2 space-y-1.5">
                {poinMisi.map((m, i) => (
                  <li key={i} className="flex gap-2 text-[0.88rem] leading-relaxed text-wood-dark/85">
                    <span className="text-indigo">&#9671;</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <UnggahFoto
          label="Logo BUMDes"
          nilai={logoUrl}
          onGanti={setLogoUrl}
          bucket={BUCKET_UMKM}
          awalan="bumdes"
          nama={watch('nama_bumdes') || SITE.pengelola}
          rasio="1 / 1"
          petunjuk="Logo persegi paling rapi. Kalau belum ada, biarkan kosong."
        />

        <div className="flex flex-wrap gap-3 border-t border-wood-mid/40 pt-6">
          <Tombol type="submit" besar="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan…' : 'Simpan profil'}
          </Tombol>
          <Tombol variasi="garis" besar="lg" to="/profil-bumdes">
            Lihat halaman publiknya
          </Tombol>
        </div>
      </form>

      <Notifikasi kabar={kabar} onTutup={() => setKabar(null)} />
    </div>
  )
}
