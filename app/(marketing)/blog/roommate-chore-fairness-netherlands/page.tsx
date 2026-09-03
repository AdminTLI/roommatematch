import { Metadata } from 'next'
import { RoommateChoreFairnessArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Roommate Chore Fairness in Dutch Student Houses | Domu Match',
  description:
    'Chore rosters fail when housemates measure fairness differently. How Dutch student houses can define equal kitchen and cleaning contribution early.',
  keywords:
    'roommate chore fairness Netherlands, schoonmaakrooster studentenhuis, chore roster fairness, student housemate cleaning schedule, huisregels huishouden',
  openGraph: {
    title: 'Roommate Chore Fairness in Dutch Student Houses',
    description:
      'Why equal contribution breaks down when houses count tasks differently, and how preventive house agreements reset the fairness conversation.',
    type: 'article',
    publishedTime: '2026-09-02',
    authors: ['Domu Match Team'],
  },
}

export default function RoommateChoreFairnessPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Roommate Chore Fairness in Dutch Student Houses',
        description:
          'Editorial analysis of how Dutch student housemates define equal contribution in shared kitchens and cleaning systems, drawing on preventive-law guidance, study-choice advice, and CBS household-task patterns.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-09-02',
        dateModified: '2026-09-02',
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
            'https://domumatch.com/blog/roommate-chore-fairness-netherlands',
        },
        articleSection: 'Compatibility',
        keywords:
          'roommate chore fairness Netherlands, schoonmaakrooster studentenhuis, chore roster fairness, student housemate cleaning schedule',
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
            name: 'Roommate Chore Fairness in Dutch Student Houses',
            item:
              'https://domumatch.com/blog/roommate-chore-fairness-netherlands',
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
      <RoommateChoreFairnessArticle />
    </>
  )
}
