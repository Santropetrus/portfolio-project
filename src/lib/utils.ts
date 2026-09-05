import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const formatterRupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRupiah(nilai: number | string | null | undefined): string {
  const angka = typeof nilai === 'string' ? Number(nilai) : (nilai ?? 0);
  if (!Number.isFinite(angka)) return formatterRupiah.format(0);
  return formatterRupiah.format(angka);
}

const formatterAngka = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatAngka(nilai: number | string | null | undefined): string {
  const angka = typeof nilai === 'string' ? Number(nilai) : (nilai ?? 0);
  if (!Number.isFinite(angka)) return '0';
  return formatterAngka.format(angka);
}

export function formatJumlahSatuan(nilai: number | string, satuan: string): string {
  return `${formatAngka(nilai)} ${satuan}`;
}

const formatterTanggal = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const formatterTanggalWaktu = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatTanggal(iso: string | null | undefined): string {
  if (!iso) return '—';
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return '—';
  return formatterTanggal.format(tanggal);
}

export function formatTanggalWaktu(iso: string | null | undefined): string {
  if (!iso) return '—';
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return '—';
  return formatterTanggalWaktu.format(tanggal);
}

/** Jarak waktu singkat dalam bahasa Indonesia, mis. "3 jam lalu". */
export function waktuRelatif(iso: string | null | undefined): string {
  if (!iso) return '—';
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return '—';

  const selisihDetik = Math.round((target - Date.now()) / 1000);

  const satuan: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 7],
    ['week', 4.345],
    ['month', 12],
    ['year', Number.POSITIVE_INFINITY],
  ];

  const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });
  let nilai = selisihDetik;
  for (const [unit, batas] of satuan) {
    if (Math.abs(nilai) < batas) return rtf.format(Math.round(nilai), unit);
    nilai /= batas;
  }
  return rtf.format(Math.round(nilai), 'year');
}

/** Selisih hari menuju tanggal tertentu (negatif berarti sudah lewat). */
export function hariMenuju(tanggalIso: string | null | undefined): number | null {
  if (!tanggalIso) return null;
  const target = new Date(`${tanggalIso}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - hariIni.getTime()) / 86_400_000);
}

export function inisial(nama: string): string {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata.charAt(0).toUpperCase())
    .join('');
}
