import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { FinalCTA } from '@/components/site/final-cta'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { Check, Users, Home, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Find Your Perfect Roommate in Amsterdam | Domu Match',
  description: 'Find compatible roommates in Amsterdam with Domu Match. Connect with verified students from UvA, VU, HvA and more. Science-backed matching for Amsterdam student housing.',
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
    description: 'Find compatible roommates in Amsterdam with science-backed matching. Connect with verified students from UvA, VU, HvA and more.',
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
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        name: 'Domu Match - Amsterdam',
        description: 'Find compatible roommates in Amsterdam',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Amsterdam',
          addressRegion: 'Noord-Holland',
          addressCountry: 'NL',
        },
        areaServed: {
          '@type': 'City',
          name: 'Amsterdam',
        },
        serviceType: 'Roommate Matching Service',
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
            name: 'Amsterdam',
            item: 'https://domumatch.com/amsterdam',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is the average rent for student rooms in Amsterdam?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Student rooms in Amsterdam typically range from €450-€700 per month for a shared room, and €700-€1,200 for a private room. Prices vary by neighborhood, with areas like Centrum and Zuid being more expensive than Oost or Noord.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which universities does Domu Match work with in Amsterdam?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Domu Match works with all major Amsterdam universities including University of Amsterdam (UvA), Vrije Universiteit Amsterdam (VU), Amsterdam University of Applied Sciences (HvA), Gerrit Rietveld Academie, and Conservatorium van Amsterdam.',
            },
          },
          {
            '@type': 'Question',
            name: 'What are the best neighborhoods for students in Amsterdam?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Popular student neighborhoods in Amsterdam include De Pijp (lively, multicultural), Oost (affordable, diverse), Noord (creative, growing), Westerpark (young professionals), and areas near university campuses like Science Park and Uilenstede.',
            },
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
        
        {/* Hero Section */}
        <Section className="bg-gradient-to-b from-brand-primary/5 to-white">
          <Container>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-text">
                Find Your Perfect Roommate in <span className="text-brand-primary">Amsterdam</span>
              </h1>
              <p className="text-xl text-brand-muted max-w-2xl mx-auto">
                Connect with compatible students from UvA, VU, HvA, and other Amsterdam universities. Science-backed matching for harmonious living in the capital.
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

        {/* Stats Section */}
        <Section className="border-y border-brand-border/30 bg-gray-50/50">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-primary">4,200+</div>
                <div className="text-sm text-brand-muted mt-2">Amsterdam students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-primary">€550</div>
                <div className="text-sm text-brand-muted mt-2">Avg. room price</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-primary">5</div>
                <div className="text-sm text-brand-muted mt-2">Major universities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-primary">92%</div>
                <div className="text-sm text-brand-muted mt-2">Match satisfaction</div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Amsterdam Housing Market Section */}
        <Section>
          <Container>
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-brand-text">
                  Student Housing in Amsterdam
                </h2>
                <p className="text-lg text-brand-muted max-w-2xl mx-auto">
                  Amsterdam's student housing market is competitive, but finding the right roommate makes all the difference
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-brand-text flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-brand-primary" />
                    Market Overview
                  </h3>
                  <div className="space-y-3 text-brand-muted">
                    <p><strong>Average Rent:</strong> €450-€1,200/month depending on location and room type</p>
                    <p><strong>Housing Type:</strong> Mix of studio apartments, shared flats, and student residences</p>
                    <p><strong>Competition:</strong> High demand, especially for affordable options near universities</p>
                    <p><strong>Contracts:</strong> Most rental agreements are 6-12 months, some landlords offer academic year contracts</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-brand-text flex items-center gap-3">
                    <Home className="h-6 w-6 text-brand-primary" />
                    Popular Neighborhoods
                  </h3>
                  <ul className="space-y-3 text-brand-muted">
                    <li><strong>De Pijp:</strong> Lively atmosphere, multicultural, close to VU - €650-€900/month</li>
                    <li><strong>Oost:</strong> Affordable, diverse, good transport links - €500-€700/month</li>
                    <li><strong>Noord:</strong> Creative hub, growing community, bike-friendly - €450-€650/month</li>
                    <li><strong>Science Park:</strong> Near UvA campus, modern student housing - €600-€800/month</li>
                    <li><strong>Westerpark:</strong> Green spaces, young professionals - €700-€950/month</li>
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Universities Section */}
        <Section className="bg-gray-50/50">
          <Container>
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-brand-text">
                  Amsterdam Universities
                </h2>
                <p className="text-lg text-brand-muted">
                  We work with all major universities in Amsterdam
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-brand-border/30 shadow-sm">
                  <h3 className="text-xl font-semibold text-brand-text mb-2">University of Amsterdam (UvA)</h3>
                  <p className="text-brand-muted mb-4">31,000+ students | Research university with broad programs</p>
                  <p className="text-sm text-brand-muted">Popular programs: Business, Psychology, Medicine, Law</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-brand-border/30 shadow-sm">
                  <h3 className="text-xl font-semibold text-brand-text mb-2">Vrije Universiteit Amsterdam (VU)</h3>
                  <p className="text-brand-muted mb-4">29,000+ students | Research-intensive with strong international focus</p>
                  <p className="text-sm text-brand-muted">Popular programs: Medicine, Business, Sciences, Humanities</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-brand-border/30 shadow-sm">
                  <h3 className="text-xl font-semibold text-brand-text mb-2">Amsterdam University of Applied Sciences (HvA)</h3>
                  <p className="text-brand-muted mb-4">46,000+ students | Practical, career-oriented education</p>
                  <p className="text-sm text-brand-muted">Popular programs: Business, Engineering, Sports, Media</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-brand-border/30 shadow-sm">
                  <h3 className="text-xl font-semibold text-brand-text mb-2">Other Institutions</h3>
                  <p className="text-brand-muted mb-4">Gerrit Rietveld Academie, Conservatorium van Amsterdam, Inholland</p>
                  <p className="text-sm text-brand-muted">Specialized programs in arts, music, and professional education</p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Why Choose Domu Match Section */}
        <Section>
          <Container>
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-brand-text">
                  Why Amsterdam Students Choose Domu Match
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Verified Students Only</h3>
                  <p className="text-brand-muted">All users verified with university email. Connect safely with fellow Amsterdam students.</p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Science-Backed Matching</h3>
                  <p className="text-brand-muted">40+ compatibility factors analyzed to find your perfect roommate match.</p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Free Forever</h3>
                  <p className="text-brand-muted">No hidden fees, no premium tiers. Completely free for all Amsterdam students.</p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* FAQ Section */}
        <Section className="bg-gray-50/50">
          <Container>
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-brand-text">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-brand-border/30">
                  <h3 className="text-lg font-semibold text-brand-text mb-2">
                    What is the average rent for student rooms in Amsterdam?
                  </h3>
                  <p className="text-brand-muted">
                    Student rooms in Amsterdam typically range from €450-€700 per month for a shared room, and €700-€1,200 for a private room. Prices vary by neighborhood, with areas like Centrum and Zuid being more expensive than Oost or Noord.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-brand-border/30">
                  <h3 className="text-lg font-semibold text-brand-text mb-2">
                    Which universities does Domu Match work with in Amsterdam?
                  </h3>
                  <p className="text-brand-muted">
                    Domu Match works with all major Amsterdam universities including University of Amsterdam (UvA), Vrije Universiteit Amsterdam (VU), Amsterdam University of Applied Sciences (HvA), Gerrit Rietveld Academie, and Conservatorium van Amsterdam.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-brand-border/30">
                  <h3 className="text-lg font-semibold text-brand-text mb-2">
                    What are the best neighborhoods for students in Amsterdam?
                  </h3>
                  <p className="text-brand-muted">
                    Popular student neighborhoods include De Pijp (lively, multicultural), Oost (affordable, diverse), Noord (creative, growing), Westerpark (young professionals), and areas near university campuses like Science Park and Uilenstede.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-brand-border/30">
                  <h3 className="text-lg font-semibold text-brand-text mb-2">
                    Is it hard to find student housing in Amsterdam?
                  </h3>
                  <p className="text-brand-muted">
                    Amsterdam has a competitive student housing market due to high demand. Starting your search early (3-6 months before moving) and using specialized platforms like Domu Match significantly improves your chances. Finding compatible roommates also opens up more housing options.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-brand-border/30">
                  <h3 className="text-lg font-semibold text-brand-text mb-2">
                    Can international students use Domu Match?
                  </h3>
                  <p className="text-brand-muted">
                    Yes! Domu Match is perfect for international students studying in Amsterdam. Our platform helps you connect with both Dutch and international students, making your transition to Amsterdam easier.
                  </p>
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
