import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingLayoutFix } from '../components/marketing-layout-fix'

export const metadata: Metadata = {
  title: 'Find Your Perfect Roommate in The Hague | Domu Match',
  description:
    'Find compatible roommates in The Hague (Den Haag) with Domu Match. Connect with verified students from Leiden University The Hague, The Hague University, and more.',
  keywords: [
    'find roommate Den Haag',
    'roommate finder The Hague',
    'student housing Den Haag',
    'The Hague student rooms',
    'Leiden University The Hague',
    'Den Haag accommodation',
  ],
  openGraph: {
    title: 'Find Your Perfect Roommate in The Hague | Domu Match',
    description: 'Find compatible roommates in The Hague with science-backed matching.',
    type: 'website',
    url: 'https://domumatch.com/den-haag',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in The Hague - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  alternates: { canonical: 'https://domumatch.com/den-haag' },
}

export default function DenHaagPage() {
  const structuredData = getCityStructuredData('den-haag')

  return (
    <>
      <MarketingLayoutFix />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content" className="min-h-screen bg-slate-950 pt-16 md:pt-20">
        <Navbar />
        <UniversityCityPage cityKey="den-haag" />
        <Footer />
      </main>
    </>
  )
}
