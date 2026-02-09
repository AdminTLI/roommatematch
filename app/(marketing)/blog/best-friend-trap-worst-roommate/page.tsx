import { Metadata } from 'next'
import { BestFriendTrapArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'The "Best Friend" Trap: Why Your Bestie Might Be Your Worst Roommate | Domu Match',
  description:
    'Thinking of living with your best friend? Learn why friendship chemistry does not always translate into living compatibility, and how Domu Match helps you protect both your grades and your relationships.',
  keywords:
    'best friend roommate, living with friends, roommate compatibility, student housing advice, protect friendship, Domu Match',
  openGraph: {
    title:
      'The "Best Friend" Trap: Why Your Bestie Might Be Your Worst Roommate',
    description:
      'Why friendship compatibility does not always equal living compatibility — and how to use behavioural questions to protect both your housing and your relationships.',
    type: 'article',
    publishedTime: '2025-11-20',
    authors: ['Domu Match Team'],
  },
}

export default function BestFriendTrapPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'The "Best Friend" Trap: Why Your Bestie Might Be Your Worst Roommate',
        description:
          'Guidance for students considering living with close friends, focusing on behavioural compatibility, habits, and how Domu Match can help you avoid preventable conflict.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2025-11-20',
        dateModified: '2025-11-20',
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
          '@id': 'https://domumatch.com/blog/best-friend-trap-worst-roommate',
        },
        articleSection: 'Compatibility',
        keywords:
          'best friend roommate, living with friends, roommate compatibility, student housing advice, protect friendship, Domu Match',
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
            name: 'The "Best Friend" Trap',
            item:
              'https://domumatch.com/blog/best-friend-trap-worst-roommate',
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
      <BestFriendTrapArticle />
    </>
  )
}

