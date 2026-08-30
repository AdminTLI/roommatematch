import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find a Roommate in Leiden | Roommate Matching | Domu Match',
  description:
    'Roommate finder for Leiden University students and young professionals. Looking for a housemate – or need someone for your free room?',
  keywords: [
    'huisgenoot zoeken Leiden',
    'huisgenoot gezocht Leiden',
    'find roommate Leiden',
    'Leiden University roommate',
    'looking for housemate Leiden',
    'compatible roommate Leiden',
    'verified roommate matching',
  ],
  openGraph: {
    title: 'Find a Roommate in Leiden | Domu Match',
    description: 
      'Roommate matching in Leiden for seekers and people with a free room.',
    type: 'website',
    url: 'https://domumatch.com/leiden',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find a roommate in Leiden - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  alternates: { canonical: 'https://domumatch.com/leiden' },
}

export default function LeidenPage() {
  const structuredData = getCityStructuredData('leiden')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapperLight>
        <UniversityCityPage cityKey="leiden" />
      </MarketingSubpageWrapperLight>
    </>
  )
}
