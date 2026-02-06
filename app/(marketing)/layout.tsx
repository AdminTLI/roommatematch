import { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: {
    default: 'Find Your Perfect Roommate in Netherlands | Domu Match - Verified Student Housing',
    template: '%s | Domu Match',
  },
  description: 'Find compatible roommates in the Netherlands with science-backed matching. Verified students, safe platform, perfect for Amsterdam, Rotterdam, Utrecht, and all Dutch universities. Start matching today!',
  keywords: [
    'find roommate Netherlands',
    'student housing Netherlands',
    'roommate matching',
    'student accommodation',
    'find housemate Amsterdam',
    'student room Rotterdam',
    'university housing',
    'compatible roommate',
    'student housing Amsterdam',
    'roommate finder Netherlands',
    'Dutch student housing',
    'verified roommate matching',
    'student accommodation Netherlands',
    'find roommate Utrecht',
    'student housing platform',
    'verified student roommates',
    'compatible roommate finder',
    'Netherlands student housing platform',
    'roommate app Netherlands',
    'student roommate finder',
    'safe roommate matching',
    'AI roommate matching',
    'science-backed roommate finder',
    'roommate compatibility test',
    'find flatmate Netherlands',
  ],
  authors: [{ name: 'Domu Match' }],
  creator: 'Domu Match',
  publisher: 'Domu Match',
  metadataBase: new URL('https://domumatch.com'),
  alternates: {
    canonical: 'https://domumatch.com',
    languages: {
      'en-US': '/',
      'nl-NL': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'nl_NL',
    url: 'https://domumatch.com',
    siteName: 'Domu Match',
    title: 'Find Your Perfect Roommate in Netherlands | Domu Match',
    description: 'Find compatible roommates in the Netherlands with science-backed matching. Verified students, safe platform, perfect for Dutch universities.',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Domu Match - Find Your Perfect Roommate',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Perfect Roommate in Netherlands | Domu Match',
    description: 'Find compatible roommates in the Netherlands with science-backed matching. Verified students, safe platform.',
    images: ['https://domumatch.com/images/logo.png'],
    creator: '@domumatch',
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
    // Add when available: google: 'verification-code',
    // Add when available: yandex: 'verification-code',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}

