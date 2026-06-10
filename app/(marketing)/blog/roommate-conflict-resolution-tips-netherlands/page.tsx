import { Metadata } from 'next'
import { RoommateConflictResolutionArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Roommate Conflict Resolution Tips for Dutch Students',
  description:
    'Cleanliness and noise top student housing disputes. Dutch wellbeing data and university guidance show how to de-escalate before conflicts damage grades.',
  keywords:
    'roommate conflict resolution tips, student housing conflict Netherlands, huisgenoot ruzie oplossen, student wellbeing shared living',
  openGraph: {
    title: 'Roommate Conflict Resolution Tips for Dutch Students',
    description:
      'Evidence-led guide to de-escalating student household friction using Dutch wellbeing monitoring, university advice, and practical repair steps.',
    type: 'article',
    publishedTime: '2026-06-10',
    authors: ['Domu Match Team'],
  },
}

export default function RoommateConflictResolutionPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Roommate Conflict Resolution Tips for Dutch Students',
        description:
          'Editorial guide to resolving student roommate conflicts in the Netherlands, drawing on Gezondheidsmonitor Jongvolwassenen 2024, Resto VanHarte loneliness research, and university student-life guidance on cleanliness and noise disputes.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-06-10',
        dateModified: '2026-06-10',
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
            'https://domumatch.com/blog/roommate-conflict-resolution-tips-netherlands',
        },
        articleSection: 'Wellbeing',
        keywords:
          'roommate conflict resolution tips, student housing conflict Netherlands, huisgenoot ruzie oplossen, student wellbeing shared living',
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
            name: 'Roommate conflict resolution tips',
            item:
              'https://domumatch.com/blog/roommate-conflict-resolution-tips-netherlands',
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
      <RoommateConflictResolutionArticle />
    </>
  )
}
