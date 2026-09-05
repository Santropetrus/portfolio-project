import type { Metadata } from 'next';

import { JudulHalaman } from '@/components/layout/shell';
import { FormOpname, type BahanUntukOpname } from '@/components/opname/form-opname';
import { Kartu, KepalaKartu } from '@/components/ui/card';
import { IkonInfo } from '@/components/ui/icons';
import { KondisiKosong } from '@/components/ui/states';
import { apakahManajer, wajibSesi } from '@/lib/auth/session';
import { formatAngka, formatTanggalWaktu } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Stok Opname' };
export const dynamic = 'force-dynamic';

interface RiwayatOpname {
  id: string;
  stok_sistem: number;
  stok_fisik: number;
  selisih: number;
  catatan: string | null;
  created_at: string;
  inventory_items: { nama: string; satuan: string } | null;
}

export default async function HalamanStokOpname() {
  const { supabase, profile } = await wajibSesi();
  const bolehOpname = apakahManajer(profile.role);

  const [hasilBahan, hasilRiwayat] = await Promise.all([
    supabase
      .from('inventory_items')
      .select('id, nama, satuan, kategori, stok_saat_ini')
      .order('nama', { ascending: true })
      .limit(500)
      .returns<BahanUntukOpname[]>(),
    supabase
      .from('stock_opnames')
      .select('id, stok_sistem, stok_fisik, selisih, catatan, created_at, inventory_items(nama, satuan)')
      .order('created_at', { ascending: false })
      .limit(15)
      .returns<RiwayatOpname[]>(),
  ]);

  const daftarBahan = (hasilBahan.data ?? []).map((bahan) => ({
    ...bahan,
    stok_saat_ini: Number(bahan.stok_saat_ini),
  }));
  const riwayat = hasilRiwayat.data ?? [];

  return (
    <>
      <JudulHalaman
        judul="Stok Opname"
        deskripsi="Cocokkan stok fisik hasil hitungan dengan stok yang tercatat di sistem."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Kartu>
          <KepalaKartu
            judul="Catat hasil hitung"
            deskripsi="Stok bahan langsung disesuaikan setelah opname disimpan."
          />
          {bolehOpname ? (
            <FormOpname daftarBahan={daftarBahan} />
          ) : (
            <div className="flex items-start gap-3 px-5 py-6">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-beige-100 text-kayu-600">
                <IkonInfo className="h-5 w-5" />
              </span>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-tinta-800">Akses terbatas</p>
                <p className="text-tinta-500">
                  Sebagai <strong>staff</strong>, Anda dapat melihat hasil stok opname tetapi belum
                  dapat mencatatnya. Hubungi owner atau admin untuk menyimpan hasil hitungan.
                </p>
              </div>
            </div>
          )}
        </Kartu>

        <Kartu>
          <KepalaKartu judul="Riwayat opname" deskripsi="15 pencatatan terakhir." />
          {riwayat.length === 0 ? (
            <KondisiKosong
              judul="Belum ada stok opname"
              deskripsi="Hasil pencocokan stok akan muncul di sini."
            />
          ) : (
            <ul className="divide-y divide-beige-200">
              {riwayat.map((baris) => {
                const selisih = Number(baris.selisih);
                return (
                  <li key={baris.id} className="px-5 py-3.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="truncate text-sm font-medium text-tinta-800">
                        {baris.inventory_items?.nama ?? 'Bahan dihapus'}
                      </p>
                      <span
                        className={cn(
                          'text-sm font-semibold tabular-nums',
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
                    <p className="mt-0.5 text-xs text-tinta-500">
                      Sistem {formatAngka(baris.stok_sistem)} → fisik {formatAngka(baris.stok_fisik)}
                      {baris.catatan ? ` · ${baris.catatan}` : ''}
                    </p>
                    <time dateTime={baris.created_at} className="mt-1 block text-xs text-tinta-400">
                      {formatTanggalWaktu(baris.created_at)}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </Kartu>
      </div>
    </>
  );
}
