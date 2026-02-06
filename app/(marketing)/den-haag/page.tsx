import { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { FinalCTA } from '@/components/site/final-cta'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Find Your Perfect Roommate in The Hague | Domu Match',
  description: 'Find compatible roommates in The Hague (Den Haag) with Domu Match. Connect with verified students from Leiden University The Hague, The Hague University, and more.',
  keywords: [
    'find roommate Den Haag',
    'roommate finder The Hague',
    'student housing Den Haag',
    'The Hague student rooms',
    'Leiden University The Hague',
    'Den Haag accommodation',
  ],
  openGraph: {
    title: 'Find Your Perfect Roommate in The Hague | Domu Match',
    description: 'Find compatible roommates in The Hague with science-backed matching.',
    type: 'website',
    url: 'https://domumatch.com/den-haag',
    siteName: 'Domu Match',
    images: [{ url: 'https://domumatch.com/images/logo.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://domumatch.com/den-haag' },
}

export default function DenHaagPage() {
  return (
    <main className="min-h-screen bg-white pt-16 md:pt-20">
      <Navbar />
      <Section className="bg-gradient-to-b from-brand-primary/5 to-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-text">
              Find Your Perfect Roommate in <span className="text-brand-primary">The Hague</span>
            </h1>
            <p className="text-xl text-brand-muted">Connect with verified students from The Hague University, Leiden University The Hague, and other institutions.</p>
            <Link href="/auth/sign-up"><Button size="lg" className="bg-brand-primary hover:bg-brand-primaryHover text-white px-8">Get Started Free</Button></Link>
            <div className="flex gap-6 justify-center pt-6 text-sm text-brand-muted">
              <div className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-500" /><span>Free for students</span></div>
            </div>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Student Housing in The Hague</h2>
            <p className="text-lg text-brand-muted">The Hague offers international atmosphere and seaside access. Average rent: €400-€650/month. Popular areas: Statenkwartier, Zeeheldenkwartier, and Scheveningen.</p>
          </div>
        </Container>
      </Section>
      <FinalCTA />
      <Footer />
    </main>
  )
}
