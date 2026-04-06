import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie & Local Storage Policy | Domu Match',
  description:
    'Domu Match Cookie & Local Storage Statement: HTTP cookies, localStorage, and similar technologies; AP-aligned consent; Supabase, Vercel, and hosting disclosures for the Netherlands and EU.',
  keywords: [
    'Domu Match cookie policy',
    'local storage',
    'cookie usage',
    'EU ePrivacy Directive',
    'cookie consent',
    'tracking cookies',
    'Netherlands cookie policy',
  ],
  openGraph: {
    title: 'Cookie & Local Storage Policy | Domu Match',
    description:
      'How Domu Match uses cookies, local storage, and similar technologies; consent and categories aligned with Dutch AP guidance.',
    type: 'website',
    url: 'https://domumatch.com/cookies',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Cookie and local storage policy - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie & Local Storage Policy | Domu Match',
    description:
      'How Domu Match uses cookies, local storage, and similar technologies; EU ePrivacy and Dutch Tw alignment.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/cookies',
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

