import { Metadata } from 'next'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'

export const metadata: Metadata = {
  title: 'Find a Roommate in The Hague | Roommate Matching | Domu Match',
  description:
    'Find a roommate in The Hague – or fill a free room. Match with verified THUAS & Campus Den Haag students and young professionals. Compatibility first.',
  keywords: [
    'huisgenoot zoeken Den Haag',
    'huisgenoot gezocht Den Haag',
    'find roommate The Hague',
    'looking for housemate Den Haag',
    'roommate finder The Hague',
    'THUAS roommate',
    'compatible roommate Den Haag',
    'verified roommate matching',
  ],
  openGraph: {
    title: 'Find a Roommate in The Hague | Domu Match',
    description: 
      'Roommate matching in The Hague for seekers and people with a free room.',
    type: 'website',
    url: 'https://domumatch.com/den-haag',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find a roommate in The Hague - Domu Match',
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
