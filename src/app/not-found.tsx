import Link from 'next/link';

import { LogoMatcha } from '@/components/brand/logo';

export default function TidakDitemukan() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <LogoMatcha className="h-12 w-12" />
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-tinta-900">Halaman tidak ditemukan</h1>
        <p className="max-w-sm text-sm text-tinta-500">
          Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="rounded-xl bg-matcha-700 px-5 py-2.5 text-sm font-medium text-gading-50 transition-colors hover:bg-matcha-800"
      >
        Kembali ke dashboard
      </Link>
    </main>
  );
}
