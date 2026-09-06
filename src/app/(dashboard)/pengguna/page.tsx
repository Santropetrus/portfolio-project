import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { JudulHalaman } from '@/components/layout/shell';
import { TabelAnggota, type Anggota } from '@/components/pengguna/tabel-anggota';
import { Kartu, KepalaKartu } from '@/components/ui/card';
import { IkonInfo } from '@/components/ui/icons';
import { apakahOwner, wajibSesi } from '@/lib/auth/session';
import { DESKRIPSI_ROLE, LABEL_ROLE } from '@/lib/constants';
import type { UserRole } from '@/types/database';

export const metadata: Metadata = { title: 'Anggota Tim' };
export const dynamic = 'force-dynamic';

const URUTAN: Record<UserRole, number> = { owner: 0, admin: 1, staff: 2 };

export default async function HalamanPengguna() {
  const { supabase, profile, userId } = await wajibSesi();

  // Penjaga kedua setelah navigasi. Policy dan trigger di database tetap
  // menjadi batas keamanan sesungguhnya.
  if (!apakahOwner(profile.role)) {
    redirect('/dashboard');
  }

  const { data } = await supabase
    .from('profiles')
    .select('id, nama, role, is_active, created_at')
    .order('created_at', { ascending: true })
    .limit(100)
    .returns<Anggota[]>();

  const anggota = [...(data ?? [])].sort(
    (a, b) => URUTAN[a.role] - URUTAN[b.role] || a.nama.localeCompare(b.nama, 'id'),
  );

  const jumlahPerRole = anggota.reduce<Record<string, number>>((akumulasi, orang) => {
    akumulasi[orang.role] = (akumulasi[orang.role] ?? 0) + 1;
    return akumulasi;
  }, {});

  return (
    <>
      <JudulHalaman
        label="Anggota tim"
        judul="Hak akses"
        deskripsi="Atur role dan status akun anggota The Matcha Kyoto. Perubahan berlaku seketika dan tercatat di audit log."
      />

      <section className="mb-5 grid grid-cols-1 border border-beige-300 bg-white/60 sm:grid-cols-3">
        {(['owner', 'admin', 'staff'] as const).map((role, indeks) => (
          <div
            key={role}
            className={`p-5 ${indeks > 0 ? 'border-t border-beige-200 sm:border-l sm:border-t-0' : ''}`}
          >
            <p className="mono-label text-tinta-400">{LABEL_ROLE[role]}</p>
            <p className="angka-besar mt-3 text-3xl text-tinta-900">{jumlahPerRole[role] ?? 0}</p>
            <p className="mt-2 text-xs leading-relaxed text-tinta-400">{DESKRIPSI_ROLE[role]}</p>
          </div>
        ))}
      </section>

      <Kartu>
        <KepalaKartu
          judul="Daftar anggota"
          deskripsi={`${anggota.length} akun terdaftar di organisasi ini.`}
        />
        <TabelAnggota anggota={anggota} idSaya={userId} />

        <div className="flex items-start gap-2.5 border-t border-beige-200 bg-beige-100/50 px-5 py-4">
          <IkonInfo className="mt-0.5 h-4 w-4 shrink-0 text-kayu-600" />
          <div className="text-xs leading-relaxed text-tinta-500">
            <p>
              <strong className="font-semibold text-tinta-700">Menambah anggota baru</strong> masih
              dilakukan lewat dashboard Supabase → Authentication → Users → Add user. Akun baru
              otomatis mendapat role Staff, lalu rolenya bisa diubah di halaman ini.
            </p>
            <p className="mt-2">
              Pembuatan akun memerlukan service role key, yang sengaja tidak pernah dibawa aplikasi
              ini agar kunci itu tidak punya jalur menuju browser.
            </p>
          </div>
        </div>
      </Kartu>
    </>
  );
}
