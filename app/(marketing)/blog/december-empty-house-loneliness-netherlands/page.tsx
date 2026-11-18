import { Metadata } from 'next'
import { DecemberEmptyHouseLonelinessNetherlandsArticle } from './article-content'

export const metadata: Metadata = {
  title: 'December Stay-Behind Loneliness for Students | Domu Match',
  description:
    'After exams, Dutch student houses empty as people leave for Christmas. A practical guide for internationals and locals who stay behind and feel the quiet.',
  keywords:
    'december stay-behind loneliness student houses Netherlands, Christmas empty student house, international students Christmas Netherlands, Winter Weeks loneliness, kerstvakantie eenzaamheid studentenhuis',
  openGraph: {
    title: 'December Stay-Behind Loneliness for Students',
    description:
      'Exams, packed bags, then silence. How stay-behind students - international and Dutch - can plan the empty-house weeks without spiralling.',
    type: 'article',
    publishedTime: '2026-11-18',
    authors: ['Domu Match Team'],
  },
}

export default function DecemberEmptyHouseLonelinessNetherlandsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'December Stay-Behind Loneliness for Students',
        description:
          'Practical survival guide for students who remain in Dutch student houses after December exams while housemates leave for Christmas, covering isolation, Winter Weeks, and stay-behind house planning.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-11-18',
        dateModified: '2026-11-18',
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
            'https://domumatch.com/blog/december-empty-house-loneliness-netherlands',
        },
        articleSection: 'Wellbeing',
        keywords:
          'december stay-behind loneliness student houses Netherlands, Christmas empty student house, international students Christmas Netherlands, Winter Weeks',
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
            name: 'December Stay-Behind Loneliness for Students',
            item:
              'https://domumatch.com/blog/december-empty-house-loneliness-netherlands',
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
      <DecemberEmptyHouseLonelinessNetherlandsArticle />
    </>
  )
}
