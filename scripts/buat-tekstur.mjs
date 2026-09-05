/**
 * Pembangkit tekstur SVG untuk Fluid Studio.
 *
 * Seluruh citra pada halaman ini dibangkitkan secara prosedural memakai
 * feTurbulence, bukan foto. Alasannya dua:
 *
 *   1. Content-Security-Policy aplikasi ini hanya mengizinkan gambar dari
 *      origin sendiri (`img-src 'self' blob: data:`), jadi tidak ada CDN foto.
 *   2. Tekstur prosedural berukuran beberapa kilobyte, bukan megabyte, dan
 *      tetap tajam di ukuran berapa pun.
 *
 * Jalankan ulang dengan:  node scripts/buat-tekstur.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AKAR = join(dirname(fileURLToPath(import.meta.url)), '..');
const TUJUAN = join(AKAR, 'public', 'tekstur');

/**
 * Profil urat: bagaimana nilai keabuan noise dipetakan menjadi terang-gelap.
 *
 * feComponentTransfer type="table" menyebar entri tabel secara merata pada
 * rentang 0..1 lalu menginterpolasinya. Jadi larik yang sebagian besar berisi
 * nilai mendekati nol dengan beberapa puncak akan mengubah noise yang rata
 * menjadi bidang gelap dengan urat terang — persis cara marmer terbaca.
 */
const PROFIL = {
  // Urat tajam dan jarang, seperti marmer atau tinta yang mengendap.
  marmer: [0, 0, 0.02, 0, 0.04, 0.9, 0.12, 0, 0.02, 0, 0.4, 0.03, 0],
  // Puncak lebih sering dan lebih lembut, seperti riak air.
  ombak: [0, 0.02, 0.09, 0.28, 0.06, 0, 0.04, 0.2, 0.62, 0.1, 0.01, 0, 0.15, 0],
  // Gumpalan asap: transisi panjang, sedikit sorotan.
  asap: [0, 0, 0.01, 0.05, 0.14, 0.05, 0, 0.02, 0.3, 0.08, 0, 0.01, 0],
};

/**
 * Mengubah profil menjadi tiga tabel kanal: warna berjalan dari `gelap`
 * menuju `terang` mengikuti nilai profil.
 */
function pitaUrat(gelap, terang, profil) {
  const kanal = (i) =>
    profil.map((l) => (gelap[i] + (terang[i] - gelap[i]) * l).toFixed(4)).join(' ');

  return `
      <feComponentTransfer>
        <feFuncR type="table" tableValues="${kanal(0)}"/>
        <feFuncG type="table" tableValues="${kanal(1)}"/>
        <feFuncB type="table" tableValues="${kanal(2)}"/>
      </feComponentTransfer>`;
}

const KE_ABU =
  '<feColorMatrix type="matrix" values="0.33 0.33 0.34 0 0 0.33 0.33 0.34 0 0 0.33 0.33 0.34 0 0 0 0 0 0 1"/>';

/** Tekstur gelap bergaya marmer / tinta dalam air. */
function tekstur({
  lebar = 900,
  tinggi = 900,
  frekuensi,
  oktaf = 7,
  benih,
  gelap,
  terang,
  profil = 'marmer',
  buram = 0.5,
  jenis = 'fractalNoise',
  vignette = 0.68,
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lebar}" height="${tinggi}" viewBox="0 0 ${lebar} ${tinggi}">
  <defs>
    <filter id="t" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="${jenis}" baseFrequency="${frekuensi}" numOctaves="${oktaf}" seed="${benih}"/>
      ${KE_ABU}
      ${pitaUrat(gelap, terang, PROFIL[profil])}
      <feGaussianBlur stdDeviation="${buram}"/>
    </filter>
    <radialGradient id="v" cx="50%" cy="45%" r="78%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="${vignette}"/>
    </radialGradient>
  </defs>
  <rect width="${lebar}" height="${tinggi}" filter="url(#t)"/>
  <rect width="${lebar}" height="${tinggi}" fill="url(#v)"/>
</svg>`;
}

/**
 * Kabut/tinta yang menyebar — dipakai sebagai latar hero.
 *
 * Kuncinya: luminance noise dipindahkan ke kanal ALPHA (baris terakhir
 * feColorMatrix), sementara RGB dipaksa menjadi satu warna teal. Tanpa itu
 * alpha tetap 1 di mana-mana dan hasilnya cuma persegi panjang polos.
 */
function kabut({ lebar = 1400, tinggi = 1000, benih, frekuensi = '0.0032', kuat = 1.15 }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lebar}" height="${tinggi}" viewBox="0 0 ${lebar} ${tinggi}">
  <defs>
    <filter id="k" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${frekuensi}" numOctaves="6" seed="${benih}"/>
      <feColorMatrix type="matrix" values="
        0 0 0 0 0.317
        0 0 0 0 0.470
        0 0 0 0 0.440
        0.33 0.33 0.34 0 0"/>
      <!-- Pertajam kontras alpha supaya noise rata menjadi gumpalan. -->
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0 0.03 0.22 0.62 0.95 1"/>
      </feComponentTransfer>
      <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ${kuat} 0"/>
      <feGaussianBlur stdDeviation="14"/>
    </filter>
  </defs>
  <rect width="${lebar}" height="${tinggi}" filter="url(#k)"/>
</svg>`;
}

/** Butiran film halus untuk lapisan paling atas. */
function butiran() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
  <filter id="b" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/>
  </filter>
  <rect width="220" height="220" filter="url(#b)" opacity="0.42"/>
</svg>`;
}

// Palet gelap: hijau-biru laut dalam, dengan urat terang keperakan.
const LAUT_GELAP = [0.022, 0.052, 0.061];
const LAUT_TERANG = [0.60, 0.72, 0.71];
const TINTA_GELAP = [0.018, 0.038, 0.044];
const TINTA_TERANG = [0.74, 0.82, 0.82];

const berkas = {
  // Enam sisi kubus — bergantian antara riak air dan marmer tinta.
  'kubus-1.svg': tekstur({ frekuensi: '0.0022 0.028', oktaf: 7, benih: 11, gelap: LAUT_GELAP, terang: LAUT_TERANG, profil: 'ombak', buram: 0.4 }),
  'kubus-2.svg': tekstur({ frekuensi: '0.006 0.011', oktaf: 8, benih: 27, gelap: TINTA_GELAP, terang: TINTA_TERANG, profil: 'marmer', buram: 0.7 }),
  'kubus-3.svg': tekstur({ frekuensi: '0.0035 0.02', oktaf: 6, benih: 44, gelap: LAUT_GELAP, terang: LAUT_TERANG, profil: 'ombak', buram: 0.5 }),
  'kubus-4.svg': tekstur({ frekuensi: '0.0032 0.008', oktaf: 6, benih: 63, gelap: TINTA_GELAP, terang: TINTA_TERANG, profil: 'marmer', buram: 0.8 }),
  'kubus-5.svg': tekstur({ frekuensi: '0.0018 0.035', oktaf: 7, benih: 82, gelap: LAUT_GELAP, terang: LAUT_TERANG, profil: 'ombak', buram: 0.35 }),
  'kubus-6.svg': tekstur({ frekuensi: '0.0028 0.016', oktaf: 7, benih: 96, gelap: LAUT_GELAP, terang: LAUT_TERANG, profil: 'ombak', buram: 0.55 }),

  // Citra untuk pita hero dan kartu karya.
  'karya-1.svg': tekstur({ lebar: 700, tinggi: 900, frekuensi: '0.004 0.017', benih: 5, gelap: TINTA_GELAP, terang: TINTA_TERANG, profil: 'marmer', buram: 0.6 }),
  'karya-2.svg': tekstur({ lebar: 700, tinggi: 900, frekuensi: '0.0026 0.03', benih: 19, gelap: LAUT_GELAP, terang: LAUT_TERANG, profil: 'ombak', buram: 0.45 }),
  'karya-3.svg': tekstur({ lebar: 700, tinggi: 900, frekuensi: '0.0035 0.009', benih: 33, gelap: TINTA_GELAP, terang: TINTA_TERANG, profil: 'marmer', buram: 0.75 }),
  'karya-4.svg': tekstur({ lebar: 700, tinggi: 900, frekuensi: '0.0015 0.04', benih: 51, gelap: LAUT_GELAP, terang: LAUT_TERANG, profil: 'ombak', buram: 0.3 }),
  'karya-5.svg': tekstur({ lebar: 700, tinggi: 900, frekuensi: '0.0055 0.012', benih: 77, gelap: TINTA_GELAP, terang: TINTA_TERANG, profil: 'marmer', buram: 0.7 }),
  'karya-6.svg': tekstur({ lebar: 700, tinggi: 900, frekuensi: '0.002 0.026', benih: 88, gelap: LAUT_GELAP, terang: LAUT_TERANG, profil: 'ombak', buram: 0.42 }),

  // Latar kabut hero.
  'kabut-1.svg': kabut({ benih: 3 }),
  'kabut-2.svg': kabut({ benih: 21, frekuensi: '0.0024', kuat: 0.9 }),

  'butiran.svg': butiran(),
};

mkdirSync(TUJUAN, { recursive: true });

let total = 0;
for (const [nama, isi] of Object.entries(berkas)) {
  const rapi = isi.replace(/\n\s*/g, ' ').trim();
  writeFileSync(join(TUJUAN, nama), rapi);
  total += rapi.length;
  console.log(`${nama.padEnd(16)} ${String(rapi.length).padStart(6)} B`);
}
console.log(`\n${Object.keys(berkas).length} berkas, total ${(total / 1024).toFixed(1)} KB`);
