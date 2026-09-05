import { z } from 'zod';

/**
 * Sanitasi teks bebas.
 *
 * 1. Membuang karakter kontrol (kecuali baris baru) yang bisa merusak
 *    render, log, maupun ekspor data.
 * 2. Merapikan spasi berlebih.
 *
 * Escaping untuk HTML TIDAK dilakukan di sini: React sudah meng-escape
 * seluruh teks secara default dan aplikasi ini tidak pernah memakai
 * dangerouslySetInnerHTML. Menyimpan teks apa adanya membuat data tetap
 * bersih untuk ekspor maupun integrasi pada tahap berikutnya.
 */
const KARAKTER_KONTROL = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g;

export function bersihkanTeks(nilai: string): string {
  return nilai.replace(KARAKTER_KONTROL, '').replace(/[ \t]{2,}/g, ' ').trim();
}

/**
 * Skema dibangun dengan `transform().pipe()` alih-alih `preprocess()` supaya
 * `z.input<>` tetap punya tipe yang berguna. React Hook Form memakai tipe
 * input itu untuk `defaultValues`, sedangkan Server Action menerima tipe
 * output yang sudah bersih.
 */

export const teksWajib = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} wajib diisi.` })
    .transform(bersihkanTeks)
    .pipe(
      z
        .string()
        .min(min, `${label} minimal ${min} karakter.`)
        .max(max, `${label} maksimal ${max} karakter.`),
    );

export const teksOpsional = (max: number, label: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((nilai) => {
      const bersih = bersihkanTeks(nilai ?? '');
      return bersih === '' ? null : bersih;
    })
    .pipe(z.string().max(max, `${label} maksimal ${max} karakter.`).nullable());

/** Mengubah teks angka gaya Indonesia ("1.500,5") maupun "1500.5" jadi number. */
function normalkanAngka(nilai: string | number): number {
  if (typeof nilai === 'number') return nilai;

  const bersih = nilai.trim();
  if (bersih === '') return Number.NaN;

  // Buang pemisah ribuan, lalu ubah koma desimal menjadi titik.
  const dinormalkan = bersih.replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  return Number(dinormalkan);
}

export const angkaDesimal = (label: string, opsi?: { min?: number; max?: number }) =>
  z
    .union([z.string(), z.number()], { error: `${label} harus berupa angka.` })
    .transform(normalkanAngka)
    .pipe(
      z
        .number({ error: `${label} harus berupa angka.` })
        .min(opsi?.min ?? 0, `${label} tidak boleh kurang dari ${opsi?.min ?? 0}.`)
        .max(opsi?.max ?? 9_999_999_999, `${label} terlalu besar.`)
        .refine((n) => Number.isFinite(n), `${label} harus berupa angka.`)
        .refine(
          (n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6,
          `${label} maksimal 2 angka di belakang koma.`,
        ),
    );

export const tanggalOpsional = (label: string) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((nilai) => {
      const bersih = (nilai ?? '').trim();
      return bersih === '' ? null : bersih;
    })
    .pipe(
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} harus dalam format YYYY-MM-DD.`)
        .refine((tanggal) => !Number.isNaN(new Date(`${tanggal}T00:00:00`).getTime()), {
          message: `${label} tidak valid.`,
        })
        .nullable(),
    );

export const uuidWajib = (label: string) =>
  z.string({ error: `${label} wajib dipilih.` }).uuid(`${label} tidak valid.`);
