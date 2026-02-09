import { Metadata } from 'next'
import { SurvivingWinterBluesArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Surviving the Winter Blues: Why Who You Live With Matters | Domu Match',
  description:
    'Short days and exam stress can make students feel isolated. Learn how compatible roommates can buffer the winter blues and how Domu Match helps you match on social habits.',
  keywords:
    'winter blues students, seasonal affective disorder students, student housing isolation, supportive roommates winter, Domu Match social habits',
  openGraph: {
    title: 'Surviving the Winter Blues: Why Who You Live With Matters',
    description:
      'A guide to understanding the winter blues and why compatible housemates, social habits and home vibe matter so much during dark months.',
    type: 'article',
    publishedTime: '2026-01-10',
    authors: ['Domu Match Team'],
  },
}

export default function SurvivingWinterBluesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Surviving the Winter Blues: Why Who You Live With Matters',
        description:
          'An exploration of how winter, low mood and isolation interact with student housing — and how to use Domu Match to build a supportive home.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-01-10',
        dateModified: '2026-01-10',
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
          '@id': 'https://domumatch.com/blog/surviving-the-winter-blues',
        },
        articleSection: 'Wellbeing',
        keywords:
          'winter blues students, seasonal affective disorder students, student housing isolation, supportive roommates winter, Domu Match social habits',
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
            name: 'Surviving the Winter Blues',
            item: 'https://domumatch.com/blog/surviving-the-winter-blues',
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
      <SurvivingWinterBluesArticle />
    </>
  )
}

