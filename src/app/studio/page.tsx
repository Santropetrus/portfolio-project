import { Hero } from './komponen/hero';
import { PerilakuHalaman } from './komponen/pengamat-singkap';
import { PenggarisKedalaman } from './komponen/penggaris';
import { PilNavigasi } from './komponen/pil-navigasi';
import { SeksiKubus } from './komponen/seksi-kubus';
import { Kapabilitas, Karya, Kontak } from './komponen/seksi-statis';

/**
 * Halaman Fluid Studio.
 *
 * Halaman publik — tidak memerlukan sesi maupun Supabase.
 *
 * Dirender statis. Dulu halaman ini dipaksa dinamis supaya tag <script> Next
 * bisa menerima nonce per-request dari middleware; sekarang `/studio` sudah
 * dikecualikan dari middleware (lihat `config.matcher` di src/proxy.ts) dan
 * memakai CSP statis dari next.config.ts, jadi prerender statis kembali aman
 * sekaligus membuat halaman ini terbuka tanpa konfigurasi apa pun.
 */
export default function HalamanStudio() {
  return (
    <>
      <PerilakuHalaman />

      <header className="bilah-atas">
        <span className="mono">Fluid Studio</span>
        <span className="bilah-atas__tanda">F&middot;S</span>
        <span className="bilah-atas__kanan mono">Digital design &times; Motion systems</span>
      </header>

      <PenggarisKedalaman />

      <main>
        <Hero />
        <SeksiKubus />
        <Karya />
        <Kapabilitas />
        <Kontak />
      </main>

      <PilNavigasi />

      <div className="butiran" aria-hidden="true" />
    </>
  );
}
