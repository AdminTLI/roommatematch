import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingLayoutFix } from '../components/marketing-layout-fix'

export const metadata: Metadata = {
  title: 'Find Your Perfect Roommate in Nijmegen | Domu Match',
  description:
    'Find compatible roommates in Nijmegen with Domu Match. Connect with verified students from Radboud University, HAN. Green student city.',
  keywords: [
    'find roommate Nijmegen',
    'Radboud roommate',
    'student housing Nijmegen',
    'HAN roommate',
    'Nijmegen accommodation',
  ],
  openGraph: {
    title: 'Find Your Perfect Roommate in Nijmegen | Domu Match',
    description: 'Find compatible roommates in Nijmegen. Radboud and HAN students. Science-backed matching.',
    type: 'website',
    url: 'https://domumatch.com/nijmegen',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in Nijmegen - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  alternates: { canonical: 'https://domumatch.com/nijmegen' },
}

export default function NijmegenPage() {
  const structuredData = getCityStructuredData('nijmegen')

  return (
    <>
      <MarketingLayoutFix />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content" className="min-h-screen bg-slate-950 pt-16 md:pt-20">
        <Navbar />
        <UniversityCityPage cityKey="nijmegen" />
        <Footer />
      </main>
    </>
  )
}
