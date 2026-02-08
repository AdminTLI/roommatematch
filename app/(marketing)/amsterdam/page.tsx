import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { UniversityCityPage } from '@/components/site/university-city'
import { getCityStructuredData } from '@/components/site/university-city/content'
import { MarketingLayoutFix } from '../components/marketing-layout-fix'

export const metadata: Metadata = {
  title: 'Find Your Perfect Roommate in Amsterdam | Domu Match',
  description:
    'Find compatible roommates in Amsterdam with Domu Match. Connect with verified students from UvA, VU, HvA and more. Science-backed matching for Amsterdam student housing.',
  keywords: [
    'find roommate Amsterdam',
    'roommate finder Amsterdam',
    'student housing Amsterdam',
    'room share Amsterdam',
    'flatmate Amsterdam',
    'UvA roommate',
    'VU Amsterdam roommate',
    'HvA housing',
    'Amsterdam accommodation',
    'student rooms Amsterdam',
    'shared apartment Amsterdam',
    'compatible roommate Amsterdam',
  ],
  openGraph: {
    title: 'Find Your Perfect Roommate in Amsterdam | Domu Match',
    description:
      'Find compatible roommates in Amsterdam with science-backed matching. Connect with verified students from UvA, VU, HvA and more.',
    type: 'website',
    url: 'https://domumatch.com/amsterdam',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Find Roommates in Amsterdam - Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Perfect Roommate in Amsterdam | Domu Match',
    description: 'Find compatible roommates in Amsterdam with science-backed matching.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/amsterdam',
  },
}

export default function AmsterdamPage() {
  const structuredData = getCityStructuredData('amsterdam')

  return (
    <>
      <MarketingLayoutFix />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content" className="min-h-screen bg-slate-950 pt-16 md:pt-20">
        <Navbar />
        <UniversityCityPage cityKey="amsterdam" />
        <Footer />
      </main>
    </>
  )
}
