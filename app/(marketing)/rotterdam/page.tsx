import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { FinalCTA } from '@/components/site/final-cta'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { Check, Users, Home, Shield } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Find Your Perfect Roommate in Rotterdam | Domu Match',
  description: 'Find compatible roommates in Rotterdam with Domu Match. Connect with verified students from EUR, Erasmus University, InHolland and more. Science-backed matching for Rotterdam student housing.',
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
    description: 'Find compatible roommates in Rotterdam with science-backed matching. Connect with verified students from EUR and other Rotterdam universities.',
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
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        name: 'Domu Match - Rotterdam',
        description: 'Find compatible roommates in Rotterdam',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Rotterdam',
          addressRegion: 'Zuid-Holland',
          addressCountry: 'NL',
        },
      },
      {
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
            name: 'Rotterdam',
            item: 'https://domumatch.com/rotterdam',
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-white pt-16 md:pt-20">
        <Navbar />
        
        <Section className="bg-gradient-to-b from-brand-primary/5 to-white">
          <Container>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-text">
                Find Your Perfect Roommate in <span className="text-brand-primary">Rotterdam</span>
              </h1>
              <p className="text-xl text-brand-muted max-w-2xl mx-auto">
                Connect with compatible students from Erasmus University, InHolland, and other Rotterdam institutions. Science-backed matching for harmonious living.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="bg-brand-primary hover:bg-brand-primaryHover text-white px-8">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="border-2 border-brand-border px-8">
                    How It Works
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 justify-center pt-6 text-sm text-brand-muted">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span>Free for students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span>Verified students only</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span>Science-backed matching</span>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="border-y border-brand-border/30 bg-gray-50/50">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-primary">2,800+</div>
                <div className="text-sm text-brand-muted mt-2">Rotterdam students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-primary">€420</div>
                <div className="text-sm text-brand-muted mt-2">Avg. room price</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-primary">4</div>
                <div className="text-sm text-brand-muted mt-2">Major universities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-primary">94%</div>
                <div className="text-sm text-brand-muted mt-2">Match satisfaction</div>
              </div>
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-brand-text">
                  Student Housing in Rotterdam
                </h2>
                <p className="text-lg text-brand-muted max-w-2xl mx-auto">
                  Rotterdam offers more affordable housing than Amsterdam with excellent student amenities
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-brand-text">Market Overview</h3>
                  <div className="space-y-3 text-brand-muted">
                    <p><strong>Average Rent:</strong> €350-€650/month, more affordable than Amsterdam</p>
                    <p><strong>Housing Type:</strong> Mix of renovated warehouses, modern apartments, and traditional housing</p>
                    <p><strong>Competition:</strong> Moderate demand, easier to find housing than Amsterdam</p>
                    <p><strong>Transport:</strong> Excellent metro system connects all major areas</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-brand-text">Popular Neighborhoods</h3>
                  <ul className="space-y-3 text-brand-muted">
                    <li><strong>Kralingen:</strong> Near EUR campus, student-friendly - €400-€600/month</li>
                    <li><strong>Noord:</strong> Affordable, multicultural, great transport - €350-€500/month</li>
                    <li><strong>West:</strong> Vibrant, close to city center - €450-€650/month</li>
                    <li><strong>Blijdorp:</strong> Quiet, green spaces, near zoo - €400-€550/month</li>
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="bg-gray-50/50">
          <Container>
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-brand-text">
                  Rotterdam Universities
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-brand-border/30 shadow-sm">
                  <h3 className="text-xl font-semibold text-brand-text mb-2">Erasmus University Rotterdam (EUR)</h3>
                  <p className="text-brand-muted mb-4">24,000+ students | Top-ranked business and economics programs</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-brand-border/30 shadow-sm">
                  <h3 className="text-xl font-semibold text-brand-text mb-2">Rotterdam University of Applied Sciences</h3>
                  <p className="text-brand-muted mb-4">28,000+ students | Practical education in business, healthcare, engineering</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-brand-border/30 shadow-sm">
                  <h3 className="text-xl font-semibold text-brand-text mb-2">InHolland Rotterdam</h3>
                  <p className="text-brand-muted mb-4">Professional education with strong industry connections</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-brand-border/30 shadow-sm">
                  <h3 className="text-xl font-semibold text-brand-text mb-2">Codarts</h3>
                  <p className="text-brand-muted mb-4">University of Arts for music, dance, and circus performers</p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-brand-text">
                  Why Rotterdam Students Choose Domu Match
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Verified Students Only</h3>
                  <p className="text-brand-muted">All users verified with university email.</p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Science-Backed Matching</h3>
                  <p className="text-brand-muted">40+ compatibility factors analyzed.</p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Free Forever</h3>
                  <p className="text-brand-muted">Completely free for all students.</p>
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
