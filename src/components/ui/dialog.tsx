'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { IkonTutup } from './icons';

interface DialogProps {
  terbuka: boolean;
  onTutup: () => void;
  judul: string;
  deskripsi?: string;
  children: ReactNode;
  lebar?: 'sm' | 'md' | 'lg';
}

const gayaLebar = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
} as const;

const SELEKTOR_FOKUS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  terbuka,
  onTutup,
  judul,
  deskripsi,
  children,
  lebar = 'md',
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const elemenSebelumnya = useRef<HTMLElement | null>(null);

  const tangkapTab = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !panelRef.current) return;

    const fokusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(SELEKTOR_FOKUS),
    ).filter((el) => el.offsetParent !== null);

    if (fokusable.length === 0) return;

    const pertama = fokusable[0];
    const terakhir = fokusable[fokusable.length - 1];
    if (!pertama || !terakhir) return;

    if (event.shiftKey && document.activeElement === pertama) {
      event.preventDefault();
      terakhir.focus();
    } else if (!event.shiftKey && document.activeElement === terakhir) {
      event.preventDefault();
      pertama.focus();
    }
  }, []);

  useEffect(() => {
    if (!terbuka) return;

    elemenSebelumnya.current = document.activeElement as HTMLElement | null;

    const tanganiTombol = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onTutup();
        return;
      }
      tangkapTab(event);
    };

    document.addEventListener('keydown', tanganiTombol, true);

    const overflowAsli = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Fokuskan elemen pertama di dalam dialog.
    const timer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(SELEKTOR_FOKUS);
      target?.focus();
    }, 30);

    return () => {
      document.removeEventListener('keydown', tanganiTombol, true);
      document.body.style.overflow = overflowAsli;
      window.clearTimeout(timer);
      elemenSebelumnya.current?.focus?.();
    };
  }, [terbuka, onTutup, tangkapTab]);

  if (!terbuka || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-tinta-900/35 backdrop-blur-[3px]"
        onClick={onTutup}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-dialog"
        aria-describedby={deskripsi ? 'deskripsi-dialog' : undefined}
        className={cn(
          'animasi-muncul relative flex max-h-[92vh] w-full flex-col overflow-hidden',
          'border border-beige-300 bg-gading-50 shadow-[var(--shadow-angkat)]',
          gayaLebar[lebar],
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-beige-200 px-5 py-4">
          <div className="min-w-0">
            <h2 id="judul-dialog" className="text-lg font-bold tracking-tight text-tinta-900">
              {judul}
            </h2>
            {deskripsi ? (
              <p id="deskripsi-dialog" className="mt-1 text-sm text-tinta-500">
                {deskripsi}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            varian="hantu"
            ukuran="ikon"
            onClick={onTutup}
            aria-label="Tutup dialog"
          >
            <IkonTutup />
          </Button>
        </header>
        <div className="scroll-halus overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
