import { Metadata } from 'next'
import { HiddenCostWrongRoommateArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'The Hidden Cost of the Wrong Roommate (It’s Not Just Rent) | Domu Match',
  description:
    'Breaking leases, moving mid-year and slipping grades all add up. Learn how the wrong roommate affects your finances, wellbeing and academic performance — and how Domu Match helps you match smarter.',
  keywords:
    'roommate problems cost, break lease student, student housing Netherlands, academic performance sleep, roommate compatibility Domu Match',
  openGraph: {
    title: 'The Hidden Cost of the Wrong Roommate (It’s Not Just Rent)',
    description:
      'A breakdown of the financial, academic and emotional costs of bad roommate matches — and why compatibility is worth investing in upfront.',
    type: 'article',
    publishedTime: '2025-12-05',
    authors: ['Domu Match Team'],
  },
}

export default function HiddenCostWrongRoommatePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'The Hidden Cost of the Wrong Roommate (It’s Not Just Rent)',
        description:
          'An exploration of how mismatched roommates can lead to broken leases, lost deposits, sleep loss and worse academic outcomes — plus ways to prevent it.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2025-12-05',
        dateModified: '2025-12-05',
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
            'https://domumatch.com/blog/hidden-cost-of-wrong-roommate',
        },
        articleSection: 'Finance',
        keywords:
          'roommate problems cost, break lease student, student housing Netherlands, academic performance sleep, roommate compatibility Domu Match',
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
            name: 'The Hidden Cost of the Wrong Roommate',
            item:
              'https://domumatch.com/blog/hidden-cost-of-wrong-roommate',
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
      <HiddenCostWrongRoommateArticle />
    </>
  )
}

