import { SignInForm } from '@/components/auth/sign-in-form'
import { Navbar } from '@/components/site/navbar'
import { MarketingLayoutFix } from '@/app/(marketing)/components/marketing-layout-fix'
import { MarketingPageBackground } from '@/app/(marketing)/components/marketing-page-background'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Domu Match',
  description: 'Sign in to your Domu Match account to find compatible roommates.',
}

export default function SignInPage() {
  return (
    <>
      {/* Match homepage layout/background behavior exactly */}
      <MarketingLayoutFix />
      <main id="main-content" className="relative pt-16 md:pt-20 overflow-hidden min-h-screen">
        <MarketingPageBackground />

        <div className="relative z-10">
          <Navbar />

          <section className="px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-12">
            <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left: brand/value prop (homepage tone) */}
              <div className="hidden lg:block">
                <p className="text-sm font-semibold tracking-wide text-white/70">
                  Domu Match
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
                  Find{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    your people.
                  </span>
                </h1>
                <p className="mt-4 text-lg text-white/75 max-w-md">
                  Pick up right where you left off. Your future roommates (and potential friends) are waiting.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-white/70">
                  <li className="flex gap-2 items-baseline">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-300/80" />
                    <span><strong>Real Humans:</strong> A 100% verified student community.</span>
                  </li>
                  <li className="flex gap-2 items-baseline">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-300/80" />
                    <span><strong>Deeper Connections:</strong> Find people who truly &quot;get&quot; your routine.</span>
                  </li>
                  <li className="flex gap-2 items-baseline">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-200/80" />
                    <span><strong>Seamless Chat:</strong> Coordinate viewings and meetups instantly.</span>
                  </li>
                </ul>
              </div>

              {/* Right: form */}
              <div className="mx-auto w-full max-w-md">
                <SignInForm />
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}