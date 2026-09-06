import { redirect } from 'next/navigation';

import { PerluKonfigurasi } from '@/components/setup/perlu-konfigurasi';
import { ambilSesi } from '@/lib/auth/session';
import { isSupabaseConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function Beranda() {
  // Diperiksa lebih dulu: tanpa konfigurasi, memanggil ambilSesi() hanya akan
  // melempar, dan pengguna baru akan melihat stack trace alih-alih panduan.
  if (!isSupabaseConfigured) {
    return <PerluKonfigurasi />;
  }

  const sesi = await ambilSesi();
  redirect(sesi ? '/dashboard' : '/masuk');
}
