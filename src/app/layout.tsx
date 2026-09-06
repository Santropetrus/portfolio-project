import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import { PenyediaToast } from '@/components/ui/toast';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

import './globals.css';

/**
 * Dua huruf saja, dipakai dengan disiplin.
 *
 * Inter memikul semuanya — dari angka setinggi 3rem sampai teks bantu 12px —
 * dengan bobot 800 untuk judul dan angka. JetBrains Mono khusus untuk label
 * teknis: header kolom, status, dan metadata.
 *
 * Serif sengaja dibuang. Serif dekoratif di atas tabel inventori membuat
 * antarmuka terbaca seperti undangan, bukan alat kerja.
 */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

const monoTeknis = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono-teknis',
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_TAGLINE,
  applicationName: APP_NAME,
  // Aplikasi internal: jangan diindeks mesin pencari.
  robots: { index: false, follow: false, nocache: true },
  formatDetection: { email: false, telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#1e2e18',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${monoTeknis.variable}`}>
      <body className="min-h-dvh antialiased">
        <PenyediaToast>{children}</PenyediaToast>
      </body>
    </html>
  );
}
