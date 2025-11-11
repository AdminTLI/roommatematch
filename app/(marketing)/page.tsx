'use client'

import { Navbar } from '@/components/site/navbar'
import { Hero } from '@/components/site/hero'
import { Counters } from '@/components/site/counters'
import { Matches } from '@/components/site/matches'
import { Features } from '@/components/site/features'
import { Testimonials } from '@/components/site/testimonials'
import { Universities } from '@/components/site/universities'
import { FinalCTA } from '@/components/site/final-cta'
import Footer from '@/components/site/footer'
import { useApp } from '@/app/providers'
import { SocialProof } from './components/social-proof'
import { FinalCTA as MarketingFinalCTA } from './components/final-cta'

export default function MarketingPage() {
  const { locale } = useApp()
  
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-blue-50/20">
      <Navbar />
      <Hero />
      <Counters />
      <SocialProof locale={locale} />
      <Matches />
      <Features />
      <Testimonials />
      <Universities />
      <MarketingFinalCTA locale={locale} />
      <Footer />
    </main>
  )
}