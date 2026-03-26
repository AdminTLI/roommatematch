import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find Roommates in The Hague | Domu Match – Students & Young Professionals',
  description:
    'Find compatible roommates in The Hague (Den Haag) with Domu Match. Connect with verified students and young professionals from Leiden University The Hague, The Hague University, and more.',
  keywords: [
    'find roommate Den Haag',
    'roommate finder The Hague',
    'student housing Den Haag',
    'young professionals The Hague',
    'The Hague shared living',
    'Leiden University The Hague',
    'Den Haag accommodation',
  ],
  openGraph: {
    title: 'Find Your Perfect Roommate in The Hague | Domu Match',
    description: 'Find compatible roommates in The Hague with science-backed matching.',
    type: 'website',
    url: 'https://domumatch.com/den-haag',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in The Hague - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  alternates: { canonical: 'https://domumatch.com/den-haag' },
}

export default function DenHaagPage() {
  const structuredData = getCityStructuredData('den-haag')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapperLight>
        <UniversityCityPage cityKey="den-haag" />
      </MarketingSubpageWrapperLight>
    </>
  )
}
