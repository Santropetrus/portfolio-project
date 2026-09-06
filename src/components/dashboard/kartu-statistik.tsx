import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Nada = 'netral' | 'menipis' | 'habis' | 'kayu' | 'tunggu';

const warnaNilai: Record<Nada, string> = {
  netral: 'text-tinta-900',
  menipis: 'text-[var(--color-status-menipis)]',
  habis: 'text-[var(--color-status-habis)]',
  kayu: 'text-kayu-700',
  tunggu: 'text-[var(--color-status-tunggu)]',
};

export interface ButirStatistik {
  label: string;
  nilai: string;
  keterangan?: string;
  nada?: Nada;
  ikon?: ReactNode;
}

/**
 * Deret angka utama, dirender sebagai satu panel yang dibagi garis rambut
 * alih-alih beberapa kartu terpisah.
 *
 * Kartu terpisah membuat setiap angka tampak berdiri sendiri; satu panel
 * membuatnya terbaca sebagai satu bacaan instrumen — mana yang aman, mana
 * yang perlu tindakan.
 */
export function PanelStatistik({ butir }: { butir: ReadonlyArray<ButirStatistik> }) {
  return (
    <section
      aria-label="Ringkasan stok"
      className="grid grid-cols-1 border border-beige-300 bg-white/60 sm:grid-cols-2 xl:grid-cols-4"
    >
      {butir.map((b, indeks) => (
        <div
          key={b.label}
          className={cn(
            'flex flex-col justify-between gap-6 p-5',
            // Garis pemisah hanya di antara sel, tidak di tepi luar.
            'border-beige-200',
            indeks > 0 && 'border-t sm:border-t-0',
            indeks % 2 === 1 && 'sm:border-l',
            'xl:border-l xl:first:border-l-0',
            indeks >= 2 && 'sm:border-t xl:border-t-0',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="mono-label text-tinta-400">{b.label}</p>
            {b.ikon ? <span className="shrink-0 text-tinta-300">{b.ikon}</span> : null}
          </div>

          <div className="space-y-1.5">
            <p className={cn('angka-besar text-[2.4rem]', warnaNilai[b.nada ?? 'netral'])}>
              {b.nilai}
            </p>
            {b.keterangan ? (
              <p className="text-[0.8rem] leading-snug text-tinta-400">{b.keterangan}</p>
            ) : null}
          </div>
        </div>
      ))}
    </section>
  );
}
