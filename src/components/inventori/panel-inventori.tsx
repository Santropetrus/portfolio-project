'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { BadgeNetral, BadgeStatusStok } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { IkonHapus, IkonPeringatan, IkonTambah, IkonUbah } from '@/components/ui/icons';
import { KondisiKosong } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { labelKategori } from '@/lib/constants';
import { formatAngka, formatRupiah, formatTanggal, hariMenuju } from '@/lib/utils';
import { aksiHapusBahan } from '@/server/actions/inventori';
import type { InventoryItem } from '@/types/database';
import { FormBahan } from './form-bahan';

interface PanelInventoriProps {
  data: InventoryItem[];
  bolehKelola: boolean;
  adaFilterAktif: boolean;
}

export function PanelInventori({ data, bolehKelola, adaFilterAktif }: PanelInventoriProps) {
  const router = useRouter();
  const { tampilkan } = useToast();
  const [pendingHapus, startHapus] = useTransition();

  const [dialogForm, setDialogForm] = useState<{ terbuka: boolean; bahan: InventoryItem | null }>({
    terbuka: false,
    bahan: null,
  });
  const [bahanDihapus, setBahanDihapus] = useState<InventoryItem | null>(null);

  function tutupForm() {
    setDialogForm({ terbuka: false, bahan: null });
    router.refresh();
  }

  function konfirmasiHapus() {
    if (!bahanDihapus) return;
    const target = bahanDihapus;

    startHapus(async () => {
      const hasil = await aksiHapusBahan({ id: target.id });
      if (hasil.sukses) {
        tampilkan({ tipe: 'sukses', judul: 'Bahan dihapus', deskripsi: hasil.pesan });
        setBahanDihapus(null);
        router.refresh();
      } else {
        tampilkan({ tipe: 'gagal', judul: 'Gagal menghapus', deskripsi: hasil.pesan });
      }
    });
  }

  if (data.length === 0) {
    return (
      <>
        <KondisiKosong
          judul={adaFilterAktif ? 'Tidak ada bahan yang cocok' : 'Belum ada bahan baku'}
          deskripsi={
            adaFilterAktif
              ? 'Coba ubah kata kunci atau hapus filter yang sedang aktif.'
              : bolehKelola
                ? 'Tambahkan bahan baku pertama untuk mulai memantau stok.'
                : 'Owner atau admin belum menambahkan data bahan baku.'
          }
          aksi={
            bolehKelola && !adaFilterAktif ? (
              <Button onClick={() => setDialogForm({ terbuka: true, bahan: null })}>
                <IkonTambah className="h-4 w-4" />
                Tambah bahan
              </Button>
            ) : null
          }
        />
        <DialogForm
          state={dialogForm}
          onTutup={() => setDialogForm({ terbuka: false, bahan: null })}
          onSelesai={tutupForm}
        />
      </>
    );
  }

  return (
    <>
      {bolehKelola ? (
        <div className="flex justify-end border-b border-beige-200 px-5 py-3">
          <Button ukuran="sm" onClick={() => setDialogForm({ terbuka: true, bahan: null })}>
            <IkonTambah className="h-4 w-4" />
            Tambah bahan
          </Button>
        </div>
      ) : null}

      {/* Tampilan kartu untuk layar kecil */}
      <ul className="divide-y divide-beige-200 md:hidden">
        {data.map((bahan) => (
          <li key={bahan.id} className="space-y-2.5 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-tinta-800">{bahan.nama}</p>
                <p className="mt-0.5 text-xs text-tinta-500">{labelKategori(bahan.kategori)}</p>
              </div>
              <BadgeStatusStok status={bahan.status_stok} />
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div>
                <dt className="text-tinta-400">Stok saat ini</dt>
                <dd className="font-medium text-tinta-700">
                  {formatAngka(bahan.stok_saat_ini)} {bahan.satuan}
                </dd>
              </div>
              <div>
                <dt className="text-tinta-400">Stok minimum</dt>
                <dd className="text-tinta-700">
                  {formatAngka(bahan.stok_minimum)} {bahan.satuan}
                </dd>
              </div>
              <div>
                <dt className="text-tinta-400">Harga beli</dt>
                <dd className="text-tinta-700">{formatRupiah(bahan.harga_beli)}</dd>
              </div>
              <div>
                <dt className="text-tinta-400">Supplier</dt>
                <dd className="truncate text-tinta-700">{bahan.supplier ?? '—'}</dd>
              </div>
            </dl>

            {bolehKelola ? (
              <div className="flex gap-2 pt-1">
                <Button
                  varian="garis"
                  ukuran="sm"
                  onClick={() => setDialogForm({ terbuka: true, bahan })}
                >
                  <IkonUbah className="h-4 w-4" />
                  Ubah
                </Button>
                <Button varian="hantu" ukuran="sm" onClick={() => setBahanDihapus(bahan)}>
                  <IkonHapus className="h-4 w-4" />
                  Hapus
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {/* Tabel untuk layar sedang ke atas */}
      <div className="scroll-halus hidden overflow-x-auto md:block">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <caption className="sr-only">Daftar bahan baku The Matcha Kyoto</caption>
          <thead>
            <tr className="border-b border-beige-200 bg-beige-100/50 text-left text-xs uppercase tracking-wide text-tinta-500">
              <th scope="col" className="px-5 py-3 font-medium">Bahan</th>
              <th scope="col" className="px-4 py-3 font-medium">Kategori</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Stok</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Minimum</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Harga beli</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              {bolehKelola ? (
                <th scope="col" className="px-5 py-3 text-right font-medium">Aksi</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-200">
            {data.map((bahan) => {
              const sisaHari = hariMenuju(bahan.tanggal_kedaluwarsa);
              return (
                <tr key={bahan.id} className="transition-colors hover:bg-beige-100/40">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-tinta-800">{bahan.nama}</p>
                    <p className="mt-0.5 text-xs text-tinta-400">
                      {bahan.supplier ?? 'Tanpa supplier'}
                      {bahan.tanggal_kedaluwarsa
                        ? ` · kedaluwarsa ${formatTanggal(bahan.tanggal_kedaluwarsa)}`
                        : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <BadgeNetral>{labelKategori(bahan.kategori)}</BadgeNetral>
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-tinta-800 tabular-nums">
                    {formatAngka(bahan.stok_saat_ini)}{' '}
                    <span className="text-xs font-normal text-tinta-400">{bahan.satuan}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-tinta-500 tabular-nums">
                    {formatAngka(bahan.stok_minimum)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-tinta-600 tabular-nums">
                    {formatRupiah(bahan.harga_beli)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col items-start gap-1">
                      <BadgeStatusStok status={bahan.status_stok} />
                      {sisaHari !== null && sisaHari <= 30 ? (
                        <span className="text-[0.7rem] text-kayu-600">
                          {sisaHari < 0 ? 'Sudah kedaluwarsa' : `${sisaHari} hari lagi`}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  {bolehKelola ? (
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button
                          varian="hantu"
                          ukuran="ikon"
                          aria-label={`Ubah ${bahan.nama}`}
                          onClick={() => setDialogForm({ terbuka: true, bahan })}
                        >
                          <IkonUbah className="h-4 w-4" />
                        </Button>
                        <Button
                          varian="hantu"
                          ukuran="ikon"
                          aria-label={`Hapus ${bahan.nama}`}
                          className="text-[var(--color-status-habis)] hover:bg-[var(--color-status-habis-bg)]"
                          onClick={() => setBahanDihapus(bahan)}
                        >
                          <IkonHapus className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <DialogForm
        state={dialogForm}
        onTutup={() => setDialogForm({ terbuka: false, bahan: null })}
        onSelesai={tutupForm}
      />

      <Dialog
        terbuka={bahanDihapus !== null}
        onTutup={() => setBahanDihapus(null)}
        judul="Hapus bahan baku?"
        lebar="sm"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl bg-[var(--color-status-habis-bg)] px-4 py-3.5">
            <IkonPeringatan className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-status-habis)]" />
            <div className="text-sm text-tinta-700">
              <p>
                Bahan <strong className="font-semibold">{bahanDihapus?.nama}</strong> akan dihapus
                permanen beserta riwayat stoknya.
              </p>
              <p className="mt-1.5 text-xs text-tinta-500">
                Catatan audit log tetap tersimpan sebagai bukti siapa yang menghapus dan kapan.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button varian="garis" onClick={() => setBahanDihapus(null)} disabled={pendingHapus}>
              Batal
            </Button>
            <Button varian="bahaya" onClick={konfirmasiHapus} sedangMemuat={pendingHapus}>
              Ya, hapus bahan
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function DialogForm({
  state,
  onTutup,
  onSelesai,
}: {
  state: { terbuka: boolean; bahan: InventoryItem | null };
  onTutup: () => void;
  onSelesai: () => void;
}) {
  return (
    <Dialog
      terbuka={state.terbuka}
      onTutup={onTutup}
      judul={state.bahan ? 'Ubah bahan baku' : 'Tambah bahan baku'}
      deskripsi={
        state.bahan
          ? 'Perubahan stok akan otomatis tercatat di riwayat.'
          : 'Lengkapi data bahan baku baru untuk The Matcha Kyoto.'
      }
    >
      {state.terbuka ? (
        <FormBahan key={state.bahan?.id ?? 'baru'} bahan={state.bahan} onSelesai={onSelesai} />
      ) : null}
    </Dialog>
  );
}
