import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SupportContent } from './components/support-content'
import { getUserProfile } from '@/lib/auth/user-profile'
import { checkUserVerificationStatus, getVerificationRedirectUrl } from '@/lib/auth/verification-check'

export default async function SupportPage() {
  const supabase = await createClient()
  
  // Force refresh the user session to get latest data
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check verification status
  const verificationStatus = await checkUserVerificationStatus(user)
  const redirectUrl = getVerificationRedirectUrl(verificationStatus)
  if (redirectUrl) {
    if (redirectUrl === '/auth/verify-email' && user.email) {
      redirect(`/auth/verify-email?email=${encodeURIComponent(user.email)}&auto=1`)
    } else {
      redirect(redirectUrl)
    }
  }

  // Get user profile
  const profile = await getUserProfile(user.id)
  if (!profile) {
    redirect('/onboarding/welcome')
  }

  return (
    <AppShell user={{
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      email_confirmed_at: profile.email_confirmed_at,
    }}>
      <SupportContent user={user} />
    </AppShell>
  )
}

