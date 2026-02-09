import { Metadata } from 'next'
import { WhenDishesEqualDisrespectArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'When Dishes = Disrespect: How Tiny Tasks Turn Into Big Resentments | Domu Match',
  description:
    'Dirty dishes are rarely just about mess. Learn how unequal chores create resentment in shared housing and how Domu Match helps you find people who share your standards.',
  keywords:
    'roommate chores conflict, dishes roommate problem, student housing cleaning, unfair housework, Domu Match chores',
  openGraph: {
    title: 'When Dishes = Disrespect: How Tiny Tasks Turn Into Big Resentments',
    description:
      'A guide to understanding the emotional side of chores in shared spaces and matching with roommates whose approach feels fair.',
    type: 'article',
    publishedTime: '2026-01-27',
    authors: ['Domu Match Team'],
  },
}

export default function WhenDishesEqualDisrespectPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'When Dishes = Disrespect: How Tiny Tasks Turn Into Big Resentments',
        description:
          'Explains why unequal chore loads feel like disrespect, and how to use Domu Match to find roommates who share your approach to cleaning.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-01-27',
        dateModified: '2026-01-27',
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
            'https://domumatch.com/blog/when-dishes-equal-disrespect',
        },
        articleSection: 'Compatibility',
        keywords:
          'roommate chores conflict, dishes roommate problem, student housing cleaning, unfair housework, Domu Match chores',
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
            name: 'When Dishes = Disrespect',
            item:
              'https://domumatch.com/blog/when-dishes-equal-disrespect',
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
      <WhenDishesEqualDisrespectArticle />
    </>
  )
}

