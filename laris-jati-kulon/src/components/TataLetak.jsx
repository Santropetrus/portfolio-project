import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

/** Kerangka halaman publik: header, isi, footer, dan reset scroll antar-halaman */
export default function TataLetak() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#isi"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-papan focus:bg-indigo focus:px-4 focus:py-2 focus:text-ivory"
      >
        Lompat ke konten
      </a>
      <Header />
      <main id="isi" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
