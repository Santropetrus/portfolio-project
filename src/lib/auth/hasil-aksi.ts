/**
 * Bentuk balikan seragam untuk seluruh Server Action.
 *
 * `errorField` memetakan pesan validasi ke nama field agar React Hook Form
 * bisa menampilkannya di tempat yang tepat.
 */
export interface HasilAksi<T = undefined> {
  sukses: boolean;
  pesan: string;
  data?: T;
  errorField?: Record<string, string>;
}

export function berhasil<T = undefined>(pesan: string, data?: T): HasilAksi<T> {
  return { sukses: true, pesan, data };
}

export function gagal<T = undefined>(
  pesan: string,
  errorField?: Record<string, string>,
): HasilAksi<T> {
  return { sukses: false, pesan, errorField };
}

/** Mengubah issue Zod menjadi peta field -> pesan pertama. */
export function petaErrorZod(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>,
): Record<string, string> {
  const peta: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path.map(String).join('.') || '_form';
    if (!peta[field]) peta[field] = issue.message;
  }
  return peta;
}
