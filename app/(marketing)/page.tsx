'use client'

import { Navbar } from '@/components/site/navbar'
import { Hero } from '@/components/site/hero'
import { Matches } from '@/components/site/matches'
import { Features } from '@/components/site/features'
import { Testimonials } from '@/components/site/testimonials'
import { Universities } from '@/components/site/universities'
import Footer from '@/components/site/footer'
import { useApp } from '@/app/providers'
import { SocialProof } from './components/social-proof'
import { FinalCTA as MarketingFinalCTA } from './components/final-cta'

export default function MarketingPage() {
  const { locale } = useApp()
  
  return (
    <main id="main-content" className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <SocialProof locale={locale} />
      <Universities />
      <Matches />
      <Features />
      <Testimonials />
      <MarketingFinalCTA locale={locale} />
      <Footer />
    </main>
  )
}