import type { Metadata } from 'next'
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { readConfig } from '@/lib/config'

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})
const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'RECA Componentes'

export const metadata: Metadata = {
  title: {
    default: `${storeName} — Microcontroladores e Eletrônica`,
    template: `%s · ${storeName}`,
  },
  description:
    'Loja de componentes eletrônicos: microcontroladores, sensores, resistores, capacitores, CIs, ferramentas e muito mais. Preço de quem compra direto e envio para todo o Brasil.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await readConfig()
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable} light`}>
      <body className="pcb-bg min-h-screen flex flex-col">
        <ThemeProvider>
          <ToastProvider>
            <CartProvider>
              {config.bannerTexto && (
                <div className="bg-surface-2 border-b border-line px-4 py-1.5 text-center text-xs font-medium text-text-secondary">
                  {config.bannerTexto}
                </div>
              )}
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
