import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'

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
    url: 'https://domumatch.vercel.app/contact',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.vercel.app/images/logo.png',
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
    images: ['https://domumatch.vercel.app/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.vercel.app/contact',
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
        item: 'https://domumatch.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Contact',
        item: 'https://domumatch.vercel.app/contact',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main>
        <Navbar />
        <Section className="bg-white">
        <Container>
          <h1 className="text-4xl font-bold mb-6 text-brand-text">Contact</h1>
          <p className="text-brand-muted mb-8 max-w-2xl">Questions or feedback? Use the form below or email us at <span className="font-medium">domumatch@gmail.com</span>.</p>

          <form className="grid gap-4 max-w-xl">
            <input className="border rounded-md px-4 py-3" placeholder="Your name" />
            <input className="border rounded-md px-4 py-3" placeholder="Email" type="email" />
            <textarea className="border rounded-md px-4 py-3 h-40" placeholder="How can we help?" />
            <button className="bg-brand-600 text-white px-5 py-3 rounded-md">Send</button>
          </form>
        </Container>
      </Section>
      <Footer />
    </main>
  )
}


