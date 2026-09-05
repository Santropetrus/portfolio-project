'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

type Varian = 'utama' | 'sekunder' | 'garis' | 'hantu' | 'bahaya';
type Ukuran = 'sm' | 'md' | 'lg' | 'ikon';

const gayaVarian: Record<Varian, string> = {
  utama:
    'bg-matcha-700 text-gading-50 hover:bg-matcha-800 active:bg-matcha-900 shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_8px_20px_-12px_rgba(34,51,24,0.9)]',
  sekunder: 'bg-kayu-600 text-gading-50 hover:bg-kayu-700 active:bg-kayu-700',
  garis: 'border border-beige-300 bg-white/70 text-tinta-700 hover:bg-beige-100 hover:text-tinta-900',
  hantu: 'text-tinta-600 hover:bg-beige-100 hover:text-tinta-900',
  bahaya: 'bg-[var(--color-status-habis)] text-white hover:brightness-95 active:brightness-90',
};

const gayaUkuran: Record<Ukuran, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-[0.95rem] gap-2',
  ikon: 'h-9 w-9 justify-center',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  varian?: Varian;
  ukuran?: Ukuran;
  sedangMemuat?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, varian = 'utama', ukuran = 'md', sedangMemuat = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || sedangMemuat}
      aria-busy={sedangMemuat || undefined}
      className={cn(
        'inline-flex items-center rounded-xl font-medium transition-all duration-150',
        'disabled:cursor-not-allowed disabled:opacity-55',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-matcha-600',
        gayaVarian[varian],
        gayaUkuran[ukuran],
        className,
      )}
      {...props}
    >
      {sedangMemuat ? <Spinner className="h-4 w-4" /> : null}
      {children}
    </button>
  );
});
