import type { NextConfig } from 'next';

/**
 * Header keamanan statis untuk seluruh route.
 *
 * Content-Security-Policy untuk route aplikasi TIDAK diletakkan di sini,
 * karena memakai nonce per-request yang dibangkitkan di `src/proxy.ts`.
 * Pengecualiannya `/studio` — lihat `cspStudio` di bawah.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  {
    key: 'Permissions-Policy',
    value: [
      'accelerometer=()',
      'autoplay=()',
      'camera=()',
      'display-capture=()',
      'encrypted-media=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'payment=()',
      'usb=()',
      'interest-cohort=()',
    ].join(', '),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/**
 * CSP khusus `/studio`.
 *
 * `/studio` sengaja dikeluarkan dari middleware (lihat `config.matcher` di
 * src/proxy.ts) supaya halaman itu tetap terbuka walau proyek belum
 * dikonfigurasi. Konsekuensinya ia tidak lagi menerima nonce per-request,
 * sehingga CSP-nya harus statis.
 *
 * CSP statis pada halaman Next tidak bisa menghindari `'unsafe-inline'` untuk
 * skrip: Next menyisipkan payload streaming lewat <script> inline, dan tanpa
 * nonce satu-satunya cara mengizinkannya adalah unsafe-inline atau daftar hash
 * yang berubah setiap build. Directive lain tetap ketat, jadi frame-ancestors,
 * object-src, base-uri, form-action, serta batasan img/font/connect semuanya
 * masih berlaku.
 *
 * Ini pelemahan yang disengaja dan terbatas: `/studio` adalah halaman statis
 * tanpa autentikasi, tanpa input pengguna, dan tanpa akses database.
 *
 * `'unsafe-eval'` HANYA ditambahkan saat development: React memakai eval()
 * untuk fitur debugging seperti menyusun ulang callstack. Tanpa itu, halaman
 * tetap jalan tetapi console langsung menampilkan error pada run pertama —
 * pengalaman yang buruk untuk orang yang baru membuka proyek ini. Build
 * produksi tidak pernah memuatnya.
 */
const modeDev = process.env.NODE_ENV !== 'production';

const cspStudio = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${modeDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  `connect-src 'self'${modeDev ? ' ws: http://localhost:*' : ''}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // typedRoutes dimatikan: beberapa navigasi dibangun dinamis dari query
  // string (filter dan paginasi), sehingga tipe rute literal tidak cocok.
  typedRoutes: false,
  typescript: {
    // Build harus gagal bila ada error tipe — jangan longgarkan di produksi.
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/studio',
        headers: [{ key: 'Content-Security-Policy', value: cspStudio }],
      },
      {
        source: '/studio/:path*',
        headers: [{ key: 'Content-Security-Policy', value: cspStudio }],
      },
    ];
  },
};

export default nextConfig;
