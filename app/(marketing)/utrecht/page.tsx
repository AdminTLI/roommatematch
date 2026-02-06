import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { FinalCTA } from '@/components/site/final-cta'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { Check, Users, Shield } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Find Your Perfect Roommate in Utrecht | Domu Match',
  description: 'Find compatible roommates in Utrecht with Domu Match. Connect with verified students from Utrecht University, HU, and more. Science-backed matching for Utrecht student housing.',
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
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Domu Match - Utrecht',
    description: 'Find compatible roommates in Utrecht',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Utrecht',
      addressCountry: 'NL',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main className="min-h-screen bg-white pt-16 md:pt-20">
        <Navbar />
        
        <Section className="bg-gradient-to-b from-brand-primary/5 to-white">
          <Container>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-text">
                Find Your Perfect Roommate in <span className="text-brand-primary">Utrecht</span>
              </h1>
              <p className="text-xl text-brand-muted max-w-2xl mx-auto">
                Connect with verified students from Utrecht University, HU, and other institutions. Science-backed matching in the heart of the Netherlands.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="bg-brand-primary hover:bg-brand-primaryHover text-white px-8">Get Started Free</Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="border-2 border-brand-border px-8">How It Works</Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 justify-center pt-6 text-sm text-brand-muted">
                <div className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-500" /><span>Free for students</span></div>
                <div className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-500" /><span>Verified students only</span></div>
              </div>
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <div className="max-w-4xl mx-auto space-y-8 text-center">
              <h2 className="text-3xl font-bold">Student Housing in Utrecht</h2>
              <p className="text-lg text-brand-muted">Utrecht offers a compact, bike-friendly city with good student housing options. Average rent: €450-€700/month. Popular areas: Lombok, Wittevrouwen, and Science Park.</p>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Utrecht University</h3>
                  <p className="text-brand-muted">30,000+ students | Broad academic programs</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">HU University of Applied Sciences</h3>
                  <p className="text-brand-muted">38,000+ students | Practical education</p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <FinalCTA />
        <Footer />
      </main>
    </>
  )
}
