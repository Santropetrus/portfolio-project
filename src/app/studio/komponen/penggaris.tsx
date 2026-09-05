'use client';

import { useRef } from 'react';

import { progresHalaman, useGerakGulir } from './gerak';

const KEDALAMAN_MAKS = 3600;
const JUMLAH_TIK = 37;
const TIAP_BESAR = 9;

function formatKedalaman(meter: number): string {
  const bulat = Math.round(meter);
  const angka = String(bulat).padStart(4, '0');
  return bulat === 0 ? `${angka} M` : `-${angka} M`;
}

/**
 * Penggaris kedalaman di tepi kanan.
 *
 * Fungsinya sebagai indikator posisi gulir yang terbaca seperti instrumen
 * penyelaman: penanda belah ketupat menyusuri batang, dan angka di sampingnya
 * menunjukkan "kedalaman" saat ini. Posisinya digerakkan langsung lewat
 * `style.top`, bukan lewat state React, supaya tidak memicu render ulang
 * puluhan kali per detik.
 */
export function PenggarisKedalaman() {
  const penanda = useRef<HTMLDivElement>(null);
  const bacaan = useRef<HTMLDivElement>(null);
  const angka = useRef<Array<{ elemen: HTMLDivElement; persen: number }>>([]);

  useGerakGulir(
    progresHalaman,
    (nilai) => {
      const posisi = nilai * 100;
      const persen = `${posisi.toFixed(3)}%`;

      if (penanda.current) penanda.current.style.top = persen;
      if (bacaan.current) {
        bacaan.current.style.top = persen;
        bacaan.current.textContent = formatKedalaman(nilai * KEDALAMAN_MAKS);
      }

      // Angka statis yang sedang dilewati jendela pembacaan disembunyikan,
      // supaya keduanya tidak saling menumpuk menjadi teks yang tak terbaca.
      for (const butir of angka.current) {
        butir.elemen.style.opacity = Math.abs(butir.persen - posisi) < 3.2 ? '0' : '1';
      }
    },
    0.12,
  );

  const tik = Array.from({ length: JUMLAH_TIK }, (_, indeks) => {
    const besar = indeks % TIAP_BESAR === 0;
    return {
      indeks,
      besar,
      persen: (indeks / (JUMLAH_TIK - 1)) * 100,
      angka: besar ? String(Math.round((indeks / (JUMLAH_TIK - 1)) * KEDALAMAN_MAKS)).padStart(4, '0') : null,
    };
  });

  return (
    <aside className="penggaris" aria-hidden="true">
      <div className="penggaris__label penggaris__label--atas">Surface</div>
      <div className="penggaris__label penggaris__label--bawah">Altitude</div>

      <div className="penggaris__batang">
        {tik.map((t) => (
          <div
            key={t.indeks}
            className={`penggaris__tik${t.besar ? ' penggaris__tik--besar' : ''}`}
            style={{ top: `${t.persen}%` }}
          />
        ))}

        {tik
          .filter((t) => t.angka !== null)
          .map((t) => (
            <div
              key={`n-${t.indeks}`}
              ref={(elemen) => {
                if (!elemen) return;
                angka.current = angka.current.filter((b) => b.elemen !== elemen);
                angka.current.push({ elemen, persen: t.persen });
              }}
              className="penggaris__angka"
              style={{ top: `${t.persen}%` }}
            >
              {t.angka}
            </div>
          ))}

        <div ref={bacaan} className="penggaris__bacaan" />
        <div ref={penanda} className="penggaris__penanda" />
      </div>
    </aside>
  );
}
