import { Metadata } from 'next'
import { StudentHousingGapRetentionRoiArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'Beyond Beds: The Hidden ROI of Fixing Europe’s Student Housing Gap | Domu Match',
  description:
    'Student housing shortages quietly tax retention and grades. Data from the Netherlands and peer-reviewed research show why compatible, stable housing is academic infrastructure - and how to invest earlier.',
  keywords:
    'student housing crisis Europe, university retention, Netherlands student housing, roommate compatibility ROI, international student housing, Domu Match',
  openGraph: {
    title:
      'Beyond Beds: The Hidden ROI of Fixing Europe’s Student Housing Gap Before Retention Breaks',
    description:
      'Room shortages and roommate mismatch are predictable drag on wellbeing and completion. Executive briefing on hidden costs, evidence, and early compatibility infrastructure.',
    type: 'article',
    publishedTime: '2026-05-06',
    authors: ['Domu Match Team'],
  },
}

export default function StudentHousingGapRetentionRoiPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'Beyond Beds: The Hidden ROI of Fixing Europe’s Student Housing Gap Before Retention Breaks',
        description:
          'Explains how student housing shortages and incompatibility stress upstream retention and academic performance, with citations to Dutch market reporting and peer-reviewed research; positions Domu Match as behavioural compatibility infrastructure.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-05-06',
        dateModified: '2026-05-06',
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
            'https://domumatch.com/blog/student-housing-gap-retention-roi',
        },
        articleSection: 'Retention',
        keywords:
          'student housing crisis Europe, university retention, Netherlands student housing, roommate compatibility ROI, international student housing, Domu Match',
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
            name: 'Beyond Beds: Student Housing ROI',
            item:
              'https://domumatch.com/blog/student-housing-gap-retention-roi',
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
      <StudentHousingGapRetentionRoiArticle />
    </>
  )
}
