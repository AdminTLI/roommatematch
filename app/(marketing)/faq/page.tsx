import { Metadata } from 'next'
import { FaqMarketingBody } from './faq-marketing-body'
import { faqMarketingEn } from './faq-en'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Domu Match - Roommate & Shared Living FAQ',
  description:
    'Find answers to common questions about Domu Match roommate matching platform. Verification, matching, safety, pricing for students and young professionals in the Netherlands.',
  keywords: [
    'Domu Match FAQ',
    'roommate matching questions',
    'shared living FAQ',
    'young professionals flatmate',
    'how does roommate matching work',
    'verification questions',
    'Netherlands student housing FAQ',
  ],
  openGraph: {
    title: 'Frequently Asked Questions | Domu Match',
    description: 'Find answers to common questions about Domu Match roommate matching platform.',
    type: 'website',
    url: 'https://domumatch.com/faq',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Domu Match FAQ',
      },
    ],
  },
  alternates: {
    canonical: 'https://domumatch.com/faq',
  },
}

export default function FAQPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: faqMarketingEn.flatMap((category) =>
          category.items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          }))
        ),
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
            name: 'FAQ',
            item: 'https://domumatch.com/faq',
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
      <FaqMarketingBody />
    </>
  )
}
