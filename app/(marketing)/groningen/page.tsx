import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingLayoutFix } from '../components/marketing-layout-fix'

export const metadata: Metadata = {
  title: 'Find Roommates in Groningen | Domu Match – Students & Young Professionals',
  description:
    'Find compatible roommates in Groningen with Domu Match. Connect with verified students and young professionals from University of Groningen, Hanze UAS. Science-backed matching for shared living.',
  keywords: [
    'find roommate Groningen',
    'RUG roommate',
    'student housing Groningen',
    'young professionals Groningen',
    'Hanze roommate',
    'Groningen accommodation',
  ],
  openGraph: {
    title: 'Find Roommates in Groningen | Domu Match',
    description: 'Find compatible roommates in Groningen. Verified students and young professionals. RUG and Hanze. Science-backed matching.',
    type: 'website',
    url: 'https://domumatch.com/groningen',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in Groningen - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  alternates: { canonical: 'https://domumatch.com/groningen' },
}

export default function GroningenPage() {
  const structuredData = getCityStructuredData('groningen')

  return (
    <>
      <MarketingLayoutFix />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content" className="bg-slate-950 pt-16 md:pt-20">
        <Navbar />
        <UniversityCityPage cityKey="groningen" />
        <Footer />
      </main>
    </>
  )
}
