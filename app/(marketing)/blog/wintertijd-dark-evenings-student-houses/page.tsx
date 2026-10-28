import { Metadata } from 'next'
import { WintertijdDarkEveningsStudentHousesArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Wintertijd House Rhythm for Dutch Students | Domu Match',
  description:
    'After the October clock change, Dutch student houses face earlier dark evenings. Reset living-room time, quiet hours, and light routines early.',
  keywords:
    'wintertijd dark evenings student houses Netherlands, wintertijd studentenhuis, dark evenings housemates, clock change student living Netherlands, autumn quiet hours student house',
  openGraph: {
    title: 'Wintertijd House Rhythm for Dutch Students',
    description:
      'How the late-October clock change reshapes shared living: earlier darkness, living-room claims, and light routines.',
    type: 'article',
    publishedTime: '2026-10-28',
    authors: ['Domu Match Team'],
  },
}

export default function WintertijdDarkEveningsStudentHousesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Wintertijd House Rhythm for Dutch Students',
        description:
          'Survival guide for Dutch student houses after the October wintertijd switch: earlier dark evenings, living-room time claims, quiet hours, and shared light routines.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-10-28',
        dateModified: '2026-10-28',
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
            'https://domumatch.com/blog/wintertijd-dark-evenings-student-houses',
        },
        articleSection: 'Lifestyle',
        keywords:
          'wintertijd dark evenings student houses Netherlands, wintertijd studentenhuis, dark evenings housemates, clock change student living',
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
            name: 'Wintertijd House Rhythm for Dutch Students',
            item:
              'https://domumatch.com/blog/wintertijd-dark-evenings-student-houses',
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
      <WintertijdDarkEveningsStudentHousesArticle />
    </>
  )
}
