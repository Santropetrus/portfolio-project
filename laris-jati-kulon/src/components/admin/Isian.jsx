import { forwardRef } from 'react'

/* Kumpulan kontrol formulir panel admin.
   Bentuknya kotak tegas dengan garis kayu — mengikuti sistem desain yang sama,
   hanya lebih padat karena ini layar kerja, bukan etalase.

   Semuanya memakai forwardRef: react-hook-form mendaftarkan field lewat `ref`,
   dan React tidak meneruskan ref ke komponen fungsi biasa. Tanpa ini, nilai
   awal tidak terpasang dan validasi selalu menganggap isian kosong. */

const dasar =
  'w-full rounded-papan border-2 border-wood-mid/55 bg-parchment-light px-3 py-2 font-body text-[0.92rem] text-wood-dark placeholder:text-wood-dark/35 focus:border-indigo focus:outline-none focus:ring-0'

function Bungkus({ label, wajib, galat, petunjuk, anak, id }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-body text-[0.74rem] font-semibold uppercase tracking-papan text-wood-dark/70"
      >
        {label}
        {wajib && <span className="ml-1 text-status-habis">*</span>}
      </label>
      <div className="mt-1.5">{anak}</div>
      {petunjuk && !galat && (
        <p className="mt-1 text-[0.76rem] leading-snug text-wood-dark/55">{petunjuk}</p>
      )}
      {galat && <p className="mt-1 text-[0.78rem] font-medium text-status-habis">{galat}</p>}
    </div>
  )
}

export const Teks = forwardRef(function Teks(
  { label, wajib, galat, petunjuk, id, ...sisa },
  ref,
) {
  return (
    <Bungkus
      label={label}
      wajib={wajib}
      galat={galat}
      petunjuk={petunjuk}
      id={id}
      anak={
        <input
          id={id}
          ref={ref}
          aria-invalid={galat ? 'true' : undefined}
          className={dasar}
          {...sisa}
        />
      }
    />
  )
})

export const Paragraf = forwardRef(function Paragraf(
  { label, wajib, galat, petunjuk, id, baris = 4, ...sisa },
  ref,
) {
  return (
    <Bungkus
      label={label}
      wajib={wajib}
      galat={galat}
      petunjuk={petunjuk}
      id={id}
      anak={
        <textarea
          id={id}
          ref={ref}
          rows={baris}
          aria-invalid={galat ? 'true' : undefined}
          className={`${dasar} leading-relaxed`}
          {...sisa}
        />
      }
    />
  )
})

export const Pilihan = forwardRef(function Pilihan(
  { label, wajib, galat, petunjuk, id, pilihan = [], kosong, ...sisa },
  ref,
) {
  return (
    <Bungkus
      label={label}
      wajib={wajib}
      galat={galat}
      petunjuk={petunjuk}
      id={id}
      anak={
        <select
          id={id}
          ref={ref}
          aria-invalid={galat ? 'true' : undefined}
          className={dasar}
          {...sisa}
        >
          {kosong && <option value="">{kosong}</option>}
          {pilihan.map((p) => (
            <option key={p.nilai} value={p.nilai}>
              {p.label}
            </option>
          ))}
        </select>
      }
    />
  )
})
