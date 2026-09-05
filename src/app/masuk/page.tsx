import type { Metadata } from 'next';

import { LogoMatcha } from '@/components/brand/logo';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { FormMasuk } from './form-masuk';

export const metadata: Metadata = {
  title: 'Masuk',
};

export default async function HalamanMasuk({
  searchParams,
}: {
  searchParams: Promise<{ lanjut?: string }>;
}) {
  const { lanjut } = await searchParams;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Panel merek */}
      <section className="panel-matcha relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-matcha-700/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-matcha-600/25 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <LogoMatcha className="h-11 w-11" />
          <div>
            <p className="font-serif text-lg leading-tight text-gading-50">The Matcha Kyoto</p>
            <p className="text-xs uppercase tracking-[0.22em] text-matcha-200">Ops Dashboard</p>
          </div>
        </div>

        <div className="relative max-w-md space-y-6">
          <div className="garis-kuas h-px w-24 opacity-70" />
          <h1 className="font-serif text-4xl leading-[1.2] text-gading-50">
            Ketelitian ala kedai teh, dalam satu dashboard.
          </h1>
          <p className="text-[0.95rem] leading-relaxed text-matcha-100/85">{APP_TAGLINE}</p>
        </div>

        <dl className="relative grid grid-cols-3 gap-4 border-t border-matcha-700/50 pt-6">
          {[
            ['Inventori', 'Stok bahan baku terpantau'],
            ['Stok Opname', 'Selisih tercatat rapi'],
            ['Riwayat', 'Jejak perubahan lengkap'],
          ].map(([judul, deskripsi]) => (
            <div key={judul}>
              <dt className="text-sm font-medium text-gading-50">{judul}</dt>
              <dd className="mt-1 text-xs leading-relaxed text-matcha-200/80">{deskripsi}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Panel formulir */}
      <section className="flex items-center justify-center bg-gading-50 px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoMatcha className="h-10 w-10" />
            <div>
              <p className="font-serif text-base leading-tight text-tinta-900">The Matcha Kyoto</p>
              <p className="text-[0.65rem] uppercase tracking-[0.22em] text-matcha-700">
                Ops Dashboard
              </p>
            </div>
          </div>

          <header className="mb-7 space-y-1.5">
            <h2 className="font-serif text-2xl text-tinta-900">Masuk ke {APP_NAME}</h2>
            <p className="text-sm text-tinta-500">
              Gunakan akun yang telah didaftarkan oleh owner.
            </p>
          </header>

          <FormMasuk lanjut={lanjut ?? null} />

          <p className="mt-8 text-center text-xs leading-relaxed text-tinta-400">
            Halaman ini hanya untuk tim internal The Matcha Kyoto.
            <br />
            Lupa kata sandi? Hubungi owner untuk pengaturan ulang.
          </p>
        </div>
      </section>
    </main>
  );
}
