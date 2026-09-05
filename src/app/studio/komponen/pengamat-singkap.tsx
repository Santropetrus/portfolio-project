'use client';

import { useEffect } from 'react';

import { pasangGulirHalus } from './gerak';

/**
 * Dua perilaku global halaman, digabung dalam satu komponen tanpa tampilan:
 *
 * 1. Gulir halus berinersia (lihat `pasangGulirHalus`).
 * 2. Animasi masuk untuk setiap elemen `.tersingkap`.
 *
 * Pendekatan "satu pengamat untuk seluruh dokumen" dipilih supaya bagian
 * halaman yang statis tetap bisa menjadi Server Component — cukup menempelkan
 * `className="tersingkap"`, tanpa perlu membungkusnya dengan komponen klien.
 */
export function PerilakuHalaman() {
  useEffect(() => {
    const lepasGulir = pasangGulirHalus();

    const elemen = Array.from(document.querySelectorAll<HTMLElement>('.tersingkap'));

    // Tanpa IntersectionObserver, tampilkan semuanya daripada menyembunyikan isi.
    if (typeof IntersectionObserver === 'undefined') {
      for (const el of elemen) el.dataset.tampil = 'ya';
      return lepasGulir;
    }

    const pengamat = new IntersectionObserver(
      (masukan) => {
        for (const catatan of masukan) {
          if (!catatan.isIntersecting) continue;
          (catatan.target as HTMLElement).dataset.tampil = 'ya';
          pengamat.unobserve(catatan.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    );

    for (const el of elemen) pengamat.observe(el);

    return () => {
      pengamat.disconnect();
      lepasGulir();
    };
  }, []);

  return null;
}
