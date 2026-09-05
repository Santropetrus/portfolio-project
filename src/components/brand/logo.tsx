import { cn } from '@/lib/utils';

/**
 * Lambang merek: mangkuk matcha (chawan) dilihat dari atas dengan sapuan
 * chasen (pengocok bambu) di tengahnya.
 *
 * Sengaja TANPA <defs>/<linearGradient>: logo ini dirender beberapa kali di
 * satu halaman (panel desktop dan header mobile), dan id gradient yang sama
 * akan bentrok — instance yang tersembunyi bisa membuat instance yang terlihat
 * kehilangan warnanya. Kedalaman dibuat dari lingkaran bertumpuk saja.
 */
export function LogoMatcha({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn('h-9 w-9', className)}
      role="img"
      aria-label="Logo The Matcha Kyoto"
    >
      {/* Bibir mangkuk */}
      <circle cx="20" cy="20" r="18" fill="#f0e8d8" />
      {/* Teh matcha */}
      <circle cx="20" cy="20" r="14.5" fill="#41602e" />
      {/* Pantulan cahaya dari kiri atas */}
      <circle cx="16.5" cy="16" r="11" fill="#6b9b4c" opacity="0.85" />
      <circle cx="15" cy="14.5" r="7" fill="#8fbb6a" opacity="0.55" />
      {/* Buih hasil kocokan */}
      <path
        d="M11.2 21c2.6-2.2 5.5-3.3 8.8-3.3s6.2 1.1 8.8 3.3"
        fill="none"
        stroke="#f0e8d8"
        strokeOpacity="0.45"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Sapuan chasen */}
      <g stroke="#faf6ed" strokeOpacity="0.85" strokeWidth="1.3" strokeLinecap="round">
        <path d="M16 12.8v7.4" />
        <path d="M20 11.8v8.8" />
        <path d="M24 12.8v7.4" />
      </g>
      {/* Garis tepi */}
      <circle cx="20" cy="20" r="14.5" fill="none" stroke="#223318" strokeOpacity="0.4" />
    </svg>
  );
}
