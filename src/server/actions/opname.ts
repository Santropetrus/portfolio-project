'use server';

import { revalidatePath } from 'next/cache';

import { berhasil, gagal, petaErrorZod, type HasilAksi } from '@/lib/auth/hasil-aksi';
import { GagalOtorisasi, wajibManajer, wajibSesi } from '@/lib/auth/session';
import { skemaStokOpname, skemaTinjauOpname } from '@/lib/validation/opname';
import { pesanDariFungsiDatabase, terjemahkanErrorDatabase } from './kesalahan';
import type { StockOpname } from '@/types/database';

const RUTE = ['/dashboard', '/inventori', '/stok-opname', '/riwayat-stok'];

function segarkan(): void {
  for (const rute of RUTE) revalidatePath(rute);
}

/**
 * Mengajukan hasil hitungan stok fisik.
 *
 * Staff menghasilkan draft yang tidak mengubah stok apa pun; owner/admin
 * menghasilkan catatan yang langsung disetujui dan menyesuaikan stok. Kedua
 * jalur itu diputuskan di database (`ajukan_stok_opname`), bukan di sini,
 * supaya tidak ada cara memintasnya lewat payload.
 */
export async function aksiAjukanOpname(
  input: unknown,
): Promise<HasilAksi<{ status: string; selisih: number }>> {
  // Sengaja hanya wajibSesi(): staff memang boleh mengajukan draft.
  const sesi = await wajibSesi();

  const hasil = skemaStokOpname.safeParse(input);
  if (!hasil.success) {
    return gagal('Periksa kembali isian stok opname.', petaErrorZod(hasil.error.issues));
  }

  const { data, error } = await sesi.supabase
    .rpc('ajukan_stok_opname', {
      p_inventory_item_id: hasil.data.inventory_item_id,
      p_stok_fisik: hasil.data.stok_fisik,
      p_catatan: hasil.data.catatan,
    })
    .single<StockOpname>();

  if (error) {
    const pesan = pesanDariFungsiDatabase(error);
    if (pesan) {
      console.warn('[opname] pengajuan ditolak database', { code: error.code, pesan });
      return gagal(pesan);
    }
    return terjemahkanErrorDatabase(error, 'ajukan_stok_opname');
  }

  segarkan();

  const selisih = Number(data.selisih);
  const arah =
    selisih === 0
      ? 'Stok fisik sama dengan stok sistem.'
      : selisih > 0
        ? `Stok fisik lebih banyak ${selisih} dari sistem.`
        : `Stok fisik lebih sedikit ${Math.abs(selisih)} dari sistem.`;

  const pesan =
    data.status === 'draft'
      ? `Hasil hitungan tersimpan sebagai draft dan menunggu tinjauan owner atau admin. ${arah}`
      : `Stok opname tersimpan dan stok sudah disesuaikan. ${arah}`;

  return berhasil(pesan, { status: data.status, selisih });
}

/** Owner/admin menyetujui atau menolak sebuah draft. */
export async function aksiTinjauOpname(input: unknown): Promise<HasilAksi> {
  let sesi;
  try {
    sesi = await wajibManajer();
  } catch (error) {
    if (error instanceof GagalOtorisasi) return gagal(error.message);
    throw error;
  }

  const hasil = skemaTinjauOpname.safeParse(input);
  if (!hasil.success) {
    return gagal('Data tinjauan tidak valid.', petaErrorZod(hasil.error.issues));
  }

  const { data, error } = await sesi.supabase
    .rpc('tinjau_stok_opname', {
      p_opname_id: hasil.data.opname_id,
      p_setujui: hasil.data.setujui,
      p_catatan_peninjau: hasil.data.catatan_peninjau,
    })
    .single<StockOpname>();

  if (error) {
    const pesan = pesanDariFungsiDatabase(error);
    if (pesan) return gagal(pesan);
    return terjemahkanErrorDatabase(error, 'tinjau_stok_opname');
  }

  segarkan();

  return berhasil(
    data.status === 'disetujui'
      ? 'Stok opname disetujui dan stok sudah disesuaikan.'
      : 'Stok opname ditolak. Stok tidak diubah.',
  );
}
