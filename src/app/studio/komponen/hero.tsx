'use client';

import { useEffect, useRef } from 'react';

import { antara, jepit } from './gerak';

const PITA = ['karya-1', 'karya-2', 'karya-3', 'karya-4', 'karya-5'];

export function Hero() {
  const kabutSatu = useRef<HTMLDivElement>(null);
  const kabutDua = useRef<HTMLDivElement>(null);

  /**
   * Kabut bergerak pelan mengikuti dua hal: posisi gulir dan posisi kursor.
   * Keduanya diredam di satu loop rAF yang sama, dan loop itu tidur begitu
   * semua nilai menetap — jadi halaman diam tidak membakar CPU.
   */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let tikusX = 0;
    let tikusY = 0;
    let gulir = 0;

    let xSekarang = 0;
    let ySekarang = 0;
    let gulirSekarang = 0;

    let bingkai = 0;
    let berjalan = false;

    function langkah() {
      xSekarang = antara(xSekarang, tikusX, 0.055);
      ySekarang = antara(ySekarang, tikusY, 0.055);
      gulirSekarang = antara(gulirSekarang, gulir, 0.08);

      if (kabutSatu.current) {
        kabutSatu.current.style.transform = `translate3d(${xSekarang * 26}px, ${
          ySekarang * 18 + gulirSekarang * 90
        }px, 0) scale(1.06)`;
      }
      if (kabutDua.current) {
        kabutDua.current.style.transform = `translate3d(${xSekarang * -38}px, ${
          ySekarang * -24 + gulirSekarang * 150
        }px, 0) scale(1.1)`;
      }

      const menetap =
        Math.abs(xSekarang - tikusX) < 0.001 &&
        Math.abs(ySekarang - tikusY) < 0.001 &&
        Math.abs(gulirSekarang - gulir) < 0.001;

      if (menetap) {
        berjalan = false;
        return;
      }
      bingkai = requestAnimationFrame(langkah);
    }

    function bangunkan() {
      if (berjalan) return;
      berjalan = true;
      bingkai = requestAnimationFrame(langkah);
    }

    function padaTikus(peristiwa: PointerEvent) {
      tikusX = (peristiwa.clientX / window.innerWidth) * 2 - 1;
      tikusY = (peristiwa.clientY / window.innerHeight) * 2 - 1;
      bangunkan();
    }

    function padaGulir() {
      gulir = jepit(window.scrollY / Math.max(window.innerHeight, 1), 0, 1);
      bangunkan();
    }

    padaGulir();
    bangunkan();
    window.addEventListener('pointermove', padaTikus, { passive: true });
    window.addEventListener('scroll', padaGulir, { passive: true });

    return () => {
      cancelAnimationFrame(bingkai);
      window.removeEventListener('pointermove', padaTikus);
      window.removeEventListener('scroll', padaGulir);
    };
  }, []);

  return (
    <section className="hero" id="atas">
      <div ref={kabutSatu} className="hero__kabut" aria-hidden="true" />
      <div ref={kabutDua} className="hero__kabut hero__kabut--dua" aria-hidden="true" />

      <svg className="hero__garis-titik" viewBox="0 0 200 90" aria-hidden="true">
        <line
          x1="2"
          y1="2"
          x2="198"
          y2="88"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="0.1 6.5"
        />
      </svg>

      <div className="hero__isi">
        <h1 className="judul-raksasa hero__judul tersingkap">Fluid</h1>
        <p className="garis-luar hero__sub tersingkap" data-jeda="1" aria-hidden="true">
          studio
        </p>
        <span className="sr-only">Fluid studio</span>

        <div className="hero__bawah">
          <p className="hero__deskripsi tersingkap" data-jeda="2">
            A fictional studio shaping interfaces, identities and moving images since 2019.
          </p>

          <div className="pita tersingkap" data-jeda="3">
            {PITA.map((tekstur, indeks) => (
              <div key={tekstur} className="pita__sel">
                <div
                  className="pita__gambar"
                  style={{ backgroundImage: `url('/tekstur/${tekstur}.svg')` }}
                />
                <span className="pita__nomor mono">{String(indeks + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
