import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Domu Match - User Agreement',
  description: 'Read Domu Match terms of service. Understand the rules, guidelines, and user agreement for using our roommate matching platform in the Netherlands.',
  keywords: [
    'Domu Match terms of service',
    'user agreement',
    'roommate platform terms',
    'student housing terms',
    'terms and conditions',
    'platform usage terms',
  ],
  openGraph: {
    title: 'Terms of Service | Domu Match',
    description: 'Read Domu Match terms of service. Understand the rules and guidelines for using our roommate matching platform.',
    type: 'website',
    url: 'https://domumatch.vercel.app/terms',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Terms of Service - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Domu Match',
    description: 'Read Domu Match terms of service. Understand the rules and guidelines for using our platform.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

