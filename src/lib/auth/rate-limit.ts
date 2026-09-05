import 'server-only';

/**
 * Rate limiting sederhana berbasis memori untuk percobaan login.
 *
 * BATASAN YANG HARUS DISADARI:
 * - State disimpan per proses. Pada deployment serverless/multi-instance,
 *   setiap instance punya hitungannya sendiri, jadi batas efektifnya lebih
 *   longgar daripada angka yang dikonfigurasi.
 * - State hilang saat proses restart.
 *
 * Untuk produksi, ganti implementasi ini dengan penyimpanan bersama
 * (Upstash Redis, Vercel KV, atau tabel Postgres) tanpa mengubah pemanggil.
 * Supabase Auth sendiri juga sudah punya rate limit di sisi server; lapisan
 * ini menambah pertahanan di sisi aplikasi.
 */

interface Percobaan {
  jumlah: number;
  pertamaPada: number;
  diblokirSampai: number | null;
}

const MAKS_PERCOBAAN = bacaAngka(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS, 5, 1, 100);
const JENDELA_MS = bacaAngka(process.env.LOGIN_RATE_LIMIT_WINDOW_SECONDS, 300, 30, 86_400) * 1000;
const DURASI_BLOKIR_MS =
  bacaAngka(process.env.LOGIN_RATE_LIMIT_BLOCK_SECONDS, 900, 30, 86_400) * 1000;

const MAKS_ENTRI = 10_000;

function bacaAngka(nilai: string | undefined, bawaan: number, min: number, max: number): number {
  const angka = Number(nilai);
  if (!Number.isFinite(angka)) return bawaan;
  return Math.min(Math.max(Math.trunc(angka), min), max);
}

const penyimpanan = new Map<string, Percobaan>();

function bersihkanKedaluwarsa(sekarang: number): void {
  for (const [kunci, data] of penyimpanan) {
    const blokirSelesai = data.diblokirSampai !== null && data.diblokirSampai <= sekarang;
    const jendelaLewat = sekarang - data.pertamaPada > JENDELA_MS;
    if ((data.diblokirSampai === null && jendelaLewat) || blokirSelesai) {
      penyimpanan.delete(kunci);
    }
  }

  // Jaring pengaman terhadap pertumbuhan memori tak terbatas.
  if (penyimpanan.size > MAKS_ENTRI) {
    const kelebihan = penyimpanan.size - MAKS_ENTRI;
    let dihapus = 0;
    for (const kunci of penyimpanan.keys()) {
      penyimpanan.delete(kunci);
      if (++dihapus >= kelebihan) break;
    }
  }
}

export interface HasilRateLimit {
  diizinkan: boolean;
  sisaPercobaan: number;
  cobaLagiDetik: number;
}

/** Memeriksa status tanpa menambah hitungan. */
export function periksaRateLimit(kunci: string): HasilRateLimit {
  const sekarang = Date.now();
  bersihkanKedaluwarsa(sekarang);

  const data = penyimpanan.get(kunci);
  if (!data) {
    return { diizinkan: true, sisaPercobaan: MAKS_PERCOBAAN, cobaLagiDetik: 0 };
  }

  if (data.diblokirSampai !== null && data.diblokirSampai > sekarang) {
    return {
      diizinkan: false,
      sisaPercobaan: 0,
      cobaLagiDetik: Math.ceil((data.diblokirSampai - sekarang) / 1000),
    };
  }

  return {
    diizinkan: true,
    sisaPercobaan: Math.max(MAKS_PERCOBAAN - data.jumlah, 0),
    cobaLagiDetik: 0,
  };
}

/** Menambah hitungan kegagalan dan memblokir bila melewati batas. */
export function catatKegagalan(kunci: string): HasilRateLimit {
  const sekarang = Date.now();
  bersihkanKedaluwarsa(sekarang);

  const data = penyimpanan.get(kunci);

  if (!data || sekarang - data.pertamaPada > JENDELA_MS) {
    penyimpanan.set(kunci, { jumlah: 1, pertamaPada: sekarang, diblokirSampai: null });
    return { diizinkan: true, sisaPercobaan: MAKS_PERCOBAAN - 1, cobaLagiDetik: 0 };
  }

  data.jumlah += 1;

  if (data.jumlah >= MAKS_PERCOBAAN) {
    data.diblokirSampai = sekarang + DURASI_BLOKIR_MS;
    penyimpanan.set(kunci, data);
    return {
      diizinkan: false,
      sisaPercobaan: 0,
      cobaLagiDetik: Math.ceil(DURASI_BLOKIR_MS / 1000),
    };
  }

  penyimpanan.set(kunci, data);
  return {
    diizinkan: true,
    sisaPercobaan: MAKS_PERCOBAAN - data.jumlah,
    cobaLagiDetik: 0,
  };
}

/** Dipanggil setelah login berhasil agar hitungan tidak menumpuk. */
export function resetRateLimit(kunci: string): void {
  penyimpanan.delete(kunci);
}
