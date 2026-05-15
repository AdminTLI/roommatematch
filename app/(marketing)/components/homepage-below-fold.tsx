'use client'

import dynamic from 'next/dynamic'

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

const SocialProof = dynamic(
  () => import('@/components/site/social-proof').then((m) => ({ default: m.SocialProof })),
  { loading: () => <SectionPlaceholder minHeight="20rem" /> }
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
      <StatusQuoSection />
      <LifestyleFeatures />
      <PlatformPreview />
      <SocialProof />
      <SocialFinalCTA />
      <Footer />
    </>
  )
}
