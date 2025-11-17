import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Domu Match - Cookie Usage',
  description: 'Read Domu Match cookie policy. Learn how we use cookies, comply with EU ePrivacy Directive, and manage tracking on our roommate matching platform in the Netherlands.',
  keywords: [
    'Domu Match cookie policy',
    'cookie usage',
    'EU ePrivacy Directive',
    'cookie consent',
    'tracking cookies',
    'Netherlands cookie policy',
  ],
  openGraph: {
    title: 'Cookie Policy | Domu Match',
    description: 'Read Domu Match cookie policy. Learn how we use cookies and comply with EU ePrivacy Directive.',
    type: 'website',
    url: 'https://domumatch.vercel.app/cookies',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Cookie Policy - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | Domu Match',
    description: 'Read Domu Match cookie policy. Learn how we use cookies and comply with EU ePrivacy Directive.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/cookies',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

