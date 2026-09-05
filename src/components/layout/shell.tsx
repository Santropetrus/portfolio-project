'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { LogoMatcha } from '@/components/brand/logo';
import { IkonMenu, IkonTutup } from '@/components/ui/icons';
import type { Profile } from '@/types/database';
import { judulHalaman } from './navigasi';
import { Sidebar } from './sidebar';

export function KerangkaAplikasi({
  profile,
  namaOrganisasi,
  children,
}: {
  profile: Profile;
  namaOrganisasi: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [drawerTerbuka, setDrawerTerbuka] = useState(false);
  const halaman = judulHalaman(pathname);

  // Tutup drawer setiap kali pindah halaman (termasuk tombol kembali browser).
  // Menyesuaikan state saat render adalah pola yang dianjurkan React untuk
  // kasus "state turunan dari prop"; memakai useEffect di sini akan memicu
  // render berantai.
  const [pathnameTerakhir, setPathnameTerakhir] = useState(pathname);
  if (pathname !== pathnameTerakhir) {
    setPathnameTerakhir(pathname);
    setDrawerTerbuka(false);
  }

  useEffect(() => {
    if (!drawerTerbuka) return;
    const tanganiEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerTerbuka(false);
    };
    document.addEventListener('keydown', tanganiEscape);
    return () => document.removeEventListener('keydown', tanganiEscape);
  }, [drawerTerbuka]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-dvh lg:block">
        <Sidebar profile={profile} namaOrganisasi={namaOrganisasi} />
      </aside>

      {/* Drawer mobile */}
      {drawerTerbuka ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-tinta-900/45 backdrop-blur-[2px]"
            onClick={() => setDrawerTerbuka(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="animasi-geser absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setDrawerTerbuka(false)}
              aria-label="Tutup menu"
              className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-matcha-100 transition-colors hover:bg-matcha-800/70"
            >
              <IkonTutup className="h-5 w-5" />
            </button>
            <Sidebar
              profile={profile}
              namaOrganisasi={namaOrganisasi}
              onNavigasi={() => setDrawerTerbuka(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-beige-200 bg-gading-50/90 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerTerbuka(true)}
            aria-label="Buka menu navigasi"
            className="rounded-lg border border-beige-300 bg-white/70 p-2 text-tinta-700 transition-colors hover:bg-beige-100"
          >
            <IkonMenu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <LogoMatcha className="h-7 w-7 shrink-0" />
            <span className="truncate font-serif text-sm text-tinta-900">
              {halaman?.label ?? 'The Matcha Kyoto Ops'}
            </span>
          </div>
        </header>

        <main className="scroll-halus min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}

export function JudulHalaman({
  judul,
  deskripsi,
  aksi,
}: {
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        <h1 className="font-serif text-2xl text-tinta-900 sm:text-[1.75rem]">{judul}</h1>
        <div className="garis-kuas h-px w-14 opacity-70" aria-hidden="true" />
        {deskripsi ? <p className="text-sm text-tinta-500">{deskripsi}</p> : null}
      </div>
      {aksi ? <div className="flex shrink-0 items-center gap-2">{aksi}</div> : null}
    </div>
  );
}
