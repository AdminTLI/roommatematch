import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find a Roommate in Rotterdam | Roommate Matching | Domu Match',
  description:
    'Looking for a roommate in Rotterdam – or filling a free room? Match with verified EUR, Hogeschool Rotterdam & Inholland students and young professionals.',
  keywords: [
    'huisgenoot zoeken Rotterdam',
    'huisgenoot gezocht Rotterdam',
    'roommates Rotterdam',
    'find roommate Rotterdam',
    'looking for housemate Rotterdam',
    'EUR roommate',
    'Erasmus University roommate',
    'compatible roommate Rotterdam',
    'verified roommate matching',
  ],
  openGraph: {
    title: 'Find a Roommate in Rotterdam | Domu Match',
    description:
      'Roommate matching in Rotterdam for seekers and people with a free room. Verified students & young professionals.',
    type: 'website',
    url: 'https://domumatch.com/rotterdam',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find a roommate in Rotterdam - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find a Roommate in Rotterdam | Domu Match',
    description: 'Roommate matching in Rotterdam for seekers and free rooms.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/rotterdam',
  },
}

export default function RotterdamPage() {
  const structuredData = getCityStructuredData('rotterdam')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapperLight>
        <UniversityCityPage cityKey="rotterdam" />
      </MarketingSubpageWrapperLight>
    </>
  )
}
