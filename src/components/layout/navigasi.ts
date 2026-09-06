import type { ComponentType, SVGProps } from 'react';

import {
  IkonDashboard,
  IkonInventori,
  IkonNaik,
  IkonOpname,
  IkonPengaturan,
  IkonPengguna,
  IkonRiwayat,
} from '@/components/ui/icons';
import type { UserRole } from '@/types/database';

export interface ItemNavigasi {
  href: string;
  label: string;
  deskripsi: string;
  Ikon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Bila diisi, item hanya tampil untuk role dalam daftar ini. */
  hanyaRole?: ReadonlyArray<UserRole>;
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
    href: '/pergerakan',
    label: 'Stok Masuk & Keluar',
    deskripsi: 'Catat penerimaan barang dan pemakaian bahan',
    Ikon: IkonNaik,
    hanyaRole: ['owner', 'admin'],
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
    href: '/pengguna',
    label: 'Anggota Tim',
    deskripsi: 'Atur role dan status akun anggota',
    Ikon: IkonPengguna,
    hanyaRole: ['owner'],
  },
  {
    href: '/pengaturan',
    label: 'Pengaturan',
    deskripsi: 'Profil dan informasi akun',
    Ikon: IkonPengaturan,
  },
] as const;

export function navigasiUntuk(role: UserRole): ItemNavigasi[] {
  return ITEM_NAVIGASI.filter((item) => !item.hanyaRole || item.hanyaRole.includes(role));
}

export function judulHalaman(pathname: string): ItemNavigasi | undefined {
  return ITEM_NAVIGASI.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
