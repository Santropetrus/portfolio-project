import { useId, useRef, useState } from 'react'
import Foto from '../ui/Foto'
import Tombol from '../ui/Tombol'
import { unggahFoto, pesanGalat } from '../../lib/adminApi'

const kb = (byte) => `${Math.round(byte / 1024)} KB`

/**
 * Pemilih foto dengan kompresi otomatis sebelum diunggah.
 * Ukuran asli dan hasil kompresi ditampilkan supaya admin melihat sendiri
 * bahwa fotonya sudah dikecilkan, bukan sekadar percaya.
 */
export default function UnggahFoto({
  label = 'Foto',
  nilai,
  onGanti,
  bucket,
  awalan,
  nama = '',
  rasio = '4 / 3',
  petunjuk,
}) {
  const berkasRef = useRef(null)
  const idBerkas = useId()
  const [proses, setProses] = useState(false)
  const [galat, setGalat] = useState(null)
  const [ukuran, setUkuran] = useState(null)

  async function pilih(peristiwa) {
    const berkas = peristiwa.target.files?.[0]
    if (!berkas) return
    setGalat(null)
    setProses(true)
    try {
      const hasil = await unggahFoto({ berkas, bucket, awalan })
      setUkuran({ sebelum: berkas.size, sesudah: hasil.ukuran })
      onGanti(hasil.url)
    } catch (e) {
      setGalat(pesanGalat(e))
    } finally {
      setProses(false)
      if (berkasRef.current) berkasRef.current.value = ''
    }
  }

  return (
    <div>
      <p className="font-body text-[0.74rem] font-semibold uppercase tracking-papan text-wood-dark/70">
        {label}
      </p>

      <div className="mt-2 flex flex-wrap items-start gap-4">
        <div className="w-40 shrink-0 border-2 border-wood-mid/55">
          <Foto src={nilai} alt={`Pratinjau ${label}`} nama={nama} id="pratinjau" rasio={rasio} />
        </div>

        <div className="flex-1 space-y-2">
          {/* Tombol bawaan peramban tulisannya mengikuti bahasa peramban
              ("Choose File"), jadi input aslinya disembunyikan dan diganti
              label sendiri supaya seluruh panel tetap berbahasa Indonesia. */}
          <input
            ref={berkasRef}
            id={idBerkas}
            type="file"
            accept="image/*"
            onChange={pilih}
            className="sr-only"
          />
          <label
            htmlFor={idBerkas}
            className="inline-flex cursor-pointer items-center rounded-papan border-2 border-wood-mid/60 bg-parchment-deep px-3.5 py-2 font-body text-[0.74rem] font-semibold uppercase tracking-papan text-wood-dark hover:bg-parchment-light"
          >
            {nilai ? 'Ganti foto' : 'Pilih foto'}
          </label>

          {proses && (
            <p className="font-body text-[0.8rem] text-indigo">Mengecilkan lalu mengunggah&hellip;</p>
          )}

          {ukuran && !proses && (
            <p className="font-body text-[0.78rem] text-status-ok">
              Berhasil: {kb(ukuran.sebelum)} dikecilkan jadi {kb(ukuran.sesudah)}.
            </p>
          )}

          {galat && <p className="font-body text-[0.8rem] text-status-habis">{galat}</p>}

          {petunjuk && !galat && (
            <p className="text-[0.76rem] leading-snug text-wood-dark/55">{petunjuk}</p>
          )}

          {nilai && (
            <Tombol variasi="garis" besar="sm" onClick={() => onGanti(null)}>
              Hapus foto
            </Tombol>
          )}
        </div>
      </div>
    </div>
  )
}
