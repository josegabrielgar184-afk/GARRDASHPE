import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GarrdashpeYT',
  description: 'GARRDASHPE - Juego espacial y apocalipsis zombie. Gana monedas, sube al top global y compite en el ranking mundial.',
  applicationName: 'GarrdashpeYT',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GarrdashpeYT',
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: 'GarrdashpeYT',
    description: 'Juego espacial y apocalipsis zombie con economia y torneo global.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#0a0e1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className} style={{ background: 'hsl(222 47% 6%)' }}>
        {children}
      </body>
    </html>
  );
}
