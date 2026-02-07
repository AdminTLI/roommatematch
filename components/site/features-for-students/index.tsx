'use client'

import { HeroSection } from './hero-section'
import { WhySection } from './why-section'
import { SolutionSection } from './solution-section'
import { TrustSection } from './trust-section'
import { ComparisonTableSection } from './comparison-table-section'
import { InvestmentSection } from './investment-section'
import { FAQSection } from './faq-section'
import { StickyCTA } from './sticky-cta'

export function FeaturesForStudents() {
  return (
    <>
      <HeroSection />
      <WhySection />
      <SolutionSection />
      <TrustSection />
      <ComparisonTableSection />
      <InvestmentSection />
      <FAQSection />
      <StickyCTA />
    </>
  )
}
