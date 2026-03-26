import { Suspense } from 'react'
import { Metadata } from 'next'
import { VerifyEmailForm } from '@/components/auth/verify-email-form'
import { AuthWrapperLight } from '@/app/auth/components/auth-wrapper-light'

export const metadata: Metadata = {
  title: 'Verify Email | Domu Match',
  description: 'Verify your email address to complete your Domu Match account setup.',
}

export default function VerifyEmailPage() {
  return (
    <AuthWrapperLight>
      <section className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="mx-auto flex min-h-[40vh] items-center justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 sm:p-8">
              <Suspense
                fallback={
                  <div className="min-h-[40vh] flex items-center justify-center text-slate-600">
                    Loading…
                  </div>
                }
              >
                <VerifyEmailForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </AuthWrapperLight>
  )
}
