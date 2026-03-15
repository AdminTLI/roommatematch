import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const service = createServiceClient()
  const { data: userRow } = await service
    .from('users')
    .select('user_type')
    .eq('id', user.id)
    .maybeSingle()
  const hasUserType = userRow?.user_type === 'student' || userRow?.user_type === 'professional'
  if (!hasUserType) redirect('/onboarding/path')

  if (userRow?.user_type === 'professional') {
    redirect('/onboarding-professional/welcome')
  }

  redirect('/onboarding/welcome')
}
