import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find a Roommate in Nijmegen | Roommate Matching | Domu Match',
  description:
    'Find a roommate in Nijmegen – or fill a free room near Radboud & HAN. Compatibility matching for verified students and young professionals.',
  keywords: [
    'huisgenoot zoeken Nijmegen',
    'huisgenoot gezocht Nijmegen',
    'find roommate Nijmegen',
    'Radboud roommate',
    'HAN roommate',
    'looking for housemate Nijmegen',
    'compatible roommate Nijmegen',
    'verified roommate matching',
  ],
  openGraph: {
    title: 'Find a Roommate in Nijmegen | Domu Match',
    description: 
      'Roommate matching in Nijmegen for seekers and people with a free room. Radboud and HAN.',
    type: 'website',
    url: 'https://domumatch.com/nijmegen',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find a roommate in Nijmegen - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  alternates: { canonical: 'https://domumatch.com/nijmegen' },
}

export default function NijmegenPage() {
  const structuredData = getCityStructuredData('nijmegen')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapperLight>
        <UniversityCityPage cityKey="nijmegen" />
      </MarketingSubpageWrapperLight>
    </>
  )
}
