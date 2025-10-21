import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SafetyContent } from './components/safety-content'

export default async function SafetyPage() {
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
    // For demo purposes, we'll still show the safety page
    // In a real app, this would redirect to sign-in
    console.log('Demo mode: showing safety page without authentication')
  }

  return (
    <AppShell user={{
      id: demoUser.id,
      email: demoUser.email || '',
      name: demoUser.user_metadata?.full_name || 'Demo User',
      avatar: demoUser.user_metadata?.avatar_url
    }}>
      <SafetyContent />
    </AppShell>
  )
}