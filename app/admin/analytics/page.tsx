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
  if (role !== 'super_admin') {
    redirect('/admin/metrics')
  }

  redirect('/admin/metrics?tab=questionnaire')
}
