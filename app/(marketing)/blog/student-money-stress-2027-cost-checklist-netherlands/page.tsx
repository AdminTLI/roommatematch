import { Metadata } from 'next'
import { StudentMoneyStress2027Article } from './article-content'

export const metadata: Metadata = {
  title: 'Student Money Stress: Your 2027 Cost Checklist | Domu Match',
  description:
    'More Dutch students ask for money help. Use our 2027 health insurance and zorgtoeslag checklist, plus a house chat script to talk costs.',
  keywords:
    'student money stress Netherlands, zorgverzekering student 2027, zorgtoeslag student 2027, eigen risico 2027, student budget Netherlands, geldstress studenten',
  openGraph: {
    title: 'Student Money Stress: Your 2027 Cost Checklist',
    description:
      'Money stress is rising among Dutch students. A 30-minute checklist for 2027 health insurance and zorgtoeslag, with a house chat script.',
    type: 'article',
    publishedTime: '2026-11-25',
    authors: ['Domu Match Team'],
  },
}

export default function StudentMoneyStress2027Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Student Money Stress: Your 2027 Cost Checklist',
        description:
          'Practical impact guide on rising student money stress in the Netherlands: 2027 health insurance premiums, eigen risico, zorgtoeslag, a 30-minute checklist and a house chat script.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-11-25',
        dateModified: '2026-11-25',
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
            'https://domumatch.com/blog/student-money-stress-2027-cost-checklist-netherlands',
        },
        articleSection: 'Finance',
        keywords:
          'student money stress Netherlands, zorgverzekering student 2027, zorgtoeslag student 2027, eigen risico 2027',
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
            name: 'Student Money Stress: Your 2027 Cost Checklist',
            item:
              'https://domumatch.com/blog/student-money-stress-2027-cost-checklist-netherlands',
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
      <StudentMoneyStress2027Article />
    </>
  )
}
