import { DAFTAR_KAPABILITAS, DAFTAR_KARYA, SUREL } from './data';
import { IkonPanah } from './ikon';

/**
 * Seksi-seksi tanpa gerak yang digerakkan gulir.
 *
 * Semuanya Server Component: tidak ada satu pun byte JavaScript yang dikirim
 * untuk bagian ini. Animasi masuknya ditangani `PerilakuHalaman`, yang cukup
 * mengamati kelas `.tersingkap`.
 */

export function Karya() {
  return (
    <section className="seksi seksi--kertas" id="karya">
      <header className="seksi__kepala">
        <h2 className="seksi__judul tersingkap">Selected work</h2>
        <span className="mono tersingkap" data-jeda="1">
          ( 2022 &mdash; 2024 )
        </span>
      </header>

      <div className="karya">
        {DAFTAR_KARYA.map((karya, indeks) => (
          <article
            key={karya.nomor}
            className="tersingkap"
            data-jeda={String((indeks % 3) + 1)}
          >
            <button type="button" className="karya__kartu">
              <div className="karya__bingkai">
                <span className="karya__nomor mono">{karya.nomor}</span>
                <div
                  className="karya__gambar"
                  style={{ backgroundImage: `url('/tekstur/${karya.tekstur}.svg')` }}
                />
              </div>
              <div className="karya__meta">
                <h3 className="karya__nama">{karya.nama}</h3>
                <span className="karya__kategori mono">{karya.tahun}</span>
              </div>
              <p className="karya__kategori mono" style={{ paddingTop: '0.25rem' }}>
                {karya.kategori}
              </p>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Kapabilitas() {
  return (
    <section className="seksi seksi--sage" id="kapabilitas">
      <header className="seksi__kepala">
        <h2 className="seksi__judul tersingkap">Capabilities</h2>
        <span className="mono tersingkap" data-jeda="1">
          ( Four disciplines )
        </span>
      </header>

      <div className="kapabilitas">
        {DAFTAR_KAPABILITAS.map((butir, indeks) => (
          <div
            key={butir.nomor}
            className="kapabilitas__baris tersingkap"
            data-jeda={String((indeks % 4) + 1)}
          >
            <span className="mono">{butir.nomor}</span>
            <h3 className="kapabilitas__nama">{butir.nama}</h3>
            <p className="kapabilitas__teks">{butir.teks}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Kontak() {
  return (
    <section className="seksi seksi--gelap" id="kontak">
      <header className="seksi__kepala">
        <span className="mono">( Contact )</span>
        <span className="mono">Jakarta &middot; Remote</span>
      </header>

      <h2 className="kontak__judul tersingkap">
        Let&rsquo;s build
        <br />
        something fluid.
      </h2>

      <a className="kontak__surel tersingkap" data-jeda="1" href={`mailto:${SUREL}`}>
        {SUREL}
        <IkonPanah />
      </a>

      <dl className="kontak__kisi mono tersingkap" data-jeda="2">
        <div>
          <dt>Studio</dt>
          <dd className="kontak__nilai">Fluid Studio</dd>
        </div>
        <div>
          <dt>Founded</dt>
          <dd className="kontak__nilai">2019</dd>
        </div>
        <div>
          <dt>Disciplines</dt>
          <dd className="kontak__nilai">Motion / Spatial / Web</dd>
        </div>
        <div>
          <dt>Availability</dt>
          <dd className="kontak__nilai">Q3 2026</dd>
        </div>
      </dl>

      <div className="kontak__kaki mono">
        <span>&copy; 2026 Fluid Studio</span>
        <span>A fictional studio</span>
      </div>
    </section>
  );
}
