'use client'

import dynamic from 'next/dynamic'
import { LazySection } from './lazy-section'

const StatusQuoSection = dynamic(
  () => import('@/components/site/status-quo-section').then((m) => ({ default: m.StatusQuoSection })),
  { loading: () => <SectionPlaceholder minHeight="28rem" /> }
)

const LifestyleFeatures = dynamic(
  () => import('@/components/site/lifestyle-features').then((m) => ({ default: m.LifestyleFeatures })),
  { loading: () => <SectionPlaceholder minHeight="24rem" /> }
)

const PlatformPreview = dynamic(
  () => import('@/components/site/platform-preview').then((m) => ({ default: m.PlatformPreview })),
  { loading: () => <SectionPlaceholder minHeight="32rem" /> }
)

const Partners = dynamic(
  () => import('@/components/site/partners').then((m) => ({ default: m.Partners })),
  { loading: () => <SectionPlaceholder minHeight="12rem" /> }
)

const SocialProof = dynamic(
  () => import('@/components/site/social-proof').then((m) => ({ default: m.SocialProof })),
  { loading: () => <SectionPlaceholder minHeight="20rem" /> }
)

const IdVerificationPrivacySection = dynamic(
  () =>
    import('@/components/site/id-verification-privacy-section').then((m) => ({
      default: m.IdVerificationPrivacySection,
    })),
  { loading: () => <SectionPlaceholder minHeight="24rem" /> }
)

const SocialFinalCTA = dynamic(
  () => import('@/components/site/social-final-cta').then((m) => ({ default: m.SocialFinalCTA })),
  { loading: () => <SectionPlaceholder minHeight="16rem" /> }
)

const Footer = dynamic(() => import('@/components/site/footer'), {
  loading: () => <SectionPlaceholder minHeight="12rem" />,
})

function SectionPlaceholder({ minHeight }: { minHeight: string }) {
  return (
    <div
      className="w-full animate-pulse rounded-3xl bg-white/40 mx-auto max-w-7xl my-8"
      style={{ minHeight }}
      aria-hidden
    />
  )
}

export function HomepageBelowFold() {
  return (
    <>
      <LazySection minHeight="28rem">
        <StatusQuoSection />
      </LazySection>
      <LazySection minHeight="24rem">
        <LifestyleFeatures />
      </LazySection>
      <LazySection minHeight="32rem">
        <PlatformPreview />
      </LazySection>
      <LazySection minHeight="24rem">
        <IdVerificationPrivacySection />
      </LazySection>
      <LazySection minHeight="12rem">
        <Partners />
      </LazySection>
      <LazySection minHeight="20rem">
        <SocialProof />
      </LazySection>
      <LazySection minHeight="16rem">
        <SocialFinalCTA />
      </LazySection>
      <LazySection minHeight="12rem">
        <Footer />
      </LazySection>
    </>
  )
}
