import { Metadata } from 'next'
import { StudentHousingSearchAbandonmentArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'Student Housing Search Abandonment in the Netherlands | Domu Match',
  description:
    'Kences reports fewer Dutch students search for rooms as shortages persist. Why 44% live away while 49% want to, and why official shortage figures understate pressure.',
  keywords:
    'student housing search abandonment Netherlands, students giving up finding room, Kences LMS 2025, kamertekort studenten, uitwonende studenten',
  openGraph: {
    title: 'Student Housing Search Abandonment in the Netherlands',
    description:
      'When room scarcity lasts years, measured housing demand falls. Kences and NOS data on students who stop searching, MBO exclusion, and supply loss.',
    type: 'article',
    publishedTime: '2026-08-19',
    authors: ['Domu Match Team'],
  },
}

export default function StudentHousingSearchAbandonmentPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'Student Housing Search Abandonment in the Netherlands',
        description:
          'An analysis of Kences LMS 2025 findings on Dutch students who give up searching for rooms, demand suppression in shortage statistics, and missing MBO demand in national counts.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-08-19',
        dateModified: '2026-08-19',
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
            'https://domumatch.com/blog/student-housing-search-abandonment-netherlands',
        },
        articleSection: 'Housing',
        keywords:
          'student housing search abandonment Netherlands, students giving up finding room, Kences LMS 2025, kamertekort studenten, uitwonende studenten',
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
            name: 'Student Housing Search Abandonment',
            item:
              'https://domumatch.com/blog/student-housing-search-abandonment-netherlands',
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
      <StudentHousingSearchAbandonmentArticle />
    </>
  )
}
