'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoMatcha } from '@/components/brand/logo';
import { LABEL_ROLE } from '@/lib/constants';
import { cn, inisial } from '@/lib/utils';
import type { Profile } from '@/types/database';
import { navigasiUntuk } from './navigasi';
import { TombolKeluar } from './tombol-keluar';

interface SidebarProps {
  profile: Profile;
  namaOrganisasi: string;
  jumlahOpnameMenunggu?: number;
  onNavigasi?: () => void;
}

export function Sidebar({
  profile,
  namaOrganisasi,
  jumlahOpnameMenunggu = 0,
  onNavigasi,
}: SidebarProps) {
  const pathname = usePathname();
  const item = navigasiUntuk(profile.role);

  return (
    <div className="panel-matcha flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <LogoMatcha className="h-9 w-9 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-[0.9rem] font-bold leading-tight tracking-tight text-gading-50">
            {namaOrganisasi}
          </p>
          <p className="mono-label mt-0.5 text-matcha-300">Ops</p>
        </div>
      </div>

      <div className="mx-5 h-px bg-matcha-700/50" />

      <nav
        aria-label="Navigasi utama"
        className="scroll-halus flex-1 overflow-y-auto px-2.5 py-4"
      >
        <ul className="space-y-0.5">
          {item.map((butir, indeks) => {
            const aktif = pathname === butir.href || pathname.startsWith(`${butir.href}/`);
            const tunggu = butir.href === '/stok-opname' && jumlahOpnameMenunggu > 0;

            return (
              <li key={butir.href}>
                <Link
                  href={butir.href}
                  onClick={onNavigasi}
                  aria-current={aktif ? 'page' : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 px-2.5 py-2.5 text-[0.85rem] transition-colors duration-150',
                    aktif
                      ? 'bg-matcha-700/60 font-medium text-gading-50'
                      : 'text-matcha-100/70 hover:bg-matcha-800/50 hover:text-gading-50',
                  )}
                >
                  {/* Indeks bernomor: memberi kesan daftar terurut, bukan tumpukan tombol. */}
                  <span
                    className={cn(
                      'mono-label w-4 shrink-0 text-[0.55rem]',
                      aktif ? 'text-matcha-200' : 'text-matcha-300/60',
                    )}
                  >
                    {String(indeks + 1).padStart(2, '0')}
                  </span>
                  <butir.Ikon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{butir.label}</span>

                  {tunggu ? (
                    <span
                      className="mono-label flex h-4 min-w-4 items-center justify-center bg-gading-50 px-1 text-[0.55rem] leading-none text-matcha-900"
                      aria-label={`${jumlahOpnameMenunggu} menunggu tinjauan`}
                    >
                      {jumlahOpnameMenunggu}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-3 border-t border-matcha-700/50 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-beige-200 text-[0.7rem] font-bold text-matcha-900">
            {inisial(profile.nama)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.8rem] font-medium text-gading-50">{profile.nama}</p>
            {/* Nama organisasi sengaja tidak diulang di sini: ia sudah ada di
                kepala sidebar, dan menggabungkannya membuat barisnya terpotong
                di tengah kata pada lebar sidebar yang tetap. */}
            <p className="mono-label mt-0.5 truncate text-matcha-300">
              {LABEL_ROLE[profile.role]}
            </p>
          </div>
        </div>
        <TombolKeluar />
      </div>
    </div>
  );
}
