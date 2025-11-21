import Footer from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'
import { Metadata } from 'next'
import { BlogContent } from './blog-content'

export const metadata: Metadata = {
  title: 'Blog | Domu Match - Student Housing Insights & Tips',
  description: 'Explore articles on roommate compatibility, student renter safety, and explainable AI in housing. Your guide to harmonious student living in the Netherlands.',
  keywords: [
    'student housing blog',
    'roommate tips Netherlands',
    'rental safety guide',
    'explainable AI housing',
    'Domu Match blog',
    'Netherlands student life',
    'roommate compatibility tips',
    'student housing advice',
    'roommate matching blog',
  ],
  openGraph: {
    title: 'Blog | Domu Match - Student Housing Insights',
    description: 'Explore articles on roommate compatibility, student renter safety, and explainable AI in housing. Your guide to harmonious student living.',
    type: 'website',
    url: 'https://domumatch.vercel.app/blog',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Domu Match Blog - Student Housing Insights',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Domu Match - Student Housing Insights',
    description: 'Explore articles on roommate compatibility, student renter safety, and explainable AI in housing.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/blog',
  },
}

export default function BlogPage() {
  const structuredData = {
    '@context': 'https://schema.org',
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
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-white">
        <Navbar />
        <BlogContent />
        <Footer />
      </main>
    </>
  )
}
