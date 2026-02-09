import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { Navbar } from '@/components/site/navbar'
import { MarketingLayoutFix } from '@/app/(marketing)/components/marketing-layout-fix'
import { MarketingPageBackground } from '@/app/(marketing)/components/marketing-page-background'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password | Domu Match',
  description: 'Reset your Domu Match account password.',
}

export default function ResetPasswordPage() {
  return (
    <>
      <MarketingLayoutFix />
      <main id="main-content" className="relative pt-16 md:pt-20 overflow-hidden min-h-screen">
        <MarketingPageBackground />

        <div className="relative z-10">
          <Navbar />

          <section className="px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-12">
            <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left: brand/value prop (matches sign-in tone) */}
              <div className="hidden lg:block">
                <p className="text-sm font-semibold tracking-wide text-white/70">
                  Domu Match
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
                  Reset{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    your password.
                  </span>
                </h1>
                <p className="mt-4 text-lg text-white/75 max-w-md">
                  Enter your email and we&apos;ll send you a secure link to create a new password. The link expires in 1 hour.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-white/70">
                  <li className="flex gap-2 items-baseline">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-300/80" />
                    <span><strong>Secure:</strong> One-time link sent only to your email.</span>
                  </li>
                  <li className="flex gap-2 items-baseline">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-300/80" />
                    <span><strong>Quick:</strong> Check your inbox and follow the link.</span>
                  </li>
                  <li className="flex gap-2 items-baseline">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-200/80" />
                    <span><strong>Need help?</strong> Head back to sign in anytime.</span>
                  </li>
                </ul>
              </div>

              {/* Right: form */}
              <div className="mx-auto w-full max-w-md">
                <ResetPasswordForm />
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
