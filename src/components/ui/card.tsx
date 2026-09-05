import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function Kartu({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-[var(--radius-kartu)] border border-beige-200 bg-white/85 shadow-[var(--shadow-lembut)] backdrop-blur-[2px]',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function KepalaKartu({
  judul,
  deskripsi,
  aksi,
  className,
}: {
  judul: ReactNode;
  deskripsi?: ReactNode;
  aksi?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 border-b border-beige-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-tinta-900">{judul}</h2>
        {deskripsi ? <p className="mt-0.5 text-sm text-tinta-500">{deskripsi}</p> : null}
      </div>
      {aksi ? <div className="flex shrink-0 items-center gap-2">{aksi}</div> : null}
    </header>
  );
}

export function IsiKartu({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}
