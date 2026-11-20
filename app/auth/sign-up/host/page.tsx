import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { AuthWrapperLight } from '@/app/auth/components/auth-wrapper-light'
import { SignUpSection } from '../sign-up-section'
import { Metadata } from 'next'
import { getPlatformSettings } from '@/lib/platform-settings'

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getPlatformSettings()
  return {
    title: `Host Sign Up | ${siteName}`,
    description: `Create a ${siteName} host account to list student housing as a private landlord or agency.`,
  }
}

export default async function HostSignUpPage() {
  const { registrationEnabled } = await getPlatformSettings()
  if (!registrationEnabled) {
    redirect('/auth/sign-in?reason=registration_disabled&redirect=/host/onboarding')
  }

  return (
    <AuthWrapperLight footer>
      <Suspense
        fallback={
          <div className="min-h-[40vh] flex items-center justify-center text-slate-600">
            Loading…
          </div>
        }
      >
        <SignUpSection variant="host" />
      </Suspense>
    </AuthWrapperLight>
  )
}
