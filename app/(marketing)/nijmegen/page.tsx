import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find Roommates in Nijmegen | Domu Match – Students & Young Professionals',
  description:
    'Find compatible roommates in Nijmegen with Domu Match. Connect with verified students and young professionals from Radboud University, HAN. Science-backed matching for shared living.',
  keywords: [
    'find roommate Nijmegen',
    'Radboud roommate',
    'student housing Nijmegen',
    'young professionals Nijmegen',
    'HAN roommate',
    'Nijmegen accommodation',
  ],
  openGraph: {
    title: 'Find Roommates in Nijmegen | Domu Match',
    description: 'Find compatible roommates in Nijmegen. Verified students and young professionals. Radboud and HAN. Science-backed matching.',
    type: 'website',
    url: 'https://domumatch.com/nijmegen',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in Nijmegen - Domu Match',
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
