import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/auth/roles'
import { AnswerDistributionClient } from './AnswerDistributionClient'

export default async function AdminAnswerDistributionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  const role = await getUserRole(user.id)
  if (role !== 'admin') redirect('/dashboard')

  return <AnswerDistributionClient />
}
