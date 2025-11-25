import { Metadata } from 'next'
import { ExplainableAIArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Why Explainable AI Matters: Transparency, Trust & Your Rights | Domu Match',
  description: 'Understanding explainable AI and why transparency in matching algorithms matters. Learn how EU AI Act and GDPR protect your rights in algorithmic decision-making.',
  keywords: 'explainable AI, EU AI Act, algorithmic transparency, AI matching, GDPR algorithmic decisions, Netherlands AI regulation, transparent AI',
  openGraph: {
    title: 'Why Explainable AI Matters',
    description: 'Understanding your matches builds trust and better decisions. Learn how transparency in AI matching aligns with EU regulations.',
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
        headline: 'Why Explainable AI Matters: Transparency, Trust & Your Rights',
        description: 'Understanding explainable AI and why transparency in matching algorithms matters. Learn how EU AI Act and GDPR protect your rights in algorithmic decision-making.',
        image: 'https://domumatch.vercel.app/images/logo.png',
        datePublished: '2025-11-05',
        dateModified: '2025-11-05',
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
          '@id': 'https://domumatch.vercel.app/blog/why-explainable-ai-matters',
        },
        articleSection: 'Technology',
        keywords: 'explainable AI, EU AI Act, algorithmic transparency, AI matching, GDPR algorithmic decisions',
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
            name: 'Why Explainable AI Matters',
            item: 'https://domumatch.vercel.app/blog/why-explainable-ai-matters',
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


