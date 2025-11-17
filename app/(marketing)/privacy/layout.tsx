import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Domu Match - Data Protection',
  description: 'Read Domu Match privacy policy. Learn how we protect your data, comply with GDPR, and ensure your privacy when using our roommate matching platform in the Netherlands.',
  keywords: [
    'Domu Match privacy policy',
    'GDPR compliance',
    'data protection Netherlands',
    'roommate platform privacy',
    'student data privacy',
    'privacy policy student housing',
  ],
  openGraph: {
    title: 'Privacy Policy | Domu Match',
    description: 'Read Domu Match privacy policy. Learn how we protect your data and comply with GDPR in the Netherlands.',
    type: 'website',
    url: 'https://domumatch.vercel.app/privacy',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Privacy Policy - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Domu Match',
    description: 'Read Domu Match privacy policy. Learn how we protect your data and comply with GDPR.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

