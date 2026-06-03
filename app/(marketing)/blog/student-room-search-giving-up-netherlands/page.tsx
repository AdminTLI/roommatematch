import { Metadata } from 'next'
import { StudentRoomSearchGivingUpArticle } from './article-content'

export const metadata: Metadata = {
  title: 'When Dutch Students Stop Searching for Rooms | Domu Match',
  description:
    'Kences data via NOS: fewer students search for rooms, graduates block turnover, and supply shrinks. What that means for Dutch student housing access.',
  keywords:
    'student room shortage Netherlands, Kences monitor, student housing pipeline, giving up room search, Dutch student housing 2025',
  openGraph: {
    title: 'When Dutch Students Stop Searching for Rooms',
    description:
      'Evidence-led look at falling room-search activity, graduate turnover blockages, and shrinking supply in Dutch student cities.',
    type: 'article',
    publishedTime: '2026-06-03',
    authors: ['Domu Match Team'],
  },
}

export default function StudentRoomSearchGivingUpPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'When Dutch Students Stop Searching for Rooms',
        description:
          'Editorial analysis of Kences monitoring data reported via NOS on students giving up room searches, graduate occupancy blocking turnover, and private landlord exits from the student rental market.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-06-03',
        dateModified: '2026-06-03',
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
            'https://domumatch.com/blog/student-room-search-giving-up-netherlands',
        },
        articleSection: 'Housing',
        keywords:
          'student room shortage Netherlands, Kences monitor, student housing pipeline, giving up room search',
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
            name: 'When Dutch students stop searching for rooms',
            item:
              'https://domumatch.com/blog/student-room-search-giving-up-netherlands',
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
      <StudentRoomSearchGivingUpArticle />
    </>
  )
}
