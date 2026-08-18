import { Metadata } from 'next'
import { StudentHousingCoLivingRulesArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'Student Co-Living Rules Block Dutch Housing Supply | Domu Match',
  description:
    'Municipal parking norms, room-share permits, and split-housing rules are shrinking Dutch student rooms. What policy gaps mean for renters and cities.',
  keywords:
    'student housing co-living rules Netherlands, woningdelen studenten, student room shortage, municipal housing policy, Dutch student housing',
  openGraph: {
    title: 'Student Co-Living Rules Are Blocking Dutch Housing Supply',
    description:
      'National policy favours easier room sharing, but local parking norms and permit rules still remove thousands of student rooms from the market.',
    type: 'article',
    publishedTime: '2026-07-01',
    authors: ['Domu Match Team'],
  },
}

export default function StudentHousingCoLivingRulesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'Student Co-Living Rules Are Blocking Dutch Housing Supply',
        description:
          'Analysis of how Dutch municipal co-living rules, parking norms, and room-share permits interact with national housing policy to limit student room supply.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-07-01',
        dateModified: '2026-07-01',
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
            'https://domumatch.com/blog/student-housing-co-living-rules-netherlands',
        },
        articleSection: 'Housing',
        keywords:
          'student housing co-living rules Netherlands, woningdelen studenten, student room shortage, municipal housing policy, Dutch student housing',
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
            name: 'Student Co-Living Rules Netherlands',
            item:
              'https://domumatch.com/blog/student-housing-co-living-rules-netherlands',
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
      <StudentHousingCoLivingRulesArticle />
    </>
  )
}
