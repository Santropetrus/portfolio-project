import type { ComponentType, SVGProps } from 'react';

import {
  IkonDashboard,
  IkonInventori,
  IkonOpname,
  IkonPengaturan,
  IkonRiwayat,
} from '@/components/ui/icons';

export interface ItemNavigasi {
  href: string;
  label: string;
  deskripsi: string;
  Ikon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const ITEM_NAVIGASI: ReadonlyArray<ItemNavigasi> = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    deskripsi: 'Ringkasan kondisi stok hari ini',
    Ikon: IkonDashboard,
  },
  {
    href: '/inventori',
    label: 'Inventori',
    deskripsi: 'Daftar bahan baku The Matcha Kyoto',
    Ikon: IkonInventori,
  },
  {
    href: '/stok-opname',
    label: 'Stok Opname',
    deskripsi: 'Cocokkan stok fisik dengan stok sistem',
    Ikon: IkonOpname,
  },
  {
    href: '/riwayat-stok',
    label: 'Riwayat Stok',
    deskripsi: 'Jejak seluruh perubahan stok',
    Ikon: IkonRiwayat,
  },
  {
    href: '/pengaturan',
    label: 'Pengaturan',
    deskripsi: 'Profil dan informasi akun',
    Ikon: IkonPengaturan,
  },
] as const;

export function judulHalaman(pathname: string): ItemNavigasi | undefined {
  return ITEM_NAVIGASI.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
