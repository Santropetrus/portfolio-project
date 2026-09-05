'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/field';
import { IkonPeringatan } from '@/components/ui/icons';
import { useToast } from '@/components/ui/toast';
import { KATEGORI_INVENTORI, SARAN_SATUAN } from '@/lib/constants';
import {
  nilaiAwalBahanBaku,
  skemaBahanBaku,
  type MasukanBahanBaku,
  type NilaiBahanBaku,
} from '@/lib/validation/inventori';
import { aksiTambahBahan, aksiUbahBahan } from '@/server/actions/inventori';
import type { InventoryItem } from '@/types/database';

interface FormBahanProps {
  bahan?: InventoryItem | null;
  onSelesai: () => void;
}

function keNilaiForm(bahan: InventoryItem): MasukanBahanBaku {
  return {
    nama: bahan.nama,
    kategori: bahan.kategori,
    satuan: bahan.satuan,
    stok_saat_ini: String(bahan.stok_saat_ini),
    stok_minimum: String(bahan.stok_minimum),
    harga_beli: String(bahan.harga_beli),
    supplier: bahan.supplier ?? '',
    tanggal_kedaluwarsa: bahan.tanggal_kedaluwarsa ?? '',
    catatan: bahan.catatan ?? '',
  };
}

export function FormBahan({ bahan, onSelesai }: FormBahanProps) {
  const { tampilkan } = useToast();
  const [pending, startTransition] = useTransition();
  const modeUbah = Boolean(bahan);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<MasukanBahanBaku, unknown, NilaiBahanBaku>({
    resolver: zodResolver(skemaBahanBaku),
    defaultValues: bahan ? keNilaiForm(bahan) : nilaiAwalBahanBaku,
  });

  const kirim = handleSubmit((nilai) => {
    startTransition(async () => {
      const hasil = modeUbah
        ? await aksiUbahBahan({ ...nilai, id: bahan!.id })
        : await aksiTambahBahan(nilai);

      if (!hasil.sukses) {
        for (const [field, pesan] of Object.entries(hasil.errorField ?? {})) {
          if (field in nilai) {
            setError(field as keyof MasukanBahanBaku, { type: 'server', message: pesan });
          }
        }
        tampilkan({ tipe: 'gagal', judul: 'Gagal menyimpan', deskripsi: hasil.pesan });
        return;
      }

      tampilkan({ tipe: 'sukses', judul: 'Tersimpan', deskripsi: hasil.pesan });
      onSelesai();
    });
  });

  return (
    <form onSubmit={kirim} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nama bahan"
          placeholder="Matcha Ceremonial Grade Uji"
          wajib
          className="sm:col-span-2"
          error={errors.nama?.message}
          {...register('nama')}
        />

        <Select label="Kategori" wajib error={errors.kategori?.message} {...register('kategori')}>
          {KATEGORI_INVENTORI.map((kategori) => (
            <option key={kategori.value} value={kategori.value}>
              {kategori.label}
            </option>
          ))}
        </Select>

        <Input
          label="Satuan"
          placeholder="gram"
          list="saran-satuan"
          wajib
          petunjuk="Contoh: gram, liter, pcs, pack."
          error={errors.satuan?.message}
          {...register('satuan')}
        />
        <datalist id="saran-satuan">
          {SARAN_SATUAN.map((satuan) => (
            <option key={satuan} value={satuan} />
          ))}
        </datalist>

        <Input
          label="Stok saat ini"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0"
          wajib
          error={errors.stok_saat_ini?.message}
          {...register('stok_saat_ini')}
        />

        <Input
          label="Stok minimum"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0"
          wajib
          petunjuk="Batas bawah sebelum bahan ditandai menipis."
          error={errors.stok_minimum?.message}
          {...register('stok_minimum')}
        />

        <Input
          label="Harga beli per unit"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0"
          awalan="Rp"
          wajib
          error={errors.harga_beli?.message}
          {...register('harga_beli')}
        />

        <Input
          label="Supplier"
          placeholder="Uji Tea Trading"
          error={errors.supplier?.message}
          {...register('supplier')}
        />

        <Input
          label="Tanggal kedaluwarsa"
          type="date"
          petunjuk="Opsional. Kosongkan bila tidak berlaku."
          error={errors.tanggal_kedaluwarsa?.message}
          {...register('tanggal_kedaluwarsa')}
        />

        <Textarea
          label="Catatan"
          placeholder="Catatan penyimpanan, kualitas, atau pengingat pemesanan."
          className="sm:col-span-2"
          error={errors.catatan?.message}
          {...register('catatan')}
        />
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-beige-100/70 px-3.5 py-3 text-xs text-tinta-500">
        <IkonPeringatan className="mt-0.5 h-4 w-4 shrink-0 text-kayu-500" />
        <p>
          Setiap perubahan stok otomatis tercatat di riwayat stok dan audit log, lengkap dengan
          siapa yang mengubahnya.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" varian="garis" onClick={onSelesai} disabled={pending}>
          Batal
        </Button>
        <Button type="submit" sedangMemuat={pending}>
          {modeUbah ? 'Simpan perubahan' : 'Tambah bahan'}
        </Button>
      </div>
    </form>
  );
}
