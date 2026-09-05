import { z } from 'zod';

import { bersihkanTeks } from './common';

export const skemaLogin = z.object({
  email: z
    .string({ error: 'Email wajib diisi.' })
    .transform((nilai) => nilai.trim().toLowerCase())
    .pipe(
      z
        .string()
        .min(1, 'Email wajib diisi.')
        .max(254, 'Email terlalu panjang.')
        .email('Format email tidak valid.'),
    ),
  password: z
    .string({ error: 'Kata sandi wajib diisi.' })
    .min(1, 'Kata sandi wajib diisi.')
    .max(72, 'Kata sandi maksimal 72 karakter.'),
});

export type MasukanLogin = z.input<typeof skemaLogin>;
export type NilaiLogin = z.output<typeof skemaLogin>;

export const skemaProfil = z.object({
  nama: z
    .string({ error: 'Nama wajib diisi.' })
    .transform(bersihkanTeks)
    .pipe(
      z
        .string()
        .min(2, 'Nama minimal 2 karakter.')
        .max(120, 'Nama maksimal 120 karakter.'),
    ),
});

export type MasukanProfil = z.input<typeof skemaProfil>;
export type NilaiProfil = z.output<typeof skemaProfil>;
