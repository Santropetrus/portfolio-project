'use server';

import { revalidatePath } from 'next/cache';

import { berhasil, gagal, petaErrorZod, type HasilAksi } from '@/lib/auth/hasil-aksi';
import { wajibSesi } from '@/lib/auth/session';
import { skemaProfil } from '@/lib/validation/auth';
import { terjemahkanErrorDatabase } from './kesalahan';

/**
 * Pengguna hanya boleh memperbarui namanya sendiri.
 *
 * Kolom `role`, `organization_id`, dan `is_active` sengaja tidak pernah
 * dikirim dari sini. Bahkan bila payload dimanipulasi, trigger
 * `guard_profile_changes()` di database akan menolaknya.
 */
export async function aksiUbahNamaProfil(input: unknown): Promise<HasilAksi> {
  const sesi = await wajibSesi();

  const hasil = skemaProfil.safeParse(input);
  if (!hasil.success) {
    return gagal('Nama tidak valid.', petaErrorZod(hasil.error.issues));
  }

  const { error } = await sesi.supabase
    .from('profiles')
    .update({ nama: hasil.data.nama })
    .eq('id', sesi.userId);

  if (error) return terjemahkanErrorDatabase(error, 'profiles.update');

  revalidatePath('/', 'layout');
  return berhasil('Nama berhasil diperbarui.');
}
