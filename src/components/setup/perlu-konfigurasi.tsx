import Link from 'next/link';

import { LogoMatcha } from '@/components/brand/logo';
import { APP_NAME } from '@/lib/constants';

/**
 * Ditampilkan menggantikan halaman yang membutuhkan database ketika
 * `isSupabaseConfigured` bernilai false.
 *
 * Tujuannya satu: orang yang baru mengunduh proyek ini harus mengerti apa yang
 * kurang dan apa langkah berikutnya, tanpa perlu membaca stack trace. Karena
 * itu halaman ini tidak menyentuh Supabase sama sekali dan tidak bisa gagal.
 */

const LANGKAH = [
  {
    nomor: '01',
    judul: 'Buat proyek Supabase',
    isi: 'Daftar gratis di supabase.com, buat proyek baru, lalu buka Project Settings → API. Anda memerlukan Project URL dan kunci anon.',
  },
  {
    nomor: '02',
    judul: 'Buat berkas .env.local',
    isi: 'Salin .env.example menjadi .env.local di folder yang sama, lalu isi kedua nilai tadi. Perintah untuk Windows, PowerShell, dan macOS/Linux ada di README bagian 4.',
  },
  {
    nomor: '03',
    judul: 'Jalankan migration',
    isi: 'Tempel ketiga berkas di supabase/migrations/ ke SQL Editor Supabase secara berurutan. Rinciannya di README bagian 5.',
  },
  {
    nomor: '04',
    judul: 'Restart dev server',
    isi: 'Hentikan npm run dev dengan Ctrl+C lalu jalankan lagi. Next.js hanya membaca berkas .env saat proses dijalankan, jadi server yang sudah berjalan tidak akan melihat .env.local yang baru dibuat.',
  },
] as const;

export function PerluKonfigurasi() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gading-50 px-5 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-7 flex items-center gap-3">
          <LogoMatcha className="h-11 w-11" />
          <div>
            <p className="font-serif text-lg leading-tight text-tinta-900">{APP_NAME}</p>
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-matcha-700">
              Perlu konfigurasi
            </p>
          </div>
        </div>

        <div className="rounded-[var(--radius-kartu)] border border-beige-200 bg-white/85 shadow-[var(--shadow-lembut)]">
          <div className="border-b border-beige-200 px-6 py-5">
            <h1 className="font-serif text-2xl text-tinta-900">Supabase belum dikonfigurasi</h1>
            <p className="mt-2 text-sm leading-relaxed text-tinta-600">
              Halaman ini membutuhkan database, tetapi{' '}
              <code className="rounded bg-beige-100 px-1.5 py-0.5 text-[0.8rem] text-tinta-800">
                .env.local
              </code>{' '}
              belum ada atau belum berisi kredensial Supabase. Aplikasinya tidak rusak — hanya belum
              tahu harus menyambung ke mana.
            </p>
          </div>

          <ol className="divide-y divide-beige-200">
            {LANGKAH.map((langkah) => (
              <li key={langkah.nomor} className="flex gap-4 px-6 py-4">
                <span className="mt-0.5 shrink-0 font-mono text-xs text-matcha-700">
                  {langkah.nomor}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-tinta-800">{langkah.judul}</p>
                  <p className="mt-1 text-sm leading-relaxed text-tinta-500">{langkah.isi}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="border-t border-beige-200 bg-beige-100/50 px-6 py-4">
            <p className="text-sm text-tinta-600">
              Panduan lengkapnya ada di <strong className="font-semibold">README bagian 3 dan 4</strong>.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[var(--radius-kartu)] border border-beige-200 bg-white/60 px-6 py-5">
          <p className="text-sm font-medium text-tinta-800">
            Ingin melihat sesuatu tanpa setup apa pun?
          </p>
          <p className="mt-1 text-sm leading-relaxed text-tinta-500">
            Halaman Fluid Studio berjalan sepenuhnya tanpa database dan bisa dibuka sekarang juga.
          </p>
          <Link
            href="/studio"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-matcha-700 px-4 py-2.5 text-sm font-medium text-gading-50 transition-colors hover:bg-matcha-800"
          >
            Buka /studio
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
