'use client';

import { useEffect, useRef } from 'react';

export function jepit(nilai: number, bawah: number, atas: number): number {
  return Math.min(Math.max(nilai, bawah), atas);
}

/** Interpolasi linear — dipakai untuk meredam nilai menuju targetnya. */
export function antara(dari: number, ke: number, jumlah: number): number {
  return dari + (ke - dari) * jumlah;
}

function sukaDiam(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Gulir halus bergaya inersia.
 *
 * Roda mouse tidak lagi langsung menggeser halaman; ia menggeser *target*,
 * lalu posisi nyata mengejar target sedikit demi sedikit setiap frame. Inilah
 * yang membuat gulir terasa berat dan mulus, bukan patah-patah.
 *
 * Yang sengaja TIDAK dibajak, supaya halaman tetap bisa dipakai semua orang:
 * - Perangkat sentuh dan trackpad-momentum (pointer kasar) memakai gulir asli.
 * - Pengguna yang meminta `prefers-reduced-motion` memakai gulir asli.
 * - Ctrl + roda (zoom browser) dibiarkan lewat.
 * - Elemen ber-atribut `data-gulir-asli` menggulir sendiri seperti biasa.
 * - Menyeret scrollbar, tombol panah, Page Up/Down, dan tautan jangkar tetap
 *   bekerja: posisi target disamakan kembali begitu terdeteksi selisih.
 */
export function pasangGulirHalus(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (!window.matchMedia('(pointer: fine)').matches) return () => {};
  if (sukaDiam()) return () => {};

  let target = window.scrollY;
  let sekarang = window.scrollY;
  let bingkai = 0;
  let berjalan = false;

  const batas = () =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  function langkah() {
    const selisih = target - sekarang;

    if (Math.abs(selisih) < 0.35) {
      sekarang = target;
      window.scrollTo(0, sekarang);
      berjalan = false;
      return;
    }

    sekarang = antara(sekarang, target, 0.115);
    window.scrollTo(0, sekarang);
    bingkai = requestAnimationFrame(langkah);
  }

  function bangunkan() {
    if (berjalan) return;
    berjalan = true;
    bingkai = requestAnimationFrame(langkah);
  }

  function padaRoda(peristiwa: WheelEvent) {
    if (peristiwa.ctrlKey) return;

    const sasaran = peristiwa.target;
    if (sasaran instanceof Element && sasaran.closest('[data-gulir-asli]')) return;

    peristiwa.preventDefault();

    // deltaMode: 0 = piksel, 1 = baris, 2 = halaman.
    const faktor =
      peristiwa.deltaMode === 1 ? 16 : peristiwa.deltaMode === 2 ? window.innerHeight : 1;

    target = jepit(target + peristiwa.deltaY * faktor, 0, batas());
    bangunkan();
  }

  function padaGulir() {
    // Bila posisi nyata menyimpang jauh dari perhitungan kita, berarti
    // halaman digulir lewat jalur lain (scrollbar, keyboard, jangkar).
    // Samakan kembali daripada bertengkar dengan pengguna.
    if (Math.abs(window.scrollY - sekarang) > 2) {
      target = window.scrollY;
      sekarang = window.scrollY;
    }
  }

  function padaUbahUkuran() {
    target = jepit(target, 0, batas());
  }

  window.addEventListener('wheel', padaRoda, { passive: false });
  window.addEventListener('scroll', padaGulir, { passive: true });
  window.addEventListener('resize', padaUbahUkuran, { passive: true });

  return () => {
    cancelAnimationFrame(bingkai);
    window.removeEventListener('wheel', padaRoda);
    window.removeEventListener('scroll', padaGulir);
    window.removeEventListener('resize', padaUbahUkuran);
  };
}

/**
 * Menjalankan animasi berbasis gulir tanpa melewati state React.
 *
 * `hitungTarget` dipanggil tiap frame untuk mendapat nilai tujuan, lalu nilai
 * yang diredam diteruskan ke `terapkan` — yang seharusnya hanya menyentuh
 * `transform` dan properti lain yang dikomposit GPU.
 *
 * Loop-nya tidur begitu nilai sudah menetap, dan bangun lagi saat ada gulir
 * atau perubahan ukuran, jadi tidak ada rAF yang berputar sia-sia.
 */
export function useGerakGulir(
  hitungTarget: () => number,
  terapkan: (nilai: number) => void,
  pelicin = 0.09,
): void {
  const refHitung = useRef(hitungTarget);
  const refTerapkan = useRef(terapkan);

  // Menyegarkan callback lewat effect, bukan saat render: menyentuh `.current`
  // di badan komponen membuat render tidak lagi murni.
  useEffect(() => {
    refHitung.current = hitungTarget;
    refTerapkan.current = terapkan;
  });

  useEffect(() => {
    const langsung = sukaDiam();
    let sekarang = refHitung.current();
    let bingkai = 0;
    let berjalan = false;

    refTerapkan.current(sekarang);

    function langkah() {
      const target = refHitung.current();
      const selisih = target - sekarang;

      if (Math.abs(selisih) < 0.0004) {
        sekarang = target;
        refTerapkan.current(sekarang);
        berjalan = false;
        return;
      }

      sekarang = langsung ? target : antara(sekarang, target, pelicin);
      refTerapkan.current(sekarang);
      bingkai = requestAnimationFrame(langkah);
    }

    function bangunkan() {
      if (berjalan) return;
      berjalan = true;
      bingkai = requestAnimationFrame(langkah);
    }

    bangunkan();
    window.addEventListener('scroll', bangunkan, { passive: true });
    window.addEventListener('resize', bangunkan, { passive: true });

    return () => {
      cancelAnimationFrame(bingkai);
      window.removeEventListener('scroll', bangunkan);
      window.removeEventListener('resize', bangunkan);
    };
  }, [pelicin]);
}

/**
 * Seberapa jauh sebuah elemen sudah melintasi layar.
 * 0 = tepi atasnya baru menyentuh bagian bawah viewport,
 * 1 = tepi bawahnya baru meninggalkan bagian atas viewport.
 */
export function progresElemen(elemen: HTMLElement | null): number {
  if (!elemen) return 0;
  const kotak = elemen.getBoundingClientRect();
  const tinggi = window.innerHeight;
  const rentang = kotak.height + tinggi;
  if (rentang <= 0) return 0;
  return jepit((tinggi - kotak.top) / rentang, 0, 1);
}

/** Progres gulir seluruh dokumen, 0..1. */
export function progresHalaman(): number {
  const batas = document.documentElement.scrollHeight - window.innerHeight;
  if (batas <= 0) return 0;
  return jepit(window.scrollY / batas, 0, 1);
}
