import { Metadata } from 'next'
import { InternationalStudentHousingNetherlandsArticle } from './article-content'

export const metadata: Metadata = {
  title: 'International Student Housing NL: What 2025 Dutch Data Show',
  description:
    'Kences and NOS figures on room shortages, Nuffic evidence on graduates who leave because of housing, and what that means for integration and wellbeing.',
  keywords:
    'international student housing Netherlands, student housing shortage, international student integration, Kences monitor, Nuffic housing',
  openGraph: {
    title: 'International Student Housing in the Netherlands: Where Data Meets Integration Risk',
    description:
      'Evidence-led overview of Dutch room shortages, graduate retention signals, and why housing search friction is an integration issue, not only a rent issue.',
    type: 'article',
    publishedTime: '2026-05-20',
    authors: ['Domu Match Team'],
  },
}

export default function InternationalStudentHousingNetherlandsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'International Student Housing in the Netherlands: Where Data Meets Integration Risk',
        description:
          'Editorial analysis of Dutch monitoring data on student rooms, public reporting on wellbeing effects of staying at home, and Nuffic survey evidence on housing as a reason international graduates leave the Netherlands.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-05-20',
        dateModified: '2026-05-20',
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
            'https://domumatch.com/blog/international-student-housing-netherlands-isolation',
        },
        articleSection: 'Housing',
        keywords:
          'international student housing Netherlands, student housing shortage, international student integration, Kences, Nuffic',
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
            name: 'International student housing in the Netherlands',
            item:
              'https://domumatch.com/blog/international-student-housing-netherlands-isolation',
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
      <InternationalStudentHousingNetherlandsArticle />
    </>
  )
}
