import Tombol from '../../components/ui/Tombol'
import SeratKayu from '../../components/ui/SeratKayu'

export default function TidakDitemukan() {
  return (
    <div className="mx-auto max-w-los px-5 py-24 lg:px-8">
      <p className="tulis text-[1.4rem] leading-none text-indigo">wah, nyasar</p>
      <h1 className="mt-2 text-[clamp(2rem,6vw,3.4rem)]">Halaman ini tidak ada.</h1>
      <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-wood-dark/80">
        Alamat yang Anda buka mungkin salah ketik, atau halamannya sudah dipindah. Coba mulai lagi
        dari katalog.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Tombol to="/katalog" besar="lg">
          Buka katalog
        </Tombol>
        <Tombol to="/" variasi="garis" besar="lg">
          Ke beranda
        </Tombol>
      </div>
      <SeratKayu className="mt-14 opacity-45" />
    </div>
  )
}
