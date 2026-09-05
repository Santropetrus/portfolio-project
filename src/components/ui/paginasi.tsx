'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from './button';

export function Paginasi({
  halaman,
  totalHalaman,
  total,
}: {
  halaman: number;
  totalHalaman: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function keHalaman(tujuan: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (tujuan <= 1) params.delete('halaman');
    else params.set('halaman', String(tujuan));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-beige-200 px-5 py-3.5"
    >
      <p className="text-xs text-tinta-500">
        Halaman {halaman} dari {totalHalaman} · {total} bahan
      </p>
      <div className="flex gap-2">
        <Button
          varian="garis"
          ukuran="sm"
          disabled={halaman <= 1}
          onClick={() => keHalaman(halaman - 1)}
        >
          Sebelumnya
        </Button>
        <Button
          varian="garis"
          ukuran="sm"
          disabled={halaman >= totalHalaman}
          onClick={() => keHalaman(halaman + 1)}
        >
          Berikutnya
        </Button>
      </div>
    </nav>
  );
}
