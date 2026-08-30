import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find a Roommate in Utrecht | Roommate Matching | Domu Match',
  description:
    'Looking for a roommate in Utrecht – or have a free room? Match with verified UU & HU students and young professionals. Compatibility matching, not room listings.',
  keywords: [
    'huisgenoot zoeken Utrecht',
    'huisgenoot gezocht Utrecht',
    'find roommate Utrecht',
    'looking for housemate Utrecht',
    'Utrecht University roommate',
    'compatible roommate Utrecht',
    'verified roommate matching',
    'student roommate matching',
  ],
  openGraph: {
    title: 'Find a Roommate in Utrecht | Domu Match',
    description: 
      'Roommate matching in Utrecht for seekers and people with a free room.',
    type: 'website',
    url: 'https://domumatch.com/utrecht',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find a roommate in Utrecht - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  alternates: {
    canonical: 'https://domumatch.com/utrecht',
  },
}

export default function UtrechtPage() {
  const structuredData = getCityStructuredData('utrecht')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapperLight>
        <UniversityCityPage cityKey="utrecht" />
      </MarketingSubpageWrapperLight>
    </>
  )
}
