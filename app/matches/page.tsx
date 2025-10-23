import { MatchesInterface } from './components/matches-interface'
import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo bypass - create a mock user for demo purposes
  const demoUser = user || {
    id: 'demo-user-id',
    email: 'demo@account.com',
    user_metadata: {
      full_name: 'Demo Student'
    }
  }

  if (!user) {
    // For demo purposes, we'll still show the matches page
    // In a real app, this would redirect to sign-in
    console.log('Demo mode: showing matches page without authentication')
  }

  // Skip profile checks for demo mode
  if (user) {
    // Check if user has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, verification_status')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      // No profile at all - they need to complete basic info
      redirect('/onboarding')
    }

    if (profile.verification_status !== 'verified') {
      redirect('/verify')
    }
  }

  return (
    <AppShell user={{
      id: demoUser.id,
      email: demoUser.email || '',
      name: demoUser.user_metadata?.full_name || 'Demo User',
      avatar: demoUser.user_metadata?.avatar_url
    }}>
      <MatchesInterface user={demoUser} />
    </AppShell>
  )
}
