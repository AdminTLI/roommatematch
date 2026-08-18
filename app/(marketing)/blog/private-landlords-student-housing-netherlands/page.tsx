import { Metadata } from 'next'
import { PrivateLandlordsStudentHousingArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'Private Landlords Exit Dutch Student Housing | Domu Match',
  description:
    'Kences and NOS report private landlords selling student homes as rental rules tighten. What it means for supply, rents, and woningdelen policy in the Netherlands.',
  keywords:
    'private landlords student housing Netherlands, studentenkamer tekort, Wet betaalbare huur studenten, woningdelen studenten, Kences monitor',
  openGraph: {
    title: 'Private Landlords Are Leaving Student Housing: A Dutch Supply Shock',
    description:
      'How regulatory change is pushing private landlords out of the Dutch student rental market, and what that means for room supply, international students, and municipal policy.',
    type: 'article',
    publishedTime: '2026-08-05',
    authors: ['Domu Match Team'],
  },
}

export default function PrivateLandlordsStudentHousingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'Private Landlords Are Leaving Student Housing: What the Dutch Supply Shock Means for Renters',
        description:
          'An evidence-based analysis of private landlord divestment from Dutch student housing, covering Kences monitor data, rental regulation, woningdelen policy, and municipal responses.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-08-05',
        dateModified: '2026-08-05',
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
            'https://domumatch.com/blog/private-landlords-student-housing-netherlands',
        },
        articleSection: 'Housing',
        keywords:
          'private landlords student housing Netherlands, studentenkamer tekort, Wet betaalbare huur studenten, woningdelen studenten, Kences monitor',
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
            name: 'Private Landlords and Student Housing',
            item:
              'https://domumatch.com/blog/private-landlords-student-housing-netherlands',
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
      <PrivateLandlordsStudentHousingArticle />
    </>
  )
}
