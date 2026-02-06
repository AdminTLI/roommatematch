import Footer from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'
import { ContactContent } from './contact-content'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Domu Match - Get in Touch',
  description: 'Get in touch with Domu Match. Questions about roommate matching, student housing, or our platform? Contact us via email or use our contact form.',
  keywords: [
    'contact Domu Match',
    'roommate matching support',
    'student housing contact',
    'Domu Match email',
    'roommate platform support',
    'Netherlands student housing contact',
  ],
  openGraph: {
    title: 'Contact Us | Domu Match',
    description: 'Get in touch with Domu Match. Questions about roommate matching, student housing, or our platform? Contact us today.',
    type: 'website',
    url: 'https://domumatch.com/contact',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Contact Domu Match',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Domu Match',
    description: 'Get in touch with Domu Match. Questions about roommate matching or student housing? Contact us today.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/contact',
  },
}

export default function ContactPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://domumatch.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Contact',
        item: 'https://domumatch.com/contact',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="pt-16 md:pt-20">
        <Navbar />
        <ContactContent />
        <Footer />
      </main>
    </>
  )
}


