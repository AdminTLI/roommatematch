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
  let { data: academic } = await supabase
    .from('user_academic')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // If missing, try to derive from intro answers for display purposes
  if (!academic) {
    console.log('[Settings] No user_academic found, checking intro section...')
    const { data: intro } = await supabase
      .from('onboarding_sections')
      .select('answers')
      .eq('user_id', user.id)
      .eq('section', 'intro')
      .maybeSingle()
    
    console.log('[Settings] Intro section:', intro)
    
    if (intro?.answers) {
      let university_id: string | undefined
      let degree_level: string | undefined
      for (const a of intro.answers) {
        console.log('[Settings] Checking answer:', a)
        if (a.itemId === 'university_id') university_id = a.value
        if (a.itemId === 'degree_level') degree_level = a.value
      }
      
      console.log('[Settings] Extracted:', { university_id, degree_level })
      
      if (university_id || degree_level) {
        academic = {
          user_id: user.id,
          university_id: university_id || null,
          degree_level: degree_level || null,
          program_id: null,
          undecided_program: null,
          study_start_year: null,
          created_at: null,
          updated_at: null,
        } as any
        console.log('[Settings] Derived academic data:', academic)
      }
    }
  } else {
    console.log('[Settings] Found user_academic:', academic)
  }

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

  console.log('[Settings] All sections from database:', sections?.map(s => s.section))
  console.log('[Settings] Required sections:', requiredSections)
  console.log('[Settings] Completed required sections:', completedRequiredSections.map(s => s.section))
  
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
