import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { UniversitiesSection } from '@/components/site/universities-section'
import { AdminFeatures } from '@/components/site/admin-features'
import { FinalCTA } from '@/components/site/final-cta'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'University Housing Solutions | Domu Match - Netherlands',
  description: 'Reduce housing disputes with intelligent roommate matching for Dutch universities. Admin dashboard, analytics, and dedicated support for university housing teams in Amsterdam, Rotterdam, Utrecht.',
  keywords: [
    'university housing management',
    'student accommodation solutions',
    'roommate matching for universities',
    'admin dashboard student housing',
    'housing analytics Netherlands',
    'Dutch university housing',
    'student housing management platform',
    'university housing software',
    'housing dispute reduction',
  ],
  openGraph: {
    title: 'University Housing Solutions | Domu Match',
    description: 'Reduce housing disputes with intelligent roommate matching for Dutch universities. Admin dashboard, analytics, and dedicated support.',
    type: 'website',
    url: 'https://domumatch.vercel.app/universities',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'University Housing Solutions - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'University Housing Solutions | Domu Match',
    description: 'Reduce housing disputes with intelligent roommate matching for Dutch universities.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/universities',
  },
}

export default function UniversitiesPage() {
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
        name: 'For Universities',
        item: 'https://domumatch.vercel.app/universities',
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
          <UniversitiesSection />
          <AdminFeatures />
          <FinalCTA />
        </div>
        <Footer />
      </main>
    </>
  )
}
