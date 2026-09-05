'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoMatcha } from '@/components/brand/logo';
import { LABEL_ROLE } from '@/lib/constants';
import { cn, inisial } from '@/lib/utils';
import type { Profile } from '@/types/database';
import { ITEM_NAVIGASI } from './navigasi';
import { TombolKeluar } from './tombol-keluar';

interface SidebarProps {
  profile: Profile;
  namaOrganisasi: string;
  onNavigasi?: () => void;
}

export function Sidebar({ profile, namaOrganisasi, onNavigasi }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="panel-matcha flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <LogoMatcha className="h-10 w-10 shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-serif text-[0.95rem] leading-tight text-gading-50">
            The Matcha Kyoto
          </p>
          <p className="text-[0.6rem] uppercase tracking-[0.24em] text-matcha-300">Ops Dashboard</p>
        </div>
      </div>

      <div className="mx-5 mb-4 h-px bg-matcha-700/50" />

      <nav aria-label="Navigasi utama" className="scroll-halus flex-1 space-y-1 overflow-y-auto px-3">
        {ITEM_NAVIGASI.map(({ href, label, Ikon }) => {
          const aktif = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigasi}
              aria-current={aktif ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150',
                aktif
                  ? 'bg-matcha-700/70 font-medium text-gading-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'text-matcha-100/75 hover:bg-matcha-800/50 hover:text-gading-50',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-matcha-300 transition-opacity',
                  aktif ? 'opacity-100' : 'opacity-0',
                )}
              />
              <Ikon className="h-[18px] w-[18px] shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 p-4">
        <div className="rounded-xl border border-matcha-700/50 bg-matcha-900/40 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-beige-200 font-serif text-sm text-matcha-800">
              {inisial(profile.nama)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gading-50">{profile.nama}</p>
              <p className="truncate text-xs text-matcha-300">
                {LABEL_ROLE[profile.role]} · {namaOrganisasi}
              </p>
            </div>
          </div>
        </div>
        <TombolKeluar />
      </div>
    </div>
  );
}
