import { Metadata } from 'next'
import { GraduatesBlockingStudentRoomsArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Graduates Blocking Student Rooms: What Dutch Data Shows',
  description:
    'Kences and NOS report that 57% of graduates still occupy student rooms after a year. Here is how exit delays inflate the shortage and what cities plan next.',
  keywords:
    'graduates blocking student rooms Netherlands, student housing shortage, Kences monitor, student room turnover, Eindhoven student housing',
  openGraph: {
    title: 'Graduates Blocking Student Rooms: What Dutch Data Shows',
    description:
      'Evidence-led look at how delayed exit from student rooms compounds the Dutch housing shortage, with municipal responses from Eindhoven and national monitor data.',
    type: 'article',
    publishedTime: '2026-06-24',
    authors: ['Domu Match Team'],
  },
}

export default function GraduatesBlockingStudentRoomsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Graduates Blocking Student Rooms: What Dutch Data Shows',
        description:
          'Editorial analysis of Kences and NOS reporting on graduate occupancy in student rooms, supply shrinkage in the private sector, and municipal build plans in Eindhoven.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-06-24',
        dateModified: '2026-06-24',
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
            'https://domumatch.com/blog/graduates-blocking-student-rooms-netherlands',
        },
        articleSection: 'Housing',
        keywords:
          'graduates blocking student rooms Netherlands, student housing shortage, Kences monitor, student room turnover, Eindhoven student housing',
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
            name: 'Graduates blocking student rooms',
            item:
              'https://domumatch.com/blog/graduates-blocking-student-rooms-netherlands',
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
      <GraduatesBlockingStudentRoomsArticle />
    </>
  )
}
