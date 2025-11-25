import { Metadata } from 'next'
import { SafetyChecklistArticle } from './article-content'

export const metadata: Metadata = {
  title: 'Safety Checklist for Student Renters: Verification, Contracts & Best Practices | Domu Match',
  description: 'Protect yourself from rental scams and understand your tenant rights in the Netherlands. A comprehensive safety checklist for student renters with Dutch rental law guidance.',
  keywords: 'student rental safety Netherlands, rental scams, Dutch tenant rights, student housing safety, rental contract Netherlands, Good Landlordship Act',
  openGraph: {
    title: 'Safety Checklist for Student Renters',
    description: 'Verification, contracts, and best practices for safe living in the Netherlands.',
    type: 'article',
    publishedTime: '2025-11-10',
    authors: ['Domu Match Team'],
  },
}

export default function SafetyChecklistPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Safety Checklist for Student Renters: Verification, Contracts & Best Practices',
        description: 'Protect yourself from rental scams and understand your tenant rights in the Netherlands. A comprehensive safety checklist for student renters with Dutch rental law guidance.',
        image: 'https://domumatch.vercel.app/images/logo.png',
        datePublished: '2025-11-10',
        dateModified: '2025-11-10',
        author: {
          '@type': 'Organization',
          name: 'Domu Match Team',
          url: 'https://domumatch.vercel.app',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Domu Match',
          logo: {
            '@type': 'ImageObject',
            url: 'https://domumatch.vercel.app/images/logo.png',
            width: 1200,
            height: 630,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': 'https://domumatch.vercel.app/blog/safety-checklist-for-student-renters',
        },
        articleSection: 'Safety',
        keywords: 'student rental safety Netherlands, rental scams, Dutch tenant rights, student housing safety',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://domumatch.vercel.app',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://domumatch.vercel.app/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Safety Checklist for Student Renters',
            item: 'https://domumatch.vercel.app/blog/safety-checklist-for-student-renters',
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
      <SafetyChecklistArticle />
    </>
  )
}


