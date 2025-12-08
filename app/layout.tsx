import './globals.css'
import type { Metadata } from 'next'

import { Inter, JetBrains_Mono } from 'next/font/google'

import ErrorBoundary from '@/components/ErrorBoundary'
import ServiceWorkerProvider from '@/components/ServiceWorkerProvider'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'AIDebate.io - Where humanity decides which AI to trust',
  description: 'Watch AI models debate. Vote on winners. Build your AI expertise.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <ErrorBoundary>
          <ServiceWorkerProvider>
            {children}
          </ServiceWorkerProvider>
        </ErrorBoundary>
        <Footer />
      </body>
    </html>
  )
}
