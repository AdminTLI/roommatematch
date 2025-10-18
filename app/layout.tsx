import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Roommate Match - Find Your Perfect Roommate',
  description: 'Connect with fellow students and find your ideal roommate match. Safe, verified, and designed for Dutch universities.',
  keywords: ['roommate', 'housing', 'student', 'Netherlands', 'university', 'room sharing'],
  authors: [{ name: 'Roommate Match Team' }],
  creator: 'Roommate Match',
  publisher: 'Roommate Match',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Roommate Match - Find Your Perfect Roommate',
    description: 'Connect with fellow students and find your ideal roommate match. Safe, verified, and designed for Dutch universities.',
    siteName: 'Roommate Match',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roommate Match - Find Your Perfect Roommate',
    description: 'Connect with fellow students and find your ideal roommate match. Safe, verified, and designed for Dutch universities.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <a 
            href="#main-content" 
            className="skip-to-content"
          >
            Skip to main content
          </a>
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
