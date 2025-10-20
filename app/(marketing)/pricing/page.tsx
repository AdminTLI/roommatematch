import { Navbar } from '@/components/site/navbar'
import Footer from '@/components/site/footer'
import { PricingSection } from '@/components/site/pricing-section'
import { FAQ } from '@/components/site/faq'
import { FinalCTA } from '@/components/site/final-cta'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | Roommate Match - University Housing Solutions',
  description: 'Affordable pricing plans for universities. Reduce housing disputes by 40% with our intelligent roommate matching platform.',
  keywords: 'university housing, roommate matching, student accommodation, housing management, pricing',
  openGraph: {
    title: 'Pricing | Roommate Match',
    description: 'Affordable pricing plans for universities. Reduce housing disputes by 40% with our intelligent roommate matching platform.',
    type: 'website',
  },
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <PricingSection />
        <FAQ />
        <FinalCTA />
      </div>
      <Footer />
    </main>
  )
}
