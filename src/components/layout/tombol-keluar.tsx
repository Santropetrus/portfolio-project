'use client';

import { useTransition } from 'react';

import { IkonKeluar } from '@/components/ui/icons';
import { Spinner } from '@/components/ui/spinner';
import { aksiKeluar } from '@/server/actions/auth';

export function TombolKeluar() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => void aksiKeluar())}
      className="flex w-full items-center gap-2.5 rounded-xl border border-matcha-700/60 px-3 py-2.5 text-sm font-medium text-matcha-100 transition-colors hover:bg-matcha-800/70 hover:text-gading-50 disabled:opacity-60"
    >
      {pending ? <Spinner className="h-4 w-4" /> : <IkonKeluar className="h-4 w-4" />}
      {pending ? 'Keluar…' : 'Keluar'}
    </button>
  );
}
