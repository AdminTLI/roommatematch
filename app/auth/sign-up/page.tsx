import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { AuthWrapperLight } from '@/app/auth/components/auth-wrapper-light'
import { SignUpSection } from './sign-up-section'
import { Metadata } from 'next'
import { getPlatformSettings } from '@/lib/platform-settings'

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getPlatformSettings()
  return {
    title: `Sign Up | ${siteName}`,
    description: `Create your ${siteName} account to find compatible roommates. Join as a student or young professional.`,
  }
}

export default async function SignUpPage() {
  const { registrationEnabled } = await getPlatformSettings()
  if (!registrationEnabled) {
    redirect('/auth/sign-in?reason=registration_disabled')
  }

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
