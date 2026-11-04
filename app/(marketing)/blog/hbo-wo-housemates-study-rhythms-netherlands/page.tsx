import { Metadata } from 'next'
import { HboWoHousematesStudyRhythmsArticle } from './article-content'

export const metadata: Metadata = {
  title: 'HBO vs WO Housemates: Two Study Rhythms, One House | Domu Match',
  description:
    'HBO and WO students often share one Dutch house but live different weeks. Contact hours, internships, and study pressure explain where friction starts.',
  keywords:
    'HBO vs WO housemates, hbo wo studenten samenwonen, HBO WO study rhythm Netherlands, studiedruk NSE 2026, mixed student house Netherlands, hbo stage onderhuur',
  openGraph: {
    title: 'HBO vs WO Housemates: Two Study Rhythms, One House',
    description:
      'How contact hours, internships, and 2026 study-pressure data shape life in mixed HBO and WO student houses.',
    type: 'article',
    publishedTime: '2026-11-04',
    authors: ['Domu Match Team'],
  },
}

export default function HboWoHousematesStudyRhythmsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'HBO vs WO Housemates: Two Study Rhythms, One House',
        description:
          'Editorial explainer on how HBO and WO study rhythms differ in contact hours, internships, and study pressure, and what that means for housemates sharing one Dutch student house.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-11-04',
        dateModified: '2026-11-04',
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
            'https://domumatch.com/blog/hbo-wo-housemates-study-rhythms-netherlands',
        },
        articleSection: 'Technology',
        keywords:
          'HBO vs WO housemates, hbo wo studenten samenwonen, HBO WO study rhythm Netherlands, studiedruk NSE 2026, mixed student house Netherlands',
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
            name: 'HBO vs WO Housemates: Two Study Rhythms, One House',
            item:
              'https://domumatch.com/blog/hbo-wo-housemates-study-rhythms-netherlands',
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
      <HboWoHousematesStudyRhythmsArticle />
    </>
  )
}
