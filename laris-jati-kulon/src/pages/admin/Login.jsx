import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../../components/ui/Logo'
import Tombol from '../../components/ui/Tombol'
import { Teks } from '../../components/admin/Isian'
import { SITE } from '../../config/site'
import { useSesi, masukDenganSandi, pesanGalatMasuk } from '../../lib/auth'

export default function Login() {
  const { masuk, memuat, modeContoh } = useSesi()
  const lokasi = useLocation()
  const arahkan = useNavigate()
  const [galat, setGalat] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const tujuan = lokasi.state?.dari || '/admin'

  if (!memuat && masuk) return <Navigate to={tujuan} replace />

  async function kirim(isian) {
    setGalat(null)
    try {
      await masukDenganSandi(isian.email.trim(), isian.sandi)
      arahkan(tujuan, { replace: true })
    } catch (e) {
      setGalat(pesanGalatMasuk(e))
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="tex-papan px-5 py-4">
        <Link to="/" className="mx-auto flex max-w-md items-center gap-3 no-underline">
          <Logo ukuran={30} />
          <span>
            <span className="block font-display text-[1.3rem] leading-none text-ivory">
              {SITE.nama}
            </span>
            <span className="tulis text-[1rem] text-parchment/70">{SITE.tagline}</span>
          </span>
        </Link>
      </div>
      <div className="tex-batik h-[7px] bg-parchment-deep opacity-70" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <p className="tulis text-[1.35rem] leading-none text-indigo">khusus pengurus</p>
          <h1 className="mt-1.5 text-[2rem] text-wood-dark">Masuk panel admin</h1>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-wood-dark/75">
            Halaman ini untuk admin {SITE.pengelola}. Pengunjung katalog tidak perlu akun.
          </p>

          {modeContoh ? (
            <div className="mt-6 border-l-4 border-status-habis bg-status-habis/10 px-4 py-4">
              <p className="font-body text-[0.88rem] leading-relaxed text-status-habis">
                Supabase belum tersambung, jadi belum ada akun yang bisa dipakai masuk. Selama
                keadaan ini, panel admin terbuka tanpa login dalam mode contoh.
              </p>
              <div className="mt-4">
                <Tombol to="/admin">Buka panel admin</Tombol>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(kirim)} className="mt-7 space-y-5" noValidate>
              <Teks
                id="email"
                label="Email"
                type="email"
                autoComplete="username"
                wajib
                placeholder="admin@desa.id"
                galat={errors.email?.message}
                {...register('email', {
                  required: 'Email wajib diisi',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Format email belum benar' },
                })}
              />

              <Teks
                id="sandi"
                label="Kata sandi"
                type="password"
                autoComplete="current-password"
                wajib
                galat={errors.sandi?.message}
                {...register('sandi', { required: 'Kata sandi wajib diisi' })}
              />

              {galat && (
                <div className="border-l-4 border-status-habis bg-status-habis/10 px-4 py-3">
                  <p className="font-body text-[0.86rem] text-status-habis">{galat}</p>
                </div>
              )}

              <Tombol besar="lg" type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Sedang masuk…' : 'Masuk'}
              </Tombol>
            </form>
          )}

          <p className="mt-8 border-t border-wood-mid/35 pt-5 text-[0.82rem] text-wood-dark/65">
            Lupa kata sandi? Setel ulang lewat dasbor Supabase pada menu Authentication &rarr; Users.
            Kembali ke{' '}
            <Link to="/" className="tautan">
              halaman katalog
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
