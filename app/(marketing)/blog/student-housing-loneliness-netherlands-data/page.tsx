import { Metadata } from 'next'
import { StudentHousingLonelinessNetherlandsArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Student Housing and Loneliness: What Dutch Data Show',
  description:
    'CBS and NIDI figures on staying home, NOS reporting on Kences monitors, and municipal housing rules in Breda and Tilburg, in one evidence-led overview.',
  keywords:
    'student housing loneliness Netherlands, student housing shortage Netherlands, Kences monitor, CBS student living home, international student housing Netherlands',
  openGraph: {
    title: 'Student Housing and Loneliness: What Dutch Data Show',
    description:
      'How national monitors, CBS/NIDI mobility statistics, and local landlord rules sit in the same evidence stack as integration and wellbeing questions.',
    type: 'article',
    publishedTime: '2026-05-27',
    authors: ['Domu Match Team'],
  },
}

export default function StudentHousingLonelinessNetherlandsDataPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Student Housing and Loneliness: What Dutch Data Show',
        description:
          'Editorial synthesis of Dutch public reporting on student room shortages, CBS and NIDI statistics on living with parents through degree completion, Kences commentary on shared housing versus studios, and municipal landlord guidance in Breda and Tilburg.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-05-27',
        dateModified: '2026-05-27',
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
            'https://domumatch.com/blog/student-housing-loneliness-netherlands-data',
        },
        articleSection: 'Housing',
        keywords:
          'student housing loneliness Netherlands, student housing shortage Netherlands, Kences, CBS student housing, student wellbeing Netherlands',
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
            name: 'Student housing and loneliness: Dutch data',
            item:
              'https://domumatch.com/blog/student-housing-loneliness-netherlands-data',
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
      <StudentHousingLonelinessNetherlandsArticle />
    </>
  )
}
