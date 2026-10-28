import { Metadata } from 'next'
import { AutumnHuisavondIndoorBondingArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Autumn Huisavond: Indoor Bonding for Dutch Students | Domu Match',
  description:
    'Late October pushes student life indoors. How huisavond, shared dinners, and low-pressure rituals keep Dutch housemates connected without midterm overload.',
  keywords:
    'autumn huisavond indoor bonding Netherlands, student house bonding autumn, gezelligheid studentenhuis herfst, indoor house bonding Dutch students, huisavond tips',
  openGraph: {
    title: 'Autumn Huisavond: Indoor Bonding for Dutch Students',
    description:
      'Why late-autumn student houses need intentional indoor bonding—and how huisavond culture keeps connection light when daylight and campus social life shrink.',
    type: 'article',
    publishedTime: '2026-10-21',
    authors: ['Domu Match Team'],
  },
}

export default function AutumnHuisavondIndoorBondingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Autumn Huisavond: Indoor Bonding for Dutch Students',
        description:
          'Editorial guide to indoor house bonding in Dutch student houses during late autumn, covering huisavond culture, loneliness data, and low-pressure co-living rituals.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-10-21',
        dateModified: '2026-10-21',
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
            'https://domumatch.com/blog/autumn-huisavond-indoor-bonding-netherlands',
        },
        articleSection: 'Lifestyle',
        keywords:
          'autumn huisavond indoor bonding Netherlands, student house bonding autumn, gezelligheid studentenhuis herfst, indoor house bonding Dutch students',
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
            name: 'Autumn Huisavond: Indoor Bonding for Dutch Students',
            item:
              'https://domumatch.com/blog/autumn-huisavond-indoor-bonding-netherlands',
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
      <AutumnHuisavondIndoorBondingArticle />
    </>
  )
}
