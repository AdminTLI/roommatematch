import { Metadata } from 'next'
import { DutchStudyChoiceGammaFieldsArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Dutch Study Choice: Why Gamma Fields Dominate | Domu Match',
  description:
    'Rathenau data show most Dutch bachelor students choose gamma fields. What that concentration means for programme choice, fixus deadlines, and switches.',
  keywords:
    'Dutch study choice gamma fields, gamma wetenschappen studiekeuze, Rathenau hoger onderwijs, HBO WO programme sectors Netherlands, numerus fixus 15 januari',
  openGraph: {
    title: 'Dutch Study Choice: Why Gamma Fields Dominate',
    description:
      'How Rathenau field shares, Rijksoverheid admission deadlines, and Studiekeuze123 switch guidance reshape Dutch programme choice.',
    type: 'article',
    publishedTime: '2026-09-23',
    authors: ['Domu Match Team'],
  },
}

export default function DutchStudyChoiceGammaFieldsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Dutch Study Choice: Why Gamma Fields Dominate',
        description:
          'Editorial analysis of Dutch higher-education field concentration using Rathenau bachelor and master shares, national admission deadlines, and first-year switch guidance.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-09-23',
        dateModified: '2026-09-23',
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
            'https://domumatch.com/blog/dutch-study-choice-gamma-fields',
        },
        articleSection: 'Technology',
        keywords:
          'Dutch study choice gamma fields, gamma wetenschappen studiekeuze, Rathenau hoger onderwijs, HBO WO programme sectors Netherlands',
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
            name: 'Dutch Study Choice: Why Gamma Fields Dominate',
            item:
              'https://domumatch.com/blog/dutch-study-choice-gamma-fields',
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
      <DutchStudyChoiceGammaFieldsArticle />
    </>
  )
}
