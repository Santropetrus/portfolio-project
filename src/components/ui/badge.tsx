import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { labelStatusStok } from '@/lib/constants';
import type { StockStatus } from '@/types/database';

const gayaStatus: Record<StockStatus, string> = {
  aman: 'text-[var(--color-status-aman)] bg-[var(--color-status-aman-bg)]',
  menipis: 'text-[var(--color-status-menipis)] bg-[var(--color-status-menipis-bg)]',
  habis: 'text-[var(--color-status-habis)] bg-[var(--color-status-habis-bg)]',
};

export function BadgeStatusStok({ status }: { status: StockStatus }) {
  return (
    <span
      className={cn(
        'mono-label inline-flex items-center gap-1.5 px-2 py-1 leading-none',
        gayaStatus[status],
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
      {labelStatusStok(status)}
    </span>
  );
}

export function BadgeNetral({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'mono-label inline-flex items-center bg-beige-100 px-2 py-1 leading-none text-tinta-500',
        className,
      )}
    >
      {children}
    </span>
  );
}

type NadaBadge = 'tunggu' | 'aman' | 'habis' | 'kayu';

const gayaNada: Record<NadaBadge, string> = {
  tunggu: 'text-[var(--color-status-tunggu)] bg-[var(--color-status-tunggu-bg)]',
  aman: 'text-[var(--color-status-aman)] bg-[var(--color-status-aman-bg)]',
  habis: 'text-[var(--color-status-habis)] bg-[var(--color-status-habis-bg)]',
  kayu: 'text-kayu-700 bg-kayu-100',
};

export function BadgeNada({
  nada,
  children,
  className,
}: {
  nada: NadaBadge;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'mono-label inline-flex items-center px-2 py-1 leading-none',
        gayaNada[nada],
        className,
      )}
    >
      {children}
    </span>
  );
}
