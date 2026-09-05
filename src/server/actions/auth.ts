'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { berhasil, gagal, petaErrorZod, type HasilAksi } from '@/lib/auth/hasil-aksi';
import { ambilIpKlien, kunciRateLimitLogin } from '@/lib/auth/request';
import { catatKegagalan, periksaRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';
import { rutePengalihanAman } from '@/lib/auth/redirect';
import { RUTE_LOGIN } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { skemaLogin } from '@/lib/validation/auth';

/**
 * Pesan tunggal untuk SEMUA kegagalan login.
 *
 * Disengaja tidak membedakan "email tidak terdaftar" dan "kata sandi salah",
 * supaya penyerang tidak bisa memakai halaman login untuk memetakan alamat
 * email mana yang terdaftar (user enumeration).
 */
const PESAN_LOGIN_GAGAL = 'Email atau kata sandi salah.';

export async function aksiMasuk(input: unknown): Promise<HasilAksi<{ tujuan: string }>> {
  const hasilValidasi = skemaLogin.safeParse(input);

  if (!hasilValidasi.success) {
    return gagal('Periksa kembali email dan kata sandi Anda.', petaErrorZod(hasilValidasi.error.issues));
  }

  const { email, password } = hasilValidasi.data;

  const ip = await ambilIpKlien();
  const kunci = kunciRateLimitLogin(ip, email);

  const statusAwal = periksaRateLimit(kunci);
  if (!statusAwal.diizinkan) {
    const menit = Math.max(1, Math.ceil(statusAwal.cobaLagiDetik / 60));
    return gagal(
      `Terlalu banyak percobaan login. Coba lagi dalam sekitar ${menit} menit.`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    // Detail asli hanya untuk log server, tidak pernah dikirim ke klien.
    console.warn('[auth] login gagal', { ip, alasan: error?.message ?? 'user kosong' });
    const status = catatKegagalan(kunci);
    if (!status.diizinkan) {
      const menit = Math.max(1, Math.ceil(status.cobaLagiDetik / 60));
      return gagal(`Terlalu banyak percobaan login. Coba lagi dalam sekitar ${menit} menit.`);
    }
    return gagal(PESAN_LOGIN_GAGAL);
  }

  // Akun boleh ada di Supabase Auth tetapi profilnya dinonaktifkan.
  const { data: profil } = await supabase
    .from('profiles')
    .select('id, is_active')
    .eq('id', data.user.id)
    .maybeSingle<{ id: string; is_active: boolean }>();

  if (!profil || !profil.is_active) {
    await supabase.auth.signOut();
    return gagal('Akun Anda belum aktif. Hubungi owner The Matcha Kyoto.');
  }

  resetRateLimit(kunci);
  revalidatePath('/', 'layout');

  const tujuan = rutePengalihanAman(
    typeof input === 'object' && input !== null && 'lanjut' in input
      ? String((input as { lanjut?: unknown }).lanjut ?? '')
      : null,
  );

  return berhasil('Berhasil masuk. Mengalihkan ke dashboard…', { tujuan });
}

export async function aksiKeluar(): Promise<never> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect(RUTE_LOGIN);
}
