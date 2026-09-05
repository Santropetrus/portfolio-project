'use server';

import { revalidatePath } from 'next/cache';

import { berhasil, gagal, petaErrorZod, type HasilAksi } from '@/lib/auth/hasil-aksi';
import { GagalOtorisasi, wajibManajer } from '@/lib/auth/session';
import { skemaStokOpname } from '@/lib/validation/opname';
import { pesanDariFungsiDatabase, terjemahkanErrorDatabase } from './kesalahan';
import type { StockOpname } from '@/types/database';

/**
 * Mencatat stok opname lewat fungsi database `catat_stok_opname`.
 *
 * Seluruh langkah (kunci baris bahan, simpan hasil opname, perbarui stok,
 * tulis riwayat stok, tulis audit log) berjalan dalam SATU transaksi di
 * database. Bila ada satu langkah gagal, tidak ada perubahan yang tersisa.
 */
export async function aksiCatatOpname(
  input: unknown,
): Promise<HasilAksi<{ selisih: number; stok_fisik: number }>> {
  let sesi;
  try {
    sesi = await wajibManajer();
  } catch (error) {
    if (error instanceof GagalOtorisasi) return gagal(error.message);
    throw error;
  }

  const hasil = skemaStokOpname.safeParse(input);
  if (!hasil.success) {
    return gagal('Periksa kembali isian stok opname.', petaErrorZod(hasil.error.issues));
  }

  const { data, error } = await sesi.supabase
    .rpc('catat_stok_opname', {
      p_inventory_item_id: hasil.data.inventory_item_id,
      p_stok_fisik: hasil.data.stok_fisik,
      p_catatan: hasil.data.catatan,
    })
    .single<StockOpname>();

  if (error) {
    const pesan = pesanDariFungsiDatabase(error);
    if (pesan) {
      console.warn('[opname] ditolak database', { code: error.code, pesan });
      return gagal(pesan);
    }
    return terjemahkanErrorDatabase(error, 'catat_stok_opname');
  }

  revalidatePath('/dashboard');
  revalidatePath('/inventori');
  revalidatePath('/stok-opname');
  revalidatePath('/riwayat-stok');

  const selisih = Number(data.selisih);
  const ringkasan =
    selisih === 0
      ? 'Stok fisik sama dengan stok sistem.'
      : selisih > 0
        ? `Stok fisik lebih banyak ${selisih} dari sistem.`
        : `Stok fisik lebih sedikit ${Math.abs(selisih)} dari sistem.`;

  return berhasil(`Stok opname tersimpan. ${ringkasan}`, {
    selisih,
    stok_fisik: Number(data.stok_fisik),
  });
}
