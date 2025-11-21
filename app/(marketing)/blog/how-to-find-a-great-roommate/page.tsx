import { Metadata } from 'next'
import { HowToFindGreatRoommateArticle } from './article-content'

export const metadata: Metadata = {
  title: 'How to Find a Great Roommate: Evidence-Based Tips for Student Housing | Domu Match',
  description: 'Learn evidence-based strategies for finding compatible roommates in the Netherlands. Navigate the Dutch student housing market with confidence using data-driven compatibility tips.',
  keywords: 'find roommate Netherlands, student housing compatibility, Dutch student housing, roommate tips, student housing Amsterdam, Rotterdam student housing',
  openGraph: {
    title: 'How to Find a Great Roommate: Evidence-Based Tips',
    description: 'Evidence-based tips for compatibility and harmony in student housing in the Netherlands.',
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
        headline: 'How to Find a Great Roommate: Evidence-Based Tips for Student Housing',
        description: 'Learn evidence-based strategies for finding compatible roommates in the Netherlands. Navigate the Dutch student housing market with confidence using data-driven compatibility tips.',
        image: 'https://domumatch.vercel.app/images/logo.png',
        datePublished: '2025-11-15',
        dateModified: '2025-11-15',
        author: {
          '@type': 'Organization',
          name: 'Domu Match Team',
          url: 'https://domumatch.vercel.app',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Domu Match',
          logo: {
            '@type': 'ImageObject',
            url: 'https://domumatch.vercel.app/images/logo.png',
            width: 1200,
            height: 630,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': 'https://domumatch.vercel.app/blog/how-to-find-a-great-roommate',
        },
        articleSection: 'Compatibility',
        keywords: 'find roommate Netherlands, student housing compatibility, Dutch student housing, roommate tips',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://domumatch.vercel.app',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://domumatch.vercel.app/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'How to Find a Great Roommate',
            item: 'https://domumatch.vercel.app/blog/how-to-find-a-great-roommate',
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

