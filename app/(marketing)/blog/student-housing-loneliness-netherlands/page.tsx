import { Metadata } from 'next'
import { StudentHousingLonelinessNetherlandsArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Student Housing Loneliness Netherlands: Dutch Data | Domu Match',
  description:
    'Kences and CBS figures show fewer Dutch students live on their own. Room shortages, studio campuses, and policy shifts fuel loneliness, not just rent stress.',
  keywords:
    'student housing loneliness Netherlands, thuiswonende studenten, Kences monitor, student wellbeing housing, De Uithof loneliness',
  openGraph: {
    title: 'Student Housing Loneliness in the Netherlands: What the Data Actually Show',
    description:
      'Evidence-led overview of how Dutch room shortages, studio-heavy campuses, and rising parental-home living reshape student loneliness and social networks.',
    type: 'article',
    publishedTime: '2026-07-15',
    authors: ['Domu Match Team'],
  },
}

export default function StudentHousingLonelinessNetherlandsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'Student Housing Loneliness in the Netherlands: What the Data Actually Show',
        description:
          'Editorial analysis of Kences and CBS data on students living at home, studio campus design, and shrinking shared student housing as drivers of loneliness in Dutch higher education.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-07-15',
        dateModified: '2026-07-15',
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
            'https://domumatch.com/blog/student-housing-loneliness-netherlands',
        },
        articleSection: 'Wellbeing',
        keywords:
          'student housing loneliness Netherlands, thuiswonende studenten, Kences monitor, student wellbeing housing, De Uithof loneliness',
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
            name: 'Student Housing Loneliness Netherlands',
            item:
              'https://domumatch.com/blog/student-housing-loneliness-netherlands',
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
