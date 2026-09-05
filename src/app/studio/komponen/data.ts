export interface Karya {
  nomor: string;
  nama: string;
  kategori: string;
  tahun: string;
  tekstur: string;
}

export const DAFTAR_KARYA: ReadonlyArray<Karya> = [
  { nomor: '01', nama: 'Meridian', kategori: 'Brand system', tahun: '2024', tekstur: 'karya-1' },
  { nomor: '02', nama: 'Vessel', kategori: 'Packaging & art direction', tahun: '2024', tekstur: 'karya-2' },
  { nomor: '03', nama: 'Nocturne', kategori: 'Film & motion', tahun: '2023', tekstur: 'karya-3' },
  { nomor: '04', nama: 'Basin', kategori: 'Spatial installation', tahun: '2023', tekstur: 'karya-4' },
  { nomor: '05', nama: 'Halide', kategori: 'Web experience', tahun: '2022', tekstur: 'karya-5' },
  { nomor: '06', nama: 'Drift', kategori: 'Identity & motion', tahun: '2022', tekstur: 'karya-6' },
] as const;

export interface Kapabilitas {
  nomor: string;
  nama: string;
  teks: string;
}

export const DAFTAR_KAPABILITAS: ReadonlyArray<Kapabilitas> = [
  {
    nomor: '01',
    nama: 'Film & Motion',
    teks: 'Title sequences, product films and looping systems. We storyboard, shoot or synthesise, then grade every frame so the piece holds together at any length.',
  },
  {
    nomor: '02',
    nama: 'Spatial',
    teks: 'Installations, projection and exhibition graphics. Work that has to survive being walked around, lit badly and photographed from the wrong angle.',
  },
  {
    nomor: '03',
    nama: 'Web Systems',
    teks: 'Design systems and front-end architecture built to be handed over. Components, tokens and documentation that a team can keep extending without us.',
  },
  {
    nomor: '04',
    nama: 'Identity',
    teks: 'Marks, type systems and the rules that hold them together — written down plainly enough that they still work three years after we leave.',
  },
] as const;

export interface KataBerjalan {
  kata: string;
  label: string;
}

export const KATA_BERJALAN: ReadonlyArray<KataBerjalan> = [
  { kata: 'Motion', label: 'Film & Motion' },
  { kata: 'Spatial', label: 'Spatial' },
  { kata: 'Web', label: 'Systems' },
  { kata: 'Identity', label: 'Branding' },
] as const;

export const TAUTAN_MENU = [
  { nomor: '01', label: 'Index', target: 'atas' },
  { nomor: '02', label: 'Work', target: 'karya' },
  { nomor: '03', label: 'Studio', target: 'kapabilitas' },
  { nomor: '04', label: 'Contact', target: 'kontak' },
] as const;

export const SUREL = 'hello@fluid.studio';
