import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { AboutContent } from './about-content'

export const metadata: Metadata = {
  title: 'About Us | Domu Match - Science-Driven Matching',
  description: 'Learn about Domu Match and our mission to make student living safer and happier in the Netherlands through science-backed roommate compatibility matching.',
  keywords: [
    'about Domu Match',
    'roommate matching company',
    'student housing platform',
    'compatibility matching',
    'Netherlands student housing',
    'roommate matching mission',
    'student accommodation company',
    'science-backed matching',
    'student housing tech company',
    'AI roommate matching company',
    'Dutch student housing innovation',
    'verified student community',
    'roommate compatibility research',
  ],
  openGraph: {
    title: 'About Us | Domu Match',
    description: 'Learn about Domu Match and our mission to make student living safer and happier in the Netherlands through science-backed matching.',
    type: 'website',
    url: 'https://domumatch.com/about',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'About Domu Match - Science-Driven Roommate Matching',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Domu Match',
    description: 'Learn about Domu Match and our mission to make student living safer and happier in the Netherlands.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/about',
  },
}

export default function AboutPage() {
  const structuredData = {
    '@context': 'https://schema.org',
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
        name: 'About',
        item: 'https://domumatch.com/about',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-white pt-16 md:pt-20">
        <Navbar />
        <AboutContent />
      <Footer />
    </main>
    </>
  )
}

