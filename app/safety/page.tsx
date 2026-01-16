import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SafetyContent } from './components/safety-content'

export default async function SafetyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Fetch user's university to get security phone number
  let universitySecurityPhone: string | null = null
  let universityName: string | null = null

  try {
    // First try to get university_id from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('university_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let universityId = profile?.university_id

    // If not found in profiles, try user_academic table as fallback
    if (!universityId) {
      const { data: academic } = await supabase
        .from('user_academic')
        .select('university_id')
        .eq('user_id', user.id)
        .maybeSingle()
      
      universityId = academic?.university_id
    }

    if (universityId) {
      // Fetch university security phone
      const { data: university } = await supabase
        .from('universities')
        .select('security_phone, name')
        .eq('id', universityId)
        .maybeSingle()

      if (university) {
        universitySecurityPhone = university.security_phone || null
        universityName = university.name || null
      }
    }
  } catch (error) {
    console.error('Error fetching university security phone:', error)
    // Continue with null values - component will handle fallback
  }

  return (
    <AppShell user={{
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || 'User',
      avatar: user.user_metadata?.avatar_url
    }}>
      <SafetyContent 
        universitySecurityPhone={universitySecurityPhone}
        universityName={universityName}
      />
    </AppShell>
  )
}
