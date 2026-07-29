import { Metadata } from 'next'
import { GraduateHoldoverStudentHousingArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Graduate Holdover Blocks Dutch Student Room Turnover | Domu Match',
  description:
    'Kences data show 57% of graduates still occupy student rooms a year later, blocking turnover. Analysis of Dutch housing supply, retention, and policy responses.',
  keywords:
    'graduate holdover student housing Netherlands, student room turnover, Kences monitor, student housing shortage, Dutch student housing',
  openGraph: {
    title: 'Graduate Holdover Blocks Dutch Student Room Turnover',
    description:
      'When graduates cannot leave student rooms, incoming students compete for a shrinking pool. Evidence from Kences, NOS, CBS, and Nuffic on blocked turnover.',
    type: 'article',
    publishedTime: '2026-07-29',
    authors: ['Domu Match Team'],
  },
}

export default function GraduateHoldoverStudentHousingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Graduate Holdover Blocks Dutch Student Room Turnover',
        description:
          'Editorial analysis of Kences monitoring data on graduate holdover in Dutch student housing, blocked room turnover, supply contraction, and implications for retention and international integration.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-07-29',
        dateModified: '2026-07-29',
        author: {
          '@type': 'Organization',
          name: 'Domu Match Team',
          url: 'https://domumatch.com',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Domu Match',
          logo: {
            '@type': 'ImageObject',
            url: 'https://domumatch.com/images/logo.png',
            width: 1200,
            height: 630,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id':
            'https://domumatch.com/blog/graduate-holdover-student-housing-netherlands',
        },
        articleSection: 'Housing',
        keywords:
          'graduate holdover student housing Netherlands, student room turnover, Kences monitor, student housing shortage, Dutch student housing',
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
            name: 'Blog',
            item: 'https://domumatch.com/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Graduate Holdover Student Housing',
            item:
              'https://domumatch.com/blog/graduate-holdover-student-housing-netherlands',
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GraduateHoldoverStudentHousingArticle />
    </>
  )
}
