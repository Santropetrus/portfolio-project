'use server';

import { revalidatePath } from 'next/cache';

import { berhasil, gagal, petaErrorZod, type HasilAksi } from '@/lib/auth/hasil-aksi';
import { GagalOtorisasi, wajibManajer } from '@/lib/auth/session';
import {
  skemaBahanBaku,
  skemaHapusBahanBaku,
  skemaUbahBahanBaku,
} from '@/lib/validation/inventori';
import { terjemahkanErrorDatabase } from './kesalahan';

const RUTE_TERPENGARUH = ['/dashboard', '/inventori', '/stok-opname', '/riwayat-stok'];

function segarkan(): void {
  for (const rute of RUTE_TERPENGARUH) revalidatePath(rute);
}

/**
 * Semua aksi di bawah menerapkan tiga lapis pemeriksaan:
 *   1. `wajibManajer()`  — sesi & role diperiksa di server.
 *   2. Skema Zod         — bentuk dan batas nilai payload.
 *   3. RLS di database   — otorisasi terakhir yang tidak bisa dilewati.
 *
 * `organization_id` TIDAK PERNAH diambil dari input klien; selalu dari profil
 * sesi. Dengan begitu tidak ada cara menulis data ke organisasi lain.
 */

export async function aksiTambahBahan(input: unknown): Promise<HasilAksi> {
  let sesi;
  try {
    sesi = await wajibManajer();
  } catch (error) {
    if (error instanceof GagalOtorisasi) return gagal(error.message);
    throw error;
  }

  const hasil = skemaBahanBaku.safeParse(input);
  if (!hasil.success) {
    return gagal('Periksa kembali isian formulir.', petaErrorZod(hasil.error.issues));
  }

  const { error } = await sesi.supabase.from('inventory_items').insert({
    ...hasil.data,
    organization_id: sesi.profile.organization_id,
    created_by: sesi.userId,
  });

  if (error) return terjemahkanErrorDatabase(error, 'inventory_items.insert');

  segarkan();
  return berhasil(`Bahan "${hasil.data.nama}" berhasil ditambahkan.`);
}

export async function aksiUbahBahan(input: unknown): Promise<HasilAksi> {
  let sesi;
  try {
    sesi = await wajibManajer();
  } catch (error) {
    if (error instanceof GagalOtorisasi) return gagal(error.message);
    throw error;
  }

  const hasil = skemaUbahBahanBaku.safeParse(input);
  if (!hasil.success) {
    return gagal('Periksa kembali isian formulir.', petaErrorZod(hasil.error.issues));
  }

  const { id, ...nilai } = hasil.data;

  const { data, error } = await sesi.supabase
    .from('inventory_items')
    .update(nilai)
    .eq('id', id)
    .eq('organization_id', sesi.profile.organization_id)
    .select('id')
    .maybeSingle();

  if (error) return terjemahkanErrorDatabase(error, 'inventory_items.update');
  if (!data) return gagal('Bahan baku tidak ditemukan atau Anda tidak memiliki akses.');

  segarkan();
  return berhasil(`Bahan "${nilai.nama}" berhasil diperbarui.`);
}

export async function aksiHapusBahan(input: unknown): Promise<HasilAksi> {
  let sesi;
  try {
    sesi = await wajibManajer();
  } catch (error) {
    if (error instanceof GagalOtorisasi) return gagal(error.message);
    throw error;
  }

  const hasil = skemaHapusBahanBaku.safeParse(input);
  if (!hasil.success) {
    return gagal('Data bahan baku tidak valid.', petaErrorZod(hasil.error.issues));
  }

  const { data, error } = await sesi.supabase
    .from('inventory_items')
    .delete()
    .eq('id', hasil.data.id)
    .eq('organization_id', sesi.profile.organization_id)
    .select('nama')
    .maybeSingle<{ nama: string }>();

  if (error) return terjemahkanErrorDatabase(error, 'inventory_items.delete');
  if (!data) return gagal('Bahan baku tidak ditemukan atau Anda tidak memiliki akses.');

  segarkan();
  return berhasil(`Bahan "${data.nama}" berhasil dihapus.`);
}
