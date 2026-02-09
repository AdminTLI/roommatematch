import { Metadata } from 'next'
import { IntrovertsSurvivalGuideArticle } from './article-content'

export const metadata: Metadata = {
  title: 'The Introvert’s Survival Guide to Shared Living | Domu Match',
  description:
    'If your social battery drains fast, your home needs to be a charging dock, not another performance. Learn how Domu Match helps introverts and neurodivergent students find compatible roommates.',
  keywords:
    'introvert roommates, social battery student housing, quiet hours roommates, neurodivergent student housing, Domu Match social battery',
  openGraph: {
    title: 'The Introvert’s Survival Guide to Shared Living',
    description:
      'Practical advice for introverted and neurodivergent students on finding roommates who respect alone time, quiet, and emotional bandwidth — with help from Domu Match.',
    type: 'article',
    publishedTime: '2026-01-03',
    authors: ['Domu Match Team'],
  },
}

export default function IntrovertsSurvivalGuidePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'The Introvert’s Survival Guide to Shared Living',
        description:
          'A guide for introverted and neurodivergent students on creating a living situation that recharges them, including how to use Domu Match’s social battery and quiet-hours filters.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-01-03',
        dateModified: '2026-01-03',
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
            'https://domumatch.com/blog/introverts-survival-guide-shared-living',
        },
        articleSection: 'Wellbeing',
        keywords:
          'introvert roommates, social battery student housing, quiet hours roommates, neurodivergent student housing, Domu Match social battery',
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
            name: 'The Introvert’s Survival Guide to Shared Living',
            item:
              'https://domumatch.com/blog/introverts-survival-guide-shared-living',
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
      <IntrovertsSurvivalGuideArticle />
    </>
  )
}

