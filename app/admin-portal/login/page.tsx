import type { Metadata } from 'next'
import { AdminLoginForm } from '@/app/admin/components/admin-login-form'
import { AuthWrapperLight } from '@/app/auth/components/auth-wrapper-light'

export const metadata: Metadata = {
  title: 'Admin Login | Domu Match',
  description: 'Secure Domu Match portal for university and platform administrators.',
}

export default function AdminPortalLoginPage() {
  return (
    <AuthWrapperLight>
      <section className="px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-12">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: brand/value prop (matches student sign-in tone) */}
          <div className="hidden lg:block">
            <p className="text-sm font-semibold tracking-wide text-slate-700">
              Domu Match
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              Admin &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-violet-700">
                university portal.
              </span>
            </h1>
            <p className="mt-4 text-lg text-slate-700 max-w-md">
              Secure access for university housing teams and platform administrators.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-slate-700">
              <li className="flex gap-2 items-baseline">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600/70" />
                <span>
                  <strong>Verified access:</strong> Sign in with your work email and password.
                </span>
              </li>
              <li className="flex gap-2 items-baseline">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-600/70" />
                <span>
                  <strong>University insights:</strong> Aggregated wellbeing and housing data.
                </span>
              </li>
              <li className="flex gap-2 items-baseline">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-700/60" />
                <span>
                  <strong>Need help?</strong> Contact your Domu Match representative.
                </span>
              </li>
            </ul>
          </div>

          {/* Right: form */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 sm:p-8">
              <AdminLoginForm />
            </div>
          </div>
        </div>
      </section>
    </AuthWrapperLight>
  )
}
