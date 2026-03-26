import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find Roommates in Leiden | Domu Match – Students & Young Professionals',
  description:
    'Find compatible roommates in Leiden with Domu Match. Connect with verified students and young professionals from Leiden University. Science-backed matching for shared living.',
  keywords: [
    'find roommate Leiden',
    'Leiden University roommate',
    'student housing Leiden',
    'young professionals Leiden',
    'Leiden accommodation',
  ],
  openGraph: {
    title: 'Find Roommates in Leiden | Domu Match',
    description: 'Find compatible roommates in Leiden. Verified students and young professionals. Science-backed matching.',
    type: 'website',
    url: 'https://domumatch.com/leiden',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in Leiden - Domu Match',
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
