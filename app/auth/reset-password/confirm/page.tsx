import { ResetPasswordConfirmForm } from '@/components/auth/reset-password-confirm-form'
import { Navbar } from '@/components/site/navbar'
import { MarketingLayoutFix } from '@/app/(marketing)/components/marketing-layout-fix'
import { MarketingPageBackground } from '@/app/(marketing)/components/marketing-page-background'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set New Password | Domu Match',
  description: 'Set a new password for your Domu Match account.',
}

export default function ResetPasswordConfirmPage() {
  return (
    <>
      <MarketingLayoutFix />
      <main id="main-content" className="relative pt-16 md:pt-20 overflow-hidden min-h-screen">
        <MarketingPageBackground />

        <div className="relative z-10">
          <Navbar />

          <section className="px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-12">
            <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left: brand/value prop (matches sign-in and reset-password tone) */}
              <div className="hidden lg:block">
                <p className="text-sm font-semibold tracking-wide text-white/70">
                  Domu Match
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
                  Set your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    new password.
                  </span>
                </h1>
                <p className="mt-4 text-lg text-white/75 max-w-md">
                  You&apos;re almost there. Enter a strong new password below to secure your account.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-white/70">
                  <li className="flex gap-2 items-baseline">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-300/80" />
                    <span><strong>8+ characters:</strong> Include uppercase, lowercase, and a number.</span>
                  </li>
                  <li className="flex gap-2 items-baseline">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-300/80" />
                    <span><strong>Unique:</strong> Don&apos;t reuse passwords from other sites.</span>
                  </li>
                  <li className="flex gap-2 items-baseline">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-200/80" />
                    <span><strong>Secure:</strong> Your new password will be encrypted and stored safely.</span>
                  </li>
                </ul>
              </div>

              {/* Right: form */}
              <div className="mx-auto w-full max-w-md">
                <ResetPasswordConfirmForm />
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}





