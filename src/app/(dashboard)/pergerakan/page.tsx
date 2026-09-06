import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { JudulHalaman } from '@/components/layout/shell';
import {
  FormPergerakan,
  type BahanUntukPergerakan,
} from '@/components/pergerakan/form-pergerakan';
import { BadgeNetral } from '@/components/ui/badge';
import { Kartu, KepalaKartu } from '@/components/ui/card';
import { IkonNaik, IkonSeimbang, IkonTurun } from '@/components/ui/icons';
import { KondisiKosong } from '@/components/ui/states';
import { apakahManajer, wajibSesi } from '@/lib/auth/session';
import { TIPE_TRANSAKSI } from '@/lib/constants';
import { cn, formatAngka, formatTanggalWaktu } from '@/lib/utils';
import type { StockTransactionType } from '@/types/database';

export const metadata: Metadata = { title: 'Stok Masuk & Keluar' };
export const dynamic = 'force-dynamic';

interface BarisTransaksi {
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

export default async function HalamanPergerakan() {
  const { supabase, profile } = await wajibSesi();

  // Penjaga kedua setelah navigasi: halaman ini mengubah stok, jadi staff
  // tidak boleh sampai di sini walau mengetik alamatnya langsung.
  if (!apakahManajer(profile.role)) {
    redirect('/dashboard');
  }

  const [hasilBahan, hasilTerakhir] = await Promise.all([
    supabase
      .from('inventory_items')
      .select('id, nama, satuan, kategori, stok_saat_ini, harga_beli')
      .order('nama', { ascending: true })
      .limit(500)
      .returns<BahanUntukPergerakan[]>(),
    supabase
      .from('stock_transactions')
      .select(
        'id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, created_at, inventory_items(nama, satuan)',
      )
      .in('tipe', ['masuk', 'keluar'])
      .order('created_at', { ascending: false })
      .limit(15)
      .returns<BarisTransaksi[]>(),
  ]);

  const daftarBahan = (hasilBahan.data ?? []).map((bahan) => ({
    ...bahan,
    stok_saat_ini: Number(bahan.stok_saat_ini),
    harga_beli: Number(bahan.harga_beli),
  }));

  const terakhir = hasilTerakhir.data ?? [];

  return (
    <>
      <JudulHalaman
        label="Pergerakan stok"
        judul="Masuk & keluar"
        deskripsi="Catat penerimaan barang dan pemakaian bahan sebagai kejadian tersendiri, terpisah dari koreksi data di halaman inventori."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Kartu>
          <KepalaKartu
            judul="Catat pergerakan"
            deskripsi="Stok langsung berubah setelah disimpan."
          />
          <FormPergerakan daftarBahan={daftarBahan} />
        </Kartu>

        <Kartu>
          <KepalaKartu
            judul="Pergerakan terakhir"
            deskripsi="15 penerimaan dan pemakaian paling akhir."
          />
          {terakhir.length === 0 ? (
            <KondisiKosong
              judul="Belum ada pergerakan"
              deskripsi="Penerimaan barang dan pemakaian bahan akan muncul di sini."
            />
          ) : (
            <ul className="divide-y divide-beige-200">
              {terakhir.map((baris) => {
                const { kelas, Ikon } = gayaTipe[baris.tipe];
                const satuan = baris.inventory_items?.satuan ?? '';
                return (
                  <li key={baris.id} className="flex items-start gap-3.5 px-5 py-3.5">
                    <span className={cn('mt-0.5 shrink-0', kelas)}>
                      <Ikon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate text-sm font-medium text-tinta-900">
                          {baris.inventory_items?.nama ?? 'Bahan dihapus'}
                        </p>
                        <BadgeNetral>{TIPE_TRANSAKSI[baris.tipe]}</BadgeNetral>
                      </div>
                      <p className="angka-tabel mt-1 text-xs text-tinta-500">
                        {formatAngka(baris.stok_sebelum)} → {formatAngka(baris.stok_sesudah)}{' '}
                        {satuan}
                        <span className="ml-1.5 text-tinta-300">
                          ({baris.tipe === 'keluar' ? '−' : '+'}
                          {formatAngka(baris.jumlah)})
                        </span>
                      </p>
                      {baris.catatan ? (
                        <p className="mt-1 text-xs text-tinta-400">{baris.catatan}</p>
                      ) : null}
                    </div>
                    <time
                      dateTime={baris.created_at}
                      className="mono-label shrink-0 whitespace-nowrap pt-1 text-tinta-300"
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
    </>
  );
}
