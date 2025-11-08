import { VerifyInterface } from './components/verify-interface'
import { AppHeader } from '@/app/(components)/app-header'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function VerifyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check verification status
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, verification_status')
    .eq('user_id', user.id)
    .maybeSingle()

  // If already verified, redirect to onboarding (verification comes before onboarding now)
  if (profile && profile.verification_status === 'verified') {
    redirect('/onboarding/intro')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md transition-all duration-200"
      >
        Skip to main content
      </a>

      {/* Header */}
      <AppHeader user={{
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name,
        avatar: user.user_metadata?.avatar_url
      }} />

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 py-8">
        <VerifyInterface user={user} />
      </main>
    </div>
  )
}
