import { ResetPasswordConfirmForm } from '@/components/auth/reset-password-confirm-form'
import { AuthWrapperLight } from '@/app/auth/components/auth-wrapper-light'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set New Password | Domu Match',
  description: 'Set a new password for your Domu Match account.',
}

export default function ResetPasswordConfirmPage() {
  return (
    <AuthWrapperLight>
      <section className="px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-12">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: brand/value prop (matches sign-in and reset-password tone) */}
          <div className="hidden lg:block">
            <p className="text-sm font-semibold tracking-wide text-slate-700">
              Domu Match
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              Set your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-violet-700">
                new password.
              </span>
            </h1>
            <p className="mt-4 text-lg text-slate-700 max-w-md">
              You&apos;re almost there. Enter a strong new password below to secure your account.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-slate-700">
              <li className="flex gap-2 items-baseline">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600/70" />
                <span><strong>8+ characters:</strong> Include uppercase, lowercase, and a number.</span>
              </li>
              <li className="flex gap-2 items-baseline">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-600/70" />
                <span><strong>Unique:</strong> Don&apos;t reuse passwords from other sites.</span>
              </li>
              <li className="flex gap-2 items-baseline">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-700/60" />
                <span><strong>Secure:</strong> Your new password will be encrypted and stored safely.</span>
              </li>
            </ul>
          </div>

          {/* Right: form */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 sm:p-8">
              <ResetPasswordConfirmForm />
            </div>
          </div>
        </div>
      </section>
    </AuthWrapperLight>
  )
}





