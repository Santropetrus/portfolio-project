import 'server-only';

import type { PostgrestError } from '@supabase/supabase-js';

import { gagal, type HasilAksi } from '@/lib/auth/hasil-aksi';

/**
 * Menerjemahkan error Postgres/PostgREST menjadi pesan yang aman ditampilkan.
 *
 * Detail teknis (termasuk isi query dan nama constraint) hanya dicatat di log
 * server. Klien tidak pernah menerima pesan mentah dari database, supaya
 * struktur internal tidak bocor.
 */
export function terjemahkanErrorDatabase(
  error: PostgrestError,
  konteks: string,
): HasilAksi<never> {
  console.error(`[db] ${konteks}`, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });

  switch (error.code) {
    case '23505':
      return gagal('Nama bahan baku itu sudah terdaftar. Gunakan nama lain.', {
        nama: 'Nama bahan sudah dipakai.',
      });
    case '23503':
      return gagal('Data terkait tidak ditemukan atau sudah dihapus.');
    case '23514':
    case '22003':
    case '22023':
      return gagal('Ada nilai yang tidak valid. Periksa kembali isian Anda.');
    case '42501':
      return gagal('Anda tidak memiliki izin untuk melakukan aksi ini.');
    case 'P0002':
      return gagal('Data tidak ditemukan.');
    case 'PGRST116':
      return gagal('Data tidak ditemukan atau Anda tidak memiliki akses.');
    default:
      return gagal('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
  }
}

/** Pesan dari RAISE EXCEPTION di fungsi database sudah ditulis untuk pengguna. */
export function pesanDariFungsiDatabase(error: PostgrestError): string | null {
  const kodeAman = new Set(['42501', '22023', 'P0002']);
  if (kodeAman.has(error.code) && error.message && error.message.length <= 200) {
    return error.message;
  }
  return null;
}
