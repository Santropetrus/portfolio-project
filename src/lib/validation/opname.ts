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
