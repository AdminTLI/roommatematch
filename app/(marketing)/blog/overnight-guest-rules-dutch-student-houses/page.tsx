import { Metadata } from 'next'
import { OvernightGuestRulesArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Overnight Guest Rules in Dutch Student Houses | Domu Match',
  description:
    'Provider bans, campus night limits, and housemate consent are different layers. How Dutch student houses can set overnight guest rules without conflict.',
  keywords:
    'overnight guest rules Dutch student houses, housemate overnight guests Netherlands, student house guest policy, overnachting huisgenoten, SSH overnight guests',
  openGraph: {
    title: 'Overnight Guest Rules in Dutch Student Houses',
    description:
      'Why SSH bans, campus visitor limits, and informal flat norms collide, and how written guest and quiet-hour agreements reduce resentment.',
    type: 'article',
    publishedTime: '2026-09-09',
    authors: ['Domu Match Team'],
  },
}

export default function OvernightGuestRulesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Overnight Guest Rules in Dutch Student Houses',
        description:
          'Editorial analysis of overnight guest boundaries in Dutch student housing, comparing provider house rules, campus visitor limits, and housemate consent systems.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-09-09',
        dateModified: '2026-09-09',
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
            'https://domumatch.com/blog/overnight-guest-rules-dutch-student-houses',
        },
        articleSection: 'Boundaries',
        keywords:
          'overnight guest rules Dutch student houses, housemate overnight guests Netherlands, student house guest policy, overnachting huisgenoten',
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
            name: 'Overnight Guest Rules in Dutch Student Houses',
            item:
              'https://domumatch.com/blog/overnight-guest-rules-dutch-student-houses',
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
      <OvernightGuestRulesArticle />
    </>
  )
}
