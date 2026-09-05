'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Kartu } from '@/components/ui/card';
import { KondisiError } from '@/components/ui/states';

export default function KesalahanDashboard({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[dashboard] kesalahan halaman', error.digest ?? error.message);
  }, [error]);

  return (
    <Kartu>
      <KondisiError
        deskripsi="Data pada halaman ini gagal dimuat. Periksa koneksi Anda lalu coba lagi."
        aksi={<Button onClick={reset}>Muat ulang</Button>}
      />
    </Kartu>
  );
}
