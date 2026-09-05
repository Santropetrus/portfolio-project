import type { Metadata } from 'next';
import Link from 'next/link';

import { DaftarAktivitas, type BarisAktivitas } from '@/components/dashboard/aktivitas-terbaru';
import { KartuStatistik } from '@/components/dashboard/kartu-statistik';
import { JudulHalaman } from '@/components/layout/shell';
import { BadgeStatusStok } from '@/components/ui/badge';
import { IsiKartu, Kartu, KepalaKartu } from '@/components/ui/card';
import { IkonInventori, IkonKotak, IkonPeringatan, IkonNaik } from '@/components/ui/icons';
import { KondisiKosong } from '@/components/ui/states';
import { wajibSesi } from '@/lib/auth/session';
import { labelKategori } from '@/lib/constants';
import { formatAngka, formatRupiah, hariMenuju } from '@/lib/utils';
import type { InventoryItem, RingkasanInventori } from '@/types/database';

export const metadata: Metadata = { title: 'Dashboard' };

// Data stok berubah sering; jangan pernah disajikan dari cache statis.
export const dynamic = 'force-dynamic';

type BahanPerhatian = Pick<
  InventoryItem,
  'id' | 'nama' | 'kategori' | 'satuan' | 'stok_saat_ini' | 'stok_minimum' | 'status_stok' | 'tanggal_kedaluwarsa'
>;

interface TransaksiDenganBahan {
  id: string;
  tipe: BarisAktivitas['tipe'];
  jumlah: number;
  stok_sebelum: number;
  stok_sesudah: number;
  catatan: string | null;
  created_at: string;
  inventory_items: { nama: string; satuan: string } | null;
}

export default async function HalamanDashboard() {
  const { supabase, profile } = await wajibSesi();

  const [hasilRingkasan, hasilPerhatian, hasilAktivitas] = await Promise.all([
    supabase.rpc('ringkasan_inventori').single<RingkasanInventori>(),
    supabase
      .from('inventory_items')
      .select('id, nama, kategori, satuan, stok_saat_ini, stok_minimum, status_stok, tanggal_kedaluwarsa')
      .neq('status_stok', 'aman')
      .order('status_stok', { ascending: true })
      .order('stok_saat_ini', { ascending: true })
      .limit(8)
      .returns<BahanPerhatian[]>(),
    supabase
      .from('stock_transactions')
      .select('id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, created_at, inventory_items(nama, satuan)')
      .order('created_at', { ascending: false })
      .limit(8)
      .returns<TransaksiDenganBahan[]>(),
  ]);

  const ringkasan: RingkasanInventori = hasilRingkasan.data ?? {
    total_bahan: 0,
    stok_aman: 0,
    stok_menipis: 0,
    stok_habis: 0,
    nilai_persediaan: 0,
  };

  const perluPerhatian = hasilPerhatian.data ?? [];

  const aktivitas: BarisAktivitas[] = (hasilAktivitas.data ?? []).map((baris) => ({
    id: baris.id,
    tipe: baris.tipe,
    jumlah: Number(baris.jumlah),
    stok_sebelum: Number(baris.stok_sebelum),
    stok_sesudah: Number(baris.stok_sesudah),
    catatan: baris.catatan,
    created_at: baris.created_at,
    namaBahan: baris.inventory_items?.nama ?? 'Bahan dihapus',
    satuan: baris.inventory_items?.satuan ?? '',
  }));

  const jam = new Date().getHours();
  const sapaan = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 19 ? 'Selamat sore' : 'Selamat malam';

  return (
    <>
      <JudulHalaman
        judul={`${sapaan}, ${profile.nama.split(' ')[0]}`}
        deskripsi="Ringkasan kondisi bahan baku The Matcha Kyoto hari ini."
      />

      <section
        aria-label="Ringkasan stok"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KartuStatistik
          label="Total jenis bahan"
          nilai={formatAngka(ringkasan.total_bahan)}
          keterangan={`${formatAngka(ringkasan.stok_aman)} bahan berstatus aman`}
          ikon={<IkonInventori className="h-[18px] w-[18px]" />}
        />
        <KartuStatistik
          label="Stok menipis"
          nilai={formatAngka(ringkasan.stok_menipis)}
          keterangan="Sudah mencapai batas stok minimum"
          nada="menipis"
          ikon={<IkonPeringatan className="h-[18px] w-[18px]" />}
        />
        <KartuStatistik
          label="Stok habis"
          nilai={formatAngka(ringkasan.stok_habis)}
          keterangan="Perlu segera dipesan ulang"
          nada="habis"
          ikon={<IkonKotak className="h-[18px] w-[18px]" />}
        />
        <KartuStatistik
          label="Nilai persediaan"
          nilai={formatRupiah(ringkasan.nilai_persediaan)}
          keterangan="Stok saat ini × harga beli per unit"
          nada="kayu"
          ikon={<IkonNaik className="h-[18px] w-[18px]" />}
        />
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <Kartu>
          <KepalaKartu
            judul="Perlu perhatian"
            deskripsi="Bahan dengan stok menipis atau habis."
            aksi={
              <Link
                href="/inventori"
                className="text-sm font-medium text-matcha-700 underline-offset-4 hover:underline"
              >
                Lihat inventori
              </Link>
            }
          />
          {perluPerhatian.length === 0 ? (
            <KondisiKosong
              judul="Semua stok aman"
              deskripsi="Tidak ada bahan yang berada di bawah batas minimum."
            />
          ) : (
            <ul className="divide-y divide-beige-200">
              {perluPerhatian.map((bahan) => {
                const sisaHari = hariMenuju(bahan.tanggal_kedaluwarsa);
                return (
                  <li
                    key={bahan.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-tinta-800">{bahan.nama}</p>
                      <p className="mt-0.5 text-xs text-tinta-500">
                        {labelKategori(bahan.kategori)} · sisa {formatAngka(bahan.stok_saat_ini)}{' '}
                        {bahan.satuan} dari minimum {formatAngka(bahan.stok_minimum)}
                        {sisaHari !== null && sisaHari <= 30
                          ? sisaHari < 0
                            ? ' · sudah kedaluwarsa'
                            : ` · kedaluwarsa ${sisaHari} hari lagi`
                          : ''}
                      </p>
                    </div>
                    <BadgeStatusStok status={bahan.status_stok} />
                  </li>
                );
              })}
            </ul>
          )}
        </Kartu>

        <Kartu>
          <KepalaKartu
            judul="Aktivitas terbaru"
            deskripsi="Delapan perubahan stok paling akhir."
            aksi={
              <Link
                href="/riwayat-stok"
                className="text-sm font-medium text-matcha-700 underline-offset-4 hover:underline"
              >
                Riwayat lengkap
              </Link>
            }
          />
          <DaftarAktivitas data={aktivitas} />
        </Kartu>
      </div>

      {hasilRingkasan.error ? (
        <IsiKartu className="mt-4 text-sm text-[var(--color-status-habis)]">
          Sebagian data ringkasan gagal dimuat. Muat ulang halaman untuk mencoba lagi.
        </IsiKartu>
      ) : null}
    </>
  );
}
