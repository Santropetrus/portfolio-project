import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { IkonKotak, IkonPeringatan } from './icons';

export function KondisiKosong({
  judul,
  deskripsi,
  aksi,
  ikon,
}: {
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
  ikon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-matcha-50 text-matcha-600 ring-1 ring-matcha-100">
        {ikon ?? <IkonKotak className="h-7 w-7" />}
      </span>
      <div className="max-w-sm space-y-1">
        <p className="font-serif text-lg text-tinta-900">{judul}</p>
        {deskripsi ? <p className="text-sm text-tinta-500">{deskripsi}</p> : null}
      </div>
      {aksi}
    </div>
  );
}

export function KondisiError({
  judul = 'Terjadi kesalahan',
  deskripsi,
  aksi,
}: {
  judul?: string;
  deskripsi?: string;
  aksi?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-status-habis-bg)] text-[var(--color-status-habis)]">
        <IkonPeringatan className="h-7 w-7" />
      </span>
      <div className="max-w-sm space-y-1">
        <p className="font-serif text-lg text-tinta-900">{judul}</p>
        {deskripsi ? <p className="text-sm text-tinta-500">{deskripsi}</p> : null}
      </div>
      {aksi}
    </div>
  );
}

export function Kerangka({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-beige-100', className)}
      aria-hidden="true"
    />
  );
}

export function KerangkaTabel({ baris = 5 }: { baris?: number }) {
  return (
    <div className="space-y-3 p-5" aria-label="Memuat data" role="status">
      {Array.from({ length: baris }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Kerangka className="h-10 w-10 shrink-0 rounded-xl" />
          <Kerangka className="h-4 flex-1" />
          <Kerangka className="hidden h-4 w-24 sm:block" />
          <Kerangka className="hidden h-6 w-20 rounded-full md:block" />
        </div>
      ))}
    </div>
  );
}
