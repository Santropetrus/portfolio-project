'use client';

import { useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/field';
import { IkonNaik, IkonTurun } from '@/components/ui/icons';
import { useToast } from '@/components/ui/toast';
import { TIPE_PERGERAKAN, labelKategori } from '@/lib/constants';
import { cn, formatAngka } from '@/lib/utils';
import {
  nilaiAwalPergerakan,
  skemaPergerakanStok,
  type MasukanPergerakanStok,
  type NilaiPergerakanStok,
} from '@/lib/validation/pergerakan';
import { aksiCatatPergerakan } from '@/server/actions/pergerakan';

export interface BahanUntukPergerakan {
  id: string;
  nama: string;
  satuan: string;
  kategori: Parameters<typeof labelKategori>[0];
  stok_saat_ini: number;
  harga_beli: number;
}

export function FormPergerakan({ daftarBahan }: { daftarBahan: BahanUntukPergerakan[] }) {
  const router = useRouter();
  const { tampilkan } = useToast();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<MasukanPergerakanStok, unknown, NilaiPergerakanStok>({
    resolver: zodResolver(skemaPergerakanStok),
    defaultValues: nilaiAwalPergerakan,
  });

  const idTerpilih = useWatch({ control, name: 'inventory_item_id' });
  const tipe = useWatch({ control, name: 'tipe' });
  const jumlahInput = useWatch({ control, name: 'jumlah' });

  const bahan = useMemo(
    () => daftarBahan.find((b) => b.id === idTerpilih) ?? null,
    [daftarBahan, idTerpilih],
  );

  // Pratinjau saja; angka sebenarnya dihitung ulang database saat menyimpan.
  const stokSesudah = useMemo(() => {
    if (!bahan) return null;
    const jumlah = Number(String(jumlahInput ?? '').replace(',', '.'));
    if (!Number.isFinite(jumlah) || String(jumlahInput ?? '').trim() === '') return null;
    return tipe === 'masuk' ? bahan.stok_saat_ini + jumlah : bahan.stok_saat_ini - jumlah;
  }, [bahan, jumlahInput, tipe]);

  const kurang = stokSesudah !== null && stokSesudah < 0;

  const kirim = handleSubmit((nilai) => {
    startTransition(async () => {
      const hasil = await aksiCatatPergerakan(nilai);

      if (!hasil.sukses) {
        for (const [field, pesan] of Object.entries(hasil.errorField ?? {})) {
          if (field in nilai) {
            setError(field as keyof MasukanPergerakanStok, {
              type: 'server',
              message: String(pesan),
            });
          }
        }
        tampilkan({ tipe: 'gagal', judul: 'Gagal mencatat', deskripsi: hasil.pesan });
        return;
      }

      tampilkan({ tipe: 'sukses', judul: 'Tercatat', deskripsi: hasil.pesan });
      reset(nilaiAwalPergerakan);
      router.refresh();
    });
  });

  if (daftarBahan.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-tinta-500">
        Belum ada bahan baku. Tambahkan bahan di halaman Inventori terlebih dahulu.
      </p>
    );
  }

  return (
    <form onSubmit={kirim} noValidate className="space-y-5 px-5 py-5">
      <Select label="Jenis pergerakan" wajib error={errors.tipe?.message} {...register('tipe')}>
        {TIPE_PERGERAKAN.map((butir) => (
          <option key={butir.value} value={butir.value}>
            {butir.label}
          </option>
        ))}
      </Select>

      <p className="mono-label text-tinta-400">
        {TIPE_PERGERAKAN.find((b) => b.value === tipe)?.deskripsi}
      </p>

      <Select
        label="Bahan baku"
        wajib
        error={errors.inventory_item_id?.message}
        {...register('inventory_item_id')}
      >
        <option value="">— Pilih bahan —</option>
        {daftarBahan.map((butir) => (
          <option key={butir.id} value={butir.id}>
            {butir.nama} ({labelKategori(butir.kategori)})
          </option>
        ))}
      </Select>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-beige-300 bg-beige-100/40 px-4 py-3">
          <p className="mono-label text-tinta-400">Stok sekarang</p>
          <p className="angka-besar mt-2 text-2xl text-tinta-900">
            {bahan ? formatAngka(bahan.stok_saat_ini) : '—'}
            {bahan ? (
              <span className="mono-label ml-1.5 font-normal text-tinta-400">{bahan.satuan}</span>
            ) : null}
          </p>
        </div>

        <Input
          label="Jumlah"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0"
          wajib
          disabled={!bahan}
          petunjuk={bahan ? `Dalam satuan ${bahan.satuan}.` : 'Pilih bahan dulu.'}
          error={errors.jumlah?.message}
          {...register('jumlah')}
        />
      </div>

      {stokSesudah !== null ? (
        <div
          className={cn(
            'flex items-start gap-3 border px-4 py-3.5',
            kurang
              ? 'border-[var(--color-status-habis)]/25 bg-[var(--color-status-habis-bg)] text-[var(--color-status-habis)]'
              : tipe === 'masuk'
                ? 'border-[var(--color-status-aman)]/25 bg-[var(--color-status-aman-bg)] text-[var(--color-status-aman)]'
                : 'border-kayu-300/50 bg-kayu-100 text-kayu-700',
          )}
        >
          {tipe === 'masuk' ? (
            <IkonNaik className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <IkonTurun className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div>
            <p className="mono-label">
              {kurang
                ? 'Stok tidak mencukupi'
                : `Stok menjadi ${formatAngka(stokSesudah)} ${bahan?.satuan ?? ''}`}
            </p>
            <p className="mt-1 text-[0.8rem] leading-relaxed opacity-85">
              {kurang
                ? 'Jumlah pemakaian melebihi persediaan. Database akan menolak pencatatan ini.'
                : `Dari ${formatAngka(bahan?.stok_saat_ini ?? 0)} ${bahan?.satuan ?? ''}.`}
            </p>
          </div>
        </div>
      ) : null}

      {tipe === 'masuk' ? (
        <Input
          label="Harga beli per unit"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="Kosongkan bila tidak berubah"
          awalan="Rp"
          petunjuk="Bila diisi, harga beli bahan ini ikut diperbarui."
          error={errors.harga_beli?.message}
          {...register('harga_beli')}
        />
      ) : null}

      <Textarea
        label="Catatan"
        placeholder={
          tipe === 'masuk'
            ? 'Contoh: kiriman mingguan dari Uji Tea Trading, faktur 00123.'
            : 'Contoh: pemakaian shift pagi, atau bahan rusak.'
        }
        petunjuk="Opsional, tetapi membantu saat menelusuri riwayat."
        error={errors.catatan?.message}
        {...register('catatan')}
      />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          varian="garis"
          disabled={pending}
          onClick={() => reset(nilaiAwalPergerakan)}
        >
          Bersihkan
        </Button>
        <Button type="submit" sedangMemuat={pending} disabled={!bahan || kurang}>
          {tipe === 'masuk' ? 'Catat penerimaan' : 'Catat pemakaian'}
        </Button>
      </div>
    </form>
  );
}
