import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { PricingSection } from '@/components/site/pricing-section'
import { FAQ } from '@/components/site/faq'
import { FinalCTA } from '@/components/site/final-cta'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing Plans | Domu Match - University Housing',
  description: 'Affordable pricing plans for Dutch universities. Reduce housing disputes with our intelligent roommate matching platform. Transparent pricing for student accommodation solutions.',
  keywords: [
    'university housing pricing',
    'roommate matching pricing',
    'student accommodation pricing',
    'housing management cost',
    'university housing platform pricing',
    'student housing software pricing',
    'Netherlands university housing pricing',
  ],
  openGraph: {
    title: 'Pricing Plans | Domu Match',
    description: 'Affordable pricing plans for Dutch universities. Reduce housing disputes with our intelligent roommate matching platform.',
    type: 'website',
    url: 'https://domumatch.vercel.app/pricing',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Pricing Plans - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing Plans | Domu Match',
    description: 'Affordable pricing plans for Dutch universities. Reduce housing disputes with intelligent roommate matching.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/pricing',
  },
}

export default function PricingPage() {
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
        name: 'Pricing',
        item: 'https://domumatch.vercel.app/pricing',
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
          <PricingSection />
          <FAQ />
          <FinalCTA />
        </div>
        <Footer />
      </main>
    </>
  )
}
