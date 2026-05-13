import { Metadata } from 'next'
import { StudentHousingRetentionRoiArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'Student Housing Shortage Is a Retention Line Item: What Dutch Data Says | Domu Match',
  description:
    'Dutch reporting links room shortages to more students staying home and international housing stress. Learn the hidden retention and wellbeing costs, and how structured matching supports outcomes.',
  keywords:
    'student housing shortage Netherlands, university retention, international student housing, student wellbeing infrastructure, Domu Match, housing ROI',
  openGraph: {
    title: 'Student Housing Shortage Is a Retention Line Item: What Dutch Data Says About Staying Home',
    description:
      'Room scarcity is not only a rent chart. It shows up in commutes, counselling load, and completion risk. Data-led view for universities and cities.',
    type: 'article',
    publishedTime: '2026-05-13',
    authors: ['Domu Match Team'],
  },
}

export default function StudentHousingRetentionRoiPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'Student Housing Shortage Is a Retention Line Item: What Dutch Data Says About Staying Home',
        description:
          'Analysis of Dutch student housing reporting, hidden costs for retention and international onboarding, and how behaviour-first roommate matching supports student stability.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-05-13',
        dateModified: '2026-05-13',
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
          '@id': 'https://domumatch.com/blog/student-housing-shortage-retention-roi',
        },
        articleSection: 'Housing',
        keywords:
          'student housing shortage Netherlands, university retention, international student housing, student wellbeing infrastructure, Domu Match, housing ROI',
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
            name: 'Student Housing Shortage and Retention ROI',
            item: 'https://domumatch.com/blog/student-housing-shortage-retention-roi',
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
      <StudentHousingRetentionRoiArticle />
    </>
  )
}
