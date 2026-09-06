'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

type Varian = 'utama' | 'sekunder' | 'garis' | 'hantu' | 'bahaya';
type Ukuran = 'sm' | 'md' | 'lg' | 'ikon';

const gayaVarian: Record<Varian, string> = {
  utama: 'bg-tinta-900 text-gading-50 hover:bg-matcha-900 active:bg-matcha-950',
  sekunder: 'bg-matcha-700 text-gading-50 hover:bg-matcha-800 active:bg-matcha-900',
  garis: 'border border-beige-300 bg-transparent text-tinta-700 hover:border-tinta-700 hover:text-tinta-900',
  hantu: 'text-tinta-500 hover:bg-beige-100 hover:text-tinta-900',
  bahaya: 'bg-[var(--color-status-habis)] text-white hover:brightness-95 active:brightness-90',
};

const gayaUkuran: Record<Ukuran, string> = {
  sm: 'h-8 px-3 text-[0.8rem] gap-1.5',
  md: 'h-9.5 px-4 text-[0.85rem] gap-2',
  lg: 'h-11 px-5 text-[0.9rem] gap-2',
  ikon: 'h-8 w-8 justify-center',
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
        'inline-flex items-center rounded-[var(--radius-kartu)] font-medium transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-45',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-matcha-700',
        gayaVarian[varian],
        gayaUkuran[ukuran],
        className,
      )}
      {...props}
    >
      {sedangMemuat ? <Spinner className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
});
