import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsContent } from './components/settings-content'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // Force refresh the user session to get latest data
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  console.log('[Settings] User data:', {
    id: user?.id,
    email: user?.email,
    email_confirmed_at: user?.email_confirmed_at,
    userError
  })

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Fetch user profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Fetch academic data
  const { data: academic } = await supabase
    .from('user_academic')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Check questionnaire progress
  const { data: sections } = await supabase
    .from('onboarding_sections')
    .select('section, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const { data: submission } = await supabase
    .from('onboarding_submissions')
    .select('submitted_at')
    .eq('user_id', user.id)
    .maybeSingle()

  // Define the actual required sections (9 total, excluding 'intro')
  const requiredSections = [
    'location-commute',
    'personality-values',
    'sleep-circadian',
    'noise-sensory',
    'home-operations',
    'social-hosting-language',
    'communication-conflict',
    'privacy-territoriality',
    'reliability-logistics'
  ]

  // Count only the required sections that are completed
  const completedRequiredSections = sections?.filter(s => 
    requiredSections.includes(s.section)
  ) || []

  console.log('[Settings] Progress calculation:', {
    totalSections: sections?.length,
    requiredSections: requiredSections.length,
    completedRequired: completedRequiredSections.length,
    isSubmitted: !!submission,
    allSections: sections?.map(s => s.section)
  })

  const progressData = {
    completedSections: completedRequiredSections.map(s => s.section),
    totalSections: requiredSections.length, // Should be 9
    isFullySubmitted: !!submission,
    lastUpdated: sections?.[0]?.updated_at || null,
    submittedAt: submission?.submitted_at || null
  }

  return (
    <AppShell user={{
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || 'User',
      avatar: user.user_metadata?.avatar_url
    }}>
      <SettingsContent 
        user={user}
        profile={profile}
        academic={academic}
        progressData={progressData}
      />
    </AppShell>
  )
}
