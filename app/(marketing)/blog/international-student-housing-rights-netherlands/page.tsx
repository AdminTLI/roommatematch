import { Metadata } from 'next'
import { InternationalStudentHousingRightsArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'International Student Housing Rights in the Netherlands | Domu Match',
  description:
    'After the room hunt ends, many international students still face illegal rents, unsafe conditions, and fear of speaking up. What Dutch monitoring and student unions report in 2026.',
  keywords:
    'international student housing rights Netherlands, student tenant rights, Housing Hotline LSVb, huurteams, student housing scams',
  openGraph: {
    title:
      'International Student Housing Rights in the Netherlands: What Happens After Move-In',
    description:
      'Dutch student unions logged 263 international housing help requests in 2026. Here is how shortage pressure, disappearing huurteams, and rental fear intersect.',
    type: 'article',
    publishedTime: '2026-07-08',
    authors: ['Domu Match Team'],
  },
}

export default function InternationalStudentHousingRightsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'International Student Housing Rights in the Netherlands: What Happens After Move-In',
        description:
          'An evidence-based look at international student tenant rights, LSVb Housing Hotline caseload, and why housing misconduct persists after rooms are found.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-07-08',
        dateModified: '2026-07-08',
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
            'https://domumatch.com/blog/international-student-housing-rights-netherlands',
        },
        articleSection: 'Safety',
        keywords:
          'international student housing rights Netherlands, student tenant rights, Housing Hotline LSVb, huurteams, student housing scams',
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
            name: 'International Student Housing Rights',
            item:
              'https://domumatch.com/blog/international-student-housing-rights-netherlands',
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
      <InternationalStudentHousingRightsArticle />
    </>
  )
}
