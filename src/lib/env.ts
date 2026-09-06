import { z } from 'zod';

/**
 * Konfigurasi environment.
 *
 * ATURAN PENTING: berkas ini TIDAK BOLEH melempar error saat modulnya
 * dievaluasi.
 *
 * `src/proxy.ts` (middleware) mengimpor modul ini secara tidak langsung.
 * Middleware berjalan sebelum route apa pun dirender, jadi satu `throw` di
 * tingkat modul akan mematikan SELURUH aplikasi — termasuk halaman yang sama
 * sekali tidak membutuhkan Supabase, seperti `/studio`. Yang terlihat pengguna
 * bukan pesan "isi .env.local", melainkan HTTP 500 di setiap alamat.
 *
 * Karena itu validasi dibuat malas: ia hanya berjalan ketika `getEnv()`
 * benar-benar dipanggil, yaitu tepat sebelum sebuah nilai dipakai.
 *
 * Variabel NEXT_PUBLIC_* dibaca literal (bukan lewat indexing dinamis) supaya
 * Next.js bisa meng-inline nilainya saat build.
 */

const skemaEnvPublik = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_URL wajib diisi')
    .url('NEXT_PUBLIC_SUPABASE_URL harus berupa URL yang valid'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(20, 'NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diisi'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
});

export type EnvPublik = z.infer<typeof skemaEnvPublik>;

function bacaEnvMentah() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
}

/**
 * Apakah dua variabel Supabase yang wajib sudah ada?
 *
 * Sekadar memeriksa keberadaan — tidak memvalidasi bentuk nilainya dan tidak
 * pernah melempar. Dipakai untuk memutuskan apakah sebuah halaman bisa
 * menyentuh database, atau harus menampilkan panduan setup.
 *
 * Nilainya dihitung sekali saat modul dimuat. Next.js membaca berkas .env
 * hanya pada saat proses dijalankan, jadi setelah membuat atau mengubah
 * `.env.local` dev server WAJIB direstart.
 */
export const isSupabaseConfigured: boolean = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/** Dilempar hanya oleh `getEnv()`, tidak pernah saat modul dimuat. */
export class KonfigurasiBelumLengkap extends Error {
  constructor(rincian: string) {
    super(
      `Konfigurasi environment belum lengkap.\n${rincian}\n\n` +
        'Salin .env.example menjadi .env.local, isi nilainya, lalu RESTART dev server.\n' +
        'Langkah lengkap ada di README bagian 3 dan 4.',
    );
    this.name = 'KonfigurasiBelumLengkap';
  }
}

/**
 * Mengambil environment yang sudah tervalidasi.
 *
 * Panggil ini sedekat mungkin dengan tempat nilainya dipakai. Fungsi ini
 * melempar bila konfigurasinya tidak valid, jadi jangan memanggilnya di
 * tingkat modul — pemanggil sebaiknya memeriksa `isSupabaseConfigured` lebih
 * dulu dan menampilkan panduan yang ramah.
 */
export function getEnv(): EnvPublik {
  const hasil = skemaEnvPublik.safeParse(bacaEnvMentah());

  if (!hasil.success) {
    const rincian = hasil.error.issues
      .map((butir) => `- ${butir.path.join('.')}: ${butir.message}`)
      .join('\n');
    throw new KonfigurasiBelumLengkap(rincian);
  }

  return hasil.data;
}

/**
 * Origin Supabase untuk directive `connect-src` pada Content-Security-Policy.
 *
 * Sengaja berupa fungsi, bukan konstanta: `new URL(undefined)` melempar
 * TypeError, dan bila itu terjadi di tingkat modul, middleware ikut mati.
 * Mengembalikan null bila URL belum diisi atau bentuknya tidak valid —
 * pemanggil cukup melewati directive-nya.
 */
export function supabaseOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;

  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}
