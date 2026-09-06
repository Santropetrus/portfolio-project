import type { Metadata } from 'next';

import { JudulHalaman } from '@/components/layout/shell';
import { FormOpname, type BahanUntukOpname } from '@/components/opname/form-opname';
import { PanelTinjauan, type DraftOpname } from '@/components/opname/panel-tinjauan';
import { BadgeNada } from '@/components/ui/badge';
import { Kartu, KepalaKartu } from '@/components/ui/card';
import { KondisiKosong } from '@/components/ui/states';
import { apakahManajer, wajibSesi } from '@/lib/auth/session';
import { LABEL_STATUS_OPNAME } from '@/lib/constants';
import { cn, formatAngka, formatTanggalWaktu } from '@/lib/utils';
import type { OpnameStatus, Profile } from '@/types/database';

export const metadata: Metadata = { title: 'Stok Opname' };
export const dynamic = 'force-dynamic';

interface BarisOpname {
  id: string;
  stok_sistem: number;
  stok_fisik: number;
  selisih: number;
  catatan: string | null;
  catatan_peninjau: string | null;
  created_at: string;
  created_by: string | null;
  status: OpnameStatus;
  inventory_items: { nama: string; satuan: string } | null;
}

const nadaStatus: Record<OpnameStatus, 'tunggu' | 'aman' | 'habis'> = {
  draft: 'tunggu',
  disetujui: 'aman',
  ditolak: 'habis',
};

export default async function HalamanStokOpname() {
  const { supabase, profile } = await wajibSesi();
  const bolehTinjau = apakahManajer(profile.role);

  const [hasilBahan, hasilRiwayat, hasilAnggota] = await Promise.all([
    supabase
      .from('inventory_items')
      .select('id, nama, satuan, kategori, stok_saat_ini')
      .order('nama', { ascending: true })
      .limit(500)
      .returns<BahanUntukOpname[]>(),
    supabase
      .from('stock_opnames')
      .select(
        'id, stok_sistem, stok_fisik, selisih, catatan, catatan_peninjau, created_at, created_by, status, inventory_items(nama, satuan)',
      )
      .order('created_at', { ascending: false })
      .limit(30)
      .returns<BarisOpname[]>(),
    supabase
      .from('profiles')
      .select('id, nama')
      .limit(100)
      .returns<Array<Pick<Profile, 'id' | 'nama'>>>(),
  ]);

  const daftarBahan = (hasilBahan.data ?? []).map((bahan) => ({
    ...bahan,
    stok_saat_ini: Number(bahan.stok_saat_ini),
  }));

  const semua = hasilRiwayat.data ?? [];
  const petaNama = new Map((hasilAnggota.data ?? []).map((a) => [a.id, a.nama]));

  const draft: DraftOpname[] = semua
    .filter((baris) => baris.status === 'draft')
    .map((baris) => ({
      id: baris.id,
      stok_sistem: Number(baris.stok_sistem),
      stok_fisik: Number(baris.stok_fisik),
      selisih: Number(baris.selisih),
      catatan: baris.catatan,
      created_at: baris.created_at,
      namaBahan: baris.inventory_items?.nama ?? 'Bahan dihapus',
      satuan: baris.inventory_items?.satuan ?? '',
      namaPengaju: (baris.created_by ? petaNama.get(baris.created_by) : null) ?? 'anggota tim',
    }));

  const selesai = semua.filter((baris) => baris.status !== 'draft').slice(0, 15);

  return (
    <>
      <JudulHalaman
        label="Stok opname"
        judul="Cocokkan hitungan"
        deskripsi={
          bolehTinjau
            ? 'Catat hasil hitungan fisik, dan tinjau draft yang diajukan staff sebelum stok disesuaikan.'
            : 'Catat hasil hitungan fisik Anda. Owner atau admin akan meninjaunya sebelum stok berubah.'
        }
        aksi={
          bolehTinjau && draft.length > 0 ? (
            <BadgeNada nada="tunggu">{draft.length} menunggu tinjauan</BadgeNada>
          ) : null
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Kartu>
          <KepalaKartu
            judul="Catat hasil hitung"
            deskripsi={
              bolehTinjau
                ? 'Stok langsung disesuaikan setelah disimpan.'
                : 'Tersimpan sebagai draft untuk ditinjau.'
            }
          />
          <FormOpname daftarBahan={daftarBahan} bolehLangsungSetujui={bolehTinjau} />
        </Kartu>

        <div className="space-y-5">
          {bolehTinjau ? (
            <Kartu>
              <KepalaKartu
                judul="Menunggu tinjauan"
                deskripsi="Draft dari staff. Stok belum berubah."
              />
              <PanelTinjauan draft={draft} />
            </Kartu>
          ) : null}

          <Kartu>
            <KepalaKartu
              judul="Riwayat opname"
              deskripsi={bolehTinjau ? 'Yang sudah ditinjau.' : 'Termasuk pengajuan Anda.'}
            />
            {(bolehTinjau ? selesai : semua).length === 0 ? (
              <KondisiKosong
                judul="Belum ada stok opname"
                deskripsi="Hasil pencocokan stok akan muncul di sini."
              />
            ) : (
              <ul className="divide-y divide-beige-200">
                {(bolehTinjau ? selesai : semua).map((baris) => {
                  const selisih = Number(baris.selisih);
                  return (
                    <li key={baris.id} className="px-5 py-3.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
                        <p className="truncate text-sm font-medium text-tinta-900">
                          {baris.inventory_items?.nama ?? 'Bahan dihapus'}
                        </p>
                        <div className="flex items-center gap-2">
                          <BadgeNada nada={nadaStatus[baris.status]}>
                            {LABEL_STATUS_OPNAME[baris.status]}
                          </BadgeNada>
                          <span
                            className={cn(
                              'angka-tabel text-sm font-semibold',
                              selisih === 0
                                ? 'text-[var(--color-status-aman)]'
                                : selisih > 0
                                  ? 'text-kayu-600'
                                  : 'text-[var(--color-status-habis)]',
                            )}
                          >
                            {selisih > 0 ? '+' : ''}
                            {formatAngka(selisih)} {baris.inventory_items?.satuan ?? ''}
                          </span>
                        </div>
                      </div>

                      <p className="mt-1.5 text-xs text-tinta-500">
                        <span className="angka-tabel">
                          Sistem {formatAngka(baris.stok_sistem)} → fisik{' '}
                          {formatAngka(baris.stok_fisik)}
                        </span>
                        {baris.catatan ? ` · ${baris.catatan}` : ''}
                      </p>

                      {baris.catatan_peninjau ? (
                        <p className="mt-1 text-xs italic text-tinta-400">
                          Peninjau: {baris.catatan_peninjau}
                        </p>
                      ) : null}

                      <time
                        dateTime={baris.created_at}
                        className="mono-label mt-2 block text-tinta-300"
                      >
                        {formatTanggalWaktu(baris.created_at)}
                      </time>
                    </li>
                  );
                })}
              </ul>
            )}
          </Kartu>
        </div>
      </div>
    </>
  );
}
