import { HostSafetyContent } from '@/components/host/host-safety-content'
import { createClient } from '@/lib/supabase/server'
import { getHostProfileForUser } from '@/lib/host/auth'
import { redirect } from 'next/navigation'

export default async function HostSafetyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const host = await getHostProfileForUser(user.id)
  if (!host) redirect('/host/onboarding')

  return <HostSafetyContent hostType={host.host_type} />
}
