import { Suspense } from 'react'
import { AuthWrapperLight } from '@/app/auth/components/auth-wrapper-light'
import { SignUpSection } from './sign-up-section'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Domu Match',
  description: 'Create your Domu Match account to find compatible roommates. Join as a student or young professional.',
}

export default function SignUpPage() {
  return (
    <AuthWrapperLight>
      <Suspense
        fallback={
          <div className="min-h-[40vh] flex items-center justify-center text-slate-600">
            Loading…
          </div>
        }
      >
        <SignUpSection />
      </Suspense>
    </AuthWrapperLight>
  )
}
