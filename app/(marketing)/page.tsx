import { Navbar } from '@/components/site/navbar'
import { Hero } from '@/components/site/hero'
import { Counters } from '@/components/site/counters'
import { Matches } from '@/components/site/matches'
import { Features } from '@/components/site/features'
import { Testimonials } from '@/components/site/testimonials'
import { Universities } from '@/components/site/universities'
import { FinalCTA } from '@/components/site/final-cta'
import Footer from '@/components/site/footer'

export default function MarketingPage() {
  return (
    <main id="main-content">
      <Navbar />
      <Hero />
      <Counters />
      <Matches />
      <Features />
      <Testimonials />
      <Universities />
      <FinalCTA />
      <Footer />
    </main>
  )
}