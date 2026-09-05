import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Poppins } from 'next/font/google';

import './studio.css';

/**
 * Tipografi Fluid Studio.
 *
 * Inter Black memikul judul raksasa; Poppins dipakai khusus untuk kata
 * berkontur karena bentuk hurufnya geometris dan bundar, sehingga garis
 * luarnya terbaca bersih. JetBrains Mono mengisi label teknis kecil.
 * Hanya subset latin dan bobot yang benar-benar dipakai yang diambil.
 */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500'],
  display: 'swap',
  variable: '--font-poppins',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Fluid Studio — Digital design × motion systems',
  description:
    'A fictional studio shaping interfaces, identities and moving images since 2019.',
  robots: { index: false, follow: false },
};

export default function LayoutStudio({ children }: { children: React.ReactNode }) {
  return (
    <div className={`studio ${inter.variable} ${poppins.variable} ${mono.variable}`}>
      {children}
    </div>
  );
}
