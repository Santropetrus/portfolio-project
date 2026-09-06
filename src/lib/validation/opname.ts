import { z } from 'zod';

import { angkaDesimal, teksOpsional, uuidWajib } from './common';

export const skemaStokOpname = z
  .object({
    inventory_item_id: uuidWajib('Bahan baku'),
    stok_fisik: angkaDesimal('Stok fisik'),
    catatan: teksOpsional(1000, 'Catatan'),
  })
  .strict();

export type MasukanStokOpname = z.input<typeof skemaStokOpname>;
export type NilaiStokOpname = z.output<typeof skemaStokOpname>;

export const nilaiAwalStokOpname: MasukanStokOpname = {
  inventory_item_id: '',
  stok_fisik: '',
  catatan: '',
};

/** Keputusan owner/admin atas sebuah draft stok opname. */
export const skemaTinjauOpname = z
  .object({
    opname_id: uuidWajib('Data stok opname'),
    setujui: z.boolean({ error: 'Keputusan wajib diisi.' }),
    catatan_peninjau: teksOpsional(1000, 'Catatan peninjau'),
  })
  .strict();

export type NilaiTinjauOpname = z.output<typeof skemaTinjauOpname>;
