import { Link } from 'react-router-dom'

/**
 * Tombol dasar sistem desain LARIS.
 * Bentuknya papan kecil: sudut hampir siku (2px) + bayangan padat yang
 * "menempel" saat ditekan — bukan pill rounded-full dengan bayangan blur.
 */
const gaya = {
  utama:
    'bg-indigo text-ivory border-indigo-deep hover:bg-indigo-soft active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-papan-sm',
  garis:
    'bg-transparent text-wood-dark border-wood-mid hover:bg-parchment-deep active:translate-x-[1px] active:translate-y-[1px]',
  gelap:
    'bg-wood-dark text-ivory border-wood-deep hover:bg-wood-mid active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-papan-sm',
  terang:
    'bg-parchment text-wood-dark border-wood-dark hover:bg-parchment-light active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-papan-sm',
}

const ukuran = {
  sm: 'px-3 py-1.5 text-[0.78rem]',
  md: 'px-4 py-2.5 text-[0.85rem]',
  lg: 'px-6 py-3 text-[0.95rem]',
}

export default function Tombol({
  variasi = 'utama',
  besar = 'md',
  to,
  href,
  className = '',
  children,
  ...sisa
}) {
  const kelas = [
    'inline-flex items-center justify-center gap-2 rounded-papan border-2',
    'font-body font-semibold uppercase tracking-papan',
    'transition-[background-color,transform,box-shadow] duration-100',
    'no-underline cursor-pointer',
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-x-0 disabled:active:translate-y-0',
    gaya[variasi] ?? gaya.utama,
    ukuran[besar] ?? ukuran.md,
    className,
  ].join(' ')

  if (to) {
    return (
      <Link to={to} className={kelas} {...sisa}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={kelas} target="_blank" rel="noopener noreferrer" {...sisa}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={kelas} {...sisa}>
      {children}
    </button>
  )
}
