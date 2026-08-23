import { useState } from 'react'
import { cacah } from '../../lib/useData'

/** Nada placeholder — hanya main gelap/terang dari token yang sudah ada */
const NADA = [
  { latar: 'rgb(var(--parchment-deep-rgb))', motif: 'tex-batik-kayu', opasitas: 0.3, teks: 'rgb(var(--wood-mid-rgb))' },
  { latar: 'rgb(var(--wood-soft-rgb) / .55)', motif: 'tex-batik', opasitas: 0.22, teks: 'rgb(var(--wood-dark-rgb))' },
  { latar: 'rgb(var(--parchment-light-rgb))', motif: 'tex-batik', opasitas: 0.26, teks: 'rgb(var(--indigo-rgb))' },
]

function inisial(nama = '') {
  const kata = nama.split(/\s+/).filter((k) => k.length > 2)
  return (kata.length ? kata : nama.split(/\s+/))
    .slice(0, 2)
    .map((k) => k[0] || '')
    .join('')
    .toUpperCase()
}

/**
 * Tampilan saat foto belum diunggah: bidang kayu bermotif kawung dengan
 * inisial usaha — bukan ikon kamera abu-abu. Ukuran motifnya tetap 40px
 * berapa pun besar kartunya, supaya tidak berubah jadi corak raksasa di HP.
 */
function BelumAdaFoto({ nama, id }) {
  const nada = NADA[cacah(String(nama) + String(id)) % NADA.length]
  return (
    <div className="absolute inset-0" style={{ background: nada.latar }}>
      <div className={`absolute inset-0 ${nada.motif}`} style={{ opacity: nada.opasitas }} />
      <span
        className="absolute bottom-2 left-3 font-display text-[2.1rem] leading-none opacity-55 sm:text-[2.6rem]"
        style={{ color: nada.teks }}
      >
        {inisial(nama) || 'JK'}
      </span>
      <span
        className="absolute right-3 top-2 font-body text-[0.58rem] uppercase tracking-papan opacity-35"
        style={{ color: nada.teks }}
      >
        foto menyusul
      </span>
    </div>
  )
}

export default function Foto({ src, alt, nama = '', id = 'x', rasio = '4 / 3', className = '' }) {
  const [gagal, setGagal] = useState(false)
  const kosong = !src || gagal

  return (
    <div
      className={['relative overflow-hidden bg-parchment-deep', className].join(' ')}
      style={{ aspectRatio: rasio }}
    >
      {kosong ? (
        <BelumAdaFoto nama={nama || alt} id={id} />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setGagal(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  )
}
