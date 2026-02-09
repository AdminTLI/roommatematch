import { MarketingSubpageWrapper } from '../components/marketing-subpage-wrapper'
import { PartnershipROIContent } from './partnership-roi-content'
import { FAQ } from '@/components/site/faq'
import { FinalCTA } from '@/components/site/final-cta'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partnership & ROI | Domu Match - University Housing',
  description: 'B2B partnership pricing and ROI for universities. Reduce dropouts and mediation costs with Domu Match. Flexible pilot and campus license options with transparent pricing.',
  keywords: [
    'university housing pricing',
    'roommate matching pricing',
    'student accommodation pricing',
    'housing retention',
    'university housing ROI',
    'student housing software pricing',
    'Netherlands university housing',
    'campus license',
    'housing mediation cost',
    'first-year retention',
  ],
  openGraph: {
    title: 'Partnership & ROI | Domu Match',
    description: 'B2B partnership pricing and ROI for universities. Reduce dropouts and mediation costs with Domu Match.',
    type: 'website',
    url: 'https://domumatch.com/pricing',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Partnership & ROI - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partnership & ROI | Domu Match',
    description: 'B2B partnership pricing and ROI for universities. Reduce dropouts and mediation costs with Domu Match.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/pricing',
  },
}

export default function PricingPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://domumatch.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Pricing',
        item: 'https://domumatch.com/pricing',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapper>
        <div>
          <PartnershipROIContent />
          <FAQ />
          <FinalCTA variant="dark" />
        </div>
      </MarketingSubpageWrapper>
    </>
  )
}
