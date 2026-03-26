import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find Roommates in Amsterdam | Domu Match – Students & Young Professionals',
  description:
    'Find compatible roommates in Amsterdam with Domu Match. Connect with verified students and young professionals from UvA, VU, HvA and more. Science-backed matching for shared living in Amsterdam.',
  keywords: [
    'find roommate Amsterdam',
    'roommate finder Amsterdam',
    'student housing Amsterdam',
    'young professionals Amsterdam',
    'room share Amsterdam',
    'flatmate Amsterdam',
    'UvA roommate',
    'VU Amsterdam roommate',
    'HvA housing',
    'Amsterdam accommodation',
    'shared apartment Amsterdam',
    'compatible roommate Amsterdam',
  ],
  openGraph: {
    title: 'Find Roommates in Amsterdam | Domu Match',
    description:
      'Find compatible roommates in Amsterdam with science-backed matching. Connect with verified students and young professionals from UvA, VU, HvA and more.',
    type: 'website',
    url: 'https://domumatch.com/amsterdam',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in Amsterdam - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Perfect Roommate in Amsterdam | Domu Match',
    description: 'Find compatible roommates in Amsterdam with science-backed matching.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/amsterdam',
  },
}

export default function AmsterdamPage() {
  const structuredData = getCityStructuredData('amsterdam')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapperLight>
        <UniversityCityPage cityKey="amsterdam" />
      </MarketingSubpageWrapperLight>
    </>
  )
}
