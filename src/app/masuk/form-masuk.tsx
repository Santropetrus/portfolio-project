'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { IkonPeringatan } from '@/components/ui/icons';
import { skemaLogin, type MasukanLogin, type NilaiLogin } from '@/lib/validation/auth';
import { aksiMasuk } from '@/server/actions/auth';

export function FormMasuk({ lanjut }: { lanjut: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<MasukanLogin, unknown, NilaiLogin>({
    resolver: zodResolver(skemaLogin),
    defaultValues: { email: '', password: '' },
  });

  const kirim = handleSubmit((nilai) => {
    setPesanError(null);

    startTransition(async () => {
      const hasil = await aksiMasuk({ ...nilai, lanjut });

      if (!hasil.sukses) {
        setPesanError(hasil.pesan);
        for (const [field, pesan] of Object.entries(hasil.errorField ?? {})) {
          if (field === 'email' || field === 'password') {
            setError(field, { type: 'server', message: pesan });
          }
        }
        return;
      }

      router.replace(hasil.data?.tujuan ?? '/dashboard');
      router.refresh();
    });
  });

  return (
    <form onSubmit={kirim} noValidate className="space-y-4">
      {pesanError ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-[var(--color-status-habis)]/25 bg-[var(--color-status-habis-bg)] px-3.5 py-3 text-sm text-[var(--color-status-habis)]"
        >
          <IkonPeringatan className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{pesanError}</span>
        </div>
      ) : null}

      <Input
        label="Email"
        type="email"
        autoComplete="username"
        inputMode="email"
        placeholder="nama@thematchakyoto.id"
        wajib
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Kata sandi"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        wajib
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" ukuran="lg" className="w-full justify-center" sedangMemuat={pending}>
        {pending ? 'Memverifikasi…' : 'Masuk'}
      </Button>
    </form>
  );
}
