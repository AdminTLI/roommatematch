import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingLayoutFix } from '../components/marketing-layout-fix'

export const metadata: Metadata = {
  title: 'Find Your Perfect Roommate in Eindhoven | Domu Match',
  description:
    'Find compatible roommates in Eindhoven with Domu Match. Connect with verified students from TU Eindhoven, Fontys, and more. Tech hub student housing.',
  keywords: [
    'find roommate Eindhoven',
    'TU Eindhoven roommate',
    'student housing Eindhoven',
    'Fontys roommate',
    'Eindhoven accommodation',
    'tech student housing',
  ],
  openGraph: {
    title: 'Find Your Perfect Roommate in Eindhoven | Domu Match',
    description: 'Find compatible roommates in Eindhoven with science-backed matching. TU/e and Fontys students.',
    type: 'website',
    url: 'https://domumatch.com/eindhoven',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in Eindhoven - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  alternates: { canonical: 'https://domumatch.com/eindhoven' },
}

export default function EindhovenPage() {
  const structuredData = getCityStructuredData('eindhoven')

  return (
    <>
      <MarketingLayoutFix />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content" className="bg-slate-950 pt-16 md:pt-20">
        <Navbar />
        <UniversityCityPage cityKey="eindhoven" />
        <Footer />
      </main>
    </>
  )
}
