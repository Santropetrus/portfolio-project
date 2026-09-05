'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';
import { skemaProfil, type MasukanProfil, type NilaiProfil } from '@/lib/validation/auth';
import { aksiUbahNamaProfil } from '@/server/actions/profil';

export function FormProfil({ namaAwal }: { namaAwal: string }) {
  const router = useRouter();
  const { tampilkan } = useToast();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<MasukanProfil, unknown, NilaiProfil>({
    resolver: zodResolver(skemaProfil),
    defaultValues: { nama: namaAwal },
  });

  const kirim = handleSubmit((nilai) => {
    startTransition(async () => {
      const hasil = await aksiUbahNamaProfil(nilai);

      if (!hasil.sukses) {
        if (hasil.errorField?.nama) {
          setError('nama', { type: 'server', message: hasil.errorField.nama });
        }
        tampilkan({ tipe: 'gagal', judul: 'Gagal memperbarui', deskripsi: hasil.pesan });
        return;
      }

      tampilkan({ tipe: 'sukses', judul: 'Tersimpan', deskripsi: hasil.pesan });
      router.refresh();
    });
  });

  return (
    <form onSubmit={kirim} noValidate className="space-y-4 px-5 py-5">
      <Input
        label="Nama tampilan"
        wajib
        petunjuk="Nama ini muncul di sidebar dan pada catatan aktivitas."
        error={errors.nama?.message}
        {...register('nama')}
      />
      <div className="flex justify-end">
        <Button type="submit" sedangMemuat={pending} disabled={!isDirty}>
          Simpan perubahan
        </Button>
      </div>
    </form>
  );
}
