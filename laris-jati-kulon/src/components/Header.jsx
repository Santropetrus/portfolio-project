import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import Logo from './ui/Logo'
import { SITE } from '../config/site'

const MENU = [
  { ke: '/', label: 'Beranda' },
  { ke: '/katalog', label: 'Katalog' },
  { ke: '/profil-bumdes', label: 'Profil BUMDes' },
]

function Tautan({ ke, label, onClick }) {
  return (
    <NavLink
      to={ke}
      end={ke === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'relative block py-2 font-body text-[0.78rem] font-semibold uppercase tracking-papan no-underline transition-colors',
          isActive ? 'text-ivory' : 'text-ivory/65 hover:text-ivory',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {/* penanda halaman aktif: sapuan kuas indigo, bukan pill/underline polos */}
          <span
            aria-hidden="true"
            className={[
              'absolute -bottom-0.5 left-0 h-[3px] w-full origin-left -skew-x-12 bg-indigo-soft transition-transform duration-150',
              isActive ? 'scale-x-100' : 'scale-x-0',
            ].join(' ')}
          />
        </>
      )}
    </NavLink>
  )
}

export default function Header() {
  const [buka, setBuka] = useState(false)
  const lokasi = useLocation()

  useEffect(() => {
    setBuka(false)
  }, [lokasi.pathname])

  return (
    <header className="sticky top-0 z-40">
      <div className="tex-papan border-b border-wood-deep">
        <div className="mx-auto flex max-w-los items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <Logo />
            <span className="leading-none">
              <span className="block font-display text-[1.5rem] tracking-tight text-ivory">
                {SITE.nama}
              </span>
              <span className="tulis block text-[1.02rem] leading-tight text-parchment/75">
                {SITE.tagline}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Menu utama">
            {MENU.map((m) => (
              <Tautan key={m.ke} {...m} />
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setBuka((b) => !b)}
            aria-expanded={buka}
            aria-label={buka ? 'Tutup menu' : 'Buka menu'}
            className="rounded-papan border border-ivory/35 p-2 text-ivory md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              {buka ? (
                <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M3 6h14" strokeLinecap="round" />
                  <path d="M3 10h14" strokeLinecap="round" />
                  <path d="M3 14h10" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>

        {buka && (
          <nav className="border-t border-ivory/15 px-5 pb-4 md:hidden" aria-label="Menu utama seluler">
            {MENU.map((m) => (
              <Tautan key={m.ke} {...m} onClick={() => setBuka(false)} />
            ))}
          </nav>
        )}
      </div>

      {/* pita batik tipis sebagai pemisah header dengan isi halaman */}
      <div className="tex-batik h-[7px] bg-parchment-deep opacity-70" aria-hidden="true" />
    </header>
  )
}
