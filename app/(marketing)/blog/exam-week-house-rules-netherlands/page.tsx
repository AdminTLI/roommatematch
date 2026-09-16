import { Metadata } from 'next'
import { ExamWeekHouseRulesArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Exam Week House Rules for Dutch Housemates | Domu Match',
  description:
    'MMMS-2025 finds most HBO and university students still report heavy study stress. How temporary quiet, kitchen, and guest norms protect shared houses in tentamenweek.',
  keywords:
    'exam week house rules Netherlands, tentamenweek huisregels, student housemate quiet hours, exam stress shared housing, MMMS 2025 student stress',
  openGraph: {
    title: 'Exam Week House Rules for Dutch Housemates',
    description:
      'Why tentamenweek needs temporary house systems for quiet hours, kitchen timing, and guests, grounded in MMMS-2025 student wellbeing data.',
    type: 'article',
    publishedTime: '2026-09-16',
    authors: ['Domu Match Team'],
  },
}

export default function ExamWeekHouseRulesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Exam Week House Rules for Dutch Housemates',
        description:
          'Editorial analysis of temporary house norms during Dutch exam weeks, drawing on MMMS-2025 student mental health monitoring and research on performance pressure in shared living.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-09-16',
        dateModified: '2026-09-16',
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
            'https://domumatch.com/blog/exam-week-house-rules-netherlands',
        },
        articleSection: 'Wellbeing',
        keywords:
          'exam week house rules Netherlands, tentamenweek huisregels, student housemate quiet hours, exam stress shared housing',
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
            name: 'Exam Week House Rules for Dutch Housemates',
            item:
              'https://domumatch.com/blog/exam-week-house-rules-netherlands',
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
      <ExamWeekHouseRulesArticle />
    </>
  )
}
