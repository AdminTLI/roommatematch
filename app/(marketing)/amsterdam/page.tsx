import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find a Roommate in Amsterdam | Roommate Matching | Domu Match',
  description:
    'Looking for a roommate in Amsterdam – or have a free room? Match with verified UvA, VU & HvA students and young professionals. Compatibility matching, not room ads.',
  keywords: [
    'huisgenoot zoeken Amsterdam',
    'huisgenoot gezocht Amsterdam',
    'roommates Amsterdam',
    'find roommate Amsterdam',
    'looking for housemate Amsterdam',
    'roommate finder Amsterdam',
    'UvA roommate',
    'VU Amsterdam roommate',
    'compatible roommate Amsterdam',
    'verified roommate matching',
    'student roommate matching',
  ],
  openGraph: {
    title: 'Find a Roommate in Amsterdam | Domu Match',
    description:
      'Roommate matching in Amsterdam for seekers and people with a free room. Verified students & young professionals from UvA, VU, HvA.',
    type: 'website',
    url: 'https://domumatch.com/amsterdam',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find a roommate in Amsterdam - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find a Roommate in Amsterdam | Domu Match',
    description: 'Roommate matching in Amsterdam for seekers and free rooms.',
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
