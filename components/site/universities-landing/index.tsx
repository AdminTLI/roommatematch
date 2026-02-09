'use client'

import { HeroSection } from './hero-section'
import { ProblemSection } from './problem-section'
import { SolutionSection } from './solution-section'
import { PrivacyGdprSection } from './privacy-gdpr-section'
import { PilotIncentiveSection } from './pilot-incentive-section'
import { SavingsCalculatorSection } from './savings-calculator-section'
import { FAQSection } from './faq-section'
import { RequestDemoSection } from './request-demo-section'

export function UniversitiesLanding() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <SavingsCalculatorSection />
      <PrivacyGdprSection />
      <PilotIncentiveSection />
      <FAQSection />
      <RequestDemoSection />
    </>
  )
}
