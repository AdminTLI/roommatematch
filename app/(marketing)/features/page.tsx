import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { FeaturesSection } from '@/components/site/features-section'
import { FinalCTA } from '@/components/site/final-cta'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roommate Matching Features | Domu Match - AI Technology',
  description: 'Explore Domu Match features: AI-powered compatibility matching, verified students, safe messaging, and university integration. Perfect for students in the Netherlands.',
  keywords: [
    'roommate matching features',
    'AI matching algorithm',
    'verified students platform',
    'safe chat student housing',
    'academic integration',
    'roommate finder features',
    'student housing platform features',
    'compatibility matching technology',
    'Netherlands student housing features',
  ],
  openGraph: {
    title: 'Roommate Matching Features | Domu Match',
    description: 'Explore Domu Match features: AI-powered compatibility matching, verified students, safe messaging, and university integration.',
    type: 'website',
    url: 'https://domumatch.vercel.app/features',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Roommate Matching Features - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roommate Matching Features | Domu Match',
    description: 'Explore Domu Match features: AI-powered compatibility matching, verified students, safe messaging.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/features',
  },
}

export default function FeaturesPage() {
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
        name: 'Features',
        item: 'https://domumatch.vercel.app/features',
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
        <div className="pt-20">
          <FeaturesSection />
          <FinalCTA />
        </div>
        <Footer />
      </main>
    </>
  )
}
