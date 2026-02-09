import { Metadata } from 'next'
import { MoveInWeekRedFlagsArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'Move-In Week Red Flags: Signs Your Living Situation Might Tank Your Semester | Domu Match',
  description:
    'You usually know in the first weeks if something feels off. Learn which housing red flags to take seriously and how to plan a better match with Domu Match.',
  keywords:
    'roommate red flags, student housing problems, move-in week issues, unsafe student housing, Domu Match better match',
  openGraph: {
    title:
      'Move-In Week Red Flags: Signs Your Living Situation Might Tank Your Semester',
    description:
      'A guide to spotting early warning signs in a new living situation, what you can adjust, and how to avoid repeating the same pattern next time.',
    type: 'article',
    publishedTime: '2026-02-09',
    authors: ['Domu Match Team'],
  },
}

export default function MoveInWeekRedFlagsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'Move-In Week Red Flags: Signs Your Living Situation Might Tank Your Semester',
        description:
          'Explains how to differentiate normal adjustment from serious red flags in new student housing, and how Domu Match can help you plan a better match.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-02-09',
        dateModified: '2026-02-09',
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
            'https://domumatch.com/blog/move-in-week-red-flags',
        },
        articleSection: 'Wellbeing',
        keywords:
          'roommate red flags, student housing problems, move-in week issues, unsafe student housing, Domu Match better match',
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
            name: 'Move-In Week Red Flags',
            item:
              'https://domumatch.com/blog/move-in-week-red-flags',
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
      <MoveInWeekRedFlagsArticle />
    </>
  )
}

