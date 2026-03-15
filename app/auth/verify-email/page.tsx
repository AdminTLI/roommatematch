import { Suspense } from 'react'
import { Metadata } from 'next'
import { VerifyEmailForm } from '@/components/auth/verify-email-form'
import { Navbar } from '@/components/site/navbar'
import { MarketingLayoutFix } from '@/app/(marketing)/components/marketing-layout-fix'
import { MarketingPageBackground } from '@/app/(marketing)/components/marketing-page-background'

export const metadata: Metadata = {
  title: 'Verify Email | Domu Match',
  description: 'Verify your email address to complete your Domu Match account setup.',
}

export default function VerifyEmailPage() {
  return (
    <>
      <MarketingLayoutFix />
      <main
        id="main-content"
        className="relative pt-16 md:pt-20 overflow-hidden min-h-screen"
      >
        <MarketingPageBackground />

        <div className="relative z-10">
          <Navbar />
          <section className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <div className="mx-auto flex min-h-[40vh] items-center justify-center">
              <div className="w-full max-w-md">
                <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-white/70">Loading…</div>}>
                  <VerifyEmailForm />
                </Suspense>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
