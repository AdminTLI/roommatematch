import { Metadata } from 'next'
import { HowToFindGreatRoommateArticle } from './article-content'

export const metadata: Metadata = {
  title: 'How to Find a Great Roommate | Domu Match',
  description:
    'A practical checklist for choosing a roommate: routines, boundaries, chores, money reliability, and communication questions that prevent mismatches in shared living.',
  keywords:
    'how to find a roommate, roommate compatibility, student housing roommates, roommate questions, shared living boundaries, roommate red flags',
  openGraph: {
    title: 'How to Find a Great Roommate: Evidence-Based Tips',
    description:
      'A practical checklist for choosing a roommate: routines, boundaries, chores, money reliability, and communication questions that prevent mismatches.',
    type: 'article',
    publishedTime: '2025-11-15',
    authors: ['Domu Match Team'],
  },
}

export default function HowToFindGreatRoommatePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'How to Find a Great Roommate',
        description:
          'A practical checklist for choosing a roommate: routines, boundaries, chores, money reliability, and communication questions that prevent mismatches in shared living.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2025-11-15',
        dateModified: '2025-11-15',
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
          '@id': 'https://domumatch.com/blog/how-to-find-a-great-roommate',
        },
        articleSection: 'Compatibility',
        keywords:
          'how to find a roommate, roommate compatibility, student housing roommates, roommate questions',
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
            name: 'How to Find a Great Roommate',
            item: 'https://domumatch.com/blog/how-to-find-a-great-roommate',
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
      <HowToFindGreatRoommateArticle />
    </>
  )
}

