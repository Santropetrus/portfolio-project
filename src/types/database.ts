/**
 * Tipe database ditulis manual agar Tahap 1 tidak bergantung pada Supabase CLI.
 *
 * Setelah `supabase login` tersedia, file ini bisa diregenerasi dengan:
 *   npx supabase gen types typescript --project-id <ref> --schema public > src/types/database.ts
 *
 * CATATAN PENTING soal kolom `numeric`:
 * PostgREST mengirim `numeric` sebagai STRING JSON agar presisinya tidak
 * hilang, meskipun di sini tipenya ditulis `number`. Karena itu, jangan
 * melakukan aritmetika langsung pada kolom seperti `stok_saat_ini`,
 * `harga_beli`, atau `selisih`. Bungkus dengan `Number(...)` lebih dulu, atau
 * pakai helper `formatAngka` / `formatRupiah` yang sudah menangani keduanya.
 */

export type UserRole = 'owner' | 'admin' | 'staff';

export type InventoryCategory =
  | 'matcha_powder'
  | 'susu'
  | 'gula_sirup'
  | 'topping'
  | 'cup_kemasan'
  | 'sedotan'
  | 'bahan_pendukung';

export type StockTransactionType = 'masuk' | 'keluar' | 'penyesuaian';

export type StockStatus = 'aman' | 'menipis' | 'habis';

export interface Organization {
  id: string;
  nama: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  nama: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  organization_id: string;
  nama: string;
  kategori: InventoryCategory;
  satuan: string;
  stok_saat_ini: number;
  stok_minimum: number;
  harga_beli: number;
  supplier: string | null;
  tanggal_kedaluwarsa: string | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  status_stok: StockStatus;
}

export interface StockTransaction {
  id: string;
  organization_id: string;
  inventory_item_id: string;
  tipe: StockTransactionType;
  jumlah: number;
  stok_sebelum: number;
  stok_sesudah: number;
  catatan: string | null;
  created_by: string | null;
  created_at: string;
}

export interface StockOpname {
  id: string;
  organization_id: string;
  inventory_item_id: string;
  stok_sistem: number;
  stok_fisik: number;
  selisih: number;
  catatan: string | null;
  created_by: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface RingkasanInventori {
  total_bahan: number;
  stok_aman: number;
  stok_menipis: number;
  stok_habis: number;
  nilai_persediaan: number;
}
