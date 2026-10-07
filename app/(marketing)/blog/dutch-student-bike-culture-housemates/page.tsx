import { Metadata } from 'next'
import { DutchStudentBikeCultureHousematesArticle } from './article-content'

export const metadata: Metadata = {
  title: 'How Bike Culture Shapes Dutch Student Houses | Domu Match',
  description:
    'CBS cycling data and campus research show why the bicycle sets the rhythm of Dutch student houses—especially as autumn pulls life indoors.',
  keywords:
    'dutch student bike culture housemates, bike culture Dutch student house, fiets studentenhuis, autumn housemate bonding Netherlands, CBS fietsen studenten',
  openGraph: {
    title: 'How Bike Culture Shapes Dutch Student Houses',
    description:
      'Why Dutch student houses run on bicycle logistics, rain etiquette, and indoor gezelligheid when autumn shortens outdoor days.',
    type: 'article',
    publishedTime: '2026-10-07',
    authors: ['Domu Match Team'],
  },
}

export default function DutchStudentBikeCultureHousematesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'How Bike Culture Shapes Dutch Student Houses',
        description:
          'Editorial explainer of how Dutch cycling norms structure student housemate rhythms, autumn indoor bonding, and everyday co-living logistics.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-10-07',
        dateModified: '2026-10-07',
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
            'https://domumatch.com/blog/dutch-student-bike-culture-housemates',
        },
        articleSection: 'Lifestyle',
        keywords:
          'dutch student bike culture housemates, bike culture Dutch student house, fiets studentenhuis',
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
            name: 'How Bike Culture Shapes Dutch Student Houses',
            item:
              'https://domumatch.com/blog/dutch-student-bike-culture-housemates',
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
      <DutchStudentBikeCultureHousematesArticle />
    </>
  )
}
