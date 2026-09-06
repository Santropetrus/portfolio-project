import { NextResponse, type NextRequest } from 'next/server';

import { isSupabaseConfigured, supabaseOrigin } from '@/lib/env';
import { createSupabaseProxyClient } from '@/lib/supabase/proxy';

/**
 * Proxy (dulu bernama middleware) menangani tiga hal:
 *
 * 1. Content-Security-Policy berbasis nonce per request.
 * 2. Perpanjangan sesi Supabase (refresh token ditulis ulang ke cookie).
 * 3. Pengalihan rute berdasarkan status login.
 *
 * PENTING: pengalihan di sini adalah kenyamanan, BUKAN batas keamanan.
 * Otorisasi sesungguhnya tetap dilakukan di Server Component / Server Action
 * (lihat src/lib/auth/session.ts) dan di database lewat Row Level Security.
 *
 * Berkas ini berjalan sebelum route mana pun dirender, jadi ia harus tetap
 * hidup walau konfigurasi belum lengkap. Tidak ada satu pun impor di sini yang
 * boleh melempar saat modulnya dievaluasi.
 */

const RUTE_PUBLIK = ['/masuk'];
const RUTE_MASUK = '/masuk';
const RUTE_BERANDA = '/dashboard';

function buatNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function bangunCsp(nonce: string): string {
  const dev = process.env.NODE_ENV !== 'production';

  // Bila Supabase belum dikonfigurasi, directive-nya cukup dilewati. Menyusun
  // string dari nilai null hanya akan menghasilkan "connect-src 'self' null".
  const asalSupabase = supabaseOrigin();
  const sumberKoneksi = ["'self'", asalSupabase, dev ? 'ws: http://localhost:*' : null]
    .filter(Boolean)
    .join(' ');

  const direktif = [
    `default-src 'self'`,
    // 'strict-dynamic' membuat skrip yang di-load oleh skrip ber-nonce ikut
    // dipercaya, sehingga chunk Next.js tetap jalan tanpa 'unsafe-inline'.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${dev ? "'unsafe-eval'" : ''}`.trim(),
    // Next.js dan Tailwind menyisipkan <style> inline saat hidrasi.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self' data:`,
    `connect-src ${sumberKoneksi}`,
    `frame-src 'none'`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `manifest-src 'self'`,
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ];

  return direktif.join('; ').replace(/\s{2,}/g, ' ');
}

function salinCookie(dari: NextResponse, ke: NextResponse): NextResponse {
  for (const cookie of dari.cookies.getAll()) {
    ke.cookies.set(cookie);
  }
  return ke;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const nonce = buatNonce();
  const csp = bangunCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  // Next.js membaca header ini untuk menempelkan nonce ke skrip bawaannya.
  requestHeaders.set('content-security-policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('content-security-policy', csp);

  // Tanpa konfigurasi Supabase tidak ada sesi yang bisa diperiksa, dan
  // membuat client-nya hanya akan melempar. Header keamanan tetap terpasang;
  // halaman yang membutuhkan database menampilkan panduan setup sendiri
  // (lihat src/components/setup/perlu-konfigurasi.tsx).
  if (!isSupabaseConfigured) {
    return response;
  }

  const supabase = createSupabaseProxyClient(request, response);

  // getUser() memverifikasi token ke Supabase, tidak sekadar percaya cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const publik = RUTE_PUBLIK.some((rute) => pathname === rute || pathname.startsWith(`${rute}/`));

  if (!user && !publik) {
    const url = request.nextUrl.clone();
    url.pathname = RUTE_MASUK;
    url.search = '';
    // Simpan tujuan awal agar bisa dikembalikan setelah login berhasil.
    if (pathname !== '/' && pathname.length <= 200) {
      url.searchParams.set('lanjut', pathname);
    }
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set('content-security-policy', csp);
    return salinCookie(response, redirectResponse);
  }

  if (user && publik) {
    const url = request.nextUrl.clone();
    url.pathname = RUTE_BERANDA;
    url.search = '';
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set('content-security-policy', csp);
    return salinCookie(response, redirectResponse);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Yang TIDAK dilewatkan ke proxy:
     *
     * - `/studio` — halaman publik yang tidak menyentuh Supabase sama sekali.
     *   Ia harus tetap terbuka walau proyek belum dikonfigurasi, jadi ia tidak
     *   boleh bergantung pada middleware.
     * - `/_next/...` — aset build, gambar hasil optimasi, dan data RSC.
     * - Berkas statis di /public beserta ekstensi aset yang umum.
     *
     * CSP tetap terpasang untuk seluruh route lain. `/studio` mendapat header
     * keamanan statisnya dari next.config.ts; ia tidak memakai skrip inline
     * sehingga tidak membutuhkan nonce.
     */
    '/((?!studio(?:$|/)|_next/|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$|tekstur/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|txt|xml|json)$).*)',
  ],
};
