import { Metadata } from 'next'
import { HousemateSupportLivingAwayArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'Housemate Support When Living Away From Home | Domu Match',
  description:
    'Inholland and RIVM data show students living away from home face more stress and loneliness. Why housemate support boundaries matter for wellbeing.',
  keywords:
    'housemate support living away from home, roommate emotional support boundaries, student wellbeing Netherlands, uitwonende studenten steun, shared living mental health',
  openGraph: {
    title: 'Housemate Support When Living Away From Home',
    description:
      'Why emotional support norms between housemates matter when students leave the parental home, according to Inholland, RIVM, and SCP findings.',
    type: 'article',
    publishedTime: '2026-08-26',
    authors: ['Domu Match Team'],
  },
}

export default function HousemateSupportLivingAwayPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Housemate Support When Living Away From Home',
        description:
          'Editorial analysis of how housemate support boundaries affect wellbeing for Dutch students living away from home, drawing on Inholland, RIVM, and SCP research.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-08-26',
        dateModified: '2026-08-26',
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
            'https://domumatch.com/blog/housemate-support-living-away-from-home',
        },
        articleSection: 'Wellbeing',
        keywords:
          'housemate support living away from home, roommate emotional support boundaries, student wellbeing Netherlands, uitwonende studenten steun',
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
            name: 'Housemate Support When Living Away From Home',
            item:
              'https://domumatch.com/blog/housemate-support-living-away-from-home',
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
      <HousemateSupportLivingAwayArticle />
    </>
  )
}
