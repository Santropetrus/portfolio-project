import { BadgeNetral } from '@/components/ui/badge';
import { IkonNaik, IkonSeimbang, IkonTurun } from '@/components/ui/icons';
import { KondisiKosong } from '@/components/ui/states';
import { TIPE_TRANSAKSI } from '@/lib/constants';
import { cn, formatAngka, waktuRelatif } from '@/lib/utils';
import type { StockTransactionType } from '@/types/database';

export interface BarisAktivitas {
  id: string;
  tipe: StockTransactionType;
  jumlah: number;
  stok_sebelum: number;
  stok_sesudah: number;
  catatan: string | null;
  created_at: string;
  namaBahan: string;
  satuan: string;
}

const gayaTipe: Record<StockTransactionType, { kelas: string; Ikon: typeof IkonNaik }> = {
  masuk: { kelas: 'text-[var(--color-status-aman)]', Ikon: IkonNaik },
  keluar: { kelas: 'text-[var(--color-status-habis)]', Ikon: IkonTurun },
  penyesuaian: { kelas: 'text-kayu-600', Ikon: IkonSeimbang },
};

export function DaftarAktivitas({ data }: { data: BarisAktivitas[] }) {
  if (data.length === 0) {
    return (
      <KondisiKosong
        judul="Belum ada aktivitas stok"
        deskripsi="Perubahan stok akan tercatat otomatis di sini."
      />
    );
  }

  return (
    <ul className="divide-y divide-beige-200">
      {data.map((baris) => {
        const { kelas, Ikon } = gayaTipe[baris.tipe];
        return (
          <li key={baris.id} className="flex items-start gap-3 px-5 py-3.5">
            <span className={cn('mt-0.5 shrink-0', kelas)}>
              <Ikon className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="truncate text-sm font-medium text-tinta-900">{baris.namaBahan}</p>
                <BadgeNetral>{TIPE_TRANSAKSI[baris.tipe]}</BadgeNetral>
              </div>
              <p className="mt-1 text-xs text-tinta-500">
                <span className="angka-tabel">
                  {formatAngka(baris.stok_sebelum)} → {formatAngka(baris.stok_sesudah)}
                </span>{' '}
                {baris.satuan}
                {baris.catatan ? ` · ${baris.catatan}` : ''}
              </p>
            </div>

            <time
              dateTime={baris.created_at}
              className="mono-label shrink-0 whitespace-nowrap pt-1 text-tinta-300"
            >
              {waktuRelatif(baris.created_at)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
