import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingLayoutFix } from '../components/marketing-layout-fix'

export const metadata: Metadata = {
  title: 'Find Your Perfect Roommate in Leiden | Domu Match',
  description:
    'Find compatible roommates in Leiden with Domu Match. Connect with verified students from Leiden University. Historic university city housing.',
  keywords: [
    'find roommate Leiden',
    'Leiden University roommate',
    'student housing Leiden',
    'Leiden accommodation',
    'oldest university city',
  ],
  openGraph: {
    title: 'Find Your Perfect Roommate in Leiden | Domu Match',
    description: 'Find compatible roommates in Leiden. Leiden University students. Science-backed matching.',
    type: 'website',
    url: 'https://domumatch.com/leiden',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in Leiden - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  alternates: { canonical: 'https://domumatch.com/leiden' },
}

export default function LeidenPage() {
  const structuredData = getCityStructuredData('leiden')

  return (
    <>
      <MarketingLayoutFix />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content" className="bg-slate-950 pt-16 md:pt-20">
        <Navbar />
        <UniversityCityPage cityKey="leiden" />
        <Footer />
      </main>
    </>
  )
}
