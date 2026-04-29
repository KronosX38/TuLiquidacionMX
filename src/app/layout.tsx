import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TuLiquidaciónMx — Calculadora de liquidaciones laborales',
  description:
    'Calcula tu liquidación, finiquito o indemnización por despido en México. ' +
    'Gratis, offline y conforme a la Ley Federal del Trabajo. ' +
    'Incluye cálculo de SDI, prima de antigüedad e ISR.',
  keywords: [
    'calculadora liquidación laboral',
    'finiquito México',
    'despido injustificado',
    'indemnización laboral',
    'LFT',
    'Yucatán',
    'cálculo liquidación',
  ],
  authors: [{ name: 'Nodeva Consultoría Digital', url: 'https://nodeva.mx' }],
  creator: 'Nodeva Consultoría Digital',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TuLiquidaciónMx',
  },
  openGraph: {
    title: 'TuLiquidaciónMx',
    description: 'Calcula tu liquidación laboral gratis y sin registro',
    type: 'website',
    locale: 'es_MX',
  },
}

export const viewport: Viewport = {
  themeColor: '#212121',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-MX">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-bg-primary text-brand-white antialiased">
        {children}
      </body>
    </html>
  )
}
