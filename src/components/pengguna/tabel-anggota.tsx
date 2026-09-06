'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { BadgeNada, BadgeNetral } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';
import { DESKRIPSI_ROLE, LABEL_ROLE } from '@/lib/constants';
import { formatTanggal, inisial } from '@/lib/utils';
import { aksiUbahRoleAnggota, aksiUbahStatusAnggota } from '@/server/actions/anggota';
import type { UserRole } from '@/types/database';

export interface Anggota {
  id: string;
  nama: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

const URUTAN_ROLE: ReadonlyArray<UserRole> = ['owner', 'admin', 'staff'];

export function TabelAnggota({
  anggota,
  idSaya,
}: {
  anggota: Anggota[];
  idSaya: string;
}) {
  const router = useRouter();
  const { tampilkan } = useToast();
  const [pending, startTransition] = useTransition();

  const [dialogRole, setDialogRole] = useState<Anggota | null>(null);
  const [rolePilihan, setRolePilihan] = useState<UserRole>('staff');
  const [dialogStatus, setDialogStatus] = useState<Anggota | null>(null);

  function jalankan(aksi: () => Promise<{ sukses: boolean; pesan: string }>, judul: string) {
    startTransition(async () => {
      const hasil = await aksi();
      tampilkan({
        tipe: hasil.sukses ? 'sukses' : 'gagal',
        judul: hasil.sukses ? judul : 'Gagal',
        deskripsi: hasil.pesan,
      });
      if (hasil.sukses) {
        setDialogRole(null);
        setDialogStatus(null);
        router.refresh();
      }
    });
  }

  return (
    <>
      <ul className="divide-y divide-beige-200">
        {anggota.map((orang, indeks) => {
          const sayaSendiri = orang.id === idSaya;
          return (
            <li
              key={orang.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4"
            >
              <span className="mono-label w-5 shrink-0 text-tinta-300">
                {String(indeks + 1).padStart(2, '0')}
              </span>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-beige-200 text-[0.75rem] font-bold text-matcha-900">
                {inisial(orang.nama)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-tinta-900">
                  {orang.nama}
                  {sayaSendiri ? (
                    <span className="mono-label ml-2 font-normal text-tinta-300">Anda</span>
                  ) : null}
                </p>
                <p className="mono-label mt-1 text-tinta-400">
                  Bergabung {formatTanggal(orang.created_at)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {orang.is_active ? (
                  <BadgeNetral>{LABEL_ROLE[orang.role]}</BadgeNetral>
                ) : (
                  <BadgeNada nada="habis">Nonaktif</BadgeNada>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  varian="garis"
                  ukuran="sm"
                  disabled={sayaSendiri}
                  title={sayaSendiri ? 'Owner tidak dapat mengubah role sendiri' : undefined}
                  onClick={() => {
                    setRolePilihan(orang.role);
                    setDialogRole(orang);
                  }}
                >
                  Ubah role
                </Button>
                <Button
                  varian="hantu"
                  ukuran="sm"
                  disabled={sayaSendiri}
                  onClick={() => setDialogStatus(orang)}
                >
                  {orang.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Ubah role */}
      <Dialog
        terbuka={dialogRole !== null}
        onTutup={() => setDialogRole(null)}
        judul="Ubah role anggota"
        deskripsi={dialogRole ? `Mengatur hak akses untuk ${dialogRole.nama}.` : undefined}
        lebar="sm"
      >
        {dialogRole ? (
          <div className="space-y-5">
            <Select
              label="Role"
              value={rolePilihan}
              onChange={(peristiwa) => setRolePilihan(peristiwa.target.value as UserRole)}
            >
              {URUTAN_ROLE.map((role) => (
                <option key={role} value={role}>
                  {LABEL_ROLE[role]}
                </option>
              ))}
            </Select>

            <p className="border border-beige-300 bg-beige-100/50 px-4 py-3 text-sm leading-relaxed text-tinta-600">
              {DESKRIPSI_ROLE[rolePilihan]}
            </p>

            <p className="mono-label text-tinta-400">
              Perubahan role tercatat di audit log sebagai profile.update_sensitive
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button varian="garis" onClick={() => setDialogRole(null)} disabled={pending}>
                Batal
              </Button>
              <Button
                sedangMemuat={pending}
                disabled={rolePilihan === dialogRole.role}
                onClick={() =>
                  jalankan(
                    () => aksiUbahRoleAnggota({ user_id: dialogRole.id, role: rolePilihan }),
                    'Role diperbarui',
                  )
                }
              >
                Simpan role
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>

      {/* Aktifkan / nonaktifkan */}
      <Dialog
        terbuka={dialogStatus !== null}
        onTutup={() => setDialogStatus(null)}
        judul={dialogStatus?.is_active ? 'Nonaktifkan akun?' : 'Aktifkan kembali akun?'}
        lebar="sm"
      >
        {dialogStatus ? (
          <div className="space-y-5">
            <div
              className={
                dialogStatus.is_active
                  ? 'border border-[var(--color-status-habis)]/25 bg-[var(--color-status-habis-bg)] px-4 py-3.5 text-sm leading-relaxed text-tinta-700'
                  : 'border border-[var(--color-status-aman)]/25 bg-[var(--color-status-aman-bg)] px-4 py-3.5 text-sm leading-relaxed text-tinta-700'
              }
            >
              {dialogStatus.is_active ? (
                <p>
                  <strong className="font-semibold">{dialogStatus.nama}</strong> akan langsung
                  kehilangan akses ke seluruh halaman. Akunnya tidak dihapus, dan seluruh jejak
                  aktivitasnya tetap tersimpan.
                </p>
              ) : (
                <p>
                  <strong className="font-semibold">{dialogStatus.nama}</strong> dapat masuk kembali
                  dengan role {LABEL_ROLE[dialogStatus.role]}.
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button varian="garis" onClick={() => setDialogStatus(null)} disabled={pending}>
                Batal
              </Button>
              <Button
                varian={dialogStatus.is_active ? 'bahaya' : 'sekunder'}
                sedangMemuat={pending}
                onClick={() =>
                  jalankan(
                    () =>
                      aksiUbahStatusAnggota({
                        user_id: dialogStatus.id,
                        aktif: !dialogStatus.is_active,
                      }),
                    'Status diperbarui',
                  )
                }
              >
                {dialogStatus.is_active ? 'Ya, nonaktifkan' : 'Ya, aktifkan'}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
