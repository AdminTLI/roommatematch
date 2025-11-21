import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { CareersContent } from './careers-content'

export const metadata: Metadata = {
  title: 'Careers | Domu Match - Join Our Community',
  description: 'Volunteer with Domu Match as an experienced contributor or student. Build real impact on roommate safety and trust in the Netherlands. Join our mission-driven team.',
  keywords: [
    'Domu Match careers',
    'roommate matching jobs',
    'student housing careers',
    'volunteer opportunities Netherlands',
    'tech volunteer positions',
    'student housing platform jobs',
    'roommate matching company careers',
  ],
  openGraph: {
    title: 'Careers | Domu Match - Join Our Community',
    description: 'Volunteer with Domu Match as an experienced contributor or student. Build real impact on roommate safety and trust.',
    type: 'website',
    url: 'https://domumatch.vercel.app/careers',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Careers at Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers | Domu Match - Join Our Community',
    description: 'Volunteer with Domu Match. Build real impact on roommate safety and trust in the Netherlands.',
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/careers',
  },
}

export default function CareersPage() {
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
        name: 'Careers',
        item: 'https://domumatch.vercel.app/careers',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main id="main-content">
        <Navbar />
        <CareersContent />
        <Footer />
      </main>
    </>
  )
}

