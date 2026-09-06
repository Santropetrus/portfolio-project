import type {
  InventoryCategory,
  OpnameStatus,
  StockStatus,
  StockTransactionType,
  UserRole,
} from '@/types/database';

export const APP_NAME = 'The Matcha Kyoto Ops';
export const APP_TAGLINE = 'Kelola stok, strategi, dan pertumbuhan bisnis dalam satu tempat.';

export const KATEGORI_INVENTORI: ReadonlyArray<{ value: InventoryCategory; label: string }> = [
  { value: 'matcha_powder', label: 'Matcha Powder' },
  { value: 'susu', label: 'Susu' },
  { value: 'gula_sirup', label: 'Gula & Sirup' },
  { value: 'topping', label: 'Topping' },
  { value: 'cup_kemasan', label: 'Cup & Kemasan' },
  { value: 'sedotan', label: 'Sedotan' },
  { value: 'bahan_pendukung', label: 'Bahan Pendukung' },
] as const;

export const KATEGORI_VALUES = KATEGORI_INVENTORI.map((k) => k.value) as [
  InventoryCategory,
  ...InventoryCategory[],
];

const KATEGORI_LABEL_MAP: Record<InventoryCategory, string> = KATEGORI_INVENTORI.reduce(
  (acc, item) => ({ ...acc, [item.value]: item.label }),
  {} as Record<InventoryCategory, string>,
);

export function labelKategori(kategori: InventoryCategory): string {
  return KATEGORI_LABEL_MAP[kategori] ?? kategori;
}

export const STATUS_STOK: ReadonlyArray<{ value: StockStatus; label: string }> = [
  { value: 'aman', label: 'Aman' },
  { value: 'menipis', label: 'Menipis' },
  { value: 'habis', label: 'Habis' },
] as const;

export function labelStatusStok(status: StockStatus): string {
  return STATUS_STOK.find((s) => s.value === status)?.label ?? status;
}

export const TIPE_TRANSAKSI: Record<StockTransactionType, string> = {
  masuk: 'Stok Masuk',
  keluar: 'Stok Keluar',
  penyesuaian: 'Penyesuaian',
};

export const LABEL_ROLE: Record<UserRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  staff: 'Staff',
};

export const DESKRIPSI_ROLE: Record<UserRole, string> = {
  owner: 'Akses penuh, termasuk mengatur role pengguna lain.',
  admin: 'Dapat mengelola inventori dan mencatat stok opname.',
  staff: 'Hanya dapat melihat data stok, tanpa mengubah atau menghapus.',
};

/** Satuan yang umum dipakai. Tetap boleh diisi bebas oleh pengguna. */
export const SARAN_SATUAN = [
  'gram',
  'kg',
  'ml',
  'liter',
  'pcs',
  'pack',
  'botol',
  'kaleng',
  'galon',
  'renceng',
  'box',
] as const;

export const UKURAN_HALAMAN = 20;

export const LABEL_STATUS_OPNAME: Record<OpnameStatus, string> = {
  draft: 'Menunggu tinjauan',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
};

export const TIPE_PERGERAKAN = [
  {
    value: 'masuk' as const,
    label: 'Stok masuk',
    deskripsi: 'Penerimaan barang dari supplier atau hasil produksi internal.',
  },
  {
    value: 'keluar' as const,
    label: 'Stok keluar',
    deskripsi: 'Pemakaian harian, bahan rusak, atau kehilangan.',
  },
] as const;
