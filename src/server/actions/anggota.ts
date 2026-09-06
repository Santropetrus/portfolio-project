'use server';

import { revalidatePath } from 'next/cache';

import { berhasil, gagal, petaErrorZod, type HasilAksi } from '@/lib/auth/hasil-aksi';
import { GagalOtorisasi, wajibSesi } from '@/lib/auth/session';
import { LABEL_ROLE } from '@/lib/constants';
import { skemaUbahRole, skemaUbahStatusAnggota } from '@/lib/validation/anggota';
import { terjemahkanErrorDatabase } from './kesalahan';

/**
 * Pengelolaan anggota tim.
 *
 * Aksi ini hanya lapisan pertama. Aturan sesungguhnya ditegakkan database:
 * policy `profiles_update_by_owner` membatasi siapa yang boleh menulis, dan
 * trigger `guard_profile_changes()` menolak owner yang mengubah role dirinya
 * sendiri atau mengosongkan organisasi dari owner aktif. Karena itu bahkan
 * payload yang dimanipulasi tetap tidak bisa menembusnya.
 */

async function wajibOwner() {
  const sesi = await wajibSesi();
  if (sesi.profile.role !== 'owner') {
    throw new GagalOtorisasi('Hanya owner yang dapat mengelola anggota tim.');
  }
  return sesi;
}

export async function aksiUbahRoleAnggota(input: unknown): Promise<HasilAksi> {
  let sesi;
  try {
    sesi = await wajibOwner();
  } catch (error) {
    if (error instanceof GagalOtorisasi) return gagal(error.message);
    throw error;
  }

  const hasil = skemaUbahRole.safeParse(input);
  if (!hasil.success) {
    return gagal('Data anggota tidak valid.', petaErrorZod(hasil.error.issues));
  }

  if (hasil.data.user_id === sesi.userId) {
    return gagal('Anda tidak dapat mengubah role akun Anda sendiri.');
  }

  const { data, error } = await sesi.supabase
    .from('profiles')
    .update({ role: hasil.data.role })
    .eq('id', hasil.data.user_id)
    .eq('organization_id', sesi.profile.organization_id)
    .select('nama, role')
    .maybeSingle<{ nama: string; role: keyof typeof LABEL_ROLE }>();

  if (error) return terjemahkanErrorDatabase(error, 'profiles.update_role');
  if (!data) return gagal('Anggota tidak ditemukan atau Anda tidak memiliki akses.');

  revalidatePath('/pengguna');
  revalidatePath('/pengaturan');

  return berhasil(`Role ${data.nama} kini ${LABEL_ROLE[data.role]}.`);
}

export async function aksiUbahStatusAnggota(input: unknown): Promise<HasilAksi> {
  let sesi;
  try {
    sesi = await wajibOwner();
  } catch (error) {
    if (error instanceof GagalOtorisasi) return gagal(error.message);
    throw error;
  }

  const hasil = skemaUbahStatusAnggota.safeParse(input);
  if (!hasil.success) {
    return gagal('Data anggota tidak valid.', petaErrorZod(hasil.error.issues));
  }

  if (hasil.data.user_id === sesi.userId) {
    return gagal('Anda tidak dapat menonaktifkan akun Anda sendiri.');
  }

  const { data, error } = await sesi.supabase
    .from('profiles')
    .update({ is_active: hasil.data.aktif })
    .eq('id', hasil.data.user_id)
    .eq('organization_id', sesi.profile.organization_id)
    .select('nama, is_active')
    .maybeSingle<{ nama: string; is_active: boolean }>();

  if (error) return terjemahkanErrorDatabase(error, 'profiles.update_status');
  if (!data) return gagal('Anggota tidak ditemukan atau Anda tidak memiliki akses.');

  revalidatePath('/pengguna');
  revalidatePath('/pengaturan');

  return berhasil(
    data.is_active
      ? `Akun ${data.nama} diaktifkan kembali.`
      : `Akun ${data.nama} dinonaktifkan. Ia langsung kehilangan akses.`,
  );
}
