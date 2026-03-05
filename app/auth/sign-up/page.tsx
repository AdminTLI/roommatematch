import { Suspense } from 'react'
import { Navbar } from '@/components/site/navbar'
import { MarketingLayoutFix } from '@/app/(marketing)/components/marketing-layout-fix'
import { MarketingPageBackground } from '@/app/(marketing)/components/marketing-page-background'
import { SignUpSection } from './sign-up-section'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Domu Match',
  description: 'Create your Domu Match account to find compatible roommates. Join as a student or young professional.',
}

export default function SignUpPage() {
  return (
    <>
      <MarketingLayoutFix />
      <main id="main-content" className="relative pt-16 md:pt-20 overflow-hidden min-h-screen">
        <MarketingPageBackground />

        <div className="relative z-10">
          <Navbar />
          <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-white/60">Loading…</div>}>
            <SignUpSection />
          </Suspense>
        </div>
      </main>
    </>
  )
}
