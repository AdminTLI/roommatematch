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
  title: 'Find Your Perfect Roommate in Leiden | Domu Match',
  description: 'Find compatible roommates in Leiden with Domu Match. Connect with verified students from Leiden University. Historic university city housing.',
  keywords: ['find roommate Leiden', 'Leiden University roommate', 'student housing Leiden', 'Leiden accommodation'],
  openGraph: { title: 'Find Your Perfect Roommate in Leiden | Domu Match', url: 'https://domumatch.com/leiden', images: [{ url: 'https://domumatch.com/images/logo.png' }] },
  alternates: { canonical: 'https://domumatch.com/leiden' },
}

export default function LeidenPage() {
  return (
    <main className="min-h-screen bg-white pt-16 md:pt-20">
      <Navbar />
      <Section className="bg-gradient-to-b from-brand-primary/5 to-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-text">
              Find Your Perfect Roommate in <span className="text-brand-primary">Leiden</span>
            </h1>
            <p className="text-xl text-brand-muted">Connect with verified students from Leiden University. Experience living in the Netherlands' oldest university city.</p>
            <Link href="/auth/sign-up"><Button size="lg" className="bg-brand-primary hover:bg-brand-primaryHover text-white px-8">Get Started Free</Button></Link>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Student Housing in Leiden</h2>
            <p className="text-lg text-brand-muted">Leiden combines historic charm with academic excellence. Average rent: €400-€650/month. Compact city with good cycling infrastructure. Popular areas: city center, Leiden-Noord, and areas near Bio Science Park.</p>
          </div>
        </Container>
      </Section>
      <FinalCTA />
      <Footer />
    </main>
  )
}
