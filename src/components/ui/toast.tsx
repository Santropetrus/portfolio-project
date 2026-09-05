'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';
import { IkonCek, IkonInfo, IkonPeringatan, IkonTutup } from './icons';

type TipeToast = 'sukses' | 'gagal' | 'info';

interface Toast {
  id: string;
  tipe: TipeToast;
  judul: string;
  deskripsi?: string;
}

interface KonteksToast {
  tampilkan: (toast: Omit<Toast, 'id'>) => void;
}

const Konteks = createContext<KonteksToast | null>(null);

const DURASI_MS = 5000;

const gaya: Record<TipeToast, { wadah: string; ikon: ReactNode }> = {
  sukses: {
    wadah: 'border-[var(--color-status-aman)]/30 bg-[var(--color-status-aman-bg)] text-[var(--color-status-aman)]',
    ikon: <IkonCek className="h-5 w-5" />,
  },
  gagal: {
    wadah: 'border-[var(--color-status-habis)]/30 bg-[var(--color-status-habis-bg)] text-[var(--color-status-habis)]',
    ikon: <IkonPeringatan className="h-5 w-5" />,
  },
  info: {
    wadah: 'border-beige-300 bg-beige-100 text-tinta-700',
    ikon: <IkonInfo className="h-5 w-5" />,
  },
};

export function PenyediaToast({ children }: { children: ReactNode }) {
  const [daftar, setDaftar] = useState<Toast[]>([]);
  const timer = useRef<Map<string, number>>(new Map());

  const hapus = useCallback((id: string) => {
    setDaftar((sebelumnya) => sebelumnya.filter((t) => t.id !== id));
    const handle = timer.current.get(id);
    if (handle) {
      window.clearTimeout(handle);
      timer.current.delete(id);
    }
  }, []);

  const tampilkan = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setDaftar((sebelumnya) => [...sebelumnya.slice(-3), { ...toast, id }]);
      const handle = window.setTimeout(() => hapus(id), DURASI_MS);
      timer.current.set(id, handle);
    },
    [hapus],
  );

  const nilai = useMemo(() => ({ tampilkan }), [tampilkan]);

  return (
    <Konteks.Provider value={nilai}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:top-0 sm:items-end"
        role="region"
        aria-label="Notifikasi"
      >
        {daftar.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={cn(
              'animasi-geser pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-[var(--shadow-angkat)]',
              gaya[toast.tipe].wadah,
            )}
          >
            <span className="mt-0.5 shrink-0">{gaya[toast.tipe].ikon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.judul}</p>
              {toast.deskripsi ? (
                <p className="mt-0.5 text-xs opacity-90">{toast.deskripsi}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => hapus(toast.id)}
              className="shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
              aria-label="Tutup notifikasi"
            >
              <IkonTutup className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Konteks.Provider>
  );
}

export function useToast(): KonteksToast {
  const konteks = useContext(Konteks);
  if (!konteks) {
    throw new Error('useToast harus dipakai di dalam <PenyediaToast>.');
  }
  return konteks;
}
