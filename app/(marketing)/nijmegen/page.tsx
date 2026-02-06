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
  title: 'Find Your Perfect Roommate in Nijmegen | Domu Match',
  description: 'Find compatible roommates in Nijmegen with Domu Match. Connect with verified students from Radboud University, HAN. Green student city.',
  keywords: ['find roommate Nijmegen', 'Radboud roommate', 'student housing Nijmegen', 'HAN roommate'],
  openGraph: { title: 'Find Your Perfect Roommate in Nijmegen | Domu Match', url: 'https://domumatch.com/nijmegen', images: [{ url: 'https://domumatch.com/images/logo.png' }] },
  alternates: { canonical: 'https://domumatch.com/nijmegen' },
}

export default function NijmegenPage() {
  return (
    <main className="min-h-screen bg-white pt-16 md:pt-20">
      <Navbar />
      <Section className="bg-gradient-to-b from-brand-primary/5 to-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-text">
              Find Your Perfect Roommate in <span className="text-brand-primary">Nijmegen</span>
            </h1>
            <p className="text-xl text-brand-muted">Connect with verified students from Radboud University and HAN. Experience the Netherlands' oldest city with a young vibe.</p>
            <Link href="/auth/sign-up"><Button size="lg" className="bg-brand-primary hover:bg-brand-primaryHover text-white px-8">Get Started Free</Button></Link>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Student Housing in Nijmegen</h2>
            <p className="text-lg text-brand-muted">Nijmegen is known as one of Europe's greenest cities with excellent student life. Average rent: €350-€600/month. Close to German border. Popular areas: Dukenburg, city center, and Heijendaal campus.</p>
          </div>
        </Container>
      </Section>
      <FinalCTA />
      <Footer />
    </main>
  )
}
