import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find a Roommate in Tilburg | Roommate Matching | Domu Match',
  description:
    'Looking for a roommate in Tilburg – or have a free room? Match with verified Tilburg University, Fontys & Avans students and young professionals. Compatibility first – not room listings. Free for students & YPs.',
  keywords: [
    'huisgenoot zoeken Tilburg',
    'huisgenoot gezocht Tilburg',
    'roommate Tilburg',
    'find roommate Tilburg',
    'looking for housemate Tilburg',
    'kamergenoot zoeken Tilburg',
    'Tilburg University roommate',
    'Fontys housemate Tilburg',
    'student roommate matching Tilburg',
    'verified roommate Tilburg',
    'compatible housemate Tilburg',
    'studentenhuis Tilburg',
  ],
  openGraph: {
    title: 'Find a Roommate in Tilburg | Domu Match',
    description:
      'Looking for a roommate in Tilburg – or have a free room near campus? Compatibility matching for verified Tilburg University, Fontys and Avans students.',
    type: 'website',
    url: 'https://domumatch.com/tilburg',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find a roommate in Tilburg - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find a Roommate in Tilburg | Domu Match',
    description: 'Roommate matching in Tilburg for seekers and people with a free room.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/tilburg',
  },
}

export default function TilburgPage() {
  const structuredData = getCityStructuredData('tilburg')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapperLight>
        <UniversityCityPage cityKey="tilburg" />
      </MarketingSubpageWrapperLight>
    </>
  )
}
