import 'server-only';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';

/**
 * Mengambil IP klien dari header proxy.
 *
 * CATATAN: header ini bisa dipalsukan bila aplikasi tidak berada di belakang
 * reverse proxy yang menormalkannya. Pada Vercel/Netlify/Cloudflare nilainya
 * bisa dipercaya. Bila melakukan self-host, pastikan proxy Anda menimpa
 * X-Forwarded-For, jangan sekadar meneruskannya.
 */
export async function ambilIpKlien(): Promise<string> {
  const daftarHeader = await headers();

  const kandidat =
    daftarHeader.get('x-real-ip') ??
    daftarHeader.get('cf-connecting-ip') ??
    daftarHeader.get('x-forwarded-for')?.split(',')[0];

  const ip = kandidat?.trim();
  return ip && ip.length > 0 && ip.length <= 64 ? ip : 'tidak-diketahui';
}

/**
 * Kunci rate limit. Email di-hash agar alamat email tidak tersimpan mentah
 * di memori proses maupun bocor lewat log.
 */
export function kunciRateLimitLogin(ip: string, email: string): string {
  const hashEmail = createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 32);
  return `login:${ip}:${hashEmail}`;
}
