import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Nada = 'matcha' | 'menipis' | 'habis' | 'kayu';

const gaya: Record<Nada, { ikon: string; nilai: string }> = {
  matcha: { ikon: 'bg-matcha-50 text-matcha-700 ring-matcha-100', nilai: 'text-tinta-900' },
  menipis: {
    ikon: 'bg-[var(--color-status-menipis-bg)] text-[var(--color-status-menipis)] ring-[var(--color-status-menipis)]/15',
    nilai: 'text-[var(--color-status-menipis)]',
  },
  habis: {
    ikon: 'bg-[var(--color-status-habis-bg)] text-[var(--color-status-habis)] ring-[var(--color-status-habis)]/15',
    nilai: 'text-[var(--color-status-habis)]',
  },
  kayu: { ikon: 'bg-kayu-100 text-kayu-700 ring-kayu-200', nilai: 'text-tinta-900' },
};

export function KartuStatistik({
  label,
  nilai,
  keterangan,
  ikon,
  nada = 'matcha',
}: {
  label: string;
  nilai: string;
  keterangan?: string;
  ikon: ReactNode;
  nada?: Nada;
}) {
  return (
    <div className="rounded-[var(--radius-kartu)] border border-beige-200 bg-white/85 p-5 shadow-[var(--shadow-lembut)] transition-shadow hover:shadow-[var(--shadow-angkat)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-tinta-500">{label}</p>
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
            gaya[nada].ikon,
          )}
        >
          {ikon}
        </span>
      </div>
      <p className={cn('mt-3 font-serif text-3xl leading-none', gaya[nada].nilai)}>{nilai}</p>
      {keterangan ? <p className="mt-2 text-xs text-tinta-400">{keterangan}</p> : null}
    </div>
  );
}
