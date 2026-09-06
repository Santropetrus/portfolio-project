import type { Metadata } from 'next';

import { FilterInventori } from '@/components/inventori/filter-inventori';
import { PanelInventori } from '@/components/inventori/panel-inventori';
import { JudulHalaman } from '@/components/layout/shell';
import { Kartu } from '@/components/ui/card';
import { KondisiError } from '@/components/ui/states';
import { apakahManajer, wajibSesi } from '@/lib/auth/session';
import { KATEGORI_VALUES, STATUS_STOK, UKURAN_HALAMAN } from '@/lib/constants';
import { amankanPolaPencarian, bacaHalaman, bacaParamTunggal } from '@/lib/query';
import { Paginasi } from '@/components/ui/paginasi';
import type { InventoryCategory, InventoryItem, StockStatus } from '@/types/database';

export const metadata: Metadata = { title: 'Inventori' };
export const dynamic = 'force-dynamic';

type ParamPencarian = Promise<Record<string, string | string[] | undefined>>;

export default async function HalamanInventori({
  searchParams,
}: {
  searchParams: ParamPencarian;
}) {
  const { supabase, profile } = await wajibSesi();
  const params = await searchParams;

  const kataKunciMentah = bacaParamTunggal(params.q).trim();
  const kataKunci = amankanPolaPencarian(kataKunciMentah);

  // Nilai filter divalidasi terhadap daftar yang diizinkan; nilai lain diabaikan.
  const kategoriParam = bacaParamTunggal(params.kategori);
  const kategori = (KATEGORI_VALUES as readonly string[]).includes(kategoriParam)
    ? (kategoriParam as InventoryCategory)
    : null;

  const statusParam = bacaParamTunggal(params.status);
  const status = STATUS_STOK.some((s) => s.value === statusParam)
    ? (statusParam as StockStatus)
    : null;

  const halaman = bacaHalaman(params.halaman);
  const dari = (halaman - 1) * UKURAN_HALAMAN;

  let kueri = supabase
    .from('inventory_items')
    .select('*', { count: 'exact' })
    .order('nama', { ascending: true })
    .range(dari, dari + UKURAN_HALAMAN - 1);

  if (kataKunci) {
    kueri = kueri.or(`nama.ilike.%${kataKunci}%,supplier.ilike.%${kataKunci}%`);
  }
  if (kategori) kueri = kueri.eq('kategori', kategori);
  if (status) kueri = kueri.eq('status_stok', status);

  const { data, error, count } = await kueri.returns<InventoryItem[]>();

  const bolehKelola = apakahManajer(profile.role);
  const adaFilterAktif = Boolean(kataKunciMentah || kategori || status);
  const totalHalaman = Math.max(1, Math.ceil((count ?? 0) / UKURAN_HALAMAN));

  return (
    <>
      <JudulHalaman
        label="Inventori"
        judul="Bahan baku"
        deskripsi={
          bolehKelola
            ? 'Seluruh bahan baku The Matcha Kyoto. Untuk mencatat barang datang atau bahan terpakai, gunakan halaman Stok Masuk & Keluar.'
            : 'Daftar bahan baku. Sebagai staff, Anda memiliki akses baca saja.'
        }
      />

      <Kartu>
        <FilterInventori />

        {error ? (
          <KondisiError deskripsi="Data inventori gagal dimuat. Silakan muat ulang halaman." />
        ) : (
          <>
            <PanelInventori
              data={data ?? []}
              bolehKelola={bolehKelola}
              adaFilterAktif={adaFilterAktif}
            />
            {totalHalaman > 1 ? (
              <Paginasi halaman={halaman} totalHalaman={totalHalaman} total={count ?? 0} />
            ) : null}
          </>
        )}
      </Kartu>
    </>
  );
}
