import { z } from 'zod';

import { teksOpsional, uuidWajib } from './common';

/**
 * Perubahan role dan status anggota.
 *
 * Skema ini hanya menjaga bentuk payload. Aturan sesungguhnya — hanya owner,
 * hanya di organisasi sendiri, tidak boleh mengubah role sendiri, organisasi
 * harus punya minimal satu owner aktif — ditegakkan trigger
 * `guard_profile_changes()` di database.
 */
export const skemaUbahRole = z
  .object({
    user_id: uuidWajib('Anggota'),
    role: z.enum(['owner', 'admin', 'staff'], { error: 'Role wajib dipilih.' }),
  })
  .strict();

export const skemaUbahStatusAnggota = z
  .object({
    user_id: uuidWajib('Anggota'),
    aktif: z.boolean({ error: 'Status wajib diisi.' }),
  })
  .strict();

export const skemaUbahNamaAnggota = z
  .object({
    user_id: uuidWajib('Anggota'),
    nama: teksOpsional(120, 'Nama'),
  })
  .strict();

export type NilaiUbahRole = z.output<typeof skemaUbahRole>;
export type NilaiUbahStatusAnggota = z.output<typeof skemaUbahStatusAnggota>;
