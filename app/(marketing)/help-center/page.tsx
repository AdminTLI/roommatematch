import Footer from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'
import { HelpCenterContent } from './help-center-content'
import { Metadata } from 'next'
import { helpContent } from './help-content'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Help Center | Domu Match - Support & FAQ',
  description: 'Get help with Domu Match. Find answers about getting started, account verification, matching scores, safety features, and more for students in the Netherlands.',
  keywords: [
    'Domu Match help',
    'roommate matching FAQ',
    'student housing support',
    'roommate platform help',
    'matching scores explained',
    'verification help',
    'student housing FAQ Netherlands',
  ],
  openGraph: {
    title: 'Help Center | Domu Match',
    description: 'Get help with Domu Match. Find answers about getting started, verification, matching, and safety features.',
    type: 'website',
    url: 'https://domumatch.vercel.app/help-center',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Help Center - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center | Domu Match',
    description: 'Get help with Domu Match. Find answers about getting started, verification, and matching.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/help-center',
  },
}

export default function HelpCenterPage() {
  // Get all FAQs for structured data
  const sections = helpContent.en
  const allFaqs = sections.flatMap(section => section.faqs)
  const topFaqs = allFaqs.slice(0, 10) // Limit to top 10 for structured data

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: topFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.title,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.content.substring(0, 500), // Limit content length for structured data
          },
        })),
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
            name: 'Help Center',
            item: 'https://domumatch.vercel.app/help-center',
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main>
        <Navbar />
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
          <HelpCenterContent />
        </Suspense>
        <Footer />
      </main>
    </>
  )
}


