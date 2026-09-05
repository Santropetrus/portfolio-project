/**
 * Meng-escape karakter wildcard PostgREST/LIKE dari input pengguna.
 *
 * Ini BUKAN pencegahan SQL injection — supabase-js selalu mengirim nilai
 * sebagai parameter terpisah, jadi injeksi SQL tidak mungkin terjadi.
 * Escaping di sini mencegah tiga hal: pengguna memakai `%`, `_`, atau `*`
 * (PostgREST menerjemahkan `*` menjadi `%`) untuk membuat pola pencarian yang
 * mahal; koma dan tanda kurung memecah struktur filter `or()`.
 */
export function amankanPolaPencarian(nilai: string): string {
  return nilai
    .slice(0, 80)
    .replace(/[\\%_]/g, (cocok) => `\\${cocok}`)
    .replace(/[(),*]/g, ' ')
    .trim();
}

export function bacaParamTunggal(nilai: string | string[] | undefined): string {
  if (Array.isArray(nilai)) return nilai[0] ?? '';
  return nilai ?? '';
}

export function bacaHalaman(nilai: string | string[] | undefined): number {
  const angka = Number.parseInt(bacaParamTunggal(nilai), 10);
  if (!Number.isFinite(angka) || angka < 1) return 1;
  return Math.min(angka, 10_000);
}
