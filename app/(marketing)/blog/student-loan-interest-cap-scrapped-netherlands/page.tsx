import { Metadata } from 'next'
import { StudentLoanInterestCapScrappedArticle } from './article-content'

export const metadata: Metadata = {
  title: 'No Student Loan Interest Cap: What To Do Now | Domu Match',
  description:
    'The 2.5% student loan interest cap is gone. See what DUO rates mean for your budget, plus a checklist and a house chat script.',
  keywords:
    'student loan interest Netherlands, renteplafond studielening, DUO rente 2027, studieschuld rente, studiefinanciering 2026, student finance Netherlands international students',
  openGraph: {
    title: 'No Student Loan Interest Cap: What To Do Now',
    description:
      'The Tweede Kamer scrapped the 2.5% student loan interest cap. What DUO rates mean for Dutch and international students, with a checklist.',
    type: 'article',
    publishedTime: '2026-11-11',
    authors: ['Domu Match Team'],
  },
}

export default function StudentLoanInterestCapScrappedPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'No Student Loan Interest Cap: What To Do Now',
        description:
          'Practical impact guide on the scrapped 2.5% student loan interest cap in the Netherlands: DUO rates for 2027, what it means for Dutch and international students, and a budget checklist.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-11-11',
        dateModified: '2026-11-11',
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
            'https://domumatch.com/blog/student-loan-interest-cap-scrapped-netherlands',
        },
        articleSection: 'Finance',
        keywords:
          'student loan interest Netherlands, renteplafond studielening, DUO rente 2027, studieschuld rente, student finance Netherlands',
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
            name: 'No Student Loan Interest Cap: What To Do Now',
            item:
              'https://domumatch.com/blog/student-loan-interest-cap-scrapped-netherlands',
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
      <StudentLoanInterestCapScrappedArticle />
    </>
  )
}
