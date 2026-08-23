/**
 * Pembatas antar-seksi berupa serat kayu, bukan <hr> polos.
 * Garisnya sengaja tidak sejajar sempurna supaya terbaca sebagai urat kayu.
 */
export default function SeratKayu({ warna = 'var(--wood-mid)', className = '', tinggi = 22 }) {
  return (
    <svg
      viewBox="0 0 1200 22"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={['w-full', className].join(' ')}
      style={{ height: tinggi }}
    >
      <g fill="none" stroke={warna} strokeLinecap="round">
        <path d="M0 6 C 180 2, 320 11, 520 7 S 900 1, 1200 8" strokeWidth="1.6" opacity=".65" />
        <path d="M0 12 C 240 16, 400 6, 640 12 S 980 18, 1200 13" strokeWidth="1" opacity=".4" />
        <path d="M0 17 C 150 14, 380 20, 600 16 S 1010 12, 1200 18" strokeWidth=".8" opacity=".28" />
        <path d="M280 4 C 320 8, 330 14, 300 19" strokeWidth=".8" opacity=".3" />
        <path d="M860 3 C 900 8, 906 13, 880 20" strokeWidth=".8" opacity=".3" />
      </g>
    </svg>
  )
}
