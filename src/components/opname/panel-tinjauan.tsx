'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { BadgeNada } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/field';
import { IkonSetujui, IkonTolak } from '@/components/ui/icons';
import { KondisiKosong } from '@/components/ui/states';
import { useToast } from '@/components/ui/toast';
import { cn, formatAngka, formatTanggalWaktu } from '@/lib/utils';
import { aksiTinjauOpname } from '@/server/actions/opname';

export interface DraftOpname {
  id: string;
  stok_sistem: number;
  stok_fisik: number;
  selisih: number;
  catatan: string | null;
  created_at: string;
  namaBahan: string;
  satuan: string;
  namaPengaju: string;
}

/**
 * Antrean draft stok opname yang menunggu keputusan owner/admin.
 *
 * Dua keputusan dipisahkan tegas: menyetujui akan menyesuaikan stok, menolak
 * tidak mengubah apa pun. Karena menyetujui mengubah data, keduanya melewati
 * dialog konfirmasi yang menyebutkan angka akhirnya secara eksplisit.
 */
export function PanelTinjauan({ draft }: { draft: DraftOpname[] }) {
  const router = useRouter();
  const { tampilkan } = useToast();
  const [pending, startTransition] = useTransition();
  const [keputusan, setKeputusan] = useState<{ butir: DraftOpname; setujui: boolean } | null>(null);
  const [catatan, setCatatan] = useState('');

  function kirim() {
    if (!keputusan) return;
    const { butir, setujui } = keputusan;

    startTransition(async () => {
      const hasil = await aksiTinjauOpname({
        opname_id: butir.id,
        setujui,
        catatan_peninjau: catatan,
      });

      if (hasil.sukses) {
        tampilkan({ tipe: 'sukses', judul: 'Tinjauan tersimpan', deskripsi: hasil.pesan });
        setKeputusan(null);
        setCatatan('');
        router.refresh();
      } else {
        tampilkan({ tipe: 'gagal', judul: 'Gagal meninjau', deskripsi: hasil.pesan });
      }
    });
  }

  if (draft.length === 0) {
    return (
      <KondisiKosong
        judul="Tidak ada yang perlu ditinjau"
        deskripsi="Draft stok opname dari staff akan muncul di sini untuk disetujui atau ditolak."
      />
    );
  }

  return (
    <>
      <ul className="divide-y divide-beige-200">
        {draft.map((butir, indeks) => {
          const selisih = Number(butir.selisih);
          return (
            <li key={butir.id} className="px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="mono-label shrink-0 text-tinta-300">
                    {String(indeks + 1).padStart(2, '0')}
                  </span>
                  <p className="truncate text-sm font-medium text-tinta-900">{butir.namaBahan}</p>
                </div>
                <BadgeNada nada="tunggu">Menunggu</BadgeNada>
              </div>

              <dl className="mt-3 grid grid-cols-3 gap-3 border-y border-beige-200 py-3">
                <div>
                  <dt className="mono-label text-tinta-400">Sistem</dt>
                  <dd className="angka-tabel mt-1 text-sm text-tinta-600">
                    {formatAngka(butir.stok_sistem)}
                  </dd>
                </div>
                <div>
                  <dt className="mono-label text-tinta-400">Fisik</dt>
                  <dd className="angka-tabel mt-1 text-sm font-semibold text-tinta-900">
                    {formatAngka(butir.stok_fisik)}
                  </dd>
                </div>
                <div>
                  <dt className="mono-label text-tinta-400">Selisih</dt>
                  <dd
                    className={cn(
                      'angka-tabel mt-1 text-sm font-semibold',
                      selisih === 0
                        ? 'text-[var(--color-status-aman)]'
                        : selisih > 0
                          ? 'text-kayu-600'
                          : 'text-[var(--color-status-habis)]',
                    )}
                  >
                    {selisih > 0 ? '+' : ''}
                    {formatAngka(selisih)}
                  </dd>
                </div>
              </dl>

              <p className="mt-3 text-xs leading-relaxed text-tinta-500">
                Diajukan {butir.namaPengaju} · {formatTanggalWaktu(butir.created_at)}
                {butir.catatan ? ` · “${butir.catatan}”` : ''}
              </p>

              <div className="mt-3 flex gap-2">
                <Button
                  ukuran="sm"
                  varian="sekunder"
                  onClick={() => {
                    setCatatan('');
                    setKeputusan({ butir, setujui: true });
                  }}
                >
                  <IkonSetujui className="h-4 w-4" />
                  Setujui
                </Button>
                <Button
                  ukuran="sm"
                  varian="garis"
                  onClick={() => {
                    setCatatan('');
                    setKeputusan({ butir, setujui: false });
                  }}
                >
                  <IkonTolak className="h-4 w-4" />
                  Tolak
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog
        terbuka={keputusan !== null}
        onTutup={() => setKeputusan(null)}
        judul={keputusan?.setujui ? 'Setujui stok opname?' : 'Tolak stok opname?'}
        lebar="sm"
      >
        {keputusan ? (
          <div className="space-y-5">
            <div
              className={cn(
                'border px-4 py-3.5 text-sm leading-relaxed',
                keputusan.setujui
                  ? 'border-[var(--color-status-aman)]/25 bg-[var(--color-status-aman-bg)] text-tinta-700'
                  : 'border-beige-300 bg-beige-100/60 text-tinta-700',
              )}
            >
              {keputusan.setujui ? (
                <p>
                  Stok <strong className="font-semibold">{keputusan.butir.namaBahan}</strong> akan
                  disesuaikan menjadi{' '}
                  <strong className="angka-tabel font-semibold">
                    {formatAngka(keputusan.butir.stok_fisik)} {keputusan.butir.satuan}
                  </strong>
                  . Perubahannya tercatat di riwayat stok dan audit log.
                </p>
              ) : (
                <p>
                  Stok <strong className="font-semibold">{keputusan.butir.namaBahan}</strong> tidak
                  akan diubah. Draft ini ditandai ditolak dan tidak bisa ditinjau ulang.
                </p>
              )}
            </div>

            <Textarea
              label="Catatan peninjau"
              value={catatan}
              onChange={(peristiwa) => setCatatan(peristiwa.target.value)}
              placeholder={
                keputusan.setujui
                  ? 'Opsional. Contoh: sudah dicek ulang bersama staff.'
                  : 'Jelaskan alasannya agar staff bisa menghitung ulang.'
              }
              petunjuk="Tersimpan bersama hasil tinjauan."
            />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button varian="garis" onClick={() => setKeputusan(null)} disabled={pending}>
                Batal
              </Button>
              <Button
                varian={keputusan.setujui ? 'sekunder' : 'bahaya'}
                onClick={kirim}
                sedangMemuat={pending}
              >
                {keputusan.setujui ? 'Ya, setujui' : 'Ya, tolak'}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
