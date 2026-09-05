import { RUTE_LOGIN } from './session';

/**
 * Memastikan tujuan redirect adalah path internal.
 *
 * Menutup celah open redirect lewat parameter `?lanjut=`: penyerang tidak bisa
 * memakai halaman login kita untuk melempar korban ke situs pihak ketiga.
 *
 * Sengaja TIDAK berada di modul `'use server'` — setiap fungsi yang diekspor
 * dari modul Server Action menjadi endpoint yang bisa dipanggil dari luar,
 * dan helper murni tidak perlu ikut terekspos.
 */
export function rutePengalihanAman(lanjut: string | null | undefined): string {
  if (!lanjut) return '/dashboard';
  if (!lanjut.startsWith('/')) return '/dashboard';
  if (lanjut.startsWith('//') || lanjut.startsWith('/\\')) return '/dashboard';
  if (lanjut.includes('://') || lanjut.includes('\\')) return '/dashboard';
  if (lanjut === RUTE_LOGIN || lanjut.startsWith(`${RUTE_LOGIN}/`)) return '/dashboard';
  if (lanjut.length > 200) return '/dashboard';
  return lanjut;
}
