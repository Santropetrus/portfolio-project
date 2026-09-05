import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';

import { PenyediaToast } from '@/components/ui/toast';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});

/**
 * Serif bergaya mincho untuk judul: kontras tebal-tipis yang tinggi memberi
 * kesan kedai teh Jepang modern. Dipilih varian Latin karena seluruh UI
 * berbahasa Indonesia — font mincho asli membawa ribuan glif Jepang
 * (belasan MB) yang tidak pernah terpakai di sini.
 */
const mincho = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-mincho',
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
  themeColor: '#3f5f2e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${mincho.variable}`}>
      <body className="min-h-dvh antialiased">
        <PenyediaToast>{children}</PenyediaToast>
      </body>
    </html>
  );
}
