import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find Roommates in Eindhoven | Domu Match – Students & Young Professionals',
  description:
    'Find compatible roommates in Eindhoven with Domu Match. Connect with verified students and young professionals from TU Eindhoven, Fontys, and more. Science-backed matching for shared living.',
  keywords: [
    'find roommate Eindhoven',
    'TU Eindhoven roommate',
    'student housing Eindhoven',
    'young professionals Eindhoven',
    'Fontys roommate',
    'Eindhoven accommodation',
  ],
  openGraph: {
    title: 'Find Roommates in Eindhoven | Domu Match',
    description: 'Find compatible roommates in Eindhoven with science-backed matching. Students and young professionals. TU/e and Fontys.',
    type: 'website',
    url: 'https://domumatch.com/eindhoven',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in Eindhoven - Domu Match',
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
