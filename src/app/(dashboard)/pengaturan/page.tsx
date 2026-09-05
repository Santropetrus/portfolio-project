import type { Metadata } from 'next';

import { JudulHalaman } from '@/components/layout/shell';
import { FormProfil } from '@/components/pengaturan/form-profil';
import { BadgeNetral } from '@/components/ui/badge';
import { IsiKartu, Kartu, KepalaKartu } from '@/components/ui/card';
import { IkonInfo } from '@/components/ui/icons';
import { apakahManajer, apakahOwner, wajibSesi } from '@/lib/auth/session';
import { DESKRIPSI_ROLE, LABEL_ROLE } from '@/lib/constants';
import { formatTanggal, formatTanggalWaktu } from '@/lib/utils';
import type { AuditLog, Profile, UserRole } from '@/types/database';

export const metadata: Metadata = { title: 'Pengaturan' };
export const dynamic = 'force-dynamic';

const LABEL_AKSI: Record<string, string> = {
  'inventory_item.create': 'Menambah bahan baku',
  'inventory_item.update': 'Mengubah bahan baku',
  'inventory_item.delete': 'Menghapus bahan baku',
  'stock_opname.create': 'Mencatat stok opname',
  'profile.update_sensitive': 'Mengubah role atau status akun',
};

export default async function HalamanPengaturan() {
  const { supabase, profile, email } = await wajibSesi();
  const bolehLihatAudit = apakahManajer(profile.role);

  const [hasilOrganisasi, hasilAnggota, hasilAudit] = await Promise.all([
    supabase
      .from('organizations')
      .select('nama, slug, created_at')
      .eq('id', profile.organization_id)
      .maybeSingle<{ nama: string; slug: string; created_at: string }>(),
    supabase
      .from('profiles')
      .select('id, nama, role, is_active, created_at')
      .order('role', { ascending: true })
      .limit(50)
      .returns<Array<Pick<Profile, 'id' | 'nama' | 'role' | 'is_active' | 'created_at'>>>(),
    bolehLihatAudit
      ? supabase
          .from('audit_logs')
          .select('id, action, entity_type, entity_id, metadata, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(12)
          .returns<AuditLog[]>()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const organisasi = hasilOrganisasi.data;
  const anggota = hasilAnggota.data ?? [];
  const audit = hasilAudit.data ?? [];

  const petaNama = new Map(anggota.map((a) => [a.id, a.nama]));

  return (
    <>
      <JudulHalaman
        judul="Pengaturan"
        deskripsi="Informasi akun, organisasi, dan hak akses Anda."
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Kartu>
          <KepalaKartu judul="Profil saya" deskripsi="Perbarui nama tampilan Anda." />
          <FormProfil namaAwal={profile.nama} />
          <div className="border-t border-beige-200 px-5 py-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-tinta-400">Email</dt>
                <dd className="mt-0.5 break-all text-tinta-700">{email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-tinta-400">Role</dt>
                <dd className="mt-0.5">
                  <BadgeNetral>{LABEL_ROLE[profile.role]}</BadgeNetral>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-tinta-400">Hak akses</dt>
                <dd className="mt-0.5 text-tinta-600">{DESKRIPSI_ROLE[profile.role]}</dd>
              </div>
            </dl>
          </div>
        </Kartu>

        <Kartu>
          <KepalaKartu
            judul="Organisasi"
            deskripsi="Tahap 1 berjalan untuk satu usaha, struktur multi-tenant sudah disiapkan."
          />
          <IsiKartu>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-tinta-400">Nama usaha</dt>
                <dd className="mt-0.5 font-medium text-tinta-800">{organisasi?.nama ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-tinta-400">Pengenal</dt>
                <dd className="mt-0.5 text-tinta-600">{organisasi?.slug ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-tinta-400">Terdaftar sejak</dt>
                <dd className="mt-0.5 text-tinta-600">{formatTanggal(organisasi?.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-tinta-400">Jumlah anggota</dt>
                <dd className="mt-0.5 text-tinta-600">{anggota.length} pengguna</dd>
              </div>
            </dl>
          </IsiKartu>

          <div className="border-t border-beige-200">
            <h3 className="px-5 pb-2 pt-4 text-sm font-semibold text-tinta-800">Anggota tim</h3>
            <ul className="divide-y divide-beige-200">
              {anggota.map((orang) => (
                <li
                  key={orang.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-tinta-800">
                      {orang.nama}
                      {orang.id === profile.id ? (
                        <span className="ml-1.5 text-xs font-normal text-tinta-400">(Anda)</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-tinta-400">
                      Bergabung {formatTanggal(orang.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!orang.is_active ? (
                      <span className="text-xs text-[var(--color-status-habis)]">Nonaktif</span>
                    ) : null}
                    <BadgeNetral>{LABEL_ROLE[orang.role as UserRole]}</BadgeNetral>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {apakahOwner(profile.role) ? (
            <div className="flex items-start gap-2.5 border-t border-beige-200 bg-beige-100/50 px-5 py-3.5">
              <IkonInfo className="mt-0.5 h-4 w-4 shrink-0 text-kayu-600" />
              <p className="text-xs leading-relaxed text-tinta-500">
                Pengelolaan role lewat antarmuka dijadwalkan pada Tahap 2. Untuk sekarang, ubah role
                anggota melalui SQL Editor Supabase — setiap perubahan tetap tercatat di audit log.
              </p>
            </div>
          ) : null}
        </Kartu>
      </div>

      {bolehLihatAudit ? (
        <Kartu className="mt-5">
          <KepalaKartu
            judul="Audit log"
            deskripsi="12 aksi sensitif terakhir. Catatan ini bersifat append-only dan tidak dapat dihapus dari aplikasi."
          />
          {audit.length === 0 ? (
            <IsiKartu className="text-sm text-tinta-500">Belum ada aksi yang tercatat.</IsiKartu>
          ) : (
            <ul className="divide-y divide-beige-200">
              {audit.map((baris) => (
                <li key={baris.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3">
                  <p className="text-sm text-tinta-800">
                    {LABEL_AKSI[baris.action] ?? baris.action}
                  </p>
                  <span className="text-xs text-tinta-500">
                    oleh {baris.user_id ? (petaNama.get(baris.user_id) ?? 'pengguna lain') : 'sistem'}
                  </span>
                  <time
                    dateTime={baris.created_at}
                    className="ml-auto whitespace-nowrap text-xs text-tinta-400"
                  >
                    {formatTanggalWaktu(baris.created_at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Kartu>
      ) : null}
    </>
  );
}
