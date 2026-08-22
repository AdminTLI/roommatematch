import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/roles'

export default async function AdminAnswerDistributionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  const role = await getUserRole(user.id)
  if (role !== 'admin' && role !== 'super_admin' && role !== 'moderator' && role !== 'university_admin') {
    redirect('/dashboard')
  }

  redirect('/admin/metrics?tab=questionnaire')
}
