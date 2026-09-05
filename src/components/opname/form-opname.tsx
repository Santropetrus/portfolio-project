'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/field';
import { IkonNaik, IkonSeimbang, IkonTurun } from '@/components/ui/icons';
import { useToast } from '@/components/ui/toast';
import { labelKategori } from '@/lib/constants';
import { cn, formatAngka } from '@/lib/utils';
import {
  nilaiAwalStokOpname,
  skemaStokOpname,
  type MasukanStokOpname,
  type NilaiStokOpname,
} from '@/lib/validation/opname';
import { aksiCatatOpname } from '@/server/actions/opname';

export interface BahanUntukOpname {
  id: string;
  nama: string;
  satuan: string;
  kategori: Parameters<typeof labelKategori>[0];
  stok_saat_ini: number;
}

export function FormOpname({ daftarBahan }: { daftarBahan: BahanUntukOpname[] }) {
  const router = useRouter();
  const { tampilkan } = useToast();
  const [pending, startTransition] = useTransition();
  const [terakhirDisimpan, setTerakhirDisimpan] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<MasukanStokOpname, unknown, NilaiStokOpname>({
    resolver: zodResolver(skemaStokOpname),
    defaultValues: nilaiAwalStokOpname,
  });

  const idTerpilih = useWatch({ control, name: 'inventory_item_id' });
  const stokFisikInput = useWatch({ control, name: 'stok_fisik' });

  const bahanTerpilih = useMemo(
    () => daftarBahan.find((bahan) => bahan.id === idTerpilih) ?? null,
    [daftarBahan, idTerpilih],
  );

  // Selisih dihitung ulang di database saat menyimpan; nilai di sini hanya
  // pratinjau agar pengguna tahu dampaknya sebelum menekan simpan.
  const selisih = useMemo(() => {
    if (!bahanTerpilih) return null;
    const fisik = Number(String(stokFisikInput ?? '').replace(',', '.'));
    if (!Number.isFinite(fisik) || String(stokFisikInput ?? '').trim() === '') return null;
    return Number((fisik - bahanTerpilih.stok_saat_ini).toFixed(2));
  }, [bahanTerpilih, stokFisikInput]);

  const kirim = handleSubmit((nilai) => {
    startTransition(async () => {
      const hasil = await aksiCatatOpname(nilai);

      if (!hasil.sukses) {
        for (const [field, pesan] of Object.entries(hasil.errorField ?? {})) {
          if (field in nilai) {
            setError(field as keyof MasukanStokOpname, { type: 'server', message: pesan });
          }
        }
        tampilkan({ tipe: 'gagal', judul: 'Gagal menyimpan opname', deskripsi: hasil.pesan });
        return;
      }

      tampilkan({ tipe: 'sukses', judul: 'Stok opname tersimpan', deskripsi: hasil.pesan });
      setTerakhirDisimpan(bahanTerpilih?.nama ?? null);
      reset(nilaiAwalStokOpname);
      router.refresh();
    });
  });

  if (daftarBahan.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-tinta-500">
        Belum ada bahan baku yang bisa diopname. Tambahkan bahan di halaman Inventori terlebih
        dahulu.
      </p>
    );
  }

  return (
    <form onSubmit={kirim} noValidate className="space-y-5 px-5 py-5">
      <Select
        label="Pilih bahan baku"
        wajib
        error={errors.inventory_item_id?.message}
        {...register('inventory_item_id')}
      >
        <option value="">— Pilih bahan —</option>
        {daftarBahan.map((bahan) => (
          <option key={bahan.id} value={bahan.id}>
            {bahan.nama} ({labelKategori(bahan.kategori)})
          </option>
        ))}
      </Select>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-beige-200 bg-beige-100/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-tinta-400">Stok sistem</p>
          <p className="mt-1.5 font-serif text-2xl text-tinta-900">
            {bahanTerpilih ? formatAngka(bahanTerpilih.stok_saat_ini) : '—'}
            {bahanTerpilih ? (
              <span className="ml-1.5 font-sans text-sm font-normal text-tinta-400">
                {bahanTerpilih.satuan}
              </span>
            ) : null}
          </p>
        </div>

        <Input
          label="Stok fisik hasil hitung"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0"
          wajib
          disabled={!bahanTerpilih}
          petunjuk={bahanTerpilih ? `Dalam satuan ${bahanTerpilih.satuan}.` : 'Pilih bahan dulu.'}
          error={errors.stok_fisik?.message}
          {...register('stok_fisik')}
        />
      </div>

      <PratinjauSelisih selisih={selisih} satuan={bahanTerpilih?.satuan ?? ''} />

      <Textarea
        label="Catatan"
        placeholder="Contoh: ada tumpahan saat produksi, atau sisa kemasan rusak."
        petunjuk="Opsional, tetapi sangat membantu saat menelusuri selisih."
        error={errors.catatan?.message}
        {...register('catatan')}
      />

      {terakhirDisimpan ? (
        <p className="text-xs text-[var(--color-status-aman)]">
          Opname terakhir tersimpan untuk “{terakhirDisimpan}”.
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          varian="garis"
          disabled={pending}
          onClick={() => {
            reset(nilaiAwalStokOpname);
            setTerakhirDisimpan(null);
          }}
        >
          Bersihkan
        </Button>
        <Button type="submit" sedangMemuat={pending} disabled={!bahanTerpilih}>
          Simpan stok opname
        </Button>
      </div>
    </form>
  );
}

function PratinjauSelisih({ selisih, satuan }: { selisih: number | null; satuan: string }) {
  if (selisih === null) {
    return (
      <div className="rounded-xl border border-dashed border-beige-300 px-4 py-3 text-sm text-tinta-400">
        Selisih akan dihitung otomatis setelah Anda mengisi stok fisik.
      </div>
    );
  }

  const konfigurasi =
    selisih === 0
      ? {
          kelas: 'border-[var(--color-status-aman)]/25 bg-[var(--color-status-aman-bg)] text-[var(--color-status-aman)]',
          Ikon: IkonSeimbang,
          judul: 'Stok cocok',
          deskripsi: 'Stok fisik sama persis dengan catatan sistem.',
        }
      : selisih > 0
        ? {
            kelas: 'border-kayu-300/50 bg-kayu-100 text-kayu-700',
            Ikon: IkonNaik,
            judul: `Lebih ${formatAngka(selisih)} ${satuan}`,
            deskripsi: 'Stok fisik lebih banyak daripada catatan sistem.',
          }
        : {
            kelas: 'border-[var(--color-status-habis)]/25 bg-[var(--color-status-habis-bg)] text-[var(--color-status-habis)]',
            Ikon: IkonTurun,
            judul: `Kurang ${formatAngka(Math.abs(selisih))} ${satuan}`,
            deskripsi: 'Stok fisik lebih sedikit daripada catatan sistem.',
          };

  const { kelas, Ikon, judul, deskripsi } = konfigurasi;

  return (
    <div
      aria-live="polite"
      className={cn('flex items-start gap-3 rounded-xl border px-4 py-3.5', kelas)}
    >
      <Ikon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{judul}</p>
        <p className="mt-0.5 text-xs opacity-85">{deskripsi}</p>
      </div>
    </div>
  );
}
