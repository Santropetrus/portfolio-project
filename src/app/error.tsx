'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { LogoMatcha } from '@/components/brand/logo';

export default function KesalahanGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Detail error tetap di log server; pengguna hanya melihat pesan umum.
    console.error('[app] kesalahan tidak tertangani', error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <LogoMatcha className="h-12 w-12" />
      <div className="space-y-2">
        <h1 className="font-serif text-3xl text-tinta-900">Terjadi kesalahan</h1>
        <p className="max-w-md text-sm text-tinta-500">
          Sistem tidak dapat menampilkan halaman ini. Silakan coba lagi. Jika masalah berlanjut,
          hubungi pengelola aplikasi.
        </p>
        {error.digest ? (
          <p className="text-xs text-tinta-400">Kode kesalahan: {error.digest}</p>
        ) : null}
      </div>
      <Button onClick={reset}>Coba lagi</Button>
    </main>
  );
}
