'use server';

import { revalidatePath } from 'next/cache';

import { berhasil, gagal, petaErrorZod, type HasilAksi } from '@/lib/auth/hasil-aksi';
import { GagalOtorisasi, wajibManajer } from '@/lib/auth/session';
import { skemaPergerakanStok } from '@/lib/validation/pergerakan';
import { pesanDariFungsiDatabase, terjemahkanErrorDatabase } from './kesalahan';
import type { StockTransaction } from '@/types/database';

/**
 * Mencatat penerimaan barang atau pemakaian bahan.
 *
 * Sebelum Tahap 2, satu-satunya cara mengubah stok adalah form edit inventori
 * — yang mencampur "memperbaiki data salah ketik" dengan "mencatat kejadian
 * nyata". Aksi ini memisahkannya, dan seluruh perhitungannya dilakukan
 * database di dalam satu transaksi yang mengunci baris bahan.
 */
export async function aksiCatatPergerakan(
  input: unknown,
): Promise<HasilAksi<{ stok_sesudah: number }>> {
  let sesi;
  try {
    sesi = await wajibManajer();
  } catch (error) {
    if (error instanceof GagalOtorisasi) return gagal(error.message);
    throw error;
  }

  const hasil = skemaPergerakanStok.safeParse(input);
  if (!hasil.success) {
    return gagal('Periksa kembali isian pergerakan stok.', petaErrorZod(hasil.error.issues));
  }

  const { data, error } = await sesi.supabase
    .rpc('catat_pergerakan_stok', {
      p_inventory_item_id: hasil.data.inventory_item_id,
      p_tipe: hasil.data.tipe,
      p_jumlah: hasil.data.jumlah,
      p_catatan: hasil.data.catatan,
      // Harga hanya dikirim untuk penerimaan; pemakaian tidak pernah
      // mengubah harga beli.
      p_harga_beli: hasil.data.tipe === 'masuk' ? hasil.data.harga_beli : null,
    })
    .single<StockTransaction>();

  if (error) {
    const pesan = pesanDariFungsiDatabase(error);
    if (pesan) return gagal(pesan);
    return terjemahkanErrorDatabase(error, 'catat_pergerakan_stok');
  }

  for (const rute of ['/dashboard', '/inventori', '/pergerakan', '/riwayat-stok']) {
    revalidatePath(rute);
  }

  const sesudah = Number(data.stok_sesudah);
  return berhasil(
    hasil.data.tipe === 'masuk'
      ? `Penerimaan tercatat. Stok kini ${sesudah}.`
      : `Pemakaian tercatat. Stok kini ${sesudah}.`,
    { stok_sesudah: sesudah },
  );
}
