import { MarketingSubpageWrapper } from '../components/marketing-subpage-wrapper'
import { HelpCenterContent } from './help-center-content'
import { Metadata } from 'next'
import { helpContent } from './help-content'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Help Center | Domu Match - Support & FAQ',
  description: 'Get help with Domu Match. Find answers about getting started, account verification, matching scores, safety features, and more for students in the Netherlands.',
  keywords: [
    'Domu Match help',
    'roommate matching FAQ',
    'student housing support',
    'roommate platform help',
    'matching scores explained',
    'verification help',
    'student housing FAQ Netherlands',
  ],
  openGraph: {
    title: 'Help Center | Domu Match',
    description: 'Get help with Domu Match. Find answers about getting started, verification, matching, and safety features.',
    type: 'website',
    url: 'https://domumatch.com/help-center',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Help Center - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center | Domu Match',
    description: 'Get help with Domu Match. Find answers about getting started, verification, and matching.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/help-center',
  },
}

export default function HelpCenterPage() {
  // Get all FAQs for structured data
  const sections = helpContent.en
  const allFaqs = sections.flatMap(section => section.faqs)
  const topFaqs = allFaqs.slice(0, 10) // Limit to top 10 for structured data

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: topFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.title,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.content.substring(0, 500), // Limit content length for structured data
          },
        })),
      },
      {
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
            name: 'Help Center',
            item: 'https://domumatch.com/help-center',
          },
        ],
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
        <Suspense fallback={<div className="min-h-[60vh] bg-slate-950" />}>
          <HelpCenterContent />
        </Suspense>
      </MarketingSubpageWrapper>
    </>
  )
}


