'use client';

import { useCallback, useRef } from 'react';

import { KATA_BERJALAN } from './data';
import { progresElemen, useGerakGulir } from './gerak';

const SISI = [
  { kelas: 'depan', tekstur: 'kubus-1' },
  { kelas: 'kanan', tekstur: 'kubus-2' },
  { kelas: 'belakang', tekstur: 'kubus-3' },
  { kelas: 'kiri', tekstur: 'kubus-4' },
  { kelas: 'atas', tekstur: 'kubus-5' },
  { kelas: 'bawah', tekstur: 'kubus-6' },
] as const;

/**
 * Seksi kubus — inti gerak halaman ini.
 *
 * Seksinya sengaja setinggi 320vh dengan panggung `position: sticky` di
 * dalamnya. Kubus karenanya diam di tengah layar sementara halaman digulir,
 * dan seluruh gulir itu berubah menjadi sudut putar.
 *
 * Nilai putarannya diredam (lihat `useGerakGulir`), jadi kubus tidak menempel
 * kaku pada posisi gulir melainkan menyusulnya. Itulah yang membuat gerakannya
 * terasa berat dan mulus, bukan patah mengikuti tiap klik roda mouse.
 *
 * Hanya `transform` yang disentuh tiap frame, sehingga browser cukup
 * mengomposit ulang lapisan tanpa menghitung layout ataupun melukis ulang.
 */
export function SeksiKubus() {
  const seksi = useRef<HTMLElement>(null);
  const kubus = useRef<HTMLDivElement>(null);
  const jalur = useRef<HTMLDivElement>(null);

  const hitung = useCallback(() => progresElemen(seksi.current), []);

  const terapkan = useCallback((p: number) => {
    if (kubus.current) {
      const putarX = -24 + p * 48;
      const putarY = -40 + p * 340;
      // Rentang dijaga tetap negatif: kubus yang sejajar sumbu terbaca datar
      // dan kaku, sedangkan sedikit miring membuatnya terbaca sebagai volume.
      const putarZ = -21 + p * 15;
      // Membesar di tengah lintasan lalu mengecil lagi di kedua ujungnya.
      const skala = 0.78 + Math.sin(p * Math.PI) * 0.26;
      const naik = (0.5 - p) * 90;

      kubus.current.style.transform =
        `translate3d(0, ${naik.toFixed(2)}px, 0) ` +
        `rotateX(${putarX.toFixed(2)}deg) ` +
        `rotateY(${putarY.toFixed(2)}deg) ` +
        `rotateZ(${putarZ.toFixed(2)}deg) ` +
        `scale(${skala.toFixed(4)})`;
    }

    if (jalur.current) {
      // Teks berjalan ikut terdorong oleh gulir, di atas animasi tak berujungnya.
      jalur.current.style.transform = `translate3d(${(-p * 22).toFixed(2)}vw, 0, 0)`;
    }
  }, []);

  useGerakGulir(hitung, terapkan, 0.075);

  return (
    <section ref={seksi} className="seksi-kubus" id="kubus" aria-label="Disiplin studio">
      <div className="seksi-kubus__lengket">
        <div className="marquee" aria-hidden="true">
          <div ref={jalur} className="marquee__geser">
            <div className="marquee__jalur">
              {[0, 1].map((salinan) => (
                <div className="marquee__grup" key={salinan}>
                  {KATA_BERJALAN.map((butir) => (
                    <span className="marquee__butir" key={`${salinan}-${butir.kata}`}>
                      <span className="marquee__kata">{butir.kata}</span>
                      <span className="marquee__label mono">( {butir.label} )</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="kubus-panggung">
          <div ref={kubus} className="kubus">
            {SISI.map((sisi) => (
              <div
                key={sisi.kelas}
                className={`kubus__sisi kubus__sisi--${sisi.kelas}`}
                style={{ backgroundImage: `url('/tekstur/${sisi.tekstur}.svg')` }}
              />
            ))}
          </div>
        </div>

        <div className="seksi-kubus__kaki mono">
          <span>Scroll to rotate</span>
          <span>Six surfaces &middot; one volume</span>
        </div>
      </div>
    </section>
  );
}
