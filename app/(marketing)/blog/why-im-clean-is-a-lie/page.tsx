import { Metadata } from 'next'
import { WhyImCleanIsALieArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Why "I’m Clean" Is a Lie (And What to Ask Instead) | Domu Match',
  description:
    '“Clean” means very different things to different people. Learn how to ask behaviour-based questions about chores and cleanliness and how Domu Match builds this into its matching.',
  keywords:
    'roommate cleaning expectations, student housing chores, clean roommate conflict, Domu Match cleanliness questions',
  openGraph: {
    title: 'Why "I’m Clean" Is a Lie (And What to Ask Instead)',
    description:
      'A practical guide to avoiding cleaning wars by focusing on behaviours rather than vague labels — with help from Domu Match’s compatibility questions.',
    type: 'article',
    publishedTime: '2025-12-15',
    authors: ['Domu Match Team'],
  },
}

export default function WhyImCleanIsALiePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Why "I’m Clean" Is a Lie (And What to Ask Instead)',
        description:
          'Why “clean” is a subjective label, how it leads to roommate conflict, and how to use behaviour-based questions and Domu Match to align expectations.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2025-12-15',
        dateModified: '2025-12-15',
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
          '@id': 'https://domumatch.com/blog/why-im-clean-is-a-lie',
        },
        articleSection: 'Compatibility',
        keywords:
          'roommate cleaning expectations, student housing chores, clean roommate conflict, Domu Match cleanliness questions',
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
            name: 'Why "I’m Clean" Is a Lie',
            item: 'https://domumatch.com/blog/why-im-clean-is-a-lie',
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
      <WhyImCleanIsALieArticle />
    </>
  )
}

