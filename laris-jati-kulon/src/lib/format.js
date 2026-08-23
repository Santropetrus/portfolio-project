/** Format angka jadi rupiah tanpa desimal: 15000 -> "Rp15.000" */
export function rupiah(nilai) {
  if (nilai === null || nilai === undefined || nilai === '') return null
  const angka = Number(nilai)
  if (Number.isNaN(angka)) return null
  return 'Rp' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(angka)
}

/** "Rp15.000 / porsi" — satuan opsional, boleh kosong sesuai skema */
export function hargaLengkap(harga, satuan) {
  const h = rupiah(harga)
  if (!h) return 'Hubungi penjual'
  return satuan ? `${h} / ${satuan}` : h
}

/** Ubah teks jadi slug URL: "Jenang Bu Sriatun" -> "jenang-bu-sriatun" */
export function buatSlug(teks = '') {
  return teks
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Pecah teks misi (satu baris per poin) jadi array */
export function baris(teks = '') {
  return String(teks)
    .split('\n')
    .map((b) => b.replace(/^\s*[-•\d.]+\s*/, '').trim())
    .filter(Boolean)
}

/** Tanggal singkat Indonesia: "21 Agu 2026" */
export function tanggalSingkat(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
