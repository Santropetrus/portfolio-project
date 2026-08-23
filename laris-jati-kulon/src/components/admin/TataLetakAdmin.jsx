import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import Logo from '../ui/Logo'
import { SITE } from '../../config/site'
import { useSesi, keluar } from '../../lib/auth'

const MENU = [
  { ke: '/admin', label: 'Ringkasan', ujung: true },
  { ke: '/admin/umkm', label: 'UMKM & Produk' },
  { ke: '/admin/profil-bumdes', label: 'Profil BUMDes' },
]

function Tautan({ ke, label, ujung, onKlik }) {
  return (
    <NavLink
      to={ke}
      end={ujung}
      onClick={onKlik}
      className={({ isActive }) =>
        [
          'block border-l-4 px-4 py-2.5 font-body text-[0.82rem] font-medium no-underline transition-colors',
          isActive
            ? 'border-indigo-soft bg-wood-dark/70 text-ivory'
            : 'border-transparent text-parchment/65 hover:bg-wood-dark/40 hover:text-ivory',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

/** Pita peringatan saat panel dibuka tanpa Supabase */
function PitaModeContoh() {
  return (
    <div className="border-b-2 border-status-habis bg-status-habis/12 px-5 py-2.5 lg:px-8">
      <p className="font-body text-[0.8rem] leading-snug text-status-habis">
        <strong className="font-semibold uppercase tracking-papan">Mode contoh</strong> — Supabase
        belum tersambung, jadi panel dibuka tanpa login dan setiap perubahan hilang begitu halaman
        dimuat ulang. Isi <code className="font-mono">.env</code> untuk memakai data sungguhan.
      </p>
    </div>
  )
}

export default function TataLetakAdmin() {
  const { email, modeContoh } = useSesi()
  const [buka, setBuka] = useState(false)
  const arahkan = useNavigate()

  async function tanganiKeluar() {
    await keluar()
    arahkan('/admin/login', { replace: true })
  }

  const isiSamping = (
    <>
      <nav className="py-2" aria-label="Menu admin">
        {MENU.map((m) => (
          <Tautan key={m.ke} {...m} onKlik={() => setBuka(false)} />
        ))}
      </nav>

      <div className="mt-auto border-t border-ivory/12 px-4 py-4">
        {email && <p className="mb-2 break-all font-body text-[0.74rem] text-parchment/55">{email}</p>}
        <Link
          to="/"
          className="block font-body text-[0.78rem] text-parchment/70 no-underline hover:text-ivory"
        >
          Lihat situs publik &rarr;
        </Link>
        {!modeContoh && (
          <button
            type="button"
            onClick={tanganiKeluar}
            className="mt-3 rounded-papan border border-ivory/35 px-3 py-1.5 font-body text-[0.74rem] font-semibold uppercase tracking-papan text-ivory hover:bg-wood-dark/60"
          >
            Keluar
          </button>
        )}
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* batang atas — hanya di layar kecil */}
      <div className="tex-papan flex items-center justify-between px-5 py-3 lg:hidden">
        <Link to="/admin" className="flex items-center gap-2.5 no-underline">
          <Logo ukuran={26} />
          <span className="font-display text-[1.15rem] text-ivory">{SITE.nama}</span>
          <span className="font-body text-[0.7rem] uppercase tracking-papan text-parchment/60">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setBuka((b) => !b)}
          aria-expanded={buka}
          className="rounded-papan border border-ivory/35 px-3 py-1.5 font-body text-[0.72rem] uppercase tracking-papan text-ivory"
        >
          {buka ? 'Tutup' : 'Menu'}
        </button>
      </div>
      {buka && <div className="tex-papan flex flex-col lg:hidden">{isiSamping}</div>}

      {/* bilah samping — layar besar */}
      <aside className="tex-papan hidden w-60 shrink-0 flex-col border-r border-wood-deep lg:flex">
        <Link to="/admin" className="flex items-center gap-3 px-4 py-5 no-underline">
          <Logo ukuran={30} />
          <span>
            <span className="block font-display text-[1.3rem] leading-none text-ivory">
              {SITE.nama}
            </span>
            <span className="font-body text-[0.68rem] uppercase tracking-papan text-parchment/55">
              Panel admin
            </span>
          </span>
        </Link>
        {isiSamping}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {modeContoh && <PitaModeContoh />}
        <main className="flex-1 px-5 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
