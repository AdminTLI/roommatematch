import { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getPlatformSettings } from '@/lib/platform-settings'

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, siteDescription } = await getPlatformSettings()
  const defaultTitle = `Find Your Perfect Roommate in Netherlands | ${siteName} - Shared Living for Students & Young Professionals`

  return {
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'find roommate Netherlands',
    'student housing Netherlands',
    'roommate matching',
    'young professionals flatmate',
    'shared living Netherlands',
    'find housemate Amsterdam',
    'student room Rotterdam',
    'flatmate Netherlands',
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
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
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
    siteName,
    title: defaultTitle,
    description: siteDescription,
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
    title: defaultTitle,
    description: siteDescription,
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
}

export default function MarketingLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}

