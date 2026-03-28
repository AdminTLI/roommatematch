import { FeaturesForYoungProfessionals } from '@/components/site/features-for-young-professionals'
import { MarketingSubpageWrapperLight } from '../components/marketing-subpage-wrapper-light'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Young Professionals | Domu Match - Science-Backed Flatmate Matching',
  description:
    'Build your career with flatmates who fit your rhythm. ID-verified lifestyle matching in the Netherlands, separate pool from students, no scams. Amsterdam, Rotterdam, Utrecht and beyond.',
  keywords: [
    'flatmate Netherlands',
    'young professional housing',
    'roommate matching professionals',
    'shared living Netherlands',
    'ID verified flatmate',
    'compatibility matching',
    'find flatmate Amsterdam',
    'room share young professionals',
    'verified roommate platform',
  ],
  openGraph: {
    title: 'For Young Professionals | Domu Match - Find Your Flatmate',
    description:
      'ID-verified, lifestyle matching for young professionals. Separate pool from students. Zero scams.',
    type: 'website',
    url: 'https://domumatch.com/young-professionals',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Domu Match - For Young Professionals',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Domu Match - For Young Professionals',
    description: 'ID-verified, lifestyle matching for young professionals. Separate pool from students.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/young-professionals',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who can use Domu Match as a young professional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Young professionals in the Netherlands can sign up with their email. You are matched only with other verified young professionals in a separate pool from students. No university email is required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Domu Match free for young professionals?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Domu Match is free for young professionals. There are no hidden fees for messaging or viewing matches. We believe finding a compatible flatmate should be accessible to everyone.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do young professionals verify their identity?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every user is government-ID verified through Persona before they can chat. This keeps the platform safe from bots and scams. Young professionals verify with the same process; no university email is needed.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I only get matched with other young professionals?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Students match only with students; young professionals only with young professionals. You are in a dedicated pool so you connect with people in a similar life stage.',
      },
    },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://domumatch.com' },
    { '@type': 'ListItem', position: 2, name: 'For Young Professionals', item: 'https://domumatch.com/young-professionals' },
  ],
}

export default function YoungProfessionalsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <MarketingSubpageWrapperLight>
        <div>
          <FeaturesForYoungProfessionals />
        </div>
      </MarketingSubpageWrapperLight>
    </>
  )
}
