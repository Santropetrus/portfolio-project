import { Hero } from './komponen/hero';
import { PerilakuHalaman } from './komponen/pengamat-singkap';
import { PenggarisKedalaman } from './komponen/penggaris';
import { PilNavigasi } from './komponen/pil-navigasi';
import { SeksiKubus } from './komponen/seksi-kubus';
import { Kapabilitas, Karya, Kontak } from './komponen/seksi-statis';

/**
 * Halaman Fluid Studio.
 *
 * Halaman publik — tidak memerlukan sesi. Lihat `RUTE_PUBLIK` di src/proxy.ts.
 *
 * WAJIB dirender dinamis meskipun isinya sepenuhnya statis.
 * Content-Security-Policy aplikasi ini memakai nonce yang dibangkitkan ulang
 * pada setiap permintaan (src/proxy.ts). Nonce itu hanya bisa ditempelkan ke
 * tag <script> Next bila halaman dirender saat permintaan datang. Bila
 * halaman di-prerender saat build, HTML-nya membawa nonce lama (atau tidak
 * sama sekali) sementara header membawa nonce baru — dan browser memblokir
 * SELURUH JavaScript halaman. Halaman tetap tampil, tapi mati total.
 */
export const dynamic = 'force-dynamic';
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
