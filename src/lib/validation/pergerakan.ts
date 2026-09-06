import { z } from 'zod';

import { angkaDesimal, teksOpsional, uuidWajib } from './common';

/**
 * Pencatatan stok masuk dan keluar.
 *
 * `harga_beli` hanya relevan untuk penerimaan barang, dan tetap opsional —
 * banyak penerimaan memakai harga yang sama dengan sebelumnya.
 */
export const skemaPergerakanStok = z
  .object({
    inventory_item_id: uuidWajib('Bahan baku'),
    tipe: z.enum(['masuk', 'keluar'], { error: 'Jenis pergerakan wajib dipilih.' }),
    jumlah: angkaDesimal('Jumlah', { min: 0 }).refine(
      (nilai) => nilai > 0,
      'Jumlah harus lebih besar dari 0.',
    ),
    catatan: teksOpsional(1000, 'Catatan'),
    harga_beli: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((nilai) => {
        if (nilai === null || nilai === undefined) return null;
        const teks = String(nilai).trim();
        if (teks === '') return null;
        const angka = Number(teks.replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
        return Number.isNaN(angka) ? Number.NaN : angka;
      })
      .pipe(
        z
          .number({ error: 'Harga beli harus berupa angka.' })
          .min(0, 'Harga beli tidak boleh negatif.')
          .max(999_999_999_999, 'Harga beli terlalu besar.')
          .nullable(),
      ),
  })
  .strict();

export type MasukanPergerakanStok = z.input<typeof skemaPergerakanStok>;
export type NilaiPergerakanStok = z.output<typeof skemaPergerakanStok>;

export const nilaiAwalPergerakan: MasukanPergerakanStok = {
  inventory_item_id: '',
  tipe: 'masuk',
  jumlah: '',
  catatan: '',
  harga_beli: '',
};
