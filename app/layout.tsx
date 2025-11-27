import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper'
import { Providers } from '@/app/providers'
import { ConditionalAnalytics } from '@/components/privacy/conditional-analytics'
import { CookieConsentBanner } from '@/components/privacy/cookie-consent-banner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Domu Match - From strangers to roommates',
  description: 'From strangers to roommates. Connect with fellow students and find your ideal roommate match. Safe, verified, and designed for Dutch universities.',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#4F46E5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundaryWrapper>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundaryWrapper>
        <Toaster position="top-right" richColors />
        <ConditionalAnalytics />
        <CookieConsentBanner />
      </body>
    </html>
  )
}