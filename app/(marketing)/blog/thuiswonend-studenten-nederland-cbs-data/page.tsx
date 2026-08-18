import { Metadata } from 'next'
import { ThuiswonendStudentenNederlandArticle } from './article-content'

export const metadata: Metadata = {
  title: 'More Dutch Students Live at Home: CBS Housing Data | Domu Match',
  description:
    'CBS and NIDI figures show 43% of 2023 graduates never moved out during study, up from 31% in 2016. How thuiswonen ties to room shortages and rental reform.',
  keywords:
    'thuiswonend studenten Nederland, students living at home Netherlands, CBS student housing, student room shortage, leenstelsel housing',
  openGraph: {
    title: 'More Dutch Students Live at Home: What CBS Data Reveals About Housing',
    description:
      'Evidence-led analysis of rising thuiswonen among Dutch HBO and university students, linked to national room shortages and rental market contraction.',
    type: 'article',
    publishedTime: '2026-07-22',
    authors: ['Domu Match Team'],
  },
}

export default function ThuiswonendStudentenNederlandPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'More Dutch Students Live at Home: What CBS Data Reveals About Housing',
        description:
          'Editorial analysis of CBS and NIDI research on thuiswonend students in the Netherlands, connecting demographic shifts to student room shortages, rental reform, and regional housing policy.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-07-22',
        dateModified: '2026-07-22',
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
            'https://domumatch.com/blog/thuiswonend-studenten-nederland-cbs-data',
        },
        articleSection: 'Retention',
        keywords:
          'thuiswonend studenten Nederland, students living at home Netherlands, CBS student housing, student room shortage',
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
            name: 'Thuiswonend studenten Nederland CBS data',
            item:
              'https://domumatch.com/blog/thuiswonend-studenten-nederland-cbs-data',
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
      <ThuiswonendStudentenNederlandArticle />
    </>
  )
}
