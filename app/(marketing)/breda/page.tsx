import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find a Roommate in Breda | Roommate Matching | Domu Match',
  description:
    'Looking for a roommate in Breda – or have a free room? Match with verified Avans & BUas students and young professionals. Compatibility matching – not another room ad. Free for students & YPs.',
  keywords: [
    'huisgenoot zoeken Breda',
    'huisgenoot gezocht Breda',
    'roommate Breda',
    'find roommate Breda',
    'looking for housemate Breda',
    'kamergenoot zoeken Breda',
    'Avans roommate',
    'BUas housemate',
    'student roommate matching Breda',
    'verified roommate Breda',
    'compatible housemate Breda',
    'studentenhuis Breda',
  ],
  openGraph: {
    title: 'Find a Roommate in Breda | Domu Match',
    description:
      'Looking for a roommate in Breda – or have a free room? Compatibility matching for verified Avans & BUas students and young professionals.',
    type: 'website',
    url: 'https://domumatch.com/breda',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find a roommate in Breda - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find a Roommate in Breda | Domu Match',
    description: 'Roommate matching in Breda for seekers and people with a free room.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/breda',
  },
}

export default function BredaPage() {
  const structuredData = getCityStructuredData('breda')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapperLight>
        <UniversityCityPage cityKey="breda" />
      </MarketingSubpageWrapperLight>
    </>
  )
}
