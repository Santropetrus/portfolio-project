import { z } from 'zod';

import { KATEGORI_VALUES } from '@/lib/constants';
import { angkaDesimal, tanggalOpsional, teksOpsional, teksWajib, uuidWajib } from './common';

/**
 * Skema tunggal yang dipakai DUA KALI: di client (React Hook Form) dan di
 * server (Server Action). Validasi client hanya demi pengalaman pengguna —
 * server tetap memvalidasi ulang setiap payload yang masuk.
 */
export const skemaBahanBaku = z
  .object({
    nama: teksWajib(2, 120, 'Nama bahan'),
    kategori: z.enum(KATEGORI_VALUES, { error: 'Kategori wajib dipilih.' }),
    satuan: teksWajib(1, 24, 'Satuan'),
    stok_saat_ini: angkaDesimal('Stok saat ini'),
    stok_minimum: angkaDesimal('Stok minimum'),
    harga_beli: angkaDesimal('Harga beli', { max: 999_999_999_999 }),
    supplier: teksOpsional(120, 'Supplier'),
    tanggal_kedaluwarsa: tanggalOpsional('Tanggal kedaluwarsa'),
    catatan: teksOpsional(1000, 'Catatan'),
  })
  .strict();

export type MasukanBahanBaku = z.input<typeof skemaBahanBaku>;
export type NilaiBahanBaku = z.output<typeof skemaBahanBaku>;

export const skemaUbahBahanBaku = skemaBahanBaku.extend({
  id: uuidWajib('Bahan baku'),
});

export type MasukanUbahBahanBaku = z.input<typeof skemaUbahBahanBaku>;
export type NilaiUbahBahanBaku = z.output<typeof skemaUbahBahanBaku>;

export const skemaHapusBahanBaku = z.object({
  id: uuidWajib('Bahan baku'),
});

export const nilaiAwalBahanBaku: MasukanBahanBaku = {
  nama: '',
  kategori: 'matcha_powder',
  satuan: '',
  stok_saat_ini: '',
  stok_minimum: '',
  harga_beli: '',
  supplier: '',
  tanggal_kedaluwarsa: '',
  catatan: '',
};
