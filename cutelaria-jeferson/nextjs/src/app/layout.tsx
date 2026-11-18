import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/layout/CartSidebar';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Cutelaria Jeferson — Facas Artesanais Premium',
    template: '%s | Cutelaria Jeferson',
  },
  description: 'Facas artesanais de alta qualidade para churrasco, campo e coleção. Kits exclusivos, acessórios e muito mais.',
  keywords: 'facas artesanais, cutelaria, facas de churrasco, canivetes, kits de facas',
  authors: [{ name: 'Cutelaria Jeferson' }],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Cutelaria Jeferson',
    title: 'Cutelaria Jeferson — Facas Artesanais Premium',
    description: 'Facas artesanais de alta qualidade para churrasco, campo e coleção.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-bg-primary text-text-primary font-body">
        <ThemeProvider>
          <CartProvider>
            <Header />
            <CartSidebar />
            <main>{children}</main>
            <Footer />
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                },
              }}
            />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
