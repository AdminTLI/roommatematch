import { Metadata } from 'next'
import { ExplainableAIArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Why Explainable AI Matters | Domu Match',
  description:
    'A practical guide to explainable AI: what it is, why it matters for roommate matching, and what transparent systems should reveal so you can evaluate recommendations.',
  keywords:
    'explainable AI, algorithmic transparency, AI recommendations, GDPR automated decision-making, EU AI Act, student housing matching',
  openGraph: {
    title: 'Why Explainable AI Matters',
    description:
      'Explainable AI turns a “black box” score into reasons you can evaluate. Learn what transparent systems should show before you trust a recommendation.',
    type: 'article',
    publishedTime: '2025-11-05',
    authors: ['Domu Match Team'],
  },
}

export default function WhyExplainableAIMattersPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Why Explainable AI Matters',
        description:
          'A practical guide to explainable AI: what it is, why it matters for roommate matching, and what transparent systems should reveal so you can evaluate recommendations.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2025-11-05',
        dateModified: '2025-11-05',
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
          '@id': 'https://domumatch.com/blog/why-explainable-ai-matters',
        },
        articleSection: 'Technology',
        keywords:
          'explainable AI, algorithmic transparency, AI recommendations, GDPR automated decision-making, EU AI Act',
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
            name: 'Why Explainable AI Matters',
            item: 'https://domumatch.com/blog/why-explainable-ai-matters',
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
      <ExplainableAIArticle />
    </>
  )
}


