import { SignInForm } from '@/components/auth/sign-in-form'
import { AuthWrapperLight } from '@/app/auth/components/auth-wrapper-light'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Domu Match',
  description: 'Sign in to your Domu Match account to find compatible roommates.',
}

export default function SignInPage() {
  return (
    <AuthWrapperLight>
      <section className="px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-12">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: brand/value prop (homepage tone) */}
          <div className="hidden lg:block">
            <p className="text-sm font-semibold tracking-wide text-slate-700">
              Domu Match
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              Find{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-violet-700">
                your roommate.
              </span>
            </h1>
            <p className="mt-4 text-lg text-slate-700 max-w-md">
              Pick up right where you left off. Your future roommates (and potential friends) are waiting.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-slate-700">
              <li className="flex gap-2 items-baseline">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600/70" />
                <span><strong>Real Humans:</strong> A 100% verified student community.</span>
              </li>
              <li className="flex gap-2 items-baseline">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-600/70" />
                <span><strong>Deeper Connections:</strong> Find people who truly &quot;get&quot; your routine.</span>
              </li>
              <li className="flex gap-2 items-baseline">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-700/60" />
                <span><strong>Seamless Chat:</strong> Coordinate viewings and meetups instantly.</span>
              </li>
            </ul>
          </div>

          {/* Right: form */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 sm:p-8">
              <SignInForm />
            </div>
          </div>
        </div>
      </section>
    </AuthWrapperLight>
  )
}