import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from './components/dashboard-content'

export default async function DashboardPage() {
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
    // For demo purposes, we'll still show the dashboard page
    // In a real app, this would redirect to sign-in
    console.log('Demo mode: showing dashboard page without authentication')
  }

  // Check questionnaire completion status to pass to dashboard content
  let hasCompletedQuestionnaire = false

  if (!user || user.id === 'demo-user-id') {
    // Demo user: check localStorage (will be checked client-side in AppShell)
    hasCompletedQuestionnaire = false // Let AppShell handle it
  } else {
    // Real user: check database
    const { data: submission } = await supabase
      .from('onboarding_submissions')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    hasCompletedQuestionnaire = !!submission
  }

  return (
    <AppShell user={{
      id: demoUser.id,
      email: demoUser.email || '',
      name: demoUser.user_metadata?.full_name || 'Demo User',
      avatar: demoUser.user_metadata?.avatar_url
    }}>
      <DashboardContent hasCompletedQuestionnaire={hasCompletedQuestionnaire} />
    </AppShell>
  )
}