import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { labelStatusStok } from '@/lib/constants';
import type { StockStatus } from '@/types/database';

const gayaStatus: Record<StockStatus, string> = {
  aman: 'bg-[var(--color-status-aman-bg)] text-[var(--color-status-aman)] ring-[var(--color-status-aman)]/20',
  menipis:
    'bg-[var(--color-status-menipis-bg)] text-[var(--color-status-menipis)] ring-[var(--color-status-menipis)]/20',
  habis:
    'bg-[var(--color-status-habis-bg)] text-[var(--color-status-habis)] ring-[var(--color-status-habis)]/20',
};

export function BadgeStatusStok({ status }: { status: StockStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        gayaStatus[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
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
        'inline-flex items-center rounded-full bg-beige-100 px-2.5 py-1 text-xs font-medium text-tinta-600 ring-1 ring-inset ring-beige-300/70',
        className,
      )}
    >
      {children}
    </span>
  );
}
