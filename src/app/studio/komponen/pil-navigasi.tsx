'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { SUREL, TAUTAN_MENU } from './data';
import { IkonMenu, IkonSurel, IkonTutup } from './ikon';

/**
 * Pil navigasi mengambang plus overlay menu layar penuh.
 *
 * Menu dibuat sebagai overlay biasa, bukan <dialog>, supaya transisinya bisa
 * dikontrol penuh — tetapi tetap memenuhi kewajiban aksesibilitas dasar:
 * Escape menutup, fokus terkunci di dalamnya, dan fokus kembali ke tombol
 * pemicu setelah ditutup.
 */
export function PilNavigasi() {
  const [terbuka, setTerbuka] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const pemicu = useRef<HTMLButtonElement>(null);

  const tutup = useCallback(() => setTerbuka(false), []);

  const menujuSeksi = useCallback((id: string) => {
    setTerbuka(false);
    const sasaran = document.getElementById(id);
    if (!sasaran) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    sasaran.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    if (!terbuka) return;

    const sebelumnya = document.activeElement as HTMLElement | null;
    // Disalin sekarang: pada saat cleanup berjalan, ref bisa sudah berubah.
    const tombolPemicu = pemicu.current;
    const overflowAsli = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const terfokuskan = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])') ??
          [],
      ).filter((el) => el.offsetParent !== null);

    function padaTombol(peristiwa: KeyboardEvent) {
      if (peristiwa.key === 'Escape') {
        peristiwa.stopPropagation();
        setTerbuka(false);
        return;
      }

      if (peristiwa.key !== 'Tab') return;

      const daftar = terfokuskan();
      const pertama = daftar[0];
      const terakhir = daftar[daftar.length - 1];
      if (!pertama || !terakhir) return;

      if (peristiwa.shiftKey && document.activeElement === pertama) {
        peristiwa.preventDefault();
        terakhir.focus();
      } else if (!peristiwa.shiftKey && document.activeElement === terakhir) {
        peristiwa.preventDefault();
        pertama.focus();
      }
    }

    document.addEventListener('keydown', padaTombol, true);
    const jeda = window.setTimeout(() => terfokuskan()[0]?.focus(), 40);

    return () => {
      document.removeEventListener('keydown', padaTombol, true);
      window.clearTimeout(jeda);
      document.body.style.overflow = overflowAsli;
      (sebelumnya ?? tombolPemicu)?.focus?.();
    };
  }, [terbuka]);

  return (
    <>
      <nav className="pil" aria-label="Navigasi utama">
        <a
          className="pil__tombol"
          href={`mailto:${SUREL}`}
          aria-label={`Kirim surel ke ${SUREL}`}
        >
          <IkonSurel />
        </a>

        <span className="pil__tanda">F&middot;S</span>

        <button
          ref={pemicu}
          type="button"
          className="pil__tombol"
          aria-expanded={terbuka}
          aria-label={terbuka ? 'Tutup menu' : 'Buka menu'}
          onClick={() => setTerbuka((nilai) => !nilai)}
        >
          {terbuka ? <IkonTutup /> : <IkonMenu />}
        </button>
      </nav>

      {terbuka ? (
        <div ref={panel} className="menu" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="menu__tutup" onClick={tutup} aria-label="Tutup menu">
            <IkonTutup />
          </button>

          <ul className="menu__daftar">
            {TAUTAN_MENU.map((tautan) => (
              <li key={tautan.target}>
                <button
                  type="button"
                  className="menu__tautan"
                  onClick={() => menujuSeksi(tautan.target)}
                >
                  <span className="menu__indeks">{tautan.nomor}</span>
                  {tautan.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="menu__kaki mono">
            <span>Fluid Studio</span>
            <a href={`mailto:${SUREL}`} style={{ color: 'inherit' }}>
              {SUREL}
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
