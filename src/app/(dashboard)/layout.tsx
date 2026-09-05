import { KerangkaAplikasi } from '@/components/layout/shell';
import { wajibSesi } from '@/lib/auth/session';

/**
 * Penjaga sisi server untuk seluruh halaman dashboard.
 *
 * Proxy (middleware) juga melakukan pengalihan, tetapi pemeriksaan di sini
 * yang menjadi batas keamanan sebenarnya: layout ini berjalan di server pada
 * setiap request dan tidak bisa dilewati dari sisi klien.
 */
export default async function LayoutDashboard({ children }: { children: React.ReactNode }) {
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
