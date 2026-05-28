import { Metadata } from 'next'
import { NightOwlVs8amLectureArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'Night Owl vs. 8 A.M. Lecture: Matching Sleep Schedules Before They Clash | Domu Match',
  description:
    'Sleep is critical for academic performance. Learn how mismatched sleep schedules create predictable conflict in shared housing, and how to talk about routines before you move in.',
  keywords:
    'student sleep roommates, night owl roommate, 8am lectures sleep, academic performance sleep, sleep routines roommates',
  openGraph: {
    title: 'Night Owl vs. 8 A.M. Lecture: Matching Sleep Schedules Before They Clash',
    description:
      'A practical guide to how sleep and roommate routines interact, plus questions and agreements that prevent predictable conflict.',
    type: 'article',
    publishedTime: '2026-01-20',
    authors: ['Domu Match Team'],
  },
}

export default function NightOwlVs8amLecturePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'Night Owl vs. 8 A.M. Lecture: Matching Sleep Schedules Before They Clash',
        description:
          'Explores why aligned sleep schedules matter for grades and wellbeing, and how to turn routines into clear house agreements before conflict starts.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-01-20',
        dateModified: '2026-01-20',
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
          '@id': 'https://domumatch.com/blog/night-owl-vs-8am-lecture',
        },
        articleSection: 'Health',
        keywords:
          'student sleep roommates, night owl roommate, 8am lectures sleep, academic performance sleep, sleep routines roommates',
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
            name: 'Night Owl vs. 8 A.M. Lecture',
            item: 'https://domumatch.com/blog/night-owl-vs-8am-lecture',
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
      <NightOwlVs8amLectureArticle />
    </>
  )
}

