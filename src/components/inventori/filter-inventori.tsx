'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { IkonCari } from '@/components/ui/icons';
import { KATEGORI_INVENTORI, STATUS_STOK } from '@/lib/constants';

/**
 * Filter disimpan di URL, bukan di state komponen.
 *
 * Dengan begitu penyaringan terjadi di server (query Supabase, bukan di
 * browser), hasilnya bisa dibagikan lewat tautan, dan tombol kembali browser
 * tetap berfungsi.
 */
export function FilterInventori() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [pending, startTransition] = useTransition();
  const kataKunciUrl = searchParams.get('q') ?? '';
  const [kataKunci, setKataKunci] = useState(kataKunciUrl);
  const [kataKunciUrlTerakhir, setKataKunciUrlTerakhir] = useState(kataKunciUrl);
  const debounce = useRef<number | null>(null);

  // Sinkronkan kolom pencarian bila URL berubah dari luar (tombol kembali,
  // tautan yang dibagikan). Disesuaikan saat render, bukan lewat useEffect.
  if (kataKunciUrl !== kataKunciUrlTerakhir) {
    setKataKunciUrlTerakhir(kataKunciUrl);
    setKataKunci(kataKunciUrl);
  }

  const kategoriTerpilih = searchParams.get('kategori') ?? '';
  const statusTerpilih = searchParams.get('status') ?? '';
  const adaFilter = Boolean(kataKunci || kategoriTerpilih || statusTerpilih);

  function perbaruiParam(perubahan: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [kunci, nilai] of Object.entries(perubahan)) {
      if (nilai) params.set(kunci, nilai);
      else params.delete(kunci);
    }
    params.delete('halaman');

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  useEffect(() => {
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, []);

  function tanganiPencarian(nilai: string) {
    setKataKunci(nilai);
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => perbaruiParam({ q: nilai.trim() }), 350);
  }

  return (
    <div className="flex flex-col gap-3 border-b border-beige-200 px-5 py-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <IkonCari className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-400" />
        <input
          type="search"
          value={kataKunci}
          onChange={(event) => tanganiPencarian(event.target.value)}
          placeholder="Cari nama bahan atau supplier…"
          aria-label="Cari bahan baku"
          maxLength={80}
          className="w-full rounded-xl border border-beige-300 bg-white/80 py-2.5 pl-9 pr-3 text-sm text-tinta-800 placeholder:text-tinta-400 focus:border-matcha-500 focus:outline-none focus:ring-2 focus:ring-matcha-500/25"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={kategoriTerpilih}
          onChange={(event) => perbaruiParam({ kategori: event.target.value })}
          aria-label="Filter kategori"
          className="rounded-xl border border-beige-300 bg-white/80 px-3 py-2.5 text-sm text-tinta-700 focus:border-matcha-500 focus:outline-none focus:ring-2 focus:ring-matcha-500/25"
        >
          <option value="">Semua kategori</option>
          {KATEGORI_INVENTORI.map((kategori) => (
            <option key={kategori.value} value={kategori.value}>
              {kategori.label}
            </option>
          ))}
        </select>

        <select
          value={statusTerpilih}
          onChange={(event) => perbaruiParam({ status: event.target.value })}
          aria-label="Filter status stok"
          className="rounded-xl border border-beige-300 bg-white/80 px-3 py-2.5 text-sm text-tinta-700 focus:border-matcha-500 focus:outline-none focus:ring-2 focus:ring-matcha-500/25"
        >
          <option value="">Semua status</option>
          {STATUS_STOK.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        {adaFilter ? (
          <Button
            type="button"
            varian="hantu"
            ukuran="sm"
            sedangMemuat={pending}
            onClick={() => {
              setKataKunci('');
              perbaruiParam({ q: '', kategori: '', status: '' });
            }}
          >
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}
