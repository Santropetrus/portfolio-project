import type { Metadata } from 'next';

import { JudulHalaman } from '@/components/layout/shell';
import { BadgeNetral } from '@/components/ui/badge';
import { Kartu } from '@/components/ui/card';
import { IkonNaik, IkonSeimbang, IkonTurun } from '@/components/ui/icons';
import { Paginasi } from '@/components/ui/paginasi';
import { KondisiError, KondisiKosong } from '@/components/ui/states';
import { wajibSesi } from '@/lib/auth/session';
import { TIPE_TRANSAKSI, UKURAN_HALAMAN } from '@/lib/constants';
import { bacaHalaman } from '@/lib/query';
import { cn, formatAngka, formatTanggalWaktu } from '@/lib/utils';
import type { StockTransactionType } from '@/types/database';

export const metadata: Metadata = { title: 'Riwayat Stok' };
export const dynamic = 'force-dynamic';

interface BarisRiwayat {
  id: string;
  tipe: StockTransactionType;
  jumlah: number;
  stok_sebelum: number;
  stok_sesudah: number;
  catatan: string | null;
  created_at: string;
  inventory_items: { nama: string; satuan: string } | null;
}

const gayaTipe: Record<StockTransactionType, { kelas: string; Ikon: typeof IkonNaik }> = {
  masuk: { kelas: 'text-[var(--color-status-aman)]', Ikon: IkonNaik },
  keluar: { kelas: 'text-[var(--color-status-habis)]', Ikon: IkonTurun },
  penyesuaian: { kelas: 'text-kayu-600', Ikon: IkonSeimbang },
};

export default async function HalamanRiwayatStok({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await wajibSesi();
  const params = await searchParams;

  const halaman = bacaHalaman(params.halaman);
  const dari = (halaman - 1) * UKURAN_HALAMAN;

  const { data, error, count } = await supabase
    .from('stock_transactions')
    .select(
      'id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, created_at, inventory_items(nama, satuan)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(dari, dari + UKURAN_HALAMAN - 1)
    .returns<BarisRiwayat[]>();

  const totalHalaman = Math.max(1, Math.ceil((count ?? 0) / UKURAN_HALAMAN));

  return (
    <>
      <JudulHalaman
        label="Riwayat stok"
        judul="Jejak perubahan"
        deskripsi="Seluruh perubahan stok tercatat otomatis oleh database dan tidak dapat diubah maupun dihapus dari aplikasi."
      />

      <Kartu>
        {error ? (
          <KondisiError deskripsi="Riwayat stok gagal dimuat. Silakan muat ulang halaman." />
        ) : (data ?? []).length === 0 ? (
          <KondisiKosong
            judul="Belum ada riwayat stok"
            deskripsi="Setiap penambahan, pengurangan, dan penyesuaian stok akan muncul di sini."
          />
        ) : (
          <>
            <ul className="divide-y divide-beige-200">
              {(data ?? []).map((baris) => {
                const { kelas, Ikon } = gayaTipe[baris.tipe];
                const satuan = baris.inventory_items?.satuan ?? '';
                return (
                  <li key={baris.id} className="flex items-start gap-3.5 px-5 py-4">
                    <span className={cn('mt-1 shrink-0', kelas)}>
                      <Ikon className="h-4 w-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate text-sm font-medium text-tinta-900">
                          {baris.inventory_items?.nama ?? 'Bahan sudah dihapus'}
                        </p>
                        <BadgeNetral>{TIPE_TRANSAKSI[baris.tipe]}</BadgeNetral>
                      </div>

                      <p className="angka-tabel mt-1.5 text-sm text-tinta-600">
                        {formatAngka(baris.stok_sebelum)} {satuan} →{' '}
                        <strong className="font-semibold text-tinta-900">
                          {formatAngka(baris.stok_sesudah)} {satuan}
                        </strong>
                        <span className="ml-2 text-xs text-tinta-300">
                          ({baris.tipe === 'keluar' ? '−' : '+'}
                          {formatAngka(baris.jumlah)})
                        </span>
                      </p>

                      {baris.catatan ? (
                        <p className="mt-1 text-xs text-tinta-500">{baris.catatan}</p>
                      ) : null}
                    </div>

                    <time
                      dateTime={baris.created_at}
                      className="mono-label shrink-0 whitespace-nowrap pt-1.5 text-tinta-300"
                    >
                      {formatTanggalWaktu(baris.created_at)}
                    </time>
                  </li>
                );
              })}
            </ul>

            {totalHalaman > 1 ? (
              <Paginasi halaman={halaman} totalHalaman={totalHalaman} total={count ?? 0} />
            ) : null}
          </>
        )}
      </Kartu>
    </>
  );
}
