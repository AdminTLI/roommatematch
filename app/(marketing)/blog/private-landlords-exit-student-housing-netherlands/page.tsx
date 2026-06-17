import { Metadata } from 'next'
import { PrivateLandlordsExitStudentHousingArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'Why Private Landlords Exit Dutch Student Housing | Domu Match',
  description:
    'ABF and Kences data show thousands of student rooms disappearing as private landlords sell. Here is what rental law, tax rules, and 2026 policy shifts mean for supply.',
  keywords:
    'private student housing Netherlands, student rental law, Wet Betaalbare Huur student rooms, Kences student housing shortage',
  openGraph: {
    title: 'Why Private Landlords Exit Dutch Student Housing',
    description:
      'How private landlord exits shrink student room supply in Dutch cities, and what policymakers are changing in 2026.',
    type: 'article',
    publishedTime: '2026-06-17',
    authors: ['Domu Match Team'],
  },
}

export default function PrivateLandlordsExitStudentHousingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Why Private Landlords Exit Dutch Student Housing',
        description:
          'An evidence-led look at how private landlord sales reduce Dutch student room supply, which cities are most affected, and what 2026 housing reforms may change.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-06-17',
        dateModified: '2026-06-17',
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
            'https://domumatch.com/blog/private-landlords-exit-student-housing-netherlands',
        },
        articleSection: 'Housing',
        keywords:
          'private student housing Netherlands, student rental law, Wet Betaalbare Huur student rooms, Kences student housing shortage',
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
            name: 'Why Private Landlords Exit Dutch Student Housing',
            item:
              'https://domumatch.com/blog/private-landlords-exit-student-housing-netherlands',
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
      <PrivateLandlordsExitStudentHousingArticle />
    </>
  )
}
