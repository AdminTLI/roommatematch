import Footer from '@/components/site/footer'
import { HelpCenterContent } from './help-center-content'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center | Domu Match - Support & FAQ',
  description: 'Get help with Domu Match. Find answers about getting started, account verification, matching scores, safety features, and more for students in the Netherlands.',
  keywords: [
    'Domu Match help',
    'roommate matching FAQ',
    'student housing support',
    'roommate platform help',
    'matching scores explained',
    'verification help',
    'student housing FAQ Netherlands',
  ],
  openGraph: {
    title: 'Help Center | Domu Match',
    description: 'Get help with Domu Match. Find answers about getting started, verification, matching, and safety features.',
    type: 'website',
    url: 'https://domumatch.vercel.app/help-center',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Help Center - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center | Domu Match',
    description: 'Get help with Domu Match. Find answers about getting started, verification, and matching.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/help-center',
  },
}

const faqs = [
  { q: 'Getting started', a: 'Create an account, verify your identity, and complete the compatibility quiz.' },
  { q: 'Account & verification', a: 'We verify with government ID + selfie and university email for safety.' },
  { q: 'Matching & scores', a: 'Scores are based on 40+ factors. We show why you matched for transparency.' },
  { q: 'Safety & reporting', a: 'Report any concern from a profile or chat. Our team reviews every report.' }
]

export default function HelpCenterPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://domumatch.vercel.app',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Help Center',
            item: 'https://domumatch.vercel.app/help-center',
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main>
        <HelpCenterContent />
      <Footer />
    </main>
    </>
  )
}


