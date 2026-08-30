import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find a Roommate in Eindhoven | Roommate Matching | Domu Match',
  description:
    'Roommate matching in Eindhoven for TU/e & Fontys students and young professionals. Looking for a housemate – or have a free room in Brainport?',
  keywords: [
    'huisgenoot zoeken Eindhoven',
    'huisgenoot gezocht Eindhoven',
    'find roommate Eindhoven',
    'TU Eindhoven roommate',
    'Fontys roommate',
    'looking for housemate Eindhoven',
    'compatible roommate Eindhoven',
    'verified roommate matching',
  ],
  openGraph: {
    title: 'Find a Roommate in Eindhoven | Domu Match',
    description: 
      'Roommate matching in Eindhoven for seekers and people with a free room. TU/e and Fontys.',
    type: 'website',
    url: 'https://domumatch.com/eindhoven',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find a roommate in Eindhoven - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  alternates: { canonical: 'https://domumatch.com/eindhoven' },
}

export default function EindhovenPage() {
  const structuredData = getCityStructuredData('eindhoven')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapperLight>
        <UniversityCityPage cityKey="eindhoven" />
      </MarketingSubpageWrapperLight>
    </>
  )
}
