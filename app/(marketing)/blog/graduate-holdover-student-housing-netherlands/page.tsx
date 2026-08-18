import { Metadata } from 'next'
import { GraduateHoldoverArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'Graduate Holdover: The Hidden Student Housing Bottleneck | Domu Match',
  description:
    'Kences data shows 57% of graduates still occupy student rooms after one year. Here is how holdover, supply loss, and the general housing market compound the Dutch room shortage.',
  keywords:
    'graduate holdover student housing Netherlands, student room turnover, Kences student housing monitor, afgestudeerde studenten kamer',
  openGraph: {
    title: 'Graduate Holdover: The Hidden Student Housing Bottleneck',
    description:
      'When graduates cannot move on, student rooms stay locked. Dutch monitoring data explains why the shortage is worse than headline vacancy figures suggest.',
    type: 'article',
    publishedTime: '2026-08-12',
    authors: ['Domu Match Team'],
  },
}

export default function GraduateHoldoverPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Graduate Holdover: The Hidden Student Housing Bottleneck',
        description:
          'An evidence-based look at how graduate holdover, private-sector divestment, and the wider housing market inflate the Dutch student room shortage beyond published vacancy counts.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-08-12',
        dateModified: '2026-08-12',
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
          'graduate holdover student housing Netherlands, student room turnover, Kences student housing monitor',
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
            name: 'Graduate Holdover',
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
      <GraduateHoldoverArticle />
    </>
  )
}
