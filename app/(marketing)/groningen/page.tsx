import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find a Roommate in Groningen | Roommate Matching | Domu Match',
  description:
    'Find a roommate in Groningen – or fill a free room. Match with verified RUG & Hanze students. Compatibility matching for shared living.',
  keywords: [
    'huisgenoot zoeken Groningen',
    'huisgenoot gezocht Groningen',
    'find roommate Groningen',
    'RUG roommate',
    'Hanze roommate',
    'looking for housemate Groningen',
    'compatible roommate Groningen',
    'verified roommate matching',
  ],
  openGraph: {
    title: 'Find a Roommate in Groningen | Domu Match',
    description: 
      'Roommate matching in Groningen for seekers and people with a free room. RUG and Hanze.',
    type: 'website',
    url: 'https://domumatch.com/groningen',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find a roommate in Groningen - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  alternates: { canonical: 'https://domumatch.com/groningen' },
}

export default function GroningenPage() {
  const structuredData = getCityStructuredData('groningen')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapperLight>
        <UniversityCityPage cityKey="groningen" />
      </MarketingSubpageWrapperLight>
    </>
  )
}
