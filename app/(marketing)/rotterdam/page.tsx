import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingLayoutFix } from '../components/marketing-layout-fix'

export const metadata: Metadata = {
  title: 'Find Your Perfect Roommate in Rotterdam | Domu Match',
  description:
    'Find compatible roommates in Rotterdam with Domu Match. Connect with verified students from EUR, Erasmus University, InHolland and more. Science-backed matching for Rotterdam student housing.',
  keywords: [
    'find roommate Rotterdam',
    'roommate finder Rotterdam',
    'student housing Rotterdam',
    'room share Rotterdam',
    'flatmate Rotterdam',
    'EUR roommate',
    'Erasmus University roommate',
    'InHolland Rotterdam',
    'Rotterdam accommodation',
    'student rooms Rotterdam',
    'shared apartment Rotterdam',
    'compatible roommate Rotterdam',
  ],
  openGraph: {
    title: 'Find Your Perfect Roommate in Rotterdam | Domu Match',
    description:
      'Find compatible roommates in Rotterdam with science-backed matching. Connect with verified students from EUR and other Rotterdam universities.',
    type: 'website',
    url: 'https://domumatch.com/rotterdam',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in Rotterdam - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Perfect Roommate in Rotterdam | Domu Match',
    description: 'Find compatible roommates in Rotterdam with science-backed matching.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/rotterdam',
  },
}

export default function RotterdamPage() {
  const structuredData = getCityStructuredData('rotterdam')

  return (
    <>
      <MarketingLayoutFix />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content" className="bg-slate-950 pt-16 md:pt-20">
        <Navbar />
        <UniversityCityPage cityKey="rotterdam" />
        <Footer />
      </main>
    </>
  )
}
