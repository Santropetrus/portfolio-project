'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const gayaKontrol =
  'w-full rounded-[var(--radius-kartu)] border border-beige-300 bg-white/70 px-3 py-2.5 ' +
  'text-sm text-tinta-900 placeholder:text-tinta-300 transition-colors ' +
  'hover:border-beige-400 focus:border-tinta-700 focus:bg-white focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-beige-100/60 ' +
  'aria-[invalid=true]:border-[var(--color-status-habis)]';

interface PembungkusProps {
  label: string;
  htmlFor: string;
  error?: string;
  petunjuk?: ReactNode;
  wajib?: boolean;
  children: ReactNode;
  className?: string;
}

export function Bidang({
  label,
  htmlFor,
  error,
  petunjuk,
  wajib,
  children,
  className,
}: PembungkusProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="mono-label block text-tinta-500">
        {label}
        {wajib ? (
          <span className="ml-1 text-[var(--color-status-habis)]" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-[var(--color-status-habis)]">
          {error}
        </p>
      ) : petunjuk ? (
        <p id={`${htmlFor}-petunjuk`} className="text-xs text-tinta-400">
          {petunjuk}
        </p>
      ) : null}
    </div>
  );
}

/**
 * `className` menata PEMBUNGKUS bidang (mis. `sm:col-span-2` di dalam grid),
 * sedangkan `classNameKontrol` menata elemen input itu sendiri. Memisahkan
 * keduanya mencegah kelas layout grid menempel ke input dan tidak berefek.
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  petunjuk?: ReactNode;
  wajib?: boolean;
  awalan?: ReactNode;
  classNameKontrol?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, petunjuk, wajib, className, classNameKontrol, id, awalan, ...props },
  ref,
) {
  const idOtomatis = useId();
  const idFinal = id ?? idOtomatis;

  return (
    <Bidang
      label={label}
      htmlFor={idFinal}
      error={error}
      petunjuk={petunjuk}
      wajib={wajib}
      className={className}
    >
      <div className="relative">
        {awalan ? (
          <span className="mono-label pointer-events-none absolute inset-y-0 left-3 flex items-center text-tinta-400">
            {awalan}
          </span>
        ) : null}
        <input
          ref={ref}
          id={idFinal}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${idFinal}-error` : petunjuk ? `${idFinal}-petunjuk` : undefined}
          className={cn(gayaKontrol, awalan && 'pl-10', classNameKontrol)}
          {...props}
        />
      </div>
    </Bidang>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  petunjuk?: ReactNode;
  wajib?: boolean;
  classNameKontrol?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, petunjuk, wajib, className, classNameKontrol, id, children, ...props },
  ref,
) {
  const idOtomatis = useId();
  const idFinal = id ?? idOtomatis;

  return (
    <Bidang
      label={label}
      htmlFor={idFinal}
      error={error}
      petunjuk={petunjuk}
      wajib={wajib}
      className={className}
    >
      <select
        ref={ref}
        id={idFinal}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${idFinal}-error` : petunjuk ? `${idFinal}-petunjuk` : undefined}
        className={cn(gayaKontrol, 'appearance-none bg-[length:1rem] pr-9', classNameKontrol)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236f6759' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
        }}
        {...props}
      >
        {children}
      </select>
    </Bidang>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  petunjuk?: ReactNode;
  wajib?: boolean;
  classNameKontrol?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, petunjuk, wajib, className, classNameKontrol, id, ...props },
  ref,
) {
  const idOtomatis = useId();
  const idFinal = id ?? idOtomatis;

  return (
    <Bidang
      label={label}
      htmlFor={idFinal}
      error={error}
      petunjuk={petunjuk}
      wajib={wajib}
      className={className}
    >
      <textarea
        ref={ref}
        id={idFinal}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${idFinal}-error` : petunjuk ? `${idFinal}-petunjuk` : undefined}
        className={cn(gayaKontrol, 'resize-y', classNameKontrol)}
        {...props}
      />
    </Bidang>
  );
});
