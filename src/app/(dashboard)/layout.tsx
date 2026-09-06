import { KerangkaAplikasi } from '@/components/layout/shell';
import { PerluKonfigurasi } from '@/components/setup/perlu-konfigurasi';
import { wajibSesi } from '@/lib/auth/session';
import { isSupabaseConfigured } from '@/lib/env';

/**
 * Penjaga sisi server untuk seluruh halaman dashboard.
 *
 * Proxy (middleware) juga melakukan pengalihan, tetapi pemeriksaan di sini
 * yang menjadi batas keamanan sebenarnya: layout ini berjalan di server pada
 * setiap request dan tidak bisa dilewati dari sisi klien.
 */
export default async function LayoutDashboard({ children }: { children: React.ReactNode }) {
  // Tanpa konfigurasi Supabase tidak ada sesi yang bisa diperiksa. Tampilkan
  // panduan setup daripada melempar error dari kedalaman kode.
  if (!isSupabaseConfigured) {
    return <PerluKonfigurasi />;
  }

  const { profile, supabase } = await wajibSesi();

  const { data: organisasi } = await supabase
    .from('organizations')
    .select('nama')
    .eq('id', profile.organization_id)
    .maybeSingle<{ nama: string }>();

  return (
    <KerangkaAplikasi profile={profile} namaOrganisasi={organisasi?.nama ?? 'The Matcha Kyoto'}>
      {children}
    </KerangkaAplikasi>
  );
}
