import { Metadata } from 'next'
import { ThirdWheelPolicyArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'The "Third Wheel" Policy: Handling Significant Others in Shared Spaces | Domu Match',
  description:
    'Partners and guests can quietly reshape your home. Learn how to set fair limits around overnight stays, shared resources, and privacy, and see how Domu Match filters for guest frequency.',
  keywords:
    'roommate guest policy, overnight guests student housing, partner staying over, student flat rules, Domu Match guest frequency',
  openGraph: {
    title:
      'The "Third Wheel" Policy: Handling Significant Others in Shared Spaces',
    description:
      'A practical guide to setting guest policies, managing partners in shared housing, and matching on guest frequency before move-in.',
    type: 'article',
    publishedTime: '2025-11-28',
    authors: ['Domu Match Team'],
  },
}

export default function ThirdWheelPolicyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'The "Third Wheel" Policy: Handling Significant Others in Shared Spaces',
        description:
          'Guidance for students on managing partners and overnight guests in shared accommodation, with a focus on fair expectations and Domu Match guest filters.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2025-11-28',
        dateModified: '2025-11-28',
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
            'https://domumatch.com/blog/third-wheel-policy-significant-others',
        },
        articleSection: 'Compatibility',
        keywords:
          'roommate guest policy, overnight guests student housing, partner staying over, student flat rules, Domu Match guest frequency',
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
            name: 'The "Third Wheel" Policy',
            item:
              'https://domumatch.com/blog/third-wheel-policy-significant-others',
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
      <ThirdWheelPolicyArticle />
    </>
  )
}

