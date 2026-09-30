import { Metadata } from 'next'
import { InternationalStudentsDutchHousematesLanguageArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'Language Gaps With Dutch Housemates | Domu Match',
  description:
    'ResearchNed and Nuffic data show many international students struggle to connect with Dutch peers. How language norms shape mixed student houses.',
  keywords:
    'international students Dutch housemates language, Dutch housemates international students, language barriers student house Netherlands, ResearchNed international students, Nuffic integration',
  openGraph: {
    title: 'Language Gaps With Dutch Housemates',
    description:
      'How ResearchNed contact gaps, Nuffic wellbeing findings, and Dutch house language norms reshape everyday integration.',
    type: 'article',
    publishedTime: '2026-09-30',
    authors: ['Domu Match Team'],
  },
}

export default function InternationalStudentsDutchHousematesLanguagePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Language Gaps With Dutch Housemates',
        description:
          'Editorial analysis of language and contact gaps between international and Dutch students in shared houses, using ResearchNed AISS and Nuffic 2026 findings.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-09-30',
        dateModified: '2026-09-30',
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
            'https://domumatch.com/blog/international-students-dutch-housemates-language',
        },
        articleSection: 'Integration',
        keywords:
          'international students Dutch housemates language, Dutch housemates international students, language barriers student house Netherlands',
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
            name: 'Language Gaps With Dutch Housemates',
            item:
              'https://domumatch.com/blog/international-students-dutch-housemates-language',
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
      <InternationalStudentsDutchHousematesLanguageArticle />
    </>
  )
}
