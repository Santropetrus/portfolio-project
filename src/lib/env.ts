import { z } from 'zod';

/**
 * Validasi environment variable sekali di titik masuk.
 *
 * Variabel NEXT_PUBLIC_* sengaja dibaca secara literal (bukan lewat indexing
 * dinamis) supaya Next.js bisa meng-inline nilainya saat build.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_URL wajib diisi')
    .url('NEXT_PUBLIC_SUPABASE_URL harus berupa URL yang valid'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(20, 'NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diisi'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsed.success) {
  const pesan = parsed.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(
    `Konfigurasi environment belum lengkap.\n${pesan}\n\n` +
      'Salin .env.example menjadi .env.local lalu isi nilainya.',
  );
}

export const env = parsed.data;

/** Origin Supabase, dipakai untuk menyusun directive connect-src pada CSP. */
export const supabaseOrigin = new URL(env.NEXT_PUBLIC_SUPABASE_URL).origin;
