import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions | Domu Match',
  description: 'Domu Match Terms and Conditions for student users. Learn about eligibility, verification, matching disclaimers, WWS calculator disclaimer, prohibited conduct, liability limits, dispute resolution, and change notice.',
  keywords: [
    'Domu Match terms and conditions',
    'user agreement',
    'roommate platform terms',
    'student housing terms',
    'DSA notice',
    'eligibility 17+ students',
    'WWS calculator disclaimer',
  ],
  openGraph: {
    title: 'Terms of Service | Domu Match',
    description: 'Read Domu Match terms of service. Understand the rules and guidelines for using our roommate matching platform.',
    type: 'website',
    url: 'https://domumatch.com/terms',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
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
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/terms',
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

