import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingLayoutFix } from '../components/marketing-layout-fix'

export const metadata: Metadata = {
  title: 'Find Your Perfect Roommate in Utrecht | Domu Match',
  description:
    'Find compatible roommates in Utrecht with Domu Match. Connect with verified students from Utrecht University, HU, and more. Science-backed matching for Utrecht student housing.',
  keywords: [
    'find roommate Utrecht',
    'roommate finder Utrecht',
    'student housing Utrecht',
    'room share Utrecht',
    'Utrecht University roommate',
    'HU Utrecht housing',
    'student rooms Utrecht',
    'compatible roommate Utrecht',
  ],
  openGraph: {
    title: 'Find Your Perfect Roommate in Utrecht | Domu Match',
    description: 'Find compatible roommates in Utrecht with science-backed matching.',
    type: 'website',
    url: 'https://domumatch.com/utrecht',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in Utrecht - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  alternates: {
    canonical: 'https://domumatch.com/utrecht',
  },
}

export default function UtrechtPage() {
  const structuredData = getCityStructuredData('utrecht')

  return (
    <>
      <MarketingLayoutFix />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content" className="min-h-screen bg-slate-950 pt-16 md:pt-20">
        <Navbar />
        <UniversityCityPage cityKey="utrecht" />
        <Footer />
      </main>
    </>
  )
}
