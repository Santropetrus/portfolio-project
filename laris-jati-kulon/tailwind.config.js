/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // Palet default Tailwind sengaja DIBUANG (bukan di-extend) supaya
    // kelas seperti bg-blue-500 / text-purple-600 tidak bisa dipakai sama sekali.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      wood: {
        dark: 'rgb(var(--wood-dark-rgb) / <alpha-value>)',
        mid: 'rgb(var(--wood-mid-rgb) / <alpha-value>)',
        deep: 'rgb(var(--wood-deep-rgb) / <alpha-value>)',
        soft: 'rgb(var(--wood-soft-rgb) / <alpha-value>)',
      },
      parchment: {
        DEFAULT: 'rgb(var(--parchment-rgb) / <alpha-value>)',
        deep: 'rgb(var(--parchment-deep-rgb) / <alpha-value>)',
        light: 'rgb(var(--parchment-light-rgb) / <alpha-value>)',
      },
      indigo: {
        DEFAULT: 'rgb(var(--indigo-rgb) / <alpha-value>)',
        soft: 'rgb(var(--indigo-soft-rgb) / <alpha-value>)',
        deep: 'rgb(var(--indigo-deep-rgb) / <alpha-value>)',
      },
      ivory: 'rgb(var(--ivory-rgb) / <alpha-value>)',
      status: {
        ok: 'rgb(var(--status-ok-rgb) / <alpha-value>)',
        habis: 'rgb(var(--status-habis-rgb) / <alpha-value>)',
      },
    },
    fontFamily: {
      display: ['Ultra', 'Georgia', 'serif'],
      body: ['"Work Sans"', 'system-ui', 'sans-serif'],
      tulis: ['Caveat', 'cursive'],
    },
    extend: {
      // Skala transparansi penuh 0–100 supaya modifier seperti /45 atau /12
      // bisa dipakai untuk menurunkan kepekatan token yang sudah ada,
      // bukan menambah warna baru ke palet.
      opacity: Object.fromEntries(
        Array.from({ length: 101 }, (_, i) => [i, String(i / 100)]),
      ),
      // Radius sengaja kecil & bervariasi — bukan rounded-lg di semua elemen.
      borderRadius: {
        none: '0',
        papan: '2px',
        kartu: '3px',
        stempel: '999px',
      },
      boxShadow: {
        papan: '3px 3px 0 var(--wood-dark)',
        'papan-sm': '2px 2px 0 var(--wood-dark)',
        gantung: '0 6px 10px -8px rgba(62,42,30,.55)',
        lapak: '0 12px 26px -20px rgba(62,42,30,.75)',
      },
      letterSpacing: {
        papan: '0.14em',
      },
      maxWidth: {
        los: '78rem',
      },
    },
  },
  plugins: [],
}
