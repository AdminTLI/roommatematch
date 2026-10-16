import { Metadata } from 'next'
import { AutumnMidtermBurnoutArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Autumn Midterm Burnout: Housemate Routines | Domu Match',
  description:
    'Short days and mid-block peaks strain Dutch student houses. Practical indoor routines for study load, recovery, and low-pressure bonding.',
  keywords:
    'autumn midterm burnout housemates Netherlands, midterm study routines shared house, indoor house bonding students, herfst burnout studentenhuis, mid-semester housemate routines',
  openGraph: {
    title: 'Autumn Midterm Burnout: Housemate Routines That Actually Help',
    description:
      'How Dutch student houses can handle autumn midterms: mid-block study load, recovery gaps, and indoor bonding without turning the flat into another campus.',
    type: 'article',
    publishedTime: '2026-10-14',
    authors: ['Domu Match Team'],
  },
}

export default function AutumnMidtermBurnoutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Autumn Midterm Burnout: Housemate Routines That Actually Help',
        description:
          'Editorial survival guide for Dutch student houses in mid-autumn: mid-block study peaks, recovery gaps after assessments, and low-pressure indoor bonding routines grounded in Tilburg workload research and national wellbeing monitoring.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-10-14',
        dateModified: '2026-10-14',
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
            'https://domumatch.com/blog/autumn-midterm-burnout-housemate-routines',
        },
        articleSection: 'Wellbeing',
        keywords:
          'autumn midterm burnout housemates Netherlands, midterm study routines shared house, indoor house bonding students, herfst burnout studentenhuis',
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
            name: 'Autumn Midterm Burnout: Housemate Routines That Actually Help',
            item:
              'https://domumatch.com/blog/autumn-midterm-burnout-housemate-routines',
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
      <AutumnMidtermBurnoutArticle />
    </>
  )
}
